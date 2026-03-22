// ─────────────────────────────────────────────────────────────────────────────
// quality.js  –  Double-sided Contest Quality Score system
//
// Creator side  (0–50): filled by completing brief fields + reading primer
// Participant side (0–50): filled by reading articles + earning naming points
//
// FIELD_DEFS is the single place to add/remove required brief fields.
// The score auto-rescales — no weights to update, ever.
// ─────────────────────────────────────────────────────────────────────────────

// ── Required brief field keys per group/subSegment ───────────────────────────
// Only non-optional fields count. Add a key here when adding a required field
// to a form — the percentages rescale automatically.

export const FIELD_DEFS = {
  // Business
  'business/company-name':       ['companyDesc', 'namingStyle', 'competitors', 'submissionLimit', 'votingMethod', 'deadline'],
  'business/product-name':       ['prodDesc', 'parentBrand', 'architecture', 'competitors', 'submissionLimit', 'deadline'],
  'business/project-name':       ['projDesc', 'projDuration', 'projNameType', 'submissionLimit', 'deadline'],
  'business/rebrand':            ['currentName', 'rebrandReason', 'companyDesc', 'namingStyle', 'competitors', 'submissionLimit', 'votingMethod', 'deadline'],
  'business/other-business':     ['companyDesc', 'namingStyle', 'competitors', 'submissionLimit', 'votingMethod', 'deadline'],
  // Team
  'team/sports-team':            ['teamDesc', 'personality', 'submissionLimit'],
  'team/band-music':             ['genre', 'nameStyle', 'nameType', 'searchability', 'submissionLimit', 'deadline'],
  'team/podcast-channel':        ['showDesc', 'platform', 'tone', 'compShows', 'submissionLimit', 'deadline'],
  'team/civic-school-nonprofit': ['orgType', 'mission', 'community', 'acronymPref', 'longevity', 'submissionLimit', 'deadline'],
  'team/gaming-group':           ['games', 'competitiveLevel', 'vibe'],
  'team/other-team':             ['groupDesc', 'vibe', 'submissionLimit', 'deadline'],
  // Personal
  'personal/baby-name':          ['gender'],
  'personal/pet-name':           ['petType'],
  'personal/home-property-fun':  ['namingTarget', 'vibe'],
  // Generic fallback
  default:                       ['companyDesc', 'submissionLimit', 'deadline'],
};

/**
 * Returns the field key list for a given group + subSegment.
 * Falls back to `default` if not found — safe for any future variant.
 */
export function getFieldDefs(group, subSegment) {
  return FIELD_DEFS[`${group}/${subSegment}`] || FIELD_DEFS.default;
}

/**
 * Returns a boolean for each field key — true if the value is "filled".
 * Handles strings, numbers, and booleans correctly.
 */
function isFilled(value) {
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
 *   - Each required field = equal share of 40 pts
 *   - Reading the primer guides = 10 pts bonus
 *   - Max = 50
 *
 * Auto-adapts: adding/removing a key from FIELD_DEFS rescales automatically.
 */
export function computeCreatorScore(briefData, group, subSegment, primerRead) {
  const fields = getFieldDefs(group, subSegment);
  if (fields.length === 0) return primerRead ? 10 : 0;

  const filledCount = fields.filter(k => isFilled(briefData[k])).length;
  const fieldScore  = Math.round((filledCount / fields.length) * 40);
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
export function computeParticipantScore(articlesRead, totalArticles, pointsEarned, maxPoints) {
  const articleRatio = totalArticles > 0 ? articlesRead / totalArticles : 1;
  const pointsRatio  = maxPoints  > 0 ? Math.min(pointsEarned / maxPoints, 1) : 0;
  return Math.min(50, Math.round(articleRatio * 25 + pointsRatio * 25));
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
