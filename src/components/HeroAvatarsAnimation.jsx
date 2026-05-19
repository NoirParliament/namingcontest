// Shared 6-avatar mock-voting animation. Originally lived in
// LandingPage.jsx as <HeroAnimation />; lifted out so the Join page
// (and any future surface) can render the same orbital theatre — the
// drifting profile pics, typing dots, name bubbles, vote-fly chips,
// crown on the winner, fade on the loser, loop forever.
//
// Visuals are owned by the lp-v3 styles (landing-v3.css). Any
// component using this MUST have an ancestor with the `lp-v3` class
// so the .hero-*, .hero-bubble*, .hero-crown, .vote-fly etc. rules
// resolve. Otherwise you'll get unstyled markup.

import { useState, useEffect, useRef } from 'react';
import heroProfile1 from '../assets/hero-profile-1.png';
import heroProfile2 from '../assets/hero-profile-2.png';
import heroProfile3 from '../assets/hero-profile-3.png';
import heroProfile4 from '../assets/hero-profile-4.png';
import heroProfile5 from '../assets/hero-profile-5.png';
import heroProfile6 from '../assets/hero-profile-6.png';

const HERO_NAMES = ['Atlas', 'Quill', 'Spire', 'Beacon', 'Helix', 'Vesper', 'Ember', 'Cobalt', 'Verge', 'Onyx'];

const DEFAULT_AVATARS = [
  { id: 0, photo: heroProfile1, side: 'left',  top: '18%', x: '3%' },
  { id: 1, photo: heroProfile3, side: 'right', top: '18%', x: '3%' },
  { id: 2, photo: heroProfile6, side: 'left',  top: '46%', x: '-32px' },
  { id: 3, photo: heroProfile2, side: 'right', top: '46%', x: '-32px' },
  { id: 4, photo: heroProfile4, side: 'left',  top: '74%', x: '10%' },
  { id: 5, photo: heroProfile5, side: 'right', top: '74%', x: '10%' },
];

