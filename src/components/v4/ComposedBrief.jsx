// The composed brief: the participant-facing document written from the
// creator's answers (compose-brief), rendered under the same section heads
// as the Q&A card it replaces so it reads as the same brief, just finished.
//
// One component, three places: the creator's review (editable: click any
// text, type, click away), the participant submit/vote cards and the locked
// dashboard recap (read-only). Settings rows, the host's note and the guides
// stay outside; this is only the written part.

import { useRef } from 'react';
import BriefSectionHead from './BriefSectionHead';
import { composedSectionMeta } from '../../data/v4/briefRoles';

// Plain-text inline editor. contentEditable on a span, commit on blur, Enter
// commits too (a brief line is one line). Emptying a list item removes it.
function Text({ value, as: Tag = 'span', className = '', editable, onCommit, multiline = false }) {
  const ref = useRef(null);
  if (!editable) return <Tag className={className}>{value}</Tag>;
  return (
    <Tag
      ref={ref}
      className={`${className} v4-cbrief-editable`}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onBlur={(e) => {
        const next = e.currentTarget.innerText.replace(/\s+\n/g, '\n').trim();
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

export default function ComposedBrief({ doc, subId, questions, tone, editable = false, onChange }) {
  if (!doc) return null;
  const meta = composedSectionMeta(subId, questions);
  const set = (patch) => onChange && onChange(patch);
  const setItem = (key, i, field, next) => {
    const list = [...(doc[key] || [])];
    if (field) {
      list[i] = { ...list[i], [field]: next };
      if (!list[i].text && !list[i].note) list.splice(i, 1);
    } else if (next) {
      list[i] = next;
    } else {
      list.splice(i, 1);
    }
    set({ [key]: list });
  };
  const openOnly = (list) => list?.length === 1 && /^open$/i.test(list[0]);

  return (
    <div className="v4-cbrief">
      {doc.about && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.about.title} icon={meta.about.icon} tone={tone} />
          <Text
            as="p"
            className="v4-cbrief-about"
            value={doc.about}
            editable={editable}
            multiline
            onCommit={(v) => set({ about: v })}
          />
        </div>
      )}

      {doc.shouldDo?.length > 0 && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.shouldDo.title} icon={meta.shouldDo.icon} tone={tone} />
          <ul className="v4-cbrief-list">
            {doc.shouldDo.map((b, i) => (
              <li key={i} className="v4-cbrief-item">
                <Text
                  as="strong"
                  className="v4-cbrief-item-label"
                  value={b.label}
                  editable={editable}
                  onCommit={(v) => setItem('shouldDo', i, 'label', v)}
                />
                <Text
                  className="v4-cbrief-item-text"
                  value={b.text}
                  editable={editable}
                  onCommit={(v) => setItem('shouldDo', i, 'text', v)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {(doc.explore?.length > 0 || doc.avoid?.length > 0 || doc.watchouts?.length > 0) && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.exploreAvoid.title} icon={meta.exploreAvoid.icon} tone={tone} />
          <div className="v4-cbrief-dirs">
            {doc.explore?.length > 0 && (
              <div className={`v4-cbrief-dir${openOnly(doc.explore) ? ' is-open' : ''}`}>
                <span className="v4-cbrief-dir-label">Lean toward</span>
                <ul className="v4-cbrief-dir-list">
                  {doc.explore.map((s, i) => (
                    <li key={i}>
                      <Text value={s} editable={editable} onCommit={(v) => setItem('explore', i, null, v)} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {doc.avoid?.length > 0 && (
              <div className={`v4-cbrief-dir v4-cbrief-dir-avoid${openOnly(doc.avoid) ? ' is-open' : ''}`}>
                <span className="v4-cbrief-dir-label">Steer clear of</span>
                <ul className="v4-cbrief-dir-list">
                  {doc.avoid.map((s, i) => (
                    <li key={i}>
                      <Text value={s} editable={editable} onCommit={(v) => setItem('avoid', i, null, v)} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {doc.watchouts?.length > 0 && (
            <div className="v4-cbrief-watch">
              <span className="v4-cbrief-dir-label">Names already in the picture</span>
              <ul className="v4-cbrief-list">
                {doc.watchouts.map((w, i) => (
                  <li key={i} className="v4-cbrief-item">
                    <Text
                      as="strong"
                      className="v4-cbrief-item-label"
                      value={w.name}
                      editable={editable}
                      onCommit={(v) => setItem('watchouts', i, 'name', v)}
                    />
                    <Text
                      className="v4-cbrief-item-text"
                      value={w.note}
                      editable={editable}
                      onCommit={(v) => setItem('watchouts', i, 'note', v)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {doc.constraints?.length > 0 && (
        <div className="v4-brief-group">
          <BriefSectionHead title={meta.constraints.title} icon={meta.constraints.icon} tone={tone} />
          <ul className="v4-cbrief-dir-list v4-cbrief-constraints">
            {doc.constraints.map((s, i) => (
              <li key={i}>
                <Text value={s} editable={editable} onCommit={(v) => setItem('constraints', i, null, v)} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Shown on the review page while compose-brief is writing. Three grey lines
// per section in the shape of the real thing, so the card doesn't jump when
// the text lands.
export function ComposedBriefSkeleton({ subId, questions, tone }) {
  const meta = composedSectionMeta(subId, questions);
  return (
    <div className="v4-cbrief v4-cbrief-skeleton" aria-busy="true" aria-label="Writing your brief">
      <div className="v4-cbrief-skeleton-note">
        <span className="v4-typing"><span /><span /><span /></span>
        Writing your brief from your answers
      </div>
      {[meta.about, meta.shouldDo, meta.exploreAvoid].map((m) => (
        <div key={m.title} className="v4-brief-group">
          <BriefSectionHead title={m.title} icon={m.icon} tone={tone} />
          <div className="v4-cbrief-skeleton-lines">
            <span style={{ width: '92%' }} /><span style={{ width: '78%' }} /><span style={{ width: '55%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
