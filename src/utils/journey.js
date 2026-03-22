// ─────────────────────────────────────────────────────────────────────────────
// journey.js  –  Single source of truth for journey context, steps, and tracking
// ─────────────────────────────────────────────────────────────────────────────

export const TIER = {
  business: { color: '#eaef09', rgb: '234,239,9', label: 'Business', textColor: '#000' },
  team:     { color: '#8B5CF6', rgb: '139,92,246', label: 'Team',     textColor: '#fff' },
  personal: { color: '#10B981', rgb: '16,185,129', label: 'Personal', textColor: '#fff' },
};

// Fallback: map demo contest IDs → group (used when no localStorage context)
const DEMO_GROUP = {
  'demo-1': 'business', 'demo-2': 'team', 'demo-3': 'personal',
  'demo-4': 'business', 'demo-5': 'team', 'demo-8': 'personal',
};

export const SUB_LABELS = {
  'company-name':           'Company / Startup Name',
  'product-name':           'Product / Service Name',
  'project-name':           'Project / Initiative Name',
  'rebrand':                'Rebrand',
  'other-business':         'Other Business',
  'sports-team':            'Sports Team',
  'band-music':             'Band / Music Group',
  'podcast-channel':        'Podcast / Channel',
  'civic-school-nonprofit': 'Civic / School / Nonprofit',
  'gaming-group':           'Gaming Group',
  'other-team':             'Other Team',
  'baby-name':              'Baby Name',
  'pet-name':               'Pet Name',
  'home-property-fun':      'Home / Property / Fun',
  'other-personal':         'Other Personal',
};

export const CONTEST_TYPE_LABELS = {
  submission_voting:  'Open Contest',
  voting_only:        'Voting Only',
  internal_brainstorm:'Internal Brainstorm',
};

export const MOCK_CONTEST_TITLES = {
  'company-name':           'Startup Name Contest',
  'product-name':           'Product Name Contest',
  'project-name':           'Project Name Contest',
  'rebrand':                'Rebrand Name Contest',
  'other-business':         'Business Name Contest',
  'sports-team':            'Sports Team Name Contest',
  'band-music':             'Band Name Contest',
  'podcast-channel':        'Podcast Name Contest',
  'civic-school-nonprofit': 'Organization Name Contest',
  'gaming-group':           'Gaming Group Name Contest',
  'other-team':             'Team Name Contest',
  'baby-name':              'Baby Name Contest',
  'pet-name':               'Pet Name Contest',
  'home-property-fun':      'Property Name Contest',
  'other-personal':         'Name Contest',
};

// Segment-specific candidate names used by voting / results pages
export const MOCK_CANDIDATES = {
  business: [
    { id: 'b1', name: 'Nexus',   rationale: 'Implies connection and network at scale', voteCount: 28 },
    { id: 'b2', name: 'Apex',    rationale: 'Top-tier performance and achievement',    voteCount: 22 },
    { id: 'b3', name: 'Forge',   rationale: 'Building something strong from scratch',  voteCount: 17 },
    { id: 'b4', name: 'Stratus', rationale: 'Cloud-level ambition — long-term vision', voteCount: 14 },
    { id: 'b5', name: 'Velo',    rationale: 'Speed, momentum, and forward motion',     voteCount: 11 },
    { id: 'b6', name: 'Crest',   rationale: 'At the peak, ready to lead the market',   voteCount:  8 },
  ],
  team: [
    { id: 't1', name: 'Thunder', rationale: 'Power and energy — unmistakable presence',  voteCount: 26 },
    { id: 't2', name: 'Blaze',   rationale: 'Fast and intense — hard to ignore',         voteCount: 21 },
    { id: 't3', name: 'Vortex',  rationale: 'A force that pulls everything toward it',   voteCount: 18 },
    { id: 't4', name: 'Titan',   rationale: 'Bigger than the competition',               voteCount: 13 },
    { id: 't5', name: 'Storm',   rationale: 'Unpredictable and impossible to stop',      voteCount:  9 },
    { id: 't6', name: 'Bolt',    rationale: 'Lightning-fast reaction and execution',     voteCount:  7 },
  ],
  personal: [
    { id: 'p1', name: 'Luna',  rationale: 'Timeless, elegant, and full of wonder',  voteCount: 24 },
    { id: 'p2', name: 'Nova',  rationale: 'A bright new beginning',                  voteCount: 20 },
    { id: 'p3', name: 'River', rationale: 'Calm, flowing, and full of life',         voteCount: 16 },
    { id: 'p4', name: 'Sage',  rationale: 'Wise and grounded beyond years',          voteCount: 12 },
    { id: 'p5', name: 'Ember', rationale: 'Warm, glowing, full of warmth',           voteCount:  8 },
    { id: 'p6', name: 'Quinn', rationale: 'Strong, distinctive, and memorable',      voteCount:  5 },
  ],
};

