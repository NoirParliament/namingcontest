// V4 draft discovery — surfaces the one pending, unfinished draft a browser
// is holding so a "pick up where you left off" affordance can find it.
//
// There are two kinds of draft, both browser-local (never in the database
// until the user commits — launch for a creator, Send for a participant):
//   • creator brief  — the v4_contest_setup blob, a SINGLE slot. Starting a
//                       new contest (PickTier) resets it, so there is only
//                       ever one creator draft; launching clears it.
//   • participant    — v4_pchat_drafts_<contestId>, one per invited contest.
//                       Cleared on Send. We surface the most-recently-touched
//                       one (the "last you were filling").
//
// getPendingDraft() returns the single most-recent draft across both kinds,
// or null. Detection is browser-bound, so it works the same signed in or out.

import { readSetup, getSegmentLabel } from './v4Brief';

const PCHAT_PREFIX = 'v4_pchat_drafts_';

// A creator brief counts as a resumable draft when a segment was picked and
// at least the working name (or one brief answer) exists — and it has NOT
// been launched. Launch stamps contestId/launchedAt/paidAmount onto the blob
// (and clearCreatorDraft strips the draft fields), so either signal rules it
// out and the resume pill never lingers on a live contest.
export function getCreatorDraft() {
  const s = readSetup();
  if (!s || !s.subSegmentId) return null;
  if (s.contestId || s.launchedAt || s.paidAmount) return null; // already launched
  const hasBriefAnswer = s.brief && Object.keys(s.brief).length > 0;
  if (!s.workingName && !hasBriefAnswer) return null; // nothing meaningful yet
  return {
    kind: 'creator',
    subId: s.subSegmentId,
    title: s.workingName || getSegmentLabel(s.subSegmentId) || 'Your contest',
    context: getSegmentLabel(s.subSegmentId) || 'Contest setup',
    href: '/v4/setup/brief',
    savedAt: s.savedAt || 0,
  };
}

// The most-recently-touched participant name draft that still has unsent
// content. Keyed per contest, so someone invited to two contests keeps both;
// we just surface whichever they last worked on.
export function getParticipantDraft() {
  let best = null;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(PCHAT_PREFIX)) continue;
      let v;
      try { v = JSON.parse(localStorage.getItem(k) || 'null'); } catch { continue; }
      if (!v) continue;
      const hasContent =
        (Array.isArray(v.drafts) && v.drafts.length > 0) ||
        (v.activeDraft && (v.activeDraft.text || v.activeDraft.whyItFits));
      if (!hasContent) continue;
      const savedAt = v.savedAt || 0;
      if (!best || savedAt > best.savedAt) {
        const contestId = k.slice(PCHAT_PREFIX.length);
        best = {
          kind: 'participant',
          subId: v.subId || null,
          contestId,
          title: v.contestName || 'a contest',
          context: 'Names in progress',
          href: `/v4/contest/${contestId}/submit`,
          savedAt,
        };
      }
    }
  } catch { /* localStorage unavailable */ }
  return best;
}

// The single most-recent pending draft (creator or participant), or null.
export function getPendingDraft() {
  const creator = getCreatorDraft();
  const participant = getParticipantDraft();
  if (creator && participant) {
    return participant.savedAt >= creator.savedAt ? participant : creator;
  }
  return creator || participant;
}
