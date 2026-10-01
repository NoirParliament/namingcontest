// The composed brief: the participant-facing document written from the
// creator's answers (compose-brief), rendered under the same section heads
// as the Q&A card it replaces so it reads as the same brief, just finished.
//
// One component, three places: the creator's review (editable), the
// participant submit/vote cards and the locked dashboard recap (read-only).
// Settings rows, the host's note and the guides stay outside; this is only
// the written part.
//
// Editing is a document, not a form: click text and type. Enter at the end
// of a line starts the next one; Backspace on an empty line removes it; the
// × on hover removes a line too (with Undo). "Open" and "None" are editable
// like any other line, so a question skipped in the chat can still be
// filled in here. Nothing is added unless the creator types it.

import { useEffect, useRef, useState } from 'react';
import { X, ArrowCounterClockwise } from '@phosphor-icons/react';
import BriefSectionHead from './BriefSectionHead';
import { composedSectionMeta } from '../../data/v4/briefRoles';

const isOpen = (list) => list?.length === 1 && /^(open|none)$/i.test(list[0]);
const isBlank = (v) => !String(v ?? '').trim();

// Plain-text inline editor. contentEditable on the element itself, commit on
// blur; Enter commits and hands over to `onEnter` (next field or new line);
// Shift+Enter breaks a line in the paragraph; Escape puts the old text back;
// Backspace on an empty field calls `onEmptyBackspace`. Emptying an existing
// line and clicking away brings the old text back: the remove button and
// Backspace are the two ways to take a line out, so nothing vanishes by
// accident.
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

