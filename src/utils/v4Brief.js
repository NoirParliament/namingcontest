// V4 brief flow helpers — read setup state, resolve the question list
// for a given sub-segment by applying CUT_QUESTIONS, MERGE_QUESTIONS,
// and showWhen filters from the brief data file.

import {
  BRIEF_QUESTIONS,
  CUT_QUESTIONS,
  MERGE_QUESTIONS,
  ARTICLES,
  FALLBACK_QUESTIONS,
} from '../data/v4/briefQuestions';

const SETUP_KEY = 'v4_contest_setup';

export function readSetup() {
  try {
    const raw = localStorage.getItem(SETUP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function writeSetup(patch) {
  const current = readSetup();
  const next = { ...current, ...patch };
  try {
    localStorage.setItem(SETUP_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable
  }
  return next;
}

export function patchBriefAnswer(questionId, value) {
  const current = readSetup();
  const brief = { ...(current.brief || {}), [questionId]: value };
  return writeSetup({ brief });
}

// Resolve the ordered question list for a given V4 sub-segment ID.
// - Drops questions in CUT_QUESTIONS[subId]
// - Drops questions that were merged into others (MERGE_QUESTIONS[subId][n].merged)
// - Overrides prompts for the "keep" questions of any merge
// - Filters showWhen rules (only the legacy 'rebrand' branch matters today —
//   b4 has its own question list, so this is effectively dead code, but kept
//   for future flexibility)
export function getQuestionsFor(subId, legacySubSegmentSlug) {
  const segment = BRIEF_QUESTIONS[subId];
  if (!segment) {
    return FALLBACK_QUESTIONS?.questions || [];
  }

  const cuts = new Set(CUT_QUESTIONS[subId] || []);
  const merges = MERGE_QUESTIONS[subId] || [];

  // Build merge metadata
  const mergedPrompts = {};
  const mergedIntoOthers = new Set();
  merges.forEach((m) => {
    if (m.newPrompt) mergedPrompts[m.keepId] = m.newPrompt;
    (m.merged || []).forEach((id) => mergedIntoOthers.add(id));
  });

  return segment.questions
    .filter((q) => !cuts.has(q.id))
    .filter((q) => !mergedIntoOthers.has(q.id))
    .filter((q) => {
      if (!q.showWhen) return true;
      if (q.showWhen.subSegment && q.showWhen.subSegment !== legacySubSegmentSlug) {
        return false;
      }
      return true;
    })
    .map((q) =>
      mergedPrompts[q.id] ? { ...q, prompt: mergedPrompts[q.id] } : q
    );
}

// Resolve the article (if any) referenced by a question's guideId.
export function getArticleFor(subId, guideId) {
  if (!guideId) return null;
  const list = ARTICLES[subId] || [];
  return list.find((a) => a.id === guideId) || null;
}

export function getSegmentLabel(subId) {
  return BRIEF_QUESTIONS[subId]?.label || '';
}
