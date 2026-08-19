// V4 ParticipantWinner — the winner reveal a participant sees once the
// creator has crowned a name.
//
// URL: /v4/contest/:id/winner
//
// Same v4-join-* shell as the invitation / submission-thanks /
// vote-thanks pages, so the journey stays visually whole end-to-end —
// except the drifting-people animation is swapped for a gentle, ongoing
// confetti fall (the white blobs stay). Two states, no CTA (the avatar
// menu + footer timeline carry navigation away):
//   • "your name won"    — YOU WON badge (+ prize), an extra opening pop
//   • "someone else won" — the winning name + who suggested it
//
// Winner resolution: contest.winnerSubId (may arrive via the per-contest
// localStorage override) with a top-voted fallback from buildLiveData.

import { useRef, useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Trophy, ShareNetwork, Check } from '@phosphor-icons/react';
import confetti from 'canvas-confetti';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import participantProfile from '../../assets/participant-profile.png';
import AvatarMenu from '../../components/v4/AvatarMenu';
import { getMockContestById } from '../../data/v4/mockContests';
import { getSegmentTone, SEGMENT_THEME, SegmentThemeBackdrop } from '../../data/v4/segmentTheme';
import { readSetup } from '../../utils/v4Brief';
import { readParticipation } from '../../utils/v4Participant';
import { buildLiveData } from '../../utils/v4LiveData';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

// Real gold confetti — RICH golds only (no pale cream shades, which read
// as near-white when the falling flecks are small). Anchored on the
// pill's deep gold (#f4c64b) so the burst and the fall both clearly read
// gold against the segment wash.
const GOLD = ['#f4c64b', '#e8b923', '#d4a017', '#c99700'];

// Opening boom — two cannons from the bottom corners, thrown hard enough
// to reach the TOP before gravity pulls them down, so it flows straight
// into the ongoing fall-from-top. Same gold as the fall so the burst and
// the drizzle read as one continuous moment.
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

