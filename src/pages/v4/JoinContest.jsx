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

import HeroAvatarsAnimation from '../../components/HeroAvatarsAnimation';

import { getMockContestById } from '../../data/v4/mockContests';
import { getSegmentTone, SEGMENT_THEME } from '../../data/v4/segmentTheme';
import { readSetup, writeSetup } from '../../utils/v4Brief';
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
  const emailRef = useRef(null);

  // Resolve contest from the mock store. In production: fetch by ID.
  const contest = getMockContestById(contestId);

  // Local state for the magic-link mini-flow inside this page.
  // 'cta'     — initial; only the big "Yes, I'm in" button is shown.
  // 'form'    — CTA was clicked; email field + magic-link explanation reveal.
  // 'sending' — between submit and the simulated send.
  // 'sent'    — "check your email" with the demo "Open the link" button.
  // 'success' — brief celebration → route to chat.
  const [phase, setPhase] = useState('cta');
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
      submissionLimit: contest.settings?.submissionLimit || 3,
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
  const submissionLimit = contest.settings?.submissionLimit || 3;
  const submissionDeadline = formatDeadline(contest.settings?.submissionDays);

  // Short "what is this" line under the headline. Sourced from the
  // dedicated `projectSummary` brief field — the first question every
  // segment asks the creator, specifically written so the answer can
  // land on this invitation page without further editing.
  const briefSummary = contest.brief?.projectSummary || null;
  const prize = contest.settings?.submitterPrize?.enabled
    ? contest.settings?.submitterPrize
    : null;
  const customReqs = contest.settings?.customRequirements?.enabled
    ? contest.settings?.customRequirements?.text
    : null;

  // Per-segment palette: page tint comes from the first blob color of
  // the segment's theme; bubbles flip to white-on-tint so they read.
  const segmentBg = SEGMENT_THEME[subId]?.blobs?.[0] || tone.bg;

  // ── Magic-link handlers ────────────────────────────────────────────
  const handleRevealForm = () => {
    setPhase('form');
  };

  const handleSendLink = (e) => {
    e?.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      window.alert('Please enter a valid email address so we can send your link.');
      return;
    }
    setPhase('sending');
    setTimeout(() => setPhase('sent'), 700);
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
        {/* Inverted backdrop — white bubbles on the segment-colored page.
            Rendered inline (not via SegmentThemeBackdrop) because we want
            the bubble palette flipped and the illustration PNGs hidden. */}
        <span className="v4-blob v4-join-blob v4-join-blob-1" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-2" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-3" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-4" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-5" aria-hidden="true" />

        {/* Full homepage mock-voting animation — 6 drifting avatars
            with typing dots, name bubbles, vote-fly chips, crown on
            the winner. Runs in a loop. Pulls the inviter's photo OUT
            of the cast so they only appear once (in the hero card). */}
        <HeroAvatarsAnimation
          className="hero-anim v4-join-anim"
          bubbleDirection="outward"
          avatars={(() => {
            // Pool = all hero profiles EXCEPT the inviter's. Cycled
            // across the 6 fixed positions (one photo may appear twice
            // since the pool is only 5 — acceptable; they're at
            // different sides of the screen, drifting independently).
            const inviterIdx = (creator.photoIndex || 1) - 1;
            const pool = HERO_PROFILES.filter((_, i) => i !== inviterIdx);
            const positions = [
              // 6 avatars — 3 per side — like the homepage hero.
              // Pulled in from the edges enough that the bubbles
              // always fit on a 1280px+ screen.
              { id: 0, side: 'left',  top: '16%', x: '7%' },
              { id: 1, side: 'right', top: '16%', x: '7%' },
              { id: 2, side: 'left',  top: '46%', x: '3%' },
              { id: 3, side: 'right', top: '46%', x: '3%' },
              { id: 4, side: 'left',  top: '76%', x: '8%' },
              { id: 5, side: 'right', top: '76%', x: '8%' },
            ];
            return positions.map((p, i) => ({ ...p, photo: pool[i % pool.length] }));
          })()}
        />

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
              {submissionDeadline && (
                <span className="v4-join-nav-deadline">
                  <Clock weight="duotone" size={14} />
                  Submissions close <strong>{submissionDeadline}</strong>
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
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={handleRevealForm}
                  >
                    Yes, I’m in <span className="arrow">→</span>
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
                    Quick — what’s your email?
                  </div>
                  <p className="v4-join-form-why">
                    So {creatorName} can credit your suggestions, and we
                    can email you a magic link to come back and vote.
                    No password, no marketing.
                  </p>
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
                    Check <strong>{email}</strong> — open the link to
                    jump into the brief and start suggesting names.
                  </p>
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
            {/* "Suggest names" is the user's CURRENT step (they're
                on the join page = about to submit). Later steps are
                muted so the progression reads at a glance. */}
            <ol className="v4-join-flow">
              <li className="v4-join-flow-step is-current">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Suggest names</strong>
                  <em>You’re here · ~5 minutes</em>
                </span>
              </li>
              <li className="v4-join-flow-step is-upcoming">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Come back to vote</strong>
                  <em>When names close</em>
                </span>
              </li>
              <li className="v4-join-flow-step is-upcoming">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>See who won</strong>
                  <em>Shoutout if it’s yours</em>
                </span>
              </li>
            </ol>
          </footer>
        </main>
      </div>
    </div>
  );
}
