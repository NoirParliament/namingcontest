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
  // ── Business ──────────────────────────────────────────────────────────────
  'company-name': [
    { id: 'b1', name: 'Nexus',   rationale: 'Suggests connectivity at scale — works across B2B and consumer. Trademarkable, one syllable, no category baggage.', voteCount: 28 },
    { id: 'b2', name: 'Apex',    rationale: 'Signals top-tier performance. Strong, direct, globally understood. Compresses cleanly to a logo mark.', voteCount: 22 },
    { id: 'b3', name: 'Forge',   rationale: 'Implies craftsmanship and transformation — you make something stronger than the raw material you started with.', voteCount: 17 },
    { id: 'b4', name: 'Stratus', rationale: 'Cloud-level ambition. Two syllables, distinctive in the space, suggests long-term scalability without saying it.', voteCount: 14 },
    { id: 'b5', name: 'Velo',    rationale: 'Speed and momentum. Short, punchy, phonetically clean in any language. No negative connotations identified.', voteCount: 11 },
    { id: 'b6', name: 'Crest',   rationale: 'At the peak — leadership without aggression. Versatile across markets and works well in a compound product suite.', voteCount:  8 },
  ],
  'product-name': [
    { id: 'pr1', name: 'Pulse',   rationale: 'Suggests real-time activity and a living system. Works for analytics, health, or monitoring products across verticals.', voteCount: 24 },
    { id: 'pr2', name: 'Orbit',   rationale: 'Everything revolves around it — a hub product name. Memorable, scalable across a product suite, no translation issues.', voteCount: 19 },
    { id: 'pr3', name: 'Prism',   rationale: 'Takes one input (data, workflow, content) and reveals its full spectrum. Distinctive, visual, ownable in most categories.', voteCount: 15 },
    { id: 'pr4', name: 'Relay',   rationale: 'Handoff, continuity, speed — perfect for workflow or communication tools. Clear benefit embedded in the name itself.', voteCount: 12 },
    { id: 'pr5', name: 'Beacon',  rationale: 'Guides users to what matters. Strong metaphor for discovery, alert, or navigation products. Warm and purposeful.', voteCount:  9 },
    { id: 'pr6', name: 'Lumen',   rationale: 'Unit of light — clarity and illumination. Premium feel, works globally, distinctive in most software categories.', voteCount:  6 },
  ],
  'project-name': [
    { id: 'pj1', name: 'Catalyst',   rationale: 'Triggers change without being consumed by it. Signals transformation or culture work — team feels part of something bigger.', voteCount: 22 },
    { id: 'pj2', name: 'Backbone',   rationale: 'The infrastructure everyone depends on. Signals reliability — great for platform, infrastructure, or integration projects.', voteCount: 18 },
    { id: 'pj3', name: 'Meridian',   rationale: 'The highest point in an arc — signals ambition and a defined destination. Works for strategic alignment initiatives.', voteCount: 14 },
    { id: 'pj4', name: 'Keystone',   rationale: 'The piece that holds everything together. Strong metaphor for cross-functional or dependency-heavy projects.', voteCount: 11 },
    { id: 'pj5', name: 'Signal',     rationale: 'Cut through noise. Works for communication, clarity, or strategic alignment projects where focus is the goal.', voteCount:  8 },
    { id: 'pj6', name: 'Groundwork', rationale: 'Laying the foundation honestly. Respects the unglamorous nature of foundational work without underselling its importance.', voteCount:  5 },
  ],
  'rebrand': [
    { id: 'rb1', name: 'Verity',   rationale: 'Truth and authenticity — signals a more honest, transparent direction. Warm but professional. Clear distance from the old name.', voteCount: 20 },
    { id: 'rb2', name: 'Pinnacle', rationale: 'The highest point reached — signals evolution and arrival. Preserves ambition without being aggressive.', voteCount: 17 },
    { id: 'rb3', name: 'Solace',   rationale: 'Comfort after difficulty. Works when the rebrand exists to heal reputation or shift toward a warmer brand voice.', voteCount: 14 },
    { id: 'rb4', name: 'Clarity',  rationale: 'Elimination of confusion — signals the rebrand exists to be more honest and direct with customers going forward.', voteCount: 11 },
    { id: 'rb5', name: 'Echelon',  rationale: 'A rank above — premium repositioning without arrogance. Strong B2B appeal, trademarkable, distinct in most sectors.', voteCount:  8 },
    { id: 'rb6', name: 'Ardent',   rationale: 'Passionate and committed — signals a rebrand driven by values, not trend-chasing. Warm, human, long shelf life.', voteCount:  5 },
  ],

  // ── Team ──────────────────────────────────────────────────────────────────
  'sports-team': [
    { id: 'st1', name: 'Thunder',  rationale: 'Unmistakable force — sounds dominant chanted in a stadium. Abstract enough to build a mascot without limiting the visual identity team.', voteCount: 26 },
    { id: 'st2', name: 'Blaze',    rationale: 'Fast, intense, impossible to ignore. One syllable, chantable, generates aggressive energy on field and in merchandise.', voteCount: 21 },
    { id: 'st3', name: 'Vortex',   rationale: 'A force that pulls everything toward it — implies team play over individual heroics. Distinctive in any league or division.', voteCount: 18 },
    { id: 'st4', name: 'Titan',    rationale: 'Mythological scale and power. Instantly understood globally, strong in all visual formats, proven in professional sports.', voteCount: 13 },
    { id: 'st5', name: 'Storm',    rationale: 'Unpredictable and impossible to stop — carries energy that works across climates and cultures without geographic limitation.', voteCount:  9 },
    { id: 'st6', name: 'Bolt',     rationale: 'Lightning-fast. One syllable, explosive phonetics. Tags cleanly (BLT), merch-friendly, searchable across all platforms.', voteCount:  7 },
  ],
  'band-music': [
    { id: 'bm1', name: 'Hollow Signal',  rationale: 'Evokes isolation and transmission — suggests music that reaches across distance. Literary feel, aged aesthetic, zero search competition.', voteCount: 24 },
    { id: 'bm2', name: 'Vanta',          rationale: 'The darkest material known — absorbs everything. Striking, short, searchable. Hints at depth and intensity before a note is played.', voteCount: 19 },
    { id: 'bm3', name: 'Crestfall',      rationale: 'Disappointment given a beautiful shape. Emotional resonance for alternative, indie, or post-rock audiences. Distinctive, ownable.', voteCount: 15 },
    { id: 'bm4', name: 'The Drift',      rationale: 'Movement without fixed direction — captures ambiguity and atmosphere perfectly. Works for ambient, shoegaze, or folk aesthetics.', voteCount: 12 },
    { id: 'bm5', name: 'Static Arc',     rationale: 'Tension between noise and structure. Sounds like controlled chaos. Searchable, visually interesting, stands alone in a playlist.', voteCount:  9 },
    { id: 'bm6', name: 'Pale Meridian',  rationale: 'A faded high point — melancholy without bleakness. Poetic, highly ownable, evocative of a specific emotional register.', voteCount:  6 },
  ],
  'podcast-channel': [
    { id: 'pc1', name: 'Hidden Current', rationale: 'Forces that move things beneath the surface — perfect for analysis or investigative shows. Memorable, searchable, broad enough to evolve.', voteCount: 22 },
    { id: 'pc2', name: 'The Brief',      rationale: 'Crisp, confident, promises efficiency. Strong for business, news, or daily formats. Clean hashtag, strong brand architecture.', voteCount: 18 },
    { id: 'pc3', name: 'Deep Signal',    rationale: 'Beyond the noise — suggests substance and insider access. Works for tech, finance, or strategy shows targeting serious audiences.', voteCount: 14 },
    { id: 'pc4', name: 'Undercurrent',   rationale: 'The tension beneath the surface story — perfect for narrative or investigative formats. Strong long-term brand potential.', voteCount: 11 },
    { id: 'pc5', name: 'Raw Notes',      rationale: 'Unpolished, direct — promises authenticity over production value. Works for interview formats or creative process documentation.', voteCount:  8 },
    { id: 'pc6', name: 'The Long View',  rationale: 'Contrarian in a short-form era. Signals thoughtful, in-depth content. Strongly differentiated for strategy or history formats.', voteCount:  5 },
  ],
  'civic-school-nonprofit': [
    { id: 'cv1', name: 'Common Ground',      rationale: 'Shared values over division — universal enough for any civic mission, warm enough for direct community use across demographics.', voteCount: 20 },
    { id: 'cv2', name: 'The Forward Fund',   rationale: 'Progress-oriented without being political. Clear about purpose (funding), signals direction without excluding any stakeholder group.', voteCount: 17 },
    { id: 'cv3', name: 'Civic Root',         rationale: 'Community anchored in place — grassroots energy with longevity. Suggests the work goes deep, not just wide. Donor and beneficiary-friendly.', voteCount: 13 },
    { id: 'cv4', name: 'Elevate Together',   rationale: 'Collective uplift — inclusive, action-oriented, accessible to both donors and beneficiaries in the same phrase.', voteCount: 10 },
    { id: 'cv5', name: 'The Bridge Project', rationale: 'Connecting divided communities or resources. Literal and metaphorical — instantly understood by any audience across cultures.', voteCount:  7 },
    { id: 'cv6', name: 'Catalyst Community', rationale: 'Triggers change from within — positions the organization as the spark, not the complete solution. Honest about the model.', voteCount:  4 },
  ],
  'gaming-group': [
    { id: 'gg1', name: 'VoidStrike',      rationale: 'Aggressive, abstract, impossible to confuse with anyone else. Tags to VS — clean in brackets, strong on jersey or stream overlay.', voteCount: 25 },
    { id: 'gg2', name: 'NullPoint',       rationale: 'Technical vocabulary used aggressively — signals a team that plays with machine precision and exploits system weaknesses.', voteCount: 20 },
    { id: 'gg3', name: 'Eclipse',         rationale: 'Blocks out everything else — dominant, visual, one word. Proven in esports, clean tag (EC), works across all game genres.', voteCount: 16 },
    { id: 'gg4', name: 'Circuit Breakers',rationale: 'Disrupts the system — technical reference suggesting you stop opponents cold. Playful confidence that signals competitive intent.', voteCount: 12 },
    { id: 'gg5', name: 'Phantom Grid',    rationale: 'Present but invisible — tactical intelligence over brute force. Strong for strategy game squads where positioning beats reaction time.', voteCount:  8 },
    { id: 'gg6', name: 'Binary Storm',    rationale: 'Machine language meets elemental force. Abstract, technical, globally readable — no translation needed across any market.', voteCount:  5 },
  ],
  'other-team': [
    { id: 'ot1', name: 'The Collective', rationale: 'Signals shared ownership and equal contribution — no hierarchy implied. Works for creative groups, advisory boards, or community clubs.', voteCount: 19 },
    { id: 'ot2', name: 'Common Thread',  rationale: 'The thing that connects everyone — implies diversity unified by purpose. Warm, inclusive, memorable across contexts.', voteCount: 15 },
    { id: 'ot3', name: 'The Assembly',   rationale: 'Intentional gathering for purpose — formal enough for committees, casual enough for social groups. Timeless and dignified.', voteCount: 12 },
    { id: 'ot4', name: 'The Guild',      rationale: 'Craft plus community — signals expertise and belonging. Works for any group built around shared skill, passion, or practice.', voteCount:  9 },
    { id: 'ot5', name: 'Parallel',       rationale: 'Moving in the same direction independently — captures how effective teams work without stepping on each other\'s contribution.', voteCount:  6 },
    { id: 'ot6', name: 'Waypoint',       rationale: 'A reference point on a longer journey — implies the group exists to help people navigate something larger than the group itself.', voteCount:  4 },
  ],

  // ── Personal ──────────────────────────────────────────────────────────────
  'baby-name': [
    { id: 'bn1', name: 'Luna',   rationale: 'Latin for moon — timeless, cross-cultural, works at every life stage. Beautiful unshortened, no awkward nickname risk.', voteCount: 24 },
    { id: 'bn2', name: 'Nova',   rationale: 'A stellar explosion — a bright, powerful beginning. Modern feel with ancient roots. Rising globally, not yet overused.', voteCount: 20 },
    { id: 'bn3', name: 'River',  rationale: 'Nature name with flow and permanence — calm, directional, strong. Works for any gender, ages well into adulthood and professional life.', voteCount: 16 },
    { id: 'bn4', name: 'Sage',   rationale: 'Wisdom from the first day — herb name with grounded quiet confidence. Gender-neutral, professional at any age, no pronunciation variants.', voteCount: 12 },
    { id: 'bn5', name: 'Ember',  rationale: 'Warmth and sustained light — not a blaze but a constant glow. Distinctive without being invented. Ages gracefully across all stages.', voteCount:  8 },
    { id: 'bn6', name: 'Quinn',  rationale: 'Strong, one syllable, Celtic origin — sharp and modern. Works equally well at a playground and a boardroom, no diminutive needed.', voteCount:  5 },
  ],
  'pet-name': [
    { id: 'pn1', name: 'Mochi',   rationale: 'Soft, round, sweet — perfect for a cat or small dog. Two syllables ending in a vowel: easy to call across a park, distinctive in any dog run.', voteCount: 22 },
    { id: 'pn2', name: 'Atlas',   rationale: 'A big name for any size animal — carries the world. Works for large breeds or any pet with an outsized personality that fills a room.', voteCount: 18 },
    { id: 'pn3', name: 'Wren',    rationale: 'Small but mighty — a bird name that fits the spirited pet. One syllable, easy recall, distinctive in any dog park full of Lunas and Bellas.', voteCount: 14 },
    { id: 'pn4', name: 'Cosmo',   rationale: 'Cosmic energy, playful feel — works for any species. Two syllables, naturally compresses to "Cos" as a call name for training.', voteCount: 10 },
    { id: 'pn5', name: 'Remy',    rationale: 'French, charming, genderless — hits the personality-over-appearance sweet spot. Popular but not overused in pet circles yet.', voteCount:  7 },
    { id: 'pn6', name: 'Biscuit', rationale: 'Warm, comforting, slightly absurd in the best way — perfect for a dog with golden energy. Chantable, loveable, impossible to say without smiling.', voteCount:  4 },
  ],
  'home-property-fun': [
    { id: 'hp1', name: 'Willowbend',  rationale: 'Grounded in nature and specific enough to feel real — suggests a property with character, a feature worth naming, and a story to tell guests.', voteCount: 20 },
    { id: 'hp2', name: 'The Lookout', rationale: 'Implies a view and a vantage point — guests immediately understand what\'s special about this property before they arrive.', voteCount: 16 },
    { id: 'hp3', name: 'Harborside',  rationale: 'Water adjacency and calm — works for coastal or lake properties. Evokes rest, access, and somewhere worth arriving at.', voteCount: 12 },
    { id: 'hp4', name: 'Cedar Rest',  rationale: 'Nature plus restoration — two words that paint the complete picture. Cedar signals forest warmth; Rest promises the experience of the stay.', voteCount:  9 },
    { id: 'hp5', name: 'Ridgecrest',  rationale: 'Elevation and achievement — a property at the top of something. Works for mountain or hill properties with panoramic views as a selling point.', voteCount:  6 },
    { id: 'hp6', name: 'The Croft',   rationale: 'A small, cultivated, intentional space — British in origin but universally charming. Feels like somewhere people return to every year.', voteCount:  4 },
  ],
  'other-personal': [
    { id: 'op1', name: 'The Ritual',    rationale: 'Elevates habit into intention — whatever you\'re naming becomes something people protect and look forward to every time.', voteCount: 18 },
    { id: 'op2', name: 'Common Thread', rationale: 'The shared element that makes a group a group — warm, inclusive, and specific without limiting future direction.', voteCount: 14 },
    { id: 'op3', name: 'Waypoint',      rationale: 'A marker on a longer journey — implies purpose, direction, and belonging to something bigger than any single moment.', voteCount: 11 },
    { id: 'op4', name: 'The Archive',   rationale: 'Permanence and memory — works for any group or tradition where the history matters as much as the present experience.', voteCount:  8 },
    { id: 'op5', name: 'The Habit',     rationale: 'Radical honesty about what a recurring gathering is — a habit worth keeping. Disarming and surprisingly memorable.', voteCount:  5 },
    { id: 'op6', name: 'Meridian',      rationale: 'The highest point in an arc — your group named from the start for where it\'s going, not just where it started.', voteCount:  3 },
  ],

  // ── Legacy fallbacks keyed by group ──────────────────────────────────────
  business: [
    { id: 'b1', name: 'Nexus',   rationale: 'Suggests connectivity at scale — works across B2B and consumer. Trademarkable, one syllable, no category baggage.', voteCount: 28 },
    { id: 'b2', name: 'Apex',    rationale: 'Signals top-tier performance. Strong, direct, globally understood.', voteCount: 22 },
    { id: 'b3', name: 'Forge',   rationale: 'Implies craftsmanship and transformation — you make something stronger than the raw material.', voteCount: 17 },
    { id: 'b4', name: 'Stratus', rationale: 'Cloud-level ambition — long-term vision without saying it.', voteCount: 14 },
    { id: 'b5', name: 'Velo',    rationale: 'Speed, momentum, and forward motion. Clean in any language.', voteCount: 11 },
    { id: 'b6', name: 'Crest',   rationale: 'At the peak, ready to lead the market.', voteCount: 8 },
  ],
  team: [
    { id: 't1', name: 'Thunder', rationale: 'Power and energy — unmistakable presence in any format.', voteCount: 26 },
    { id: 't2', name: 'Blaze',   rationale: 'Fast and intense — hard to ignore on field or on screen.', voteCount: 21 },
    { id: 't3', name: 'Vortex',  rationale: 'A force that pulls everything toward it.', voteCount: 18 },
    { id: 't4', name: 'Titan',   rationale: 'Bigger than the competition — mythological scale.', voteCount: 13 },
    { id: 't5', name: 'Storm',   rationale: 'Unpredictable and impossible to stop.', voteCount:  9 },
    { id: 't6', name: 'Bolt',    rationale: 'Lightning-fast reaction. One syllable, chantable.', voteCount:  7 },
  ],
  personal: [
    { id: 'p1', name: 'Luna',  rationale: 'Timeless, elegant, cross-cultural. Works at every life stage.', voteCount: 24 },
    { id: 'p2', name: 'Nova',  rationale: 'A bright new beginning — stellar energy with ancient roots.', voteCount: 20 },
    { id: 'p3', name: 'River', rationale: 'Calm, flowing, and full of life. Gender-neutral, ages well.', voteCount: 16 },
    { id: 'p4', name: 'Sage',  rationale: 'Wise and grounded. Professional at any age.', voteCount: 12 },
    { id: 'p5', name: 'Ember', rationale: 'Warm, glowing, sustained — not a blaze but a constant glow.', voteCount:  8 },
    { id: 'p6', name: 'Quinn', rationale: 'Strong, distinctive, and memorable across all contexts.', voteCount:  5 },
  ],
};

