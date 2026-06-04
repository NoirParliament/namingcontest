// V4 edit-question modal — opened from the brief recap on ContestManage.
// User clicks any answer row → this modal opens with the question prompt
// and the appropriate input type (reusing QuestionInput renderer). Save
// updates that single answer + closes. Cancel exits without changes.

import { useState, useEffect, useMemo } from 'react';
import { X } from '@phosphor-icons/react';
import QuestionInput from './QuestionInput';
import '../../styles/landing-v3.css';

// Re-seed each time the modal opens so the scattered shapes land in
// slightly different spots / drift at different phases. Subtle enough
// that the modal still reads as the same family, distinct enough that
// it doesn't feel like a stamped duplicate.
function useShapeSeeds(open) {
  return useMemo(() => {
    if (!open) return null;
    return Array.from({ length: 5 }, () => ({
      dx: Math.round((Math.random() - 0.5) * 28),   // ±14px lateral nudge
      dy: Math.round((Math.random() - 0.5) * 28),   // ±14px vertical nudge
      scale: 0.85 + Math.random() * 0.4,            // 0.85x – 1.25x
      delay: -Math.random() * 10,                   // 0 → -10s float offset
    }));
  }, [open]);
}

// Translate a segment palette (5 NC pastels, primary first) into the
// CSS variables the modal shapes read. Returns undefined when no
// palette is supplied so the stylesheet's fallback values render.
function paletteVars(palette) {
  if (!palette || !palette.length) return undefined;
  return {
    '--shape-c1': palette[0],
    '--shape-c2': palette[1],
    '--shape-c3': palette[2],
    '--shape-c4': palette[3],
    '--shape-c5': palette[4],
  };
}

export default function EditQuestionModal({
  open,
  question,
  currentAnswer,
  onClose,
  onSave,
  palette,
}) {
  // Hooks must run unconditionally — call useShapeSeeds even when the
  // modal is closed (it returns null in that case and we early-return
  // below the hook calls).
  const shapeSeeds = useShapeSeeds(open);
  if (!open || !question) return null;

  const handleSubmit = (newValue) => {
    onSave?.(newValue);
    onClose?.();
  };

  return (
    <div className="v4 lp-v3 v4-auth-backdrop" onClick={onClose}>
      {/* Soft blush halo behind the modal — same warm NamingContest
          glow used by the sign-in modal, ties the edit popup into the
          same family as the rest of the modal surfaces. */}
      <span className="v4-edit-halo" aria-hidden="true" />
      <div
        className="v4-edit-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="v4-edit-title"
        style={paletteVars(palette)}
      >
        <button
          type="button"
          className="v4-auth-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X weight="regular" size={16} />
        </button>

        {/* Scattered decorative shapes — same five-shape recipe as the
            sign-in modal, but re-seeded on each open with subtle
            position / scale / drift jitter so two opens never look
            identical. No icon hero: this is an inline edit popup. */}
        {shapeSeeds && shapeSeeds.map((s, i) => (
          <span
            key={i}
            className={`v4-edit-shape v4-edit-shape-${i + 1}`}
            style={{
              marginLeft: `${s.dx}px`,
              marginTop: `${s.dy}px`,
              // Compound the existing CSS transform with a per-instance
              // scale via a custom property (the stylesheet consumes
              // --jitter-scale and folds it into the existing transform).
              '--jitter-scale': s.scale,
              animationDelay: `${s.delay}s`,
            }}
            aria-hidden="true"
          />
        ))}

        <div className="v4-edit-modal-label">
          {question.label || 'Edit answer'}
        </div>
        <h2 id="v4-edit-title" className="v4-edit-modal-prompt">
          {question.prompt || question.label}
        </h2>

        {currentAnswer !== undefined && currentAnswer !== '' && (
          <div className="v4-edit-modal-current">
            <span className="v4-edit-modal-current-label">Current:</span>
            <span className="v4-edit-modal-current-value">
              {formatAnswerForDisplay(currentAnswer)}
            </span>
          </div>
        )}

        <div className="v4-edit-modal-input">
          <QuestionInput
            question={question}
            onSubmit={handleSubmit}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

function formatAnswerForDisplay(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (Array.isArray(value)) return value.join(' · ');
  if (value && typeof value === 'object') {
    if ('enabled' in value) {
      if (!value.enabled) return 'No';
      if (value.text) return value.text;
      if (value.name) return value.name;
      return 'Yes';
    }
    // Sub-segment option object ({ id, title, body, icon, tone }) — used
    // when BriefChat opens the modal on the very first segment-pick turn.
    if (value.title) return value.title;
    if (value.name) return value.name;
  }
  return String(value);
}
