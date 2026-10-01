// Edge Function: compose-brief
//
// Writes the participant-facing brief from the creator's answers. The app
// calls it once per set of answers from the review page (the result is cached
// by a hash of the answers, hand-edited by the creator, then frozen into
// contests.brief_doc at launch), so a contest costs one call, two on a retry.
//
// The app sends MATERIAL, not prose: every answered question tagged with a
// role (fact / direction / explore / avoid / reference / constraint) built by
// src/data/v4/briefRoles.js. The model's job is wording, not judgement: it
// may only say what the host said. The response is schema-constrained JSON
// (structured outputs), so the app never parses free text.
//
// Failure is never fatal for the creator: any error here returns a plain
// { error } and the review page falls back to the Q&A brief it always had.
//
// Secrets: ANTHROPIC_API_KEY (Supabase function secret, set in the
// dashboard). SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected.
import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { rateLimitOk } from '../_shared/rateLimit.ts';

const MODEL = 'claude-opus-5-5';
// Material sizes: ~12 answers of a few sentences each. Anything far beyond
// that is not a brief, it is someone using us as a free model.
const MAX_ITEMS = 40;
const MAX_SOURCE_CHARS = 12000;

// Abuse limits. The 3-update cap the creator sees lives in the browser,
// which anyone can reset, so the server enforces its own:
//   per draft  (a random id the page sends): first brief + 3 updates, with
//              slack for a retry, per day (rate_limit_hits is pruned daily)
//   per IP     per hour and per day
//   global     a daily ceiling across everyone, so no amount of IPs or
//              drafts can run up the bill; past it the review page shows
//              the answers, exactly as on any writer failure
// Cost is about 3 cents a brief, so the global ceiling caps a bad day at
// roughly GLOBAL_PER_DAY x $0.03. Keep a monthly spend limit on the
// Anthropic key as the last line.
const DRAFT_MAX = 6;
// TESTING: 100/h while Matt tests (2026-10-01). Production: 20 per hour.
const IP_PER_HOUR = 100;
const IP_PER_DAY = 200;
// 200 a day (Matt, 2026-10-01: start here, raise if real demand needs it).
const GLOBAL_PER_DAY = 200;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

type Item = { id: string; role: string; question: string; answer: string; note?: string };
type Source = {
  v: number; subId: string; segment: string; aboutTitle: string; thing: string; framing?: string;
  workingName: string; host: string; hostAnonymous: boolean; intro: string; shape?: string;
  items: Item[]; openExplore: boolean; openAvoid: boolean;
};

const ROLE_RULES: Record<string, string> = {
  fact: 'background fact, state it plainly in the about paragraph',
  direction: 'what the name should do, turn it into an instruction for participants',
  explore: 'something to lean toward',
  avoid: 'something to steer clear of, bans included ("no names starting with K"): one avoid line each, with the host\'s reason',
  exploreAvoid: 'contains both, split it into what to lean toward and what to avoid',
  reference: 'reference names, keep each name and the host\'s own reason; if the host wants to avoid sounding like some of them, say which',
  antiReference: 'things the host dislikes or does not want to be mistaken for, with reasons; each NAME goes in names as missed with the host\'s reason (not also an avoid line); a style or kind with no name ("anything that sounds like a tribute act") is one avoid line; never call them banned words',
  constraint: 'a mixed bag ("anything else"): put each point where it belongs, see rule 4',
};

