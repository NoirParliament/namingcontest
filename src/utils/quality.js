// ─────────────────────────────────────────────────────────────────────────────
// quality.js  –  Double-sided Contest Quality Score system
//
// Creator side  (0–50): filled by completing brief fields + reading primer
// Participant side (0–50): filled by reading articles + earning naming points
//
// Each field always gives exactly FIELD_PTS points.
// Target: 8 fields per segment × 5 pts = 40 pts + 10 guides = 50 max.
// ─────────────────────────────────────────────────────────────────────────────

/** Fixed points awarded per completed brief field. Change here — updates everywhere. */
export const FIELD_PTS = 5;

/**
 * Fixed quality points per participant action.
 * Each point = 1 quality pt on the 0–50 bar (no ratio math).
 * Business: 5 brief + 5 map + 5 scratchpad + 3×(5 read + 10 quiz) = 60 → capped at 50.
 * Personal: 5 brief + 5 map + 5 scratchpad + N×5 tips.
 */
export const PARTICIPANT_ACTIONS = {
  brief:       5,   // read brief immersion card
  mindmap:     5,   // explore the mind map
  scratchpad:  5,   // use the scratch pad
  articleRead: 5,   // mark an article as read
  articleQuiz: 10,  // complete an article quiz (perfect score; partial = proportional)
  tip:         5,   // collect a fun fact / tip card
};

// ── Required brief field keys per group/subSegment ───────────────────────────
// Each segment targets 8 real form fields so 8 × FIELD_PTS = 40 pts from fields.
// Shorter segments (project-name, other-team) are limited by actual form fields.

export const FIELD_DEFS = {
  // Business
  'business/company-name':       ['companyDesc', 'namingStyle', 'targetAudience', 'geoScope', 'competitors', 'submissionLimit', 'votingMethod', 'deadline'],
  'business/product-name':       ['prodDesc', 'parentBrand', 'architecture', 'primaryUser', 'differentiator', 'competitors', 'submissionLimit', 'deadline'],
  'business/project-name':       ['projDesc', 'projDuration', 'projNameType', 'submissionLimit', 'votingMethod', 'deadline'],
  'business/rebrand':            ['currentName', 'rebrandReason', 'companyDesc', 'namingStyle', 'competitors', 'submissionLimit', 'votingMethod', 'deadline'],
  'business/other-business':     ['companyDesc', 'namingStyle', 'targetAudience', 'geoScope', 'competitors', 'submissionLimit', 'votingMethod', 'deadline'],
  // Team
  'team/sports-team':            ['sportLeague', 'ageGroup', 'personality', 'namingDirection', 'geography', 'teamColors', 'submissionLimit', 'deadline'],
  'team/band-music':             ['genre', 'originStory', 'nameStyle', 'nameType', 'searchability', 'submissionLimit', 'votingMethod', 'deadline'],
  'team/podcast-channel':        ['showDesc', 'platform', 'tone', 'compShows', 'submissionLimit', 'votingMethod', 'deadline'],
  'team/civic-school-nonprofit': ['orgType', 'mission', 'community', 'acronymPref', 'longevity', 'submissionLimit', 'votingMethod', 'deadline'],
  'team/gaming-group':           ['games', 'competitiveLevel', 'vibe', 'platform', 'tagStyle', 'crewHistory', 'submissionLimit', 'deadline'],
  'team/other-team':             ['groupDesc', 'vibe', 'history', 'submissionLimit', 'votingMethod', 'deadline'],
  // Personal
  'personal/baby-name':          ['dueDate', 'gender', 'lastName', 'heritage', 'lengthPref', 'nicknamePreference', 'traditions', 'avoidNames'],
  'personal/pet-name':           ['petType', 'breed', 'petPersonality', 'callNamePref', 'nameTone', 'avoidNames', 'submissionLimit', 'deadline'],
  'personal/home-property-fun':  ['namingTarget', 'propDesc', 'location', 'vibe', 'signDisplay', 'languagePref', 'avoidNames', 'submissionLimit'],
  // Generic fallback
  default:                       ['companyDesc', 'submissionLimit', 'votingMethod', 'deadline'],
};

/**
 * Returns the field key list for a given group + subSegment.
 * Falls back to `default` if not found — safe for any future variant.
 */
export function getFieldDefs(group, subSegment) {
  return FIELD_DEFS[`${group}/${subSegment}`] || FIELD_DEFS.default;
}

