// V4 final review + launch screen — summarizes the full setup and
// presents a single "Launch contest" CTA. This is the last screen
// in the creator setup flow before the contest goes live.

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  X, PencilSimple, CheckCircle, Rocket,
  Heart, UsersThree, Briefcase,
} from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import { readSetup, writeSetup, getSegmentLabel } from '../../utils/v4Brief';
import { BRIEF_QUESTIONS, SHARED_SETTINGS_QUESTIONS } from '../../data/v4/briefQuestions';
import LaunchModal from '../../components/v4/LaunchModal';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

const TIER_ICON = {
  personal: { Icon: Heart,      tone: { bg: '#fadecc', fg: '#9c4818' } },
  group:    { Icon: UsersThree, tone: { bg: '#c4cff5', fg: '#283b78' } },
  business: { Icon: Briefcase,  tone: { bg: '#bce5c8', fg: '#1f5430' } },
};

// Display helper — same logic as SettingsChat so the review matches.
function formatAnswer(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value === '[configure-later]') return 'Configure after launch';
  if (value && typeof value === 'object') {
    if ('enabled' in value) {
      if (!value.enabled) return 'No';
      if (value.text) return value.text;
      if (value.name) return value.name;
      if (value.configureAfterLaunch) return 'Set up after launch';
      return 'Yes';
    }
  }
  return String(value);
}

export default function ReviewLaunch() {
  const navigate = useNavigate();
  const [launching, setLaunching] = useState(false);
  const setup = readSetup();

  // Track scroll for the glass nav state (matches BriefChat behavior)
  const scrollRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => setIsScrolled(el.scrollTop > 8);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);
  const subId = setup.subSegmentId || 'b1';
  const segmentLabel = getSegmentLabel(subId);
  const tierMeta = TIER_ICON[setup.group] || TIER_ICON.business;

  const briefQuestions = BRIEF_QUESTIONS[subId]?.questions || [];
  const briefAnswers = setup.brief || {};
  const settingsAnswers = setup.settings || {};

  // Filter brief questions to only those that were answered
  const filledBrief = briefQuestions.filter((q) => briefAnswers[q.id] !== undefined);
  const filledSettings = SHARED_SETTINGS_QUESTIONS.filter((q) => settingsAnswers[q.id] !== undefined);

  // ?launch=1 (from the platform map) auto-opens the launch/checkout
  // modal so that flow step lands directly on it.
  const [searchParams] = useSearchParams();
  const [launchOpen, setLaunchOpen] = useState(
    () => searchParams.get('launch') === '1'
  );

  const handleLaunch = () => {
    if (launching) return;
    // Open the combined Launch modal (email + Stripe payment).
    // This always opens — even if userEmail was set by an earlier
    // save-progress, we still need to collect payment.
    setLaunchOpen(true);
  };

  const handleLaunchSuccess = () => {
    setLaunchOpen(false);
    setLaunching(true);
    // PROTOTYPE: pin every launched contest to the mock demo contest
    // so the dashboard is always populated regardless of what segment
    // the user picked or what they filled in. Production would POST
    // to backend and route to the real new contest ID instead.
    writeSetup({ contestId: 'mock_ongoing_1', launchedAt: Date.now() });
    setTimeout(() => navigate('/v4/contest/mock_ongoing_1'), 600);
  };

  return (
    <div className="v4 lp-v3">
      <div className="v4-screen">
        <span className="v4-blob v4-blob-1" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-2" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-3" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-4" aria-hidden="true"></span>

        <main className="v4-review" role="main" ref={scrollRef}>
          {/* Glass nav — sticky inside review scroll */}
          <header className={`v4-nav ${isScrolled ? 'is-scrolled' : ''}`}>
            <Link to="/" className="v4-brand">
              <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
            </Link>
            <div className="v4-progress">
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-active"></span>
              <span className="v4-step-label">Review</span>
            </div>
            <Link to="/" className="v4-exit" aria-label="Exit">
              <X weight="regular" size={14} />
              <span>Exit</span>
            </Link>
          </header>

          <div className="v4-review-inner">
          {/* Hero */}
          <div className="v4-review-hero">
            <span
              className="v4-review-badge"
              style={{ background: tierMeta.tone.bg, color: tierMeta.tone.fg }}
              aria-hidden="true"
            >
              <tierMeta.Icon weight="duotone" size={20} />
            </span>
            <h1 className="v4-review-title">
              {setup.workingName || 'Your contest'}
            </h1>
            <p className="v4-review-subtitle">
              {segmentLabel} · {setup.subSegmentTitle}
            </p>
          </div>

          {/* The brief */}
          {filledBrief.length > 0 && (
            <section className="v4-review-section">
              <header className="v4-review-section-head">
                <h2>Your brief</h2>
                <Link to="/v4/setup/brief" className="v4-review-edit" aria-label="Edit brief">
                  <PencilSimple size={12} weight="bold" />
                  <span>Edit</span>
                </Link>
              </header>
              <dl className="v4-review-list">
                {filledBrief.map((q) => (
                  <div key={q.id} className="v4-review-row">
                    <dt>{q.label}</dt>
                    <dd>{formatAnswer(briefAnswers[q.id])}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Settings — Edit points back to the unified /v4/setup/brief chat */}
          {filledSettings.length > 0 && (
            <section className="v4-review-section">
              <header className="v4-review-section-head">
                <h2>Settings</h2>
                <Link to="/v4/setup/brief" className="v4-review-edit" aria-label="Edit settings">
                  <PencilSimple size={12} weight="bold" />
                  <span>Edit</span>
                </Link>
              </header>
              <dl className="v4-review-list">
                {filledSettings.map((q) => (
                  <div key={q.id} className="v4-review-row">
                    <dt>{q.label}</dt>
                    <dd>{formatAnswer(settingsAnswers[q.id])}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Launch CTA */}
          <div className="v4-review-launch">
            <button
              type="button"
              className={`btn btn-primary btn-lg v4-launch-btn ${launching ? 'is-launching' : ''}`}
              onClick={handleLaunch}
              disabled={launching}
            >
              {launching ? (
                <>
                  <CheckCircle weight="duotone" size={20} />
                  <span>Launching…</span>
                </>
              ) : (
                <>
                  <Rocket weight="duotone" size={20} />
                  <span>Launch contest</span>
                </>
              )}
            </button>
            <p className="v4-review-fineprint">
              Participants will get a link to submit names. You can edit anything from your dashboard later.
            </p>
          </div>
          </div>
        </main>

        <LaunchModal
          open={launchOpen}
          contextLabel={setup.workingName || ''}
          tier={setup.group || 'personal'}
          onClose={() => setLaunchOpen(false)}
          onSuccess={handleLaunchSuccess}
        />
      </div>
    </div>
  );
}
