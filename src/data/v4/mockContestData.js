// Mock voting-phase data for ContestManage Live Results panel.
// Stand-in for real-time data from backend (Supabase) once wired.
//
// Simple-poll voting model: each participant casts votes; vote count
// is the leaderboard signal. Each name carries the rationale fields the
// submitter filled in (description, tagline, why-it-fits).

// Tone palettes available for participant avatars (design-doc panels)
const TONES = {
  blush:      { bg: '#fadecc', fg: '#9c4818' },
  butter:     { bg: '#fceebc', fg: '#8a6a14' },
  mint:       { bg: '#bce5c8', fg: '#1f5430' },
  periwinkle: { bg: '#c4cff5', fg: '#283b78' },
  sky:        { bg: '#c4dffb', fg: '#1d4f7a' },
};
const TONE_KEYS = Object.keys(TONES);

// 23 participants — name + cycled tone for avatar tint
const PARTICIPANT_NAMES = [
  'Sarah Chen', 'Marcus Lee', 'Priya Nair', 'Jordan Kim', 'Mei Tanaka',
  'David Okafor', 'Aisha Patel', 'Tom Reyes', 'Liam Brown', 'Emma Foster',
  'Carlos Silva', 'Olivia Martin', 'Hiroshi Tanaka', 'Anika Voss', 'Felix Walsh',
  'Maya Reddy', 'Ethan Zhao', 'Sofia Garcia', 'Ben Holden', 'Yuki Sato',
  'Ana Costa', 'Noah Johnson', 'Zoe Turner',
];

export const PARTICIPANTS = PARTICIPANT_NAMES.map((name, i) => {
  const toneKey = TONE_KEYS[i % TONE_KEYS.length];
  return {
    id: `p${i + 1}`,
    name,
    initials: name.split(' ').map((n) => n[0]).join(''),
    toneId: toneKey,
    tone: TONES[toneKey],
  };
});

export function getParticipantById(id) {
  return PARTICIPANTS.find((p) => p.id === id);
}

