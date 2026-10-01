// The composed brief: how the creator's answers become a brief participants
// can act on.
//
// Mark (2026-09-28): the brief "presents like a summary of the contest
// owner's responses to questions"; he wants the questions gone and replaced
// with instructions written from the answers, like an actual brief. Maria
// (2026-08-19) wanted it beefier, in parts: background, what the name should
// do, explore and avoid, notes.
//
// The model is only ever handed material, never a free hand: every answered
// question is sent tagged with a ROLE that says how it may be used. The role
// is the formula. The section map (BRIEF_SECTIONS) still decides the headings;
// the role decides whether an answer becomes a background fact, an
// instruction, something to lean toward, something off-limits, a reference
// name with the host's reason, or a hard requirement.

import { getBriefSections, getParticipantLabel, getParticipantNote, getExpansion } from './briefExpansions';
import { formatDateAnswer } from '../../utils/v4Brief';

// Role per question id. Shared ids mean the same thing in every segment, so
// one flat table; the two segment-specific collisions are noted inline.
const ROLE_BY_ID = {
  // fact: background. Facts only, never advice.
  projectSummary: 'fact', namingTarget: 'fact', purpose: 'fact', newOrReplacing: 'fact',
  dueDate: 'fact', gender: 'fact', lastName: 'fact', siblingNames: 'fact', heritage: 'fact',
  petType: 'fact', origin: 'fact', sexAge: 'fact', breed: 'fact', petPersonality: 'fact', otherPets: 'fact',
  based: 'fact', teamColors: 'fact', originStory: 'fact', localConnection: 'fact', personalityWords: 'fact',
  brandFamily: 'fact', productLine: 'fact', namingConventions: 'fact', pairedWithCompany: 'fact',
  // b4 rebrand + b3 project (retired cards, old contests still render)
  currentName: 'fact', rebrandReason: 'fact', companyDesc: 'fact', projDesc: 'fact', projDuration: 'fact',
  orgType: 'fact', story: 'fact', showDesc: 'fact', propDesc: 'fact', location: 'fact',
  // direction: what the name should do. Becomes imperative instructions.
  audience: 'direction', lengthPref: 'direction', familiarity: 'direction', personalityPath: 'direction',
  nameTone: 'direction', quirks: 'direction', interests: 'direction', personality: 'direction',
  nameCommunicate: 'direction', brandPersonality: 'direction', nameStyles: 'direction',
  descriptiveEvocative: 'direction', otherLanguages: 'direction', featuresBenefits: 'direction',
  nameUsage: 'direction', vibe: 'direction', feeling: 'direction', nameTypes: 'direction', reflect: 'direction',
  localInspiration: 'direction', references: 'direction', namingStyle: 'direction', targetAudience: 'direction',
  projNameType: 'direction', namingDirection: 'direction', tone: 'direction',
  // explore / avoid / both
  exploreDirections: 'explore',
  avoidDirections: 'avoid', avoidNames: 'avoid', confusedWith: 'avoid', dislikedNames: 'avoid',
  terribleNames: 'avoid', competitors: 'avoid',
  includeAvoid: 'exploreAvoid', keepOrLeave: 'exploreAvoid',
  // reference: names with the host's reason, kept verbatim (shortlist and
  // watchouts in Mark's example: "Lucy, but worried about Lucifer").
  admiredNames: 'reference', namesConsidered: 'reference', similarAdmired: 'reference',
  leagueNames: 'reference', compShows: 'reference',
  // constraint: hard requirements, a name that fails these is out.
  practicalReqs: 'constraint', customRequirements: 'constraint', languagePref: 'constraint',
  signDisplay: 'constraint',
};

// Unmapped ids (a question added later) become facts, so nothing a creator
// wrote is ever dropped on the floor; the worst case is a fact that reads a
// little flat.
export function roleFor(questionId) {
  return ROLE_BY_ID[questionId] || 'fact';
}

function answered(v) {
  if (v === undefined || v === null || v === '') return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object' && 'enabled' in v) return !!v.enabled && !!(v.text || v.name);
  return true;
}

