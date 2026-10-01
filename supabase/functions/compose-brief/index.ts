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
  antiReference: 'names of other things the host dislikes or does not want to be mistaken for, with reasons; say what style to steer away from, never call them banned words',
  constraint: 'hard requirement, a name that fails it is out',
};

// Output shape. Fixed sections, so the app renders it with the same section
// heads as the Q&A card, and the creator edits text in known slots.
const SCHEMA = {
  type: 'object',
  properties: {
    about: { type: 'string', description: 'One paragraph of background, 2 to 4 sentences, facts only.' },
    shouldDo: {
      type: 'array',
      description: '3 to 6 instructions for participants.',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string', description: '2 to 4 words, no trailing punctuation.' },
          text: { type: 'string', description: 'One sentence addressed to participants.' },
        },
        required: ['label', 'text'],
        additionalProperties: false,
      },
    },
    directions: {
      type: 'string',
      description: 'One paragraph, 2 to 5 sentences, addressed to participants: what to lean toward, what is off-limits, and each reference name with the host\'s own reason. Prose, no labels, no lists.',
    },
    constraints: { type: 'array', items: { type: 'string' }, description: 'Hard requirements as full sentences, only from constraint answers. Empty when there are none.' },
  },
  required: ['about', 'shouldDo', 'directions', 'constraints'],
  additionalProperties: false,
};

const SYSTEM = `You write naming briefs for NamingContest.com. A host has answered questions about something they need to name. Their friends, family or colleagues will read your brief, then suggest names and vote. Turn the host's answers into a brief those participants can act on.

Rules:
1. Use only what the host wrote. Never invent facts, preferences, names, people or reasons. Every sentence must trace back to an answer. Copy names, places and people exactly as written. If an answer is thin, write less; never pad.
2. Every answer carries a role that says how it may be used: fact (background, state it plainly), direction (turn it into an instruction for participants), explore (lean toward), avoid (off-limits), exploreAvoid (split into lean toward and avoid), reference (keep the name and the host's own reason), antiReference (names of other things the host dislikes: say what style to steer away from and why, in the directions paragraph), constraint (hard requirement, a name that fails it is out).
3. Voice: plain and confident, like a good creative brief, in the register the framing line gives (warm and personal for a baby or a pet, energetic for a team, professional and concise for a business). The framing is for voice only; it is never a source of requirements. Address participants as "you". Pronouns for the host: when the host's first name is clearly male or female (Matt, Emma), use he or she; when it could be either (Sam, Dana, Alex), or the host is a company, team or group, use the name or "they". If the host's answers say how they refer to themselves, that wins. People the host mentions keep the pronouns the host used for them. Refer to the host by the name given, in the third person. Follow the host's own spelling (British or American) and write in the language the host answered in.
4. The host's own note to participants is shown directly above your brief. Do not greet, do not repeat or paraphrase that note; start where it stops.
5. about: 2 to 4 sentences of background written as flowing prose about the host and what they are naming, facts only, no advice. Never list fields ("The sibling name listed is Theo"); say it the way a friend would ("She will be a little sister to Theo"). shouldDo: 3 to 6 items, each a short label plus one instruction sentence. directions: one paragraph of prose, 2 to 5 sentences, that tells participants what to lean toward, what is off-limits, and what to make of each reference name the host mentioned (keep the host's reason, e.g. "They love Lucy but worry about the Lucifer association, so aim for that feel without the awkward link"). When the host left both open and named no names, the paragraph is one sentence saying nothing is ruled in or out and they should explore freely within the brief above. Never write labels like "Lean toward:" inside it; write sentences. constraints: full sentences, only from constraint answers, otherwise an empty array.
6. Never suggest names yourself; the brief describes what to aim for, participants supply the names. Names quoted from the host's answers are fine.
7. Under 300 words in total. No em dashes (the character "—"): use commas, colons or full stops. No markdown, no emoji, no headings or labels inside the strings.`;

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
  if (source.openExplore) lines.push('- [explore] The host gave nothing specific to explore (say so in the directions paragraph).');
  if (source.openAvoid) lines.push('- [avoid] The host gave nothing to avoid (say so in the directions paragraph).');
  return lines.join('\n');
}

// The no-em-dash rule, enforced after the fact as well as asked for. Spaced
// dashes become commas; tight ones (rare) become a comma and a space.
function stripDashes(s: string): string {
  return s.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',').replace(/\s+,/g, ',');
}

function cleanDoc(doc: Record<string, unknown>) {
  const str = (v: unknown) => stripDashes(String(v ?? '')).trim();
  const list = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : []);
  return {
    about: str(doc.about),
    shouldDo: Array.isArray(doc.shouldDo)
      ? doc.shouldDo.map((b: Record<string, unknown>) => ({ label: str(b?.label).replace(/[.:]$/, ''), text: str(b?.text) })).filter((b) => b.text)
      : [],
    directions: str(doc.directions),
    constraints: list(doc.constraints),
  };
}

// Fidelity check: a capitalised word inside a sentence that appears nowhere
// in the material is most likely an invented name or place. Sentence-initial
// words are skipped (they are capitalised for grammar, not because they are
// names). Reported, not blocked: the creator reads the brief before launch.
function unverifiedNames(doc: ReturnType<typeof cleanDoc>, source: Source): string[] {
  const material = JSON.stringify(source).toLowerCase();
  const text = [
    doc.about,
    ...doc.shouldDo.map((b) => `${b.label}. ${b.text}`),
    doc.directions,
    ...doc.constraints,
  ].join('\n');
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
    if (!await rateLimitOk(admin, req, 'compose-ip', 20, '1 hour')) {
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
