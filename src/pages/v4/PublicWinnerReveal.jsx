// V4 PublicWinnerReveal — the post-contest reveal that ANYONE can see
// when they click a share link after the contest is already over.
//
// URL: /v4/contest/:id/reveal
//
// Visually identical to ParticipantWinner (same hero + champion card +
// gold confetti + footer timeline) so the journey reads as one family,
// but the copy is neutral — no "you won" branch, no participation
// shape required, no AvatarMenu (the visitor may be logged out).
//
// Differences vs ParticipantWinner:
//   - drops the `participation` gate (random visitors land here)
//   - drops the `iWon` branch entirely
//   - adds a row of social-share buttons (copy link / email / SMS / X /
//     LinkedIn) — the whole point of this page is "share the result"
//   - footer timeline shows the contest's lifecycle (not the
//     visitor's own submitted/voted counts)
//
// Routing: /v4/join/:id auto-redirects non-participating visitors here
// when contest.winnerSubId is set. Participants keep going to the
// existing /winner page.

import { useRef, useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Trophy, ShareNetwork, Check, X } from '@phosphor-icons/react';
import ExitLink from '../../components/v4/ExitLink';
import confetti from 'canvas-confetti';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import { getMockContestById } from '../../data/v4/mockContests';
import { getSegmentTone, SEGMENT_THEME } from '../../data/v4/segmentTheme';
import { buildLiveData } from '../../utils/v4LiveData';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

// Same RICH golds as ParticipantWinner so the burst reads as the same
// celebration regardless of which page a visitor lands on.
const GOLD = ['#f4c64b', '#e8b923', '#d4a017', '#c99700'];

// Opening boom — two corner cannons. Identical to ParticipantWinner.
function launchBoom(fire) {
  const cannon = (opts) => fire({
    particleCount: 90,
    startVelocity: 82,
    spread: 80,
    ticks: 360,
    scalar: 1,
    gravity: 1,
    colors: GOLD,
    ...opts,
  });
  cannon({ origin: { x: 0.06, y: 1 }, angle: 72 });
  cannon({ origin: { x: 0.94, y: 1 }, angle: 108 });
}

