// V4 magic-link auth modal — minimal-friction account creation.
// Used in two places:
//   1. Section break — optional "save progress" prompt (skippable)
//   2. Launch button — required before contest goes live
//
// Prototype behavior: just stash the email in localStorage and call onSuccess.
// In production: hit a real /auth/magic-link endpoint, show "check your inbox"
// state, and verify token from email.

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, EnvelopeSimple, X, CheckCircle } from '@phosphor-icons/react';

export default function AuthModal({
  open,
  mode = 'launch',           // 'launch' | 'save'
  onClose,
  onSuccess,                 // called with the email after stub auth
  contextLabel = '',         // e.g., the working name — shown for context
}) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      // Pre-fill if user already saved an email earlier
      try {
        const raw = localStorage.getItem('v4_contest_setup');
        const cur = raw ? JSON.parse(raw) : {};
        if (cur.userEmail) setEmail(cur.userEmail);
      } catch {}
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!open) {
      setSubmitted(false);
    }
  }, [open]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!isValidEmail) return;
    // Stub: in production this would POST to /auth/magic-link.
    // For prototype we save the email and treat it as authenticated.
    try {
      const raw = localStorage.getItem('v4_contest_setup');
      const cur = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        'v4_contest_setup',
        JSON.stringify({ ...cur, userEmail: email.trim() })
      );
    } catch {}
    setSubmitted(true);
    // Brief "magic link sent" pause before proceeding (feels like a real auth)
    setTimeout(() => {
      onSuccess?.(email.trim());
    }, 1100);
  };

  if (!open) return null;

  const title = mode === 'launch'
    ? 'Almost there — confirm your email'
    : 'Save your progress';

  const blurb = mode === 'launch'
    ? `We'll send you a magic link to manage ${contextLabel ? `"${contextLabel}"` : 'your contest'} and see results when voting closes.`
    : `Drop your email and we'll save what you've filled in so far. You can pick up where you left off from any device.`;

  const cta = mode === 'launch' ? 'Continue to launch' : 'Save & continue';

  return (
    <div className="v4-auth-backdrop" onClick={onClose}>
      <div
        className="v4-auth-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="v4-auth-title"
      >
        <button
          type="button"
          className="v4-auth-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X weight="regular" size={16} />
        </button>

        {!submitted && (
          <>
            <span className="v4-auth-icon" aria-hidden="true">
              <EnvelopeSimple weight="duotone" size={28} />
            </span>
            <h2 id="v4-auth-title" className="v4-auth-title">{title}</h2>
            <p className="v4-auth-blurb">{blurb}</p>

            <form className="v4-input-row v4-auth-form" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="email"
                className="v4-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                autoComplete="email"
              />
              <button
                type="submit"
                className="v4-input-submit"
                disabled={!isValidEmail}
                aria-label={cta}
              >
                <ArrowRight weight="bold" size={18} />
              </button>
            </form>

            <p className="v4-auth-fineprint">
              No password needed. We'll email you a one-tap login link.
            </p>
          </>
        )}

        {submitted && (
          <div className="v4-auth-success">
            <span className="v4-auth-icon v4-auth-icon-success" aria-hidden="true">
              <CheckCircle weight="duotone" size={28} />
            </span>
            <h2 className="v4-auth-title">Magic link sent</h2>
            <p className="v4-auth-blurb">
              Check <strong>{email.trim()}</strong> — your login link is on the way.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
