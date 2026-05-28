// Shared mock-contest data — read by both the workspace (Settings) and
// the manage page (ContestManage). Lets the demo show realistic contest
// dashboards even when the user hasn't gone through the launch flow.
//
// Each mock contest carries a full setup-blob shape so ContestManage
// can render it without mistaking it for the user's real contest.
//
// id → fully formed contest record. Look up via getMockContestById(id).

import { SoccerBall } from '@phosphor-icons/react';
import { SIM_CONTESTS } from './simContests';

export const MOCK_CONTESTS = {
  mock_ongoing_1: {
    id: 'mock_ongoing_1',
    name: 'Sunday football crew',
    workingName: 'Sunday football crew',
    group: 'group',
    subSegmentId: 't1',
    subSegmentTitle: 'Sports team',
    // Inviter persona — used by the Join page to humanize the
    // invitation. photoIndex maps to hero-profile-{N}.png in assets.
    creator: {
      name: 'Marcus',
      photoIndex: 4,
      role: 'Team captain',
    },
    phase: 'Voting',
    daysLeft: 5,
    launchedAt: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago — still in submission
    // Pre-filled settings — covers every SHARED_SETTINGS_QUESTIONS entry
    // so the recap shows realistic Yes/No, durations, and a prize.
    settings: {
      // Not anonymous by default — submitter names show under each
      // entry on the vote page. Creator can flip this to hide them.
      anonymous: false,
      // Default cap of 3 — the participant chat hard-stops here and
      // shows the submit checklist; you can't add a fourth.
      submissionLimit: 3,
      // How many votes each participant can cast on the vote page.
      votingLimit: 3,
      customRequirements: {
        enabled: true,
        text: 'Should sound good when chanted on the touchline. Avoid existing pro-club names. Two-word maximum, please.',
      },
      submitterPrize: {
        enabled: true,
        name: 'A round at The Crown',
        text: 'Whoever submits the winning name gets a round of pints on the team after our next match.',
      },
      submissionDays: 7,
      votingDays: 3,
    },
    // ── Aggregate of every participant's submission, used by the
    // creator's LiveResults + the participant's vote page. Real-world
    // this would be a paginated server fetch; for the prototype we
    // ship 15 hand-written entries that match the football brief
    // (chantable, place-rooted, two-word max, underdog tone). Mixing
    // teammate submitters with a couple of outsiders so the
    // "submitted by" line has variety.
    allSubmissions: [
      { id: 'sub_1',  text: 'Iron Boots FC',        whyItFits: 'Sounds like Saturday-night football and a long bus ride home.', submitterName: "Sam O'Brien" },
      { id: 'sub_2',  text: 'Brookside Rovers',     whyItFits: 'Local geography wins community loyalty. Chants easily: "ROVERS!"', submitterName: 'Marcus Wright' },
      { id: 'sub_3',  text: 'North Park United',    whyItFits: 'Direct, two-syllable, chantable. Names the pitch we actually play on.', submitterName: 'Dan Patel' },
      { id: 'sub_4',  text: 'Crown Heights AFC',    whyItFits: 'After the post-match pub. Half the team lives in Crown Heights — it earns the badge.', submitterName: 'Ade Adebayo' },
      { id: 'sub_5',  text: 'Riverside Wanderers',  whyItFits: 'River runs along the pitch. "Wanderers" nods to working-class English football tradition.', submitterName: 'Tom Reeves' },
      { id: 'sub_6',  text: 'The Brook Boys',       whyItFits: 'Shorthand for Brookside. Slightly self-deprecating, which fits the underdog tone.', submitterName: 'Marcus Wright' },
      { id: 'sub_7',  text: 'Heron FC',             whyItFits: 'There are herons along the North Park river. Single sharp word, easy on a jersey.', submitterName: 'Priya Shah' },
      { id: 'sub_8',  text: 'Brookside 11',         whyItFits: 'Names the team size + the home turf. Plays nicely against bigger-sounding pro names.', submitterName: 'Dan Patel' },
      { id: 'sub_9',  text: 'Park Lane Athletic',   whyItFits: '"Athletic" gives gravitas; "Park Lane" anchors it to where we actually play.', submitterName: "Sam O'Brien" },
      { id: 'sub_10', text: 'The Yellow Trim',      whyItFits: 'Self-aware reference to the kit colours. Memorable, slightly cheeky, lands well at the pub.', submitterName: 'Jas Bhatia' },
      { id: 'sub_11', text: 'Brookside Boots',      whyItFits: 'Working-class signal + alliteration. Easy chant: "BOOTS! BOOTS! BOOTS!"', submitterName: 'Tom Reeves' },
      { id: 'sub_12', text: 'Underbridge United',   whyItFits: 'The river bridge sits between Brookside and Crown Heights. Names a literal landmark.', submitterName: 'Ade Adebayo' },
      { id: 'sub_13', text: 'Sunday Best FC',       whyItFits: 'Hat-tip to Sunday-league. Slightly sarcastic in a way that ages well.', submitterName: 'Marcus Wright' },
      { id: 'sub_14', text: 'Crown & Boot',         whyItFits: 'The Crown (pub) + Boots (football). Both halves of the team identity in two words.', submitterName: 'Priya Shah' },
      { id: 'sub_15', text: 'Division B Royals',    whyItFits: 'Owns the actual league position (Division B) with a wink. Hard to mistake for anyone else.', submitterName: 'Jas Bhatia' },
    ],
    // Pre-filled brief answers — match the t1 (Sports team) question
    // schema so the BriefRecapCollapser shows realistic content rather
    // than an empty list.
    brief: {
      projectSummary: 'A Sunday-league 7-a-side football team in the Brookside Adult Rec League Division B. Mostly mates from work who took it more seriously than expected.',
      sportLeague: 'Sunday-league 7-a-side football, Brookside Adult Rec League Division B',
      ageGroup: 'Adult Amateur',
      personality: ['Underdog / Gritty', 'Fun / Playful'],
      namingDirection: 'place-geographic',
      geography: 'We play at North Park, between Brookside and Crown Heights. Most of us live within 15 minutes of the pitch. The river runs along the east side.',
      chantable: 'Yes — fans will chant it',
      teamColors: 'Navy and white, with a yellow trim',
    },
    // Segment-specific icon for the hero badge — overrides the generic
    // tier icon (UsersThree for Group). Sports gets a soccer ball.
    Icon: SoccerBall,
  },

  // ── mock_voting_demo — same brief as mock_ongoing_1 but pre-set
  //    in VOTING stage. Workspace shows "Cast your vote · Voting
  //    ends in 2 days" with the Vote button enabled. After voting:
  //    "You voted · Winner announced in 2 days" with countdown.
  //    Lives as a separate contest so the original mock_ongoing_1
  //    stays in submission stage and we can demo both states.
  mock_voting_demo: {
    id: 'mock_voting_demo',
    name: 'Sunday football crew',
    workingName: 'Sunday football crew',
    group: 'group',
    subSegmentId: 't1',
    subSegmentTitle: 'Sports team',
    creator: { name: 'Marcus', photoIndex: 4, role: 'Team captain' },
    phase: 'Voting',
    daysLeft: 2,
    // Launched 8 days ago. Submission window (7d) closed 1 day ago →
    // voting is currently open. Voting window (3d) ends in 2 days.
    launchedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    settings: {
      anonymous: false,
      submissionLimit: 3,
      votingLimit: 3,
      customRequirements: {
        enabled: true,
        text: 'Should sound good when chanted on the touchline. Avoid existing pro-club names. Two-word maximum, please.',
      },
      submitterPrize: {
        enabled: true,
        name: 'A round at The Crown',
        text: 'Whoever submits the winning name gets a round of pints on the team after our next match.',
      },
      submissionDays: 7,
      votingDays: 3,
    },
    // Same 15 hand-written submissions as mock_ongoing_1. IDs
    // prefixed with 'vsub_' so participant votedFor state doesn't
    // collide between the two demos.
    allSubmissions: [
      { id: 'vsub_1',  text: 'Iron Boots FC',        whyItFits: 'Sounds like Saturday-night football and a long bus ride home.', submitterName: "Sam O'Brien" },
      { id: 'vsub_2',  text: 'Brookside Rovers',     whyItFits: 'Local geography wins community loyalty. Chants easily: "ROVERS!"', submitterName: 'Marcus Wright' },
      { id: 'vsub_3',  text: 'North Park United',    whyItFits: 'Direct, two-syllable, chantable. Names the pitch we actually play on.', submitterName: 'Dan Patel' },
      { id: 'vsub_4',  text: 'Crown Heights AFC',    whyItFits: 'After the post-match pub. Half the team lives in Crown Heights — it earns the badge.', submitterName: 'Ade Adebayo' },
      { id: 'vsub_5',  text: 'Riverside Wanderers',  whyItFits: 'River runs along the pitch. "Wanderers" nods to working-class English football tradition.', submitterName: 'Tom Reeves' },
      { id: 'vsub_6',  text: 'The Brook Boys',       whyItFits: 'Shorthand for Brookside. Slightly self-deprecating, which fits the underdog tone.', submitterName: 'Marcus Wright' },
      { id: 'vsub_7',  text: 'Heron FC',             whyItFits: 'There are herons along the North Park river. Single sharp word, easy on a jersey.', submitterName: 'Priya Shah' },
      { id: 'vsub_8',  text: 'Brookside 11',         whyItFits: 'Names the team size + the home turf. Plays nicely against bigger-sounding pro names.', submitterName: 'Dan Patel' },
      { id: 'vsub_9',  text: 'Park Lane Athletic',   whyItFits: '"Athletic" gives gravitas; "Park Lane" anchors it to where we actually play.', submitterName: "Sam O'Brien" },
      { id: 'vsub_10', text: 'The Yellow Trim',      whyItFits: 'Self-aware reference to the kit colours. Memorable, slightly cheeky, lands well at the pub.', submitterName: 'Jas Bhatia' },
      { id: 'vsub_11', text: 'Brookside Boots',      whyItFits: 'Working-class signal + alliteration. Easy chant: "BOOTS! BOOTS! BOOTS!"', submitterName: 'Tom Reeves' },
      { id: 'vsub_12', text: 'Underbridge United',   whyItFits: 'The river bridge sits between Brookside and Crown Heights. Names a literal landmark.', submitterName: 'Ade Adebayo' },
      { id: 'vsub_13', text: 'Sunday Best FC',       whyItFits: 'Hat-tip to Sunday-league. Slightly sarcastic in a way that ages well.', submitterName: 'Marcus Wright' },
      { id: 'vsub_14', text: 'Crown & Boot',         whyItFits: 'The Crown (pub) + Boots (football). Both halves of the team identity in two words.', submitterName: 'Priya Shah' },
      { id: 'vsub_15', text: 'Division B Royals',    whyItFits: 'Owns the actual league position (Division B) with a wink. Hard to mistake for anyone else.', submitterName: 'Jas Bhatia' },
    ],
    brief: {
      projectSummary: 'A Sunday-league 7-a-side football team in the Brookside Adult Rec League Division B. Mostly mates from work who took it more seriously than expected.',
      sportLeague: 'Sunday-league 7-a-side football, Brookside Adult Rec League Division B',
      ageGroup: 'Adult Amateur',
      personality: ['Underdog / Gritty', 'Fun / Playful'],
      namingDirection: 'place-geographic',
      geography: 'We play at North Park, between Brookside and Crown Heights. Most of us live within 15 minutes of the pitch. The river runs along the east side.',
      chantable: 'Yes — fans will chant it',
      teamColors: 'Navy and white, with a yellow trim',
    },
    Icon: SoccerBall,
  },
};

export function getMockContestById(id) {
  const base = MOCK_CONTESTS[id] || SIM_CONTESTS[id] || null;
  if (!base) return null;
  // Optional per-contest stage override (written by the Platform Map to
  // flip a sim contest's launchedAt/phase so it renders at the right
  // lifecycle stage without duplicating the contest). Never set in
  // normal product flows, so the canonical mock + real contests are
  // completely unaffected.
  try {
    const raw = localStorage.getItem('v4_contest_override_' + id);
    if (raw) {
      const o = JSON.parse(raw);
      if (o && typeof o === 'object') return { ...base, ...o };
    }
  } catch {
    // localStorage unavailable — fall through to base.
  }
  return base;
}

export function isMockContestId(id) {
  return !!MOCK_CONTESTS[id];
}
