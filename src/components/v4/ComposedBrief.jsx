// The composed brief: the participant-facing document written from the
// creator's answers (compose-brief).
//
// Four parts under the category's own authored headings (About the baby,
// What the name should do, Directions to explore and avoid, Must-haves or
// Practical requirements), each with the structure a real brief gives it:
//   about       a short story, then a fact sheet of the specifics
//   aim         one line that says the whole ask, then the criteria
//   directions  lean-toward and steer-clear lists, then the names the host
//               mentioned with what to make of each
//   rules       the hard rules, one bold-lead line each
// Older saved briefs are converted on read (normalizeBriefDoc).
//
// Read-only everywhere: the creator's review, the participant submit/vote
// cards and the dashboard recap. The brief changes only by changing an
// answer and updating it (review page), so it always says what the answers
// say. Settings rows, the host's note and the guides stay outside.

import { createContext, useContext, useEffect, useState } from 'react';
import { Check, X } from '@phosphor-icons/react';
import BriefSectionHead, { SectionIcon } from './BriefSectionHead';
import { composedSectionMeta } from '../../data/v4/briefRoles';
import { getBriefSections } from '../../data/v4/briefExpansions';
import { formatDateAnswer } from '../../utils/v4Brief';
import { normalizeBriefDoc } from '../../utils/composeBrief';

const isBlank = (v) => !String(v ?? '').trim();

// Texts the line check just changed glow softly for a moment (the review
// page passes them right after a write lands).
const FixedContext = createContext(null);
function useGlow() {
  const fixed = useContext(FixedContext);
  return (t) => (fixed && t && fixed.has(t) ? ' is-fixed' : '');
}

