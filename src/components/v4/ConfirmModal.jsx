// V4 confirm dialog — on-brand replacement for window.confirm().
// Reusable: pass title/body/labels + onConfirm/onClose. Set `danger`
// for destructive actions (red confirm button + warning icon).
//
// Renders on the shared dimmed backdrop (.v4-auth-backdrop) so it
// centers and matches the sign-in / edit modals. Closes on Escape,
// backdrop click, or Cancel.

import { useEffect } from 'react';
import { X, Warning } from '@phosphor-icons/react';
import '../../styles/landing-v3.css';

export default function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="v4 lp-v3 v4-auth-backdrop v4-confirm-backdrop" onClick={onClose}>
      <div
        className="v4-confirm-modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="v4-confirm-title"
      >
        <button
          type="button"
          className="v4-auth-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X weight="regular" size={16} />
        </button>

        {danger && (
          <span className="v4-confirm-icon v4-confirm-icon-danger" aria-hidden="true">
            <Warning weight="duotone" size={24} />
          </span>
        )}

        <h2 id="v4-confirm-title" className="v4-confirm-title">{title}</h2>
        {body && <p className="v4-confirm-body">{body}</p>}

        <div className="v4-confirm-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn btn-sm ${danger ? 'v4-confirm-danger-btn' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
