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
  workingName: string; host: string; hostAnonymous: boolean; intro: string;
  items: Item[]; openExplore: boolean; openAvoid: boolean;
};

const ROLE_RULES: Record<string, string> = {
  fact: 'background fact, state it plainly in the about paragraph',
  direction: 'what the name should do, turn it into an instruction for participants',
  explore: 'something to lean toward',
  avoid: 'off-limits',
  exploreAvoid: 'contains both, split it into what to lean toward and what to avoid',
  reference: 'reference names, keep each name and the host\'s own reason; if the host wants to avoid sounding like some of them, say which',
  antiReference: 'names of other things the host dislikes or does not want to be mistaken for, with reasons; say what style to steer away from and why, never call them banned words',
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
    text: { type: 'string', description: 'One sentence.' },
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
        story: { type: 'string', description: 'The background told as a short story, 2 to 3 sentences, facts only, no advice.' },
        facts: {
          type: 'array',
          description: 'A fact sheet of 3 to 5 specifics a participant will check names against (a date, a surname, a middle name, a sibling, roots, a breed, an audience, a launch, a place). Only facts the host gave; an empty array when there are none.',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string', description: '1 to 3 words: "Due", "Surname", "Middle name", "Big brother", "Roots", "Launching", "Customers".' },
              value: { type: 'string', description: 'Short, copied from the answer: "March 14, 2027", "Kowalski", "Polish and Irish".' },
            },
            required: ['label', 'value'],
            additionalProperties: false,
          },
        },
      },
      required: ['story', 'facts'],
      additionalProperties: false,
    },
    aim: {
      type: 'object',
      description: 'What the name should do or feel like.',
      properties: {
        lead: { type: 'string', description: 'One sentence that captures the whole ask.' },
        points: { type: 'array', description: 'The criteria, 2 to 5 bold-lead points, one distinct thing each. Empty only when the host gave a single wish, which the lead then carries alone.', items: POINT },
      },
      required: ['lead', 'points'],
      additionalProperties: false,
    },
    directions: {
      type: 'object',
      description: 'What to lean toward, what to steer clear of, and the names the host mentioned.',
      properties: {
        explore: { type: 'array', description: 'Short lines, one direction each (a style, a feel, a theme, a source of inspiration). When the host left this open, one line saying nothing is ruled in and participants can range widely. Empty only when the material has nothing on it at all.', items: { type: 'string' } },
        avoid: { type: 'array', description: 'Short lines, one thing to steer clear of each: styles, feels, associations, trends. Hard disqualifiers belong in rules, not here. When the host left this open, one line saying nothing is off-limits. Empty when the material has nothing on it.', items: { type: 'string' } },
        names: {
          type: 'array',
          description: 'Each name the host mentioned (names they like, considered, or do not want to resemble), with what to make of it. Only names the host wrote; empty when there are none.',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'The name exactly as the host wrote it.' },
              note: { type: 'string', description: 'One sentence: the host\'s own reason and what participants should take from it.' },
            },
            required: ['name', 'note'],
            additionalProperties: false,
          },
        },
      },
      required: ['explore', 'avoid', 'names'],
      additionalProperties: false,
    },
    rules: {
      type: 'object',
      description: 'Hard rules that rule a name out.',
      properties: {
        points: { type: 'array', description: 'Bold-lead points, one rule each. Empty when the host gave no hard rules.', items: POINT },
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
3. Never suggest names yourself; participants supply the names. Names quoted from the host's answers are fine.
4. Constraint answers are a mixed bag; put each point where it belongs. A hard rule that rules a name out (a syllable limit, a domain that must be free, no family names, no names starting with a letter) goes in rules. A wish that shapes the names ("we'd love it to work in French") belongs in the aim or in explore. Context ("Anna's grandma is from Lyon") goes in the about part or with the wish it explains. Pleasantries and encouragement ("have fun with it!", "thanks everyone") are left out.

Shape (the app shows each part under a fixed heading, so never write headings or restate them):
5. about.story tells the background the way a friend would, 2 to 3 sentences: who the host is, what they are naming, the moment they are in. Never list fields ("The sibling name listed is Theo"); say "She will be a little sister to Theo". about.facts is the fact sheet beside it: 3 to 5 specifics with a short label and a short value, for things a participant will check a name against. The fact sheet carries the specifics; the story carries the people and the moment. The story may use a specific where the sentence needs it ("She will be a little sister to Theo"), but it never runs through the fact sheet, and it never talks around a fact to avoid naming it. Plain and true beats clever.
6. aim.lead is one sentence that captures the whole ask. aim.points are the criteria, 2 to 5 bold-lead points, one distinct thing each (length, familiarity, feel, how it pairs with a sibling or surname, how it travels across languages, what it should say to customers). Each label is a short instruction that answers the heading "What the name should do": a verb first, 2 to 5 words ("Keep it short", "Stay familiar but uncommon", "Pair well with Theo", "Travel across languages", "Earn trust fast"); never a bare noun phrase ("Two to three syllables" is wrong, "Keep it to two or three syllables" is right). The text then says how or why in one sentence. Use a different verb for each point. Criteria say what the name should do or feel like; the themes and sources to draw on (loons, canoe trips, Glasgow slang) belong under explore, not in a criterion.
7. directions.explore and directions.avoid are short lines, one idea each, no labels inside the line ("Lean toward:" is wrong). Explore holds styles, feels, themes and sources to draw on; avoid holds styles, feels, associations and trends to steer clear of. Hard disqualifiers go in rules, not in avoid. If everything the host asked to avoid is a hard rule, avoid stays empty; never invent a soft one to fill it. When the host left explore open, the explore list is one line only, saying nothing is ruled in and participants can range widely; when they left avoid open, the avoid list is one line saying nothing is off-limits. Never restate an aim criterion as a direction, in either form ("easy to spell" in the aim is not also "hard spellings" under avoid). directions.names lists the names the host mentioned with the host's own reason and what to take from it; names the host grouped under one reason share one entry ("Thunder, Blaze and Storm" with one note), and the openings vary (never a run of "Liked for", "Disliked as") ("They love it, but worry about the Lucifer association, so aim for that bright classic feel without the awkward link").
8. rules.points are the hard rules only, one bold-lead point each. Labels are instructions too, a verb first ("Skip K names", "Leave Barbara out", "Keep the .com free", "Stay under three syllables"), a different verb each time. Empty when there are none.
9. Never say the same thing in two parts. A fact lives in about, a wish in aim or explore, a name in names, a disqualifier in rules.

Voice:
10. Plain, warm and confident, in the register the framing line gives (warm and personal for a baby or a pet, energetic for a team, professional and concise for a business). The framing is for voice only; it is never a source of facts or requirements. Address participants as "you". Refer to the host by the name given, in the third person, and never write as the host: no "we", "us" or "our" for the host. Pronouns for the host: when the first name is clearly male or female (Matt, Emma), use he or she; when it could be either (Sam, Dana, Alex), or the host is a company, team or group, use the name or "they". People the host mentions keep the pronouns the host used for them. Follow the host's own spelling (British or American) and write in the language the host answered in.
11. The host's own note to participants is shown directly above your brief. Do not greet, do not repeat or paraphrase that note, and do not reuse what it says (if the note says they are stuck, the brief does not); start where it stops.
12. Under 280 words in total. No em dashes (the character "—"): use commas, colons or full stops. No stock endings ("however good it sounds", "out of the question"); say it once, plainly. No markdown, no emoji, and no brackets, placeholders or template text (never write "[first]" or "[name]").`;

function render(source: Source): string {
  const lines: string[] = [];
  lines.push(`Contest type: ${source.segment}.`);
  if (source.framing) lines.push(`Framing (voice only): ${source.framing}`);
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
  if (source.openExplore) lines.push('- [explore] The host gave nothing specific to explore (say so in a sentence where it fits).');
  if (source.openAvoid) lines.push('- [avoid] The host gave nothing to avoid (say so in a sentence where it fits).');
  return lines.join('\n');
}

// The no-em-dash rule, enforced after the fact as well as asked for. Spaced
// dashes become commas; tight ones (rare) become a comma and a space.
function stripDashes(s: string): string {
  return s.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',').replace(/\s+,/g, ',');
}

type Point = { label: string; text: string };
type Doc = {
  v: 6;
  about: { story: string; facts: { label: string; value: string }[] };
  aim: { lead: string; points: Point[] };
  directions: { explore: string[]; avoid: string[]; names: { name: string; note: string }[] };
  rules: { points: Point[] };
};

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
        .map((n) => ({ name: str(obj(n).name).replace(/[.:]$/, ''), note: str(obj(n).note) }))
        .filter((n) => n.name),
    },
    rules: { points: points(rules.points) },
  };
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
    // it spends money, so a per-IP cap. 20 an hour is far above honest use:
    // one brief per set of answers, cached in the browser.
    if (!await rateLimitOk(admin, req, 'compose-ip', 100, '1 hour')) {
      return json({ error: 'Too many briefs from here. Please try again in an hour.' }, 429);
    }

    const client = new Anthropic({ apiKey });
    const ask = async (extra?: string) => {
      const res = await client.beta.messages.create({
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
        messages: [{ role: 'user', content: render(source) + (extra ? `\n\n${extra}` : '') }],
      });
      if (res.stop_reason === 'refusal') throw new Error('refused');
      const text = res.content.find((b) => b.type === 'text');
      if (!text || text.type !== 'text') throw new Error('empty');
      console.log('[compose-brief]', source.subId, 'usage', JSON.stringify(res.usage));
      return cleanDoc(JSON.parse(text.text));
    };

    let doc = await ask();
    let flagged = unverifiedNames(doc, source);
    if (flagged.length) {
      // One rewrite with the offenders named; cheaper than shipping an
      // invented place name into a brief.
      console.warn('[compose-brief] unverified names, retrying once:', flagged.join(', '));
      doc = await ask(`Your previous draft used these words that the host never wrote: ${flagged.join(', ')}. Rewrite without them, using only the material above.`);
      flagged = unverifiedNames(doc, source);
    }

    return json({
      doc: { ...doc, generatedAt: new Date().toISOString(), model: MODEL, edited: false },
      ...(flagged.length ? { warnings: flagged } : {}),
    });
  } catch (e) {
    console.error('[compose-brief]', e);
    return json({ error: 'The brief could not be written right now.' }, 502);
  }
});