// Label + text items (the criteria, the names the host mentioned, the
// rules), stacked: the label on its own line, the explanation softer below,
// so the eye can run down the labels alone.
function Points({ items, leadKey = 'label', textKey = 'text', numbered = false, variant = '' }) {
  const glow = useGlow();
  const rows = items.filter((it) => !isBlank(it[textKey]) || !isBlank(it[leadKey]));
  if (!rows.length) return null;
  return (
    <ul className={`v4-cbrief-points${numbered ? ' is-numbered' : ''}${variant ? ` is-${variant}` : ''}`}>
      {rows.map((it, i) => (
        <li key={i} className="v4-cbrief-point">
          {numbered && <span className="v4-cbrief-point-num" aria-hidden="true">{i + 1}</span>}
          <span className="v4-cbrief-point-body">
            {!isBlank(it[leadKey]) && <span className={`v4-cbrief-point-lead${glow(it[leadKey])}`}>{it[leadKey]}</span>}
            {!isBlank(it[textKey]) && <span className={`v4-cbrief-point-text${glow(it[textKey])}`}>{it[textKey]}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

// A small label over a block inside a section ("Lean toward").
function SubLabel({ children }) {
  return <div className="v4-cbrief-sublabel">{children}</div>;
}

// The names the host mentioned, split into the ones they like and the ones
// that missed, under the category's own labels. Briefs written before the
// split (no kind) show as one list.
function Names({ names, labels }) {
  const split = names.some((n) => n.kind);
  const groups = split
    ? [
      { kind: 'liked', label: labels.liked, items: names.filter((n) => n.kind !== 'missed') },
      { kind: 'missed', label: labels.missed, items: names.filter((n) => n.kind === 'missed') },
    ].filter((g) => g.items.length)
    : [{ kind: '', label: 'Names already mentioned', items: names }];
  if (!split) {
    return (
      <div className="v4-cbrief-names">
        <SubLabel>{groups[0].label}</SubLabel>
        <Points items={groups[0].items} leadKey="name" textKey="note" variant="names" />
      </div>
    );
  }
  // Stacked groups, each opened by an eyebrow in the host note's style ("A
  // NOTE FROM MARK"): the liked group in the category colour, the missed one
  // in ink, with clear space between. Type and space do the separating.
  return (
    <div className="v4-cbrief-namegroups">
      {groups.map((g) => (
        <div key={g.label} className={`v4-cbrief-namegroup is-${g.kind}`}>
          <div className="v4-cbrief-namegroup-label">{g.label}</div>
          <Points items={g.items} leadKey="name" textKey="note" variant="names" />
        </div>
      ))}
    </div>
  );
}

// A side the host gave nothing for: one plain line that finishes the
// panel's own label ("Steer clear of: anything that breaks the must-haves").
function OpenLine({ text }) {
  return text ? <p className="v4-cbrief-open">{text}</p> : null;
}

function Lines({ items }) {
  const glow = useGlow();
  return (
    <ul className="v4-cbrief-lines">
      {items.map((t, i) => <li key={i} className={glow(t).trim() || undefined}>{t}</li>)}
    </ul>
  );
}

export default function ComposedBrief({ doc: rawDoc, subId, questions, tone, live = false, fixed = null, reveal = false, focusIn = false }) {
  const doc = normalizeBriefDoc(rawDoc);
  if (!doc) return null;
  const glow = (t) => (fixed && t && fixed.has(t) ? ' is-fixed' : '');
  // While streaming, half-written pills and names stay hidden until they
  // have a value, and a part shows only once the writer has reached it.
  if (live) {
    doc.about.facts = doc.about.facts.filter((f) => !isBlank(f.label) && !isBlank(f.value));
    doc.directions.names = doc.directions.names.filter((n) => !isBlank(n.name));
  }
  const meta = composedSectionMeta(subId, questions);
  const { about, aim, directions: dir, rules } = doc;

  const hasAbout = !isBlank(about.story) || about.facts.length > 0;
  const hasAim = !isBlank(aim.lead) || aim.points.length > 0;
  const hasRules = rules.points.length > 0;
  // Lean toward and steer clear of always show as a pair. Everything the
  // host said to avoid (bans included) is listed under Steer clear of; a
  // side the host gave nothing for says so in the app's own words, never
  // the writer's, read as the end of its label ("Steer clear of: nothing in
  // particular"). Older briefs written as one paragraph keep their paragraph.
  const legacyProse = !isBlank(dir.prose) && dir.explore.length === 0 && dir.avoid.length === 0;
  const hasDir = !live || Boolean(rawDoc?.directions);
  // Never while it streams: the writer may not have reached that side yet.
  const openExplore = live ? '' : 'Nothing specific, so range as widely as you like.';
  const openAvoid = live ? '' : 'Nothing in particular. Every idea is welcome.';
  // A category whose chat never asks what to avoid (the pet) shows no avoid
  // side when nothing to avoid came up elsewhere: the heading trims to
  // "Directions to explore" and the lone panel needs no label.
  const exploreOnly = dir.avoid.length === 0 && meta.asksAvoid === false;
  const dirTitle = exploreOnly
    ? meta.exploreAvoid.title.replace(/\s+and avoid/i, '')
    : meta.exploreAvoid.title;

  // The segment's tone reaches the panels and number tiles the same way it
  // reaches the section heads.
  const toneVars = tone ? { '--sec-tint': tone.bg, '--sec-accent': tone.fg } : undefined;

  return (
    <FixedContext.Provider value={fixed}>
    <div className={`v4-cbrief${live ? ' is-live' : ''}${reveal ? ' is-reveal' : ''}${focusIn ? ' is-focus-in' : ''}`} style={toneVars} aria-hidden={live || undefined}>
      {hasAbout && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.about.title} icon={meta.about.icon} tone={tone} />
          {!isBlank(about.story) && <p className={`v4-cbrief-para${glow(about.story)}`}>{about.story}</p>}
          {about.facts.length > 0 && (
            <ul className="v4-cbrief-facts">
              {about.facts.map((f, i) => (
                <li key={i} className="v4-cbrief-fact">
                  <span className="v4-cbrief-fact-label">{f.label}</span>
                  <span className={`v4-cbrief-fact-value${glow(f.value)}`}>{f.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {hasAim && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.shouldDo.title} icon={meta.shouldDo.icon} tone={tone} />
          {!isBlank(aim.lead) && <p className={`v4-cbrief-para v4-cbrief-lead${glow(aim.lead)}`}>{aim.lead}</p>}
          <Points items={aim.points} numbered />
        </div>
      )}

      {/* A category that authors its own names section (band: "Names to
          learn from") keeps it where its chat asks it: before the
          directions. */}
      {dir.names.length > 0 && meta.names.section && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.names.section.title} icon={meta.names.section.icon} tone={tone} />
          <Names names={dir.names} labels={meta.names} />
        </div>
      )}

      {hasDir && (
        <div className="v4-brief-group">
          <BriefSectionHead title={dirTitle} icon={meta.exploreAvoid.icon} tone={tone} />
          {legacyProse ? (
            <p className="v4-cbrief-para">{dir.prose}</p>
          ) : exploreOnly ? (
            <div className="v4-cbrief-cols">
              <div className="v4-cbrief-col">
                {dir.explore.length > 0 ? <Lines items={dir.explore} /> : <OpenLine text={openExplore} />}
              </div>
            </div>
          ) : (
            <div className="v4-cbrief-cols is-two">
              <div className="v4-cbrief-col">
                <div className="v4-cbrief-col-head">
                  <span className="v4-cbrief-col-icon" aria-hidden="true"><Check size={12} weight="bold" /></span>
                  Lean toward
                </div>
                {dir.explore.length > 0 ? <Lines items={dir.explore} /> : <OpenLine text={openExplore} />}
              </div>
              <div className="v4-cbrief-col is-avoid">
                <div className="v4-cbrief-col-head">
                  <span className="v4-cbrief-col-icon" aria-hidden="true"><X size={12} weight="bold" /></span>
                  Steer clear of
                </div>
                {dir.avoid.length > 0 ? <Lines items={dir.avoid} /> : <OpenLine text={openAvoid} />}
              </div>
            </div>
          )}
          {dir.names.length > 0 && !meta.names.section && <Names names={dir.names} labels={meta.names} />}
        </div>
      )}

      {hasRules && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.constraints.title} icon={meta.constraints.icon} tone={tone} />
          <Points items={rules.points} variant="rules" />
        </div>
      )}
    </div>
    </FixedContext.Provider>
  );
}

// Shown while compose-brief is writing (20 to 40 seconds with the line
// check). It should feel like the brief being written from the creator's
// own answers, because it is: each stage names what the writer is doing and
// quotes what they wrote for that part, then the check and the polish. A
// slow progress line underneath; grey lines under the real section heads
// keep the card the right shape for when the text lands.
const STAGE_MS = 3200;

// The top line of the brief card, above the note: what the writer is
// really doing, with a progress line tied to it.
//   phase 'working'  live: before the first words it quotes the creator's
//                    answers one part at a time; then "Writing · <part>" as
//                    the brief reaches each part; then the check
//   phase 'done'     just finished (shown for a moment)
//   phase 'reveal'   the brief was already written when the page opened
export function BriefProgressLine({ phase, stage, partial, subId, questions, answers, tone }) {
  const meta = composedSectionMeta(subId, questions);
  // The creator's own words for each part (the quotes under each step).
  const [quotes] = useState(() => {
    const stages = buildStages(subId, questions, answers);
    const find = (re) => stages.find((s) => re.test(s.text))?.quote || '';
    return {
      list: stages.filter((s) => s.quote).map((s) => s.quote),
      about: find(/^Getting to know/), aim: find(/should do/), directions: find(/lean toward/),
      names: find(/names you mentioned/), rules: find(/must have/),
    };
  });
  const [qi, setQi] = useState(0);
  const working = phase === 'working';
  const reading = working && !partial && stage !== 'checking' && stage !== 'redrafting';
  useEffect(() => {
    if (!reading || quotes.list.length < 2) return undefined;
    const t = setInterval(() => setQi((n) => (n + 1) % quotes.list.length), STAGE_MS);
    return () => clearInterval(t);
  }, [reading, quotes.list.length]);

  // The step, its quote, and where the progress should be, from the real
  // state of the writer.
  let step; let sub = ''; let target;
  if (!working) { step = phase === 'reveal' ? 'Written from your answers' : 'Done'; target = 100; }
  else if (stage === 'checking') { step = 'Double-checking every line against your answers'; sub = 'Making sure every line comes from what you wrote'; target = 72; }
  else if (stage === 'redrafting') { step = 'Tightening a few lines'; sub = 'A second pass to keep it exact'; target = 60; }
  else if (partial?.rules) { step = 'Noting what every name must have'; sub = quotes.rules; target = 66; }
  else if (partial?.directions?.names) { step = 'Gathering the names you mentioned'; sub = quotes.names; target = 60; }
  else if (partial?.directions) { step = 'Mapping where to look and what to steer clear of'; sub = quotes.directions; target = 52; }
  else if (partial?.aim) { step = 'Setting out what the name should do'; sub = quotes.aim; target = 38; }
  else if (partial) { step = 'Shaping the background'; sub = quotes.about; target = 22; }
  else { step = 'Reading your answers'; sub = quotes.list[qi] || ''; target = 6; }

  // The number counts toward the target; while reading and during the
  // check it keeps creeping (to 18, and 72 to 96) so it never looks stuck,
  // and it never reaches 100 before the brief has landed.
  const [shown, setShown] = useState(working ? 0 : 100);
  const [checkStart, setCheckStart] = useState(null);
  const [readStart] = useState(() => Date.now());
  useEffect(() => {
    if (stage === 'checking' && working) setCheckStart((t) => t ?? Date.now());
  }, [stage, working]);
  useEffect(() => {
    const t = setInterval(() => {
      let goal = target;
      if (checkStart && working && stage === 'checking') goal = Math.min(96, 72 + ((Date.now() - checkStart) / 1000) * 1.5);
      // Before the first words, it creeps too (up to 18), never sitting still.
      else if (reading) goal = Math.min(18, 2 + ((Date.now() - readStart) / 1000) * 2);
      setShown((v) => (Math.abs(goal - v) < 0.6 ? goal : v + (goal - v) * 0.18));
    }, 60);
    return () => clearInterval(t);
  }, [target, checkStart, working, stage, reading, readStart]);
  const pct = Math.round(shown);

  const toneVars = tone ? { '--sec-tint': tone.bg, '--sec-accent': tone.fg } : undefined;
  const R = 16;
  const C = 2 * Math.PI * R;
  return (
    <div className={`v4-bpl is-${phase}`} style={toneVars} aria-live="polite">
      <div className="v4-bpl-row">
        <span className="v4-bpl-icon" aria-hidden="true">
          <svg viewBox="0 0 36 36" width="36" height="36">
            <circle className="v4-bpl-track" cx="18" cy="18" r={R} />
            <circle className="v4-bpl-ring" cx="18" cy="18" r={R} strokeDasharray={C} strokeDashoffset={C * (1 - shown / 100)} />
          </svg>
          <span className="v4-bpl-glyph">
            {working ? <SectionIcon name={meta.about.icon} size={15} /> : <Check size={15} weight="bold" />}
          </span>
        </span>
        <span className="v4-bpl-text">
          <span key={step} className="v4-bpl-step">{step}</span>
          {sub && <span key={sub} className="v4-bpl-sub">{working && !/^Making|^A second/.test(sub) ? `“${sub}”` : sub}</span>}
        </span>
        <span className="v4-bpl-pct">{pct}%</span>
      </div>
      <div className="v4-cbrief-skeleton-progress" aria-hidden="true">
        <span style={{ width: `${shown}%`, transitionDuration: '0.2s' }} />
      </div>
    </div>
  );
}
const FALLBACK_STAGES = [
  { text: 'Reading your answers' },
  { text: 'Writing the background' },
  { text: 'Working out what the name should do' },
  { text: 'Sorting what to explore and what to avoid' },
];

// One answer as a short quotable line.
function quoteOf(q, v) {
  if (v === undefined || v === null || v === '' || v === false) return '';
  let t;
  if (Array.isArray(v)) t = v.join(', ');
  else if (typeof v === 'object') t = v.enabled ? (v.text || v.name || '') : '';
  else t = q?.type === 'date' ? formatDateAnswer(v) : String(v);
  t = t.replace(/\s+/g, ' ').trim();
  return t.length > 90 ? `${t.slice(0, 88).replace(/[\s,.;:]+\S*$/, '')}…` : t;
}

// The stages for this brief: one per section the creator answered, each
// with a quote from their first answer there, then the writing steps.
function buildStages(subId, questions, answers) {
  const sections = answers ? getBriefSections(subId, questions) : null;
  if (!sections) return [...FALLBACK_STAGES, { text: 'Checking every line against your answers' }, { text: 'Final polish' }];
  const about = sections[0]?.title?.replace(/^About\s+/i, '') || 'it';
  const label = (title, i) => {
    if (i === 0) return `Getting to know ${about}`;
    if (/should do/i.test(title)) return 'Working out what the name should do';
    if (/names/i.test(title)) return 'Looking at the names you mentioned';
    if (/explore/i.test(title)) return 'Sorting what to lean toward and steer clear of';
    if (/practical|must/i.test(title)) return 'Noting what every name must have';
    return `Reading ${title.toLowerCase()}`;
  };
  const stages = [{ text: 'Writing your brief from your answers' }];
  // Each part quotes its most telling answer: the longest written one,
  // never a bare date or pick when there is something the creator wrote.
  sections.forEach((sec, i) => {
    const quotes = sec.items
      .filter((q) => q.id !== 'intro')
      .map((q) => ({ q, t: quoteOf(q, answers[q.id]) }))
      .filter((x) => x.t);
    if (!quotes.length) return;
    const written = quotes.filter((x) => x.q.type === 'text' || x.q.type === 'textarea' || x.q.type === 'toggleTextarea');
    const best = (written.length ? written : quotes).reduce((a, b) => (b.t.length > a.t.length ? b : a));
    stages.push({ text: label(sec.title, i), quote: best.t });
  });
  if (stages.length === 1) stages.push(...FALLBACK_STAGES);
  stages.push({ text: 'Checking every line against your answers' });
  stages.push({ text: 'Final polish' });
  return stages;
}

export function ComposedBriefSkeleton({ subId, questions, tone }) {
  const meta = composedSectionMeta(subId, questions);
  const toneVars = tone ? { '--sec-tint': tone.bg, '--sec-accent': tone.fg } : undefined;
  // Each bar inks in after the one before it, top to bottom.
  let n = 0;
  const bar = (w) => <span key={n} className="v4-cbrief-sk-bar" style={{ width: w, animationDelay: `${(n++) * 0.12}s` }} />;
  return (
    <div className="v4-cbrief v4-cbrief-skeleton" style={toneVars} aria-busy="true">

      <div className="v4-brief-group">
        <BriefSectionHead title={meta.about.title} icon={meta.about.icon} tone={tone} />
        <div className="v4-cbrief-sk-lines">{bar('94%')}{bar('88%')}{bar('52%')}</div>
        <div className="v4-cbrief-facts">
          {['132px', '120px', '128px', '116px'].map((w) => <span key={w} className="v4-cbrief-sk-pill" style={{ width: w }} />)}
        </div>
      </div>

      <div className="v4-brief-group">
        <BriefSectionHead title={meta.shouldDo.title} icon={meta.shouldDo.icon} tone={tone} />
        <div className="v4-cbrief-sk-lines v4-cbrief-lead">{bar('86%')}</div>
        <ul className="v4-cbrief-points is-numbered">
          {[1, 2, 3].map((i) => (
            <li key={i} className="v4-cbrief-point">
              <span className="v4-cbrief-point-num" aria-hidden="true">{i}</span>
              <span className="v4-cbrief-point-body v4-cbrief-sk-lines">{bar('38%')}{bar('72%')}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="v4-brief-group">
        <BriefSectionHead title={meta.exploreAvoid.title} icon={meta.exploreAvoid.icon} tone={tone} />
        <div className="v4-cbrief-cols is-two">
          <div className="v4-cbrief-col"><div className="v4-cbrief-sk-lines">{bar('40%')}{bar('84%')}{bar('70%')}</div></div>
          <div className="v4-cbrief-col is-avoid"><div className="v4-cbrief-sk-lines">{bar('44%')}{bar('78%')}</div></div>
        </div>
      </div>
    </div>
  );
}
