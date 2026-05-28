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
  X, EnvelopeSimple, PaperPlaneTilt, ArrowRight, CheckCircle, UsersThree,
} from '@phosphor-icons/react';
import { readSetup, writeSetup } from '../../utils/v4Brief';
import { joinContest, clearParticipation, recordSubmission } from '../../utils/v4Participant';
import { MOCK_CONTESTS } from '../../data/v4/mockContests';
// Pull landing-v3 styles in so the modal's .btn-primary / .btn-secondary
// (and their hover-slide animation) resolve correctly even when the modal
// is mounted outside the v4 page tree (e.g. triggered from the landing).
import '../../styles/landing-v3.css';

// Creator destination — the demo flow:
//   1. If the user already has a real contestId on their setup (because
//      they actually walked through pick → brief → launch), route to
//      that contest's manage page.
//   2. Otherwise seed the demo football contest as "their" launched
//      contest (workingName, contestId, subSegmentId, group, launchedAt)
//      so the manage page renders and the workspace shows a real
//      "Running" card. Also clears any prior participant state so the
//      demo isn't mixed (creator and participant on the same contest
//      reads confusingly).
function applyCreatorSignIn(email) {
  const e = (email || '').toLowerCase();
  const existing = readSetup();
  // Always persist the email + clear participant artifacts on creator
  // sign-in so the next page render reflects a clean creator view.
  clearParticipation('mock_ongoing_1');

  if (existing.contestId) {
    writeSetup({ userEmail: e });
    return `/v4/contest/${existing.contestId}`;
  }

  // Seed demo creator state from mock_ongoing_1. ContestManage reads
  // contest meta from MOCK_CONTESTS, so it'll render correctly.
  const seed = MOCK_CONTESTS.mock_ongoing_1;
  writeSetup({
    userEmail: e,
    contestId: seed.id,
    workingName: seed.workingName,
    subSegmentId: seed.subSegmentId,
    group: seed.group,
    launchedAt: Date.now(),
  });
  return `/v4/contest/${seed.id}`;
}

// Participant destination — workspace with the football contest seeded
// in the "Joined" section. Wipes any creator-side contest fields so the
// "Running" section shows the quiet "start a contest" nudge instead.
function applyParticipantSignIn(email) {
  const e = (email || 'demo@participant.com').toLowerCase();
  const displayName = e.split('@')[0];
  writeSetup({
    userEmail: e,
    userName: displayName,
    contestId: null,
    workingName: null,
    subSegmentId: null,
    group: null,
    launchedAt: null,
  });
  // Demo: ALWAYS reset participation on participant sign-in, then
  // SEED 3 mock submissions so the workspace lands in the
  // post-submission state with the live countdown + greyed-out vote
  // button visible immediately. (The fresh-participant chat flow is
  // accessible via /v4/join/mock_ongoing_1, which also resets.)
  joinContest('mock_ongoing_1', { name: displayName, email: e });
  [
    { text: 'Iron Boots FC',     whyItFits: `Sounds like Saturday-night football in the mud — and a long bus home.` },
    { text: 'Brookside Rovers',  whyItFits: `Local geography wins community loyalty. Easy chant: "ROVERS!"` },
    { text: 'North Park United', whyItFits: `Direct, two-syllable, chantable. Names the pitch.` },
  ].forEach((n) => recordSubmission('mock_ongoing_1', n));
  return '/v4/settings';
}

export default function SignInModal({ open, onClose, initialMode = 'creator' }) {
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('input'); // 'input' | 'sent' | 'success'
  const [mode, setMode] = useState(initialMode); // 'creator' | 'participant'
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Reset on open / close on Escape
  useEffect(() => {
    if (!open) return;
    setPhase('input');
    setMode(initialMode);
    setSubmitting(false);
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

  // Validate email + simulate "sending" the magic link. The selected
  // mode is captured at send time and carried through to the success
  // callback below.
  const sendLink = (nextMode) => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      window.alert('Please enter a valid email address.');
      return;
    }
    setMode(nextMode);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setPhase('sent');
    }, 600);
  };

  const handleSendCreatorLink = (e) => {
    e?.preventDefault();
    sendLink('creator');
  };

  const handleSendParticipantLink = () => {
    sendLink('participant');
  };

  // "Open the link" demo shortcut — branches on the captured mode.
  const handleSimulateClick = () => {
    setPhase('success');
    setTimeout(() => {
      const dest = mode === 'participant'
        ? applyParticipantSignIn(email.trim())
        : applyCreatorSignIn(email.trim());
      onClose?.();
      navigate(dest);
    }, 700);
  };

  return (
    /* The .v4 wrapper scopes the CSS custom properties (--v4-bg, etc.)
       so the modal renders with the right colors even though it lives
       outside the v4 page tree (e.g. when triggered from the landing). */
    <div className="v4 lp-v3 v4-signin-overlay" onClick={onClose}>
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

            <form className="v4-signin-form" onSubmit={handleSendCreatorLink}>
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
                {submitting && mode === 'creator' ? (
                  <>Sending&hellip;</>
                ) : (
                  <>
                    <PaperPlaneTilt weight="bold" size={14} />
                    Send magic link
                  </>
                )}
              </button>
            </form>

            <div className="v4-signin-divider" aria-hidden="true">
              <span>or</span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-lg v4-signin-participant"
              onClick={handleSendParticipantLink}
              disabled={submitting}
            >
              {submitting && mode === 'participant' ? (
                <>Sending&hellip;</>
              ) : (
                <>
                  <UsersThree weight="bold" size={14} />
                  Sign in as a participant
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
              className="btn btn-primary btn-lg v4-signin-submit"
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
          // Pick the right "where you're going" line based on mode.
          // Creator always lands on a contest (seeded if needed),
          // participant always lands on the workspace.
          const line = mode === 'participant'
            ? 'Taking you to your joined contest…'
            : 'Taking you to your contest…';
          return (
            <>
              <div className="v4-signin-icon-wrap v4-signin-icon-wrap-success">
                <CheckCircle weight="duotone" size={28} />
              </div>
              <h2 className="v4-signin-title">Welcome back</h2>
              <p className="v4-signin-subtitle">{line}</p>
            </>
          );
        })()}
      </div>
    </div>
  );
}
