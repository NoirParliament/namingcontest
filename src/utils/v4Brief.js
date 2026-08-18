// V4 brief flow helpers — read setup state, resolve the question list
// for a given sub-segment by applying CUT_QUESTIONS, MERGE_QUESTIONS,
// and showWhen filters from the brief data file.

import {
  BRIEF_QUESTIONS,
  CUT_QUESTIONS,
  MERGE_QUESTIONS,
  ARTICLES,
  FALLBACK_QUESTIONS,
  SHARED_SETTINGS_QUESTIONS,
  BRIEF_CLOSING_QUESTIONS,
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

  const resolved = segment.questions
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

  // customRequirements ("Anything else…") closes every brief — appended here
  // so it's the last brief question for all segments (moved out of settings
  // 2026-08-17; see BRIEF_CLOSING_QUESTIONS).
  return [...resolved, ...BRIEF_CLOSING_QUESTIONS];
}

// Total number of setup steps the creator moves through, so the progress
// counter runs 1…N and the review screen is the final step N. Mirrors the
// BriefChat step list: segment pick + working name + voter tier + brief
// questions + settings questions, plus the tier pick (prior screen) and the
// review screen itself.
export function getSetupStepTotal(subId) {
  const brief = getQuestionsFor(subId, null).length;
  const settings = SHARED_SETTINGS_QUESTIONS.length;
  // +1 for INTRO_QUESTION: the chat's closing "short hello to your
  // participants", appended after settings in BriefChat (it isn't part of
  // getQuestionsFor — the review page renders it as its own card, not a row).
  return 3 + brief + settings + 1 /* intro */ + 1 /* tier pick */ + 1 /* review */;
}

// Human label for a contest window duration. Windows are stored as DAY
// counts; hour presets store fractions (0.125 = 3h, 0.25 = 6h, 0.5 = 12h),
// which keeps the whole backend contract untouched — confirm-launch just
// multiplies by a day in ms, and the phase cron flips on timestamps.
export function formatWindowDuration(days) {
  const n = Number(days);
  if (!Number.isFinite(n) || n <= 0) return String(days ?? '');
  if (n < 1) {
    const h = Math.round(n * 24);
    return h === 1 ? '1 hour' : `${h} hours`;
  }
  return n === 1 ? '1 day' : `${n} days`;
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

// Short descriptor of what a contest is actually naming — for the review /
// manage subtitle. Most categories are specific enough on their own. p3 is
// a grab-bag ("Home, WiFi network, boat, and more"), so there we surface the
// creator's "What are you naming?" answer (e.g. "WiFi network") instead of
// the whole category, falling back to the label if it's not answered yet.
export function getContestDescriptor(setup) {
  const subId = setup?.subSegmentId;
  if (subId === 'p3' && setup?.brief?.namingTarget) {
    return setup.brief.namingTarget;
  }
  return getSegmentLabel(subId);
}
