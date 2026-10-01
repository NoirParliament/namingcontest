// The composed brief on the client: build the material from the setup draft,
// ask compose-brief, keep the result in the draft.
//
// The answers are the source; the brief is written from them.
//   - The first brief is written at the chat hand-off (free).
//   - The review page lets the creator reword the text in place
//     (edited = true) and change any answer or fill in a skipped one.
//   - When the answers no longer match what the brief was written from,
//     the review page offers "Update the brief": a rewrite from the current
//     answers, at most MAX_REWRITES times per contest. Nothing rewrites
//     on its own.
//   - buildContestRow copies the brief as shown into contests.brief_doc at
//     launch; after launch it is read back from the row, never rewritten.

import { supabase } from '../lib/supabaseClient';
import { readSetup, writeSetup, getQuestionsFor } from './v4Brief';
import { BRIEF_QUESTIONS } from '../data/v4/briefQuestions';
import { buildBriefSource, briefSourceHash } from '../data/v4/briefRoles';

export const MAX_REWRITES = 3;

export function buildSourceFromSetup(setup = readSetup()) {
  const subId = setup.subSegmentId;
  if (!subId) return null;
  const questions = getQuestionsFor(subId, null);
  return buildBriefSource({
    subId,
    segmentLabel: setup.subSegmentTitle || BRIEF_QUESTIONS[subId]?.label || subId,
    questions,
    answers: setup.brief || {},
    settings: setup.settings || {},
    workingName: setup.workingName || '',
    hostName: (setup.userName || '').trim(),
    hostAnonymous: !!setup.userAnonymous,
  });
}

// The brief for this draft, or null when none has been written yet. A brief
// written for another category (the draft was reused for a new contest) is
// never shown.
export function currentBriefDoc(setup = readSetup()) {
  const doc = setup.briefDoc;
  if (!doc) return null;
  if (doc.subId && doc.subId !== setup.subSegmentId) return null;
  return doc;
}

export function saveBriefDoc(doc) {
  writeSetup({ briefDoc: doc });
  return doc;
}

// Forget the brief and its rewrite count (new category, new contest).
export const RESET_BRIEF_PATCH = { briefDoc: null, briefRewrites: 0, briefDraftId: null };

// A random id for this draft, sent with each write so the server can hold
// the draft to its own cap (the count in the browser is only for the UI).
function draftIdFor(setup) {
  if (setup.briefDraftId) return setup.briefDraftId;
  const id = (globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);
  writeSetup({ briefDraftId: id });
  return id;
}

// Answer per question id, as the brief writer saw it.
function answerMap(source) {
  const out = {};
  (source?.items || []).forEach((it) => { out[it.id] = it.answer; });
  return out;
}

// What changed in the answers since the brief was written: ids whose answer
// is new, different or now empty. Empty list = the brief is up to date.
export function briefChanges(setup = readSetup()) {
  const doc = currentBriefDoc(setup);
  const source = buildSourceFromSetup(setup);
  if (!doc || !source) return [];
  if (!doc.sourceAnswers) {
    // Written before answers were snapshotted: all we can say is whether
    // anything differs.
    return doc.sourceHash && doc.sourceHash !== briefSourceHash(source) ? ['*'] : [];
  }
  const now = answerMap(source);
  const then = doc.sourceAnswers;
  const ids = new Set([...Object.keys(now), ...Object.keys(then)]);
  return [...ids].filter((id) => (now[id] || '') !== (then[id] || ''));
}

export function rewritesLeft(setup = readSetup()) {
  return Math.max(0, MAX_REWRITES - (setup.briefRewrites || 0));
}

