// V4 participant state — localStorage helpers for the participant side
// of the product (joining contests, submitting names, voting). Mirrors
// what v4Brief.js does for the creator side, but per-contest scoped.
//
// Storage key shape:  v4_participant_{contestId}
// Value shape:
//   {
//     contestId,
//     name, email,
//     joinedAt,
//     submittedNames: [
//       { id, text, tagline, whyItFits, inspiration, submittedAt }
//     ],
//     votedFor: [nameIds],
//     doneAt,           // present once thank-you screen reached
//   }

const PREFIX = 'v4_participant_';

// ─── Read / write ───────────────────────────────────────────────────
export function readParticipation(contestId) {
  if (!contestId) return null;
  try {
    const raw = localStorage.getItem(PREFIX + contestId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeParticipation(contestId, patch) {
  if (!contestId) return null;
  const current = readParticipation(contestId) || { contestId };
  const next = { ...current, ...patch, contestId };
  try {
    localStorage.setItem(PREFIX + contestId, JSON.stringify(next));
  } catch {
    // localStorage unavailable
  }
  return next;
}

// Enumerate every contest the user has joined. Used by the workspace
// to render the "Contests you've joined" section.
export function readAllParticipations() {
  const list = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(PREFIX)) continue;
      try {
        const value = JSON.parse(localStorage.getItem(key) || 'null');
        if (value) list.push(value);
      } catch {
        // Skip malformed entries
      }
    }
  } catch {
    // localStorage unavailable
  }
  // Sort: most recently joined first
  list.sort((a, b) => (b.joinedAt || 0) - (a.joinedAt || 0));
  return list;
}

// ─── Convenience actions ────────────────────────────────────────────
export function joinContest(contestId, { name, email }) {
  return writeParticipation(contestId, {
    name,
    email,
    joinedAt: Date.now(),
    submittedNames: [],
    votedFor: [],
    doneAt: null,
  });
}

export function recordSubmission(contestId, nameData) {
  const cur = readParticipation(contestId);
  if (!cur) return null;
  const next = {
    ...cur,
    submittedNames: [
      ...(cur.submittedNames || []),
      {
        id: `psub_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        submittedAt: Date.now(),
        ...nameData,
      },
    ],
  };
  writeParticipation(contestId, next);
  return next;
}

export function recordVotes(contestId, nameIds) {
  return writeParticipation(contestId, {
    votedFor: nameIds,
    doneAt: Date.now(),
  });
}

// Wipe a single participation (used by sign-out or "leave contest")
export function clearParticipation(contestId) {
  if (!contestId) return;
  try {
    localStorage.removeItem(PREFIX + contestId);
  } catch {
    // noop
  }
}

// ─── Status derivation (the per-row state machine) ──────────────────
//
// Given a contest's phase + winner sub-state + the participant's entry,
// return a row descriptor:
//   {
//     phaseKey:   'submission' | 'voting' | 'winner',
//     phaseLabel: 'SUBMISSIONS' | 'VOTING' | 'WINNER',  // matches creator side
//     description: string,                              // participant-focused
//     actionLabel: string | null,                       // null if passive
//     actionRoute: string | null,
//   }
//
// `contest` is the contest meta: { id, phase, winnerName, submissionDeadline,
//   votingDeadline, announcementDate, submissionLimit }
// `participation` is the entry from readParticipation()
export function getParticipantRow(contest, participation) {
  if (!contest) return null;
  const phase = contest.phase || 'submission';
  const submittedCount = participation?.submittedNames?.length || 0;
  const votedCount = participation?.votedFor?.length || 0;
  const submissionLimit = contest.submissionLimit || 3;

  // PHASE: winner picked
  if (phase === 'winner' && contest.winnerNameId) {
    return {
      phaseKey: 'winner',
      phaseLabel: 'WINNER',
      description: contest.winnerName
        ? `Winner picked: “${contest.winnerName}”`
        : 'Winner picked',
      actionLabel: 'See who won',
      actionRoute: `/v4/contest/${contest.id}/winner`,
    };
  }

  // PHASE: voting
  if (phase === 'voting' || (phase === 'winner' && !contest.winnerNameId)) {
    if (votedCount > 0) {
      return {
        phaseKey: 'voting',
        phaseLabel: 'VOTING',
        description: contest.announcementDate
          ? `You voted · Winner announced ${contest.announcementDate}`
          : 'You voted · Waiting for the winner to be picked',
        actionLabel: null,
        actionRoute: null,
      };
    }
    return {
      phaseKey: 'voting',
      phaseLabel: 'VOTING',
      description: contest.votingDeadline
        ? `Cast your vote · Voting ends ${contest.votingDeadline}`
        : 'Cast your vote for the winning name',
      actionLabel: 'Vote now',
      actionRoute: `/v4/contest/${contest.id}/vote`,
    };
  }

  // PHASE: submission — already submitted (one-shot model: no
  // "add another" action; the user is locked in for this contest).
  // The Settings JoinedContestRow renders the countdown + greyed
  // vote button inline, so the action label/route here are unused
  // for this state; the row handles its own UI.
  if (submittedCount > 0) {
    return {
      phaseKey: 'submission',
      phaseLabel: 'SUBMITTED',
      description: contest.submissionDeadline
        ? `${submittedCount} ${submittedCount === 1 ? 'suggestion' : 'suggestions'} in · Voting opens ${contest.submissionDeadline}`
        : `${submittedCount} ${submittedCount === 1 ? 'suggestion' : 'suggestions'} in · Waiting for voting`,
      actionLabel: null,
      actionRoute: null,
    };
  }
  return {
    phaseKey: 'submission',
    phaseLabel: 'SUBMISSIONS',
    description: contest.submissionDeadline
      ? `Suggest a name · Submissions close ${contest.submissionDeadline}`
      : 'Suggest a name to enter the contest',
    actionLabel: 'Suggest a name',
    actionRoute: `/v4/contest/${contest.id}/submit`,
  };
}
