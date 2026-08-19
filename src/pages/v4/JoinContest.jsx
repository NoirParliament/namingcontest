// V4 JOIN PAGE — entry point for everyone clicking an invitation link.
//
// URL: /v4/join/:contestId
//
// Visual approach: this page is the participant's first impression of
// the product, so it goes bold — the whole page is washed in the
// contest's segment color (football → green), bubbles flip to white,
// and the inviter shows up as a real human (photo + name + role)
// rather than "a friend." The form is hidden behind a single exciting
// CTA until clicked; magic-link mechanics reveal AFTER the click.
//
// Smart redirect: if the visitor already has a participation entry
// for this contest, we skip the invitation and bounce to wherever
// they are in the lifecycle (submit / vote / thanks).

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  EnvelopeSimple, PaperPlaneTilt,
  CheckCircle, Trophy, Clock,
} from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import messageImg from '../../assets/message.png';

// Inviter avatars — hero-profile-1 through 6. Indexed by contest.creator.photoIndex.
import heroProfile1 from '../../assets/hero-profile-1.png';
import heroProfile2 from '../../assets/hero-profile-2.png';
import heroProfile3 from '../../assets/hero-profile-3.png';
import heroProfile4 from '../../assets/hero-profile-4.png';
import heroProfile5 from '../../assets/hero-profile-5.png';
import heroProfile6 from '../../assets/hero-profile-6.png';
const HERO_PROFILES = [
  heroProfile1, heroProfile2, heroProfile3,
  heroProfile4, heroProfile5, heroProfile6,
];


import { getMockContestById } from '../../data/v4/mockContests';
import { getSegmentTone, getSegmentIcon, SEGMENT_THEME, SegmentThemeBackdrop } from '../../data/v4/segmentTheme';
import { readSetup, writeSetup } from '../../utils/v4Brief';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import {
  readParticipation, joinContest, getParticipantRow,
} from '../../utils/v4Participant';
// Import landing-v3 styles so we can use the EXACT homepage primary
// button (`.btn.btn-primary.btn-lg`) — guarantees identical animation
// and sizing without maintaining a parallel copy in v4.css.
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

// Format relative-time strings for the deadline pills.
function formatDeadline(daysAhead) {
  if (!Number.isFinite(daysAhead) || daysAhead < 0) return null;
  if (daysAhead === 0) return 'today';
  if (daysAhead === 1) return 'tomorrow';
  return `in ${daysAhead} days`;
}

