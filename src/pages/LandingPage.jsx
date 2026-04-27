import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import namicoIcon from '../assets/namico-icon.svg';
import Footer from '../components/layout/Footer';
import {
  Trophy, Users, Lightbulb, CheckCircle, ArrowRight,
  Target, Envelope, Star, Plus, Minus, Buildings,
  MusicNote, Baby, House, ChartBar, Certificate,
  Confetti, WarningCircle, ShieldCheck, Shuffle,
  ClipboardText, SpeakerSlash, Ruler, Scales, X, Sparkle,
} from '@phosphor-icons/react';
import { platformStats, testimonials, faqData, howItWorksSteps, almostNames, methodologyItems } from '../data/mockData';
import personalIllustration from '../assets/personal-illustration.png';
import teamIllustration from '../assets/team-illustration.png';
import businessIllustration from '../assets/business-illustration.png';

/* ── Typewriter Word Animation ── */
function RotatingWord({ words }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [text, setText] = useState(words[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];

    if (!isDeleting && text === current) {
      // Pause before deleting
      const t = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(t);
    }
    if (isDeleting && text === '') {
      // Move to next word, start typing
      setIsDeleting(false);
      setWordIdx((wordIdx + 1) % words.length);
      return;
    }

    const speed = isDeleting ? 60 : 100;
    const t = setTimeout(() => {
      setText(isDeleting
        ? current.slice(0, text.length - 1)
        : current.slice(0, text.length + 1)
      );
    }, speed);
    return () => clearTimeout(t);
  }, [text, isDeleting, wordIdx, words]);

  return (
    <span style={{ color: '#254f1a', fontWeight: 800 }}>
      {text}
      <span style={{
        display: 'inline-block',
        width: 2,
        height: '0.85em',
        background: '#254f1a',
        marginLeft: 1,
        marginRight: -2,
        verticalAlign: 'baseline',
        animation: 'blink 0.8s step-end infinite',
      }} />
    </span>
  );
}

