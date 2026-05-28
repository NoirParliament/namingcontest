// Derive a live-results dataset (names + participants + stats) from a
// contest's OWN allSubmissions — so every segment's creator dashboard
// shows ITS names, not a shared football set.
//
// Vote counts are synthetic but deterministic (a fixed descending
// curve) so the leaderboard reads convincingly. They only surface once
// the contest is past the submission phase: during submissions there
// are no votes yet, so we keep them at 0 and the UI hides them.

// Pastel avatar tones — mirror the segment-theme palette so participant
// chips don't clash with the rest of the page.
const TONES = [
  { bg: '#fadecc', fg: '#9c4818' }, // blush
  { bg: '#fceebc', fg: '#8a6a14' }, // butter
  { bg: '#bce5c8', fg: '#1f5430' }, // mint
  { bg: '#c4cff5', fg: '#283b78' }, // periwinkle
  { bg: '#c4dffb', fg: '#1d4f7a' }, // sky
];

// Deterministic descending vote pattern (index 0 = most-voted). Long
// enough to cover a 15-name shortlist; trailing names sit at 0 votes.
const VOTE_CURVE = [18, 15, 13, 11, 9, 8, 6, 5, 4, 3, 2, 2, 1, 1, 0];
const AGO = [
  '2h ago', '3h ago', '5h ago', '8h ago', '11h ago',
  '1d ago', '1d ago', '2d ago', '2d ago', '3d ago',
  '3d ago', '4d ago', '4d ago', '5d ago', '6d ago',
];

function initialsOf(name) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function buildLiveData(contest, phase = 'voting') {
  const subs = contest?.allSubmissions || [];
  const showVotes = phase !== 'submission';

  // Unique submitters → participant records (stable order of appearance).
  const nameToId = new Map();
  const participants = [];
  subs.forEach((s) => {
    const nm = s.submitterName || 'Someone';
    if (!nameToId.has(nm)) {
      const id = `pp${participants.length + 1}`;
      nameToId.set(nm, id);
      participants.push({
        id,
        name: nm,
        initials: initialsOf(nm),
        tone: TONES[participants.length % TONES.length],
      });
    }
  });

  const names = subs.map((s, i) => ({
    id: s.id,
    text: s.text,
    submittedBy: nameToId.get(s.submitterName || 'Someone'),
    submitterName: s.submitterName || 'Someone',
    voteCount: showVotes ? (VOTE_CURVE[i] ?? 0) : 0,
    submittedAgo: AGO[i] ?? 'recently',
    whyItFits: s.whyItFits || '',
  }));

  const totalVotes = names.reduce((sum, n) => sum + n.voteCount, 0);
  const leading = showVotes
    ? [...names].sort((a, b) => b.voteCount - a.voteCount)[0]
    : null;

  return {
    names,
    participants,
    showVotes,
    stats: {
      submissions: names.length,
      participants: participants.length,
      votes: totalVotes,
      leadingName: leading?.text || '—',
    },
  };
}

// Per-participant rollup over a derived names list. votedOnCount is a
// deterministic stand-in (no real vote graph in the prototype).
export function participantStatsFrom(names, participant) {
  const submittedNames = names.filter((n) => n.submittedBy === participant.id);
  const hash = parseInt(String(participant.id).replace(/\D/g, ''), 10) || 1;
  const votedOnCount = (hash * 3) % 10 + 2; // 2–11
  return {
    submittedCount: submittedNames.length,
    submittedNames,
    votedOnCount,
  };
}
