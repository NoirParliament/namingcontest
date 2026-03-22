// ═══════════════════════════════════════════════════════════
// NamingContest.com — Voting Algorithms (All 5 Methods)
// Client-side only, no backend
// ═══════════════════════════════════════════════════════════

// ─── 1. Simple Poll ───
export function calculateSimplePoll(votes, names) {
  const counts = {};
  names.forEach(n => { counts[n.id] = 0; });
  votes.forEach(v => { if (counts[v.selectedNameId] !== undefined) counts[v.selectedNameId]++; });
  const results = Object.entries(counts).map(([id, count]) => ({
    nameId: id,
    name: names.find(n => n.id === id)?.text || id,
    votes: count,
    percentage: votes.length > 0 ? (count / votes.length) * 100 : 0,
  })).sort((a, b) => b.votes - a.votes);
  return { winner: results[0], results, totalVotes: votes.length };
}

// ─── 2. Ranked-Choice (Instant Runoff) ───
export function calculateRankedChoice(votes, names) {
  let remaining = [...names];
  const rounds = [];
  let roundNum = 1;

  while (remaining.length > 1) {
    const voteCount = {};
    remaining.forEach(n => { voteCount[n.id] = 0; });
    votes.forEach(vote => {
      const firstChoice = vote.rankings.find(id => remaining.some(n => n.id === id));
      if (firstChoice) voteCount[firstChoice]++;
    });
    const total = votes.length;
    const majority = total / 2;
    let winner = null;
    for (const [id, count] of Object.entries(voteCount)) {
      if (count > majority) { winner = id; break; }
    }
    if (winner) {
      rounds.push({ roundNumber: roundNum, voteCount, eliminated: null, winner });
      return { winner: remaining.find(n => n.id === winner), rounds };
    }
    let minVotes = Infinity, eliminatedId = '';
    for (const [id, count] of Object.entries(voteCount)) {
      if (count < minVotes) { minVotes = count; eliminatedId = id; }
    }
    rounds.push({ roundNumber: roundNum, voteCount, eliminated: eliminatedId, winner: null });
    remaining = remaining.filter(n => n.id !== eliminatedId);
    roundNum++;
  }
  rounds.push({ roundNumber: roundNum, voteCount: { [remaining[0].id]: votes.length }, eliminated: null, winner: remaining[0].id });
  return { winner: remaining[0], rounds };
}

// ─── 3. Multi-Criteria Scoring ───
export const CRITERIA = [
  { id: 'magnetism', label: 'Magnetism', desc: 'Is it intriguing and compelling?' },
  { id: 'distinctiveness', label: 'Distinctiveness', desc: 'Does it stand out in the competitive landscape?' },
  { id: 'brandFit', label: 'Brand Fit', desc: 'Does it fit the personality and values?' },
  { id: 'accessibility', label: 'Accessibility', desc: 'Easy to spell, say, and remember?' },
  { id: 'longevity', label: 'Longevity', desc: 'Will it still work in 10–20 years?' },
];

export function calculateMultiCriteria(votes, names) {
  const scores = {};
  names.forEach(n => {
    scores[n.id] = { criteriaScores: {}, totalScore: 0, avgScore: 0 };
    CRITERIA.forEach(c => { scores[n.id].criteriaScores[c.id] = { total: 0, avg: 0 }; });
  });
  votes.forEach(vote => {
    if (!vote.criteria) return;
    Object.entries(vote.criteria).forEach(([nameId, cs]) => {
      if (!scores[nameId]) return;
      CRITERIA.forEach(c => {
        if (cs[c.id] !== undefined) scores[nameId].criteriaScores[c.id].total += cs[c.id];
      });
    });
  });
  Object.keys(scores).forEach(id => {
    let total = 0;
    CRITERIA.forEach(c => {
      const avg = votes.length > 0 ? scores[id].criteriaScores[c.id].total / votes.length : 0;
      scores[id].criteriaScores[c.id].avg = avg;
      total += avg;
    });
    scores[id].avgScore = total / CRITERIA.length;
  });
  const results = Object.entries(scores).map(([id, data]) => ({
    nameId: id, name: names.find(n => n.id === id)?.text || id, ...data,
  })).sort((a, b) => b.avgScore - a.avgScore);
  return { winner: results[0], results, criteria: CRITERIA };
}

// ─── 4. Pairwise Comparison (Bradley-Terry) ───
export function calculatePairwise(votes, names) {
  const wins = {};
  names.forEach(n => { wins[n.id] = {}; names.forEach(o => { wins[n.id][o.id] = 0; }); });
  votes.forEach(v => { if (wins[v.winner] && wins[v.winner][v.loser] !== undefined) wins[v.winner][v.loser]++; });
  let strength = {};
  names.forEach(n => { strength[n.id] = 1; });
  for (let iter = 0; iter < 100; iter++) {
    const newStr = {};
    names.forEach(n => {
      let num = 0, den = 0;
      names.forEach(o => {
        if (n.id !== o.id) {
          num += wins[n.id][o.id];
          const total = wins[n.id][o.id] + wins[o.id][n.id];
          if (total > 0) den += total / (strength[n.id] + strength[o.id]);
        }
      });
      newStr[n.id] = den > 0 ? num / den : 0;
    });
    strength = newStr;
  }
  const results = Object.entries(strength).map(([id, str]) => ({
    nameId: id, name: names.find(n => n.id === id)?.text || id, strength: str,
    wins: Object.values(wins[id] || {}).reduce((a, b) => a + b, 0),
  })).sort((a, b) => b.strength - a.strength);
  return { winner: results[0], results, winMatrix: wins };
}

// ─── 5. Weighted Voting ───
export function calculateWeighted(votes, names, participantWeights) {
  const counts = {};
  names.forEach(n => { counts[n.id] = 0; });
  votes.forEach(v => {
    const w = participantWeights[v.participantId] || 1;
    if (counts[v.selectedNameId] !== undefined) counts[v.selectedNameId] += w;
  });
  const totalWeight = Object.values(participantWeights).reduce((a, b) => a + b, 0) || 1;
  const results = Object.entries(counts).map(([id, wv]) => ({
    nameId: id, name: names.find(n => n.id === id)?.text || id,
    weightedVotes: wv, percentage: (wv / totalWeight) * 100,
  })).sort((a, b) => b.weightedVotes - a.weightedVotes);
  return { winner: results[0], results, totalWeight };
}