// ─── Core meta reader ────────────────────────────────────────────────────────

/**
 * Always returns correct journey context.
 * Priority: localStorage → URL hint (contestId) → defaults.
 */
export function getJourneyMeta(contestIdHint = null) {
  const storedGroup = localStorage.getItem('selectedGroup');
  const group         = storedGroup
    || (contestIdHint ? DEMO_GROUP[contestIdHint] : null)
    || 'business';
  const sub           = localStorage.getItem('selectedSubSegment') || 'company-name';
  const contestType   = localStorage.getItem('contestType')        || 'submission_voting';
  const transitionMode = localStorage.getItem('transitionMode')    || 'manual';
  const tier          = TIER[group] || TIER.business;

  return {
    group,
    sub,
    contestType,
    transitionMode,
    hasGroup:     !!storedGroup,
    ...tier,
    subLabel:     SUB_LABELS[sub]                  || sub,
    typeLabel:    CONTEST_TYPE_LABELS[contestType] || 'Open Contest',
    contestTitle: MOCK_CONTEST_TITLES[sub]         || 'Naming Contest',
    candidates:   MOCK_CANDIDATES[group]           || MOCK_CANDIDATES.business,
    journeyLabel: `${tier.label} · ${SUB_LABELS[sub] || sub}`,
  };
}

// ─── Journey step builder ────────────────────────────────────────────────────

/**
 * role: 'creator' | 'participant'
 * Each step also has an optional `phase` for the phase colour dot.
 */