// Ask the edge function. Resolves to the doc, or throws; the caller keeps
// whatever was on screen before. A rewrite counts against MAX_REWRITES only
// when it succeeds. Never called for participants.
// ── Live progress ─────────────────────────────────────────────────────
// What the writer is doing right now, for any page that wants to show it:
//   stage    'drafting' | 'redrafting' | 'checking' | 'done' | 'error' | null
//   partial  the brief so far, rebuilt from the half-written JSON (drafting)
//   draft    the finished draft (checking), so fixes can be shown landing
//   rewrite  true for an "Update brief"
let progress = { stage: null, partial: null, draft: null, rewrite: false };
const listeners = new Set();
function setProgress(patch) {
  progress = { ...progress, ...patch };
  listeners.forEach((cb) => cb(progress));
}
export function subscribeBriefProgress(cb) {
  listeners.add(cb);
  cb(progress);
  return () => listeners.delete(cb);
}
export function briefProgress() {
  return progress;
}

// The lines of the final brief that the check changed from the draft, so
// the page can show them landing. Empty when there was no live draft.
export function changedTexts(draft, doc) {
  if (!draft || !doc) return null;
  const texts = (d) => {
    const n = normalizeBriefDoc(d);
    if (!n) return [];
    return [
      n.about.story, n.aim.lead,
      ...n.about.facts.map((f) => f.value),
      ...n.aim.points.flatMap((p) => [p.label, p.text]),
      ...n.directions.explore, ...n.directions.avoid,
      ...n.directions.names.map((x) => x.note),
      ...n.rules.points.flatMap((p) => [p.label, p.text]),
    ].filter(Boolean);
  };
  const before = new Set(texts(draft));
  const changed = texts(doc).filter((t) => !before.has(t));
  return changed.length ? new Set(changed) : null;
}

// The brief from half-written JSON: close whatever is open (a string, then
// arrays and objects) and parse; if the cut lands mid-token, step back to an
// earlier comma and try again. Null until there is something to show.
export function parsePartialBrief(text) {
  let s = text;
  for (let tries = 0; tries < 40 && s.length > 1; tries++) {
    const stack = [];
    let inStr = false;
    let esc = false;
    for (const ch of s) {
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
      } else if (ch === '"') inStr = true;
      else if (ch === '{' || ch === '[') stack.push(ch);
      else if (ch === '}' || ch === ']') stack.pop();
    }
    let candidate = s.replace(/\\$/, '') + (inStr ? '"' : '');
    candidate = candidate.replace(/[,:]\s*$/, '');
    candidate += stack.reverse().map((c) => (c === '{' ? '}' : ']')).join('');
    try {
      return JSON.parse(candidate);
    } catch {
      const cut = s.lastIndexOf(',');
      if (cut <= 0) return null;
      s = s.slice(0, cut);
    }
  }
  return null;
}

// One request at a time per set of answers: the chat starts the brief early,
// the hand-off and the review page may ask again while it is still being
// written, and all of them get the same answer from the one request.
let inflight = null;
let inflightKey = null;

export function composeBriefDoc({ rewrite = false } = {}) {
  const setup = readSetup();
  if (rewrite && rewritesLeft(setup) <= 0) return Promise.reject(new Error('No rewrites left.'));
  const source = buildSourceFromSetup(setup);
  if (!source || source.items.length === 0) return Promise.reject(new Error('Nothing to write from yet.'));
  const key = briefSourceHash(source);
  if (!rewrite && inflight && inflightKey === key) return inflight;
  const run = writeBriefDoc(setup, source, rewrite).finally(() => {
    if (inflight === run) { inflight = null; inflightKey = null; }
  });
  inflight = run;
  inflightKey = key;
  return run;
}

