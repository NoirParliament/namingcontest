// The composed brief on the client: build the material from the setup draft,
// ask compose-brief, keep the result in the draft.
//
// The answers are the source; the brief is written from them.
//   - The first brief is written at the chat hand-off (free).
//   - The review page lets the creator reword the text in place
//     (edited = true) and change any answer or fill in a skipped one.
//   - When the answers no longer match what the brief was written from,
//     the review page offers "Update the brief": a rewrite from the current
//     answers, at most MAX_REWRITES times per contest. Nothing rewrites
//     on its own.
//   - buildContestRow copies the brief as shown into contests.brief_doc at
//     launch; after launch it is read back from the row, never rewritten.

import { supabase } from '../lib/supabaseClient';
import { readSetup, writeSetup, getQuestionsFor } from './v4Brief';
import { BRIEF_QUESTIONS } from '../data/v4/briefQuestions';
import { buildBriefSource, briefSourceHash } from '../data/v4/briefRoles';

export const MAX_REWRITES = 3;

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

// The brief for this draft, or null when none has been written yet. A brief
// written for another category (the draft was reused for a new contest) is
// never shown.
export function currentBriefDoc(setup = readSetup()) {
  const doc = setup.briefDoc;
  if (!doc) return null;
  if (doc.subId && doc.subId !== setup.subSegmentId) return null;
  return doc;
}

export function saveBriefDoc(doc) {
  writeSetup({ briefDoc: doc });
  return doc;
}

// Forget the brief and its rewrite count (new category, new contest).
export const RESET_BRIEF_PATCH = { briefDoc: null, briefRewrites: 0 };

// Answer per question id, as the brief writer saw it.
function answerMap(source) {
  const out = {};
  (source?.items || []).forEach((it) => { out[it.id] = it.answer; });
  return out;
}

// What changed in the answers since the brief was written: ids whose answer
// is new, different or now empty. Empty list = the brief is up to date.
export function briefChanges(setup = readSetup()) {
  const doc = currentBriefDoc(setup);
  const source = buildSourceFromSetup(setup);
  if (!doc || !source) return [];
  if (!doc.sourceAnswers) {
    // Written before answers were snapshotted: all we can say is whether
    // anything differs.
    return doc.sourceHash && doc.sourceHash !== briefSourceHash(source) ? ['*'] : [];
  }
  const now = answerMap(source);
  const then = doc.sourceAnswers;
  const ids = new Set([...Object.keys(now), ...Object.keys(then)]);
  return [...ids].filter((id) => (now[id] || '') !== (then[id] || ''));
}

export function rewritesLeft(setup = readSetup()) {
  return Math.max(0, MAX_REWRITES - (setup.briefRewrites || 0));
}

// Ask the edge function. Resolves to the doc, or throws; the caller keeps
// whatever was on screen before. A rewrite counts against MAX_REWRITES only
// when it succeeds. Never called for participants.
export async function composeBriefDoc({ rewrite = false } = {}) {
  const setup = readSetup();
  if (rewrite && rewritesLeft(setup) <= 0) throw new Error('No rewrites left.');
  const source = buildSourceFromSetup(setup);
  if (!source || source.items.length === 0) throw new Error('Nothing to write from yet.');
  const { data, error } = await supabase.functions.invoke('compose-brief', { body: { source } });
  if (error) throw new Error(error.message || 'Could not write the brief.');
  if (!data?.doc) throw new Error(data?.error || 'Could not write the brief.');
  if (data.warnings?.length) console.warn('[brief] unverified names in the composed brief:', data.warnings);
  const doc = {
    ...data.doc,
    subId: source.subId,
    sourceHash: briefSourceHash(source),
    sourceAnswers: answerMap(source),
    edited: false,
  };
  writeSetup({
    briefDoc: doc,
    ...(rewrite ? { briefRewrites: (readSetup().briefRewrites || 0) + 1 } : {}),
  });
  return doc;
}

// The doc in its current shape: { about, shouldDo[{label,text}], directions,
// constraints[{label,text}] }. Docs written by the first version of compose-brief carried
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
    // Requirements are { label, text } since 2026-10-01; earlier docs carried
    // plain sentences, which become a text with no label.
    constraints: Array.isArray(doc.constraints)
      ? doc.constraints.map((c) => (typeof c === 'string' ? { label: '', text: c } : { label: str(c?.label), text: str(c?.text) }))
      : [],
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
    constraints: d.constraints.map((c) => ({ label: t(c.label), text: t(c.text) })).filter((c) => c.label || c.text),
  };
}

// True when the doc has anything worth rendering. A doc of empty arrays and
// an empty paragraph (the model given almost nothing) falls back to the Q&A.
export function briefDocHasContent(doc) {
  if (!doc) return false;
  const d = cleanBriefDoc(doc);
  return !!(d.about || d.shouldDo.length || d.directions || d.constraints.length);
}