// Output shape: the brief's four fixed parts. The app shows each under the
// category's own authored heading ("About the baby", "What the name should
// do", "Directions to explore and avoid", "Must-haves" / "Practical
// requirements"), so the writer never writes headings; it fills the parts.
// Each part has its own structure, the way a real creative brief does: a
// short story plus a fact sheet, a one-line aim plus criteria, lean-toward
// and steer-clear lists plus the names the host mentioned, and hard rules.
const POINT = {
  type: 'object',
  properties: {
    label: { type: 'string', description: 'A short instruction, verb first, 2 to 5 words, no trailing punctuation.' },
    text: { type: 'string', description: 'One or two sentences that carry the host\'s own detail and reason for this point (what they said and why it matters for the names). Only what the answers say; if the answer gives no detail, one short sentence.' },
  },
  required: ['label', 'text'],
  additionalProperties: false,
};
const SCHEMA = {
  type: 'object',
  properties: {
    about: {
      type: 'object',
      description: 'Background about the host and what is being named.',
      properties: {
        facts: {
          type: 'array',
          description: 'Written first. A fact sheet of 2 to 5 specifics a participant will check names against (a date, a surname, a middle name, a sibling, a breed, a place, a naming convention). Only facts the host gave; an empty array when there are none.',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: '1 to 3 words: "Due", "Surname", "Middle name", "Big brother", "Roots", "Launching", "Customers".' },
              value: { type: 'string', description: 'Short, 1 to 4 words, copied from the answer: "March 14, 2027", "Kowalski", "Polish and Irish".' },
            },
            required: ['label', 'value'],
            additionalProperties: false,
          },
        },
        story: { type: 'string', description: 'Written after the facts. The background as a short story, 2 to 3 sentences: the people, the thing and the moment. It contains none of the fact-sheet values.' },
      },
      required: ['facts', 'story'],
      additionalProperties: false,
    },
    aim: {
      type: 'object',
      description: 'What the name should do or feel like.',
      properties: {
        lead: { type: 'string', description: 'One short line (under 16 words) that sums up the ask in broad strokes. The specifics belong to the criteria, not the lead.' },
        points: { type: 'array', description: 'The criteria, 0 to 5 bold-lead points, one distinct thing each, only as many as the material supports.', items: POINT },
      },
      required: ['lead', 'points'],
      additionalProperties: false,
    },
    directions: {
      type: 'object',
      description: 'What to lean toward, what to steer clear of, and the names the host mentioned.',
      properties: {
        explore: { type: 'array', description: 'Short lines, one direction each (a style, a feel, a theme, a source of inspiration). Empty when the material has nothing on it (the app then shows this side as open).', items: { type: 'string' } },
        avoid: { type: 'array', description: 'Short lines, one thing to steer clear of each, with the host\'s reason where they gave one: bans ("Names starting with K, which clash with Kowalski"), names or words that are off the table ("Barbara, Anna\'s mother\'s name"), styles, feels, associations, trends. Empty when the host gave nothing to avoid (the app then says so).', items: { type: 'string' } },
        names: {
          type: 'array',
          description: 'Each name the host mentioned (names they like, considered, or do not want to resemble), with what to make of it. Only names the host wrote; empty when there are none.',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'The name exactly as the host wrote it.' },
              kind: { type: 'string', enum: ['liked', 'missed'], description: 'liked = the host likes it or it is still in the running (even with a worry); missed = disliked, rejected, taken, or a name to stand apart from.' },
              note: { type: 'string', description: 'One sentence: the host\'s own reason and what participants should take from it.' },
            },
            required: ['name', 'kind', 'note'],
            additionalProperties: false,
          },
        },
      },
      required: ['explore', 'avoid', 'names'],
      additionalProperties: false,
    },
    rules: {
      type: 'object',
      description: 'What every name must be or have: length limits, a free domain, a naming convention, easy to say on the phone, real words only. Never a ban on something (bans go in directions.avoid).',
      properties: {
        points: { type: 'array', description: 'Bold-lead points, one requirement each. Empty when the host gave none.', items: POINT },
      },
      required: ['points'],
      additionalProperties: false,
    },
  },
  required: ['about', 'aim', 'directions', 'rules'],
  additionalProperties: false,
};

