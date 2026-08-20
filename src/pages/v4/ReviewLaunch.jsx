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
import { readSetup, writeSetup, getQuestionsFor, getSetupStepTotal, formatScheduleSummary, formatWindowDuration, formatDateAnswer, getArticleFor } from '../../utils/v4Brief';
import { SHARED_SETTINGS_QUESTIONS, INTRO_QUESTION, getIntroQuestionFor } from '../../data/v4/briefQuestions';
import { SegmentThemeBackdrop, getSegmentTone, getSegmentIcon, getSegmentPalette } from '../../data/v4/segmentTheme';
import LaunchModal from '../../components/v4/LaunchModal';
import { priceForVoters, VOTER_TIER_QUESTION } from '../../data/v4/voterTiers';
import { useAuth } from '../../lib/AuthContext';
import { useProfile } from '../../lib/useProfile';
import AvatarMenu from '../../components/v4/AvatarMenu';
import { supabase } from '../../lib/supabaseClient';
import EditQuestionModal from '../../components/v4/EditQuestionModal';
import BriefRowValue from '../../components/v4/BriefRowValue';
import { getBriefLabel, getBriefSections } from '../../data/v4/briefExpansions';
import GuideExpandable from '../../components/v4/GuideExpandable';
import BriefSectionHead from '../../components/v4/BriefSectionHead';
import { ContestScheduleInput } from '../../components/v4/QuestionInput';
import ExitLink from '../../components/v4/ExitLink';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

const TIER_ICON = {
  personal: { Icon: Heart,      tone: { bg: '#fadecc', fg: '#9c4818' } },
  group:    { Icon: UsersThree, tone: { bg: '#c4cff5', fg: '#283b78' } },
  business: { Icon: Briefcase,  tone: { bg: '#bce5c8', fg: '#1f5430' } },
};

// Synthetic question so the contest name is editable inline in the review,
// through the same EditQuestionModal flow as the brief/settings rows.
const NAME_QUESTION = {
  id: 'workingName',
  label: 'Contest name',
  prompt: 'What should we call this contest?',
  type: 'text',
  required: true, // a contest must have a name — no "Skip this question"
  placeholder: 'Give your contest a name',
};

// Display helper — same logic as SettingsChat so the review matches.
function formatAnswer(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value === '[configure-later]') return 'Configure after launch';
  // Multi-select (chips) — join with " / " to match the options' own style,
  // not the default array-to-string comma.
  if (Array.isArray(value)) return value.join(' / ');
  if (value && typeof value === 'object') {
    if ('enabled' in value) {
      if (!value.enabled) return 'No';
      if (value.text) return value.text;
      if (value.name) return value.name;
      if (value.configureAfterLaunch) return 'Set up after launch';
      return 'Yes';
    }
  }
  // Date-shaped answers (e.g. the baby due date) → "March 15, 2026".
  if (typeof value === 'string') return formatDateAnswer(value);
  return String(value);
}