// ─── Core meta reader ────────────────────────────────────────────────────────

/**
 * Always returns correct journey context.
 * Priority: localStorage → URL hint (contestId) → defaults.
 */
// Default sub-segment per group (used when none is selected yet)
const GROUP_DEFAULT_SUB = {
  business: 'company-name',
  team: 'sports-team',
  personal: 'baby-name',
};

// Which subs belong to which group
const GROUP_SUBS = {
  business: ['company-name', 'product-name', 'project-name', 'rebrand', 'other-business'],
  team: ['sports-team', 'band-music', 'podcast-channel', 'civic-school-nonprofit', 'gaming-group', 'other-team'],
  personal: ['baby-name', 'pet-name', 'home-property-fun', 'other-personal'],
};

export function getJourneyMeta(contestIdHint = null) {
  const storedGroup = localStorage.getItem('selectedGroup');
  const group         = storedGroup
    || (contestIdHint ? DEMO_GROUP[contestIdHint] : null)
    || 'business';
  const storedSub     = localStorage.getItem('selectedSubSegment');
  // Validate sub belongs to current group — ignore stale mismatches
  const validSub      = storedSub && GROUP_SUBS[group]?.includes(storedSub) ? storedSub : null;
  const sub           = validSub || GROUP_DEFAULT_SUB[group] || 'company-name';
  const contestType   = localStorage.getItem('contestType')        || 'submission_voting';
  const transitionMode = localStorage.getItem('transitionMode')    || 'manual';
  const tier          = TIER[group] || TIER.business;

  // Show group only until sub-segment is explicitly selected and valid
  const journeyLabel = validSub
    ? `${tier.label} · ${SUB_LABELS[validSub] || validSub}`
    : tier.label;

  return {
    group,
    sub,
    contestType,
    transitionMode,
    hasGroup:     !!storedGroup,
    hasSub:       !!validSub,
    ...tier,
    subLabel:     SUB_LABELS[sub]                  || sub,
    typeLabel:    CONTEST_TYPE_LABELS[contestType] || 'Open Contest',
    contestTitle: MOCK_CONTEST_TITLES[sub]         || 'Naming Contest',
    candidates:   MOCK_CANDIDATES[sub] || MOCK_CANDIDATES[group] || MOCK_CANDIDATES.business,
    journeyLabel,
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
