// Derive a live-results dataset (names + participants + stats) from a
// contest's OWN allSubmissions — so every segment's creator dashboard
// shows ITS names, not a shared football set.
//
// Vote counts are synthetic but deterministic (a fixed descending
// curve) so the leaderboard reads convincingly. They only surface once
// the contest is past the submission phase: during submissions there
// are no votes yet, so we keep them at 0 and the UI hides them.

import { showSubmitter } from './v4Anonymity';

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

  // Anonymity is absolute — a hidden author is never mapped back to a
  // person, host included. Hidden names collapse into one synthetic
  // "Anonymous" submitter so the participant view can't reveal them.
  const displayNameFor = (s) =>
    showSubmitter(contest, s) ? (s.submitterName || 'Someone') : 'Anonymous';

  // Unique submitters → participant records (stable order of appearance).
  const nameToId = new Map();
  const participants = [];
  subs.forEach((s) => {
    const nm = displayNameFor(s);
    if (!nameToId.has(nm)) {
      const id = nm === 'Anonymous' ? 'anon' : `pp${participants.length + 1}`;
      nameToId.set(nm, id);
      participants.push({
        id,
        name: nm,
        initials: nm === 'Anonymous' ? '?' : initialsOf(nm),
        anonymous: nm === 'Anonymous',
        tone: TONES[participants.length % TONES.length],
      });
    }
  });

  const names = subs.map((s, i) => {
    const nm = displayNameFor(s);
    return {
      id: s.id,
      text: s.text,
      submittedBy: nameToId.get(nm),
      submitterName: nm,
      anonymous: nm === 'Anonymous',
      voteCount: showVotes ? (VOTE_CURVE[i] ?? 0) : 0,
      submittedAgo: AGO[i] ?? 'recently',
      whyItFits: s.whyItFits || '',
    };
  });

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

// Compact "3h ago" / "2d ago" from an ISO timestamp.
function timeAgo(iso) {
  if (!iso) return 'recently';
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return 'recently';
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Real (DB) equivalent of buildLiveData: build the same {names, participants,
// showVotes, stats} shape from real submission rows + a userId→displayName
// map. Anonymity is driven by each row's `credited` flag (uncredited rows
// collapse into one "Anonymous" submitter). Vote counts are the real
// denormalized submissions.vote_count (kept in sync by a DB trigger) and are
// only surfaced once the contest is past the submission phase.
export function buildLiveDataFromReal(subs, profilesById = {}, participantCount = 0, phase = 'submission') {
  const showVotes = phase !== 'submission';
  const profOf = (s) => profilesById[s.user_id] || null;
  const displayNameFor = (s) => (s.credited ? (profOf(s)?.name || 'Someone') : 'Anonymous');

  // Group submissions by their real author (credited → by user_id; uncredited
  // → a single shared "anon" bucket) so the participants view is accurate.
  const keyToId = new Map();
  const participants = [];
  subs.forEach((s) => {
    const key = s.credited ? `u:${s.user_id}` : 'anon';
    if (!keyToId.has(key)) {
      const nm = displayNameFor(s);
      const id = key === 'anon' ? 'anon' : `pp${participants.length + 1}`;
      keyToId.set(key, id);
      participants.push({
        id,
        name: nm,
        initials: nm === 'Anonymous' ? '?' : initialsOf(nm),
        anonymous: nm === 'Anonymous',
        tone: TONES[participants.length % TONES.length],
        // Seed the same avatar the participant sees for themselves: the
        // boring-avatar generated from their auth id (or their uploaded photo).
        // Anonymous authors are never tied back to their id — a stable bucket
        // seed keeps their avatar consistent without identifying them.
        avatarSeed: key === 'anon' ? 'anon' : s.user_id,
        avatarUrl: s.credited ? (profOf(s)?.avatarUrl || null) : null,
      });
    }
  });

  const names = subs.map((s) => {
    const key = s.credited ? `u:${s.user_id}` : 'anon';
    const nm = displayNameFor(s);
    return {
      id: s.id,
      text: s.text,
      submittedBy: keyToId.get(key),
      submitterName: nm,
      anonymous: nm === 'Anonymous',
      voteCount: showVotes ? (s.vote_count || 0) : 0,
      submittedAgo: timeAgo(s.created_at),
      whyItFits: s.rationale || '',
    };
  });

  const totalVotes = names.reduce((sum, n) => sum + n.voteCount, 0);
  const leading = showVotes ? [...names].sort((a, b) => b.voteCount - a.voteCount)[0] : null;

  return {
    names,
    participants,
    showVotes,
    stats: {
      submissions: names.length,
      // Prefer the real joined-participant count; fall back to submitters.
      participants: participantCount || participants.length,
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
