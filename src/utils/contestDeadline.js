// One source of truth for "how long until this phase closes".
//
// Every page that says "Closes in N days" goes through here, so the host
// dashboard, the join page and the account menu can never disagree about
// the same contest. Two rules:
//
//   1. The target is the contest's REAL end timestamp (submission_ends_at /
//      voting_ends_at), the very instant the cron job flips the phase on.
//      settings.submissionDays / votingDays are only a fallback for mock
//      contests (or a row missing the columns). Those counts can be
//      fractional (5.25 when the creator picked "end of Tue Oct 6" at 6pm),
//      so they're added as exact milliseconds, never via Date#setDate,
//      which truncates the fraction.
//
//   2. "N days" counts CALENDAR days in the viewer's local time, from today
//      to the day the phase ends. A contest closing at the end of Tue Oct 6
//      reads "in 5 days" all of Thu Oct 1, whether it's 9am or 11pm, and
//      flips to "tomorrow" on Mon Oct 5. Rounding the raw ms difference
//      instead made 5 days 6 hours read as "6 days" on one page and "5" on
//      another.

const MS_DAY = 86400000;

const startOfLocalDay = (t) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

// Accepts epoch ms, an ISO string or a Date. Anything else → null.
export function toMs(value) {
  if (value == null || value === '') return null;
  const ms = typeof value === 'number' ? value : new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

// The instant a phase ends: the real DB timestamp when there is one,
// otherwise launch + the settings day count (mock contests).
export function resolvePhaseEnd(realEndsAt, launchedAt, dayCount) {
  const real = toMs(realEndsAt);
  if (real != null) return real;
  const launch = toMs(launchedAt);
  const days = Number(dayCount);
  if (launch == null || !Number.isFinite(days)) return null;
  return launch + days * MS_DAY;
}

// Calendar days from today to the end's day, local time.
//   0 → ends later today, 1 → tomorrow, N → in N days,
//   -1 → already passed, null → unknown end.
// Math.round absorbs the 23h / 25h days around a DST switch.
export function calendarDaysUntil(endsAt, now = Date.now()) {
  const end = toMs(endsAt);
  if (end == null) return null;
  if (end <= now) return -1;
  return Math.round((startOfLocalDay(end) - startOfLocalDay(now)) / MS_DAY);
}

// In-sentence wording for a day count: "Closes today", "Voting ends
// tomorrow", "Submissions close in 5 days". null when unknown or passed,
// so the caller can drop the line or show its own closed state.
export function formatDaysAhead(days) {
  if (!Number.isFinite(days) || days < 0) return null;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export function formatTimeUntil(endsAt, now = Date.now()) {
  return formatDaysAhead(calendarDaysUntil(endsAt, now));
}