const SYSTEM = `You write naming briefs for NamingContest.com. A host has answered questions about something they need to name. Their friends, family or colleagues will read your brief, then suggest names and vote. Turn the host's answers into a brief that reads well and that participants can act on.

Facts (strict):
1. Use only what the host wrote. Never invent facts, preferences, names, people, places or reasons. Every line must trace back to an answer. Copy names, places and people exactly as written. If an answer is thin, write less; never pad, never fill a list to make it look complete.
2. Every answer carries a role that says how it may be used: fact (background), direction (what the name should do or feel like), explore (lean toward), avoid (steer clear of), exploreAvoid (split into lean toward and steer clear of), reference (names the host likes or considered: keep each name and the host's own reason), antiReference (names of other things the host dislikes or does not want to be mistaken for: say what style to steer away from and why, never call them banned words), constraint (a mixed bag from "anything else" or practical requirements: see rule 4).
3. Never suggest names yourself; participants supply the names. Names quoted from the host's answers are fine. Never add colour, imagery, detail or explanation the host did not write: if they said "eagles and salmon", write eagles and salmon, not "salmon and their upstream fight"; if they said "rural", write rural, not "far from big hospitals".
4. Constraint answers are a mixed bag; put each point where it belongs. Something to stay away from (no family names, no names starting with a letter, nothing with "fest") goes in directions.avoid. A requirement every name must meet (a syllable limit, a domain that must be free, a naming convention) goes in rules. A wish that shapes the names ("we'd love it to work in French") belongs in the aim or in explore. Context ("Anna's grandma is from Lyon") goes in the about part or with the wish it explains. Pleasantries and encouragement ("have fun with it!", "thanks everyone") are left out.

Shape (the app shows each part under a fixed heading, so never write headings or restate them):
5. One home per point. Every point the host made lands in exactly one place in the brief. Before writing any line, check that the brief does not already say it somewhere else, in any words. Fact sheet, story, lead, criteria, directions, names and rules never repeat each other.
6. about.facts first: 2 to 5 specifics with a 1 to 3 word label and a 1 to 5 word value copied from the answers, the things a participant checks a name against. Then about.story: 2 to 3 sentences the way a friend would tell it (who the host is, what they are naming, the moment they are in), and it never covers a topic the fact sheet covers (if roots, looks or a breed are in the facts, the story does not mention them at all); one specific is fine only where a sentence cannot stand without it ("a little sister for Theo"), and then it stays out of the fact sheet. Fact labels only name what the value is ("Lives with", "Surname"); they never add a fact the host did not give ("Big sister" for a cat is an invention). Never list fields ("The sibling name listed is Theo"). Never talk around a fact to avoid naming it.
7. aim.lead is one short line in broad strokes. aim.points are the criteria, only as many as the material supports: one point per distinct thing the host asked for (length, familiarity, feel, how it sits with a surname or siblings, what it should say to customers, how it will be used). Never split one answer into several points or pad a list; when the host gave one or two directions, write one or two points, or none and let the lead carry them. Labels are short instructions, verb first, a different verb each ("Keep it short", "Pair well with Theo", "Earn trust fast"), never a bare noun phrase. The text is one or two sentences carrying the host's own detail and reason, and it must add something beyond the label: how the point applies, or why. When an answer is only a word or a pick with nothing more to say ("calm, dependable, quietly modern"), do not give it a point of its own that just restates it; fold it into the lead or into a neighbouring point. A criterion never repeats the lead's words, and never restates a direction line or a name's lesson: criteria say how the name should work or feel, directions say what to draw on.
8. directions.explore and directions.avoid come only from what the host explicitly offered to draw on or steer clear of (explore, avoid, references, local inspiration, quirks, interests, things the name should reflect, and themes or ideas named inside any other answer, such as "themes: roads, bridges, lanterns" in what the name should communicate): short lines of 3 to 12 words, one idea each, the host's own specifics, no labels inside a line. A lesson that comes from a name the host mentioned lives in that name's entry only, never also as a direction line or a criterion. directions.avoid holds everything the host said to stay away from, bans included, each with the host's reason; the participant reads it under the label "Steer clear of", so write each line as the thing itself ("Names starting with K, which clash with Kowalski"), not as an instruction. Never write a "nothing is ruled in" or "nothing is off-limits" line: when the host gave nothing for a side, leave that list empty and the app says so.
9. directions.names lists every name the host mentioned, each with kind (liked, or missed) and a one-sentence note: the host's own reason, then what to take from it only when the reason itself points somewhere concrete ("so steer away from telecom-style blends"). When it does not, the note is just the reason; never a vague tail like "it shows the feel they are after". Names the host grouped under one reason share one entry ("Thunder, Blaze and Storm"). Vary the openings.
10. rules.points are the requirements every name must meet (what it must be or have: a length limit, a free domain, a naming convention, easy to say on the phone), one bold-lead point each, verb-first labels, a different verb each. A ban on something is never a rule; it goes in avoid. A rule is never also a criterion or a direction, and a wish and its opposite never land in both ("Use real words" as a criterion and "Invented words" under avoid is one point said twice: keep it in one place). Empty when there are none.
11. Some answers are picks from a list, with our explanation of the option in brackets after the pick ("Silly (names with a little mischief in them...)"). That explanation describes the option; it is not the host's words. Never quote examples from it, and never present it as the host's view.

Voice:
12. Plain, warm and confident, in the register the framing line gives (warm and personal for a baby or a pet, energetic for a team, professional and concise for a business). The framing is for voice only; it is never a source of facts or requirements. Address participants as "you". Refer to the host by the name given, in the third person, and never write as the host: no "we", "us" or "our" for the host. Pronouns for the host: when the first name is clearly male or female (Matt, Emma), use he or she; when it could be either (Sam, Dana, Alex), or the host is a company, team or group, use the name or "they". People the host mentions keep the pronouns the host used for them. Follow the host's own spelling (British or American) and write in the language the host answered in.
13. The host's own note to participants is shown directly above your brief. Do not greet, do not repeat or paraphrase that note, and do not reuse what it says (if the note says they are stuck, the brief does not). The brief never talks about the search for the name itself (being stuck, looking for one they both love, hoping for help): the note already says that. Start where it stops.
14. Under 320 words in total. Use the room to carry every detail and reason the host gave; never to pad, repeat or add anything the answers do not say. No em dashes (the character "—"): use commas, colons or full stops. No stock endings ("however good it sounds", "out of the question"); say it once, plainly. No markdown, no emoji, and no brackets, placeholders or template text (never write "[first]" or "[name]").`;

