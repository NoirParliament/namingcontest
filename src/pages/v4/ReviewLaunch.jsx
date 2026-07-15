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
import { priceForVoters, VOTER_TIER_QUESTION } from '../../data/v4/voterTiers';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
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
  const { user } = useAuth();
  const [launching, setLaunching] = useState(false);
  // Set after a GUEST launch — shows the "check your email" screen while the
  // Edge Function has created their account + contest and emailed the link.
  const [pendingEmail, setPendingEmail] = useState(null);
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
    } else if (section === 'voter') {
      writeSetup({ voterTier: newValue });
    }
    setEditTick((t) => t + 1);
  };

  // Show every brief question — answered ones with their answer, skipped
  // ones flagged (grey "Skipped") and still editable, so nothing silently
  // vanishes and the creator can fill any gap right here before launch.
  const isAnswered = (v) => v !== undefined && v !== null && v !== '';
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

  // Assemble the contest row from the current localStorage draft. It starts as
  // an UNPAID DRAFT — confirm-launch sets paid/status/timestamps once Stripe
  // confirms payment. brief + settings go in as jsonb.
  const buildContestRow = () => {
    const cur = readSetup();
    return {
      working_name: cur.workingName || null,
      tier: cur.group || null,
      sub_segment_id: cur.subSegmentId || null,
      sub_segment_title: cur.subSegmentTitle || null,
      brief: cur.brief || {},
      settings: cur.settings || {},
      voter_tier: cur.voterTier || null,
      price: cur.voterTier ? priceForVoters(cur.voterTier) : null,
      status: 'draft',
      paid: false,
    };
  };

  // STEP 1 (called by the launch modal before charging the card): create the
  // draft contest — directly for a signed-in creator, or via the Edge Function
  // for a guest (which also creates their account) — then a Stripe
  // PaymentIntent for its price. Returns the client secret to confirm the card.
  const createDraftAndIntent = async (email) => {
    const row = buildContestRow();
    let contestId;
    if (user?.id) {
      const { data, error } = await supabase
        .from('contests')
        .insert({ creator_id: user.id, ...row })
        .select('id')
        .single();
      if (error) throw new Error(error.message || 'Could not create your contest.');
      contestId = data.id;
    } else {
      const { data, error } = await supabase.functions.invoke('launch-contest', { body: { email, row } });
      if (error) throw new Error(error.message || 'Could not start your contest.');
      if (data?.error) throw new Error(data.error);
      contestId = data.contestId;
    }
    const { data: pi, error: piErr } = await supabase.functions.invoke('create-payment-intent', { body: { contestId } });
    if (piErr) throw new Error(piErr.message || 'Could not set up payment.');
    if (pi?.error) throw new Error(pi.error);
    return { contestId, clientSecret: pi.clientSecret, paymentIntentId: pi.paymentIntentId };
  };

  // STEP 2 (called by the modal after the card is confirmed): verify the
  // payment server-side and flip the contest live, then route.
  const handlePaid = async ({ contestId, paymentIntentId, email }) => {
    const { data, error } = await supabase.functions.invoke('confirm-launch', { body: { contestId, paymentIntentId } });
    if (error || data?.error) {
      window.alert(
        'Your payment went through, but we hit a snag activating the contest:\n\n' +
        (data?.error || error?.message || 'unknown error') +
        '\n\nIt will still appear once finalized — please refresh in a moment.'
      );
    }
    setLaunchOpen(false);
    if (user?.id) {
      writeSetup({ contestId, launchedAt: Date.now() });
      setTimeout(() => navigate(`/v4/contest/${contestId}`), 400);
    } else {
      // Guest → send the login magic link (carries the browser PKCE verifier),
      // then show "check your email; your contest is live."
      const redirectTo = `${window.location.origin}/v4/settings`;
      const { error: otpError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      if (otpError) console.error('[launch] login link failed:', otpError.message);
      setPendingEmail(email);
    }
  };

  // Guest launch → "your contest is live, check your email for the login link."
  if (pendingEmail) {
    return (
      <div className="v4 lp-v3">
        <div className="v4-screen">
          <SegmentThemeBackdrop subId={subId} minimal />
          <main className="v4-review" role="main">
            <div className="v4-review-inner" style={{ textAlign: 'center', paddingTop: 72 }}>
              <h1 className="v4-review-title">Your contest is live 🎉</h1>
              <p className="v4-review-subtitle" style={{ maxWidth: 440, margin: '14px auto 0' }}>
                We emailed a magic link to <strong>{pendingEmail}</strong>. Open it to log
                in and manage your contest.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="v4 lp-v3">
      <div className="v4-screen">
        {/* Per-segment soft glow + line-art scene — the same minimal backdrop
            the winner/manage dashboard uses, so review reads as the same
            world as the finish line. */}
        <SegmentThemeBackdrop subId={subId} minimal />

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
            {setup.voterTier && (
              <button
                type="button"
                className="v4-review-package"
                onClick={() => setEditingQuestion({ question: VOTER_TIER_QUESTION, section: 'voter' })}
              >
                <span>Up to <strong>{setup.voterTier}</strong> voters · <strong>${priceForVoters(setup.voterTier)}</strong></span>
                <PencilSimple size={12} weight="bold" className="v4-review-package-icon" />
              </button>
            )}
          </div>

          {/* The brief — each row is now a button that opens the
              EditQuestionModal in place. The old "Edit" section link
              that bounced back to the brief chat is gone. */}
          {briefQuestions.length > 0 && (
            <section className="v4-review-section">
              <header className="v4-review-section-head">
                <h2>Your brief</h2>
                <span className="v4-review-section-hint">Click any answer to edit</span>
              </header>
              <ul className="v4-review-list v4-review-list-editable">
                {briefQuestions.map((q) => {
                  const skipped = !isAnswered(briefAnswers[q.id]);
                  return (
                    <li key={q.id}>
                      <button
                        type="button"
                        className="v4-review-row v4-review-row-edit"
                        onClick={() => setEditingQuestion({ question: q, section: 'brief' })}
                      >
                        <span className="v4-review-row-label">{q.label}</span>
                        <span className={`v4-review-row-value${skipped ? ' v4-review-row-skipped' : ''}`}>
                          {skipped ? 'Skipped' : formatAnswer(briefAnswers[q.id])}
                        </span>
                        <PencilSimple size={12} weight="bold" className="v4-review-row-edit-icon" />
                      </button>
                    </li>
                  );
                })}
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
          onCreateIntent={createDraftAndIntent}
          onPaid={handlePaid}
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
              : editingQuestion?.section === 'voter'
              ? (setup.voterTier ? `Up to ${setup.voterTier} voters` : undefined)
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
