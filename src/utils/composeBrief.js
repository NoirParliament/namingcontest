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

// True when the doc has anything worth rendering. A doc of empty arrays and
// an empty paragraph (the model given almost nothing) falls back to the Q&A.
export function briefDocHasContent(doc) {
  if (!doc) return false;
  return !!(doc.about || doc.shouldDo?.length || doc.explore?.length || doc.avoid?.length
    || doc.watchouts?.length || doc.constraints?.length);
}
