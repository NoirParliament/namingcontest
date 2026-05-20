// V4 ParticipantVoteThanks — confirmation after the participant votes.
//
// URL: /v4/contest/:id/vote-thanks
//
// Same shape as ParticipantThanks: receipt + waiting room. The body
// shows the voted-for cards in their tone-tinted "selected" style so
// the user's picks visually carry through from /vote. Countdown to
// the winner lives inside the footer timeline's current step. No CTA.

import { useRef, useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { Trophy, LockSimple } from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import heroProfile1 from '../../assets/hero-profile-1.png';
import heroProfile2 from '../../assets/hero-profile-2.png';
import heroProfile3 from '../../assets/hero-profile-3.png';
import heroProfile4 from '../../assets/hero-profile-4.png';
import heroProfile5 from '../../assets/hero-profile-5.png';
import heroProfile6 from '../../assets/hero-profile-6.png';
import HeroAvatarsAnimation from '../../components/HeroAvatarsAnimation';
import AvatarMenu from '../../components/v4/AvatarMenu';
import { getMockContestById } from '../../data/v4/mockContests';
import { getSegmentTone, SEGMENT_THEME } from '../../data/v4/segmentTheme';
import { readSetup } from '../../utils/v4Brief';
import { readParticipation } from '../../utils/v4Participant';
import useCountdown, { pad2 } from '../../utils/useCountdown';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

const HERO_PROFILES = [
  heroProfile1, heroProfile2, heroProfile3,
  heroProfile4, heroProfile5, heroProfile6,
];

// Compact "in 4d 09h" ETA for the disabled CTA button.
function ctaEta(c) {
  if (!c || c.unknown || c.isReady) return null;
  if (c.d > 0) return `in ${c.d}d ${c.h}h`;
  if (c.h > 0) return `in ${c.h}h ${c.m}m`;
  return `in ${c.m}m`;
}

export default function ParticipantVoteThanks() {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const contest = getMockContestById(contestId);
  const participation = readParticipation(contestId);
  const subId = contest?.subSegmentId;
  const tone = subId ? getSegmentTone(subId) : null;
  const segmentBg = SEGMENT_THEME[subId]?.blobs?.[0] || tone?.bg || '#a6dcb3';

  const creatorName = contest?.creator?.name || 'the organizer';
  const contestName = contest?.workingName || contest?.name || 'the contest';
  const votedIds = participation?.votedFor || [];
  const votedCount = votedIds.length;
  const submittedCount = participation?.submittedNames?.length || 0;
  const isAnonymous = contest?.anonymous === true;

  // Authed user.
  const setup = readSetup();
  const userEmail = setup.userEmail || '';
  const userName = setup.userName || (userEmail.split('@')[0] || 'You');
  const userPhoto = setup.userPhoto || null;

  // Resolve voted ids back to actual submission objects for card rendering.
  const votedSubs = (() => {
    if (!contest?.allSubmissions) return [];
    const byId = new Map(contest.allSubmissions.map((s) => [s.id, s]));
    return votedIds.map((id) => byId.get(id)).filter(Boolean);
  })();

  // Winner-announced = launchedAt + (submissionDays + votingDays).
  const day = 86400000;
  const winnerAt =
    Number.isFinite(contest?.launchedAt)
      && Number.isFinite(contest?.settings?.submissionDays)
      && Number.isFinite(contest?.settings?.votingDays)
      ? contest.launchedAt + (contest.settings.submissionDays + contest.settings.votingDays) * day
      : null;
  const c = useCountdown(winnerAt);
  const winnerDateStr = winnerAt
    ? new Date(winnerAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric',
      })
    : 'soon';

  const scrollRef = useRef(null);

  // Card overflow handling — show first N + a "+X more" pill.
  const VISIBLE_LIMIT = 3;
  const [expanded, setExpanded] = useState(false);
  const visibleVotedSubs = expanded ? votedSubs : votedSubs.slice(0, VISIBLE_LIMIT);
  const overflowCount = Math.max(0, votedSubs.length - VISIBLE_LIMIT);

  if (!contest) return <Navigate to="/v4/settings" replace />;
  if (!participation) return <Navigate to={`/v4/join/${contestId}`} replace />;

  // Same drifting voter cast as the join + thanks pages.
  const animAvatars = (() => {
    const inviterIdx = (contest?.creator?.photoIndex || 1) - 1;
    const pool = HERO_PROFILES.filter((_, i) => i !== inviterIdx);
    const positions = [
      { id: 0, side: 'left',  top: '16%', x: '7%' },
      { id: 1, side: 'right', top: '16%', x: '7%' },
      { id: 2, side: 'left',  top: '46%', x: '3%' },
      { id: 3, side: 'right', top: '46%', x: '3%' },
      { id: 4, side: 'left',  top: '76%', x: '8%' },
      { id: 5, side: 'right', top: '76%', x: '8%' },
    ];
    return positions.map((p, i) => ({ ...p, photo: pool[i % pool.length] }));
  })();

  return (
    <div className="v4 lp-v3">
      <div
        className="v4-screen v4-join-screen"
        style={{ '--join-bg': segmentBg, '--join-fg': tone?.fg || '#0a3b1f' }}
      >
        <span className="v4-blob v4-join-blob v4-join-blob-1" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-2" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-3" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-4" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-5" aria-hidden="true" />

        {/* Same drifting-avatars animation as /join (full mode —
            typing → name → voting → crown). Keeps the participant
            journey visually consistent across all three pages. */}
        <HeroAvatarsAnimation
          className="hero-anim v4-join-anim"
          bubbleDirection="outward"
          avatars={animAvatars}
        />

        <main className="v4-review" role="main" ref={scrollRef}>
          <header className="v4-nav v4-join-nav">
            <Link to="/" className="v4-brand">
              <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
            </Link>
            <div className="v4-progress v4-join-nav-inviter">
              <span className="v4-join-inviter-invites">Voted in</span>
              <strong className="v4-join-inviter-name-inline">
                {creatorName}
              </strong>
              <span className="v4-join-inviter-role-inline">
                ({contestName})
              </span>
            </div>
            <div className="v4-nav-right">
              <AvatarMenu
                email={userEmail}
                name={userName}
                photo={userPhoto}
                defaultPhoto={heroProfile3}
                tone={tone}
                activeContest={{
                  id: contest.id,
                  name: contestName,
                  phase: 'WINNER SOON',
                  tone,
                  to: '/v4/settings',
                }}
              />
            </div>
          </header>

          <div className="v4-review-inner v4-pthanks-inner">
            {/* ── HERO — matches the join page hero shape exactly:
                2-word Inter caps eyebrow + Fraunces italic contest
                name + Inter sub. */}
            <section className="v4-pthanks-hero">
              <div className="v4-pthanks-eyebrow">
                {contestName}
              </div>
              <h1 className="v4-pthanks-title">
                {votedCount === 1 ? 'Vote locked in.' : 'Votes locked in.'}
              </h1>
              <p className="v4-pthanks-sub">
                Your {votedCount === 1 ? 'pick is in' : `${votedCount} picks are in`} —
                {' '}{creatorName} announces the winner next.
              </p>
            </section>

            {/* ── Cards — same mini ticket-stub design as /thanks.
                Segment-tinted band with rank number + perforated
                edge + name and why on the body. */}
            {votedSubs.length > 0 && (
              <section
                className="v4-pthanks-receipt"
                aria-label="Names you voted for"
              >
                <ul className="v4-pthanks-card-list">
                  {visibleVotedSubs.map((s, i) => (
                    <li key={s.id} className="v4-pthanks-card">
                      <div className="v4-pthanks-card-band" aria-hidden="true">
                        <span className="v4-pthanks-card-band-num">
                          {i + 1}
                        </span>
                      </div>
                      <div className="v4-pthanks-card-body">
                        <div className="v4-pthanks-card-name">{s.text}</div>
                        {s.whyItFits && (
                          <div className="v4-pthanks-card-why">
                            {s.whyItFits}
                          </div>
                        )}
                        {!isAnonymous && s.submitterName && (
                          <div className="v4-pthanks-card-by">
                            by <strong>{s.submitterName}</strong>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {overflowCount > 0 && (
                  <button
                    type="button"
                    className="v4-pthanks-overflow"
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded
                      ? 'Show fewer'
                      : `+ ${overflowCount} more ${overflowCount === 1 ? 'vote' : 'votes'}`}
                  </button>
                )}
              </section>
            )}

            {/* ── Anticipation CTA — disabled until the winner is
                announced. When ready it activates and routes to the
                workspace (where the winner result will surface). */}
            <div className="v4-pthanks-cta">
              <button
                type="button"
                className="btn btn-primary btn-lg v4-pthanks-cta-btn"
                aria-disabled={!c.isReady}
                onClick={() => {
                  if (!c.isReady) return;
                  navigate('/v4/settings');
                }}
                title={
                  c.isReady ? 'See the winner' : 'Winner announced soon'
                }
              >
                {c.isReady ? (
                  <>
                    <Trophy weight="bold" size={14} className="v4-pthanks-cta-icon" />
                    See winner <span className="arrow">→</span>
                  </>
                ) : c.unknown ? (
                  <>
                    <LockSimple weight="fill" size={14} className="v4-pthanks-cta-icon" />
                    Winner <span className="v4-pthanks-cta-eta">· announced soon</span>
                  </>
                ) : (
                  <>
                    <LockSimple weight="fill" size={14} className="v4-pthanks-cta-icon" />
                    Winner{' '}
                    <span className="v4-pthanks-cta-eta">
                      · {ctaEta(c)}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Footer timeline — countdown inside the "See who won" step */}
          <footer className="v4-join-foot">
            <ol className="v4-join-flow">
              <li className="v4-join-flow-step is-done">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Suggested ✓</strong>
                  <em>{submittedCount} {submittedCount === 1 ? 'name' : 'names'}</em>
                </span>
              </li>
              <li className="v4-join-flow-step is-done">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Voted ✓</strong>
                  <em>just now</em>
                </span>
              </li>
              <li className="v4-join-flow-step is-current">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>See who won</strong>
                  <em>
                    {c.unknown ? 'announced soon'
                      : c.isReady ? 'winner picked'
                      : `announced ${winnerDateStr}`}
                  </em>
                </span>
              </li>
            </ol>
          </footer>
        </main>
      </div>
    </div>
  );
}
