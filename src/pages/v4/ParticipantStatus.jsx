// V4 ParticipantStatus — the participant's persistent dashboard for
// a contest they've joined. Different from /thanks (which is a
// one-time confirmation): this is the surface you return to via the
// avatar menu or workspace "joined" row.
//
// URL: /v4/contest/:id/status
//
// Layout:
//   [nav: logo + avatar]
//   [contest hero — name + project summary, segment-tinted]
//   [submission summary card — what you submitted, when]
//   [voting countdown card — live ticking d/h/m/s till voting opens]
//   [vote CTA — greyed out + disabled until countdown hits zero]
//   [3-step strip — submitted ✓, vote (active), winner picked]

import { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle, Clock, Trophy, ArrowLeft,
} from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import participantProfile from '../../assets/participant-profile.png';
import { getMockContestById } from '../../data/v4/mockContests';
import { SegmentThemeBackdrop, getSegmentTone, SEGMENT_THEME } from '../../data/v4/segmentTheme';
import { readSetup } from '../../utils/v4Brief';
import { readParticipation } from '../../utils/v4Participant';
import AvatarMenu from '../../components/v4/AvatarMenu';
import { useAuth } from '../../lib/AuthContext';
import { useProfile } from '../../lib/useProfile';
import useCountdown, { pad2 } from '../../utils/useCountdown';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

