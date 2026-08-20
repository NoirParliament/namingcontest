import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X } from '@phosphor-icons/react';
import ExitLink from '../../components/v4/ExitLink';
import personalDog from '../../assets/personal-dog.png';
import teamPlayers from '../../assets/team-players.png';
import businessWoman from '../../assets/business-woman.png';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import AvatarMenu from '../../components/v4/AvatarMenu';
import { useAuth } from '../../lib/AuthContext';
import { useProfile } from '../../lib/useProfile';
import { getSegmentTone } from '../../data/v4/segmentTheme';
import { readSetup } from '../../utils/v4Brief';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

// Identical tier data as homepage Offerings — keep in sync.
const TIERS = [
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

// Tier id used in URL is "personal" | "group" | "business" — internal key for "team" maps to "group".
const URL_TIER = { personal: 'personal', team: 'group', business: 'business' };

export default function PickTier() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState(null);
  // Signed-in host → their avatar sits in the header, same as the chat and
  // review steps, so the account picture is continuous across the whole
  // creator flow (guests just see Exit).
  const { user } = useAuth();
  const [profile] = useProfile(user);
  const navSetup = readSetup();
  const navTone = navSetup.subSegmentId ? getSegmentTone(navSetup.subSegmentId) : null;

  const handlePick = (tierKey) => {
    if (picked) return; // ignore repeat clicks during the confirmation hold
    setPicked(tierKey);
    // Persist the chosen tier so the unified setup chat can pick the right
    // sub-segment options when it mounts.
    const group = URL_TIER[tierKey];
    try {
      const raw = localStorage.getItem('v4_contest_setup');
      const current = raw ? JSON.parse(raw) : {};
      // Reset any prior in-flight setup — new contest, fresh state.
      localStorage.setItem('v4_contest_setup', JSON.stringify({ group }));
    } catch {
      // localStorage unavailable — proceed anyway
    }
    setTimeout(() => navigate('/v4/setup/brief'), 280);
  };

  return (
    /* v4 class brings the --v4-muted / --v4-fg / --v4-ring tokens into
       scope so the v4-nav styling works identically to the chat. */
    <div className="lp-v3 lp-v3-pick-tier v4">
      {/* Decorative pastel blobs — same default palette as a fresh
          (unpicked) chat. CSS (see .lp-v3-pick-tier in v4.css) pins
          their z-index behind the content so they don't overlap the
          tier cards. */}
      <span className="v4-blob v4-blob-1" aria-hidden="true"></span>
      <span className="v4-blob v4-blob-2" aria-hidden="true"></span>
      <span className="v4-blob v4-blob-3" aria-hidden="true"></span>
      <span className="v4-blob v4-blob-4" aria-hidden="true"></span>

      {/* Slim v4-style nav — matches the chat screens */}
      <header className="v4-nav v4-nav--app">
        <BrandLink />
        <div className="v4-progress">
          <span className="v4-step-dot is-active"></span>
          <span className="v4-step-dot"></span>
          <span className="v4-step-dot"></span>
          <span className="v4-step-label">
            Setup<span className="v4-step-counter"> · 1/16</span>
          </span>
        </div>
        <div className="v4-nav-right">
          <ExitLink to="/" aria-label="Exit" />
          {user && (
            <AvatarMenu
              email={user?.email || navSetup.userEmail}
              name={profile?.display_name || navSetup.userName}
              photo={profile?.avatar_url || (user?.id ? null : (navSetup.userPhoto || null))}
              userId={user?.id}
              seed={user?.id}
              tone={navTone}
            />
          )}
        </div>
      </header>

      <div className="frame">
        <div className="wrap">
          {/* Identical to homepage offerings section */}
          <section className="section" id="pricing">
            <div className="section-head">
              <p className="eyebrow">Let’s name something</p>
              <h2 className="h-display h2">Who’s this one for?</h2>
              <p className="lede">Pick a path to get started. You can change your mind anytime.</p>
            </div>
            <div className="offerings">
              {TIERS.map((t) => (
                <article
                  key={t.tier}
                  className="offering"
                  data-tier={t.tier}
                  data-picked={picked === t.tier ? 'yes' : picked ? 'no' : undefined}
                >
                  <div className="offer-body">
                    <div className="offer-head">
                      <h3>{t.title}</h3>
                      <span className="offer-price">from <strong>$9</strong></span>
                    </div>
                    <p className="tagline">{t.tagline}</p>
                    <a
                      href={`#start-${t.tier}`}
                      onClick={(e) => { e.preventDefault(); handlePick(t.tier); }}
                      className="start"
                    >
                      {t.cta} <span className="arrow">→</span>
                    </a>
                  </div>
                  <div className="scene" aria-hidden="true">
                    <div className="photo has-img" style={{ backgroundImage: `url(${t.img})` }}></div>
                    <div className="float-pill pill-a">
                      <span className="ic">
                        <svg viewBox="0 0 16 16" fill="none" stroke={t.pillA.color} strokeWidth="1.6" strokeLinecap="round">
                          {t.pillA.icon}
                        </svg>
                      </span>
                      <span className="pill-label">{t.pillA.text}{t.pillA.meta && <span className="v">{t.pillA.meta}</span>}</span>
                    </div>
                    <div className="float-pill pill-b">
                      <span className="ic">
                        <svg viewBox="0 0 16 16" fill="none" stroke={t.pillB.color} strokeWidth="1.6" strokeLinecap="round">
                          {t.pillB.icon}
                        </svg>
                      </span>
                      <span className="pill-label">{t.pillB.text}{t.pillB.meta && <span className="v">{t.pillB.meta}</span>}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