// step shape: { label, path, matchPath?, role, phase? }
//   path      = used for navigation (Next Step / Prev buttons)
//   matchPath = prefix used for URL detection; falls back to path if absent
export function buildJourneySteps(group, sub, contestType, transitionMode = 'manual') {
  const base = [
    { label: 'Landing',         path: '/',                             role: 'creator' },
    { label: 'Select Segment',  path: '/select',                       role: 'creator' },
    { label: 'Auth / Sign Up',  path: '/auth',                         role: 'creator' },
    { label: 'Select Sub-type', path: `/select/${group}`,              role: 'creator' },
    { label: 'Contest Type',    path: `/contest-type/${group}/${sub}`, role: 'creator' },
  ];

  if (contestType === 'voting_only') {
    return [
      ...base,
      { label: 'Upload Names',        path: '/upload-names',          role: 'creator',     phase: 'setup'    },
      { label: 'Invite Participants', path: '/invite/demo-1',         matchPath: '/invite/',   role: 'creator', phase: 'outreach' },
      { label: 'Contest Overview',    path: '/contest-detail/demo-1', matchPath: '/contest-detail/', role: 'creator', phase: 'manage'   },
      { label: 'Voting Phase',        path: '/vote/demo-1',           matchPath: '/vote/',     role: 'participant', phase: 'voting'   },
      { label: 'Results',             path: '/results/demo-1',        matchPath: '/results/',  role: 'participant', phase: 'results'  },
      { label: 'Contest Dashboard',   path: '/dashboard',             matchPath: '/dashboard', role: 'creator', phase: 'manage' },
    ];
  }

  if (contestType === 'internal_brainstorm') {
    return [
      ...base,
      { label: 'Brief Builder',       path: `/brief/${group}/${sub}`,                                role: 'creator',     phase: 'setup'      },
      { label: 'Invite Submitters',   path: '/invite/demo-1',         matchPath: '/invite/',          role: 'creator',     phase: 'outreach'   },
      { label: 'Contest Overview',    path: '/contest-detail/demo-1', matchPath: '/contest-detail/', role: 'creator',     phase: 'manage'     },
      { label: 'Submission Phase',    path: '/contest/demo-1',        matchPath: '/contest/',         role: 'participant', phase: 'submission' },
      ...(transitionMode === 'manual' ? [
        { label: 'Curate Shortlist',  path: '/contest-detail/demo-1', matchPath: '/contest-detail/', role: 'creator',     phase: 'curation'   },
      ] : []),
      { label: 'Invite Voters',       path: '/invite/demo-1',         matchPath: '/invite/',          role: 'creator',     phase: 'outreach'   },
      { label: 'Voting Phase',        path: '/vote/demo-1',           matchPath: '/vote/',            role: 'participant', phase: 'voting'     },
      { label: 'Results',             path: '/results/demo-1',        matchPath: '/results/',         role: 'participant', phase: 'results'    },
      { label: 'Contest Dashboard',   path: '/dashboard',             matchPath: '/dashboard',        role: 'creator',     phase: 'manage'     },
    ];
  }

  // Open Contest (default)
  return [
    ...base,
    { label: 'Brief Builder',       path: `/brief/${group}/${sub}`,                                role: 'creator',     phase: 'setup'      },
    { label: 'Invite Participants', path: '/invite/demo-1',         matchPath: '/invite/',          role: 'creator',     phase: 'outreach'   },
    { label: 'Contest Overview',    path: '/contest-detail/demo-1', matchPath: '/contest-detail/', role: 'creator',     phase: 'manage'     },
    { label: 'Submission Phase',    path: '/contest/demo-1',        matchPath: '/contest/',         role: 'participant', phase: 'submission' },
    ...(transitionMode === 'manual' ? [
      { label: 'Curate Shortlist',  path: '/contest-detail/demo-1', matchPath: '/contest-detail/', role: 'creator',     phase: 'curation'   },
    ] : []),
    { label: 'Voting Phase',        path: '/vote/demo-1',           matchPath: '/vote/',            role: 'participant', phase: 'voting'     },
    { label: 'Results',             path: '/results/demo-1',        matchPath: '/results/',         role: 'participant', phase: 'results'    },
    { label: 'Contest Dashboard',   path: '/dashboard',             matchPath: '/dashboard',        role: 'creator',     phase: 'manage'     },
  ];
}

// ─── Step detection ───────────────────────────────────────────────────────────

/**
 * Finds which step index best matches the current path.
 *
 * For unambiguous URLs → returns that step.
 * For ambiguous URLs (multiple steps share same path) →
 *   - if storedStep is already one of those matches, stay there
 *   - otherwise snap to the first match that is >= storedStep
 *
 * This prevents the widget from jumping backwards while also not getting stuck
 * when a user navigates to a new page that shares a URL with multiple steps.
 */
export function detectStep(path, steps, storedStep) {
  const matches = steps.reduce((acc, step, i) => {
    const mp = step.matchPath || step.path;
    if (mp === path || (mp.length > 1 && path.startsWith(mp))) {
      acc.push(i);
    }
    return acc;
  }, []);

  if (matches.length === 0) return -1;
  if (matches.length === 1) return matches[0];

  // Ambiguous — use stored step if it's already one of the matches (stay put)
  const stored = typeof storedStep === 'number' ? storedStep
    : parseInt(localStorage.getItem('journeyStep') || '-1', 10);

  if (matches.includes(stored)) return stored;

  // Not yet at any of the matches — advance to the first one after stored
  const next = matches.find(m => m > stored);
  return next !== undefined ? next : matches[0];
}

export const PHASE_COLORS = {
  setup: '#eaef09', outreach: '#8B5CF6', submission: '#10B981',
  curation: '#f97316', ballot: '#f97316', voting: '#3b82f6',
  results: '#ec4899', manage: '#eaef09',
};