export default function ParticipantStatus() {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const contest = getMockContestById(contestId);
  const participation = readParticipation(contestId);
  const subId = contest?.subSegmentId;
  const tone = subId ? getSegmentTone(subId) : null;
  const segmentBg = subId ? SEGMENT_THEME[subId]?.blobs?.[0] : null;
  const submittedCount = participation?.submittedNames?.length || 0;
  const setup = readSetup();
  // Signed-in users get their real account identity (cached profile → no
  // placeholder flash); the guest blob is the source only when signed out.
  // This page previously hardcoded the mock stock photo for everyone.
  const { user } = useAuth();
  const [profile] = useProfile(user);
  const userEmail = user?.email || setup.userEmail || '';
  const userName = profile?.display_name || setup.userName || (userEmail.split('@')[0] || 'You');
  const userPhoto = setup.userPhoto || null;
  const ContestIcon = contest?.Icon;
  const scrollRef = useRef(null);

  // Compute voting-opens timestamp from launch + submissionDays.
  const launchedAt = contest?.launchedAt;
  const submissionDays = contest?.settings?.submissionDays;
  const votingOpensAt =
    Number.isFinite(launchedAt) && Number.isFinite(submissionDays)
      ? launchedAt + submissionDays * 86400000
      : null;
  const countdown = useCountdown(votingOpensAt);

  // Guards
  useEffect(() => {
    if (!contest) {
      navigate('/v4/settings', { replace: true });
      return;
    }
    if (!participation) {
      navigate(`/v4/join/${contestId}`, { replace: true });
    }
  }, [contest, participation, contestId, navigate]);

  if (!contest || !participation) return null;

  // Format "voting opens [date]" tooltip / fallback text.
  const votingOpensDateStr = votingOpensAt
    ? new Date(votingOpensAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric',
      })
    : 'soon';

  return (
    <div className="v4 lp-v3">
      <div
        className="v4-screen"
        style={segmentBg ? { '--join-bg': segmentBg } : undefined}
      >
        <SegmentThemeBackdrop subId={subId} minimal />
        <main className="v4-review" role="main" ref={scrollRef}>
          <header className="v4-nav v4-nav-clear">
            <button
              type="button"
              className="v4-brand v4-brand-button"
              onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top"
            >
              <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
            </button>
            <div className="v4-progress">
              <span className="v4-step-label">Your contest</span>
            </div>
            <div className="v4-nav-right">
              <AvatarMenu
                email={userEmail}
                name={userName}
                photo={profile?.avatar_url || (user ? null : participantProfile)}
                seed={user?.id}
                tone={tone}
                activeContest={{
                  id: contest.id,
                  name: contest.workingName || contest.name,
                  phase: countdown.isReady ? 'VOTING' : 'SUBMITTED',
                  tone,
                  to: `/v4/contest/${contest.id}/status`,
                }}
              />
            </div>
          </header>

          <div className="v4-review-inner v4-pstatus-inner">
            {/* ── Back link to workspace ──────────────────────────── */}
            <Link to="/v4/settings" className="v4-pstatus-back">
              <ArrowLeft weight="bold" size={12} />
              My workspace
            </Link>

            {/* ── Contest hero ────────────────────────────────────── */}
            <section className="v4-pstatus-hero">
              {ContestIcon && (
                <div
                  className="v4-pstatus-hero-icon"
                  style={tone ? { background: tone.bg, color: tone.fg } : undefined}
                >
                  <ContestIcon weight="duotone" size={26} />
                </div>
              )}
              <h1 className="v4-pstatus-hero-name">
                {contest.workingName || contest.name}
              </h1>
              {contest.brief?.projectSummary && (
                <p className="v4-pstatus-hero-sub">
                  “{contest.brief.projectSummary}”
                </p>
              )}
            </section>

            {/* ── Submission summary chip ─────────────────────────── */}
            <section className="v4-pstatus-summary">
              <span
                className="v4-pstatus-summary-icon"
                style={tone ? { background: tone.bg, color: tone.fg } : undefined}
              >
                <CheckCircle weight="fill" size={18} />
              </span>
              <div>
                <div className="v4-pstatus-summary-head">
                  You suggested{' '}
                  <strong>
                    {submittedCount}{' '}
                    {submittedCount === 1 ? 'name' : 'names'}
                  </strong>
                </div>
                <div className="v4-pstatus-summary-sub">
                  Locked in. Waiting for voting to open.
                </div>
              </div>
            </section>

            {/* ── Voting countdown card ───────────────────────────── */}
            <section className="v4-pstatus-countdown">
              <div className="v4-pstatus-countdown-head">
                <Clock weight="duotone" size={16} className="v4-pstatus-countdown-clock" />
                <span>Voting opens in</span>
              </div>
              {countdown.unknown ? (
                <div className="v4-pstatus-countdown-unknown">
                  We’ll email you when voting opens.
                </div>
              ) : countdown.isReady ? (
                <div className="v4-pstatus-countdown-ready">
                  Voting is open!
                </div>
              ) : (
                <div className="v4-pstatus-countdown-digits">
                  <CountdownUnit value={countdown.d} label="days" />
                  <span className="v4-pstatus-countdown-sep">:</span>
                  <CountdownUnit value={pad2(countdown.h)} label="hours" />
                  <span className="v4-pstatus-countdown-sep">:</span>
                  <CountdownUnit value={pad2(countdown.m)} label="min" />
                  <span className="v4-pstatus-countdown-sep">:</span>
                  <CountdownUnit value={pad2(countdown.s)} label="sec" />
                </div>
              )}
              <div className="v4-pstatus-countdown-foot">
                {votingOpensAt ? `Voting opens ${votingOpensDateStr}` : ''}
              </div>
            </section>

            {/* ── Vote CTA — disabled until countdown hits zero ───── */}
            <div className="v4-pstatus-vote-row">
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate(`/v4/contest/${contestId}/vote`)}
                disabled={!countdown.isReady}
                title={countdown.isReady ? 'Cast your vote' : `Voting opens ${votingOpensDateStr}`}
              >
                {countdown.isReady ? (
                  <>Vote now <span className="arrow">→</span></>
                ) : (
                  <>Vote (opens {votingOpensDateStr})</>
                )}
              </button>
            </div>

            {/* ── 3-step strip (same as thanks page) ──────────────── */}
            <ol className="v4-join-flow v4-pthanks-flow">
              <li className="v4-join-flow-step v4-pthanks-flow-step-done">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Suggested ✓</strong>
                  <em>{submittedCount} {submittedCount === 1 ? 'name' : 'names'}</em>
                </span>
              </li>
              <li className={`v4-join-flow-step ${countdown.isReady ? 'v4-pthanks-flow-step-active' : 'v4-pthanks-flow-step-upcoming'}`}>
                <span className={`v4-join-flow-dot ${countdown.isReady ? 'v4-pthanks-flow-dot-pulse' : ''}`} aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>
                    <Clock weight="duotone" size={14} className={countdown.isReady ? 'v4-pthanks-clock-icon' : undefined} />
                    {' '}Vote
                  </strong>
                  <em>{countdown.isReady ? 'open now' : `opens ${votingOpensDateStr}`}</em>
                </span>
              </li>
              <li className="v4-join-flow-step v4-pthanks-flow-step-upcoming">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>
                    <Trophy weight="duotone" size={14} />
                    {' '}Winner picked
                  </strong>
                  <em>shoutout if it’s yours</em>
                </span>
              </li>
            </ol>
          </div>
        </main>
      </div>
    </div>
  );
}

// Individual countdown unit — number on top, label below. Number gets
// a brief flash animation when it ticks (CSS keyframe via key change).
function CountdownUnit({ value, label }) {
  return (
    <div className="v4-pstatus-countdown-unit">
      <div className="v4-pstatus-countdown-num" key={value}>{value}</div>
      <div className="v4-pstatus-countdown-lbl">{label}</div>
    </div>
  );
}
