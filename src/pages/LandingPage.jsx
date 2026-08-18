import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { MusicNote, PawPrint, Buildings } from '@phosphor-icons/react';
import personalDog from '../assets/personal-dog.png';
import heroOfficeScene from '../assets/planning.png';
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
import creatorProfile from '../assets/creator-profile.png';
import namingContestLogo from '../assets/namingcontestlogo-cropped.svg';
import namingContestLogoWhite from '../assets/namingcontestlogo-white.svg';
import '../styles/landing-v3.css';
import '../styles/v4.css';
import { readSetup, getQuestionsFor } from '../utils/v4Brief';
import { getSegmentTone } from '../data/v4/segmentTheme';
import AvatarMenu from '../components/v4/AvatarMenu';
import UserAvatar from '../components/v4/UserAvatar';
import SignInModal from '../components/v4/SignInModal';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabaseClient';

/* ========== ICONS ========== */
const Star = () => <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l2.2 4.5 5 .7-3.6 3.5.9 5L8 12.3l-4.5 2.4.9-5L.8 6.2l5-.7L8 1z"/></svg>;
const Check = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M3 8.5l3 3 7-7.5"/></svg>;

/* ========== NAV ========== */
export function Nav() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [signinOpen, setSigninOpen] = useState(false);
  // ?signin=creator|participant (from the platform map) auto-opens the
  // sign-in modal in that mode so those flow steps land directly on it.
  // Mobile burger menu — opens a sheet with all nav links + actions.
  // The desktop pill stays exactly as-is at ≥ 700px; the burger is
  // only visible (via CSS in mobile.css) on small screens.
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    // Lock body scroll while the sheet is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);
  const closeMenu = () => setMenuOpen(false);

  // Phone-only sign out. The avatar's dropdown normally owns this, but it's
  // hidden at this width — without this there'd be no way to sign out on a
  // phone at all. Mirrors AvatarMenu's handler: end the real session, then
  // clear the local blob so no stale identity lingers behind it.
  const handleMobileSignOut = async () => {
    closeMenu();
    // Awaited for the same reason as AvatarMenu's: navigating while the
    // session is still live gets you redirected back into the workspace.
    try {
      const { error } = await supabase.auth.signOut();
      if (error) await supabase.auth.signOut({ scope: 'local' });
    } catch {
      try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* nothing left to try */ }
    }
    try { localStorage.removeItem('v4_contest_setup'); } catch { /* ignore */ }
    navigate('/');
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // ?signin=… just opens the sign-in modal. There's no creator/participant
    // distinction any more — one magic link covers both.
    if (params.get('signin')) setSigninOpen(true);
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Logo + section links are context-aware: on the landing page they
  // smooth-scroll to the target section; from any other page (e.g. the
  // legal pages) they first route home, then scroll once it mounts.
  const onLanding = () =>
    typeof window !== 'undefined' && window.location.pathname === '/';
  const goHome = (e) => {
    e.preventDefault();
    if (onLanding()) {
      // Already on the landing page — just smooth-scroll to top.
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Coming FROM another page (legal, contact, etc.) → fade the
    // body out before navigating, same treatment ExitLink and
    // BrandLink use elsewhere in the product. Without this, clicking
    // the logo jump-cuts to the homepage.
    document.body.classList.add('is-exiting');
    window.setTimeout(() => {
      document.body.style.transition = 'none';
      document.body.classList.remove('is-exiting');
      navigate('/');
      window.requestAnimationFrame(() => {
        document.body.style.transition = '';
      });
    }, 180);
  };
  const goToSection = (id) => (e) => {
    e.preventDefault();
    if (onLanding()) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
        140
      );
    }
  };

  // A real Supabase session is the source of truth for "signed in"; the
  // legacy localStorage setup still counts too during the mock→real
  // transition (a returning demo user with an in-progress contest).
  const { user } = useAuth();
  const setup = readSetup();
  const isAuthed = !!user || !!(setup.userEmail || setup.contestId);
  const authEmail = user?.email || setup.userEmail;
  const authName = user?.user_metadata?.display_name || setup.userName || user?.email?.split('@')[0];

  // A real user's latest contest, loaded from the DB, so the account menu can
  // show it (and jump into it) from the homepage.
  const [latestContest, setLatestContest] = useState(null);
  useEffect(() => {
    if (!user?.id) { setLatestContest(null); return; }
    let active = true;
    supabase
      .from('contests')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setLatestContest(data || null);
        if (data?.sub_segment_id) {
          try { localStorage.setItem('v4_last_sub', data.sub_segment_id); } catch { /* ignore */ }
        }
      });
    return () => { active = false; };
  }, [user?.id]);
  const segmentTone = getSegmentTone(setup.subSegmentId || 'b1');
  // Real users → their latest DB contest (with its real phase). The demo
  // (localStorage) path only applies when signed out.
  const activeContest = latestContest
    ? {
        id: latestContest.id,
        name: latestContest.working_name || 'Your contest',
        phase: latestContest.status === 'submission' ? 'Submissions'
          : latestContest.status === 'voting' ? 'Voting'
          : latestContest.status === 'closed' ? 'Winner' : 'Live',
        tone: getSegmentTone(latestContest.sub_segment_id || 'b1'),
        to: `/v4/contest/${latestContest.id}`,
        contest: latestContest, // passed via nav state → Manage opens instantly
      }
    : (!user && setup.contestId)
    ? {
        id: setup.contestId,
        name: setup.workingName || 'Your contest',
        phase: 'Voting',
        daysLeft: setup.settings?.votingDays || 3,
        tone: segmentTone,
      }
    : null;

  return (
    <>
      <div className="nav-row">
        <nav className={`nav-pill${scrolled ? ' is-scrolled' : ''}`} aria-label="Primary">
          <a href="/" onClick={goHome} className="brand-mark">
            <img src={namingContestLogo} alt="NamingContest" className="brand-logo" />
          </a>
          <div className="links">
            <a href="/#how" onClick={goToSection('how')}>How it works</a>
            <a href="/#testimonials" onClick={goToSection('testimonials')}>Testimonials</a>
            <a href="/#pricing" onClick={goToSection('pricing')}>Pricing</a>
          </div>
          {/* Desktop only — the mobile rules hide this whole container, and
              the sheet carries the account on phone instead. */}
          <div className="nav-actions">
            {isAuthed ? (
              <AvatarMenu
                email={authEmail}
                name={authName}
                photo={setup.userPhoto || null}
                seed={user?.id}
                tone={segmentTone}
                activeContest={activeContest}
              />
            ) : (
              <>
                <a
                  href="#signin"
                  onClick={(e) => { e.preventDefault(); setSigninOpen(true); }}
                  className="signin"
                >
                  Sign In
                </a>
                <a
                  href="/v4/pick"
                  onClick={(e) => { e.preventDefault(); navigate('/v4/pick'); }}
                  className="cta"
                >
                  Start a contest
                </a>
              </>
            )}
          </div>

          {/* Burger trigger — only visible on phone (CSS in mobile.css).
              Replaces .links + .nav-actions which are CSS-hidden on
              phone, so the nav-pill on phone is just: logo (left) +
              burger (right). Three lines so it reads as "menu" at a
              glance; click opens the mobile sheet below. */}
          {/* Rendered for signed-in users too: the marketing links live only
              here on phone, so gating the burger on !isAuthed left signed-in
              visitors with no way to reach How it works / Pricing at all. */}
          {(
            <button
              type="button"
              className="nav-burger"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          )}
        </nav>
      </div>

      {/* Mobile menu sheet — slides down from the top of the screen
          when the burger is tapped. Carries the same scatter +
          halo vocabulary as the sign-in / edit / launch modals so it
          reads as part of the same family rather than a generic
          dropdown. */}
      {menuOpen && (
        <div
          className="nav-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div
            className="nav-mobile-menu-backdrop"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div className="nav-mobile-menu-sheet">
            {/* Scattered shape decoration — 4 dots tucked into the
                corners, matching the modal family vocabulary. */}
            <span className="nav-mobile-menu-shape nav-mobile-menu-shape-1" aria-hidden="true" />
            <span className="nav-mobile-menu-shape nav-mobile-menu-shape-2" aria-hidden="true" />
            <span className="nav-mobile-menu-shape nav-mobile-menu-shape-3" aria-hidden="true" />
            <span className="nav-mobile-menu-shape nav-mobile-menu-shape-4" aria-hidden="true" />

            {/* Signed in: the account leads, because someone who already has
                one is far more likely to be heading back to their contests
                than to the marketing sections. Tapping it goes to the
                namespace — same destination the avatar's dropdown had on
                desktop, just given room to breathe. */}
            {isAuthed && (
              <div className="nav-mobile-menu-account-block">
                <button
                  type="button"
                  className="nav-mobile-menu-account"
                  onClick={() => { closeMenu(); navigate('/v4/settings'); }}
                >
                  <span className="nav-mobile-menu-account-avatar" aria-hidden="true">
                    {setup.userPhoto ? (
                      <img src={setup.userPhoto} alt="" />
                    ) : user?.id ? (
                      <UserAvatar seed={user.id} size={38} />
                    ) : (
                      <img src={heroProfile1} alt="" />
                    )}
                  </span>
                  <span className="nav-mobile-menu-account-text">
                    <span className="nav-mobile-menu-account-name">{authName}</span>
                    <span className="nav-mobile-menu-account-email">{authEmail}</span>
                  </span>
                  <span className="nav-mobile-menu-account-arrow" aria-hidden="true">→</span>
                </button>
                {/* Quiet by design — it sits next to the account it acts on,
                    but signing out is rarely why anyone opened this menu. */}
                <button
                  type="button"
                  className="nav-mobile-menu-signout"
                  onClick={handleMobileSignOut}
                >
                  Sign out
                </button>
              </div>
            )}

            <div className="nav-mobile-menu-eyebrow">Explore</div>
            <a
              href="/#how"
              onClick={(e) => { closeMenu(); goToSection('how')(e); }}
              className="nav-mobile-menu-link"
            >
              How it works
            </a>
            <a
              href="/#testimonials"
              onClick={(e) => { closeMenu(); goToSection('testimonials')(e); }}
              className="nav-mobile-menu-link"
            >
              Testimonials
            </a>
            <a
              href="/#pricing"
              onClick={(e) => { closeMenu(); goToSection('pricing')(e); }}
              className="nav-mobile-menu-link"
            >
              Pricing
            </a>
            {/* Signed in, the avatar next to the burger already covers the
                account — so this section only needs the way back into the
                workspace. Offering "Sign In" to someone already signed in was
                the reason this sheet was hidden from them in the first place;
                the fix is to word it for them, not to lock them out. */}
            <div className="nav-mobile-menu-actions">
              <div className="nav-mobile-menu-eyebrow nav-mobile-menu-eyebrow-actions">
                {isAuthed ? 'Your account' : 'Get started'}
              </div>
              {isAuthed ? (
                <button
                  type="button"
                  className="nav-mobile-menu-signin"
                  onClick={() => { closeMenu(); navigate('/v4/settings'); }}
                >
                  Go to your namespace
                </button>
              ) : (
                <button
                  type="button"
                  className="nav-mobile-menu-signin"
                  onClick={() => { closeMenu(); setSigninOpen(true); }}
                >
                  Sign In
                </button>
              )}
              <button
                type="button"
                className="nav-mobile-menu-cta"
                onClick={() => { closeMenu(); navigate('/v4/pick'); }}
              >
                Start a contest →
              </button>
            </div>
          </div>
        </div>
      )}

      <SignInModal open={signinOpen} onClose={() => setSigninOpen(false)} />
    </>
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
    <header className="hero hero-split">
      <HeroDecor />
      <div className="hero-bg-clip" aria-hidden="true">
        <span className="hero-aurora hero-aurora-1" />
        <span className="hero-aurora hero-aurora-2" />
        <span className="hero-aurora hero-aurora-3" />
        <span className="hero-aurora hero-aurora-4" />
      </div>
      <div className="hero-inner hero-inner-split">
        <div className="hero-copy">
          <h1 className="h-display">
            Run a <span className="em">naming</span> contest without the chaos
          </h1>
          <p className="sub">
            Skip the group chats and Google Sheets. Create a naming contest in minutes: invite participants, collect suggestions, vote on favorites, and crown a winner—all in one place.
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
        <div className="hero-visual">
          <HeroVoteRace />
        </div>
      </div>
    </header>
  );
}

