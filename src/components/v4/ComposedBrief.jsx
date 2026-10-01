// The composed brief: the participant-facing document written from the
// creator's answers (compose-brief), rendered under the same section heads
// as the Q&A card it replaces so it reads as the same brief, just finished.
//
// It reads top to bottom like a brief, not a form: a background paragraph,
// the instructions as lines with a bold lead (Mark's own example), one
// written paragraph on what to explore and avoid (with the names already in
// the picture), and the hard requirements as sentences when there are any.
//
// One component, three places: the creator's review (editable), the
// participant submit/vote cards and the locked dashboard recap (read-only).
// Settings rows, the host's note and the guides stay outside.
//
// Editing is a document, not a form: click text and type. Enter at the end
// of a line starts the next one; Backspace on an empty line removes it; the
// × on hover removes a line too (with Undo). Nothing is added unless the
// creator types it.

import { useEffect, useRef, useState } from 'react';
import { X, ArrowCounterClockwise } from '@phosphor-icons/react';
import BriefSectionHead from './BriefSectionHead';
import { composedSectionMeta } from '../../data/v4/briefRoles';
import { normalizeBriefDoc } from '../../utils/composeBrief';

const isBlank = (v) => !String(v ?? '').trim();

// Plain-text inline editor. contentEditable on the element itself, commit on
// blur; Enter commits and hands over to `onEnter` (next field or new line);
// Shift+Enter breaks a line in a paragraph; Escape puts the old text back;
// Backspace on an empty field calls `onEmptyBackspace`. Emptying an existing
// line and clicking away brings the old text back (unless keepBlank): the
// remove button and Backspace are the ways to take a line out, so nothing
// vanishes by accident.
function Text({
  value, as: Tag = 'span', className = '', placeholder, editable, onCommit,
  multiline = false, autoFocus = false, onEnter, onEmptyBackspace, keepBlank = false,
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);
  if (!editable) return <Tag className={className}>{value}</Tag>;
  const read = (el) => el.innerText.replace(/[ \t]+\n/g, '\n').trim();
  return (
    <Tag
      ref={ref}
      className={`${className} v4-cbrief-editable`}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      data-placeholder={placeholder}
      onBlur={(e) => {
        const next = read(e.currentTarget);
        if (!next && value && !keepBlank) {
          e.currentTarget.innerText = value;
          return;
        }
        if (next !== value) onCommit(next);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !(multiline && e.shiftKey)) {
          e.preventDefault();
          const next = read(e.currentTarget);
          if (next !== value) onCommit(next);
          if (onEnter) onEnter(next);
          else e.currentTarget.blur();
        } else if (e.key === 'Escape') {
          e.currentTarget.innerText = value;
          e.currentTarget.blur();
        } else if (e.key === 'Backspace' && onEmptyBackspace && !read(e.currentTarget)) {
          e.preventDefault();
          onEmptyBackspace();
        }
      }}
    >
      {value}
    </Tag>
  );
}

function RemoveButton({ onClick, label }) {
  return (
    <button
      type="button"
      className="v4-cbrief-remove"
      onClick={onClick}
      aria-label={`Remove ${label || 'this line'}`}
      title="Remove this line"
    >
      <X size={12} weight="bold" />
    </button>
  );
}