export default function ReviewLaunch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [launching, setLaunching] = useState(false);
  // Set after a GUEST launch — shows the "check your email" screen while the
  // Edge Function has created their account + contest and emailed the link.
  const [pendingEmail, setPendingEmail] = useState(null);
  // Why the receipt couldn't carry a sign-in link, when it couldn't. Shown on
  // the confirmation screen so a failure is visible rather than silently
  // costing the guest a second email.
  const [signInLinkError, setSignInLinkError] = useState(null);
  // Per-row edit modal state — same pattern as ContestManage's
  // brief recap, so editing happens in-place instead of bouncing
  // the user back to the full chat.
  const [editingQuestion, setEditingQuestion] = useState(null); // {question, section}
  // Re-read setup on every save so the recap reflects the new answer
  // without a remount.
  const [editTick, setEditTick] = useState(0);
  const setup = readSetup();
  void editTick; // keep eslint quiet — used as the re-read trigger

  // ── Intro to participants ─────────────────────────────────────────
  // Written here, on review, rather than in the chat: a cover letter is
  // written after you know what's in the package. Saved to brief.intro on
  // blur; required to launch (soft gate — the Launch click nudges and
  // scrolls here instead of a mute disabled button).
  const [intro, setIntro] = useState(() => readSetup().brief?.intro || '');
  const [introNudge, setIntroNudge] = useState(false);
  // With text present the card renders as a preview of the invitation
  // greeting (message, not form field); clicking it flips back to the
  // textarea. Empty always shows the textarea.
  const [introEditing, setIntroEditing] = useState(false);
  const introRef = useRef(null);
  const saveIntro = (value) => {
    const cur = readSetup();
    const brief = { ...(cur.brief || {}) };
    const trimmed = value.trim();
    if (trimmed) brief.intro = trimmed;
    else delete brief.intro;
    writeSetup({ brief });
  };

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
  // Signed-in host → their avatar in the header, continuous with the chat
  // and pick steps (guests just see Exit). Cached hook = no placeholder flash.
  const [profile] = useProfile(user);
  const subId = setup.subSegmentId || 'b1';
  // Review is the final step of the setup flow — show it as N/N so the
  // progress counter that ran through the chat lands here.
  const reviewTotal = getSetupStepTotal(subId);
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

  // Use the effective list (cuts + merges applied) — the exact same call the
  // chat flow makes — so the review shows only questions that were actually
  // asked, in the same order. Genuinely-asked-but-blank ones still show
  // "Skipped"; cut/merged ones no longer appear as phantom skips.
  const briefQuestions = getQuestionsFor(subId, null);
  const briefAnswers = setup.brief || {};
  const settingsAnswers = setup.settings || {};

  // Grouped into the client's document sections (with each section's guide
  // attached); null for segments without a section map yet, which keep the
  // flat list.
  const briefGroups = getBriefSections(subId, briefQuestions);
  // Guides shown on the brief are exactly the ones this segment's questions
  // carry, in question order, deduped — so the brief's reading list always
  // matches what the creator met in the chat. (ARTICLES holds extra pieces
  // that were never attached to a question; those are not part of this
  // segment's flow and must not appear here.)
  const briefArticles = (() => {
    const seen = new Set();
    return briefQuestions
      .map((q) => q.guideId)
      .filter((id) => id && !seen.has(id) && seen.add(id))
      .map((id) => getArticleFor(subId, id))
      .filter(Boolean);
  })();

  // One brief row. Question on the left rail with the note that says what it
  // covers; answer on the right; pencil opens the same edit modal as before.
  const renderBriefRow = (q) => {
    const val = briefAnswers[q.id];
    const skipped = !isAnswered(val);
    return (
      <li key={q.id}>
        <button
          type="button"
          className={`v4-review-row v4-review-row-edit${skipped ? ' is-skipped' : ''}`}
          onClick={() => setEditingQuestion({ question: q, section: 'brief' })}
        >
          <span className="v4-review-row-label">{getBriefLabel(q)}</span>
          <span className={`v4-review-row-value${skipped ? ' v4-review-row-skipped' : ''}`}>
            {skipped
              ? 'Skipped'
              : <BriefRowValue id={q.id} value={val} fallback={formatAnswer} subId={subId} />}
          </span>
          <PencilSimple size={12} weight="bold" className="v4-review-row-edit-icon" />
        </button>
      </li>
    );
  };

  const handleEditSave = (newValue) => {
    if (!editingQuestion) return;
    const { question, section } = editingQuestion;
    const cur = readSetup();
    if (section === 'name') {
      writeSetup({ workingName: newValue });
    } else if (section === 'brief') {
      writeSetup({ brief: { ...(cur.brief || {}), [question.id]: newValue } });
    } else if (section === 'settings') {
      // The schedule answers both windows at once — spread into real keys.
      if (question.type === 'contestSchedule') {
        writeSetup({
          settings: {
            ...(cur.settings || {}),
            submissionDays: newValue.submissionDays,
            votingDays: newValue.votingDays,
          },
        });
      } else {
        writeSetup({ settings: { ...(cur.settings || {}), [question.id]: newValue } });
      }
    } else if (section === 'voter') {
      writeSetup({ voterTier: newValue });
    }
    setEditTick((t) => t + 1);
  };

  // Show every brief question — answered ones with their answer, skipped
  // ones flagged (grey "Skipped") and still editable, so nothing silently
  // vanishes and the creator can fill any gap right here before launch.
  const isAnswered = (v) => v !== undefined && v !== null && v !== '';
  const filledSettings = SHARED_SETTINGS_QUESTIONS.filter(
    (q) => q.type !== 'contestSchedule' && settingsAnswers[q.id] !== undefined
  );
  const scheduleQuestion = SHARED_SETTINGS_QUESTIONS.find((q) => q.type === 'contestSchedule');

  // ?launch=1 (from the platform map) auto-opens the launch/checkout
  // modal so that flow step lands directly on it.
  const [searchParams] = useSearchParams();
  // The draft created for this launch attempt. A ref, not state, because a
  // re-render must not lose it — losing it is what produced the duplicate.
  const draftIdRef = useRef(null);
  const [launchOpen, setLaunchOpen] = useState(
    () => searchParams.get('launch') === '1'
  );

  const handleLaunch = () => {
    if (launching) return;
    // The intro is the one thing participants read first — a contest
    // shouldn't go out without it. Soft gate: nudge + scroll, not a
    // disabled button (disabled-with-no-explanation is how dead ends
    // happen).
    if (!intro.trim()) {
      setIntroNudge(true);
      introRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      introRef.current?.querySelector('textarea')?.focus();
      return;
    }
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
      // Creator identity from the opening step rides in settings (jsonb, no
      // migration): the anonymity choice participants must respect, and the
      // display name so it survives the guest path to launch.
      settings: {
        ...(cur.settings || {}),
        ...(cur.userAnonymous != null ? { creatorAnonymous: !!cur.userAnonymous } : {}),
        ...(cur.userName ? { creatorDisplayName: cur.userName } : {}),
      },
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
    // Reuse the draft from an earlier attempt in this session. A declined card
    // used to leave its draft behind and mint a fresh one on retry, so a
    // creator who mistyped a digit ended up with two contests: the abandoned
    // draft and the one they actually paid for.
    if (draftIdRef.current) {
      const { data: pi, error: piErr } = await supabase.functions.invoke(
        'create-payment-intent', { body: { contestId: draftIdRef.current } }
      );
      if (!piErr && !pi?.error) {
        return {
          contestId: draftIdRef.current,
          clientSecret: pi.clientSecret,
          paymentIntentId: pi.paymentIntentId,
        };
      }
      // The draft is unusable (already paid, or gone). Fall through and make a
      // new one rather than trapping the creator on a broken row.
      draftIdRef.current = null;
    }
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
      // Carry the guest's chosen identity so their brand-new account gets
      // their name + photo on creation (they have no session to do it
      // client-side). launch-contest applies these to the profile.
      const idraft = readSetup();
      const identity = {
        displayName: idraft.userName || null,
        avatarData: idraft.userAvatarData || null,
      };
      const { data, error } = await supabase.functions.invoke('launch-contest', { body: { email, row, identity } });
      if (error) throw new Error(error.message || 'Could not start your contest.');
      if (data?.error) throw new Error(data.error);
      contestId = data.contestId;
    }
    draftIdRef.current = contestId;
    const { data: pi, error: piErr } = await supabase.functions.invoke('create-payment-intent', { body: { contestId } });
    if (piErr) throw new Error(piErr.message || 'Could not set up payment.');
    if (pi?.error) throw new Error(pi.error);
    return { contestId, clientSecret: pi.clientSecret, paymentIntentId: pi.paymentIntentId };
  };

  // STEP 2 (called by the modal after the card is confirmed): verify the
  // payment server-side and flip the contest live, then route.
  const handlePaid = async ({ contestId, paymentIntentId, email }) => {
    const { data, error } = await supabase.functions.invoke('confirm-launch', { body: { contestId, paymentIntentId, origin: window.location.origin, isGuest: !user } });
    if (error || data?.error) {
      window.alert(
        'Your payment went through, but we hit a snag activating the contest:\n\n' +
        (data?.error || error?.message || 'unknown error') +
        '\n\nIt will still appear once finalized. Please refresh in a moment.'
      );
    }
    setLaunchOpen(false);
    if (user?.id) {
      writeSetup({ contestId, launchedAt: Date.now() });
      setTimeout(() => navigate(`/v4/contest/${contestId}`), 400);
    } else {
      // The receipt's own button now signs a guest in and lands them on their
      // contest, so there's no second email to send: one message, one click.
      // This only runs if confirm-launch couldn't attach a link, which would
      // otherwise leave someone who has just paid with no way into the
      // account that was created for them.
      if (data?.signInLinkError) setSignInLinkError(data.signInLinkError);
      if (!data?.signInLinkSent) {
        const redirectTo = `${window.location.origin}/v4/settings`;
        const { error: otpError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
        if (otpError) {
          console.error('[launch] login link failed:', otpError.message);
          window.alert(
            'Your contest is paid and live, but we could not send the login email:\n\n' +
            otpError.message +
            '\n\nYou can sign in from the homepage with the same email to reach it.'
          );
        }
      }
      setPendingEmail(email);
    }
  };

  // Guest launch → paid, live, and the receipt in their inbox is also the way
  // in. One email doing both jobs, so the copy points at that one thing.
  if (pendingEmail) {
    return (
      <div className="v4 lp-v3">
        <div className="v4-screen v4-review-screen">
          <SegmentThemeBackdrop subId={subId} minimal />
          <main className="v4-review" role="main">
            <div className="v4-review-inner" style={{ textAlign: 'center', paddingTop: 72 }}>
              <h1 className="v4-review-title">Your contest is live 🎉</h1>
              <p className="v4-review-subtitle" style={{ maxWidth: 440, margin: '14px auto 0' }}>
                {signInLinkError ? (
                  <>
                    We sent your receipt and a separate sign-in link to{' '}
                    <strong>{pendingEmail}</strong>. Open the sign-in link first.
                  </>
                ) : (
                  <>
                    We sent your receipt to <strong>{pendingEmail}</strong>. Its
                    &ldquo;Go to your contest&rdquo; button signs you in and takes
                    you straight there.
                  </>
                )}
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="v4 lp-v3">
      <div className="v4-screen v4-review-screen">
        {/* Per-segment soft glow + line-art scene — the same minimal backdrop
            the winner/manage dashboard uses, so review reads as the same
            world as the finish line. */}
        <SegmentThemeBackdrop subId={subId} minimal />

        <main className="v4-review" role="main" ref={scrollRef}>
          {/* Glass nav — sticky inside review scroll */}
          <header className={`v4-nav v4-nav-clear v4-nav--app ${isScrolled ? 'is-scrolled' : ''}`}>
            <BrandLink />
            <div className="v4-progress">
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-active"></span>
              <span className="v4-step-label">Review<span className="v4-step-counter"> · {reviewTotal}/{reviewTotal}</span></span>
            </div>
            <div className="v4-nav-right">
              <ExitLink to="/" aria-label="Exit" />
              {user && (
                <AvatarMenu
                  email={user?.email || setup.userEmail}
                  name={profile?.display_name || setup.userName}
                  photo={profile?.avatar_url || setup.userPhoto || null}
                  seed={user?.id}
                  tone={segmentTone}
                />
              )}
            </div>
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
              <button
                type="button"
                className="v4-review-title-edit"
                onClick={() => setEditingQuestion({ question: NAME_QUESTION, section: 'name' })}
                aria-label="Edit contest name"
                style={{ marginLeft: 8, verticalAlign: 'middle', background: 'transparent', border: 0, padding: 4, cursor: 'pointer', color: 'inherit', opacity: 0.5, display: 'inline-flex' }}
              >
                <PencilSimple size={16} weight="bold" />
              </button>
            </h1>
            {setup.voterTier && (
              <button
                type="button"
                className="v4-review-package"
                onClick={() => setEditingQuestion({ question: VOTER_TIER_QUESTION, section: 'voter' })}
              >
                <span>Up to <strong>{setup.voterTier}</strong> participants · <strong>${priceForVoters(setup.voterTier)}</strong></span>
                <PencilSimple size={12} weight="bold" className="v4-review-package-icon" />
              </button>
            )}
            {/* Client-requested lead-in (2026-08-18): mark the moment — the
                brief is done, this page is the read-through before launch. */}
            <p className="v4-review-congrats">
              <strong>Congratulations! You’ve completed your contest brief.</strong>
              Below is the brief your participants will see when they submit and
              vote on names. Take a moment to review it and make any changes
              you’d like before launching your contest.
            </p>
          </div>

          {/* Intro to participants — the creator's own words, shown first
              on the invitation and both participant pages. Inline textarea
              (not a modal row): writing a paragraph wants a real field. */}
          <section className="v4-review-section" ref={introRef}>
            <header className="v4-review-section-head">
              <h2>A note from you</h2>
              <span className="v4-review-section-hint">Opens your invitation · click to edit</span>
            </header>
            {intro.trim() && !introEditing ? (
              /* Preview: just the words, as typography — no inner box.
                 Click anywhere to edit (same affordance as the brief rows). */
              <button
                type="button"
                className="v4-review-intro-preview"
                onClick={() => setIntroEditing(true)}
                aria-label="Edit your intro"
              >
                <span className="v4-review-intro-text">{intro}</span>
                <PencilSimple size={13} weight="bold" className="v4-review-intro-edit" aria-hidden="true" />
              </button>
            ) : (
              <textarea
                className="v4-input v4-textarea"
                style={{ width: '100%', boxSizing: 'border-box' }}
                rows={INTRO_QUESTION.rows}
                maxLength={600}
                value={intro}
                autoFocus={introEditing}
                placeholder={getIntroQuestionFor(subId).placeholder}
                onChange={(e) => { setIntro(e.target.value); if (e.target.value.trim()) setIntroNudge(false); }}
                onBlur={(e) => { saveIntro(e.target.value); if (e.target.value.trim()) setIntroEditing(false); }}
                aria-label={INTRO_QUESTION.label}
              />
            )}
            {introNudge && (
              <span className="v4-settings-field-hint" style={{ color: '#a8321f' }} role="alert">
                Write a quick hello before launching; it’s the first thing your participants read.
              </span>
            )}
          </section>

          {/* The brief — each row is now a button that opens the
              EditQuestionModal in place. The old "Edit" section link
              that bounced back to the full chat is gone. */}
          {briefQuestions.length > 0 && (
            <section className="v4-review-section">
              <header className="v4-review-section-head">
                <h2>Your brief</h2>
                <span className="v4-review-section-hint">Participants see this · click to edit</span>
              </header>
              {briefGroups ? (
                briefGroups.map((group) => (
                  <div key={group.title} className="v4-brief-group">
                    <BriefSectionHead
                      title={group.title}
                      sub={group.sub}
                      icon={group.icon}
                      tone={segmentTone}
                    />
                    <ul className="v4-review-list v4-review-list-editable">
                      {group.items.map(renderBriefRow)}
                    </ul>
                  </div>
                ))
              ) : (
                <ul className="v4-review-list v4-review-list-editable">
                  {briefQuestions.map(renderBriefRow)}
                </ul>
              )}

              {/* Guides in ONE standardized place rather than scattered per
                  section: on a finished brief they are reference reading for
                  whoever names, not help for answering. Uneven guide counts
                  per segment also make per-section placement look patchy. */}
              {briefArticles.length > 0 && (
                <div className="v4-brief-guides">
                  <BriefSectionHead
                    title="Naming guides"
                    sub="Short reads on naming craft, shared with your participants"
                    icon="BookOpen"
                    tone={segmentTone}
                  />
                  <div className="v4-brief-guides-list">
                    {briefArticles.map((a) => (
                      <GuideExpandable key={a.id} article={a} compact tone={segmentTone} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Schedule — its own card, working exactly like the chat: the
              vertical roadmap with tappable stages, picker swapping in
              place, every change saved live. No modal-on-roadmap. */}
          {scheduleQuestion && (
            <section className="v4-review-section v4-review-section--private">
              <header className="v4-review-section-head">
                <h2>Schedule</h2>
                <span className="v4-review-section-hint">Only you see this · tap a stage to change it</span>
              </header>
              <ContestScheduleInput
                question={scheduleQuestion}
                mode="inline"
                onChange={(v) => {
                  const cur = readSetup();
                  writeSetup({
                    settings: {
                      ...(cur.settings || {}),
                      submissionDays: v.submissionDays,
                      votingDays: v.votingDays,
                    },
                  });
                }}
              />
            </section>
          )}

          {/* Settings — same inline-edit pattern as the brief. */}
          {filledSettings.length > 0 && (
            <section className="v4-review-section v4-review-section--private">
              <header className="v4-review-section-head">
                <h2>Settings</h2>
                <span className="v4-review-section-hint">Only you see this · click to edit</span>
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
              You’ll get a link to share with your participants.
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
            editingQuestion?.section === 'name'
              ? setup.workingName
              : editingQuestion?.section === 'brief'
              ? briefAnswers[editingQuestion?.question?.id]
              : editingQuestion?.section === 'voter'
              ? (setup.voterTier ? `Up to ${setup.voterTier} participants` : undefined)
              : editingQuestion?.question?.type === 'contestSchedule'
              ? formatScheduleSummary(settingsAnswers)
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
