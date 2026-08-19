// Anonymity resolver — single source of truth for "who gets credited".
//
// A contest is in one of three modes:
//   'public'      — every name shows its author
//   'anonymous'   — no name shows an author (absolute: not even the host)
//   'participant' — each submission carries its own choice (credited by
//                   default; the submitter may opt out per name)
//
// Stored values vary by surface and age, so we normalize defensively:
//   - new radioCards answer: 'Public' | 'Anonymous' | 'Let participants choose'
//   - legacy toggle: a boolean (true = anonymous)
//   - it may live at contest.settings.anonymity, contest.anonymity, or the
//     legacy contest.anonymous / contest.settings.anonymous
//
// Anonymity here is ABSOLUTE — when a name is hidden, nobody sees the
// author, the host included. An anonymous name therefore can't be credited
// or contacted, so it also forfeits the submitter prize.

export function anonymityMode(contest) {
  const raw =
    contest?.settings?.anonymity ??
    contest?.anonymity ??
    contest?.settings?.anonymous ??
    contest?.anonymous;

  if (raw === true) return 'anonymous';
  if (raw === false) return 'public';

  const s = String(raw ?? '').toLowerCase();
  if (s.includes('choose') || s.includes('participant') || s.includes('each')) return 'participant';
  if (s.includes('anon') || s.includes('hide') || s.includes('private')) return 'anonymous';
  if (s.includes('public') || s.includes('show') || s.includes('credit')) return 'public';
  return 'participant'; // sensible default for the new model
}

// Did this individual submission opt out of credit? Only meaningful in
// 'participant' mode. Accepts the field spellings used across mock data.
function submissionOptedOut(submission) {
  return !!(
    submission &&
    (submission.anonymous || submission.hideAuthor || submission.creditOptOut)
  );
}

// Should this submission's author be shown ANYWHERE (voters, host, public)?
export function showSubmitter(contest, submission) {
  const mode = anonymityMode(contest);
  if (mode === 'public') return true;
  if (mode === 'anonymous') return false;
  return !submissionOptedOut(submission); // participant mode
}

// The author label to render — the real name when shown, else "Anonymous".
export function submitterLabel(contest, submission) {
  if (!showSubmitter(contest, submission)) return 'Anonymous';
  return submission?.submitterName || 'Anonymous';
}

// Is this submission eligible for the submitter prize? An anonymous name
// can't be credited or contacted, so it forfeits the prize.
export function prizeEligible(contest, submission) {
  return showSubmitter(contest, submission);
}

// Short human-readable summary of the mode — for review / settings rows.
export function anonymityLabel(contest) {
  const mode = anonymityMode(contest);
  if (mode === 'public') return 'Public: names shown';
  if (mode === 'anonymous') return 'Anonymous';
  return 'Participants choose';
}
