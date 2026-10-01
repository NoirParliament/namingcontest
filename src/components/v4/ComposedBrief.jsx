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
// One component, three places: the creator's review (editable), the
// participant submit/vote cards and the locked dashboard recap (read-only).
// Settings rows, the host's note and the guides stay outside.
//
// Editing is "click, type, done": every piece of text is editable in place
// and nothing else. No lines are added (extend a sentence instead). A line
// whose text is cleared is removed, with Undo for a few seconds; a paragraph
// that is cleared comes back, since the brief needs it.

import { useEffect, useRef, useState } from 'react';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import BriefSectionHead from './BriefSectionHead';
import { composedSectionMeta } from '../../data/v4/briefRoles';
import { normalizeBriefDoc } from '../../utils/composeBrief';

const isBlank = (v) => !String(v ?? '').trim();

// Plain-text inline editor. contentEditable on the element itself, commit on
// blur; Enter commits (Shift+Enter breaks a line in a paragraph); Escape
// puts the old text back. `onClear` (when given) is called instead of
// commit when the text was emptied; without it, an emptied field gets its
// old text back.
function Text({ value, as: Tag = 'span', className = '', editable, onCommit, onClear, multiline = false }) {
  const ref = useRef(null);
  if (!editable) return <Tag className={className}>{value}</Tag>;
  const read = (el) => el.innerText.replace(/[ \t]+\n/g, '\n').trim();
  const finish = (el) => {
    const next = read(el);
    if (!next) {
      if (onClear) onClear();
      else el.innerText = value;
      return;
    }
    if (next !== value) onCommit(next);
  };
  return (
    <Tag
      ref={ref}
      className={`${className} v4-cbrief-editable`}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onBlur={(e) => finish(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !(multiline && e.shiftKey)) {
          e.preventDefault();
          e.currentTarget.blur();
        } else if (e.key === 'Escape') {
          e.currentTarget.innerText = value;
          e.currentTarget.blur();
        }
      }}
    >
      {value}
    </Tag>
  );
}

export default function ComposedBrief({ doc: rawDoc, subId, questions, tone, editable = false, onChange }) {
  // Undo for the last removed line: one slot, cleared after a few seconds
  // or on the next removal.
  const [removed, setRemoved] = useState(null); // { key, index, item, label }
  useEffect(() => {
    if (!removed) return undefined;
    const t = setTimeout(() => setRemoved(null), 7000);
    return () => clearTimeout(t);
  }, [removed]);

  const doc = normalizeBriefDoc(rawDoc);
  if (!doc) return null;
  const meta = composedSectionMeta(subId, questions);
  const set = (patch) => onChange && onChange(patch);
  const update = (key, i, next) => {
    const list = [...doc[key]];
    list[i] = next;
    set({ [key]: list });
  };
  const remove = (key, i, label) => {
    const list = [...doc[key]];
    const [item] = list.splice(i, 1);
    setRemoved({ key, index: i, item, label });
    set({ [key]: list });
  };
  const undo = () => {
    if (!removed) return;
    const list = [...doc[removed.key]];
    list.splice(Math.min(removed.index, list.length), 0, removed.item);
    set({ [removed.key]: list });
    setRemoved(null);
  };

  return (
    <div className={`v4-cbrief${editable ? ' is-editable' : ''}`}>
      {!isBlank(doc.about) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.about.title} icon={meta.about.icon} tone={tone} />
          <Text
            as="p"
            className="v4-cbrief-para"
            value={doc.about}
            editable={editable}
            multiline
            onCommit={(v) => set({ about: v })}
          />
        </div>
      )}

      {doc.shouldDo.length > 0 && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.shouldDo.title} icon={meta.shouldDo.icon} tone={tone} />
          <ul className="v4-cbrief-points">
            {doc.shouldDo.map((it, i) => (
              <li key={i} className="v4-cbrief-point">
                {!isBlank(it.label) && (
                  <>
                    <Text
                      as="strong"
                      className="v4-cbrief-point-lead"
                      value={it.label}
                      editable={editable}
                      onCommit={(v) => update('shouldDo', i, { ...it, label: v })}
                    />
                    <span className="v4-cbrief-point-dot">.</span>{' '}
                  </>
                )}
                <Text
                  className="v4-cbrief-point-text"
                  value={it.text}
                  editable={editable}
                  onCommit={(v) => update('shouldDo', i, { ...it, text: v })}
                  onClear={() => remove('shouldDo', i, it.label || it.text)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isBlank(doc.directions) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.exploreAvoid.title} icon={meta.exploreAvoid.icon} tone={tone} />
          <Text
            as="p"
            className="v4-cbrief-para"
            value={doc.directions}
            editable={editable}
            multiline
            onCommit={(v) => set({ directions: v })}
          />
        </div>
      )}

      {doc.constraints.length > 0 && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.constraints.title} icon={meta.constraints.icon} tone={tone} />
          <ul className="v4-cbrief-points">
            {doc.constraints.map((s, i) => (
              <li key={i} className="v4-cbrief-point">
                <Text
                  className="v4-cbrief-point-text"
                  value={s}
                  editable={editable}
                  onCommit={(v) => update('constraints', i, v)}
                  onClear={() => remove('constraints', i, s)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {editable && removed && (
        <div className="v4-cbrief-undo" role="status">
          <span>Removed “{(removed.label || 'a line').slice(0, 40)}”.</span>
          <button type="button" onClick={undo}>
            <ArrowCounterClockwise size={12} weight="bold" aria-hidden="true" />
            Undo
          </button>
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
