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
import BrandLink from '../../components/v4/BrandLink';
import { readSetup, writeSetup, getSegmentLabel } from '../../utils/v4Brief';
import { BRIEF_QUESTIONS, SHARED_SETTINGS_QUESTIONS } from '../../data/v4/briefQuestions';
import { SegmentThemeBackdrop, getSegmentTone, getSegmentIcon, getSegmentPalette } from '../../data/v4/segmentTheme';
import LaunchModal from '../../components/v4/LaunchModal';
import EditQuestionModal from '../../components/v4/EditQuestionModal';
import ExitLink from '../../components/v4/ExitLink';
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
  // Per-row edit modal state — same pattern as ContestManage's
  // brief recap, so editing happens in-place instead of bouncing
  // the user back to the full chat.
  const [editingQuestion, setEditingQuestion] = useState(null); // {question, section}
  // Re-read setup on every save so the recap reflects the new answer
  // without a remount.
  const [editTick, setEditTick] = useState(0);
  const setup = readSetup();
  void editTick; // keep eslint quiet — used as the re-read trigger

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
  // Hero badge now uses the SEGMENT icon + tone (Trophy for any
  // sports team, PawPrint for any pet, etc.) — matches the Manage
  // page so a contest looks like itself everywhere. Tier-icon
  // fallback for unknown segments only.
  const segmentTone = getSegmentTone(subId);
  const SegmentIcon = getSegmentIcon(subId);
  const segmentPalette = getSegmentPalette(subId);
  const tierMeta = TIER_ICON[setup.group] || TIER_ICON.business;
  const HeroIcon = SegmentIcon || tierMeta.Icon;
  const heroTone = SegmentIcon ? segmentTone : tierMeta.tone;

  const briefQuestions = BRIEF_QUESTIONS[subId]?.questions || [];
  const briefAnswers = setup.brief || {};
  const settingsAnswers = setup.settings || {};

  const handleEditSave = (newValue) => {
    if (!editingQuestion) return;
    const { question, section } = editingQuestion;
    const cur = readSetup();
    if (section === 'brief') {
      writeSetup({ brief: { ...(cur.brief || {}), [question.id]: newValue } });
    } else if (section === 'settings') {
      writeSetup({ settings: { ...(cur.settings || {}), [question.id]: newValue } });
    }
    setEditTick((t) => t + 1);
  };

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
    setTimeout(() => navigate('/v4/contest/mock_ongoing_1?phase=submission'), 600);
  };

  return (
    <div className="v4 lp-v3">
      <div className="v4-screen">
        {/* Segment-themed backdrop — same blobs + scattered theme
            icons + 2 anchor illustrations used by BriefChat, Manage,
            Participant pages, etc. Review now reads as part of the
            same family, washed in the segment's colours and props. */}
        <SegmentThemeBackdrop subId={subId} />

        <main className="v4-review" role="main" ref={scrollRef}>
          {/* Glass nav — sticky inside review scroll */}
          <header className={`v4-nav ${isScrolled ? 'is-scrolled' : ''}`}>
            <BrandLink />
            <div className="v4-progress">
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-active"></span>
              <span className="v4-step-label">Review</span>
            </div>
            <ExitLink to="/" aria-label="Exit" />
          </header>

          <div className="v4-review-inner">
          {/* Hero */}
          <div className="v4-review-hero">
            {/* Hero badge — segment icon over the segment tone, so
                the contest reads consistently here, on Manage, and
                in workspace cards. Tier-icon fallback if the segment
                isn't mapped. */}
            <span
              className="v4-review-badge"
              style={{ background: heroTone.bg, color: heroTone.fg }}
              aria-hidden="true"
            >
              <HeroIcon weight="duotone" size={20} />
            </span>
            <h1 className="v4-review-title">
              {setup.workingName || 'Your contest'}
            </h1>
            <p className="v4-review-subtitle">
              {segmentLabel} · {setup.subSegmentTitle}
            </p>
          </div>

          {/* The brief — each row is now a button that opens the
              EditQuestionModal in place. The old "Edit" section link
              that bounced back to the brief chat is gone. */}
          {filledBrief.length > 0 && (
            <section className="v4-review-section">
              <header className="v4-review-section-head">
                <h2>Your brief</h2>
                <span className="v4-review-section-hint">Click any answer to edit</span>
              </header>
              <ul className="v4-review-list v4-review-list-editable">
                {filledBrief.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      className="v4-review-row v4-review-row-edit"
                      onClick={() => setEditingQuestion({ question: q, section: 'brief' })}
                    >
                      <span className="v4-review-row-label">{q.label}</span>
                      <span className="v4-review-row-value">{formatAnswer(briefAnswers[q.id])}</span>
                      <PencilSimple size={12} weight="bold" className="v4-review-row-edit-icon" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Settings — same inline-edit pattern as the brief. */}
          {filledSettings.length > 0 && (
            <section className="v4-review-section">
              <header className="v4-review-section-head">
                <h2>Settings</h2>
                <span className="v4-review-section-hint">Click any answer to edit</span>
              </header>
              <ul className="v4-review-list v4-review-list-editable">
                {filledSettings.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      className="v4-review-row v4-review-row-edit"
                      onClick={() => setEditingQuestion({ question: q, section: 'settings' })}
                    >
                      <span className="v4-review-row-label">{q.label}</span>
                      <span className="v4-review-row-value">{formatAnswer(settingsAnswers[q.id])}</span>
                      <PencilSimple size={12} weight="bold" className="v4-review-row-edit-icon" />
                    </button>
                  </li>
                ))}
              </ul>
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
              You’ll get a link to share with your participants — and you can edit anything from your dashboard later.
            </p>
          </div>
          </div>
        </main>

        <LaunchModal
          open={launchOpen}
          contextLabel={setup.workingName || ''}
          tier={setup.group || 'personal'}
          palette={segmentPalette}
          onClose={() => setLaunchOpen(false)}
          onSuccess={handleLaunchSuccess}
        />

        {/* Per-row edit modal — same flow as ContestManage's brief
            recap. Opens in place over the review page, saves the
            updated answer into setup, bumps editTick so the visible
            recap rows re-render with the new value. */}
        <EditQuestionModal
          open={!!editingQuestion}
          question={editingQuestion?.question}
          currentAnswer={
            editingQuestion?.section === 'brief'
              ? briefAnswers[editingQuestion?.question?.id]
              : settingsAnswers[editingQuestion?.question?.id]
          }
          onClose={() => setEditingQuestion(null)}
          onSave={handleEditSave}
          palette={segmentPalette}
        />
      </div>
    </div>
  );
}