// ── Line-by-line check ──────────────────────────────────────────────────
// A second read of the finished draft, one line at a time: each story
// sentence, pill, criterion, direction line, name note and rule is checked
// on its own against the material, which is far stricter than rereading the
// whole brief. Only failing lines come back, with their fix.
const CHECKER = `You are now checking a finished brief line by line against the host's material above. The lines are numbered below. Return a fix only for lines that fail one of these tests:
1. Supported: the line states nothing the material does not give. No number, age, date, place, person, feeling, image, reason, quality or interpretation the host did not write. "U12" does not say the players are eleven or twelve. "Rural" does not say "far from hospitals". A name the host only liked was not "chosen".
2. Grammar: no grammar, agreement or spelling errors.
3. Not filler: the line gives participants something they can use. A summing-up tail ("built around the communities it serves"), a line about the search for the name ("the last piece still to settle") or a line that only restates its own label is filler.
4. Not repeated: the line does not say again what another line already says, in any words, including the fact pills (a criterion "a floor lamp and a wall light follow next year" repeats the pill "Coming next: Floor lamp, wall light"), and does not repeat itself ("sounds like broadband, so avoid names that sound like broadband").
5. Reads well: clear and natural.
6. Adds something: a criterion's or rule's text must give a detail, reason or how that its label does not. Text that only rewords its own label ("Go direct or abstract" then "Either a direct or an abstract name works for Sam") fails: return an empty fixed text so the label stands alone.
To fix a line, change as little as possible: remove the unsupported or filler part, correct the grammar, cut the repeat, keep the host's own words. Never add information. Labels stay short (2 to 5 words; criteria and rules start with a verb). Return an empty fixed text to delete a line that is entirely filler or entirely repeated, except for name notes, rules and pill values, which are never deleted. Lines marked "known problem" have a problem found by code; fix it.`;

const CHECK_SCHEMA = {
  type: 'object',
  properties: {
    fixes: {
      type: 'array',
      description: 'Only the lines that fail a test. An empty array when every line passes.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The line id, e.g. "L7".' },
          problem: { type: 'string', description: 'Which test it fails, in a few words.' },
          fixed: { type: 'string', description: 'The corrected line, or an empty string to delete it.' },
        },
        required: ['id', 'problem', 'fixed'],
        additionalProperties: false,
      },
    },
  },
  required: ['fixes'],
  additionalProperties: false,
};

type Line = { id: string; kind: string; text: string; get: (d: Doc) => string; set: (d: Doc, v: string) => void; deletable: boolean };

// Every editable line of the doc, with how to read and write it back.
function briefLines(doc: Doc): Line[] {
  const out: Line[] = [];
  let n = 0;
  const add = (kind: string, text: string, set: (d: Doc, v: string) => void, deletable: boolean) => {
    if (!text) return;
    n += 1;
    out.push({ id: `L${n}`, kind, text, get: () => text, set, deletable });
  };
  splitSentences(doc.about.story).forEach((t, i) => add('story sentence', t, (d, v) => {
    const parts = splitSentences(d.about.story);
    parts[i] = v;
    d.about.story = parts.filter(Boolean).join(' ');
  }, true));
  doc.about.facts.forEach((f, i) => {
    add('fact pill label', f.label, (d, v) => { if (v) d.about.facts[i].label = v; }, false);
    add('fact pill value', f.value, (d, v) => { if (v) d.about.facts[i].value = v; }, false);
  });
  add('aim lead', doc.aim.lead, (d, v) => { d.aim.lead = v; }, false);
  doc.aim.points.forEach((pt, i) => {
    add('criterion label', pt.label, (d, v) => { if (v) d.aim.points[i].label = v; }, false);
    add('criterion text', pt.text, (d, v) => { d.aim.points[i].text = v; }, true);
  });
  doc.directions.explore.forEach((t, i) => add('lean toward line', t, (d, v) => { d.directions.explore[i] = v; }, true));
  doc.directions.avoid.forEach((t, i) => add('steer clear of line', t, (d, v) => { d.directions.avoid[i] = v; }, true));
  doc.directions.names.forEach((nm, i) => add(`note on the name "${nm.name}"`, nm.note, (d, v) => { if (v) d.directions.names[i].note = v; }, false));
  doc.rules.points.forEach((pt, i) => {
    add('rule label', pt.label, (d, v) => { if (v) d.rules.points[i].label = v; }, false);
    add('rule text', pt.text, (d, v) => { if (v) d.rules.points[i].text = v; }, false);
  });
  return out;
}

const FILLER_WORDS = new Set(['the', 'a', 'an', 'name', 'names', 'should', 'say', 'says', 'it', 'its', 'to', 'be', 'and', 'of', 'that', 'this', 'is', 'are', 'with', 'for', 'feel', 'feels', 'will', 'want', 'wants',
  'either', 'or', 'both', 'works', 'work', 'fine', 'good', 'welcome', 'aim', 'go', 'keep', 'make', 'try', 'use', 'any', 'can', 'could', 'would', 'there', 'their', 'they', 'them', 'he', 'she', 'his', 'her']);
