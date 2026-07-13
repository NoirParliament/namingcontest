// V4 Sign-in modal — magic-link flow.
//
// Two entry modes from the same email field:
//   - Creator ("Send magic link"): default, routes to your contest if you
//     have one, otherwise to the workspace.
//   - Participant ("Sign in as a participant"): same magic-link flow,
//     but seeds a join entry on the demo football contest and lands on
//     the workspace with that contest in the "Joined" section.
//
// In production both buttons would hit the same Supabase signInWithOtp
// endpoint and the magic-link target URL would carry a `?as=participant`
// flag the callback page reads. The "Open link" button here is a demo
// affordance — in production the link in the email replaces it.

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, PaperPlaneTilt, UsersThree,
} from '@phosphor-icons/react';
import { readSetup } from '../../utils/v4Brief';
import { useAuth } from '../../lib/AuthContext';
import keyImg from '../../assets/key.png';
import messageImg from '../../assets/message.png';
// Pull landing-v3 styles in so the modal's .btn-primary / .btn-secondary
// (and their hover-slide animation) resolve correctly even when the modal
// is mounted outside the v4 page tree (e.g. triggered from the landing).
import '../../styles/landing-v3.css';

// Per-mode button icon + label. The modal leads with whichever mode it
// was opened in (creator by default; participant when opened from the
// map's returning-participant entry), so the obvious action routes the
// user to the right place.
const MODE_META = {
  creator: { Icon: PaperPlaneTilt, label: 'Send magic link' },
  participant: { Icon: UsersThree, label: 'Sign in as a participant' },
};

export default function SignInModal({ open, onClose, initialMode = 'creator' }) {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('input'); // 'input' | 'sent'
  const [mode, setMode] = useState(initialMode); // 'creator' | 'participant'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { signInWithEmail } = useAuth();

  // Reset on open / close on Escape
  useEffect(() => {
    if (!open) return;
    setPhase('input');
    setMode(initialMode);
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
  }, [open, onClose, initialMode]);

  if (!open) return null;

  // Validate email + send a REAL Supabase magic link. The chosen mode is
  // carried on the redirect URL (?as=…) so the landing can route creators
  // vs. participants later. Same email = same account either way.
  const sendLink = async (nextMode) => {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setMode(nextMode);
    setSubmitting(true);
    const redirectTo = `${window.location.origin}/v4/settings?as=${nextMode}`;
    const { error: sendError } = await signInWithEmail(email, redirectTo);
    setSubmitting(false);
    if (sendError) {
      setError(sendError.message || 'Could not send the link. Please try again.');
      return;
    }
    setPhase('sent');
  };

  // The PRIMARY action follows how the modal was opened: a participant
  // entry (?signin=participant, e.g. from the platform map) leads with
  // the participant sign-in so pressing Enter / the big button lands on
  // the participant workspace — not the creator flow. The other mode is
  // offered as the secondary button.
  const primaryMode = initialMode === 'participant' ? 'participant' : 'creator';
  const secondaryMode = primaryMode === 'creator' ? 'participant' : 'creator';
  const PrimaryIcon = MODE_META[primaryMode].Icon;
  const SecondaryIcon = MODE_META[secondaryMode].Icon;

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
            <h2 id="v4-signin-title" className="v4-signin-title">Welcome back</h2>
            <p className="v4-signin-subtitle">
              Drop your email — we’ll send a magic link. No password to remember.
            </p>

            <form className="v4-signin-form" onSubmit={(e) => { e.preventDefault(); sendLink(primaryMode); }}>
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
                {submitting && mode === primaryMode ? (
                  <>Sending&hellip;</>
                ) : (
                  <>
                    <PrimaryIcon weight="bold" size={14} />
                    {MODE_META[primaryMode].label}
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

            <div className="v4-signin-divider" aria-hidden="true">
              <span>or</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-lg v4-signin-participant"
              onClick={() => sendLink(secondaryMode)}
              disabled={submitting}
            >
              {submitting && mode === secondaryMode ? (
                <>Sending&hellip;</>
              ) : (
                <>
                  <SecondaryIcon weight="bold" size={14} />
                  {MODE_META[secondaryMode].label}
                </>
              )}
            </button>

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
            <img
              className="v4-signin-hero-key"
              src={messageImg}
              alt=""
              aria-hidden="true"
            />
            <h2 className="v4-signin-title">Check your email</h2>
            <p className="v4-signin-subtitle">
              We sent a sign-in link to <strong>{email}</strong>. Open it to
              continue — the link works for 60 minutes.
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
