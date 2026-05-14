import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X } from '@phosphor-icons/react';
import personalDog from '../../assets/personal-dog.png';
import teamPlayers from '../../assets/team-players.png';
import businessWoman from '../../assets/business-woman.png';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

// Identical tier data as homepage Offerings — keep in sync.
const TIERS = [
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

// Tier id used in URL is "personal" | "group" | "business" — internal key for "team" maps to "group".
const URL_TIER = { personal: 'personal', team: 'group', business: 'business' };

export default function PickTier() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState(null);

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
      {/* Slim v4-style nav — matches the chat screens */}
      <header className="v4-nav">
        <Link to="/" className="v4-brand">
          <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
        </Link>
        <div className="v4-progress">
          <span className="v4-step-dot is-active"></span>
          <span className="v4-step-dot"></span>
          <span className="v4-step-dot"></span>
          <span className="v4-step-label">
            Setup<span className="v4-step-counter"> · 1/16</span>
          </span>
        </div>
        <Link to="/" className="v4-exit" aria-label="Exit">
          <X weight="regular" size={14} />
          <span>Exit</span>
        </Link>
      </header>

      <div className="frame">
        <div className="wrap">
          {/* Identical to homepage offerings section */}
          <section className="section" id="pricing">
            <div className="section-head">
              <p className="eyebrow">First things first</p>
              <h2 className="h-display h2">What kind of contest?</h2>
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
                    <h3>{t.title}</h3>
                    <p className="tagline">{t.tagline}</p>
                    <div className="meta-row">
                      <span className="cap">{t.cap}</span>
                      <span className="price">{t.price}<small>/contest</small></span>
                    </div>
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
                      {t.pillA.text} {t.pillA.meta && <span className="v">{t.pillA.meta}</span>}
                    </div>
                    <div className="float-pill pill-b">
                      <span className="ic">
                        <svg viewBox="0 0 16 16" fill="none" stroke={t.pillB.color} strokeWidth="1.6" strokeLinecap="round">
                          {t.pillB.icon}
                        </svg>
                      </span>
                      {t.pillB.text} {t.pillB.meta && <span className="v">{t.pillB.meta}</span>}
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
