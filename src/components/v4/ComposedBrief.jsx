// The composed brief: the participant-facing document written from the
// creator's answers (compose-brief), rendered under the same section heads
// as the Q&A card it replaces so it reads as the same brief, just finished.
//
// It reads top to bottom like a brief, not a form: a background paragraph,
// the instructions as lines with a bold lead (Mark's own example), one
// written paragraph on what to explore and avoid (with the names already in
// the picture), and the hard requirements as sentences when there are any.
// A section with nothing in it is simply not there, for everyone.
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
// syllables..."), Mark's own brief format. Used for the instructions and the
// requirements alike, so the brief has one pattern for "points".
function Points({ items }) {
  return (
    <ul className="v4-cbrief-points">
      {items.filter((it) => !isBlank(it.text) || !isBlank(it.label)).map((it, i) => (
        <li key={i} className="v4-cbrief-point">
          {!isBlank(it.label) && (
            <>
              <strong className="v4-cbrief-point-lead">{it.label}</strong>
              <span className="v4-cbrief-point-dot">.</span>{' '}
            </>
          )}
          <span className="v4-cbrief-point-text">{it.text}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ComposedBrief({ doc: rawDoc, subId, questions, tone }) {
  const doc = normalizeBriefDoc(rawDoc);
  if (!doc) return null;
  const meta = composedSectionMeta(subId, questions);

  return (
    <div className="v4-cbrief">
      {!isBlank(doc.about) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.about.title} icon={meta.about.icon} tone={tone} />
          <p className="v4-cbrief-para">{doc.about}</p>
        </div>
      )}

      {doc.shouldDo.some((it) => !isBlank(it.text) || !isBlank(it.label)) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.shouldDo.title} icon={meta.shouldDo.icon} tone={tone} />
          <Points items={doc.shouldDo} />
        </div>
      )}

      {!isBlank(doc.directions) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.exploreAvoid.title} icon={meta.exploreAvoid.icon} tone={tone} />
          <p className="v4-cbrief-para">{doc.directions}</p>
        </div>
      )}

      {doc.constraints.some((c) => !isBlank(c.text) || !isBlank(c.label)) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.constraints.title} icon={meta.constraints.icon} tone={tone} />
          <Points items={doc.constraints} />
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
