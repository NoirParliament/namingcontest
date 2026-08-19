// Floating "pick up where you left off" pill — surfaces the browser's one
// pending draft (creator brief or participant names, whichever was touched
// last) on the landing page and the Namespace. Browser-local, so it works
// the same signed in or out.
//
// Placement: bottom-right corner — the convention Gmail set for minimized
// drafts (top corners belong to the nav and the account menu). Like that
// bar, the pill stays until you act on it: Continue resumes, the trash
// deletes behind the platform confirm. No "hide" — the pill is the draft's
// only reliable handle (the Start-a-contest CTAs reset the setup blob by
// design), so a hidden pill would orphan real work.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash } from '@phosphor-icons/react';
import { getPendingDraft, deleteDraft } from '../../utils/v4Drafts';
import ConfirmModal from './ConfirmModal';

export default function ResumeDraftPill() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setDraft(getPendingDraft());
  }, []);

  if (!draft) return null;

  const eyebrow =
    draft.kind === 'creator' ? 'Draft in progress' : 'Unsent suggestions';

  return (
    <>
      <div className="v4 lp-v3" style={{ display: 'contents' }}>
        <a
          className="v4-resume-pill"
          href={draft.href}
          onClick={(e) => {
            e.preventDefault();
            navigate(draft.href);
          }}
          aria-label={`Continue your draft: ${draft.title}`}
        >
          <span className="v4-resume-pill-text">
            <span className="v4-resume-pill-eyebrow">{eyebrow}</span>
            <span className="v4-resume-pill-title">{draft.title}</span>
          </span>
          <span className="v4-resume-pill-cta">
            Continue <span aria-hidden="true">→</span>
          </span>
          <button
            type="button"
            className="v4-resume-pill-dismiss"
            aria-label="Delete draft"
            title="Delete draft"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setConfirmingDelete(true);
            }}
          >
            <Trash weight="regular" size={13} />
          </button>
        </a>
      </div>

      <ConfirmModal
        open={confirmingDelete}
        title="Delete this draft?"
        body={
          draft.kind === 'creator'
            ? 'Your setup answers will be gone for good. Starting fresh later means answering everything again.'
            : 'Your unsent name suggestions will be gone for good.'
        }
        confirmLabel="Delete draft"
        cancelLabel="Keep it"
        tone="danger"
        onConfirm={() => {
          deleteDraft(draft);
          setConfirmingDelete(false);
          setDraft(null);
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}
