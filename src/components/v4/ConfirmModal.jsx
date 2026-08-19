// V4 confirm modal — the platform's own dialog, used in place of the native
// window.confirm() for the setup flow (exit, and the destructive segment
// change). Same backdrop + card family as the sign-in / edit modals so a
// yes/no question looks like it belongs to the product, not the browser.
//
// Controlled: render it with open=true when a decision is pending; it calls
// onConfirm / onCancel and the parent closes it. Escape and backdrop click
// both cancel (the safe choice).

import { useEffect } from 'react';

export default function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  // 'default' → dark ink confirm button; 'danger' → the confirm carries the
  // weight of a destructive action (used for the segment change that wipes
  // brief answers).
  tone = 'default',
  onConfirm,
  onCancel,
}) {
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