export default function ParticipantWinner() {
  const { id: contestId } = useParams();
  const { user } = useAuth();
  const mockContest = getMockContestById(contestId);

  // ── Real contest winner (DB) ────────────────────────────────────────
  // Load the closed contest, its submissions (to resolve the winner + vote
  // totals), and the names of the creator + winning submitter + this viewer.
  const [dbContest, setDbContest] = useState(null);
  const [winnerSub, setWinnerSub] = useState(null);
  const [dbCreatorName, setDbCreatorName] = useState('the organizer');
  const [dbTotalVotes, setDbTotalVotes] = useState(0);
  const [dbMySubCount, setDbMySubCount] = useState(0);
  const [dbIWon, setDbIWon] = useState(false);
  const [profile, setProfile] = useState(null);
  const [dbLoading, setDbLoading] = useState(!mockContest);
  useEffect(() => {
    if (mockContest || !user?.id) return;
    let active = true;
    (async () => {
      const cRes = await supabase.from('contests').select('*').eq('id', contestId).single();
      const row = cRes.data;
      if (!row) { if (active) setDbLoading(false); return; }
      // get_ballot rather than the table: it resolves the submitter name
      // against the contest's anonymity rules and never returns user_id.
      // This page only renders once the contest is closed, so the RPC
      // releases real vote counts here.
      const sRes = await supabase.rpc('get_ballot', { cid: contestId });
      const subs = sRes.data || [];
      const win = subs.find((s) => s.id === row.winner_submission_id)
        || [...subs].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))[0]
        || null;
      const ids = [...new Set([row.creator_id, user.id].filter(Boolean))];
      let profs = {};
      if (ids.length) {
        const pRes = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids);
        (pRes.data || []).forEach((p) => { profs[p.id] = p; });
      }
      if (!active) return;
      setDbContest(row);
      setWinnerSub(win ? { ...win, submitterName: win.submitter_name } : null);
      setDbCreatorName(profs[row.creator_id]?.display_name || 'the organizer');
      setDbTotalVotes(subs.reduce((sum, s) => sum + (s.vote_count || 0), 0));
      setDbMySubCount(subs.filter((s) => s.is_mine).length);
      setDbIWon(!!win && !!win.is_mine);
      setProfile(profs[user.id] || null);
      setDbLoading(false);
      if (row.sub_segment_id) { try { localStorage.setItem('v4_last_sub', row.sub_segment_id); } catch { /* ignore */ } }
    })();
    return () => { active = false; };
  }, [mockContest, contestId, user?.id]);
  const isRealContest = !mockContest && !!dbContest;

  const contest = mockContest || (dbContest ? {
    id: dbContest.id,
    workingName: dbContest.working_name,
    subSegmentId: dbContest.sub_segment_id,
    settings: dbContest.settings || {},
    creator: { name: dbCreatorName },
  } : null);
  const participation = mockContest ? readParticipation(contestId) : null;
  const subId = contest?.subSegmentId;
  const tone = subId ? getSegmentTone(subId) : null;
  const segmentBg = SEGMENT_THEME[subId]?.blobs?.[0] || tone?.bg || '#a6dcb3';

  const creatorName = contest?.creator?.name || 'the organizer';
  const contestName = contest?.workingName || contest?.name || 'the contest';

  // Authed user identity.
  const setup = readSetup();
  const userEmail = isRealContest ? (user?.email || '') : (setup.userEmail || '');
  const userName = isRealContest
    ? (profile?.display_name || user?.email?.split('@')[0] || 'You')
    : (setup.userName || (userEmail.split('@')[0] || 'You'));
  const userPhoto = isRealContest ? (profile?.avatar_url || null) : (setup.userPhoto || null);

  // Resolve the winning name. Real contests read the winning submission off the
  // DB; the mock resolves it from buildLiveData (explicit id or top-voted).
  const live = mockContest ? buildLiveData(mockContest, 'winner') : { names: [], stats: { votes: 0 } };
  const winner = mockContest
    ? (live.names.find((n) => n.id === mockContest.winnerSubId)
        || [...live.names].sort((a, b) => b.voteCount - a.voteCount)[0]
        || null)
    : (winnerSub ? {
        id: winnerSub.id,
        text: winnerSub.text,
        whyItFits: winnerSub.rationale || '',
        submitterName: winnerSub.submitterName,
        anonymous: !winnerSub.credited,
        voteCount: winnerSub.vote_count || 0,
      } : null);
  const totalVotes = mockContest ? live.stats.votes : dbTotalVotes;
  const submittedCount = mockContest ? (participation?.submittedNames?.length || 0) : dbMySubCount;
  const iWon = mockContest
    ? (!!winner && (participation?.submittedNames || []).some((s) => s.text === winner.text))
    : dbIWon;

  const prizeOffered = contest?.settings?.submitterPrize?.enabled
    ? contest?.settings?.submitterPrize
    : null;
  // An anonymous winning entry forfeits the prize — the creator has no one to
  // award it to. So only surface the prize for a credited winner.
  const prize = (prizeOffered && !winner?.anonymous) ? prizeOffered : null;
  const prizeForfeited = !!prizeOffered && !!winner?.anonymous;

  // ONE opening boom, then a steady gold rain top→bottom. Rendered onto
  // our OWN canvas (canvasRef) so it sits BEHIND the central content
  // (the canvas z-index is below .v4-review) instead of over the card.
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
            // particleCount:1 always takes colors[0], so pick a RANDOM
            // gold per fleck for the full range like the boom.
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

  const scrollRef = useRef(null);

  // Share — copies the PUBLIC reveal URL (not /winner, which needs a
  // participation row) so anyone who clicks the link lands on a page
  // they can actually see.
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

  if (!mockContest) {
    // Not signed in → send to the public reveal (this page is the personalized
    // participant view). Wait for the load, then require a real contest.
    if (!user) return <Navigate to={`/v4/contest/${contestId}/reveal`} replace />;
    if (dbLoading) {
      return (
        <div className="v4 lp-v3"><div className="v4-screen" /></div>
      );
    }
    if (!dbContest) return <Navigate to="/v4/settings" replace />;
  } else {
    if (!contest) return <Navigate to="/v4/settings" replace />;
    if (!participation) return <Navigate to={`/v4/join/${contestId}`} replace />;
  }
  // No winner resolvable (e.g. empty contest, or none crowned yet) — fall back
  // to the vote-thanks waiting room rather than render an empty reveal.
  if (!winner) return <Navigate to={`/v4/contest/${contestId}/vote-thanks`} replace />;

  const voteLine = `${winner.voteCount}${typeof totalVotes === 'number' ? ` of ${totalVotes}` : ''} votes`;

  return (
    <div className="v4 lp-v3">
      <div
        className="v4-screen v4-join-screen v4-pwinner-screen"
        style={{ '--join-bg': segmentBg, '--join-fg': tone?.fg || '#0a3b1f' }}
      >
        {/* Same backdrop as every chat stage — see JoinContest. */}
        <SegmentThemeBackdrop subId={subId} minimal />

        {/* Confetti renders here — z-index below the content so it falls
            BEHIND the central card + title. */}
        <canvas ref={canvasRef} className="v4-pwinner-confetti-canvas" aria-hidden="true" />

        <main className="v4-review" role="main" ref={scrollRef}>
          <header className="v4-nav v4-join-nav">
            <BrandLink />
            <div className="v4-progress v4-join-nav-inviter">
              <span className="v4-join-inviter-invites">Crowned by</span>
              <strong className="v4-join-inviter-name-inline">{creatorName}</strong>
              <span className="v4-join-inviter-role-inline">({contestName})</span>
            </div>
            <div className="v4-nav-right">
              <AvatarMenu
                email={userEmail}
                name={userName}
                photo={isRealContest ? userPhoto : participantProfile}
                seed={isRealContest ? user?.id : undefined}
                tone={tone}
                activeContest={{
                  id: contest.id,
                  name: contestName,
                  phase: 'WINNER',
                  tone,
                  to: '/v4/settings',
                }}
              />
            </div>
          </header>

          <div className="v4-review-inner v4-pthanks-inner">
            {/* ── HERO — same shape as the other participant pages. */}
            <section className="v4-pthanks-hero">
              {iWon ? (
                <div className="v4-pwinner-badge">
                  <span>You won</span>
                  {prize && (
                    <span className="v4-pwinner-badge-prize">· {prize.name}</span>
                  )}
                </div>
              ) : (
                <div className="v4-pthanks-eyebrow">{contestName}</div>
              )}
              <h1 className="v4-pthanks-title v4-pwinner-title">
                {winner.text}
              </h1>
              <p className="v4-pthanks-sub">
                {iWon ? (
                  prizeForfeited
                    ? <>Your name took the crown, {voteLine} in. You entered anonymously, so the prize isn’t awarded.</>
                    : <>Your name took the crown, {voteLine} in.</>
                ) : (
                  <>
                    {winner.anonymous || !winner.submitterName
                      ? 'Crowned the winner'
                      : <><strong>{winner.submitterName}</strong> suggested it</>}
                    {' · '}{voteLine}
                  </>
                )}
              </p>
            </section>

            {/* ── Champion card — gold ticket-stub with the trophy band. */}
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
                      {iWon
                        ? <>Submitted by <strong>you</strong></>
                        : (!winner.anonymous && winner.submitterName
                            ? <>Submitted by <strong>{winner.submitterName}</strong></>
                            : <span className="is-anon">Submitted anonymously</span>)}
                    </div>
                  </div>
                </li>
              </ul>
            </section>

            {/* Share — copies the public reveal link so the win can be
                passed around (same control as the public reveal page). */}
            <div className="v4-preveal-share-wrap">
              <button
                type="button"
                className={`v4-preveal-share-btn v4-pwinner-share-btn ${copied ? 'is-copied' : ''}`}
                onClick={handleShare}
              >
                {copied ? (
                  <><Check weight="bold" size={16} /> Link copied</>
                ) : (
                  <><ShareNetwork weight="bold" size={16} /> Share {iWon ? 'your win' : 'the winner'}</>
                )}
              </button>
            </div>
          </div>

          {/* ── Footer timeline — all three steps done. */}
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
                  <em>Done</em>
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
