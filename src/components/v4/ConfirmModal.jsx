// V4 confirm modal — the platform's own dialog, used in place of the native
// window.confirm() for the setup flow (exit, destructive segment change) and
// the draft pill's delete. Same backdrop + card family as the sign-in / edit
// modals — including a minimal take on the signature scattered shapes — so a
// yes/no question looks like it belongs to the product, not the browser.
//
// Controlled: render it with open=true when a decision is pending; it calls
// onConfirm / onCancel and the parent closes it. Escape and backdrop click
// both cancel (the safe choice).

import { useEffect, useMemo } from 'react';

// Per-open jitter for the three decorative shapes — same recipe as the
// edit modal's five, scaled down to a small dialog.
function useShapeSeeds(open) {
  return useMemo(() => {
    if (!open) return null;
    return Array.from({ length: 3 }, () => ({
      dx: Math.round((Math.random() - 0.5) * 20),
      dy: Math.round((Math.random() - 0.5) * 20),
      scale: 0.85 + Math.random() * 0.4,
      delay: -Math.random() * 10,
    }));
  }, [open]);
}

export default function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  // 'default' → dark ink confirm button; 'danger' → the confirm carries the
  // weight of a destructive action (segment change, draft delete).
  tone = 'default',
  onConfirm,
  onCancel,
}) {
  const shapeSeeds = useShapeSeeds(open);

  // Escape cancels — the modal shouldn't trap someone who opened it by
  // accident (which is exactly how the exit confirm gets hit).
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="v4 lp-v3 v4-auth-backdrop" onClick={onCancel}>
      <span className="v4-confirm-halo" aria-hidden="true" />
      <div
        className="v4-confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="v4-confirm-title"
        aria-describedby={body ? 'v4-confirm-body' : undefined}
      >
        {/* Minimal scatter — three floating pastels, re-jittered per open,
            keeping the small dialog in the same family as the bigger
            modals without crowding the question. */}
        {shapeSeeds && shapeSeeds.map((s, i) => (
          <span
            key={i}
            className={`v4-confirm-shape v4-confirm-shape-${i + 1}`}
            style={{
              marginLeft: `${s.dx}px`,
              marginTop: `${s.dy}px`,
              '--jitter-scale': s.scale,
              animationDelay: `${s.delay}s`,
            }}
            aria-hidden="true"
          />
        ))}
        <h2 id="v4-confirm-title" className="v4-confirm-title">{title}</h2>
        {body && <p id="v4-confirm-body" className="v4-confirm-body">{body}</p>}
        <div className="v4-confirm-actions">
          <button
            type="button"
            className="v4-confirm-cancel"
            onClick={onCancel}
            autoFocus
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`v4-confirm-confirm${tone === 'danger' ? ' is-danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
