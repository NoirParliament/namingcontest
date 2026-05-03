import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import personalDog from '../assets/personal-dog.png';
import teamPlayers from '../assets/team-players.png';
import businessWoman from '../assets/business-woman.png';
import sarahChen from '../assets/sarah-chen.png';
import marcusRodriguez from '../assets/marcus-rodriguez.png';
import lindaMorrison from '../assets/linda-morrison.png';
import heroProfile1 from '../assets/hero-profile-1.png';
import heroProfile2 from '../assets/hero-profile-2.png';
import heroProfile3 from '../assets/hero-profile-3.png';
import heroProfile4 from '../assets/hero-profile-4.png';
import heroProfile5 from '../assets/hero-profile-5.png';
import heroProfile6 from '../assets/hero-profile-6.png';
import namingContestLogo from '../assets/namingcontestlogo-cropped.svg';
import '../styles/landing-v3.css';

/* ========== ICONS ========== */
const Star = () => <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l2.2 4.5 5 .7-3.6 3.5.9 5L8 12.3l-4.5 2.4.9-5L.8 6.2l5-.7L8 1z"/></svg>;
const Check = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M3 8.5l3 3 7-7.5"/></svg>;

/* ========== NAV ========== */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="nav-row">
      <nav className={`nav-pill${scrolled ? ' is-scrolled' : ''}`} aria-label="Primary">
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="brand-mark">
          <img src={namingContestLogo} alt="NamingContest" className="brand-logo" />
        </a>
        <div className="links">
          <a href="#pricing">Pricing</a>
          <a href="#how">How it works</a>
          <a href="#testimonials">Testimonials</a>
        </div>
        <div className="nav-actions">
          <a href="#signin" onClick={(e) => e.preventDefault()} className="signin">Sign In</a>
          <a href="#start" onClick={(e) => e.preventDefault()} className="cta">Start a contest</a>
        </div>
      </nav>
    </div>
  );
}

/* ========== HERO ANIMATION ========== */
const HERO_NAMES = ['Atlas', 'Quill', 'Spire', 'Beacon', 'Helix', 'Vesper', 'Ember', 'Cobalt', 'Verge', 'Onyx'];

const HERO_AVATARS = [
  // Top-left
  { id: 0, photo: heroProfile1, side: 'left',  top: '18%', x: '3%' },
  // Top-right
  { id: 1, photo: heroProfile3, side: 'right', top: '18%', x: '3%' },
  // Mid-left edge
  { id: 2, photo: heroProfile6, side: 'left',  top: '46%', x: '-32px' },
  // Mid-right edge
  { id: 3, photo: heroProfile2, side: 'right', top: '46%', x: '-32px' },
  // Bottom-left
  { id: 4, photo: heroProfile4, side: 'left',  top: '74%', x: '10%' },
  // Bottom-right
  { id: 5, photo: heroProfile5, side: 'right', top: '74%', x: '10%' },
];