/* ── Glassmorphism Navbar ── */
function Navbar() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80) { setVisible(true); }
      else if (y > lastY.current + 6) { setVisible(false); }
      else if (y < lastY.current - 6) { setVisible(true); }
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 1000, padding: '16px 24px',
      transform: visible ? 'translateY(0)' : 'translateY(-120%)',
      transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{ maxWidth: 1504, margin: '0 auto' }}>
      <nav style={{
        background: 'rgba(239,240,236,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 999,
        padding: '10px 10px 10px 28px',
        boxShadow: '0 2px 16px rgba(30,35,48,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32,
            background: '#d2e823',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={namicoIcon} alt="Naming Contest" style={{ width: 24, height: 24, display: 'block' }} />
          </div>
          <span style={{ fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: '#1e2330' }}>
            NamingContest
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[{ label: 'How It Works', href: '#shared-accountability' }, { label: 'Examples', href: '#examples' }, { label: 'Pricing', href: '#pricing' }].map(link => (
            <a key={link.label} href={link.href}
              style={{ color: '#1e2330', fontSize: 16, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#254f1a'}
              onMouseLeave={e => e.target.style.color = '#1e2330'}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate('/wireframe')} style={{ display: 'none' }}>
            Wireframe Flow Testing
          </button>
          <button onClick={() => navigate('/dashboard')} style={{
            background: 'none', border: 'none', color: '#1e2330',
            fontSize: 16, fontWeight: 500, cursor: 'pointer', padding: '14px 20px',
          }}>
            Sign In
          </button>
          <button onClick={() => navigate('/select')} style={{
            background: '#1e2330', border: 'none', borderRadius: 999, color: '#fff',
            fontSize: 16, fontWeight: 500, cursor: 'pointer', padding: '14px 28px',
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Get Started
          </button>
        </div>
      </nav>
      </div>
    </div>
  );
}

/* ── Social Proof Marquee ── */
const CATCHWORD_CLIENTS = [
  'The North Face', 'Adobe Photoshop', 'Volkswagen', 'TikTok',
  'Starbucks', 'Asana', 'Upwork',
];

function SocialProofSection() {
  return (
    <section style={{ background: '#f3f3f1', padding: '48px 0', overflow: 'hidden' }}>

      {/* Marquee */}
      <div style={{ position: 'relative' }}>
        {/* Left fade */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(90deg, #f3f3f1, transparent)', zIndex: 2, pointerEvents: 'none' }} />
        {/* Right fade */}
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 120, background: 'linear-gradient(270deg, #f3f3f1, transparent)', zIndex: 2, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', whiteSpace: 'nowrap' }}>
          {[0, 1].map(copy => (
            <div
              key={copy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 64,
                paddingRight: 64,
                animation: 'marqueeScroll 20s linear infinite',
              }}
            >
              {CATCHWORD_CLIENTS.map((name, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#1e2330',
                    opacity: 0.45,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

/* ── Accordion ── */
function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {items.map(item => (
        <div key={item.id} style={{ borderBottom: '0.5px solid rgba(30,35,48,0.12)' }}>
          <button
            onClick={() => setOpen(open === item.id ? null : item.id)}
            style={{
              width: '100%', background: 'none', border: 'none',
              padding: '20px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: '#1e2330', fontSize: 18, fontWeight: 600,
              fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif", cursor: 'pointer', textAlign: 'left',
              gap: 16,
            }}
          >
            <span>{item.question}</span>
            {open === item.id
              ? <Minus size={18} weight="bold" style={{ color: '#254f1a', flexShrink: 0 }} />
              : <Plus size={18} weight="bold" style={{ color: '#254f1a', flexShrink: 0 }} />
            }
          </button>
          <div style={{
            overflow: 'hidden',
            maxHeight: open === item.id ? 300 : 0,
            transition: 'max-height 0.35s ease',
            paddingBottom: open === item.id ? 20 : 0,
          }}>
            <p style={{ fontSize: 16, color: 'rgba(30,35,48,0.7)', lineHeight: 1.7 }}>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Flip Card ── */
function FlipCard({ item }) {
  return (
    <div style={{
      width: '100%', height: 140,
      perspective: 1000,
      cursor: 'pointer',
    }}
      className="flip-card"
    >
      <div className="flip-card-inner" style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.6s' }}>
        {/* Front */}
        <div style={{
          position: 'absolute', inset: 0,
          background: '#fff',
          border: '0.5px solid rgba(0,0,0,0.1)',
          borderRadius: 12,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          padding: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
            fontSize: 26, fontWeight: 700, color: '#0a0a0a',
            marginBottom: 8, textAlign: 'center',
          }}>
            {item.brand}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(210,232,35,0.15)',
            border: '0.5px solid rgba(210,232,35,0.4)',
            borderRadius: 9999,
            padding: '2px 10px',
            fontSize: 15, color: '#254f1a',
          }}>
            <CheckCircle size={10} weight="fill" /> Winner
          </div>
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0,
          background: '#e8efd6',
          border: '0.5px solid rgba(0,0,0,0.08)',
          borderRadius: 12,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          padding: 14,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1e2330', marginBottom: 6 }}>
            Almost named...
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {item.rejected.slice(0, 3).map(r => (
              <div key={r} style={{ fontSize: 14, color: '#1e2330', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <X size={10} weight="bold" style={{ flexShrink: 0, opacity: 0.4 }} /> {r}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`.flip-card:hover .flip-card-inner { transform: rotateY(180deg); }`}</style>
    </div>
  );
}

/* ── Pricing Feature Table ── */
function PricingFeatureTable() {
  const cols = [
    { label: 'Free',     color: '#1e2330' },
    { label: 'Personal', color: '#2665d6' },
    { label: 'Team',     color: '#780016' },
    { label: 'Business', color: '#254f1a' },
  ];

  const sections = [
    {
      label: 'Participants',
      rows: [
        { feature: 'Participant cap', free: '5', personal: 'Up to 15', team: 'Up to 60', business: 'Up to 240' },
        { feature: 'Participant invite flow', free: '✓', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Anonymous submissions', free: '✓', personal: '✓', team: '✓', business: '✓' },
      ],
    },
    {
      label: 'Methodology & Quality',
      rows: [
        { feature: 'Naming methodology articles', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Article quizzes', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Interactive exploration mind map', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Contest quality score (0–100)', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Submission quality breakdown', free: '—', personal: '✓', team: '✓', business: '✓' },
      ],
    },
    {
      label: 'Automation & Branding',
      rows: [
        { feature: 'Automated deadline reminders', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Voting open notification', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'White-label output (no platform branding)', free: '—', personal: '—', team: '✓', business: '✓' },
      ],
    },
    {
      label: 'Results & Reports',
      rows: [
        { feature: 'Live results dashboard', free: '✓', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Retroactive PDF unlock (post-contest)', free: '—', personal: '—', team: '✓', business: '✓' },
        { feature: 'Full PDF results report', free: '—', personal: '—', team: '—', business: '✓' },
      ],
    },
    {
      label: 'Submissions',
      rows: [
        { feature: 'Voting-only mode (you pre-load names)', free: '✓', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Open submissions (group suggests names)', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Submission limit per participant', free: '✓', personal: '✓', team: '✓', business: '✓' },
      ],
    },
    {
      label: 'Voting Methods',
      rows: [
        { feature: 'Simple majority', free: '✓', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Ranked-choice voting', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Pairwise comparison', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Multi-criteria scoring', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Weighted voting', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Manual or auto voting transition', free: '✓', personal: '✓', team: '✓', business: '✓' },
      ],
    },
  ];

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '0.5px solid rgba(0,0,0,0.08)' }}>
      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(4, 1fr)', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '12px 16px', fontSize: 14, color: '#1e2330', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Feature</div>
        {cols.map((c, i) => (
          <div key={i} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 15, fontWeight: 800, color: c.color, borderLeft: '0.5px solid rgba(0,0,0,0.05)', letterSpacing: '0.03em' }}>
            {c.label}
          </div>
        ))}
      </div>

      {sections.map((section, si) => (
        <div key={si} style={{ borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
          {/* Section label */}
          <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.03)', fontSize: 14, fontWeight: 700, color: '#1e2330', borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
            {section.label}
          </div>
          {section.rows.map((row, ri) => {
            const vals = [row.free, row.personal, row.team, row.business];
            return (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '200px repeat(4, 1fr)', background: ri % 2 === 1 ? 'rgba(0,0,0,0.02)' : '#fff' }}>
                <div style={{ padding: '9px 16px 9px 24px', fontSize: 14, color: '#1e2330', display: 'flex', alignItems: 'center' }}>{row.feature}</div>
                {vals.map((v, vi) => (
                  <div key={vi} style={{ padding: '9px 8px', textAlign: 'center', fontSize: 14, borderLeft: '0.5px solid rgba(0,0,0,0.04)', fontWeight: v === '—' ? 400 : 600, color: v === '✓' ? cols[vi].color : v === '—' ? '#ccc' : '#4a4a4a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {v}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── Main Landing Page ── */
export default function LandingPage() {
  const navigate = useNavigate();

  /* ── Cursor letter trail (hero only) ── */
  const heroRef = useRef(null);
  useEffect(() => {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lastX = 0, lastY = 0;

    const onMove = (e) => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      // Only active inside the hero section
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (dx * dx + dy * dy < 400) return;
      lastX = e.clientX;
      lastY = e.clientY;

      const el = document.createElement('span');
      el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
      const size = Math.random() * 18 + 12;
      const angle = (Math.random() - 0.5) * 40;
      const drift = (Math.random() - 0.5) * 40;
      const drop = 80 + Math.random() * 60;
      const dur = 700 + Math.random() * 500;

      Object.assign(el.style, {
        position: 'fixed',
        left: e.clientX + 'px',
        top: e.clientY + 'px',
        fontSize: size + 'px',
        fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
        fontWeight: '800',
        color: 'rgb(30,35,48)',
        pointerEvents: 'none',
        zIndex: '99999',
        userSelect: 'none',
        lineHeight: '1',
        transformOrigin: 'center',
      });
      document.body.appendChild(el);

      el.animate([
        { transform: `translate(-50%, -50%) rotate(${angle}deg) scale(1)`, opacity: 0.85 },
        { transform: `translate(calc(-50% + ${drift}px), calc(-50% + ${drop}px)) rotate(${angle + 25}deg) scale(0.4)`, opacity: 0 },
      ], { duration: dur, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)', fill: 'forwards' })
        .finished.then(() => el.remove());
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const segmentCards = [
    {
      group: 'personal',
      label: 'Personal',
      icon: <Baby size={28} weight="duotone" color="#d2e823" />,
      title: 'No opinions are too many',
      subtitle: "Invite the people who matter",
      color: '#d2e823',
      colorRgb: '210,232,35',
      tags: ['Baby Name', 'Pet Name', 'Home', 'Something Fun'],
      cta: 'Start Personal Contest',
      price: '$9',
      priceSub: 'per contest',
      features: [
        { label: 'Up to 15 participants', included: true },
        { label: 'Open submissions', included: true },
        { label: 'All voting methods', included: true },
        { label: 'Naming methodology', included: true },
        { label: 'Automated reminders', included: true },
        { label: 'Contest quality score', included: true },
        { label: 'White-label output', included: false },
        { label: 'Full PDF report', included: false },
      ],
    },
    {
      group: 'team',
      label: 'Group',
      icon: <Users size={28} weight="duotone" color="#e9c0e9" />,
      title: 'Let the squad decide',
      subtitle: "One name the whole squad stands behind",
      color: '#d2e823',
      colorRgb: '210,232,35',
      tags: ['Sports Team', 'Band', 'Podcast', 'Gaming Group'],
      cta: 'Start Team Contest',
      price: '$29',
      priceSub: 'per contest',
      features: [
        { label: 'Up to 60 participants', included: true },
        { label: 'Open submissions', included: true },
        { label: 'All voting methods', included: true },
        { label: 'Naming methodology', included: true },
        { label: 'Automated reminders', included: true },
        { label: 'Contest quality score', included: true },
        { label: 'White-label output', included: true },
        { label: 'Full PDF report', included: false },
      ],
    },
    {
      group: 'business',
      label: 'Business',
      icon: <Buildings size={28} weight="duotone" color="#254f1a" />,
      title: 'Naming is a business decision',
      subtitle: 'Naming with structure behind it',
      color: '#d2e823',
      colorRgb: '210,232,35',
      tags: ['Company', 'Product', 'Project', 'Rebrand'],
      cta: 'Start Business Contest',
      price: '$89',
      priceSub: 'per contest',
      features: [
        { label: 'Up to 240 participants', included: true },
        { label: 'Open submissions', included: true },
        { label: 'All voting methods', included: true },
        { label: 'Naming methodology', included: true },
        { label: 'Automated reminders', included: true },
        { label: 'Contest quality score', included: true },
        { label: 'White-label output', included: true },
        { label: 'Full PDF report', included: true },
      ],
    },
  ];

  const stepIcons = [
    <Target size={28} weight="light" color="#57534E" />,
    <ClipboardText size={28} weight="light" color="#57534E" />,
    <Envelope size={28} weight="light" color="#57534E" />,
    <Lightbulb size={28} weight="light" color="#57534E" />,
    <CheckCircle size={28} weight="light" color="#57534E" />,
  ];

  const methodIcons = [
    <SpeakerSlash size={28} weight="duotone" color="#d2e823" />,
    <Ruler size={28} weight="duotone" color="#d2e823" />,
    <Scales size={28} weight="duotone" color="#d2e823" />,
  ];

  return (
    <div style={{ background: '#f3f3f1', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero Section ── */}
      <section ref={heroRef} style={{
        position: 'relative',
        background: '#d2e823',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 1504, width: '100%', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* H1 */}
          <h1 style={{
            fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
            fontSize: 'clamp(40px, 6vw, 80px)',
            fontWeight: 800,
            color: '#254f1a',
            lineHeight: 1.07,
            maxWidth: 'none',
            margin: '0 auto 24px',
          }}>
            New band, brand, or a baby?<br />
            <span style={{ color: '#1e2330' }}>Run a naming contest, maybe?</span>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 20,
            color: '#254f1a',
            maxWidth: 520,
            margin: '0 auto 40px',
            lineHeight: 1.5,
          }}>
            No spreadsheets. No group chat debates. Just invite people, collect real ideas, vote, and crown a winner.
          </p>

          {/* CTA Button */}
          <div>
            <button
              onClick={() => navigate('/select')}
              style={{
                background: '#254f1a', border: 'none', borderRadius: 999,
                color: '#fff', fontSize: 18, fontWeight: 600, cursor: 'pointer',
                padding: '16px 40px', display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Launch a naming contest
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>

      </section>

      {/* ── Segment Blocks (Linktree-style alternating) ── */}
      <div id="pricing">
        {segmentCards.map((card, i) => (
          <SegmentBlock key={card.group} card={card} navigate={navigate} index={i} />
        ))}
      </div>

      {/* ── Success Stories ── */}
      <section style={{ background: '#f3f3f1', padding: '80px 0' }} id="examples">
        <div style={{ maxWidth: 1504, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
              color: '#1e2330', marginBottom: 12,
            }}>
              Real Results
            </div>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#1e2330',
              marginBottom: 12,
              lineHeight: 1.15,
            }}>
              Names chosen together,<br />owned by everyone
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {testimonials.map(t => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ background: '#254f1a', padding: '80px 0' }} id="how-it-works">
        <div style={{ maxWidth: 1504, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(210,232,35,0.65)', marginBottom: 12 }}>
              How It Works
            </div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif", fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, color: '#d2e823', lineHeight: 1.15 }}>
              Five steps to the perfect name
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
            position: 'relative',
          }}>
            {howItWorksSteps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                {i < 4 && (
                  <div style={{
                    position: 'absolute',
                    top: 24, left: '60%',
                    width: '80%', height: 1,
                    borderTop: '1px dashed rgba(255,255,255,0.2)',
                    zIndex: 0,
                  }} />
                )}
                <div style={{
                  width: 48, height: 48,
                  background: '#d2e823',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 15, fontWeight: 700, color: '#000',
                  position: 'relative', zIndex: 1,
                }}>
                  {step.number}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 15, color: 'rgba(210,232,35,0.8)', lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <button
              onClick={() => navigate('/select')}
              style={{
                background: '#d2e823', border: 'none', borderRadius: 999,
                color: '#254f1a', fontSize: 18, fontWeight: 600, cursor: 'pointer',
                padding: '16px 40px', display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Start your contest
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Contest Quality System ── */}
      <section id="shared-accountability" style={{ background: '#e8efd6', padding: '80px 0' }}>
        <div style={{ maxWidth: 1504, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
              color: '#1e2330', marginBottom: 12,
            }}>
              Shared Accountability
            </div>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#254f1a',
              marginBottom: 16,
              lineHeight: 1.15,
            }}>
              Both sides do the work.
              <br />
              <span style={{ color: '#1e2330' }}>Both sides get the credit.</span>
            </h2>
            <p style={{ fontSize: 18, color: '#1e2330', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, opacity: 0.75 }}>
              A 100-point score split between creator and participants.
            </p>
          </div>

          {/* Visual quality bar demo */}
          <div style={{
            maxWidth: 1504,
            margin: '0 auto',
            background: '#ffffff',
            border: '0.5px solid rgba(68,34,4,0.1)',
            borderRadius: 20,
            padding: '36px 40px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e2330', letterSpacing: '0.04em' }}>
                Contest Quality Score
              </div>
              <div style={{
                fontSize: 14, fontWeight: 600,
                background: '#d2e823',
                borderRadius: 99, padding: '4px 14px',
                color: '#000',
              }}>
                Strong · 78/100
              </div>
            </div>

            {/* The split bar */}
            <div style={{ position: 'relative', height: 12, borderRadius: 6, background: 'rgba(30,35,48,0.12)', marginBottom: 10 }}>
              {/* Creator fill - 38/50 */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: '38%',
                background: 'linear-gradient(90deg, rgba(210,232,35,0.6), #d2e823)',
                borderRadius: '6px 0 0 6px',
              }} />
              {/* Participant fill - 40/50, starts at midpoint */}
              <div style={{
                position: 'absolute', left: '50%', top: 0, bottom: 0,
                width: '40%',
                background: 'linear-gradient(90deg, rgba(68,34,4,0.25), rgba(68,34,4,0.55))',
                borderRadius: '0 6px 6px 0',
              }} />
              {/* Midpoint divider */}
              <div style={{
                position: 'absolute', left: '50%', top: -3, bottom: -3,
                width: 2, background: 'rgba(255,255,255,0.25)',
                transform: 'translateX(-50%)',
                borderRadius: 1,
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#1e2330', marginBottom: 28 }}>
              <span style={{ color: '#254f1a', fontWeight: 600 }}>◀ Creator's half · 38/50</span>
              <span style={{ color: '#1e2330', fontWeight: 600 }}>Participants' half · 40/50 ▶</span>
            </div>

            {/* Two-column explanation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                {
                  color: '#254f1a',
                  label: 'Creator (0–50)',
                  items: ['Complete all brief fields', 'Read the naming primer', 'Set submission rules & deadline'],
                  note: 'Done before anyone else joins.',
                },
                {
                  color: '#1e2330',
                  label: 'Participants (0–50)',
                  items: ['Read naming methodology articles', 'Submit quality name ideas', 'Earn naming points through feedback'],
                  note: 'Crowd effort, tracked live.',
                },
              ].map((col, i) => (
                <div key={i} style={{
                  background: '#ffffff',
                  border: `0.5px solid ${col.color}22`,
                  borderRadius: 12,
                  padding: '18px 20px',
                }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: col.color, marginBottom: 14,
                  }}>
                    {col.label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {col.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: col.color, opacity: 0.6,
                          marginTop: 5, flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 15, color: '#1e2330', lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    fontSize: 14, color: '#1e2330',
                    borderTop: '0.5px solid rgba(30,35,48,0.08)',
                    paddingTop: 10,
                  }}>
                    {col.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <button
              onClick={() => navigate('/select')}
              style={{
                background: '#254f1a', border: 'none', borderRadius: 999,
                color: '#fff', fontSize: 18, fontWeight: 600, cursor: 'pointer',
                padding: '16px 40px', display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              See it in action
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>

        </div>
      </section>



      {/* ── FAQ ── */}
      <section style={{ background: '#f3f3f1', padding: '80px 0' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 800,
              color: '#1e2330',
            }}>
              Frequently asked questions
            </h2>
          </div>
          <Accordion items={faqData} />
        </div>
      </section>

      {/* ── Newsletter ── */}
      <NewsletterSection />

      {/* ── Footer ── */}
      <Footer />

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ── Newsletter Section ── */
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) { setStatus('error'); return; }
    setStatus('loading');
    setTimeout(() => setStatus('success'), 800);
  };

  return (
    <section style={{
      background: '#d2e823',
      padding: '100px 0',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>

        {/* Eyebrow */}
        <div style={{
          fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.14em', color: 'rgba(37,79,26,0.6)', marginBottom: 20,
        }}>
          Stay in the loop
        </div>

        {/* Heading */}
        <h2 style={{
          fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
          fontSize: 'clamp(24px, 3vw, 34px)',
          fontWeight: 800, color: '#254f1a',
          marginBottom: 12, lineHeight: 1.15,
          whiteSpace: 'nowrap',
        }}>
          Naming <RotatingWord words={['tips', 'hacks', 'guides', 'gems']} /> straight to your inbox
        </h2>

        <p style={{ fontSize: 18, color: '#254f1a', marginBottom: 8, lineHeight: 1.6, opacity: 0.8 }}>
          Updates, tips, and real contest stories.
        </p>

        {/* Social proof */}
        <p style={{ fontSize: 14, color: 'rgba(37,79,26,0.55)', marginBottom: 36 }}>
          2,400+ subscribers
        </p>

        {status === 'success' ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(210,232,35,0.15)',
            border: '0.5px solid rgba(210,232,35,0.4)',
            borderRadius: 12, padding: '16px 28px',
            fontSize: 18, fontWeight: 600, color: '#254f1a',
          }}>
            <CheckCircle size={20} weight="fill" />
            You're on the list. Talk soon.
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={{
              display: 'flex', gap: 8, maxWidth: 480, margin: '0 auto',
            }}>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setStatus('idle'); }}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1, height: 48,
                  background: '#ffffff',
                  border: `0.5px solid ${status === 'error' ? 'rgba(239,68,68,0.6)' : 'rgba(0,0,0,0.12)'}`,
                  borderRadius: 10, padding: '0 16px',
                  color: '#1e2330', fontSize: 14,
                  fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(210,232,35,0.6)'}
                onBlur={e => e.target.style.borderColor = status === 'error' ? 'rgba(239,68,68,0.6)' : 'rgba(0,0,0,0.12)'}
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                className={`btn-primary btn-business${status === 'loading' ? ' btn-disabled' : ''}`}
                style={{
                  background: '#254f1a',
                  height: 48, padding: '0 24px',
                  flexShrink: 0,
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {status === 'loading' ? (
                  <div style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderTopColor: '#000',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    position: 'relative', zIndex: 1,
                  }} />
                ) : (
                  <>
                    <span style={{ color: '#ffffff' }}>Subscribe</span>
                    <ArrowRight size={14} weight="bold" style={{ color: '#ffffff', position: 'relative', zIndex: 1 }} />
                  </>
                )}
              </button>
            </form>

            <p style={{
              fontSize: 14, marginTop: 8,
              color: status === 'error' ? '#ef4444' : 'transparent',
              transition: 'color 0.2s',
            }}>
              Please enter a valid email address.
            </p>

          </>
        )}
      </div>
    </section>
  );
}

/* ── Feature Breakdown (expandable) ── */
function FeatureBreakdown() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 56 }}>
      {/* Toggle button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'none',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 10,
            padding: '12px 24px',
            fontSize: 15, fontWeight: 600, color: '#1e2330',
            cursor: 'pointer',
            fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.3)'; e.currentTarget.style.color = '#1C1917'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; e.currentTarget.style.color = '#4a4a4a'; }}
        >
          {open ? <Minus size={14} weight="bold" /> : <Plus size={14} weight="bold" />}
          {open ? 'Hide full feature breakdown' : 'See full feature breakdown'}
        </button>
      </div>

      {/* Table — animated expand */}
      <div style={{
        overflow: 'hidden',
        maxHeight: open ? 2000 : 0,
        opacity: open ? 1 : 0,
        transition: 'max-height 0.45s ease, opacity 0.3s ease',
        marginTop: open ? 24 : 0,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif", fontSize: 20, fontWeight: 700, color: '#1e2330', margin: 0 }}>
            Everything included, plan by plan
          </h3>
        </div>
        <PricingFeatureTable />
      </div>
    </div>
  );
}

/* ── Segment Block (Linktree-style alternating full-width) ── */
function SegmentBlock({ card, navigate, index }) {
  const CONFIGS = {
    personal: {
      bg: '#2665d6',
      eyebrow: 'rgba(210,232,35,0.65)',
      heading: '#d2e823',
      body: 'rgba(255,255,255,0.9)',
      tagBg: 'rgba(210,232,35,0.12)',
      tagBorder: 'rgba(210,232,35,0.3)',
      tagText: '#d2e823',
      priceColor: '#ffffff',
      priceSubColor: 'rgba(255,255,255,0.65)',
      featureOn: '#d2e823',
      featureOff: 'rgba(255,255,255,0.2)',
      featureOnText: 'rgba(255,255,255,0.9)',
      featureOffText: 'rgba(255,255,255,0.3)',
      divider: 'rgba(255,255,255,0.12)',
      btnBg: '#d2e823',
      btnText: '#000000',
      tryFree: 'rgba(210,232,35,0.45)',
      visualBg: 'rgba(255,255,255,0.04)',
      visualBorder: 'rgba(210,232,35,0.25)',
      visualIcon: '#d2e823',
    },
    team: {
      bg: '#780016',
      eyebrow: 'rgba(233,192,233,0.65)',
      heading: '#e9c0e9',
      body: 'rgba(255,255,255,0.9)',
      tagBg: 'rgba(233,192,233,0.12)',
      tagBorder: 'rgba(233,192,233,0.3)',
      tagText: '#e9c0e9',
      priceColor: '#ffffff',
      priceSubColor: 'rgba(255,255,255,0.65)',
      featureOn: '#e9c0e9',
      featureOff: 'rgba(255,255,255,0.2)',
      featureOnText: 'rgba(255,255,255,0.9)',
      featureOffText: 'rgba(255,255,255,0.3)',
      divider: 'rgba(255,255,255,0.12)',
      btnBg: '#e9c0e9',
      btnText: '#000000',
      tryFree: 'rgba(233,192,233,0.45)',
      visualBg: 'rgba(255,255,255,0.04)',
      visualBorder: 'rgba(233,192,233,0.25)',
      visualIcon: '#e9c0e9',
    },
    business: {
      bg: '#e8efd6',
      eyebrow: '#1e2330',
      heading: '#254f1a',
      body: '#1e2330',
      tagBg: 'rgba(37,79,26,0.08)',
      tagBorder: 'rgba(37,79,26,0.2)',
      tagText: '#254f1a',
      priceColor: '#254f1a',
      priceSubColor: '#1e2330',
      featureOn: '#254f1a',
      featureOff: 'rgba(30,35,48,0.2)',
      featureOnText: '#1e2330',
      featureOffText: 'rgba(30,35,48,0.3)',
      divider: 'rgba(30,35,48,0.1)',
      btnBg: '#1e2330',
      btnText: '#ffffff',
      tryFree: '#1e2330',
      visualBg: 'rgba(255,255,255,0.5)',
      visualBorder: 'rgba(37,79,26,0.2)',
      visualIcon: '#254f1a',
    },
  };

  const c = CONFIGS[card.group] || CONFIGS.personal;
  const isEven = index % 2 === 1; // Team (index 1) → text left, visual right

  const illustrationMap = { personal: personalIllustration, team: teamIllustration, business: businessIllustration };
  const illustration = illustrationMap[card.group];

  const tiltAngles = { personal: -2, team: 2.5, business: -1.5 };
  const baseTilt = tiltAngles[card.group] || 0;

  const VisualArea = () => illustration ? (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        e.currentTarget.style.transform = `perspective(900px) rotateY(${x * 18}deg) rotateX(${-y * 14}deg) rotate(${baseTilt}deg) scale(1.03)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `rotate(${baseTilt}deg)`;
      }}
      style={{
        borderRadius: 20,
        minHeight: 460,
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.25s ease-out',
        willChange: 'transform',
        transform: `rotate(${baseTilt}deg)`,
        boxShadow: '10px 10px 0px rgba(0,0,0,0.07)',
      }}
    >
      <img
        src={illustration}
        alt="Illustration"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center top',
          display: 'block',
        }}
      />
    </div>
  ) : (
    <div style={{
      borderRadius: 20,
      minHeight: 460,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 12,
      background: c.visualBg,
      boxShadow: '10px 10px 0px rgba(0,0,0,0.07)',
    }}>
      <Sparkle size={52} color={c.visualIcon} style={{ opacity: 0.25 }} />
      <span style={{ fontSize: 13, color: c.visualIcon, opacity: 0.3, fontWeight: 500, letterSpacing: '0.04em' }}>
        Illustration coming soon
      </span>
    </div>
  );


  const TextArea = () => (
    <div>
      {/* Eyebrow */}
      <div style={{
        fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.14em', color: c.eyebrow, marginBottom: 18,
      }}>
        {card.label}
      </div>

      {/* Heading */}
      <h2 style={{
        fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
        fontSize: 'clamp(30px, 3.2vw, 50px)',
        fontWeight: 800,
        color: c.heading,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        marginBottom: 20,
      }}>
        {card.title}
      </h2>

      {/* Subtitle */}
      <p style={{ fontSize: 18, color: c.body, lineHeight: 1.65, marginBottom: 28, maxWidth: 420 }}>
        {card.subtitle}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
        {card.tags.map(tag => (
          <span key={tag} style={{
            background: c.tagBg,
            border: `0.5px solid ${c.tagBorder}`,
            borderRadius: 999, padding: '5px 14px',
            fontSize: 14, fontWeight: 500, color: c.tagText,
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: c.divider, marginBottom: 28 }} />

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 24 }}>
        <span style={{ fontSize: 42, fontWeight: 800, color: c.priceColor, lineHeight: 1 }}>
          {card.price}
        </span>
        <span style={{ fontSize: 16, color: c.priceSubColor }}>{card.priceSub}</span>
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
        {card.features.map((f, fi) => (
          <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle
              size={16}
              weight={f.included ? 'fill' : 'regular'}
              color={f.included ? c.featureOn : c.featureOff}
              style={{ flexShrink: 0 }}
            />
            <span style={{
              fontSize: 15,
              color: f.included ? c.featureOnText : c.featureOffText,
              textDecoration: f.included ? 'none' : 'line-through',
            }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={() => {
          localStorage.setItem('selectedGroup', card.group);
          localStorage.removeItem('selectedSubSegment');
          navigate('/auth');
        }}
        style={{
          background: c.btnBg, color: c.btnText,
          border: 'none', borderRadius: 999,
          padding: '16px 36px', fontSize: 16, fontWeight: 700,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        {card.cta}
        <ArrowRight size={16} weight="bold" />
      </button>
      <div style={{ marginTop: 12, fontSize: 13, color: c.priceSubColor }}>
        Free preview available · 5 participants
      </div>
    </div>
  );

  return (
    <section style={{ background: c.bg, padding: '100px 0' }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '0 64px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
      }}>
        {isEven ? (
          <><TextArea /><VisualArea /></>
        ) : (
          <><VisualArea /><TextArea /></>
        )}
      </div>
    </section>
  );
}

/* ── Segment Entry Card ── */
function SegmentCard({ card, navigate, delay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        localStorage.setItem('selectedGroup', card.group);
        localStorage.removeItem('selectedSubSegment');
        navigate('/auth');
      }}
      style={{
        background: '#ffffff',
        border: `0.5px solid ${hovered ? `rgba(${card.colorRgb},0.4)` : `rgba(${card.colorRgb},0.15)`}`,
        borderRadius: 16,
        padding: 28,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? `0 16px 48px rgba(${card.colorRgb},0.15)` : 'none',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        animationDelay: `${0.4 + delay}s`,
      }}
    >
      {/* Icon + label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 48, height: 48,
          background: `rgba(${card.colorRgb},0.12)`,
          border: `0.5px solid rgba(${card.colorRgb},0.2)`,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {card.icon}
        </div>
        <span style={{
          fontSize: 14, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: card.color,
          background: `rgba(${card.colorRgb},0.1)`,
          border: `0.5px solid rgba(${card.colorRgb},0.25)`,
          borderRadius: 9999,
          padding: '3px 10px',
        }}>
          {card.label}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
        fontSize: 20, fontWeight: 700, color: '#1e2330',
        lineHeight: 1.2,
      }}>
        {card.title}
      </h3>

      {/* Subtitle */}
      <p style={{ fontSize: 15, color: '#1e2330', lineHeight: 1.5 }}>
        {card.subtitle}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: '75%' }}>
        {card.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 15, fontWeight: 500,
            background: `rgba(${card.colorRgb},0.08)`,
            color: card.color,
            border: `0.5px solid rgba(${card.colorRgb},0.2)`,
            borderRadius: 9999,
            padding: '2px 8px',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#1e2330', lineHeight: 1 }}>
          {card.price}
        </span>
        {card.priceSub && (
          <span style={{ fontSize: 15, color: '#1e2330' }}>{card.priceSub}</span>
        )}
      </div>

      {/* Free preview note */}
      <div style={{ fontSize: 15, color: '#8a8a82', lineHeight: 1.4 }}>
        Free preview available · 5 participants
      </div>

      {/* Feature list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {card.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
              background: f.included ? `rgba(${card.colorRgb},0.15)` : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: f.included ? card.color : '#333',
              }} />
            </div>
            <span style={{
              fontSize: 14,
              color: f.included ? '#a1a1a1' : '#3a3a3a',
              textDecoration: f.included ? 'none' : 'line-through',
            }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button style={{
        marginTop: 4,
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: 44,
        borderRadius: 999,
        background: '#1e2330',
        color: '#fff',
        border: 'none',
        fontSize: 15, fontWeight: 600,
        cursor: 'pointer',
        transition: 'opacity 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        <span>{card.cta}</span>
        <ArrowRight size={14} weight="bold" />
      </button>

      {/* Ghost try free CTA */}
      <button
        onClick={e => { e.stopPropagation(); localStorage.setItem('selectedGroup', card.group); localStorage.removeItem('selectedSubSegment'); navigate('/auth'); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, color: '#1e2330',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          padding: '2px 0',
          fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#7a7a7a'}
        onMouseLeave={e => e.currentTarget.style.color = '#4a4a4a'}
      >
        or try free
        <ArrowRight size={11} weight="bold" />
      </button>
    </div>
  );
}

/* ── Testimonial Card ── */
function TestimonialCard({ testimonial }) {
  const [hovered, setHovered] = useState(false);
  const tierColors = {
    personal: { color: '#2665d6', rgb: '38,101,214',  label: 'Personal' },
    team:     { color: '#780016', rgb: '120,0,22',    label: 'Team'     },
    business: { color: '#254f1a', rgb: '37,79,26',    label: 'Business' },
  };
  const tc = tierColors[testimonial.tier];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'transparent',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 16,
        padding: 28,
        transition: 'all 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.12)' : 'none',
      }}
    >
      {/* Tier badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        background: `rgba(${tc.rgb},0.12)`,
        border: `0.5px solid rgba(${tc.rgb},0.3)`,
        borderRadius: 9999,
        padding: '3px 10px',
        fontSize: 15, fontWeight: 600, color: '#1e2330',
        marginBottom: 16,
      }}>
        {tc.label}
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={14} weight="fill" color={tc.color} />
        ))}
      </div>

      {/* Quote */}
      <p style={{
        fontSize: 18, color: '#1e2330', lineHeight: 1.65,
        marginBottom: 20, fontStyle: 'italic',
      }}>
        "{testimonial.quote}"
      </p>

      {/* Result callout */}
      <div style={{
        background: `rgba(${tc.rgb},0.08)`,
        border: `0.5px solid rgba(${tc.rgb},0.2)`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 14, color: '#1e2330', fontWeight: 600,
        marginBottom: 16,
      }}>
        {testimonial.result}
      </div>

      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36,
          background: `rgba(${tc.rgb},0.15)`,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, color: '#1e2330',
        }}>
          {testimonial.avatar}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1e2330' }}>{testimonial.name}</div>
          <div style={{ fontSize: 15, color: '#1e2330' }}>{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}

/* ── CTA Button ── */
function CtaButton({ btn, navigate }) {
  return (
    <button
      onClick={() => navigate(`/select/${btn.group}`)}
      className={`btn-primary btn-${btn.group} btn-xl`}
      style={{ color: btn.color }}
    >
      <span>{btn.label}</span>
      <ArrowRight size={16} weight="bold" style={{ position: 'relative', zIndex: 1 }} />
    </button>
  );
}