export default function ComposedBrief({ doc: rawDoc, subId, questions, tone, editable = false, onChange }) {
  // Undo for the last removed line: one slot, cleared after a few seconds
  // or on the next removal.
  const [removed, setRemoved] = useState(null); // { key, index, item, label }
  // Where the caret should go after Enter / Backspace: { key, index, field }.
  const [focusAt, setFocusAt] = useState(null);
  useEffect(() => {
    if (!removed) return undefined;
    const t = setTimeout(() => setRemoved(null), 7000);
    return () => clearTimeout(t);
  }, [removed]);
  useEffect(() => {
    if (focusAt) setFocusAt(null);
  }, [focusAt]);

  const doc = normalizeBriefDoc(rawDoc);
  if (!doc) return null;
  const meta = composedSectionMeta(subId, questions);
  const set = (patch) => onChange && onChange(patch);
  const lists = {
    shouldDo: { get: () => doc.shouldDo, blank: () => ({ label: '', text: '' }), name: (it) => it.label || it.text, empty: (it) => isBlank(it.label) && isBlank(it.text) },
    constraints: { get: () => doc.constraints, blank: () => '', name: (it) => it, empty: isBlank },
  };
  const setList = (key, list) => set({ [key]: list });
  const update = (key, i, next) => {
    const list = [...lists[key].get()];
    list[i] = next;
    setList(key, list);
  };
  const updateField = (key, i, field, next) => update(key, i, { ...lists[key].get()[i], [field]: next });
  // Silent drop for blank lines (never had content, nothing to undo).
  const drop = (key, i) => {
    const list = [...lists[key].get()];
    list.splice(i, 1);
    setList(key, list);
  };
  const remove = (key, i) => {
    const list = [...lists[key].get()];
    const [item] = list.splice(i, 1);
    if (!lists[key].empty(item)) setRemoved({ key, index: i, item, label: lists[key].name(item) });
    setList(key, list);
  };
  const undo = () => {
    if (!removed) return;
    const list = [...lists[removed.key].get()];
    list.splice(Math.min(removed.index, list.length), 0, removed.item);
    setList(removed.key, list);
    setRemoved(null);
  };
  // Enter at the end of line i: a new line under it, caret in it. On a line
  // that is still blank, Enter just leaves (no stacking empties).
  const lineAfter = (key, i, current, firstField) => {
    if (isBlank(current) && lists[key].empty(lists[key].get()[i])) {
      drop(key, i);
      return;
    }
    const list = [...lists[key].get()];
    list.splice(i + 1, 0, lists[key].blank());
    setList(key, list);
    setFocusAt({ key, index: i + 1, field: firstField });
  };
  // Backspace on an empty line: remove it, caret to the line above.
  const backOut = (key, i, lastField) => {
    drop(key, i);
    if (i > 0) setFocusAt({ key, index: i - 1, field: lastField });
  };
  const wants = (key, i, field) => !!focusAt && focusAt.key === key && focusAt.index === i && (focusAt.field || null) === (field || null);

  return (
    <div className={`v4-cbrief${editable ? ' is-editable' : ''}`}>
      {(doc.about || editable) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.about.title} icon={meta.about.icon} tone={tone} />
          <Text
            as="p"
            className="v4-cbrief-para"
            value={doc.about}
            placeholder="A few sentences of background"
            editable={editable}
            multiline
            onCommit={(v) => set({ about: v })}
          />
        </div>
      )}

      {(doc.shouldDo.length > 0 || editable) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.shouldDo.title} icon={meta.shouldDo.icon} tone={tone} />
          <ul className="v4-cbrief-points">
            {doc.shouldDo.map((it, i) => (
              <li key={i} className="v4-cbrief-point">
                <Text
                  as="strong"
                  className="v4-cbrief-point-lead"
                  value={it.label}
                  placeholder="Short lead"
                  editable={editable}
                  keepBlank
                  autoFocus={wants('shouldDo', i, 'label')}
                  onCommit={(v) => updateField('shouldDo', i, 'label', v)}
                  onEnter={() => setFocusAt({ key: 'shouldDo', index: i, field: 'text' })}
                  onEmptyBackspace={() => { if (isBlank(it.text)) backOut('shouldDo', i, 'text'); }}
                />
                {(it.label || !editable) && <span className="v4-cbrief-point-dot">.</span>}
                {' '}
                <Text
                  className="v4-cbrief-point-text"
                  value={it.text}
                  placeholder="What participants should do"
                  editable={editable}
                  keepBlank
                  autoFocus={wants('shouldDo', i, 'text')}
                  onCommit={(v) => updateField('shouldDo', i, 'text', v)}
                  onEnter={(v) => lineAfter('shouldDo', i, v, 'label')}
                  onEmptyBackspace={() => { if (isBlank(it.label)) backOut('shouldDo', i, 'text'); else setFocusAt({ key: 'shouldDo', index: i, field: 'label' }); }}
                />
                {editable && <RemoveButton label={it.label || it.text} onClick={() => remove('shouldDo', i)} />}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(doc.directions || editable) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.exploreAvoid.title} icon={meta.exploreAvoid.icon} tone={tone} />
          <Text
            as="p"
            className="v4-cbrief-para"
            value={doc.directions}
            placeholder="What to lean toward, what is off-limits, and any names already in the picture"
            editable={editable}
            multiline
            keepBlank
            onCommit={(v) => set({ directions: v })}
          />
        </div>
      )}

      {(doc.constraints.length > 0 || editable) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.constraints.title} icon={meta.constraints.icon} tone={tone} />
          {doc.constraints.length === 0 ? (
            editable ? (
              <Text
                className="v4-cbrief-open"
                value=""
                placeholder="None. Type one to add it."
                editable
                keepBlank
                onCommit={(v) => { if (v) setList('constraints', [v]); }}
                onEnter={(v) => { if (v) { setList('constraints', [v, '']); setFocusAt({ key: 'constraints', index: 1 }); } }}
              />
            ) : null
          ) : (
            <ul className="v4-cbrief-points">
              {doc.constraints.map((s, i) => (
                <li key={i} className="v4-cbrief-point">
                  <Text
                    className="v4-cbrief-point-text"
                    value={s}
                    placeholder="A requirement every name must meet"
                    editable={editable}
                    keepBlank
                    autoFocus={wants('constraints', i)}
                    onCommit={(v) => update('constraints', i, v)}
                    onEnter={(v) => lineAfter('constraints', i, v)}
                    onEmptyBackspace={() => backOut('constraints', i)}
                  />
                  {editable && <RemoveButton label={s} onClick={() => remove('constraints', i)} />}
                </li>
              ))}
            </ul>
          )}
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