// The real b1 (company) brief questions, pulled from the same source of
// truth as the live chat so the demo can't drift. The full set is 10
// questions now — the reel walks just the first few so it stays short.
const SIM_BRIEF = getQuestionsFor('b1', null).slice(0, 4);
const SIM_ANSWERS = {
  namingTarget: 'A brand-new company.',
  projectSummary: 'AI project management for distributed engineering teams.',
  nameCommunicate: 'Clarity, momentum, calm under pressure.',
  brandPersonality: 'Professional, bold, approachable.',
};
// The whole walk-through: three synthetic openers (kind of naming, working
// name, voter package) then the real brief questions. Every answer is just a
// typed reply — the prompts are the real thing.
const SIM_STEPS = [
  { prompt: 'Let’s set up your business contest. First, what are we naming?', answer: 'A company' },
  { prompt: 'Got it. What should we call this contest for a company?', answer: 'Fintech startup' },
  { prompt: 'How many people will take part in the contest?', answer: 'Up to 30 participants · $19' },
  ...SIM_BRIEF.map((q) => ({ prompt: q.prompt, answer: SIM_ANSWERS[q.id] || '' })),
];

// The hero's demo: a simple bot↔you chat that walks the real setup questions,
// then rests on a clickable "start a contest" nudge. One cancellable async
// timeline so it can't double-run under StrictMode / HMR.
function HeroBriefSim({ onStart }) {
  const [items, setItems] = useState([]);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const timers = [];
    const wait = (ms) => new Promise((res) => { timers.push(setTimeout(res, ms)); });
    const push = (item) => { if (!cancelled) setItems((prev) => [...prev, item]); };
    const bot = async (text, typeMs = 800) => {
      setTyping(true);
      await wait(typeMs);
      if (cancelled) return;
      setTyping(false);
      push({ t: 'bot', text });
      await wait(950);
    };

    (async () => {
      await wait(500);
      for (const s of SIM_STEPS) {
        await bot(s.prompt);           // 0.8s "thinking" before every bubble
        push({ t: 'answer', text: s.answer });
        await wait(1600);
      }
      await wait(400);
      if (!cancelled) setDone(true);
    })();

    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, []);

  // Smoothly follow the newest message, like a live thread scrolling.
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [items, typing, done]);

  const goStart = (e) => { e.preventDefault(); onStart?.(); };

  return (
    <div className="hero-sim">
      <div className="hero-sim-chat" ref={chatRef}>
        <div className="hsim-flow v4">
          {items.map((m, i) => {
            if (m.t === 'bot') return <div key={i} className="v4-bubble">{m.text}</div>;
            if (m.t === 'answer') return <div key={i} className="v4-bubble v4-bubble-user">{m.text}</div>;
            return null;
          })}
          {typing && (
            <div className="hs-typing hsim-typing"><span /><span /><span /></div>
          )}
          {done && (
            <a href="#start" className="hsim-cta" onClick={goStart}>
              Want to try the full process? <span className="hsim-cta-link">Start a contest <span className="hsim-cta-arrow">→</span></span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== HERO SCOREBOARD (v8) ========== */
// The hero's demo: a finished scoreboard. Each scene shows a crowned
// winner over three runners-up, holds perfectly still, then hands off to
// the next tier's contest (group → personal → business) with that tier's
// accent color. Each result is FIXED — a declared winner shouldn't change
// as the card loops (client request). Numbers stay internally consistent
// (names = 3× participants, votes sum to names).
const RACE_SCENARIOS = [
  {
    id: 'group',
    title: 'Indie band',
    // Segment icons — the SAME ones the segment picker cards use (MusicNote
    // for a band, PawPrint for a pet, Buildings for a company); tier tones
    // for color.
    Icon: MusicNote,
    theme: {
      '--race-fg': '#283b78', '--race-accent': '#4b68c3',
      '--race-badge-bg': '#c4cff5', '--race-fill': '#dae2f8',
      '--race-win-bg': '#e0e7f8', '--race-win-fill': '#cbd6f3',
      '--race-shadow': 'rgba(75,104,195,.22)',
    },
    // Fixed result — a declared winner shouldn't change each cycle (client
    // request). Votes sum to the submission count (63 = 21 people × 3).
    rows: [
      { name: 'Paper Tigers', by: 'Jonas', votes: 24 },
      { name: 'Night Harbor', by: 'Maya', votes: 19 },
      { name: 'Velvet Static', by: 'Priya', votes: 12 },
      { name: 'Glass Atlas', by: 'Leo', votes: 8 },
    ],
    pool: { subs: 63, people: 21 },
  },
  {
    id: 'personal',
    title: 'Rescue dog',
    Icon: PawPrint,
    theme: {
      '--race-fg': '#9c4818', '--race-accent': '#b25620',
      '--race-badge-bg': '#fadecc', '--race-fill': '#f7ddc7',
      '--race-win-bg': '#fbe7d5', '--race-win-fill': '#f5d5ba',
      '--race-shadow': 'rgba(178,86,32,.22)',
    },
    // Fixed result (69 = 23 people × 3).
    rows: [
      { name: 'Biscuit', by: 'Maya', votes: 27 },
      { name: 'Mochi', by: 'Leo', votes: 21 },
      { name: 'Juniper', by: 'Sofia', votes: 13 },
      { name: 'Peanut', by: 'Tom', votes: 8 },
    ],
    pool: { subs: 69, people: 23 },
  },
  {
    id: 'business',
    title: 'Fintech startup',
    Icon: Buildings,
    theme: {
      '--race-fg': '#1f5430', '--race-accent': '#3f8850',
      '--race-badge-bg': '#bce5c8', '--race-fill': '#d3ead9',
      '--race-win-bg': '#dff0e4', '--race-win-fill': '#c8e7d2',
      '--race-shadow': 'rgba(63,136,80,.24)',
    },
    // Fixed result (66 = 22 people × 3).
    rows: [
      { name: 'Northwind', by: 'Priya', votes: 26 },
      { name: 'Vantage', by: 'Marcus', votes: 20 },
      { name: 'Helix', by: 'Elena', votes: 12 },
      { name: 'Cobalt', by: 'Jonas', votes: 8 },
    ],
    pool: { subs: 66, people: 22 },
  },
];
const RACE_ROW_STEP = 63; // 56px row + 7px gap — keep in sync with the CSS

// Footer avatar cluster — three circular face crops at equal visual weight.
// Zoom + position are per-image: heads are different sizes in the source
// photos (the bassist stands further from camera), so a shared zoom makes
// faces look unevenly cropped. Blob color backfills transparent slivers.
const RACE_AVATARS = [
  { img: heroProfile1, size: '220%', pos: '46% 0%', bg: '#a6dcb3' },
  { img: heroProfile3, size: '260%', pos: '29% 13%', bg: '#adbfee' },
  { img: heroProfile5, size: '220%', pos: '50% 0%', bg: '#f9ded1' },
];

function HeroVoteRace() {
  const [rows, setRows] = useState([]); // {key, name, by, votes}
  const [phase, setPhase] = useState('waiting'); // waiting | crowned | leaving
  const [scen, setScen] = useState(RACE_SCENARIOS[0]);
  // Submission pool this round — the leaderboard only shows the top 4, so
  // the footer hints at the bigger pool. Participants each submit ~3 names
  // (matches the real contest mechanics), so the two numbers stay plausible.
  const [pool, setPool] = useState({ subs: 0, people: 0 });

  useEffect(() => {
    let cancelled = false;
    const timers = [];
    // Cancelled waits never resolve (their timeout is cleared), which
    // parks the loop for good — same pattern as HeroBriefSim.
    const wait = (ms) => new Promise((res) => { timers.push(setTimeout(res, ms)); });

    let roundKey = 0;

    (async () => {
      await wait(500);
      while (!cancelled) {
        // Cycle the tiers. Each scenario's result is FIXED (client request):
        // a declared winner + votes shouldn't change every time the card
        // loops back to it. Theme + rows swap together in the gap between
        // rounds, so there's never a half-themed frame.
        const scenario = RACE_SCENARIOS[roundKey % RACE_SCENARIOS.length];
        setScen(scenario);
        const base = scenario.rows.map((r, i) => ({ key: `${roundKey}-${i}`, ...r }));
        roundKey += 1;

        if (cancelled) return;
        // Static scoreboard: each scene renders directly in its final
        // crowned state — one gentle pop-in, then perfectly still.
        setRows(base);
        setPool(scenario.pool);
        setPhase('crowned');
        await wait(6500); // hold the finished scoreboard, calm and readable
        if (cancelled) return;
        setPhase('leaving');
        await wait(550);
      }
    })();

    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, []);

  // Rows arrive pre-sorted by votes (finals are built winner-first), but
  // rank defensively anyway so the render never depends on array order.
  const ranked = [...rows].sort((a, b) => b.votes - a.votes);
  const rankOf = {};
  ranked.forEach((r, i) => { rankOf[r.key] = i; });
  const maxVotes = Math.max(1, ...rows.map((r) => r.votes));
  const crowned = phase === 'crowned' || phase === 'leaving';
  const ScenIcon = scen.Icon;

  return (
    <div
      className={`hero-card${phase === 'leaving' ? ' is-leaving' : ''}`}
      style={scen.theme}
      aria-hidden="true"
    >
      <div className="hero-card-top">
        <span className="hero-card-badge">
          <ScenIcon weight="duotone" size={18} />
        </span>
        {/* Keyed by scenario so the title fades in with each handoff. */}
        <div className="hero-card-title" key={scen.id}>{scen.title}</div>
        {/* Constant muted tag — quietly answers "what is this card?"
            without repeating it in every rotating title. */}
        <span className="hero-card-tag">Naming contest</span>
      </div>
      <div className={`hero-card-race${crowned ? ' is-crowned' : ''}`}>
        {rows.map((r, i) => {
          const rank = rankOf[r.key] ?? i;
          // The winner carries the full labels ("Suggested by …",
          // "N votes"); the rest stay abbreviated.
          const isWinner = crowned && rank === 0;
          return (
            // Outer slot slides on rank change; inner row pops in — split so
            // the hsPop transform animation can't fight the slide transform.
            <div
              key={r.key}
              className="hero-card-slot"
              style={{ transform: `translateY(${rank * RACE_ROW_STEP}px)` }}
            >
              <div
                className={`hero-card-row${isWinner ? ' is-winner' : ''}`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <span
                  className="hero-card-fill"
                  style={{ width: isWinner ? '100%' : `${(r.votes / maxVotes) * 92}%` }}
                />
                <span className="hero-card-rank">{rank + 1}</span>
                <span className="hero-card-name">
                  <span className="hero-card-name-text">{r.name}</span>
                  {/* Winner marker folded into the byline — the name line
                      stays clean and the outcome + credit read as one
                      sentence. A plain word can't be misread the way an
                      icon can. */}
                  {isWinner && (
                    <span className="hero-card-by">
                      <b className="race-winner-word">Winner</b> · suggested by {r.by}
                    </span>
                  )}
                </span>
                <span className="hero-card-votes">{r.votes}{isWinner ? ' votes' : ''}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="hero-card-foot">
        <span className="hero-card-avatars">
          {RACE_AVATARS.map((a, i) => (
            <i
              key={i}
              style={{
                backgroundImage: `url(${a.img})`,
                backgroundSize: a.size,
                backgroundPosition: a.pos,
                backgroundColor: a.bg,
                zIndex: RACE_AVATARS.length - i, // left-most on top, standard stack order
              }}
            />
          ))}
        </span>
        <span className="hero-card-foot-text">
          {pool.subs > 0 && `${pool.subs} names submitted by ${pool.people} participants`}
        </span>
      </div>
    </div>
  );
}

/* ========== OFFERINGS ========== */
function Offerings({ onStart }) {
  const tiers = [
    {
      tier: 'personal',
      title: 'Personal',
      tagline: 'Babies, pets, homes, Wi-Fi networks, and more.',
      cta: 'Start a personal contest',
      img: personalDog,
      pillA: { text: 'Olly', meta: '8 votes', color: '#b25620', icon: <path d="M8 14s-5-3.2-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 3.8-5 7-5 7z" /> },
      pillB: { text: 'Closes', meta: 'Sunday', color: '#b25620', icon: <><circle cx="8" cy="8" r="6" /><path d="M8 4v4l2.5 1.5" /></> },
    },
    {
      tier: 'team',
      title: 'Group',
      tagline: 'Sports teams, bands, podcasts, clubs, and more.',
      cta: 'Start a group contest',
      img: teamPlayers,
      pillA: { text: 'Riverside FC', meta: '24 votes', color: '#4b68c3', icon: <path d="M8 14s-5-3.2-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 3.8-5 7-5 7z" /> },
      pillB: { text: 'Closes', meta: 'Friday', color: '#4b68c3', icon: <><circle cx="8" cy="8" r="6" /><path d="M8 4v4l2.5 1.5" /></> },
    },
    {
      tier: 'business',
      title: 'Business',
      tagline: 'Company names, product names, internal projects, and more.',
      cta: 'Start a business contest',
      img: businessWoman,
      pillA: { text: 'EvoPay', meta: '31 votes', color: '#3f8850', icon: <path d="M8 14s-5-3.2-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 3.8-5 7-5 7z" /> },
      pillB: { text: 'Closes', meta: 'Tuesday', color: '#3f8850', icon: <><circle cx="8" cy="8" r="6" /><path d="M8 4v4l2.5 1.5" /></> },
    },
  ];

  return (
    <section className="section" id="pricing">
      <div className="section-head">
        <p className="eyebrow">Pick your path</p>
        <h2 className="h-display h2">Your name starts here</h2>
        <p className="lede">Whether you’re naming a new company, a youth sports team, a WiFi network, or anything in between, NamingContest makes it easy to bring everyone together, stay organized, and find a name you love.</p>
      </div>
      <div className="offerings">
        {tiers.map(t => (
          <article key={t.tier} className="offering" data-tier={t.tier}>
            <div className="offer-body">
              <div className="offer-head">
                <h3>{t.title}</h3>
                <span className="offer-price">from <strong>$9</strong></span>
              </div>
              <p className="tagline">{t.tagline}</p>
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
                <span className="pill-label">{t.pillA.text}{t.pillA.meta && <span className="v">{t.pillA.meta}</span>}</span>
              </div>
              <div className="float-pill pill-b">
                {t.pillB.dot ? <span className="dot"></span> : (
                  <span className="ic"><svg viewBox="0 0 16 16" fill="none" stroke={t.pillB.color} strokeWidth="1.6" strokeLinecap="round">{t.pillB.icon}</svg></span>
                )}
                <span className="pill-label">{t.pillB.text}{t.pillB.meta && <span className="v">{t.pillB.meta}</span>}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="price-band">
        <div className="price-tiers">
          <span className="price-tier"><strong>$9</strong> up to 10 participants</span>
          <span className="price-sep" aria-hidden="true">·</span>
          <span className="price-tier"><strong>$19</strong> up to 30</span>
          <span className="price-sep" aria-hidden="true">·</span>
          <span className="price-tier"><strong>$39</strong> up to 90</span>
        </div>
        <p className="price-note">One-time, per contest. No subscription, no per-name fees.</p>
      </div>
    </section>
  );
}

/* ========== HOW IT WORKS (4 cards with artifacts) ========== */
function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="section-head">
        <p className="eyebrow">How it works</p>
        <h2 className="h-display h2">Four easy steps to a winning name</h2>
        <p className="lede">Ditch Google Forms, Excel sheets, and endless emails for a platform built to run a naming contest and give your people a real voice in the process.</p>
      </div>

      <div className="why">
        {/* 01 BRIEF */}
        <div className="why-item" data-tone="butter">
          <div className="why-text">
            <div className="step-mark"><span className="step-num">01</span><span className="step-label">Setup</span></div>
            <h3>Contest launch</h3>
            <p>Select your contest type, answer a few quick questions, and you’re set.</p>
          </div>
          <div className="why-art">
            <div className="artifact art-brief">
              <div className="a-head">New Contest · Setup</div>
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
            <h3>Invitations</h3>
            <p>Share a link and everyone’s ready to participate. No signups, no downloads.</p>
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
            <div className="step-mark"><span className="step-num">03</span><span className="step-label">Participate</span></div>
            <h3>Name submissions and votes</h3>
            <p>Names roll in, votes get counted, a winner rises to the top.</p>
          </div>
          <div className="why-art">
            <div className="artifact art-vote">
              <div className="a-head">Live · Users Voting</div>
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
            <h3>The winner is…</h3>
            <p>Explore how the votes landed, select a winner, and award a prize if you choose.</p>
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
        <p className="eyebrow">Winners’ stories</p>
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
      q: "Who’s behind NamingContest?",
      a: <p className="faq-a"><strong>We’re Catchword Branding</strong>—a leading naming agency with 25+ years of experience creating names for companies and products around the world. We’ve worked with brands like Starbucks, Volkswagen, Asana, TikTok, and Corning. We created this platform to make running your own naming contest simple, social, and fun.</p>
    },
    {
      q: 'How long does a contest take?',
      a: <p className="faq-a"><strong>You set the deadline,</strong> but most contests wrap up in under a week.</p>
    },
    {
      q: 'How do participants contribute and vote?',
      a: <p className="faq-a"><strong>They open your link and drop in their email</strong>—that’s the whole setup. A magic link signs them in and takes them straight to the contest. You’re the only one who builds and runs it.</p>
    },
    {
      q: 'How does the voting work?',
      a: <p className="faq-a"><strong>One simple vote—no clunky ballots.</strong> Everyone opens your link, sees all the suggested names, and taps up to three favorites. Votes tally as they come in, and you crown the winner.</p>
    },
    {
      q: 'What does it cost?',
      a: <p className="faq-a">The price depends only on how many people take part: <strong>$9</strong> for up to 10 participants, <strong>$19</strong> for up to 30, or <strong>$39</strong> for up to 90. You pay once per contest — no subscription, and no per-name or per-participant charges on top. The tier is the only thing that changes: a $9 contest works exactly like a $39 one. Invitations are unlimited — share your link with as many people as you like. A spot is only used when someone signs in to take part, whether to submit names or to vote; just opening the link doesn’t count. Fees aren’t refundable once a contest has launched.</p>
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
export function Footer() {
  // Highlight the active legal page in the footer (continuing the
  // "you are here" visual language used by the nav + journey steps).
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Footer section links must work from ANY page (legal, contact, etc.),
  // not just the homepage. On the landing page, smooth-scroll to the
  // section; from anywhere else, navigate home first, then scroll.
  const goToSection = (id) => (e) => {
    e.preventDefault();
    if (pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
        140
      );
    }
  };
  const legalLink = (to, label) => (
    <li>
      <Link to={to} className={pathname === to ? 'is-active' : undefined}>
        {label}
      </Link>
    </li>
  );
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="brand-block">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="brand-mark">
            <img src={namingContestLogoWhite} alt="NamingContest" className="brand-logo brand-logo-footer" />
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
            <li><a href="/#how" onClick={goToSection('how')}>How it works</a></li>
            <li><a href="/#testimonials" onClick={goToSection('testimonials')}>Testimonials</a></li>
            <li><a href="/#pricing" onClick={goToSection('pricing')}>Pricing</a></li>
          </ul>
        </div>
        <div>
          <h6>Resources</h6>
          <ul>
            <li><a href="https://catchwordbranding.com/" target="_blank" rel="noopener noreferrer">Catchword</a></li>
            <li><Link to="/contact">Get in touch</Link></li>
            <li><a href="/#faq" onClick={goToSection('faq')}>Learn more</a></li>
          </ul>
        </div>
        <div>
          <h6>Legal</h6>
          <ul>
            {legalLink('/privacy', 'Privacy policy')}
            {legalLink('/terms', 'Terms of service')}
            {legalLink('/cookies', 'Cookie policy')}
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

  // Signed-in users don't belong on the marketing page by default —
  // redirect them to their workspace home (active contest if they
  // have one, otherwise Settings). EXCEPT when the URL carries a
  // hash anchor like /#faq or /#pricing — those are intentional
  // deep-links into marketing sections (e.g. from the platform map's
  // "Frequently asked" link), and we honour them so authed users
  // can still read FAQ / pricing / how-it-works without signing out.
  //
  // We do this SYNCHRONOUSLY during render (via <Navigate />) rather
  // than in a useEffect — otherwise the landing page paints for one
  // frame before the effect fires the redirect, flashing the
  // marketing hero briefly. Returning <Navigate> from the function
  // bails out of render before any of that DOM exists.
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  // Honor a #hash on load (e.g. arriving at /#faq from another page's
  // footer) — the browser's native hash-scroll fires before the long
  // page has laid out, so do it ourselves once content has settled.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 320);
    return () => clearTimeout(t);
  }, []);

  // NO auto-redirect away from the homepage.
  //
  // This used to bounce a signed-in visitor to /v4/settings. Two problems.
  // It made sign-out a trap: signOut() is a network call, and if it failed or
  // lagged, navigating home found a session still in place and threw you
  // straight back into the account page you were trying to leave — with no
  // way out, since every route home did the same thing. And it meant a
  // signed-in person simply couldn't read the pricing or how-it-works pages.
  //
  // The homepage is public. Signed-in visitors get their avatar and a route
  // to the namespace in the nav, which is enough — no page should decide on
  // your behalf that you didn't mean to be here.

  // Tier CTAs route into the unified V4 setup flow.
  // - Card CTAs (Personal/Group/Business) → persist tier + jump straight
  //   to the unified setup chat where sub-segment is the first question
  // - Generic CTAs (no tier) → tier picker page (/v4/pick)
  // Tier card uses 'team' as id (legacy) but SUB_SEGMENTS data file
  // uses 'group' as the key — normalize before persisting.
  const TIER_TO_GROUP = { personal: 'personal', team: 'group', business: 'business' };
  const handleStart = (tier) => {
    if (tier) {
      const group = TIER_TO_GROUP[tier] || tier;
      try {
        localStorage.setItem('v4_contest_setup', JSON.stringify({ group }));
      } catch {
        // localStorage unavailable — proceed anyway
      }
      navigate('/v4/setup/brief');
    } else {
      navigate('/v4/pick');
    }
  };

  return (
    <div className="lp-v3">
      <div className="frame">
        <div className="wrap">
          <Nav />
          <div className="hero-band">
            <img src={heroOfficeScene} className="hero-under" alt="" aria-hidden="true" />
            <Hero onStart={handleStart} />
          </div>
          <Offerings onStart={handleStart} />
          <HowItWorks />
          <Testimonials />
          <FAQ />
          <ClosingCTA onStart={handleStart} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