export default function ComposedBrief({ doc, subId, questions, tone, editable = false, onChange }) {
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

  if (!doc) return null;
  const meta = composedSectionMeta(subId, questions);
  const set = (patch) => onChange && onChange(patch);
  const lists = {
    shouldDo: { get: () => doc.shouldDo || [], blank: () => ({ label: '', text: '' }), name: (it) => it.label || it.text, empty: (it) => isBlank(it.label) && isBlank(it.text) },
    watchouts: { get: () => doc.watchouts || [], blank: () => ({ name: '', note: '' }), name: (it) => it.name || it.note, empty: (it) => isBlank(it.name) && isBlank(it.note) },
    explore: { get: () => doc.explore || [], blank: () => '', name: (it) => it, empty: isBlank },
    avoid: { get: () => doc.avoid || [], blank: () => '', name: (it) => it, empty: isBlank },
    constraints: { get: () => doc.constraints || [], blank: () => '', name: (it) => it, empty: isBlank },
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
    if (lists[key].empty(item)) {
      setList(key, list);
      return;
    }
    setRemoved({ key, index: i, item, label: lists[key].name(item) });
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

  const renderPairList = (key, fields, placeholders) => (
    <ul className="v4-cbrief-list">
      {lists[key].get().map((it, i) => (
        <li key={i} className="v4-cbrief-item">
          <Text
            as="strong"
            className="v4-cbrief-item-label"
            value={it[fields[0]]}
            placeholder={placeholders[0]}
            editable={editable}
            keepBlank
            autoFocus={wants(key, i, fields[0])}
            onCommit={(v) => updateField(key, i, fields[0], v)}
            onEnter={() => setFocusAt({ key, index: i, field: fields[1] })}
            onEmptyBackspace={() => { if (isBlank(it[fields[1]])) backOut(key, i, fields[1]); }}
          />
          <Text
            className="v4-cbrief-item-text"
            value={it[fields[1]]}
            placeholder={placeholders[1]}
            editable={editable}
            keepBlank
            autoFocus={wants(key, i, fields[1])}
            onCommit={(v) => updateField(key, i, fields[1], v)}
            onEnter={(v) => lineAfter(key, i, v, fields[0])}
            onEmptyBackspace={() => { if (isBlank(it[fields[0]])) backOut(key, i, fields[1]); else setFocusAt({ key, index: i, field: fields[0] }); }}
          />
          {editable && <RemoveButton label={lists[key].name(it)} onClick={() => remove(key, i)} />}
        </li>
      ))}
    </ul>
  );

  // One line per entry, no glyphs: the row label says what the list is.
  // An empty list (or the model's "Open") is one muted, editable word.
  const renderLines = (key, placeholder, emptyWord) => {
    const list = lists[key].get();
    const open = isOpen(list) || list.length === 0;
    if (open) {
      if (!editable) return <span className="v4-cbrief-open">{emptyWord}</span>;
      return (
        <Text
          className="v4-cbrief-open"
          value=""
          placeholder={emptyWord}
          editable
          keepBlank
          onCommit={(v) => { if (v) setList(key, [v]); }}
          onEnter={(v) => { if (v) { setList(key, [v, '']); setFocusAt({ key, index: 1 }); } }}
        />
      );
    }
    return (
      <ul className="v4-cbrief-lines">
        {list.map((s, i) => (
          <li key={i}>
            <Text
              value={s}
              placeholder={placeholder}
              editable={editable}
              keepBlank
              autoFocus={wants(key, i)}
              onCommit={(v) => update(key, i, v)}
              onEnter={(v) => lineAfter(key, i, v)}
              onEmptyBackspace={() => backOut(key, i)}
            />
            {editable && <RemoveButton label={s} onClick={() => remove(key, i)} />}
          </li>
        ))}
      </ul>
    );
  };

  const explore = lists.explore.get();
  const avoid = lists.avoid.get();
  const bothOpen = (isOpen(explore) || explore.length === 0) && (isOpen(avoid) || avoid.length === 0);
  const hasDirections = explore.length > 0 || avoid.length > 0 || lists.watchouts.get().length > 0 || editable;

  return (
    <div className={`v4-cbrief${editable ? ' is-editable' : ''}`}>
      {(doc.about || editable) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.about.title} icon={meta.about.icon} tone={tone} />
          <Text
            as="p"
            className="v4-cbrief-about"
            value={doc.about}
            placeholder="A few sentences of background"
            editable={editable}
            multiline
            onCommit={(v) => set({ about: v })}
          />
        </div>
      )}

      {(lists.shouldDo.get().length > 0 || editable) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.shouldDo.title} icon={meta.shouldDo.icon} tone={tone} />
          {renderPairList('shouldDo', ['label', 'text'], ['Short label', 'What participants should do'])}
        </div>
      )}

      {hasDirections && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.exploreAvoid.title} icon={meta.exploreAvoid.icon} tone={tone} />
          {bothOpen && !editable ? (
            /* Nothing to lean toward and nothing off-limits: one sentence,
               not two empty rows. */
            <p className="v4-cbrief-open-both">
              Nothing is ruled in or out. Explore freely, and let the sections above guide you.
            </p>
          ) : (
            /* Same grid as the rows above: label left, content right. */
            <ul className="v4-cbrief-list">
              <li className="v4-cbrief-item v4-cbrief-item-static">
                <strong className="v4-cbrief-item-label">Lean toward</strong>
                <div className="v4-cbrief-item-body">{renderLines('explore', 'Something to lean toward', 'Anything that fits the brief above')}</div>
              </li>
              <li className="v4-cbrief-item v4-cbrief-item-static">
                <strong className="v4-cbrief-item-label">Steer clear of</strong>
                <div className="v4-cbrief-item-body">{renderLines('avoid', 'Something off-limits', 'Nothing is off-limits')}</div>
              </li>
            </ul>
          )}
          {(lists.watchouts.get().length > 0 || editable) && (
            <div className="v4-cbrief-watch">
              <span className="v4-cbrief-dir-label">Names already in the picture</span>
              {lists.watchouts.get().length === 0 && editable ? (
                <Text
                  className="v4-cbrief-open"
                  value=""
                  placeholder="None yet"
                  editable
                  keepBlank
                  onCommit={(v) => { if (v) setList('watchouts', [{ name: v, note: '' }]); }}
                  onEnter={(v) => { if (v) { setList('watchouts', [{ name: v, note: '' }]); setFocusAt({ key: 'watchouts', index: 0, field: 'note' }); } }}
                />
              ) : (
                renderPairList('watchouts', ['name', 'note'], ['Name', 'What the host said about it'])
              )}
            </div>
          )}
        </div>
      )}

      {(lists.constraints.get().length > 0 || editable) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.constraints.title} icon={meta.constraints.icon} tone={tone} />
          <ul className="v4-cbrief-list">
            <li className="v4-cbrief-item v4-cbrief-item-static">
              <strong className="v4-cbrief-item-label">Every name must</strong>
              <div className="v4-cbrief-item-body">{renderLines('constraints', 'A requirement every name must meet', 'No hard requirements')}</div>
            </li>
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
    { ...meta.exploreAvoid, lines: ['38%', '42%'] },
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
