// The composed brief: the participant-facing document written from the
// creator's answers (compose-brief).
//
// It reads like a brief written for this one contest: 3 to 5 sections the
// writer composes, each with its own heading drawn from the contest's facts
// ("A little sister for Theo", "No bread puns, no Britpop"), flowing prose,
// and bold-lead points only where the content really is a list. A section's
// kind (about / aim / directions / references / rules) only picks its icon.
// Older saved briefs are converted on read (normalizeBriefDoc) and fall back
// to the category's authored section titles.
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
// syllables..."), Mark's own brief format, for the one section (if any) that
// is genuinely a list.
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
  // Icon per kind; the heading fallback (legacy docs) is the category's own
  // authored title for that part of the brief.
  const look = {
    about: meta.about,
    aim: meta.shouldDo,
    directions: meta.exploreAvoid,
    references: { title: 'Names already in the picture', icon: 'Sparkle' },
    rules: meta.constraints,
  };
  const sections = doc.sections.filter((sec) => !isBlank(sec.body) || sec.points.some((p) => !isBlank(p.text)));

  return (
    <div className="v4-cbrief">
      {sections.map((sec, i) => {
        const l = look[sec.kind] || look.aim;
        return (
          <div key={i} className="v4-brief-group">
            <BriefSectionHead title={isBlank(sec.heading) ? l.title : sec.heading} icon={l.icon} tone={tone} />
            {!isBlank(sec.body) && <p className="v4-cbrief-para">{sec.body}</p>}
            {sec.points.length > 0 && <Points items={sec.points} />}
          </div>
        );
      })}
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