/** Human-readable labels for each brief field key */
export const FIELD_LABELS = {
  // Business
  companyDesc: 'Company description',
  namingStyle: 'Naming style',
  targetAudience: 'Target audience',
  geoScope: 'Geographic scope',
  competitors: 'Competitors',
  submissionLimit: 'Submission limit',
  votingMethod: 'Voting method',
  deadline: 'Deadline',
  prodDesc: 'Product description',
  parentBrand: 'Parent brand',
  architecture: 'Brand architecture',
  primaryUser: 'Primary user',
  differentiator: 'Differentiator',
  projDesc: 'Project description',
  projDuration: 'Duration',
  projNameType: 'Name type',
  currentName: 'Current name',
  rebrandReason: 'Rebrand reason',
  // Team
  sportLeague: 'Sport / league',
  ageGroup: 'Age group',
  personality: 'Personality',
  namingDirection: 'Naming direction',
  geography: 'Geography',
  teamColors: 'Team colors',
  genre: 'Genre',
  originStory: 'Origin story',
  nameStyle: 'Name style',
  nameType: 'Name type',
  searchability: 'Searchability',
  showDesc: 'Show description',
  platform: 'Platform',
  tone: 'Tone',
  compShows: 'Competing shows',
  orgType: 'Org type',
  mission: 'Mission',
  community: 'Community',
  acronymPref: 'Acronym pref.',
  longevity: 'Longevity',
  games: 'Games',
  competitiveLevel: 'Competitive level',
  vibe: 'Vibe',
  tagStyle: 'Tag style',
  crewHistory: 'Crew history',
  groupDesc: 'Group description',
  history: 'History',
  // Personal
  dueDate: 'Due date',
  gender: 'Gender',
  lastName: 'Last name',
  heritage: 'Heritage',
  lengthPref: 'Name length',
  nicknamePreference: 'Nickname pref.',
  traditions: 'Traditions',
  avoidNames: 'Avoid names',
  petType: 'Pet type',
  breed: 'Breed',
  petPersonality: 'Pet personality',
  callNamePref: 'Call name',
  nameTone: 'Name tone',
  namingTarget: 'Naming target',
  propDesc: 'Description',
  location: 'Location',
  signDisplay: 'Sign display',
  languagePref: 'Language pref.',
};

/**
 * Returns a boolean for each field key — true if the value is "filled".
 * Handles strings, numbers, and booleans correctly.
 */
export function isFilled(value) {
  if (value === undefined || value === null || value === '') return false;
  if (typeof value === 'boolean') return true; // toggle fields are always filled
  return true;
}

/**
 * Computes creator quality score (0–50).
 *
 * @param {object} briefData   - The form data object from BriefBuilder state
 * @param {string} group       - e.g. 'business'
 * @param {string} subSegment  - e.g. 'company-name'
 * @param {boolean} primerRead - Did the user read the naming guides (not skip)?
 *
 * Scoring:
 *   - Each required field = FIELD_PTS (fixed, same for every segment)
 *   - Field total capped at 40 pts
 *   - Reading the primer guides = 10 pts bonus
 *   - Max = 50
 */
export function computeCreatorScore(briefData, group, subSegment, primerRead) {
  const fields = getFieldDefs(group, subSegment);
  if (fields.length === 0) return primerRead ? 10 : 0;

  const filledCount = fields.filter(k => isFilled(briefData[k])).length;
  const fieldScore  = Math.min(40, filledCount * FIELD_PTS);
  const primerBonus = primerRead ? 10 : 0;

  return Math.min(50, fieldScore + primerBonus);
}

/**
 * Computes participant quality score (0–50).
 *
 * @param {number} articlesRead    - Number of articles completed
 * @param {number} totalArticles   - Total articles available
 * @param {number} pointsEarned    - Naming points earned so far
 * @param {number} maxPoints       - Maximum possible naming points
 *
 * Scoring: 25 pts from articles, 25 pts from naming points.
 * Auto-adapts to any article count or points total.
 */
/**
 * Computes participant quality score (0–50).
 * Each action gives a fixed number of pts via PARTICIPANT_ACTIONS.
 * Score = raw points earned, capped at 50. No ratio math.
 */
export function computeParticipantScore(pointsEarned) {
  return Math.min(50, Math.round(pointsEarned));
}

// ── Per-group localStorage persistence ───────────────────────────────────────

export function saveCreatorQuality(group, score) {
  localStorage.setItem(`creatorQuality_${group}`, String(score));
}

export function loadCreatorQuality(group) {
  return parseFloat(localStorage.getItem(`creatorQuality_${group}`) || '0');
}

export function saveParticipantQuality(group, score) {
  localStorage.setItem(`participantQuality_${group}`, String(score));
}

export function loadParticipantQuality(group) {
  return parseFloat(localStorage.getItem(`participantQuality_${group}`) || '0');
}

/** Combined score (0–100) */
export function loadTotalQuality(group) {
  return loadCreatorQuality(group) + loadParticipantQuality(group);
}

/** Human-readable quality label */
export function qualityLabel(total) {
  if (total >= 85) return 'Excellent';
  if (total >= 65) return 'Strong';
  if (total >= 45) return 'Good';
  if (total >= 25) return 'Fair';
  return 'Low';
}