function echoesLabel(label: string, text: string, host = ''): boolean {
  if (!label || !text) return false;
  const hostWords = host.toLowerCase().split(/\s+/).filter(Boolean);
  const words = (x: string) => x.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !FILLER_WORDS.has(w));
  const own = new Set([...words(label), ...hostWords]);
  return words(text).every((w) => own.has(w));
}

function splitSentences(t: string): string[] {
  return t ? t.split(/(?<=[.!?])\s+(?=[A-Z"“])/).map((x) => x.trim()).filter(Boolean) : [];
}

// Problems code can see for itself, handed to the checker as known.
const NUMBER_WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'hundred', 'dozen'];
function contentWords(x: string): string[] {
  return x.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !FILLER_WORDS.has(w));
}

function knownProblems(lines: Line[], source: Source, pills: { label: string; value: string }[]): Record<string, string> {
  const material = JSON.stringify(source).toLowerCase();
  const out: Record<string, string> = {};
  for (const l of lines) {
    const t = l.text.toLowerCase();
    const lineWords = new Set(contentWords(l.text));
    const issues: string[] = [];
    // Numbers: a digit run or a number word the material never contains.
    for (const m of t.match(/\d+/g) || []) if (!material.includes(m)) issues.push(`the number "${m}" is not in the material`);
    for (const w of NUMBER_WORDS) {
      if (new RegExp(`\\b${w}\\b`).test(t) && !new RegExp(`\\b${w}\\b`).test(material)) issues.push(`"${w}" is not in the material`);
    }
    // A line restating a fact pill (every content word of the pill value).
    if (!l.kind.startsWith('fact pill')) {
      for (const f of pills) {
        const want = contentWords(f.value);
        if (want.length >= 2 && want.every((w) => lineWords.has(w))) {
          issues.push(`repeats the fact pill "${f.label}: ${f.value}"`);
          break;
        }
      }
    }
    // A line repeating its own phrase (three words or more).
    const words = t.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    const seen = new Set<string>();
    for (let i = 0; i + 3 <= words.length; i++) {
      const g = words.slice(i, i + 3).join(' ');
      if (seen.has(g)) { issues.push(`repeats "${g}" within the line`); break; }
      seen.add(g);
    }
    if (issues.length) out[l.id] = issues.join('; ');
  }
  return out;
}

function render(source: Source): string {
  const lines: string[] = [];
  lines.push(`Contest type: ${source.segment}.`);
  if (source.framing) lines.push(`Framing (voice only): ${source.framing}`);
  if (source.shape) lines.push(`How this category's brief is laid out (where each answer goes, never a source of facts): ${source.shape}`);
  lines.push(`What is being named: ${source.thing}.`);
  // The contest name is a label the host typed for the contest ("Baby
  // Kowalski", "Our band"), not necessarily a name in use.
  if (source.workingName) lines.push(`Contest label: "${source.workingName}". This is what the host called the contest; do not present it as the thing's current or working name unless the answers say so.`);
  lines.push(`Host: ${source.host}${source.hostAnonymous ? ' (stays anonymous, so say "the host")' : ''}.`);
  if (source.intro) lines.push(`Host's own note to participants (already shown above the brief, do not repeat it):\n"${source.intro}"`);
  lines.push('', 'Material, in document order. Format: [role] question: answer (note = what this means for the names).');
  for (const it of source.items) {
    const rule = ROLE_RULES[it.role] ? ` {${ROLE_RULES[it.role]}}` : '';
    lines.push(`- [${it.role}]${rule} ${it.question}: ${it.answer}${it.note ? ` (note: ${it.note})` : ''}`);
  }
  return lines.join('\n');
}

// The no-em-dash rule, enforced after the fact as well as asked for. Spaced
// dashes become commas; tight ones (rare) become a comma and a space.
function stripDashes(s: string): string {
  return s.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',').replace(/\s+,/g, ',');
}

type Point = { label: string; text: string };
type Name = { name: string; kind: 'liked' | 'missed'; note: string };
type Doc = {
  v: 6;
  about: { story: string; facts: { label: string; value: string }[] };
  aim: { lead: string; points: Point[] };
  directions: { explore: string[]; avoid: string[]; names: Name[] };
  rules: { points: Point[] };
};

// One home per fact: a pill whose value the story already says is dropped
// (the writer is told the same; this catches the misses).
function dropRepeatedFacts(doc: Doc): Doc {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const story = ` ${norm(doc.about.story)} `;
  return {
    ...doc,
    about: { ...doc.about, facts: doc.about.facts.filter((f) => !story.includes(` ${norm(f.value)} `)) },
  };
}

