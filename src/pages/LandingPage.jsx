import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import personalDog from '../assets/personal-dog.png';
import teamPlayers from '../assets/team-players.png';
import businessWoman from '../assets/business-woman.png';
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
        <a href="#" className="brand-mark">
          <span className="brand-dot" aria-hidden="true"></span>
          <span>NamingContest</span>
        </a>
        <div className="links">
          <a href="#how">How It Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#examples">Examples</a>
        </div>
        <a href="#signin" className="signin">Sign In</a>
        <a href="#start" className="cta">Start a Contest</a>
      </nav>
    </div>
  );
}

/* ========== HERO ========== */
function Hero({ onStart }) {
  return (
    <header className="hero">
      <span className="confetti c1"></span>
      <span className="confetti c2"></span>
      <span className="confetti c3"></span>
      <span className="confetti c4"></span>
      <span className="confetti c5"></span>
      <span className="confetti c6"></span>
      <div className="hero-inner">
        <h1 className="h-display">
          The best names are <span className="em">chosen,</span><br />
          not assigned.
        </h1>
        <p className="sub">
          Invite anyone. Collect ideas anonymously. Vote with five structured methods. Pick a winner the whole room actually believes in.
        </p>
        <div className="cta-row">
          <a href="#start" onClick={(e) => { e.preventDefault(); onStart(); }} className="btn btn-primary btn-lg">
            Start a naming contest <span className="arrow">→</span>
          </a>
          <span className="cta-meta">Free tier · No credit card required</span>
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
      tagline: 'Baby names, pet names, the wedding hashtag, the family Wi-Fi.',
      cap: 'Up to 15 participants',
      price: '$9',
      img: personalDog,
      pillA: { text: '#ChenForever', meta: '3 votes', color: '#b25620', icon: <path d="M8 14s-5-3.2-5-7a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 3.8-5 7-5 7z" /> },
      pillB: { text: '12 joined', color: '#b25620', icon: <><circle cx="5" cy="6" r="2" /><circle cx="11" cy="6" r="2" /><path d="M2 13c0-2 1.5-3 3-3s3 1 3 3M8 13c0-2 1.5-3 3-3s3 1 3 3" /></> },
    },
    {
      tier: 'team',
      title: 'Team',
      tagline: 'Bands, podcasts, sports squads, gaming groups, side projects.',
      cap: 'Up to 60 participants',
      price: '$29',
      img: teamPlayers,
      pillA: { text: 'Round 2', meta: '6 left', color: '#4b68c3', icon: <><circle cx="8" cy="8" r="6" /><path d="M8 4v4l2.5 1.5" /></> },
      pillB: { text: 'Quiet Static', meta: '9', color: '#4b68c3', icon: <><path d="M3 12V5l5-2 5 2v7" /><path d="M3 12h10" /></> },
    },
    {
      tier: 'business',
      title: 'Business',
      tagline: 'Company names, product launches, rebrands, internal initiatives.',
      cap: 'Up to 240 participants',
      price: '$89',
      img: businessWoman,
      pillA: { text: 'Winner', meta: 'Lumira', dot: true },
      pillB: { text: '47% of 84 votes', color: '#3f8850', icon: <path d="M2 8h12M9 4l4 4-4 4" /> },
    },
  ];

  return (
    <section className="section" id="pricing">
      <div className="section-head">
        <p className="eyebrow">Three ways to run a contest</p>
        <h2 className="h-display h2">One platform. Three scales.</h2>
        <p className="lede">Same structured process — sized to fit a kitchen-table decision, a six-person band, or a global product launch.</p>
      </div>
      <div className="offerings">
        {tiers.map(t => (
          <article key={t.tier} className="offering" data-tier={t.tier}>
            <div className="body">
              <h3>{t.title}</h3>
              <p className="tagline">{t.tagline}</p>
              <div className="meta-row">
                <span className="cap">{t.cap}</span>
                <span className="price">{t.price}<small>/contest</small></span>
              </div>
              <a href={`#start-${t.tier}`} onClick={(e) => { e.preventDefault(); onStart(t.tier); }} className="start">
                Get started <span className="arrow">→</span>
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
                <span className="ic"><svg viewBox="0 0 16 16" fill="none" stroke={t.pillB.color} strokeWidth="1.6" strokeLinecap="round">{t.pillB.icon}</svg></span>
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
        <p className="eyebrow">How it works</p>
        <h2 className="h-display h2">Four steps to a name <span className="italic">everyone</span> agrees on.</h2>
        <p className="lede">Pick a path, invite the room, vote with structure, ship the winner.</p>
      </div>

      <div className="why">
        {/* 01 BRIEF */}
        <div className="why-item" data-tone="butter">
          <div className="why-text">
            <div className="step-mark"><span className="step-num">01</span><span className="step-label">Brief</span></div>
            <h3>Build Your <span className="em-word">Brief.</span></h3>
            <p>Pick your contest type, answer a few key questions. Our framework handles the rest.</p>
          </div>
          <div className="why-art">
            <div className="artifact art-brief">
              <div className="a-head">New Contest · Brief</div>
              <div className="row"><span className="lbl">Brand</span><span className="val">Northbound Co.</span></div>
              <div className="row"><span className="lbl">Audience</span><span className="chip-row"><span className="mini-chip">B2B SaaS</span><span className="mini-chip">Founders</span></span></div>
              <div className="row"><span className="lbl">Tone</span><span className="chip-row"><span className="mini-chip">Bold</span><span className="mini-chip">Warm</span><span className="mini-chip">Modern</span></span></div>
              <div className="row"><span className="lbl">Avoid</span><span className="input-line"></span></div>
            </div>
          </div>
        </div>

        {/* 02 INVITE */}
        <div className="why-item" data-tone="periwinkle">
          <div className="why-text">
            <div className="step-mark"><span className="step-num">02</span><span className="step-label">Invite</span></div>
            <h3>Invite Your <span className="em-word">People.</span></h3>
            <p>Share a link. No signup needed. They join instantly.</p>
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
            <div className="step-mark"><span className="step-num">03</span><span className="step-label">Submit &amp; Vote</span></div>
            <h3>Submit &amp; <span className="em-word">Vote.</span></h3>
            <p>Everyone suggests names anonymously, then votes using structured methods. No bias.</p>
          </div>
          <div className="why-art">
            <div className="artifact art-vote">
              <div className="a-head">Round 2 · Ranked vote</div>
              <div className="v-block" data-leader="true">
                <div className="v-row"><span className="name">Northbound</span><span className="meta">19 votes</span></div>
                <div className="bar-wrap"><div className="bar-track"><div className="bar-fill" style={{ width: '76%' }}></div></div></div>
              </div>
              <div className="v-block">
                <div className="v-row"><span className="name">Lumira</span><span className="meta">14 votes</span></div>
                <div className="bar-wrap"><div className="bar-track"><div className="bar-fill" style={{ width: '56%', background: 'var(--fg)', opacity: .35 }}></div></div></div>
              </div>
              <div className="v-block">
                <div className="v-row"><span className="name">Quiltwork</span><span className="meta">9 votes</span></div>
                <div className="bar-wrap"><div className="bar-track"><div className="bar-fill" style={{ width: '36%', background: 'var(--fg)', opacity: .25 }}></div></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* 04 RESULT */}
        <div className="why-item" data-tone="blush">
          <div className="why-text">
            <div className="step-mark"><span className="step-num">04</span><span className="step-label">Result</span></div>
            <h3>Get Your <span className="em-word">Winner.</span></h3>
            <p>A clear result with full analytics and voting breakdown. Done.</p>
          </div>
          <div className="why-art">
            <div className="artifact art-winner">
              <span className="winner-tag"><span className="dot"></span>Winner</span>
              <div className="wname">Northbound</div>
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
function SharedAccountability() {
  const creatorTasks = [
    { icon: <><rect x="6" y="3" width="12" height="18" rx="2" /><path d="M9 3v2h6V3" /><path d="M9 10h6M9 14h6M9 18h3" /></>, t: 'Complete brief fields', pts: '+15' },
    { icon: <><path d="M3 5a2 2 0 012-2h6v17H5a2 2 0 01-2-2V5z" /><path d="M21 5a2 2 0 00-2-2h-6v17h6a2 2 0 002-2V5z" /><path d="M11 3v17M13 3v17" /></>, t: 'Read the naming primer', pts: '+10' },
    { icon: <><circle cx="12" cy="13" r="7" /><path d="M12 9v4l2.5 2" /><path d="M9 2h6M12 6V4" /></>, t: 'Set rules & deadline', pts: '+13' },
  ];
  const participantTasks = [
    { icon: <><path d="M4 4h6a3 3 0 013 3v13a2 2 0 00-2-2H4V4z" /><path d="M20 4h-6a3 3 0 00-3 3v13a2 2 0 012-2h7V4z" /></>, t: 'Read methodology articles', pts: '+10' },
    { icon: <><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 00-4 10.5c.7.7 1 1.6 1 2.5v.5h6V16c0-.9.3-1.8 1-2.5A6 6 0 0012 3z" /></>, t: 'Submit quality name ideas', pts: '+15' },
    { icon: <><path d="M21 12a8 8 0 01-11.5 7.2L4 21l1.8-5.5A8 8 0 1121 12z" /><path d="M9 11h.01M12 11h.01M15 11h.01" /></>, t: 'Earn points through feedback', pts: '+15' },
  ];

  return (
    <section className="section">
      <div className="shared-panel">
        <div className="shared">
          <p className="eyebrow">Shared accountability</p>
          <h3>Both sides do the work. <span className="it">Both sides get the credit.</span></h3>
          <p className="shared-sub">A 100-point Contest Quality Score — split 50/50 between creator and participants.</p>

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
                <span className="col-dot"><Check /></span>
                <div>
                  <div className="col-title">Creator</div>
                  <div className="col-meta">0–50 pts · Before contest</div>
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
                <span className="col-dot"><Check /></span>
                <div>
                  <div className="col-title">Participants</div>
                  <div className="col-meta">0–50 pts · During contest</div>
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
            <a href="#examples" className="btn btn-secondary">See it in action <span className="arrow">→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== TESTIMONIALS ========== */
function Testimonials() {
  const list = [
    { cat: 'business', quote: '47 name ideas, zero consensus. Three days after launching a contest, we had a winner with 89% approval.', winner: 'Vanta Pay', name: 'Sarah Chen', initials: 'SC', label: 'Business' },
    { cat: 'team', quote: 'Six members, six strong opinions, zero agreement for six months. We ran a contest and landed on a name we all own.', winner: 'Hollow Signal', name: 'Marcus Rodriguez', initials: 'MR', label: 'Team' },
    { cat: 'personal', quote: '23 family members across three countries voted on our daughter’s name. Clara was chosen by the people who matter most.', winner: 'Clara', name: 'James & Linda Morrison', initials: 'JM', label: 'Personal' },
  ];
  return (
    <section className="section">
      <div className="section-head">
        <p className="eyebrow">From real contests</p>
        <h2 className="h-display h2">Three rooms. Three winners.<br /><span className="italic">Zero arguments left over.</span></h2>
      </div>
      <div className="testimonials">
        {list.map((t, i) => (
          <article key={i} className="tmonial" data-cat={t.cat}>
            <div className="stars" aria-label="5 out of 5">
              {[0, 1, 2, 3, 4].map(s => <Star key={s} />)}
            </div>
            <blockquote>{t.quote}</blockquote>
            <div className="winner-row">
              <span className="wlabel">Winner</span>
              <span className="name-win">{t.winner}</span>
            </div>
            <div className="who-row">
              <span className="avatar">{t.initials}</span>
              <div>
                <div className="tname">{t.name}</div>
                <div className="tmeta"><span className={`cat-tag ${t.cat}`}><span className="dot"></span>{t.label}</span></div>
              </div>
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
      q: 'Do participants need to create an account?',
      a: <p className="faq-a"><strong>No.</strong> Participants join via a unique link you share — no signup, no download, no friction. They can submit names and vote immediately. Only the contest organizer needs an account.</p>
    },
    {
      q: 'Can I run a free contest?',
      a: <p className="faq-a"><strong>Yes.</strong> The free tier supports one active contest with up to 5 participants and voting only. Paid plans — Personal&nbsp;($9), Team&nbsp;($29), and Business&nbsp;($89) — unlock more participants, all five voting methods, open submissions, naming methodology, and more.</p>
    },
    {
      q: "What's the Catchword Branding connection?",
      a: <p className="faq-a">NamingContest.com is powered by <strong>Catchword Branding</strong>, the #1 ranked naming agency worldwide with 25+ years of experience. The platform uses Catchword's methodology — including their 10-criteria evaluation framework — built into every contest.</p>
    },
    {
      q: 'What does it cost?',
      a: <p className="faq-a">Three paid tiers: <strong>Personal ($9/contest)</strong> for up to 15 participants — great for baby names, pets, and personal decisions. <strong>Team ($29/contest)</strong> for up to 60 participants with white-label output — ideal for bands, sports teams, and groups. <strong>Business ($89/contest)</strong> for up to 240 participants with full PDF reports — built for companies, products, and rebrands. All paid plans include every voting method, naming methodology, and automated reminders.</p>
    },
    {
      q: 'What voting methods are available?',
      a: <div className="faq-a">Five methods, included on every paid plan:<ol><li><strong>Simple Poll</strong> — one vote per person.</li><li><strong>Ranked Choice</strong> — rank all options in order.</li><li><strong>Multi-Criteria Scoring</strong> — rate names across multiple dimensions.</li><li><strong>Pairwise Comparison</strong> — choose between two at a time.</li><li><strong>Weighted Voting</strong> — different voters carry different vote weights.</li></ol></div>
    },
  ];
  return (
    <section className="section" id="faq">
      <div className="section-head">
        <p className="eyebrow">Frequently asked</p>
        <h2 className="h-display h2">Questions, answered.</h2>
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
            {openIdx === i && it.a}
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
        <h2 className="h-display">Your name is out there.<br /><span className="em">Let's find it together.</span></h2>
        <div className="closing-cta">
          <a href="#start" onClick={(e) => { e.preventDefault(); onStart(); }} className="btn btn-primary btn-lg">
            Start your free contest <span className="arrow">→</span>
          </a>
        </div>
        <p className="cmeta">No credit card required.</p>
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
          <a href="#" className="brand-mark">
            <span className="brand-dot" aria-hidden="true"></span>
            <span>NamingContest</span>
          </a>
          <p>Powered by Catchword, the #1 ranked naming agency worldwide.</p>
          <div className="socials" aria-label="Social links">
            <a href="#" aria-label="Twitter / X">
              <svg viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 7.2L14.7 1h-1.3L9 6.4 5.4 1H1l5.4 8.1L1 15h1.3l4.7-5.7L10.6 15H15L9.5 7.2zm-1.7 2L7.2 8.4 2.7 2h2l3.6 5.2.6.9 4.5 6.5h-2L7.8 9.2z"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.6 2.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM2.2 6.5h2.8V14H2.2zM6.8 6.5h2.7V8c.4-.7 1.3-1.6 2.8-1.6 3 0 3.5 2 3.5 4.5V14h-2.8v-2.6c0-.6 0-1.4-.9-1.4s-1 .7-1 1.4V14H6.8z"/></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="12" height="12" rx="3.5"/><circle cx="8" cy="8" r="3"/><circle cx="11.6" cy="4.4" r=".8" fill="currentColor" stroke="none"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h6>Product</h6>
          <ul>
            <li><a href="#how">How It Works</a></li>
            <li><a href="#examples">Examples</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h6>Powered by</h6>
          <ul>
            <li><a href="#">Catchword Branding</a></li>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>
        <div>
          <h6>Legal</h6>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 NamingContest.com · A Catchword Branding company</span>
        <span>Made for the people who can't pick a name.</span>
      </div>
    </footer>
  );
}

/* ========== PAGE ========== */
export default function LandingPage() {
  const navigate = useNavigate();
  const handleStart = (tier) => {
    if (tier) {
      navigate(`/brief?group=${tier}`);
    } else {
      navigate('/brief');
    }
  };

  return (
    <div className="lp-v3">
      <div className="frame">
        <div className="wrap">
          <Nav />
          <Hero onStart={handleStart} />
          <Offerings onStart={handleStart} />
          <HowItWorks />
          <SharedAccountability />
          <Testimonials />
          <FAQ />
          <ClosingCTA onStart={handleStart} />
          <Footer />
        </div>
      </div>
    </div>
  );
}
