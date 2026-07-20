// V4 Sign-in modal — magic-link flow.
//
// ONE action: enter your email, get a magic link. "Creator" and "participant"
// aren't account types — the same account can run contests AND take part in
// others (the workspace lists both), so the sign-in doesn't ask you to pick a
// lane. (There used to be a second "Sign in as a participant" button; it hit
// the identical endpoint and only differed by a `?as=` param nothing read —
// a leftover from when it seeded the demo contest.)

import { useState, useEffect, useRef } from 'react';
import { X, PaperPlaneTilt } from '@phosphor-icons/react';
import { readSetup } from '../../utils/v4Brief';
import { useAuth } from '../../lib/AuthContext';
import keyImg from '../../assets/key.png';
import messageImg from '../../assets/message.png';
// Pull landing-v3 styles in so the modal's .btn-primary / .btn-secondary
// (and their hover-slide animation) resolve correctly even when the modal
// is mounted outside the v4 page tree (e.g. triggered from the landing).
import '../../styles/landing-v3.css';

export default function SignInModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('input'); // 'input' | 'sent'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const { signInWithEmail } = useAuth();

  // Reset on open / close on Escape
  useEffect(() => {
    if (!open) return;
    setPhase('input');
    setSubmitting(false);
    setError('');
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

  // Validate email + send a REAL Supabase magic link. Same email = same
  // account, whether they run contests, take part in them, or both.
  const sendLink = async () => {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    const redirectTo = `${window.location.origin}/v4/settings`;
    const { error: sendError } = await signInWithEmail(email, redirectTo);
    setSubmitting(false);
    if (sendError) {
      setError(sendError.message || 'Could not send the link. Please try again.');
      return;
    }
    setPhase('sent');
  };

  return (
    /* The .v4 wrapper scopes the CSS custom properties (--v4-bg, etc.)
       so the modal renders with the right colors even though it lives
       outside the v4 page tree (e.g. when triggered from the landing). */
    <div className="v4 lp-v3 v4-signin-overlay" onClick={onClose}>
      {/* Soft blush halo glow behind the modal — ties to the homepage warm
          palette so the modal reads as part of NamingContest, not a generic
          auth popup. */}
      <span className="v4-signin-halo" aria-hidden="true" />
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

        {/* Scattered decorative shapes around the corners — same vocabulary
            as the homepage hero dots, no gradient inside the modal. */}
        <span className="v4-signin-shape v4-signin-shape-1" aria-hidden="true" />
        <span className="v4-signin-shape v4-signin-shape-2" aria-hidden="true" />
        <span className="v4-signin-shape v4-signin-shape-3" aria-hidden="true" />
        <span className="v4-signin-shape v4-signin-shape-4" aria-hidden="true" />
        <span className="v4-signin-shape v4-signin-shape-5" aria-hidden="true" />

        {phase === 'input' && (
          <>
            <img
              className="v4-signin-hero-key"
              src={keyImg}
              alt=""
              aria-hidden="true"
            />
            <h2 id="v4-signin-title" className="v4-signin-title">Let’s get you in</h2>
            <p className="v4-signin-subtitle">
              Whether you run contests or take part in them — drop your email
              and we’ll send a magic link.
            </p>

            <form className="v4-signin-form" onSubmit={(e) => { e.preventDefault(); sendLink(); }}>
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
                className="btn btn-primary btn-lg v4-signin-submit"
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

            {error && (
              <p className="v4-signin-error" role="alert" style={{
                margin: '10px 2px 0', fontSize: '13px', lineHeight: 1.4,
                color: '#a8321f', fontFamily: 'var(--font-text)',
              }}>
                {error}
              </p>
            )}

            <p className="v4-signin-foot">
              New here? The same link creates your account.
            </p>
          </>
        )}

        {phase === 'sent' && (
          <>
            <img
              className="v4-signin-hero-key"
              src={messageImg}
              alt=""
              aria-hidden="true"
            />
            <h2 className="v4-signin-title">Check your email</h2>
            <p className="v4-signin-subtitle">
              We sent a link to <strong>{email}</strong>. Open it to continue —
              it works for 60 minutes.
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
      </div>
    </div>
  );
}