function HeroAnimation() {
  // round = { leftSugId, rightSugId, leftName, rightName, voters: [{id, target, vote, voted, dx, dy}], phase, winnerId, finalTotals: {left, right} }
  const [round, setRound] = useState(null);
  const [voteProgress, setVoteProgress] = useState(0);
  const avatarRefs = useRef({});

  useEffect(() => {
    let timeouts = [];
    let cancelled = false;
    let lastLeftId = -1, lastRightId = -1, lastLeftName = '', lastRightName = '';

    const startRound = () => {
      if (cancelled) return;

      const leftAvs = HERO_AVATARS.filter(a => a.side === 'left');
      const rightAvs = HERO_AVATARS.filter(a => a.side === 'right');

      // Pick a left + right suggester (not the same as last round)
      let leftSugId, rightSugId;
      do { leftSugId = leftAvs[Math.floor(Math.random() * leftAvs.length)].id; } while (leftSugId === lastLeftId);
      do { rightSugId = rightAvs[Math.floor(Math.random() * rightAvs.length)].id; } while (rightSugId === lastRightId);
      lastLeftId = leftSugId; lastRightId = rightSugId;

      // Pick two distinct names — neither can match either name from the previous round
      let leftName, rightName;
      do { leftName = HERO_NAMES[Math.floor(Math.random() * HERO_NAMES.length)]; } while (leftName === lastLeftName || leftName === lastRightName);
      do { rightName = HERO_NAMES[Math.floor(Math.random() * HERO_NAMES.length)]; } while (rightName === leftName || rightName === lastLeftName || rightName === lastRightName);
      lastLeftName = leftName; lastRightName = rightName;

      // Remaining 4 avatars vote — each casts 1 vote (Simple Poll), same side as voter
      const voterIds = HERO_AVATARS.filter(a => a.id !== leftSugId && a.id !== rightSugId).map(a => a.id);
      const voters = voterIds.map(id => {
        const av = HERO_AVATARS.find(a => a.id === id);
        return {
          id,
          target: av.side,
          vote: 1, // every voter casts exactly 1 vote (visual fly)
          voted: false,
          counted: false,
        };
      });

      // Pre-determine winner side + final totals (representing the larger imagined audience)
      const winnerSide = Math.random() < 0.5 ? 'left' : 'right';
      const winnerFinal = 30 + Math.floor(Math.random() * 20); // 30-49
      const loserFinal = 12 + Math.floor(Math.random() * 12); // 12-23
      const finalTotals = {
        left: winnerSide === 'left' ? winnerFinal : loserFinal,
        right: winnerSide === 'right' ? winnerFinal : loserFinal,
      };
      const winnerId = winnerSide === 'left' ? leftSugId : rightSugId;

      // Phase 1: typing dots on both suggesters
      setRound({ leftSugId, rightSugId, leftName, rightName, voters, phase: 'typing', winnerId, finalTotals });

      // Phase 2: name bubbles appear (after typing, with breathing room)
      timeouts.push(setTimeout(() => {
        if (cancelled) return;
        setRound(prev => prev ? { ...prev, phase: 'name' } : null);
      }, 700));

      // Phase 3: voters cast votes one-by-one — vote-fly leaves voter, lands on suggester
      const voteStart = 1500;
      const voteGap = 800;
      const voteFlightDuration = 950; // matches CSS animation peak (vote arrives ~85% through 1.12s)
      voters.forEach((v, idx) => {
        // Vote leaves the voter (vote-fly starts traveling)
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

        // Vote arrives at suggester → counter ticks up
        timeouts.push(setTimeout(() => {
          if (cancelled) return;
          setRound(prev => {
            if (!prev) return null;
            return {
              ...prev,
              voters: prev.voters.map(x => x.id === v.id ? { ...x, counted: true } : x),
            };
          });
        }, voteStart + idx * voteGap + voteFlightDuration));
      });

      // Phase 4: crown winner — wait for last vote + dramatic breath before crown
      const crownAt = voteStart + (voters.length - 1) * voteGap + voteFlightDuration + 1000;
      timeouts.push(setTimeout(() => {
        if (cancelled) return;
        setRound(prev => prev ? { ...prev, phase: 'crowned' } : null);
      }, crownAt));

      // Phase 5: ending — loser fades while winner stays
      const fadeAt = crownAt + 2500;
      timeouts.push(setTimeout(() => {
        if (cancelled) return;
        setRound(prev => prev ? { ...prev, phase: 'ending' } : null);
      }, fadeAt));

      // Phase 6: clear + start next round
      const endAt = fadeAt + 1300;
      timeouts.push(setTimeout(() => {
        if (cancelled) return;
        setRound(null);
        timeouts.push(setTimeout(startRound, 400));
      }, endAt));
    };

    timeouts.push(setTimeout(startRound, 600));
    return () => { cancelled = true; timeouts.forEach(clearTimeout); };
  }, []);

  // Animate vote chip — starts immediately when first vote arrives, organic step pacing
  const firstVoteCounted = round?.voters?.some(v => v.counted) || false;
  useEffect(() => {
    if (!round) { setVoteProgress(0); return; }
    if (round.phase === 'typing' || round.phase === 'name') { setVoteProgress(0); return; }
    if (round.phase === 'crowned' || round.phase === 'ending') { setVoteProgress(1); return; }
    if (round.phase === 'voting' && firstVoteCounted) {
      let timer;
      const start = Date.now();
      const duration = 2700; // fits within voting phase, completes before crown
      const tick = () => {
        const elapsed = Date.now() - start;
        const linearP = Math.min(1, elapsed / duration);
        // Ease-out quad: moderate start, slows at end (no slow-start drag)
        const easedP = 1 - Math.pow(1 - linearP, 2);
        setVoteProgress(easedP);
        if (linearP < 1) {
          // Variable delay 140-260ms for organic batch feel
          timer = setTimeout(tick, 140 + Math.random() * 120);
        }
      };
      // Quick first tick so motion starts immediately
      timer = setTimeout(tick, 30);
      return () => clearTimeout(timer);
    }
  }, [round?.phase, firstVoteCounted]);

  // Running vote totals — interpolate toward predetermined final totals
  const totals = round?.finalTotals
    ? {
        left: Math.floor(round.finalTotals.left * voteProgress),
        right: Math.floor(round.finalTotals.right * voteProgress),
      }
    : { left: 0, right: 0 };

  return (
    <div className="hero-anim" aria-hidden="true">
      {HERO_AVATARS.map(av => {
        const isLeftSug = round?.leftSugId === av.id;
        const isRightSug = round?.rightSugId === av.id;
        const isSuggester = isLeftSug || isRightSug;
        const team = isLeftSug ? 'left' : isRightSug ? 'right' : null;
        const voter = round?.voters?.find(v => v.id === av.id);
        const isWinner = isSuggester && round?.winnerId === av.id;
        // Crown shows from 'crowned' phase onward
        const showCrown = (round?.phase === 'crowned' || round?.phase === 'ending') && isWinner;
        // Loser fades at the same time the crown appears
        const isLoser = (round?.phase === 'crowned' || round?.phase === 'ending') && isSuggester && !isWinner;
        const isActive = isSuggester || (voter && voter.voted);
        const bubbleSide = av.side === 'left' ? 'right' : 'left';
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

            {/* Suggester typing or name bubble */}
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
                <span className="vote-chip"><span className="num" key={`num-${teamTotal}`}>{teamTotal}</span> {teamTotal === 1 ? 'vote' : 'votes'}</span>
              </div>
            )}

            {/* Voter +N flies toward the suggester they voted for */}
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

/* ========== HERO DECORATIONS ========== */
function HeroDecor() {
  return (
    <div className="hero-decor" aria-hidden="true">
      <span className="decor d1"></span>
      <span className="decor d2"></span>
      <span className="decor d3"></span>
      <span className="decor d4"></span>
      <span className="decor d5"></span>
      <span className="decor d6"></span>
      <span className="decor d7"></span>
      <span className="decor d8"></span>
    </div>
  );
}

/* ========== HERO ========== */
function Hero({ onStart }) {
  return (
    <header className="hero">
      <HeroDecor />
      <HeroAnimation />
      <div className="hero-inner">
        <h1 className="h-display">
          Run a naming contest for <span className="em">anything</span>
        </h1>
        <p className="sub">
          Whether you're naming a baby, a band, or a business, now it's so easy to land on the name everyone backs.
        </p>
        <div className="cta-row">
          <a href="#start" onClick={(e) => { e.preventDefault(); onStart(); }} className="btn btn-primary btn-lg">
            Start a contest <span className="arrow">→</span>
          </a>
          <a href="#how" className="btn btn-secondary btn-lg">
            See how it works
          </a>
        </div>
      </div>
    </header>
  );
}

/* ========== OFFERINGS ========== */
function Offerings({ onStart }) {
  const tiers = [
    {
      tier: 'personal',
      title: 'Personal',
      tagline: 'Babies, pets, holiday homes, the family Wi-Fi.',
      cap: 'Up to 15 participants',
      price: '$9',
      cta: 'Start a personal contest',
      img: personalDog,
      pillA: { text: 'Olly', meta: '8 votes', color: '#b25620', icon: <path d="M8 14s-5-3.2-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 3.8-5 7-5 7z" /> },
      pillB: { text: 'Closes Sunday', color: '#b25620', icon: <><circle cx="8" cy="8" r="6" /><path d="M8 4v4l2.5 1.5" /></> },
    },
    {
      tier: 'team',
      title: 'Group',
      tagline: 'Bands, podcasts, sports teams, gaming clans, civic groups.',
      cap: 'Up to 60 participants',
      price: '$29',
      cta: 'Start a group contest',
      img: teamPlayers,
      pillA: { text: '23 names in', color: '#4b68c3', icon: <><path d="M3 4h10M3 8h10M3 12h6" /></> },
      pillB: { text: 'Riverside FC', meta: '49 voted', color: '#4b68c3', icon: <><path d="M3 12V5l5-2 5 2v7" /><path d="M3 12h10" /></> },
    },
    {
      tier: 'business',
      title: 'Business',
      tagline: 'Company names, product launches, rebrands, internal projects.',
      cap: 'Up to 240 participants',
      price: '$89',
      cta: 'Start a business contest',
      img: businessWoman,
      pillA: { text: 'Quality', meta: '92/100', color: '#3f8850', icon: <><circle cx="8" cy="8" r="6" /><path d="M5 8l2 2 4-4" /></> },
      pillB: { text: 'Winner', meta: 'EvoPay', color: '#3f8850', icon: <><path d="M5 3h6v3a3 3 0 0 1-6 0V3z" /><path d="M3 4v1a2 2 0 0 0 2 2M13 4v1a2 2 0 0 1-2 2" /><path d="M8 9v3M5 12h6" /></> },
    },
  ];

  return (
    <section className="section" id="pricing">
      <div className="section-head">
        <p className="eyebrow">Pick your path</p>
        <h2 className="h-display h2">Your name starts here</h2>
        <p className="lede">Family group chat or Fortune 500 product launch—your contest is shaped to your group, your stakes, and what you're naming.</p>
      </div>
      <div className="offerings">
        {tiers.map(t => (
          <article key={t.tier} className="offering" data-tier={t.tier}>
            <div className="offer-body">
              <h3>{t.title}</h3>
              <p className="tagline">{t.tagline}</p>
              <div className="meta-row">
                <span className="cap">{t.cap}</span>
                <span className="price">{t.price}<small>/contest</small></span>
              </div>
              <a href={`#start-${t.tier}`} onClick={(e) => { e.preventDefault(); onStart(t.tier); }} className="start">
                {t.cta} <span className="arrow">→</span>
              </a>
            </div>
            <div className="scene" aria-hidden="true">
              <div className="photo has-img" style={{ backgroundImage: `url(${t.img})` }}></div>
              <div className="float-pill pill-a">
                {t.pillA.dot ? <span className="dot"></span> : (
                  <span className="ic"><svg viewBox="0 0 16 16" fill="none" stroke={t.pillA.color} strokeWidth="1.6" strokeLinecap="round">{t.pillA.icon}</svg></span>
                )}
                {t.pillA.text} {t.pillA.meta && <span className="v">{t.pillA.meta}</span>}
              </div>
              <div className="float-pill pill-b">
                {t.pillB.dot ? <span className="dot"></span> : (
                  <span className="ic"><svg viewBox="0 0 16 16" fill="none" stroke={t.pillB.color} strokeWidth="1.6" strokeLinecap="round">{t.pillB.icon}</svg></span>
                )}
                {t.pillB.text} {t.pillB.meta && <span className="v">{t.pillB.meta}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ========== HOW IT WORKS (4 cards with artifacts) ========== */
function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="section-head">
        <p className="eyebrow">The four steps</p>
        <h2 className="h-display h2">From brief to winner</h2>
        <p className="lede">Swap Google Forms, Excel, and endless email threads for a platform actually meant for naming.</p>
      </div>

      <div className="why">
        {/* 01 BRIEF */}
        <div className="why-item" data-tone="butter">
          <div className="why-text">
            <div className="step-mark"><span className="step-num">01</span><span className="step-label">Brief</span></div>
            <h3>Build a brief</h3>
            <p>Pick a type, answer a few questions, the brief writes itself.</p>
          </div>
          <div className="why-art">
            <div className="artifact art-brief">
              <div className="a-head">New Contest · Brief</div>
              <div className="row"><span className="lbl">Brand</span><span className="val">Specialty coffee</span></div>
              <div className="row"><span className="lbl">Audience</span><span className="chip-row"><span className="mini-chip">Home brewers</span></span></div>
              <div className="row"><span className="lbl">Tone</span><span className="chip-row"><span className="mini-chip">Honest</span><span className="mini-chip">Warm</span></span></div>
              <div className="row"><span className="lbl">Avoid</span><span className="input-line"></span></div>
            </div>
          </div>
        </div>

        {/* 02 INVITE */}
        <div className="why-item" data-tone="periwinkle">
          <div className="why-text">
            <div className="step-mark"><span className="step-num">02</span><span className="step-label">Invite</span></div>
            <h3>Invite your people</h3>
            <p>Share a link, and they're in. No signup, no download.</p>
          </div>
          <div className="why-art">
            <div className="artifact art-invite">
              <div className="url-row">
                <span>namingcontest.com/c/8f3a</span>
                <span className="copy" aria-hidden="true">⧉</span>
              </div>
              <div className="avatars">
                <span className="av">A</span>
                <span className="av">M</span>
                <span className="av">K</span>
                <span className="av">L</span>
                <span className="av-more">+12 joined</span>
              </div>
            </div>
          </div>
        </div>

        {/* 03 SUBMIT & VOTE */}
        <div className="why-item" data-tone="mint">
          <div className="why-text">
            <div className="step-mark"><span className="step-num">03</span><span className="step-label">Vote</span></div>
            <h3>Submit and vote</h3>
            <p>Names roll in, votes get counted, a winner rises to the top.</p>
          </div>
          <div className="why-art">
            <div className="artifact art-vote">
              <div className="a-head">Live · Ranked vote</div>
              <div className="v-block" data-leader="true">
                <div className="v-row"><span className="name">Daily Bean</span><span className="meta">19 votes</span></div>
                <div className="bar-wrap"><div className="bar-track"><div className="bar-fill" style={{ width: '76%' }}></div></div></div>
              </div>
              <div className="v-block">
                <div className="v-row"><span className="name">Kenna Coffee</span><span className="meta">14 votes</span></div>
                <div className="bar-wrap"><div className="bar-track"><div className="bar-fill" style={{ width: '56%', background: 'var(--fg)', opacity: .35 }}></div></div></div>
              </div>
              <div className="v-block">
                <div className="v-row"><span className="name">Lixira</span><span className="meta">9 votes</span></div>
                <div className="bar-wrap"><div className="bar-track"><div className="bar-fill" style={{ width: '36%', background: 'var(--fg)', opacity: .25 }}></div></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* 04 RESULT */}
        <div className="why-item" data-tone="blush">
          <div className="why-text">
            <div className="step-mark"><span className="step-num">04</span><span className="step-label">Reveal</span></div>
            <h3>See the winner</h3>
            <p>A clear result with the vote breakdown and a naming certificate to keep.</p>
          </div>
          <div className="why-art">
            <div className="artifact art-winner">
              <span className="winner-tag"><span className="dot"></span>Winner</span>
              <div className="wname">Daily Bean</div>
              <div className="sub">47% of votes · 19 of 42</div>
              <div className="bars" aria-hidden="true">
                <span></span><span></span><span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== SHARED ACCOUNTABILITY ========== */
function SharedAccountability({ onStart }) {
  const creatorTasks = [
    { icon: <><rect x="6" y="3" width="12" height="18" rx="2" /><path d="M9 3v2h6V3" /><path d="M9 10h6M9 14h6M9 18h3" /></>, t: 'Fill out the brief', pts: '+15' },
    { icon: <><path d="M3 5a2 2 0 012-2h6v17H5a2 2 0 01-2-2V5z" /><path d="M21 5a2 2 0 00-2-2h-6v17h6a2 2 0 002-2V5z" /><path d="M11 3v17M13 3v17" /></>, t: 'Pick a voting method', pts: '+10' },
    { icon: <><circle cx="12" cy="13" r="7" /><path d="M12 9v4l2.5 2" /><path d="M9 2h6M12 6V4" /></>, t: 'Set rules and deadline', pts: '+13' },
  ];
  const participantTasks = [
    { icon: <><path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4V4z" /><path d="M20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7V4z" /></>, t: 'Learn the naming basics', pts: '+10' },
    { icon: <><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 00-4 10.5c.7.7 1 1.6 1 2.5v.5h6V16c0-.9.3-1.8 1-2.5A6 6 0 0012 3z" /></>, t: 'Send their best names', pts: '+15' },
    { icon: <><path d="M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5.5A8 8 0 1121 12z" /><path d="M9 11h.01M12 11h.01M15 11h.01" /></>, t: 'Share their votes', pts: '+15' },
  ];

  return (
    <section className="section">
      <div className="section-head">
        <p className="eyebrow">Powered by teamwork</p>
        <h2 className="h-display h2">One contest, two sides</h2>
        <p className="lede">Creator brings the brief, participants bring the names. Each earns half of a 100-point Quality Score.</p>
      </div>
      <div className="shared-panel">
        <div className="shared">
          <div className="score-row">
            <span className="label-l"><b>Creator</b> · 38/50</span>
            <span className="score-chip"><span className="dot"></span>Strong · 78/100</span>
            <span className="label-r"><b>Participants</b> · 40/50</span>
          </div>
          <div className="score-bar-slim" aria-hidden="true">
            <div className="fill-creator"></div>
            <div className="fill-participant"></div>
            <div className="mid"></div>
          </div>

          <div className="task-grid">
            <div className="task-col" data-side="creator">
              <div className="col-head">
                <span className="col-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg></span>
                <div>
                  <div className="col-title">Creator</div>
                  <div className="col-meta">You, the organizer</div>
                </div>
              </div>
              {creatorTasks.map((task, i) => (
                <div key={i} className="task-card">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{task.icon}</svg>
                  </span>
                  <span className="t">{task.t}</span>
                  <span className="pts">{task.pts}</span>
                </div>
              ))}
            </div>
            <div className="gutter" aria-hidden="true"></div>
            <div className="task-col" data-side="participant">
              <div className="col-head">
                <span className="col-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg></span>
                <div>
                  <div className="col-title">Participants</div>
                  <div className="col-meta">Anyone you invite</div>
                </div>
              </div>
              {participantTasks.map((task, i) => (
                <div key={i} className="task-card">
                  <span className="icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{task.icon}</svg>
                  </span>
                  <span className="t">{task.t}</span>
                  <span className="pts">{task.pts}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="shared-cta">
            <a href="#start" onClick={(e) => { e.preventDefault(); onStart(); }} className="btn btn-primary btn-lg">Start a contest <span className="arrow">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== TESTIMONIALS ========== */
function Testimonials() {
  const list = [
    { cat: 'personal', quote: 'We were stuck on a name for our rescue puppy. The family voted online, and Olly came out on top.', winner: 'Olly', name: 'James & Linda Morrison', initials: 'JM', label: 'Personal', photo: lindaMorrison },
    { cat: 'team', quote: 'We started a Sunday-league football team and needed a name. The squad voted, and Riverside FC won out.', winner: 'Riverside FC', name: 'Marcus Rodriguez', initials: 'MR', label: 'Group', photo: marcusRodriguez },
    { cat: 'business', quote: 'Our co-founders couldn’t agree on a name for our payment app. We opened it to 50 beta users, and EvoPay won.', winner: 'EvoPay', name: 'Sarah Chen', initials: 'SC', label: 'Business', photo: sarahChen },
  ];
  return (
    <section className="section" id="testimonials">
      <div className="section-head">
        <p className="eyebrow">Winners' stories</p>
        <h2 className="h-display h2">Names that clicked</h2>
      </div>
      <div className="testimonials">
        {list.map((t, i) => (
          <article key={i} className="tmonial" data-cat={t.cat}>
            <div className="who-row">
              <span className="avatar">
                {t.photo
                  ? <img src={t.photo} alt={t.name} />
                  : t.initials}
              </span>
              <div className="who-info">
                <div className="tname">{t.name}</div>
                <span className={`cat-tag ${t.cat}`}><span className="dot"></span>{t.label}</span>
              </div>
            </div>
            <div className="stars" aria-label="5 out of 5">
              {[0, 1, 2, 3, 4].map(s => <Star key={s} />)}
            </div>
            <p className="quote-body">{t.quote}</p>
            <div className="winner-row">
              <span className="wlabel">Winner</span>
              <span className="name-win">{t.winner}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ========== FAQ ========== */
function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  const items = [
    {
      q: "Who's behind this?",
      a: <p className="faq-a"><strong>We're Catchword Branding</strong>—a naming agency that's been at it for 25+ years and worked with brands like The North Face, Volkswagen, and Asana. This platform turns what we've learned into a naming contest anyone can run.</p>
    },
    {
      q: 'How long does a contest take?',
      a: <p className="faq-a"><strong>You set the deadline,</strong> but most contests wrap up in under a week.</p>
    },
    {
      q: 'Do my voters need an account?',
      a: <p className="faq-a"><strong>No.</strong> They click your link and they're in. Only the organizer (you) needs an account.</p>
    },
    {
      q: 'How does the voting work?',
      a: <p className="faq-a"><strong>Five methods:</strong> Simple Poll, Ranked Choice, Multi-Criteria, Pairwise, and Weighted. The right one depends on your group size and how much depth you want.</p>
    },
    {
      q: 'What does it cost?',
      a: <p className="faq-a"><strong>Three tiers, paid per contest.</strong> Personal is $9 (up to 15 voters). Group is $29 (up to 60). Business is $89 (up to 240). All include every voting method and the full naming methodology.</p>
    },
  ];
  return (
    <section className="section" id="faq">
      <div className="section-head">
        <p className="eyebrow">From the inbox</p>
        <h2 className="h-display h2">Questions, answered</h2>
      </div>
      <div className="faq">
        {items.map((it, i) => (
          <div key={i} className={`faq-item${openIdx === i ? ' is-open' : ''}`}>
            <button
              type="button"
              className="faq-q"
              onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
              aria-expanded={openIdx === i}
            >
              {it.q}
              <span className="toggle" aria-hidden="true">+</span>
            </button>
            <div className="faq-answer-wrapper">
              <div className="faq-answer-inner">{it.a}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ========== CLOSING CTA ========== */
function ClosingCTA({ onStart }) {
  return (
    <section className="section">
      <div className="closing">
        <div className="clouds" aria-hidden="true">
          <div className="cloud x1"></div>
          <div className="cloud x2"></div>
          <div className="cloud x3"></div>
          <div className="cloud x4"></div>
          <div className="cloud x5"></div>
        </div>
        <span className="cdec cd1" aria-hidden="true"></span>
        <span className="cdec cd2" aria-hidden="true"></span>
        <span className="cdec cd3" aria-hidden="true"></span>
        <span className="cdec cd4" aria-hidden="true"></span>
        <span className="cdec cd5" aria-hidden="true"></span>
        <span className="cdec cd6" aria-hidden="true"></span>
        <span className="cdec cd7" aria-hidden="true"></span>
        <span className="cdec cd8" aria-hidden="true"></span>
        <h2 className="h-display">Your name is one contest away</h2>
        <div className="closing-cta">
          <a href="#start" onClick={(e) => { e.preventDefault(); onStart(); }} className="btn btn-primary btn-lg">
            Start a contest <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ========== FOOTER ========== */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="brand-block">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="brand-mark">
            <img src={namingContestLogo} alt="NamingContest" className="brand-logo brand-logo-footer" />
          </a>
          <p>Powered by Catchword, the #1 ranked naming agency worldwide.</p>
          <div className="socials" aria-label="Social links">
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Twitter / X">
              <svg viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 7.2L14.7 1h-1.3L9 6.4 5.4 1H1l5.4 8.1L1 15h1.3l4.7-5.7L10.6 15H15L9.5 7.2zm-1.7 2L7.2 8.4 2.7 2h2l3.6 5.2.6.9 4.5 6.5h-2L7.8 9.2z"/></svg>
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="LinkedIn">
              <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.6 2.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM2.2 6.5h2.8V14H2.2zM6.8 6.5h2.7V8c.4-.7 1.3-1.6 2.8-1.6 3 0 3.5 2 3.5 4.5V14h-2.8v-2.6c0-.6 0-1.4-.9-1.4s-1 .7-1 1.4V14H6.8z"/></svg>
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="12" height="12" rx="3.5"/><circle cx="8" cy="8" r="3"/><circle cx="11.6" cy="4.4" r=".8" fill="currentColor" stroke="none"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h6>Product</h6>
          <ul>
            <li><a href="#how">How it works</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h6>Resources</h6>
          <ul>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Catchword Branding</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Help center</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Contact us</a></li>
          </ul>
        </div>
        <div>
          <h6>Legal</h6>
          <ul>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Privacy policy</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Terms of service</a></li>
            <li><a href="#" onClick={(e) => e.preventDefault()}>Cookie policy</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 NamingContest.com</span>
      </div>
    </footer>
  );
}

/* ========== PAGE ========== */
export default function LandingPage() {
  const navigate = useNavigate();
  // Preview mode: "Start a contest" CTAs retain hover/click animations but don't navigate
  const handleStart = () => { /* no-op for preview */ };
  // (Restore the original behavior by uncommenting the version below)
  // const handleStart = (tier) => { tier ? navigate(`/brief?group=${tier}`) : navigate('/brief'); };
  void navigate; // keep import alive

  return (
    <div className="lp-v3">
      <div className="frame">
        <div className="wrap">
          <Nav />
          <Hero onStart={handleStart} />
          <Offerings onStart={handleStart} />
          <HowItWorks />
          <SharedAccountability onStart={handleStart} />
          <Testimonials />
          <FAQ />
          <ClosingCTA onStart={handleStart} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