export default function JoinContest() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const emailRef = useRef(null);

  // Resolve the contest: a mock demo id from the mock store, otherwise a real
  // contest via get_join_info (public join-page fields only — no brief/price).
  const mockContest = getMockContestById(contestId);
  const [realContest, setRealContest] = useState(null);
  const [contestLoading, setContestLoading] = useState(!mockContest);
  useEffect(() => {
    if (mockContest) return;
    let active = true;
    supabase.rpc('get_join_info', { cid: contestId }).then(({ data, error }) => {
      if (!active) return;
      if (error) console.error('[join] get_join_info failed:', error);
      const r = data?.[0];
      if (r) {
        setRealContest({
          id: r.id,
          workingName: r.working_name,
          subSegmentId: r.sub_segment_id,
          subSegmentTitle: r.sub_segment_title,
          group: r.tier,
          status: r.status,
          settings: r.settings || {},
          // r.intro arrives once migration 0024 is applied; until then it's
          // undefined and the summary fallback keeps working as before.
          brief: { projectSummary: r.project_summary, intro: r.intro },
          Icon: getSegmentIcon(r.sub_segment_id),
          // Real inviter + real phase deadlines so the header, countdown and
          // footer flow reflect the contest's true stage.
          creator: { name: r.creator_name || 'The organizer' },
          submissionEndsAt: r.submission_ends_at ? new Date(r.submission_ends_at).getTime() : null,
          votingEndsAt: r.voting_ends_at ? new Date(r.voting_ends_at).getTime() : null,
        });
        // Cache the segment so Namespace paints this contest's color instantly.
        if (r.sub_segment_id) {
          try { localStorage.setItem('v4_last_sub', r.sub_segment_id); } catch { /* ignore */ }
        }
      }
      setContestLoading(false);
    });
    return () => { active = false; };
  }, [contestId, mockContest]);
  const contest = mockContest || realContest;

  // On arrival at a real contest while signed in: figure out where this
  // person belongs and skip the invitation entirely if they're already in.
  //   • already a participant → route by stage (submitted→thanks, else→submit;
  //     voting→vote; closed→reveal)
  //   • not a participant but a join is pending (clicked "I'm in" + returned
  //     via magic link) → create the participant row, then route
  //   • otherwise → stay and show the invitation
  useEffect(() => {
    if (!realContest || !user?.id) return;
    let active = true;
    (async () => {
      const [p, s, v] = await Promise.all([
        supabase.from('participants').select('id').eq('contest_id', realContest.id).eq('user_id', user.id).maybeSingle(),
        supabase.from('submissions').select('id').eq('contest_id', realContest.id).eq('user_id', user.id).limit(1),
        supabase.from('votes').select('id').eq('contest_id', realContest.id).eq('user_id', user.id).limit(1),
      ]);
      if (!active) return;
      let isParticipant = !!p.data;
      const hasSubmitted = (s.data || []).length > 0;
      const hasVoted = (v.data || []).length > 0;

      const base = `/v4/contest/${realContest.id}`;
      if (!isParticipant) {
        // Closed contest → a non-participant just sees the public result.
        if (realContest.status === 'closed') { navigate(`${base}/reveal`, { replace: true }); return; }
        let pending = null;
        try { pending = localStorage.getItem('v4_pending_join'); } catch { /* ignore */ }
        if (pending !== realContest.id) return; // not joined, no pending → show invitation
        const { error } = await supabase
          .from('participants')
          .insert({ contest_id: realContest.id, user_id: user.id });
        if (error && error.code !== '23505') {
          console.error('[join] participant insert failed:', error);
          // 23514 is the tier cap (0022). Everything else is unexpected, but
          // either way say something — this used to return silently, leaving
          // the visitor on the invitation wondering what they'd done wrong.
          setJoinError(error.code === '23514'
            ? error.message
            : 'Could not join this contest. Please try again, or ask the organiser to resend your link.');
          return;
        }
        try { localStorage.removeItem('v4_pending_join'); } catch { /* ignore */ }
        isParticipant = true;
      }

      if (!active || !isParticipant) return;
      // Voting is one-shot — a voter who already cast picks lands on the
      // confirmation, not a re-votable ballot. A participant on a closed
      // contest gets the personalized winner view (non-participants: /reveal).
      if (realContest.status === 'voting') navigate(hasVoted ? `${base}/vote-thanks` : `${base}/vote`, { replace: true });
      else if (realContest.status === 'closed') navigate(`${base}/winner`, { replace: true });
      else navigate(hasSubmitted ? `${base}/thanks` : `${base}/submit`, { replace: true });
    })();
    return () => { active = false; };
  }, [realContest, user?.id, navigate]);

  // Local state for the magic-link mini-flow inside this page.
  // 'cta'     — initial; only the big "Yes, I'm in" button is shown.
  // 'form'    — CTA was clicked; email field + magic-link explanation reveal.
  // 'sending' — between submit and the simulated send.
  // 'sent'    — "check your email" with the demo "Open the link" button.
  // 'success' — brief celebration → route to chat.
  const [phase, setPhase] = useState('cta');
  // Surfaced on the invitation itself — a failed join used to be a silent
  // return or a browser alert() dropped into a designed flow.
  const [joinError, setJoinError] = useState('');
  const [email, setEmail] = useState(readSetup().userEmail || '');

  // ── Skip invitation entirely for already-joined visitors ───────────
  // TEMP: only redirect when the target route actually exists. Right
  // now ParticipantChat (/v4/contest/:id/submit) hasn't been built yet,
  // so blindly bouncing already-joined visitors there renders a blank
  // page (no route match). Whitelist the routes we've shipped, and
  // gracefully show the invitation again for anything else so the
  // visitor can re-enter the flow once the chat exists.
  useEffect(() => {
    if (!contest) return;
    const existing = readParticipation(contestId);

    // ── Post-contest: late arrivals see the public reveal ──────────
    // If the creator has crowned a winner and this visitor never
    // participated, they're a random share-link clicker who arrived
    // after the dust settled. Send them to the neutral public reveal
    // (with social-share buttons) instead of the now-meaningless
    // invitation. Participants still go to /winner via the row
    // mapper below — that's their "you/your teammate won" view.
    if (contest.winnerSubId && !existing) {
      navigate(`/v4/contest/${contestId}/reveal`, { replace: true });
      return;
    }

    if (!existing) return;
    const phaseShape = {
      ...contest,
      phase: contest.phase
        ? (contest.phase.toLowerCase() === 'voting' ? 'voting'
          : contest.phase.toLowerCase() === 'winner' ? 'winner'
          : 'submission')
        : 'submission',
      submissionLimit: Math.min(
        Number.isFinite(contest.settings?.submissionLimit) && contest.settings.submissionLimit > 0
          ? contest.settings.submissionLimit
          : 3,
        5,
      ),
    };
    const row = getParticipantRow(phaseShape, existing);
    // Routes shipped today. Update this list as we build the rest.
    const SUFFIXES = ['/submit', '/status', '/thanks', '/vote', '/vote-thanks', '/winner'];
    const shouldRoute = row?.actionRoute && (
      row.actionRoute === '/v4/settings' ||
      SUFFIXES.some(s => row.actionRoute.endsWith(s))
    );
    if (shouldRoute) {
      navigate(row.actionRoute, { replace: true });
    }
    // Otherwise: stay on the invitation page so the visitor sees something.
  }, [contest, contestId, navigate]);

  // Focus the email field when the form reveals.
  useEffect(() => {
    if (phase === 'form') {
      const t = setTimeout(() => emailRef.current?.focus(), 380);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ── Loading a real contest ──────────────────────────────────────────
  if (contestLoading) {
    return (
      <div className="v4 lp-v3">
        <div className="v4-screen">
          <main className="v4-review" role="main">
            <div className="v4-review-inner" style={{ textAlign: 'center', paddingTop: 120 }}>
              <p className="v4-review-subtitle">Loading the contest…</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Bad-link state ──────────────────────────────────────────────────
  if (!contest) {
    return (
      <div className="v4 lp-v3">
        <div className="v4-screen v4-join-screen v4-join-screen-error">
          <main className="v4-review" role="main">
            <header className="v4-nav">
              <BrandLink />
            </header>
            <div className="v4-review-inner">
              <div className="v4-join-error">
                <h1 className="v4-join-error-title">
                  This invitation link isn’t working.
                </h1>
                <p className="v4-join-error-body">
                  The contest may have ended, or the link may have expired.
                  If a friend sent you this, ask them to send a fresh link.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/')}
                >
                  Back to home
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Derived meta for the invitation ────────────────────────────────
  const subId = contest.subSegmentId;
  const tone = getSegmentTone(subId);
  const ContestIcon = contest.Icon;
  const creator = contest.creator || {};
  const creatorName = creator.name || 'A team captain';
  const creatorRole = creator.role || 'Organizer';
  const creatorPhoto = HERO_PROFILES[(creator.photoIndex || 1) - 1] || heroProfile1;
  const subSegmentLabel = contest.subSegmentTitle || 'naming contest';
  // Clamped to the ceiling the database enforces (migration 0016). Contests
  // saved before 10/'Unlimited' were removed would otherwise advertise a
  // number of slots nobody can actually use.
  const rawSubmissionLimit = contest.settings?.submissionLimit;
  const submissionLimit = Math.min(
    Number.isFinite(rawSubmissionLimit) && rawSubmissionLimit > 0 ? rawSubmissionLimit : 3,
    5,
  );

  // Normalized lifecycle stage — for a real contest this is the true DB status;
  // a mock demo maps its phase string. Drives the header deadline + footer flow.
  const stage = mockContest
    ? (contest.phase?.toLowerCase() === 'voting' ? 'voting'
      : contest.phase?.toLowerCase() === 'winner' ? 'closed' : 'submission')
    : (contest.status || 'submission');

  // Phase-aware deadline pill: submissions vs voting close, from the contest's
  // real end timestamps (mock falls back to its settings day count).
  const daysUntil = (ts) => (ts ? Math.max(0, Math.ceil((ts - Date.now()) / 86400000)) : null);
  let deadlineLabel = null;
  let deadlineWhen = null;
  if (stage === 'submission') {
    deadlineLabel = 'Submissions close';
    deadlineWhen = mockContest
      ? formatDeadline(contest.settings?.submissionDays)
      : formatDeadline(daysUntil(contest.submissionEndsAt));
  } else if (stage === 'voting') {
    deadlineLabel = 'Voting closes';
    deadlineWhen = mockContest
      ? formatDeadline(contest.settings?.votingDays)
      : formatDeadline(daysUntil(contest.votingEndsAt));
  }

  // Stage-aware entry copy. A signed-out visitor here is EITHER a participant
  // arriving from a "cast your vote" email OR someone newly forwarded the link
  // — and we can't tell which until they authenticate. So the wording has to
  // be true for both: "continue" claims neither that they're new nor that
  // they're returning. ("Yes, I'm in" was shown at every stage, which greeted
  // people who'd already submitted a name with an invitation to join.)
  const ctaLabel = stage === 'voting' ? 'Continue to vote'
    : stage === 'closed' ? 'See the result'
    : 'Yes, I’m in';
  const formWhy = stage === 'voting'
    ? <>So we can email you a link straight to your ballot. No password, no marketing.</>
    : <>So {creatorName} can credit your suggestions, and we can email you a magic link to come back and vote. No password, no marketing.</>;

  // Short "what is this" line under the headline. Sourced from the
  // dedicated `projectSummary` brief field — the first question every
  // segment asks the creator, specifically written so the answer can
  // land on this invitation page without further editing.
  // The creator's own intro leads when they wrote one (it's written for
  // exactly this page); projectSummary stays as the fallback for contests
  // launched before the intro existed.
  const briefSummary = contest.brief?.intro || contest.brief?.projectSummary || null;
  const prize = contest.settings?.submitterPrize?.enabled
    ? contest.settings?.submitterPrize
    : null;
  // customRequirements moved from settings to the brief (2026-08-17); older
  // contests still store it under settings, so read brief first, then fall back.
  const customReqsField = contest.brief?.customRequirements ?? contest.settings?.customRequirements;
  const customReqs = customReqsField?.enabled ? customReqsField.text : null;

  // Per-segment palette: page tint comes from the first blob color of
  // the segment's theme; bubbles flip to white-on-tint so they read.
  const segmentBg = SEGMENT_THEME[subId]?.blobs?.[0] || tone.bg;

  // Create the real participant row (idempotent) and go to submission.
  const completeJoinAndGo = async () => {
    setPhase('success');
    const { error } = await supabase
      .from('participants')
      .insert({ contest_id: realContest.id, user_id: user.id });
    if (error && error.code !== '23505') {
      console.error('[join] participant insert failed:', error);
      setJoinError(error.code === '23514'
        ? error.message
        : 'Could not join this contest. Please try again, or ask the organiser to resend your link.');
      setPhase('cta');
      return;
    }
    // Land where the stage actually is — during voting you can't submit.
    const base = `/v4/contest/${realContest.id}`;
    const dest = realContest.status === 'voting' ? `${base}/vote`
      : realContest.status === 'closed' ? `${base}/reveal`
      : `${base}/submit`;
    setTimeout(() => navigate(dest), 500);
  };

  // ── Magic-link handlers ────────────────────────────────────────────
  const handleRevealForm = () => {
    // Real contest + already signed in → join immediately, no email needed.
    if (realContest && user?.id) { completeJoinAndGo(); return; }
    setPhase('form');
  };

  const handleSendLink = async (e) => {
    e?.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      window.alert('Please enter a valid email address so we can send your link.');
      return;
    }
    setPhase('sending');
    if (realContest) {
      // Real contest → send a real magic link; the pending-join effect above
      // creates the participant row when they return signed in.
      try { localStorage.setItem('v4_pending_join', realContest.id); } catch { /* ignore */ }
      const redirectTo = `${window.location.origin}/v4/join/${realContest.id}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        console.error('[join] magic link failed:', error);
        window.alert('Could not send your link: ' + (error.message || error));
        setPhase('form');
        return;
      }
      setPhase('sent');
    } else {
      // Mock demo path — keep the simulated send.
      setTimeout(() => setPhase('sent'), 700);
    }
  };

  const handleOpenLink = () => {
    setPhase('success');
    const cleanEmail = email.trim().toLowerCase();
    const displayName = cleanEmail.split('@')[0];
    writeSetup({ userEmail: cleanEmail, userName: displayName });
    // Demo: ALWAYS reset participation when entering via the join
    // flow so repeated tests with the same email start with a fresh
    // (empty submittedNames) state. In production this would only
    // seed for genuinely-new participants.
    joinContest(contestId, { name: displayName, email: cleanEmail });
    setTimeout(() => {
      navigate(`/v4/contest/${contestId}/submit`);
    }, 700);
  };

  // ── Render the invitation ──────────────────────────────────────────
  return (
    <div className="v4 lp-v3">
      <div
        className="v4-screen v4-join-screen"
        style={{ '--join-bg': segmentBg, '--join-fg': tone.fg }}
      >
        {/* Identical to the chat stages — same cream page, same aurora, same
            line-art scene. Arriving from an invite should look like the same
            product you land in one click later. Replaces the drifting blobs +
            looping avatar animation that used to live here: homepage
            furniture on a page whose whole job is "read this, then act". */}
        <SegmentThemeBackdrop subId={subId} minimal />

        <main className="v4-review" role="main">
          {/* Logo left, inviter sentence center (matches the role the
              breadcrumb plays elsewhere — top-of-page context), deadline
              pill right. */}
          <header className="v4-nav v4-join-nav">
            <BrandLink />
            <div className="v4-progress v4-join-nav-inviter">
              <strong className="v4-join-inviter-name-inline">
                {creatorName}
              </strong>
              <span className="v4-join-inviter-role-inline">
                ({creatorRole})
              </span>
              <span className="v4-join-inviter-invites">
                invites you to
              </span>
            </div>
            <div className="v4-nav-right">
              {deadlineLabel && deadlineWhen && (
                <span className="v4-join-nav-deadline">
                  <Clock weight="duotone" size={14} />
                  {deadlineLabel} <strong>{deadlineWhen}</strong>
                </span>
              )}
            </div>
          </header>

          <div className="v4-review-inner v4-join-inner">
            {/* ── HERO — "Naming [thing]" headline + brief summary.
                "Naming" stays small + plain Inter to act as a verb
                introducing the working name (which gets the big
                italic Fraunces treatment). */}
            <section className="v4-join-hero-bold">
              <h1 className="v4-join-hero-headline">
                <span className="v4-join-hero-verb">Help name</span>
                <span className="v4-join-hero-workingname">
                  {contest.workingName || contest.name}
                </span>
              </h1>
              {briefSummary && (
                <p className="v4-join-hero-summary">{briefSummary}</p>
              )}
            </section>

            {/* ── PRIZE — ticket-stub-style banner. A saturated
                segment-colored band on the left holds the trophy
                icon, perforated edge separates it from the white
                content slab on the right. Reads as "this is the
                prize" without needing a giant yellow gradient. */}
            {prize && (
              <section
                className="v4-join-prize"
                aria-label="What the winner gets"
              >
                <div className="v4-join-prize-band" aria-hidden="true">
                  <Trophy weight="fill" size={32} />
                </div>
                <div className="v4-join-prize-body">
                  <div className="v4-join-prize-eyebrow">
                    Winner gets
                  </div>
                  <div className="v4-join-prize-name">{prize.name}</div>
                  {prize.text && (
                    <div className="v4-join-prize-desc">{prize.text}</div>
                  )}
                </div>
              </section>
            )}


            {/* ── PRIMARY CTA + revealing magic-link form ───────────────
                Initial state: ONE big exciting button. No mention of
                magic links yet — that's mechanics, not motivation.
                When the user clicks "Yes, I'm in," the email field
                reveals with the magic-link copy underneath. */}
            <section className="v4-join-action">
              {phase === 'cta' && (
                <div className="v4-join-cta-wrap">
                  {joinError && (
                    <p className="v4-join-error-note" role="alert">{joinError}</p>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handleRevealForm}
                  >
                    {ctaLabel} <span className="arrow">→</span>
                  </button>
                </div>
              )}

              {(phase === 'form' || phase === 'sending') && (
                <form className="v4-join-form-reveal" onSubmit={handleSendLink}>
                  {/* Scattered shape decoration — matches the sign-in
                      / sent-card / pickwinner modal vocabulary. */}
                  <span className="v4-join-form-shape v4-join-form-shape-1" aria-hidden="true" />
                  <span className="v4-join-form-shape v4-join-form-shape-2" aria-hidden="true" />
                  <span className="v4-join-form-shape v4-join-form-shape-3" aria-hidden="true" />
                  <span className="v4-join-form-shape v4-join-form-shape-4" aria-hidden="true" />
                  <span className="v4-join-form-shape v4-join-form-shape-5" aria-hidden="true" />
                  <div className="v4-join-form-head">
                    Quick, what’s your email?
                  </div>
                  <p className="v4-join-form-why">{formWhy}</p>
                  <div className="v4-join-form-row">
                    <div className="v4-settings-input-with-icon v4-join-form-input">
                      <EnvelopeSimple weight="bold" size={14} className="v4-settings-input-icon" />
                      <input
                        ref={emailRef}
                        type="email"
                        className="v4-settings-input v4-settings-input-padded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={phase === 'sending'}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={phase === 'sending'}
                    >
                      {phase === 'sending' ? (
                        <>Sending&hellip;</>
                      ) : (
                        <>
                          Continue <span className="arrow">→</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {phase === 'sent' && (
                <div className="v4-join-sent-card">
                  {/* Scattered shape decoration — matches the sign-in /
                      edit / pickwinner modals so this card reads as
                      part of the same family. */}
                  <span className="v4-join-sent-shape v4-join-sent-shape-1" aria-hidden="true" />
                  <span className="v4-join-sent-shape v4-join-sent-shape-2" aria-hidden="true" />
                  <span className="v4-join-sent-shape v4-join-sent-shape-3" aria-hidden="true" />
                  <span className="v4-join-sent-shape v4-join-sent-shape-4" aria-hidden="true" />
                  <span className="v4-join-sent-shape v4-join-sent-shape-5" aria-hidden="true" />
                  <img
                    src={messageImg}
                    alt=""
                    aria-hidden="true"
                    className="v4-join-sent-hero"
                  />
                  <h3 className="v4-join-sent-title">Magic link sent</h3>
                  <p className="v4-join-sent-sub">
                    Check <strong>{email}</strong>, open the link to{' '}
                    {stage === 'voting'
                      ? 'jump in and vote on the names.'
                      : 'jump into the brief and start suggesting names.'}
                  </p>
                  {!realContest && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={handleOpenLink}
                      >
                        Open the link <span className="arrow">→</span>
                      </button>
                      <p className="v4-join-form-fine v4-join-form-fine-demo">
                        ↑ Demo shortcut. In production this is just the link
                        in your email.
                      </p>
                    </>
                  )}
                  <button
                    type="button"
                    className="v4-signin-link"
                    onClick={() => setPhase('form')}
                  >
                    Use a different email
                  </button>
                </div>
              )}

              {phase === 'success' && (
                <div className="v4-join-sent-card">
                  <span className="v4-join-sent-shape v4-join-sent-shape-1" aria-hidden="true" />
                  <span className="v4-join-sent-shape v4-join-sent-shape-2" aria-hidden="true" />
                  <span className="v4-join-sent-shape v4-join-sent-shape-3" aria-hidden="true" />
                  <span className="v4-join-sent-shape v4-join-sent-shape-4" aria-hidden="true" />
                  <span className="v4-join-sent-shape v4-join-sent-shape-5" aria-hidden="true" />
                  <div className="v4-signin-icon-wrap v4-signin-icon-wrap-success">
                    <CheckCircle weight="duotone" size={28} />
                  </div>
                  <h3 className="v4-join-sent-title">You’re in.</h3>
                  <p className="v4-join-sent-sub">
                    Taking you to the brief now&hellip;
                  </p>
                </div>
              )}
            </section>

          </div>

          {/* ── HOW IT WORKS — lives OUTSIDE .v4-join-inner so it's
              pinned to the bottom of the page (mirroring how the nav
              is pinned to the top). Same horizontal padding pattern
              as the nav so logo / deadline / steps share an alignment
              grid down both edges of the screen. */}
          <footer className="v4-join-foot">
            {/* The flow reflects the contest's real stage: the active step is
                where a joiner lands right now (submissions open → suggest;
                voting open → vote; closed → see who won). */}
            {(() => {
              const currentStep = stage === 'voting' ? 1 : stage === 'closed' ? 2 : 0;
              const steps = [
                {
                  title: 'Suggest names',
                  em: currentStep === 0 ? 'You’re here · ~5 minutes'
                    : 'Names are in',
                },
                {
                  title: 'Vote on the names',
                  em: currentStep === 1 ? 'You’re here · pick your favorites'
                    : currentStep < 1 ? 'When names close'
                    : 'Voting done',
                },
                {
                  title: 'See who won',
                  em: currentStep === 2 ? 'You’re here · results are in'
                    : 'Shoutout if it’s yours',
                },
              ];
              return (
                <ol className="v4-join-flow">
                  {steps.map((s, i) => (
                    <li
                      key={s.title}
                      className={`v4-join-flow-step ${
                        i === currentStep ? 'is-current' : i < currentStep ? 'is-done' : 'is-upcoming'
                      }`}
                    >
                      <span className="v4-join-flow-dot" aria-hidden="true" />
                      <span className="v4-join-flow-label">
                        <strong>{s.title}</strong>
                        <em>{s.em}</em>
                      </span>
                    </li>
                  ))}
                </ol>
              );
            })()}
          </footer>
        </main>
      </div>
    </div>
  );
}