// 15 sample names — submitter-provided rationale fields stand in for
// what voters see when expanding a name in Live Results. These are
// all football-team submissions for the "Sunday football crew" mock
// contest (the only mock currently in the system).
export const NAMES = [
  {
    id: 'n1', text: 'Riverside Rovers', submittedBy: 'p1',
    voteCount: 18, submittedAgo: '2h ago',
    tagline: 'From the river, on the move.',
    description: 'Classic English-style two-worder — locality + verb noun. Easy on the chant (“Rovers! Rovers!”) and looks great on a kit.',
    whyItFits: 'We train down by the river every week. Rovers feels true to where we play and how we move.',
    inspiration: 'Half the lower-league clubs in England follow this naming pattern. It just works.',
  },
  {
    id: 'n2', text: 'East End Eagles', submittedBy: 'p1',
    voteCount: 14, submittedAgo: '2h ago',
    tagline: 'Sharp eyes, fast wings.',
    description: 'Neighbourhood pride + a bit of swagger. Eagles read confident without being too aggressive.',
    whyItFits: 'Most of us live east. Eagles is the kind of name that reads well on a scarf and looks great as a crest.',
    inspiration: 'Wanted something that fans on the street could shout from a balcony.',
  },
  {
    id: 'n3', text: 'Iron Boots FC', submittedBy: 'p3',
    voteCount: 12, submittedAgo: '5h ago',
    tagline: 'We hit hard. We stay standing.',
    description: 'A bit cheeky, a bit hard-edged. The “FC” suffix grounds it as a proper football club name.',
    whyItFits: 'Our defence is what gets people talking — Iron Boots leans into that identity.',
    inspiration: 'Old-school steel-toe terrace energy.',
  },
  {
    id: 'n4', text: 'Sunday Strikers', submittedBy: 'p7',
    voteCount: 10, submittedAgo: '1d ago',
    tagline: 'Six days resting. One day swinging.',
    description: 'Day-of-the-week names are catchy and memorable. Self-deprecating about being weekend warriors but proud of it.',
    whyItFits: 'We literally only play on Sundays. The name is honest. People remember honest names.',
    inspiration: 'A friend’s Sunday-league team in Manchester called Wednesday FC. Genius.',
  },
  {
    id: 'n5', text: 'Crown Heights United', submittedBy: 'p2',
    voteCount: 8, submittedAgo: '1d ago',
    tagline: 'One team. One ground. One crest.',
    description: 'Locality-anchored, “United” suffix gives it traditional football weight. Translates well to other languages.',
    whyItFits: 'Our pitch is on the Crown Heights side of the park. Naming the team after where we play earns us local cred.',
    inspiration: 'Manchester United, Newcastle United — the suffix carries history.',
  },
  {
    id: 'n6', text: 'Park Lane Athletic', submittedBy: 'p5',
    voteCount: 7, submittedAgo: '6h ago',
    tagline: 'Built on the path between the trees.',
    description: '“Athletic” suffix nods to old-style football identity — Charlton Athletic, Bilbao Athletic. Sounds like we’ve been around.',
    whyItFits: 'Park Lane is the road we cross to get to the pitch. Putting it in the name makes the team feel rooted.',
    inspiration: 'Wanted something that sounded like it had history, even if we’re only a year old.',
  },
  {
    id: 'n7', text: 'Brookside Bulldogs', submittedBy: 'p9',
    voteCount: 6, submittedAgo: '2d ago',
    tagline: 'Don’t let go.',
    description: 'Animal mascot + neighbourhood. Bulldogs reads tenacious, loyal, doesn’t let opponents off the ball.',
    whyItFits: 'We’re the team that wins by attrition, not flair. Bulldogs is honest about that.',
    inspiration: 'Watched too much of the Yale Bulldogs growing up.',
  },
  {
    id: 'n8', text: 'The Eleven', submittedBy: 'p4',
    voteCount: 5, submittedAgo: '8h ago',
    tagline: 'Just enough to play.',
    description: 'Minimalist, confident, a bit cheeky. Plays on the fact that football is 11-a-side.',
    whyItFits: 'We barely scrape together 11 most weeks. Naming the team after that running joke makes it ours.',
    inspiration: 'Brooklyn Nets used to be just “The Nets”. Single-word brevity feels modern.',
  },
  {
    id: 'n9', text: 'Halftime Heroes', submittedBy: 'p11',
    voteCount: 4, submittedAgo: '1d ago',
    tagline: 'We always come back stronger after the whistle.',
    description: 'Self-aware, slightly comic. Two H’s for that satisfying alliteration.',
    whyItFits: 'Genuine team trait — we always play better in the second half. Name commits to that identity.',
    inspiration: 'Sports docs love the “second-half team” trope. We are that team.',
  },
  {
    id: 'n10', text: 'North Park Athletic', submittedBy: 'p13',
    voteCount: 3, submittedAgo: '3d ago',
    tagline: 'A team for the people on this side of the park.',
    description: 'Locality + “Athletic” — the same formula as Park Lane, but rooted in our actual side of the park.',
    whyItFits: 'We meet at the north entrance every Sunday. Naming the team after the meeting point feels right.',
    inspiration: 'Wanted to honour the place we play before we honour anything else.',
  },
  {
    id: 'n11', text: 'Off-Side Story', submittedBy: 'p6',
    voteCount: 2, submittedAgo: '2d ago',
    tagline: 'A musical, played on grass.',
    description: 'A pun. “West Side Story” + the football term. Memorable, makes people smile.',
    whyItFits: 'We’ve had at least one offside goal called against us every match this season. Owning it.',
    inspiration: 'Pub quiz energy. Names that make people grin earn loyalty.',
  },
  {
    id: 'n12', text: 'FC Pickup', submittedBy: 'p15',
    voteCount: 0, submittedAgo: '4d ago',
    tagline: 'No squad list. Just whoever shows up.',
    description: 'European-style “FC” prefix + plain English noun. Honest about being a casual pickup-style team.',
    whyItFits: 'We’re not a real club, we’re a regular pickup. Name should reflect that, not pretend otherwise.',
    inspiration: 'FC Köln, FC Bayern — the prefix reads continental. The “Pickup” undercuts it nicely.',
  },
  {
    id: 'n13', text: 'Big Boot Brigade', submittedBy: 'p8',
    voteCount: 0, submittedAgo: '5d ago',
    tagline: 'Long ball. Long legs. Long memory.',
    description: 'Three B’s for alliteration. Self-deprecating about our long-ball style of play.',
    whyItFits: 'Honest about how we play — clear it from the back, hope someone runs onto it. The crest practically draws itself.',
    inspiration: 'Listening to Sam Allardyce interviews ironically.',
  },
  {
    id: 'n14', text: 'Field of Dreams FC', submittedBy: 'p17',
    voteCount: 0, submittedAgo: '5d ago',
    tagline: 'If you train, they will play.',
    description: 'Movie reference + FC suffix. Wholesome, slightly aspirational.',
    whyItFits: 'Some of us have been waiting to play organised football since we were kids. The name honours that.',
    inspiration: 'The film of the same name — the line “if you build it, he will come” lives in my head.',
  },
  {
    id: 'n15', text: 'Last Whistle United', submittedBy: 'p20',
    voteCount: 0, submittedAgo: '6d ago',
    tagline: 'Goals after the 90th. Pubs after the goal.',
    description: 'Late-game grit + traditional “United” suffix. Tells a story without explaining itself.',
    whyItFits: 'We score most of our goals in the last 10 minutes. The name tells anyone who asks what kind of team we are.',
    inspiration: 'Sir Alex Ferguson’s “Fergie time” Manchester United sides.',
  },
];

// Per-participant submission counts + voting activity (synthesized)
export function getParticipantStats(participantId) {
  const submitted = NAMES.filter((n) => n.submittedBy === participantId);
  // Pretend each participant voted on a random subset (deterministic by id)
  const idHash = parseInt(participantId.replace('p', ''), 10);
  const votedOnCount = (idHash * 3) % 10 + 2; // 2-11 names voted on
  return {
    submittedCount: submitted.length,
    submittedNames: submitted,
    votedOnCount,
  };
}