export default function HeroAvatarsAnimation({
  avatars = DEFAULT_AVATARS,
  names = HERO_NAMES,
  className = 'hero-anim',
  // 'inward'  → bubble extends toward page center (homepage default,
  //              avatars + bubbles converge around the headline)
  // 'outward' → bubble extends toward the page edge (join page —
  //              keeps the center clear so bubbles don't overlap the
  //              hero / prize / CTA)
  bubbleDirection = 'inward',
}) {
  const [round, setRound] = useState(null);
  const [voteProgress, setVoteProgress] = useState(0);
  const avatarRefs = useRef({});

  useEffect(() => {
    let timeouts = [];
    let cancelled = false;
    let lastLeftId = -1, lastRightId = -1, lastLeftName = '', lastRightName = '';

    const startRound = () => {
      if (cancelled) return;
      const leftAvs = avatars.filter(a => a.side === 'left');
      const rightAvs = avatars.filter(a => a.side === 'right');

      let leftSugId, rightSugId;
      do { leftSugId = leftAvs[Math.floor(Math.random() * leftAvs.length)].id; } while (leftSugId === lastLeftId);
      do { rightSugId = rightAvs[Math.floor(Math.random() * rightAvs.length)].id; } while (rightSugId === lastRightId);
      lastLeftId = leftSugId; lastRightId = rightSugId;

      let leftName, rightName;
      do { leftName = names[Math.floor(Math.random() * names.length)]; } while (leftName === lastLeftName || leftName === lastRightName);
      do { rightName = names[Math.floor(Math.random() * names.length)]; } while (rightName === leftName || rightName === lastLeftName || rightName === lastRightName);
      lastLeftName = leftName; lastRightName = rightName;

      const voterIds = avatars.filter(a => a.id !== leftSugId && a.id !== rightSugId).map(a => a.id);
      const voters = voterIds.map(id => {
        const av = avatars.find(a => a.id === id);
        return { id, target: av.side, vote: 1, voted: false, counted: false };
      });

      const winnerSide = Math.random() < 0.5 ? 'left' : 'right';
      const winnerFinal = 30 + Math.floor(Math.random() * 20);
      const loserFinal = 12 + Math.floor(Math.random() * 12);
      const finalTotals = {
        left: winnerSide === 'left' ? winnerFinal : loserFinal,
        right: winnerSide === 'right' ? winnerFinal : loserFinal,
      };
      const winnerId = winnerSide === 'left' ? leftSugId : rightSugId;

      setRound({ leftSugId, rightSugId, leftName, rightName, voters, phase: 'typing', winnerId, finalTotals });

      timeouts.push(setTimeout(() => {
        if (cancelled) return;
        setRound(prev => prev ? { ...prev, phase: 'name' } : null);
      }, 700));

      const voteStart = 1500;
      const voteGap = 800;
      const voteFlightDuration = 950;
      voters.forEach((v, idx) => {
        timeouts.push(setTimeout(() => {
          if (cancelled) return;
          setRound(prev => {
            if (!prev) return null;
            const voterEl = avatarRefs.current[v.id];
            const targetId = v.target === 'left' ? prev.leftSugId : prev.rightSugId;
            const targetEl = avatarRefs.current[targetId];
            let dx = 0, dy = 0;
            if (voterEl && targetEl) {
              const vRect = voterEl.getBoundingClientRect();
              const tRect = targetEl.getBoundingClientRect();
              dx = (tRect.left + tRect.width / 2) - (vRect.left + vRect.width / 2);
              dy = (tRect.top + tRect.height / 2) - (vRect.top + vRect.height / 2);
            }
            return {
              ...prev,
              phase: 'voting',
              voters: prev.voters.map(x => x.id === v.id ? { ...x, voted: true, dx, dy } : x),
            };
          });
        }, voteStart + idx * voteGap));

        timeouts.push(setTimeout(() => {
          if (cancelled) return;
          setRound(prev => prev ? { ...prev, voters: prev.voters.map(x => x.id === v.id ? { ...x, counted: true } : x) } : null);
        }, voteStart + idx * voteGap + voteFlightDuration));
      });

      const crownAt = voteStart + (voters.length - 1) * voteGap + voteFlightDuration + 1000;
      timeouts.push(setTimeout(() => {
        if (cancelled) return;
        setRound(prev => prev ? { ...prev, phase: 'crowned' } : null);
      }, crownAt));

      const fadeAt = crownAt + 2500;
      timeouts.push(setTimeout(() => {
        if (cancelled) return;
        setRound(prev => prev ? { ...prev, phase: 'ending' } : null);
      }, fadeAt));

      const endAt = fadeAt + 1300;
      timeouts.push(setTimeout(() => {
        if (cancelled) return;
        setRound(null);
        timeouts.push(setTimeout(startRound, 400));
      }, endAt));
    };

    timeouts.push(setTimeout(startRound, 600));
    return () => { cancelled = true; timeouts.forEach(clearTimeout); };
  }, [avatars, names]);

  const firstVoteCounted = round?.voters?.some(v => v.counted) || false;
  useEffect(() => {
    if (!round) { setVoteProgress(0); return; }
    if (round.phase === 'typing' || round.phase === 'name') { setVoteProgress(0); return; }
    if (round.phase === 'crowned' || round.phase === 'ending') { setVoteProgress(1); return; }
    if (round.phase === 'voting' && firstVoteCounted) {
      let timer;
      const start = Date.now();
      const duration = 2700;
      const tick = () => {
        const elapsed = Date.now() - start;
        const linearP = Math.min(1, elapsed / duration);
        const easedP = 1 - Math.pow(1 - linearP, 2);
        setVoteProgress(easedP);
        if (linearP < 1) {
          timer = setTimeout(tick, 140 + Math.random() * 120);
        }
      };
      timer = setTimeout(tick, 30);
      return () => clearTimeout(timer);
    }
  }, [round?.phase, firstVoteCounted]);

  const totals = round?.finalTotals
    ? {
        left: Math.floor(round.finalTotals.left * voteProgress),
        right: Math.floor(round.finalTotals.right * voteProgress),
      }
    : { left: 0, right: 0 };

  return (
    <div className={className} aria-hidden="true">
      {avatars.map(av => {
        const isLeftSug = round?.leftSugId === av.id;
        const isRightSug = round?.rightSugId === av.id;
        const isSuggester = isLeftSug || isRightSug;
        const team = isLeftSug ? 'left' : isRightSug ? 'right' : null;
        const voter = round?.voters?.find(v => v.id === av.id);
        const isWinner = isSuggester && round?.winnerId === av.id;
        const showCrown = (round?.phase === 'crowned' || round?.phase === 'ending') && isWinner;
        const isLoser = (round?.phase === 'crowned' || round?.phase === 'ending') && isSuggester && !isWinner;
        const isActive = isSuggester || (voter && voter.voted);
        // bubbleSide is the CSS-class side ('left'/'right') the bubble
        // hangs off the avatar. 'inward' → opposite of avatar (bubble
        // points toward page center). 'outward' → same as avatar
        // (bubble points toward the page edge).
        const bubbleSide = bubbleDirection === 'outward'
          ? av.side
          : (av.side === 'left' ? 'right' : 'left');
        const teamTotal = team === 'left' ? totals.left : team === 'right' ? totals.right : 0;

        return (
          <div
            key={av.id}
            ref={el => { avatarRefs.current[av.id] = el; }}
            className={`hero-av hero-av-${av.id}${showCrown ? ' has-crown' : ''}${isActive ? ' is-active' : ''}${isLoser ? ' is-loser' : ''}`}
            style={{ top: av.top, [av.side]: av.x }}
          >
            <div className="hero-av-circle" style={{ background: av.photo ? '#fff' : av.bg }}>
              {av.photo ? <img src={av.photo} alt="" /> : <span>{av.initials}</span>}
            </div>

            {showCrown && (
              <div className="hero-crown">
                <span className="crown-icon">👑</span>
                <span className="crown-spark s1">✦</span>
                <span className="crown-spark s2">✦</span>
                <span className="crown-spark s3">✦</span>
              </div>
            )}

            {isSuggester && round?.phase === 'typing' && (
              <div className={`hero-bubble hero-bubble-${bubbleSide} is-typing`}>
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
            {isSuggester && round && round.phase !== 'typing' && (
              <div className={`hero-bubble hero-bubble-${bubbleSide}${isLoser ? ' is-loser' : ''}${showCrown ? ' is-winner' : ''}`}>
                {team === 'left' ? round.leftName : round.rightName}
                <span className="vote-chip">
                  <span className="num" key={`num-${teamTotal}`}>{teamTotal}</span> {teamTotal === 1 ? 'vote' : 'votes'}
                </span>
              </div>
            )}

            {voter && voter.voted && (
              <div
                className="vote-fly"
                style={{ '--dx': `${voter.dx || 0}px`, '--dy': `${voter.dy || 0}px` }}
                key={`vote-${round?.leftSugId}-${round?.rightSugId}-${av.id}`}
              >
                +{voter.vote}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
