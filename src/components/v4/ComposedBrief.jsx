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

import { useEffect, useState } from 'react';
import BriefSectionHead from './BriefSectionHead';
import { composedSectionMeta } from '../../data/v4/briefRoles';
import { normalizeBriefDoc } from '../../utils/composeBrief';

const isBlank = (v) => !String(v ?? '').trim();

// Lines with a bold lead ("Keep it short. Suggest first names of one or two
// syllables..."), Mark's own brief format: the criteria, the names the host
// mentioned and the rules all read this way.
function Points({ items, leadKey = 'label', textKey = 'text' }) {
  const rows = items.filter((it) => !isBlank(it[textKey]) || !isBlank(it[leadKey]));
  if (!rows.length) return null;
  return (
    <ul className="v4-cbrief-points">
      {rows.map((it, i) => (
        <li key={i} className="v4-cbrief-point">
          {!isBlank(it[leadKey]) && (
            <>
              <strong className="v4-cbrief-point-lead">{it[leadKey]}</strong>
              {!isBlank(it[textKey]) && <span className="v4-cbrief-point-dot">.</span>}{' '}
            </>
          )}
          <span className="v4-cbrief-point-text">{it[textKey]}</span>
        </li>
      ))}
    </ul>
  );
}

// A small uppercase label over a block inside a section, same type as the
// card eyebrows ("YOUR BRIEF", "A NOTE FROM EMMA").
function SubLabel({ children }) {
  return <div className="v4-cbrief-sublabel">{children}</div>;
}

function Lines({ items }) {
  return (
    <ul className="v4-cbrief-lines">
      {items.map((t, i) => <li key={i}>{t}</li>)}
    </ul>
  );
}

export default function ComposedBrief({ doc: rawDoc, subId, questions, tone }) {
  const doc = normalizeBriefDoc(rawDoc);
  if (!doc) return null;
  const meta = composedSectionMeta(subId, questions);
  const { about, aim, directions: dir, rules } = doc;

  const hasAbout = !isBlank(about.story) || about.facts.length > 0;
  const hasAim = !isBlank(aim.lead) || aim.points.length > 0;
  const hasDir = dir.explore.length > 0 || dir.avoid.length > 0 || dir.names.length > 0 || !isBlank(dir.prose);
  const hasRules = rules.points.length > 0;
  const twoCols = dir.explore.length > 0 && dir.avoid.length > 0;

  return (
    <div className="v4-cbrief">
      {hasAbout && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.about.title} icon={meta.about.icon} tone={tone} />
          {!isBlank(about.story) && <p className="v4-cbrief-para">{about.story}</p>}
          {about.facts.length > 0 && (
            <dl className="v4-cbrief-facts">
              {about.facts.map((f, i) => (
                <div key={i} className="v4-cbrief-fact">
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {hasAim && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.shouldDo.title} icon={meta.shouldDo.icon} tone={tone} />
          {!isBlank(aim.lead) && <p className="v4-cbrief-para v4-cbrief-lead">{aim.lead}</p>}
          <Points items={aim.points} />
        </div>
      )}

      {hasDir && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.exploreAvoid.title} icon={meta.exploreAvoid.icon} tone={tone} />
          {!isBlank(dir.prose) && <p className="v4-cbrief-para">{dir.prose}</p>}
          {(dir.explore.length > 0 || dir.avoid.length > 0) && (
            <div className={`v4-cbrief-cols${twoCols ? ' is-two' : ''}`}>
              {dir.explore.length > 0 && (
                <div className="v4-cbrief-col">
                  <SubLabel>Lean toward</SubLabel>
                  <Lines items={dir.explore} />
                </div>
              )}
              {dir.avoid.length > 0 && (
                <div className="v4-cbrief-col is-avoid">
                  <SubLabel>Steer clear of</SubLabel>
                  <Lines items={dir.avoid} />
                </div>
              )}
            </div>
          )}
          {dir.names.length > 0 && (
            <div className="v4-cbrief-names">
              <SubLabel>Names already mentioned</SubLabel>
              <Points items={dir.names} leadKey="name" textKey="note" />
            </div>
          )}
        </div>
      )}

      {hasRules && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.constraints.title} icon={meta.constraints.icon} tone={tone} />
          <Points items={rules.points} />
        </div>
      )}
    </div>
  );
}

// Shown while compose-brief is writing. It should feel like writing, not
// like a loading spinner: a status line that moves through the stages, and
// grey lines that fill in one after another under the real section heads
// so the card is the right shape when the text lands.
const STAGES = [
  'Reading your answers',
  'Writing the background',
  'Working out what the name should do',
  'Sorting what to explore and what to avoid',
  'Checking every line against your answers',
];

export function ComposedBriefSkeleton({ subId, questions, tone }) {
  const meta = composedSectionMeta(subId, questions);
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 3200);
    return () => clearInterval(t);
  }, []);
  const groups = [
    { ...meta.about, lines: ['94%', '88%', '61%'] },
    { ...meta.shouldDo, lines: ['72%', '80%', '66%', '76%'] },
    { ...meta.exploreAvoid, lines: ['90%', '84%', '47%'] },
  ];
  return (
    <div className="v4-cbrief v4-cbrief-skeleton" aria-busy="true" aria-live="polite">
      <div className="v4-cbrief-skeleton-status">
        <span className="v4-cbrief-skeleton-pen" aria-hidden="true" />
        <span key={stage} className="v4-cbrief-skeleton-stage">{STAGES[stage]}</span>
      </div>
      {groups.map((g, gi) => (
        <div key={g.title} className="v4-brief-group">
          <BriefSectionHead title={g.title} icon={g.icon} tone={tone} />
          <div className="v4-cbrief-skeleton-lines">
            {g.lines.map((w, li) => (
              <span key={li} style={{ width: w, animationDelay: `${(gi * 4 + li) * 0.28}s` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
