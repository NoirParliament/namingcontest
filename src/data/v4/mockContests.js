// Shared mock-contest data — read by both the workspace (Settings) and
// the manage page (ContestManage). Lets the demo show realistic contest
// dashboards even when the user hasn't gone through the launch flow.
//
// Each mock contest carries a full setup-blob shape so ContestManage
// can render it without mistaking it for the user's real contest.
//
// id → fully formed contest record. Look up via getMockContestById(id).

import { SoccerBall } from '@phosphor-icons/react';

export const MOCK_CONTESTS = {
  mock_ongoing_1: {
    id: 'mock_ongoing_1',
    name: 'Sunday football crew',
    workingName: 'Sunday football crew',
    group: 'group',
    subSegmentId: 't1',
    subSegmentTitle: 'Sports team',
    phase: 'Voting',
    daysLeft: 5,
    launchedAt: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
    // Pre-filled settings — covers every SHARED_SETTINGS_QUESTIONS entry
    // so the recap shows realistic Yes/No, durations, and a prize.
    settings: {
      anonymous: true,
      submissionLimit: 3,
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
    // Pre-filled brief answers — match the t1 (Sports team) question
    // schema so the BriefRecapCollapser shows realistic content rather
    // than an empty list.
    brief: {
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
};

export function getMockContestById(id) {
  return MOCK_CONTESTS[id] || null;
}

export function isMockContestId(id) {
  return !!MOCK_CONTESTS[id];
}
