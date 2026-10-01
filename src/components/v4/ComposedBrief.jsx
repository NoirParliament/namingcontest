// The composed brief: the participant-facing document written from the
// creator's answers (compose-brief), rendered under the same section heads
// as the Q&A card it replaces so it reads as the same brief, just finished.
//
// One component, three places: the creator's review (editable: click any
// text and type; every line has its own remove button, with Undo; "Add a
// line" under each list), the participant submit/vote cards and the locked
// dashboard recap (read-only). Settings rows, the host's note and the guides
// stay outside; this is only the written part.

import { useEffect, useRef, useState } from 'react';
import { X, Plus, ArrowCounterClockwise } from '@phosphor-icons/react';
import BriefSectionHead from './BriefSectionHead';
import { composedSectionMeta } from '../../data/v4/briefRoles';

const isOpen = (list) => list?.length === 1 && /^open$/i.test(list[0]);

// Plain-text inline editor. contentEditable on the element itself, commit on
// blur, Enter commits (a brief line is one line; Shift+Enter in the
// paragraph breaks a line), Escape puts the old text back. Emptying a line
// never deletes it: the old text comes back, and the remove button is the
// one way to take a line out, so nothing vanishes by accident.
function Text({ value, as: Tag = 'span', className = '', placeholder, editable, onCommit, multiline = false, autoFocus = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);
  if (!editable) return <Tag className={className}>{value}</Tag>;
  return (
    <Tag
      ref={ref}
      className={`${className} v4-cbrief-editable`}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      data-placeholder={placeholder}
      onBlur={(e) => {
        const next = e.currentTarget.innerText.replace(/[ \t]+\n/g, '\n').trim();
        if (!next && value) {
          e.currentTarget.innerText = value;
          return;
        }
        if (next !== value) onCommit(next);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !(multiline && e.shiftKey)) {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === 'Escape') {
          e.currentTarget.innerText = value;
          e.currentTarget.blur();
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
      aria-label={`Remove ${label}`}
      title="Remove this line"
    >
      <X size={12} weight="bold" />
    </button>
  );
}

function AddLine({ onClick, children }) {
  return (
    <button type="button" className="v4-cbrief-add" onClick={onClick}>
      <Plus size={12} weight="bold" aria-hidden="true" />
      {children}
    </button>
  );
}

export default function ComposedBrief({ doc, subId, questions, tone, editable = false, onChange }) {
  // Undo for the last removed line: one slot, cleared after a few seconds
  // or on the next removal.
  const [removed, setRemoved] = useState(null); // { key, index, item, label }
  // The line just added, so its first field takes focus.
  const [fresh, setFresh] = useState(null); // { key, index }
  useEffect(() => {
    if (!removed) return undefined;
    const t = setTimeout(() => setRemoved(null), 7000);
    return () => clearTimeout(t);
  }, [removed]);

  if (!doc) return null;
  const meta = composedSectionMeta(subId, questions);
  const set = (patch) => onChange && onChange(patch);
  const lists = {
    shouldDo: { get: () => doc.shouldDo || [], blank: () => ({ label: '', text: '' }), name: (it) => it.label || it.text },
    watchouts: { get: () => doc.watchouts || [], blank: () => ({ name: '', note: '' }), name: (it) => it.name || it.note },
    explore: { get: () => doc.explore || [], blank: () => '', name: (it) => it },
    avoid: { get: () => doc.avoid || [], blank: () => '', name: (it) => it },
    constraints: { get: () => doc.constraints || [], blank: () => '', name: (it) => it },
  };
  const update = (key, i, next) => {
    const list = [...lists[key].get()];
    list[i] = next;
    set({ [key]: list });
  };
  const updateField = (key, i, field, next) => update(key, i, { ...lists[key].get()[i], [field]: next });
  const remove = (key, i) => {
    const list = [...lists[key].get()];
    const [item] = list.splice(i, 1);
    setRemoved({ key, index: i, item, label: lists[key].name(item) });
    set({ [key]: list });
  };
  const undo = () => {
    if (!removed) return;
    const list = [...lists[removed.key].get()];
    list.splice(Math.min(removed.index, list.length), 0, removed.item);
    set({ [removed.key]: list });
    setRemoved(null);
  };
  const add = (key) => {
    // An "Open" placeholder gives way to the first real line.
    const cur = lists[key].get();
    const list = isOpen(cur) ? [] : [...cur];
    list.push(lists[key].blank());
    setFresh({ key, index: list.length });
    set({ [key]: list });
  };
  // A line left blank stays on screen with its placeholder (so nothing
  // disappears under the creator's cursor while they tab between the two
  // fields); the remove button takes it out, and launch strips any blanks
  // (cleanBriefDoc in utils/composeBrief).
  const commitBlankAware = (key, i, next, field) => {
    if (field) updateField(key, i, field, next);
    else update(key, i, next);
  };
  const isFresh = (key, i) => fresh && fresh.key === key && fresh.index === i + 1;

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
            autoFocus={isFresh(key, i)}
            onCommit={(v) => commitBlankAware(key, i, v, fields[0])}
          />
          <Text
            className="v4-cbrief-item-text"
            value={it[fields[1]]}
            placeholder={placeholders[1]}
            editable={editable}
            onCommit={(v) => commitBlankAware(key, i, v, fields[1])}
          />
          {editable && <RemoveButton label={lists[key].name(it) || 'this line'} onClick={() => remove(key, i)} />}
        </li>
      ))}
    </ul>
  );

  const renderLineList = (key, placeholder, extraClass = '') => {
    const list = lists[key].get();
    if (isOpen(list) && !editable) return <p className="v4-cbrief-open">Open</p>;
    return (
      <ul className={`v4-cbrief-lines ${extraClass}`}>
        {list.map((s, i) => (
          <li key={i} className={isOpen(list) ? 'is-open' : ''}>
            <Text
              value={s}
              placeholder={placeholder}
              editable={editable}
              autoFocus={isFresh(key, i)}
              onCommit={(v) => commitBlankAware(key, i, v)}
            />
            {editable && !isOpen(list) && <RemoveButton label={s} onClick={() => remove(key, i)} />}
          </li>
        ))}
      </ul>
    );
  };

  const explore = lists.explore.get();
  const avoid = lists.avoid.get();
  const bothOpen = isOpen(explore) && isOpen(avoid);
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
          {editable && <AddLine onClick={() => add('shouldDo')}>Add a point</AddLine>}
        </div>
      )}

      {hasDirections && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.exploreAvoid.title} icon={meta.exploreAvoid.icon} tone={tone} />
          {bothOpen && !editable ? (
            /* Nothing to lean toward and nothing off-limits: one sentence,
               not two empty columns. */
            <p className="v4-cbrief-open-both">
              Nothing is ruled in or out. Explore freely, and let the sections above guide you.
            </p>
          ) : (
            <div className="v4-cbrief-dirs">
              <div className="v4-cbrief-dir">
                <span className="v4-cbrief-dir-label">Lean toward</span>
                {renderLineList('explore', 'Something to lean toward')}
                {editable && <AddLine onClick={() => add('explore')}>Add</AddLine>}
              </div>
              <div className="v4-cbrief-dir v4-cbrief-dir-avoid">
                <span className="v4-cbrief-dir-label">Steer clear of</span>
                {renderLineList('avoid', 'Something off-limits')}
                {editable && <AddLine onClick={() => add('avoid')}>Add</AddLine>}
              </div>
            </div>
          )}
          {(lists.watchouts.get().length > 0 || editable) && (
            <div className="v4-cbrief-watch">
              <span className="v4-cbrief-dir-label">Names already in the picture</span>
              {renderPairList('watchouts', ['name', 'note'], ['Name', 'What the host said about it'])}
              {editable && <AddLine onClick={() => add('watchouts')}>Add a name</AddLine>}
            </div>
          )}
        </div>
      )}

      {(lists.constraints.get().length > 0 || editable) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.constraints.title} icon={meta.constraints.icon} tone={tone} />
          {lists.constraints.get().length === 0 && editable && (
            <p className="v4-cbrief-open">None</p>
          )}
          {renderLineList('constraints', 'A requirement every name must meet', 'v4-cbrief-constraints')}
          {editable && <AddLine onClick={() => add('constraints')}>Add a requirement</AddLine>}
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