// One plain string per answer. Chip picks that carry an authored expansion
// get it inline ("Rare: a name few people are likely to share"), which is the
// same wording the Q&A card shows, so the model and the fallback agree.
function answerText(q, value, subId) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (typeof value === 'object' && !Array.isArray(value) && value) {
    if ('enabled' in value) return value.text || value.name || 'Yes';
    return JSON.stringify(value);
  }
  const list = Array.isArray(value) ? value : [value];
  return list
    .map((v) => {
      const s = q.type === 'date' ? formatDateAnswer(v) : String(v);
      const exp = typeof v === 'string' ? getExpansion(q.id, v, subId) : null;
      return exp ? `${s} (${exp})` : s;
    })
    .join('; ');
}

// The material for one brief. Pure data, no prose: the edge function turns it
// into the prompt, and the same object is hashed so a brief is written once
// per set of answers.
export function buildBriefSource({ subId, segmentLabel, questions, answers, settings, workingName, hostName, hostAnonymous }) {
  const sections = getBriefSections(subId, questions) || [{ title: 'About it', items: questions }];
  const aboutTitle = sections[0]?.title || 'About it';
  const items = [];
  const seen = new Set();
  // Section order, then question order inside a section: the model reads the
  // material in the order the document will use it.
  sections.forEach((sec) => {
    sec.items.forEach((q) => {
      if (q.id === 'intro' || seen.has(q.id)) return;
      seen.add(q.id);
      const value = answers[q.id];
      if (!answered(value)) return;
      const note = getParticipantNote(q.id, subId);
      items.push({
        id: q.id,
        role: roleFor(q.id),
        question: getParticipantLabel(q, subId),
        answer: answerText(q, value, subId),
        ...(note ? { note } : {}),
      });
    });
  });
  // customRequirements lives in the brief since 2026-08-17 but older drafts
  // kept it in settings; same fallback the Q&A card uses.
  if (!seen.has('customRequirements') && answered(settings?.customRequirements)) {
    items.push({
      id: 'customRequirements', role: 'constraint',
      question: 'Anything else from the host?',
      answer: answerText({ id: 'customRequirements', type: 'toggleTextarea' }, settings.customRequirements, subId),
    });
  }
  const has = (role) => items.some((i) => i.role === role || i.role === 'exploreAvoid');
  return {
    v: 1,
    subId,
    segment: segmentLabel || subId,
    aboutTitle,
    thing: aboutTitle.replace(/^About\s+/i, '') || 'it',
    workingName: workingName || '',
    host: hostAnonymous ? 'the host' : (hostName || 'the host'),
    hostAnonymous: !!hostAnonymous,
    intro: answers.intro || '',
    items,
    // Mark's example writes "Open" when nothing was given, so participants
    // know there are no restrictions rather than wondering.
    openExplore: !has('explore'),
    openAvoid: !has('avoid'),
  };
}

// Stable hash of the material (not the intro, which never changes the brief,
// and not the host name, which only changes the wording). Same answers, same
// hash, no second call. FNV-1a over the JSON is plenty for a cache key.
export function briefSourceHash(source) {
  const { intro, host, hostAnonymous, ...rest } = source;
  void intro; void host; void hostAnonymous;
  const s = JSON.stringify(rest);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0') + s.length.toString(16);
}

// Section titles and icons the composed brief renders under, taken from the
// segment's own map so the headings match the Q&A card it replaces.
export function composedSectionMeta(subId, questions) {
  const sections = getBriefSections(subId, questions) || [];
  const find = (re) => sections.find((s) => re.test(s.title));
  return {
    about: { title: sections[0]?.title || 'About it', icon: sections[0]?.icon || 'Sparkle' },
    shouldDo: { title: 'What the name should do', icon: find(/should do/i)?.icon || 'Target' },
    exploreAvoid: { title: 'Explore and avoid', icon: find(/explore/i)?.icon || 'Compass' },
    constraints: { title: 'Practical requirements', icon: find(/practical/i)?.icon || 'ListChecks' },
  };
}