export default function PublicWinnerReveal() {
  const { id: contestId } = useParams();
  const contest = getMockContestById(contestId);
  const subId = contest?.subSegmentId;
  const tone = subId ? getSegmentTone(subId) : null;
  const segmentBg = SEGMENT_THEME[subId]?.blobs?.[0] || tone?.bg || '#a6dcb3';

  const creatorName = contest?.creator?.name || 'the organizer';
  const contestName = contest?.workingName || contest?.name || 'the contest';

  // Resolve the winning name from contest.winnerSubId or top vote.
  const live = contest ? buildLiveData(contest, 'winner') : { names: [], stats: { votes: 0, participants: 0 } };
  const winner =
    live.names.find((n) => n.id === contest?.winnerSubId) ||
    [...live.names].sort((a, b) => b.voteCount - a.voteCount)[0] ||
    null;
  const totalVotes = live.stats.votes;
  const totalNames = live.names.length;
  const totalParticipants = live.stats.participants;

  // ── Confetti (identical to ParticipantWinner) ────────────────────
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!winner || !canvasRef.current) return;
    const fire = confetti.create(canvasRef.current, { resize: true, useWorker: false });
    let running = true;
    let raf = 0;
    let last = 0;
    const boomT = setTimeout(() => { if (running) launchBoom(fire); }, 300);
    const frame = (now) => {
      if (!running) return;
      if (now - last > 120) {
        last = now;
        for (let i = 0; i < 4; i++) {
          fire({
            particleCount: 1,
            startVelocity: 0,
            ticks: 620,
            gravity: 0.9,
            scalar: 1,
            drift: (Math.random() - 0.5) * 0.6,
            origin: { x: Math.random(), y: -0.05 },
            colors: [GOLD[(Math.random() * GOLD.length) | 0]],
            disableForReducedMotion: true,
          });
        }
      }
      raf = requestAnimationFrame(frame);
    };
    const fallT = setTimeout(() => { raf = requestAnimationFrame(frame); }, 800);
    return () => {
      running = false;
      clearTimeout(boomT);
      clearTimeout(fallT);
      cancelAnimationFrame(raf);
      fire.reset();
    };
  }, [contestId, winner?.id]);

  // ── Share state ──────────────────────────────────────────────────
  // The share URL is THIS public reveal page — anyone clicking the
  // shared link lands right back here.
  // One button, one job: copy this page's URL to the clipboard so the
  // visitor can paste it anywhere (DM, email, slack, whatever).
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/v4/contest/${contestId}/reveal`
    : `/v4/contest/${contestId}/reveal`;
  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    try {
      navigator.clipboard?.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — silently no-op
    }
  };

  const scrollRef = useRef(null);

  if (!contest) return <Navigate to="/" replace />;
  // No winner resolvable — the reveal makes no sense, kick to landing.
  if (!winner) return <Navigate to="/" replace />;

  const voteLine = `${winner.voteCount}${typeof totalVotes === 'number' ? ` of ${totalVotes}` : ''} votes`;

  return (
    <div className="v4 lp-v3">
      <div
        className="v4-screen v4-join-screen v4-pwinner-screen"
        style={{ '--join-bg': segmentBg, '--join-fg': tone?.fg || '#0a3b1f' }}
      >
        <span className="v4-blob v4-join-blob v4-join-blob-1" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-2" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-3" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-4" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-5" aria-hidden="true" />

        <canvas ref={canvasRef} className="v4-pwinner-confetti-canvas" aria-hidden="true" />

        <main className="v4-review" role="main" ref={scrollRef}>
          <header className="v4-nav v4-join-nav">
            <BrandLink />
            <div className="v4-progress v4-join-nav-inviter">
              <span className="v4-join-inviter-invites">Hosted by</span>
              <strong className="v4-join-inviter-name-inline">{creatorName}</strong>
              <span className="v4-join-inviter-role-inline">({contestName})</span>
            </div>
            {/* No AvatarMenu — the visitor may be signed out. Exit
                takes them to the MARKETING homepage. We use `/#top`
                (not `/`) so the LandingPage's auth-redirect bypass
                (already in place for hashes like /#faq) fires here
                too — otherwise authed creators sharing the link
                would get bounced into their workspace. */}
            <div className="v4-nav-right">
              <ExitLink to="/#top" aria-label="Exit" />
            </div>
          </header>

          <div className="v4-review-inner v4-pthanks-inner">
            {/* ── HERO — neutral framing, no "you" pronouns. */}
            <section className="v4-pthanks-hero">
              <div className="v4-pthanks-eyebrow">{contestName}</div>
              <h1 className="v4-pthanks-title v4-pwinner-title">
                {winner.text}
              </h1>
              <p className="v4-pthanks-sub">
                {winner.anonymous || !winner.submitterName
                  ? 'Crowned the winner'
                  : <><strong>{winner.submitterName}</strong> suggested it</>}
                {' · '}{voteLine}
              </p>
            </section>

            {/* ── Champion card — identical to ParticipantWinner. */}
            <section className="v4-pthanks-receipt" aria-label="The winning name">
              <ul className="v4-pthanks-card-list">
                <li className="v4-pthanks-card v4-pthanks-card-champion">
                  <div className="v4-pthanks-card-band" aria-hidden="true">
                    <Trophy weight="fill" size={22} />
                  </div>
                  <div className="v4-pthanks-card-body">
                    <div className="v4-pthanks-card-name">{winner.text}</div>
                    {winner.whyItFits && (
                      <div className="v4-pthanks-card-why">{winner.whyItFits}</div>
                    )}
                    <div className="v4-pthanks-card-by">
                      {(!winner.anonymous && winner.submitterName)
                        ? <>Submitted by <strong>{winner.submitterName}</strong></>
                        : <span className="is-anon">Submitted anonymously</span>}
                    </div>
                  </div>
                </li>
              </ul>
            </section>

            {/* Share — one button, copies this page's URL. */}
            <div className="v4-preveal-share-wrap">
              <button
                type="button"
                className={`v4-preveal-share-btn ${copied ? 'is-copied' : ''}`}
                onClick={handleShare}
              >
                {copied ? (
                  <><Check weight="bold" size={16} /> Link copied</>
                ) : (
                  <><ShareNetwork weight="bold" size={16} /> Share</>
                )}
              </button>
            </div>
          </div>

          {/* ── Footer timeline — generic lifecycle, not visitor's
              participation counts (since they may have none). */}
          <footer className="v4-join-foot">
            <ol className="v4-join-flow">
              <li className="v4-join-flow-step is-done">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Submissions ✓</strong>
                  <em>{totalNames} {totalNames === 1 ? 'name' : 'names'}</em>
                </span>
              </li>
              <li className="v4-join-flow-step is-done">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Voting ✓</strong>
                  <em>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}{totalParticipants ? ` · ${totalParticipants} ${totalParticipants === 1 ? 'person' : 'people'}` : ''}</em>
                </span>
              </li>
              <li className="v4-join-flow-step is-done">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Winner revealed ✓</strong>
                  <em>{winner.text}</em>
                </span>
              </li>
            </ol>
          </footer>
        </main>
      </div>
    </div>
  );
}
