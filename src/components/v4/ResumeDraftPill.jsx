// Floating "pick up where you left off" pill — surfaces the browser's one
// pending draft (creator brief or participant names, whichever was touched
// last) on the landing page and the Namespace. Browser-local, so it works
// the same signed in or out. Dismissing hides it for this browser session;
// the draft itself stays saved and the pill returns next visit.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from '@phosphor-icons/react';
import { getPendingDraft } from '../../utils/v4Drafts';

const DISMISS_KEY = 'v4_resume_dismissed';

export default function ResumeDraftPill() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch { /* ignore */ }
    setDraft(getPendingDraft());
  }, []);

  if (!draft) return null;

  const eyebrow =
    draft.kind === 'creator' ? 'Draft in progress' : 'Unsent suggestions';
  const cta = 'Continue';

  return (
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
          {cta} <span aria-hidden="true">→</span>
        </span>
        <button
          type="button"
          className="v4-resume-pill-dismiss"
          aria-label="Hide for now"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
            setDraft(null);
          }}
        >
          <X weight="bold" size={12} />
        </button>
      </a>
    </div>
  );
}
