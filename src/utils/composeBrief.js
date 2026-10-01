// The composed brief on the client: build the material from the setup draft,
// ask compose-brief once per set of answers, keep the result in the draft.
//
// Lifecycle of `setup.briefDoc`:
//   - written here when the edge function answers (sourceHash = the answers
//     it was written from, edited = false);
//   - the review page lets the creator edit the text in place and flips
//     edited = true;
//   - buildContestRow copies it into contests.brief_doc at launch;
//   - after launch it is read back from the row, never regenerated.
//
// When the answers change after a brief exists (browser-back into the chat):
// an unedited brief is rewritten from the new answers; an edited one is kept,
// since the creator's own words win and nothing is overwritten silently.

import { supabase } from '../lib/supabaseClient';
import { readSetup, writeSetup, getQuestionsFor } from './v4Brief';
import { BRIEF_QUESTIONS } from '../data/v4/briefQuestions';
import { buildBriefSource, briefSourceHash } from '../data/v4/briefRoles';

export function buildSourceFromSetup(setup = readSetup()) {
  const subId = setup.subSegmentId;
  if (!subId) return null;
  const questions = getQuestionsFor(subId, null);
  return buildBriefSource({
    subId,
    segmentLabel: setup.subSegmentTitle || BRIEF_QUESTIONS[subId]?.label || subId,
    questions,
    answers: setup.brief || {},
    settings: setup.settings || {},
    workingName: setup.workingName || '',
    hostName: (setup.userName || '').trim(),
    hostAnonymous: !!setup.userAnonymous,
  });
}

// The doc to show for the current answers, or null when one has to be
// written (or the answers changed under an unedited one).
export function currentBriefDoc(setup = readSetup()) {
  const doc = setup.briefDoc;
  if (!doc) return null;
  if (doc.edited) return doc;
  const source = buildSourceFromSetup(setup);
  return source && briefSourceHash(source) === doc.sourceHash ? doc : null;
}

export function saveBriefDoc(doc) {
  writeSetup({ briefDoc: doc });
  return doc;
}

export function clearBriefDoc() {
  const cur = readSetup();
  if (cur.briefDoc) writeSetup({ briefDoc: null });
}

// Ask the edge function. Resolves to the doc, or throws; callers show the
// Q&A fallback on a throw. Never called for participants.
export async function composeBriefDoc() {
  const setup = readSetup();
  const source = buildSourceFromSetup(setup);
  if (!source || source.items.length === 0) throw new Error('Nothing to write from yet.');
  const { data, error } = await supabase.functions.invoke('compose-brief', { body: { source } });
  if (error) throw new Error(error.message || 'Could not write the brief.');
  if (!data?.doc) throw new Error(data?.error || 'Could not write the brief.');
  if (data.warnings?.length) console.warn('[brief] unverified names in the composed brief:', data.warnings);
  return saveBriefDoc({ ...data.doc, sourceHash: briefSourceHash(source), edited: false });
}

// The doc in its current shape: { about, shouldDo[{label,text}], directions,
// constraints[] }. Docs written by the first version of compose-brief carried
// explore / avoid / watchouts lists instead of the directions paragraph;
// those are folded into one paragraph here so they still read.
export function normalizeBriefDoc(doc) {
  if (!doc) return null;
  const str = (v) => (typeof v === 'string' ? v : '');
  const open = (l) => !l?.length || (l.length === 1 && /^open$/i.test(l[0]));
  let directions = str(doc.directions);
  if (!directions && (doc.explore || doc.avoid || doc.watchouts)) {
    const parts = [];
    if (open(doc.explore) && open(doc.avoid)) {
      parts.push('Nothing is ruled in or out, so explore freely within the brief above.');
    } else {
      if (!open(doc.explore)) parts.push(`Lean toward ${doc.explore.join(', ')}.`);
      if (!open(doc.avoid)) parts.push(`Steer clear of ${doc.avoid.join(', ')}.`);
    }
    (doc.watchouts || []).forEach((w) => { if (w?.note) parts.push(w.note); else if (w?.name) parts.push(w.name); });
    directions = parts.join(' ');
  }
  return {
    ...doc,
    about: str(doc.about),
    shouldDo: Array.isArray(doc.shouldDo) ? doc.shouldDo.map((b) => ({ label: str(b?.label), text: str(b?.text) })) : [],
    directions,
    constraints: Array.isArray(doc.constraints) ? doc.constraints.map(str) : [],
  };
}

// The doc without blank lines (a line added on the review page and never
// filled in). Used at launch, so what is saved is exactly what reads.
export function cleanBriefDoc(doc) {
  const d = normalizeBriefDoc(doc);
  if (!d) return d;
  const t = (v) => (typeof v === 'string' ? v.trim() : '');
  const { explore, avoid, watchouts, ...rest } = d;
  void explore; void avoid; void watchouts;
  return {
    ...rest,
    about: t(d.about),
    shouldDo: d.shouldDo.map((b) => ({ label: t(b.label), text: t(b.text) })).filter((b) => b.label || b.text),
    directions: t(d.directions),
    constraints: d.constraints.map(t).filter(Boolean),
  };
}

// True when the doc has anything worth rendering. A doc of empty arrays and
// an empty paragraph (the model given almost nothing) falls back to the Q&A.
export function briefDocHasContent(doc) {
  if (!doc) return false;
  const d = cleanBriefDoc(doc);
  return !!(d.about || d.shouldDo.length || d.directions || d.constraints.length);
}
