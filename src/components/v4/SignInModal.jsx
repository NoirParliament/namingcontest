// V4 Sign-in modal — magic-link flow.
//
// Prototype behavior: collect email → simulate sending a magic link →
// show a "check your email" state with a fake "Open link" button that
// completes the sign-in and routes the user to their contest page.
//
// In production, the "Send magic link" action would hit a Supabase
// auth endpoint (signInWithOtp) and the email link would carry the
// session token. The "Open link" button here is purely a demo affordance.

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, EnvelopeSimple, PaperPlaneTilt, ArrowRight, CheckCircle,
} from '@phosphor-icons/react';
import { readSetup, writeSetup } from '../../utils/v4Brief';

// Resolve the post-sign-in destination. If the user already has a
// contest on record, route to it. Otherwise route to Settings, where
// they can launch their first contest from the prominent CTA.
function resolveSignInDestination(email) {
  const existing = readSetup();
  writeSetup({ userEmail: email });
  if (existing.contestId) {
    return `/v4/contest/${existing.contestId}`;
  }
  return '/v4/settings';
}

export default function SignInModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('input'); // 'input' | 'sent' | 'success'
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Reset on open / close on Escape
  useEffect(() => {
    if (!open) return;
    setPhase('input');
    setSubmitting(false);
    setEmail(readSetup().userEmail || '');
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSendLink = (e) => {
    e?.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      window.alert('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    // Simulate the network round-trip to "send" the email.
    setTimeout(() => {
      setSubmitting(false);
      setPhase('sent');
    }, 600);
  };

  const handleSimulateClick = () => {
    setPhase('success');
    setTimeout(() => {
      const dest = resolveSignInDestination(email.trim());
      onClose?.();
      navigate(dest);
    }, 700);
  };

  return (
    /* The .v4 wrapper scopes the CSS custom properties (--v4-bg, etc.)
       so the modal renders with the right colors even though it lives
       outside the v4 page tree (e.g. when triggered from the landing). */
    <div className="v4 v4-signin-overlay" onClick={onClose}>
      <div
        className="v4-signin-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="v4-signin-title"
      >
        <button
          type="button"
          className="v4-signin-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X weight="regular" size={16} />
        </button>

        {phase === 'input' && (
          <>
            <div className="v4-signin-icon-wrap">
              <EnvelopeSimple weight="duotone" size={28} />
            </div>
            <h2 id="v4-signin-title" className="v4-signin-title">Sign in</h2>
            <p className="v4-signin-subtitle">
              No password — we'll email you a magic link.
            </p>

            <form className="v4-signin-form" onSubmit={handleSendLink}>
              <label className="v4-signin-field">
                <span className="v4-signin-field-label">Email</span>
                <input
                  ref={inputRef}
                  type="email"
                  className="v4-settings-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <button
                type="submit"
                className="v4-settings-btn v4-settings-btn-primary v4-signin-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>Sending&hellip;</>
                ) : (
                  <>
                    <PaperPlaneTilt weight="bold" size={14} />
                    Send magic link
                  </>
                )}
              </button>
            </form>

            <p className="v4-signin-foot">
              First time here?{' '}
              <a href="#start" onClick={(e) => { e.preventDefault(); onClose?.(); navigate('/v4/pick'); }}>
                Start a contest
              </a>{' '}
              instead.
            </p>
          </>
        )}

        {phase === 'sent' && (
          <>
            <div className="v4-signin-icon-wrap v4-signin-icon-wrap-sent">
              <PaperPlaneTilt weight="duotone" size={28} />
            </div>
            <h2 className="v4-signin-title">Check your email</h2>
            <p className="v4-signin-subtitle">
              We sent a sign-in link to <strong>{email}</strong>. Open it to
              continue — the link works for 15 minutes.
            </p>

            <button
              type="button"
              className="v4-settings-btn v4-settings-btn-primary v4-signin-submit"
              onClick={handleSimulateClick}
            >
              Open the link <ArrowRight weight="bold" size={14} />
            </button>
            <p className="v4-signin-foot v4-signin-foot-demo">
              ↑ Demo shortcut. In production this button wouldn't exist —
              you'd just click the link in your inbox.
            </p>

            <button
              type="button"
              className="v4-signin-link"
              onClick={() => setPhase('input')}
            >
              Use a different email
            </button>
          </>
        )}

        {phase === 'success' && (() => {
          const hasContest = !!readSetup().contestId;
          return (
            <>
              <div className="v4-signin-icon-wrap v4-signin-icon-wrap-success">
                <CheckCircle weight="duotone" size={28} />
              </div>
              <h2 className="v4-signin-title">Welcome back</h2>
              <p className="v4-signin-subtitle">
                {hasContest
                  ? 'Taking you to your contest…'
                  : 'No contests yet — taking you to your account…'}
              </p>
            </>
          );
        })()}
      </div>
    </div>
  );
}