// The writer, live: Server-Sent Events from the edge function (the draft as
// it is written, then the check), published through setProgress.
async function streamBrief(body) {
  const base = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(`${base}/functions/v1/compose-brief`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, stream: true }),
  });
  if (!res.ok || !(res.headers.get('content-type') || '').includes('text/event-stream')) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Could not write the brief (${res.status}).`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let result = null;
  // During a redraft the first draft stays on screen (soft) until the new
  // one is finished, instead of the brief shrinking back to nothing.
  let hold = false;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const chunk = buf.slice(0, i);
      buf = buf.slice(i + 2);
      if (!chunk.startsWith('data: ')) continue;
      const e = JSON.parse(chunk.slice(6));
      if (e.type === 'stage') {
        if (e.stage === 'redrafting') hold = true;
        if (e.draft) hold = false;
        setProgress({ stage: e.stage, ...(e.draft ? { draft: e.draft, partial: e.draft } : {}) });
      } else if (e.type === 'draft') {
        if (hold) continue;
        const partial = parsePartialBrief(e.text);
        if (partial) setProgress({ partial });
      } else if (e.type === 'done') {
        result = e;
      } else if (e.type === 'error') {
        throw new Error(e.error || 'Could not write the brief.');
      }
    }
  }
  if (!result?.doc) throw new Error('Could not write the brief.');
  return result;
}

async function writeBriefDoc(setup, source, rewrite) {
  setProgress({ stage: 'drafting', partial: null, draft: null, rewrite });
  let data;
  try {
    data = await streamBrief({ source, draftId: draftIdFor(setup) });
  } catch (e) {
    setProgress({ stage: 'error', partial: null });
    throw e;
  }
  if (data.warnings?.length) console.warn('[brief] unverified names in the composed brief:', data.warnings);
  const doc = {
    ...data.doc,
    subId: source.subId,
    sourceHash: briefSourceHash(source),
    sourceAnswers: answerMap(source),
    edited: false,
  };
  writeSetup({
    briefDoc: doc,
    ...(rewrite ? { briefRewrites: (readSetup().briefRewrites || 0) + 1 } : {}),
  });
  setProgress({ stage: 'done', partial: null });
  return doc;
}

// The doc in its current shape: { sections: [{ kind, heading, body, points }] },
// a short document the writer composes for this contest. kind is one of
// about / aim / directions / references / rules and only picks the icon.
//
// Older docs are converted on read so every saved brief still renders:
//   v1-v3 { about, shouldDo, directions | explore/avoid/watchouts,
//           requirements | constraints[] , notes[] }
// become sections in the same reading order, with an empty heading (the
// renderer falls back to the category's authored section title).
// The brief's shape (v6): four fixed parts, each with its own structure.
//   about       { story, facts: [{ label, value }] }
//   aim         { lead, points: [{ label, text }] }
//   directions  { explore: [line], avoid: [line], names: [{ name, note }], prose }
//   rules       { points: [{ label, text }] }
// `prose` under directions only ever holds an older brief's paragraph; the
// writer never produces it. Every older saved shape (the sections list, the
// first about/shouldDo/explore/avoid/watchouts object) converts on read, so
// a contest launched under an older writer still renders.
const str = (v) => (typeof v === 'string' ? v : '');
const arr = (v) => (Array.isArray(v) ? v : []);
const pts = (list) => arr(list)
  .map((b) => (typeof b === 'string' ? { label: '', text: b } : { label: str(b?.label), text: str(b?.text) }));
const lines = (list) => arr(list).map((l) => (typeof l === 'string' ? l : str(l?.text))).filter(Boolean);

function emptyParts() {
  return {
    about: { story: '', facts: [] },
    aim: { lead: '', points: [] },
    directions: { explore: [], avoid: [], names: [], prose: '' },
    rules: { points: [] },
  };
}

export function normalizeBriefDoc(doc) {
  if (!doc) return null;
  const parts = emptyParts();

  if (doc.about && typeof doc.about === 'object') {
    // v6, straight through with every field made safe.
    parts.about.story = str(doc.about.story);
    parts.about.facts = arr(doc.about.facts).map((f) => ({ label: str(f?.label), value: str(f?.value) }));
    parts.aim.lead = str(doc.aim?.lead);
    parts.aim.points = pts(doc.aim?.points);
    parts.directions.explore = lines(doc.directions?.explore);
    parts.directions.avoid = lines(doc.directions?.avoid);
    parts.directions.names = arr(doc.directions?.names).map((n) => ({
      name: str(n?.name), note: str(n?.note), ...(n?.kind === 'liked' || n?.kind === 'missed' ? { kind: n.kind } : {}),
    }));
    parts.directions.prose = str(doc.directions?.prose);
    parts.rules.points = pts(doc.rules?.points);
    const { about, aim, directions, rules, ...rest } = doc;
    void about; void aim; void directions; void rules;
    return { ...rest, v: 6, ...parts };
  }

  if (Array.isArray(doc.sections)) {
    // The sections list (one prose body plus optional points per kind).
    for (const sec of doc.sections) {
      const body = str(sec?.body);
      const points = pts(sec?.points);
      switch (sec?.kind) {
        case 'about': parts.about.story = [parts.about.story, body].filter(Boolean).join(' '); break;
        case 'directions':
        case 'references':
          parts.directions.prose = [parts.directions.prose, body].filter(Boolean).join(' ');
          parts.directions.names.push(...points.map((p) => ({ name: p.label, note: p.text })));
          break;
        case 'rules':
          parts.rules.points.push(...points);
          if (body) parts.rules.points.push({ label: '', text: body });
          break;
        default:
          parts.aim.lead = [parts.aim.lead, body].filter(Boolean).join(' ');
          parts.aim.points.push(...points);
      }
    }
    const { sections, ...rest } = doc;
    void sections;
    return { ...rest, v: 6, ...parts };
  }

  // The first shape: about / shouldDo / explore / avoid / watchouts / constraints.
  const open = (l) => !l?.length || (l.length === 1 && /^open$/i.test(l[0]));
  parts.about.story = str(doc.about);
  parts.aim.points = pts(doc.shouldDo);
  if (!open(doc.explore)) parts.directions.explore = lines(doc.explore);
  if (!open(doc.avoid)) parts.directions.avoid = lines(doc.avoid);
  parts.directions.names = arr(doc.watchouts).map((w) => ({ name: str(w?.name), note: str(w?.note) }));
  parts.directions.prose = str(doc.directions);
  parts.rules.points = pts(doc.constraints);
  if (str(doc.requirements)) parts.rules.points.push({ label: '', text: str(doc.requirements) });
  const { about, shouldDo, explore, avoid, watchouts, constraints, notes, directions, requirements, ...rest } = doc;
  void about; void shouldDo; void explore; void avoid; void watchouts; void constraints; void notes; void directions; void requirements;
  return { ...rest, v: 6, ...parts };
}

// The doc as saved at launch: trimmed, empty lines and points dropped.
export function cleanBriefDoc(doc) {
  const d = normalizeBriefDoc(doc);
  if (!d) return d;
  const t = (v) => str(v).trim();
  const cleanPts = (list) => list.map((p) => ({ label: t(p.label), text: t(p.text) })).filter((p) => p.label || p.text);
  return {
    ...d,
    about: {
      story: t(d.about.story),
      facts: d.about.facts.map((f) => ({ label: t(f.label), value: t(f.value) })).filter((f) => f.label && f.value),
    },
    aim: { lead: t(d.aim.lead), points: cleanPts(d.aim.points) },
    directions: {
      explore: d.directions.explore.map(t).filter(Boolean),
      avoid: d.directions.avoid.map(t).filter(Boolean),
      names: d.directions.names.map((n) => ({ name: t(n.name), note: t(n.note), ...(n.kind ? { kind: n.kind } : {}) })).filter((n) => n.name || n.note),
      prose: t(d.directions.prose),
    },
    rules: { points: cleanPts(d.rules.points) },
  };
}

// True when the doc has anything worth rendering. An empty doc (the model
// given almost nothing) falls back to the Q&A.
export function briefDocHasContent(doc) {
  if (!doc) return false;
  const d = cleanBriefDoc(doc);
  return Boolean(d.about.story || d.about.facts.length || d.aim.lead || d.aim.points.length
    || d.directions.explore.length || d.directions.avoid.length || d.directions.names.length || d.directions.prose
    || d.rules.points.length);
}