function cleanDoc(raw: Record<string, unknown>): Doc {
  const str = (v: unknown) => stripDashes(String(v ?? '')).replace(/\s*\n\s*/g, ' ').trim();
  const obj = (v: unknown) => (v && typeof v === 'object' ? v as Record<string, unknown> : {});
  const arr = (v: unknown) => (Array.isArray(v) ? v as unknown[] : []);
  const points = (v: unknown): Point[] => arr(v)
    .map((pt) => ({ label: str(obj(pt).label).replace(/[.:]$/, ''), text: str(obj(pt).text) }))
    .filter((pt) => pt.text);
  const lines = (v: unknown) => arr(v).map(str).filter(Boolean);
  const about = obj(raw.about), aim = obj(raw.aim), dir = obj(raw.directions), rules = obj(raw.rules);
  return {
    v: 6,
    about: {
      story: str(about.story),
      facts: arr(about.facts)
        .map((f) => ({ label: str(obj(f).label).replace(/[.:]$/, ''), value: str(obj(f).value).replace(/\.$/, '') }))
        .filter((f) => f.label && f.value),
    },
    aim: { lead: str(aim.lead), points: points(aim.points) },
    directions: {
      explore: lines(dir.explore),
      avoid: lines(dir.avoid),
      names: arr(dir.names)
        .map((n) => ({ name: str(obj(n).name).replace(/[.:]$/, ''), kind: (obj(n).kind === 'missed' ? 'missed' : 'liked') as Name['kind'], note: str(obj(n).note) }))
        .filter((n) => n.name),
    },
    rules: { points: points(rules.points) },
  };
}

// Completeness check: a part of the material the draft left out entirely
// (the host named names, or gave things to avoid, and none of it shows up).
// Reported back to the writer for one rewrite, like an invented name.
function missingParts(doc: Doc, source: Source): string[] {
  const has = (...roles: string[]) => source.items.some((i) => roles.includes(i.role));
  const out: string[] = [];
  if (has('reference', 'antiReference') && doc.directions.names.length === 0) {
    out.push('the names the host mentioned (list every one in names, liked or missed, with the host\'s reason)');
  }
  if (has('avoid') && doc.directions.avoid.length === 0) {
    out.push('what the host asked to avoid (every item belongs in directions.avoid, bans included)');
  }
  if (has('explore', 'exploreAvoid') && doc.directions.explore.length === 0) {
    out.push('what the host asked participants to explore');
  }
  return out;
}

// Echo check: the story or lead repeating the host's note, which sits right
// above the brief. Pronouns are folded (the note says "we", the brief
// "they") and phrases that also appear in the answers are allowed (those
// are facts, not echoes). Any shared run of three words is an echo.
function noteEcho(doc: Doc, source: Source): string[] {
  if (!source.intro) return [];
  const PRON = new Set(['we', 'they', 'i', 'he', 'she', 'our', 'their', 'my', 'his', 'her', 'us', 'them', 'me', 'him', 'you', 'your']);
  const words = (t: string) => t.toLowerCase().replace(/[’']/g, '').split(/[^a-z0-9]+/).filter(Boolean).map((w) => (PRON.has(w) ? '_' : w));
  const grams = (t: string) => {
    const w = words(t);
    const out = new Set<string>();
    for (let i = 0; i + 3 <= w.length; i++) {
      const g = w.slice(i, i + 3);
      if (g.filter((x) => x !== '_').length >= 2) out.add(g.join(' '));
    }
    return out;
  };
  const note = grams(source.intro);
  const material = grams(source.items.map((i) => i.answer).join(' . '));
  const hits = [...grams(`${doc.about.story} . ${doc.aim.lead}`)].filter((g) => note.has(g) && !material.has(g));
  return hits.length ? [source.intro] : [];
}

// Fidelity check: a capitalised word inside a sentence that appears nowhere
// in the material is most likely an invented name or place. Sentence-initial
// words are skipped (they are capitalised for grammar, not because they are
// names). Reported, not blocked: the creator reads the brief before launch.
function unverifiedNames(doc: Doc, source: Source): string[] {
  const material = JSON.stringify(source).toLowerCase();
  const text = [
    doc.about.story,
    ...doc.about.facts.map((f) => `${f.label}: ${f.value}`),
    doc.aim.lead,
    ...doc.aim.points.map((pt) => `${pt.label}. ${pt.text}`),
    ...doc.directions.explore,
    ...doc.directions.avoid,
    ...doc.directions.names.map((n) => `${n.name}. ${n.note}`),
    ...doc.rules.points.map((pt) => `${pt.label}. ${pt.text}`),
  ]    .join('\n');
  const out = new Set<string>();
  for (const sentence of text.split(/(?<=[.!?:])\s+|\n/)) {
    const words = sentence.trim().split(/\s+/);
    words.slice(1).forEach((w) => {
      // Strip quotes, trailing punctuation and a possessive ("Dana's" is Dana).
      const clean = w.replace(/^[("'“‘]+|[)"'”’.,;:!?]+$/g, '').replace(/['’]s$/i, '');
      if (/^[A-Z][a-zA-Z'’-]{2,}$/.test(clean) && !material.includes(clean.toLowerCase())) out.add(clean);
    });
  }
  return [...out];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return json({ error: 'Brief writer is not configured.' }, 503);

    const body = await req.json().catch(() => null);
    const source = body?.source as Source | undefined;
    if (!source || typeof source !== 'object' || !Array.isArray(source.items)) {
      return json({ error: 'Missing brief material.' }, 400);
    }
    if (source.items.length > MAX_ITEMS || JSON.stringify(source).length > MAX_SOURCE_CHARS) {
      return json({ error: 'Brief material is too long.' }, 413);
    }
    for (const it of source.items) {
      if (typeof it?.question !== 'string' || typeof it?.answer !== 'string') {
        return json({ error: 'Brief material is malformed.' }, 400);
      }
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    // Unauthenticated (guests write briefs before they have an account) and
    // it spends money: see the limits at the top. Checked cheapest-to-hit
    // first, so a caller over one limit does not use up the others.
    if (!await rateLimitOk(admin, req, 'compose-ip', IP_PER_HOUR, '1 hour')) {
      return json({ error: 'Too many briefs from here. Please try again in an hour.', code: 'ip-hour' }, 429);
    }
    if (!await rateLimitOk(admin, req, 'compose-ip-day', IP_PER_DAY, '1 day')) {
      return json({ error: 'Too many briefs from here today. Please try again tomorrow.', code: 'ip-day' }, 429);
    }
    const draftId = typeof body?.draftId === 'string' && /^[A-Za-z0-9-]{8,64}$/.test(body.draftId) ? body.draftId : null;
    if (draftId && !await rateLimitOk(admin, req, 'compose-draft', DRAFT_MAX, '1 day', draftId, false)) {
      return json({ error: 'This brief has used all its updates.', code: 'draft' }, 429);
    }
    if (!await rateLimitOk(admin, req, 'compose-global', GLOBAL_PER_DAY, '1 day', 'all')) {
      console.error('[compose-brief] global daily ceiling reached');
      return json({ error: 'The brief writer is resting. Your answers are shown as they are.', code: 'global' }, 503);
    }

    const client = new Anthropic({ apiKey });
    // Live mode: events go to the page as they happen; plain mode ignores them.
    const live = body?.stream === true;
    type Emit = (e: Record<string, unknown>) => void;
    const ask = async (extra?: string, emit?: Emit) => {
      const params = {
        model: MODEL,
        max_tokens: 4000,
        // The job is wording, not reasoning: low effort reads the same and
        // keeps the wait on the review page short (medium took 25s).
        output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
        // Safety classifiers can decline on rare phrasings; the fallback
        // re-runs the same request on another model inside this call.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: SYSTEM,
        messages: [{ role: 'user' as const, content: render(source) + (extra ? `\n\n${extra}` : '') }],
      };
      let res;
      if (emit) {
        // The draft streams to the page as it is written, a few times a
        // second (the page rebuilds the brief from the partial JSON).
        let acc = '';
        let sent = 0;
        try {
          const stream = client.beta.messages.stream(params);
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              acc += event.delta.text;
              if (Date.now() - sent > 120) { sent = Date.now(); emit({ type: 'draft', text: acc }); }
            }
          }
          res = await stream.finalMessage();
        } catch (e) {
          if (acc) throw e;
          console.warn('[compose-brief] stream failed before any text, plain call instead:', String(e));
          res = await client.beta.messages.create(params);
        }
      } else {
        res = await client.beta.messages.create(params);
      }
      if (res.stop_reason === 'refusal') throw new Error('refused');
      const text = res.content.find((b) => b.type === 'text');
      if (!text || text.type !== 'text') throw new Error('empty');
      console.log('[compose-brief]', source.subId, 'usage', JSON.stringify(res.usage));
      return dropRepeatedFacts(cleanDoc(JSON.parse(text.text)));
    };

    // The line-by-line check: the same model and rules, one line at a time.
    const verify = async (draft: Doc): Promise<Doc> => {
      const lines = briefLines(draft);
      const known = knownProblems(lines, source, draft.about.facts);
      const listing = lines.map((l) => `${l.id} [${l.kind}]${known[l.id] ? ` (known problem: ${known[l.id]})` : ''}: ${l.text}`).join('\n');
      const res = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 4000,
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: CHECK_SCHEMA } },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: SYSTEM,
        messages: [{ role: 'user', content: `${render(source)}\n\n${CHECKER}\n\nLines:\n${listing}` }],
      });
      if (res.stop_reason === 'refusal') throw new Error('refused');
      const text = res.content.find((b) => b.type === 'text');
      if (!text || text.type !== 'text') throw new Error('empty');
      const { fixes } = JSON.parse(text.text) as { fixes: { id: string; problem: string; fixed: string }[] };
      console.log('[compose-brief]', source.subId, 'check usage', JSON.stringify(res.usage), 'fixes', JSON.stringify(fixes));
      // Apply from a fresh copy; lines are addressed by their position in
      // the draft, so later lines are written before earlier story ones.
      const next: Doc = JSON.parse(JSON.stringify(draft));
      const byId = new Map(lines.map((l) => [l.id, l]));
      for (const f of [...fixes].reverse()) {
        const line = byId.get(f.id);
        if (!line) continue;
        const v = stripDashes(String(f.fixed || '')).replace(/\s*\n\s*/g, ' ').trim();
        if (!v && !line.deletable) continue;
        line.set(next, v);
      }
      // A criterion or rule whose text only echoes its own label keeps the
      // label alone ("Convey care that comes to you", "Keep to two syllables
      // or fewer"), never the echo.
      next.aim.points = next.aim.points
        .map((pt) => (echoesLabel(pt.label, pt.text, source.host) ? { ...pt, text: '' } : pt))
        .filter((pt) => pt.text || pt.label);
      next.rules.points = next.rules.points
        .map((pt) => (echoesLabel(pt.label, pt.text, source.host) ? { ...pt, text: '' } : pt));
      next.directions.explore = next.directions.explore.filter(Boolean);
      next.directions.avoid = next.directions.avoid.filter(Boolean);
      return dropRepeatedFacts(next);
    };

    const produce = async (emit?: Emit) => {
    emit?.({ type: 'stage', stage: 'drafting' });
    let doc = await ask(undefined, emit);
    let flagged = unverifiedNames(doc, source);
    const missing = missingParts(doc, source);
    const echo = noteEcho(doc, source);
    if (flagged.length || missing.length || echo.length) {
      // One rewrite with the problems named; cheaper than shipping an
      // invented place name, or a brief that drops the host's names.
      console.warn('[compose-brief] retrying once:', JSON.stringify({ flagged, missing, echo: echo.length > 0 }));
      const notes = [
        flagged.length ? `Your previous draft used these words that the host never wrote: ${flagged.join(', ')}. Leave them out.` : '',
        missing.length ? `Your previous draft left out ${missing.join('; and ')}. Include it.` : '',
        echo.length ? 'Your previous story or lead repeated the host\'s own note, which participants read right above the brief. Say none of what the note says, and nothing about the search for the name; start where the note stops.' : '',
      ].filter(Boolean).join(' ');
      emit?.({ type: 'stage', stage: 'redrafting' });
      doc = await ask(`${notes} Rewrite the whole brief using only the material above.`, emit);
      flagged = unverifiedNames(doc, source);
    }
    emit?.({ type: 'stage', stage: 'checking', draft: doc });

    // Line-by-line check. Kept only if it lost no name or part and brought
    // in no word the host never wrote; otherwise the draft stands.
    try {
      const checked = await verify(doc);
      const namesKept = checked.directions.names.length === doc.directions.names.length;
      const rulesKept = checked.rules.points.length === doc.rules.points.length;
      const partsKept = missingParts(checked, source).length <= missingParts(doc, source).length;
      const noNewWords = unverifiedNames(checked, source).every((w) => flagged.includes(w));
      if (namesKept && rulesKept && partsKept && noNewWords) doc = checked;
      else console.warn('[compose-brief] check result rejected:', JSON.stringify({ namesKept, rulesKept, partsKept, noNewWords }));
    } catch (e) {
      console.warn('[compose-brief] check failed, keeping the draft:', String(e));
    }

    return {
      doc: { ...doc, generatedAt: new Date().toISOString(), model: MODEL, edited: false },
      ...(flagged.length ? { warnings: flagged } : {}),
    };
    };

    if (!live) return json(await produce());

    // Live: Server-Sent Events, one JSON object per event.
    const enc = new TextEncoder();
    const streamBody = new ReadableStream({
      async start(controller) {
        const send: Emit = (e) => controller.enqueue(enc.encode(`data: ${JSON.stringify(e)}\n\n`));
        try {
          const out = await produce(send);
          send({ type: 'done', ...out });
        } catch (e) {
          console.error('[compose-brief] live', e);
          send({ type: 'error', error: 'The brief could not be written right now.' });
        }
        controller.close();
      },
    });
    return new Response(streamBody, {
      headers: { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  } catch (e) {
    console.error('[compose-brief]', e);
    return json({ error: 'The brief could not be written right now.' }, 502);
  }
});
