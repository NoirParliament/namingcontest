import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import namicoIcon from '../assets/namico-icon.svg';
import {
  Trophy, Users, Lightbulb, CheckCircle, ArrowRight,
  Target, Envelope, Star, Plus, Minus, Buildings,
  MusicNote, Baby, House, ChartBar, Certificate,
  Confetti, WarningCircle, ShieldCheck, Shuffle,
  ClipboardText, SpeakerSlash, Ruler, Scales, X, Sparkle,
} from '@phosphor-icons/react';
import { platformStats, testimonials, faqData, howItWorksSteps, almostNames, methodologyItems } from '../data/mockData';
import HeroCardStream from '../components/HeroCardStream';

/* ── Glassmorphism Navbar ── */
function Navbar() {
  const navigate = useNavigate();
  return (
    <div style={{ position: 'sticky', top: 16, zIndex: 1000, padding: '0 24px' }}>
      <nav style={{
        background: 'rgba(20,20,20,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32,
            background: '#eaef09',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={namicoIcon} alt="Namico" style={{ width: 24, height: 24, display: 'block' }} />
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff' }}>
            NamingContest
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['How It Works', 'Examples', 'Pricing'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ color: '#a1a1a1', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = '#a1a1a1'}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Wireframe Flow Testing — hidden from public nav, kept for internal use */}
          <button onClick={() => navigate('/wireframe')} style={{ display: 'none' }}>
            Wireframe Flow Testing
          </button>
          <button onClick={() => navigate('/auth')} style={{
            background: 'none', border: 'none', color: '#a1a1a1',
            fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '0 8px',
          }}>
            Sign In
          </button>
          <button onClick={() => navigate('/select')} className="btn-primary btn-neutral">
            Get Started
          </button>
        </div>
      </nav>
    </div>
  );
}

/* ── Count-up Hook ── */
function useCountUp(target, duration = 2000, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, shouldStart]);
  return count;
}

/* ── Stats Section ── */
function StatsSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const contests = useCountUp(12847, 2000, visible);
  const participants = useCountUp(47392, 2200, visible);
  const success = useCountUp(89, 1500, visible);

  const stats = [
    { value: contests.toLocaleString(), label: 'Contests Run', color: '#eaef09' },
    { value: participants.toLocaleString(), label: 'Participants Reached', color: '#8B5CF6' },
    { value: `${success}%`, label: 'Success Rate', color: '#10B981' },
    { value: '4.8/5.0', label: 'Average Rating', color: '#ffffff' },
  ];

  return (
    <section ref={ref} style={{ background: '#141414', padding: '80px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              animation: visible ? `fadeUp 0.6s ease ${i * 0.15}s both` : 'none',
            }}>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 48,
                fontWeight: 800,
                color: stat.color,
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 14, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Accordion ── */
function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {items.map(item => (
        <div key={item.id} style={{ borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
          <button
            onClick={() => setOpen(open === item.id ? null : item.id)}
            style={{
              width: '100%', background: 'none', border: 'none',
              padding: '20px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              color: '#1C1917', fontSize: 16, fontWeight: 600,
              fontFamily: 'Inter, sans-serif', cursor: 'pointer', textAlign: 'left',
              gap: 16,
            }}
          >
            <span>{item.question}</span>
            {open === item.id
              ? <Minus size={18} weight="bold" style={{ color: '#eaef09', flexShrink: 0 }} />
              : <Plus size={18} weight="bold" style={{ color: '#a1a1a1', flexShrink: 0 }} />
            }
          </button>
          <div style={{
            overflow: 'hidden',
            maxHeight: open === item.id ? 300 : 0,
            transition: 'max-height 0.35s ease',
            paddingBottom: open === item.id ? 20 : 0,
          }}>
            <p style={{ fontSize: 15, color: '#78716C', lineHeight: 1.7 }}>{item.answer}</p>
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
            fontFamily: 'Inter, sans-serif',
            fontSize: 26, fontWeight: 700, color: '#0a0a0a',
            marginBottom: 8, textAlign: 'center',
          }}>
            {item.brand}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(16,185,129,0.1)',
            border: '0.5px solid rgba(16,185,129,0.3)',
            borderRadius: 9999,
            padding: '2px 10px',
            fontSize: 11, color: '#10B981',
          }}>
            <CheckCircle size={10} weight="fill" /> Winner
          </div>
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0,
          background: '#f5f2ee',
          border: '0.5px solid rgba(0,0,0,0.08)',
          borderRadius: 12,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          padding: 14,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#999', marginBottom: 6 }}>
            Almost named...
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
            {item.rejected.slice(0, 3).map(r => (
              <div key={r} style={{ fontSize: 12, color: '#444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <X size={10} weight="bold" style={{ flexShrink: 0, opacity: 0.4 }} /> {r}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: '#888', lineHeight: 1.4 }}>
            {item.context.substring(0, 80)}...
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
    { label: 'Free',     color: '#7a7a7a' },
    { label: 'Personal', color: '#10B981' },
    { label: 'Team',     color: '#8B5CF6' },
    { label: 'Business', color: '#A89000' },
  ];

  const sections = [
    {
      label: 'Participants',
      rows: [
        { feature: 'Participant cap', free: '5', personal: 'Up to 30', team: 'Up to 60', business: 'Up to 300' },
        { feature: 'Participant invite flow', free: '✓', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Anonymous submissions', free: '✓', personal: '✓', team: '✓', business: '✓' },
      ],
    },
    {
      label: 'Methodology & Quality',
      rows: [
        { feature: 'Naming methodology articles', free: '—', personal: '✓', team: '✓', business: '✓' },
        { feature: 'Article quizzes', free: '—', personal: '✓', team: '✓', business: '✓' },
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
        { feature: 'Manual or auto voting transition', free: '✓', personal: '✓', team: '✓', business: '✓' },
      ],
    },
  ];

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '0.5px solid rgba(0,0,0,0.08)' }}>
      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(4, 1fr)', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '12px 16px', fontSize: 10, color: '#999', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Feature</div>
        {cols.map((c, i) => (
          <div key={i} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 11, fontWeight: 800, color: c.color, borderLeft: '0.5px solid rgba(0,0,0,0.05)', letterSpacing: '0.03em' }}>
            {c.label}
          </div>
        ))}
      </div>

      {sections.map((section, si) => (
        <div key={si} style={{ borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
          {/* Section label */}
          <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.03)', fontSize: 12, fontWeight: 700, color: '#1C1917', borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
            {section.label}
          </div>
          {section.rows.map((row, ri) => {
            const vals = [row.free, row.personal, row.team, row.business];
            return (
              <div key={ri} style={{ display: 'grid', gridTemplateColumns: '200px repeat(4, 1fr)', background: ri % 2 === 1 ? 'rgba(0,0,0,0.02)' : '#fff' }}>
                <div style={{ padding: '9px 16px 9px 24px', fontSize: 12, color: '#4a4a4a', display: 'flex', alignItems: 'center' }}>{row.feature}</div>
                {vals.map((v, vi) => (
                  <div key={vi} style={{ padding: '9px 8px', textAlign: 'center', fontSize: 12, borderLeft: '0.5px solid rgba(0,0,0,0.04)', fontWeight: v === '—' ? 400 : 600, color: v === '✓' ? cols[vi].color : v === '—' ? '#ccc' : '#4a4a4a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

  const segmentCards = [
    {
      group: 'personal',
      label: 'Personal',
      icon: <Baby size={28} weight="duotone" color="#10B981" />,
      title: 'Let everyone weigh in. Make it official.',
      subtitle: "Let everyone vote. Pick the name you'll love.",
      color: '#10B981',
      colorRgb: '16,185,129',
      tags: ['Baby Name', 'Pet Name', 'Home', 'Something Fun'],
      cta: 'Start Personal Contest',
      price: '$9',
      priceSub: 'per contest',
      features: [
        { label: 'Up to 30 participants', included: true },
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
      icon: <Users size={28} weight="duotone" color="#8B5CF6" />,
      title: 'Give your whole group a voice',
      subtitle: "Give everyone a voice. Pick a name you'll all own.",
      color: '#8B5CF6',
      colorRgb: '139,92,246',
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
      icon: <Buildings size={28} weight="duotone" color="#eaef09" />,
      title: 'Name something that means business',
      subtitle: 'Your team has ideas. Structure the conversation.',
      color: '#eaef09',
      colorRgb: '234,239,9',
      tags: ['Company', 'Product', 'Project', 'Rebrand'],
      cta: 'Start Business Contest',
      price: '$89',
      priceSub: 'per contest',
      features: [
        { label: 'Up to 300 participants', included: true },
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
    <Target size={28} weight="duotone" color="#57534E" />,
    <ClipboardText size={28} weight="duotone" color="#57534E" />,
    <Envelope size={28} weight="duotone" color="#57534E" />,
    <Lightbulb size={28} weight="duotone" color="#57534E" />,
    <CheckCircle size={28} weight="duotone" color="#57534E" />,
  ];

  const methodIcons = [
    <SpeakerSlash size={28} weight="duotone" color="#fff" />,
    <Ruler size={28} weight="duotone" color="#fff" />,
    <Scales size={28} weight="duotone" color="#fff" />,
  ];

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero Section ── */}
      <section style={{
        position: 'relative',
        background: '#0a0a0a',
        padding: '80px 0 0',
        overflow: 'hidden',
      }}>
        {/* Radial glow */}
        <div style={{
          position: 'absolute',
          top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 400,
          background: 'radial-gradient(ellipse, rgba(234,239,9,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Eyebrow */}
          <div style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: '#eaef09', marginBottom: 24,
            animation: 'fadeUp 0.6s ease both',
          }}>
            Powered by Catchword, the world's leading naming firm
          </div>

          {/* H1 */}
          <h1 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(40px, 6vw, 70px)',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth: 900,
            margin: '0 auto 24px',
            animation: 'fadeUp 0.7s ease 0.1s both',
          }}>
            Name things together<br />
            <em style={{ color: '#eaef09', fontStyle: 'italic' }}>with Namico</em>
          </h1>

          {/* Subheadline */}
          <p style={{
            fontSize: 18,
            color: '#a1a1a1',
            maxWidth: 520,
            margin: '0 auto 0',
            lineHeight: 1.6,
            animation: 'fadeUp 0.7s ease 0.2s both',
          }}>
            The only personal naming assistant built on 25 years of naming methodology
          </p>
        </div>

        {/* Card stream animation — full width, inside hero */}
        <HeroCardStream />
      </section>

      {/* ── Segment Entry Cards ── */}
      <section style={{ background: '#f5f2ee', padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#999', marginBottom: 12,
            }}>
              Start Your Contest
            </div>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#0a0a0a',
              marginBottom: 16,
              lineHeight: 1.15,
            }}>
              Pick what you're naming.<br />We'll handle the rest.
            </h2>
            <p style={{ fontSize: 16, color: '#444', maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
              Business brands, team identities, or personal milestones — every great name deserves a structured process and a fair vote.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 28,
            maxWidth: 1200,
            margin: '0 auto',
          }}>
            {segmentCards.map((card, i) => (
              <SegmentCard key={card.group} card={card} navigate={navigate} delay={i * 0.1} />
            ))}
          </div>

          {/* Full feature breakdown — expandable */}
          <FeatureBreakdown />
        </div>
      </section>

      {/* ── Stats ── */}
      <StatsSection />

      {/* ── Success Stories ── */}
      <section style={{ background: '#FBF8F3', padding: '80px 0' }} id="examples">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#7a7a7a', marginBottom: 12,
            }}>
              Real Results
            </div>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#1C1917',
              marginBottom: 12,
            }}>
              Names chosen together. Owned by everyone.
            </h2>
            <p style={{ fontSize: 16, color: '#78716C', maxWidth: 480, margin: '0 auto' }}>
              From startups to family milestones, NamingContest delivers clear results.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {testimonials.map(t => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ background: '#F8F7F2', padding: '8px 0 40px' }} id="how-it-works">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
            position: 'relative',
          }}>
            {howItWorksSteps.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                {/* Connecting line */}
                {i < 4 && (
                  <div style={{
                    position: 'absolute',
                    top: 24, left: '60%',
                    width: '80%', height: 1,
                    borderTop: '1px dashed rgba(0,0,0,0.12)',
                    zIndex: 0,
                  }} />
                )}

                {/* Step number badge */}
                <div style={{
                  width: 48, height: 48,
                  background: '#fff',
                  border: '0.5px solid rgba(0,0,0,0.12)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 13, fontWeight: 700, color: '#1C1917',
                  position: 'relative', zIndex: 1,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}>
                  {step.number}
                </div>

                <div style={{ marginBottom: 12 }}>{stepIcons[i]}</div>

                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1C1917', marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contest Quality System ── */}
      <section style={{ background: '#141414', padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#8B5CF6', marginBottom: 12,
            }}>
              Shared Accountability
            </div>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#fff',
              marginBottom: 16,
              lineHeight: 1.15,
            }}>
              Great names take two sides.
              <br />
              <span style={{ color: '#eaef09' }}>Track your half of the work.</span>
            </h2>
            <p style={{ fontSize: 16, color: '#a1a1a1', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Every contest has a 100-point quality score split evenly between the creator and participants. The better both sides prepare, the better the names you'll get.
            </p>
          </div>

          {/* Visual quality bar demo */}
          <div style={{
            maxWidth: 1200,
            margin: '0 auto 64px',
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '36px 40px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                Contest Quality Score
              </div>
              <div style={{
                fontSize: 12, fontWeight: 600,
                background: 'rgba(139,92,246,0.15)',
                border: '0.5px solid rgba(139,92,246,0.3)',
                borderRadius: 99, padding: '3px 12px',
                color: '#8B5CF6',
              }}>
                Strong · 78/100
              </div>
            </div>

            {/* The split bar */}
            <div style={{ position: 'relative', height: 12, borderRadius: 6, background: '#1e1e1e', marginBottom: 10 }}>
              {/* Creator fill - 38/50 */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: '38%',
                background: 'linear-gradient(90deg, #eaef09aa, #eaef09)',
                borderRadius: '6px 0 0 6px',
              }} />
              {/* Participant fill - 40/50, starts at midpoint */}
              <div style={{
                position: 'absolute', left: '50%', top: 0, bottom: 0,
                width: '40%',
                background: 'linear-gradient(90deg, #8B5CF6aa, #8B5CF6)',
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

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7a7a7a', marginBottom: 28 }}>
              <span style={{ color: '#eaef09cc' }}>◀ Creator's half · 38/50</span>
              <span style={{ color: '#7a7a7a' }}>|</span>
              <span style={{ color: '#8B5CF6cc' }}>Participants' half · 40/50 ▶</span>
            </div>

            {/* Two-column explanation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                {
                  color: '#eaef09',
                  label: 'Creator (0–50)',
                  items: ['Complete all brief fields', 'Read the naming primer', 'Set submission rules & deadline'],
                  note: 'Done before anyone else joins.',
                },
                {
                  color: '#8B5CF6',
                  label: 'Participants (0–50)',
                  items: ['Read naming methodology articles', 'Submit quality name ideas', 'Earn naming points through feedback'],
                  note: 'Crowd effort, tracked live.',
                },
              ].map((col, i) => (
                <div key={i} style={{
                  background: '#0a0a0a',
                  border: `0.5px solid ${col.color}33`,
                  borderRadius: 12,
                  padding: '18px 20px',
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: col.color, marginBottom: 14,
                  }}>
                    {col.label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {col.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: col.color, opacity: 0.7,
                          marginTop: 5, flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    fontSize: 11, color: '#555',
                    borderTop: '0.5px solid rgba(255,255,255,0.06)',
                    paddingTop: 10,
                  }}>
                    {col.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Three callout cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                icon: <ChartBar size={26} weight="duotone" color="#eaef09" />,
                title: 'See it in your dashboard',
                desc: 'Every contest shows its split score — creator prep on the left, participant effort on the right. Know instantly which side needs work.',
              },
              {
                icon: <Users size={26} weight="duotone" color="#8B5CF6" />,
                title: 'Participants see your half',
                desc: 'When someone joins your contest they can see how much you prepared as creator. A high creator score signals a serious, well-run contest.',
              },
              {
                icon: <Certificate size={26} weight="duotone" color="#10B981" />,
                title: 'Quality predicts results',
                desc: 'Contests scoring 80+ consistently produce stronger shortlists. Both sides matter — don\'t leave points on the table.',
              },
            ].map((card, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '28px 24px',
              }}>
                <div style={{ marginBottom: 16 }}>{card.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: 13, color: '#7a7a7a', lineHeight: 1.6 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Almost Names Flip Widget ── */}
      <section style={{ background: '#fbf8f3', padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              color: '#0a0a0a',
              marginBottom: 12,
            }}>
              Every great name almost wasn't.
            </h2>
            <p style={{ fontSize: 16, color: '#555', maxWidth: 540, margin: '0 auto' }}>
              Here are the names that almost became the world's most iconic brands.
              <br />
              <em style={{ color: '#888', fontSize: 14 }}>Hover each card to reveal the alternatives.</em>
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 48,
          }}>
            {almostNames.map(item => (
              <FlipCard key={item.id} item={item} />
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/select')}
              className="btn-primary btn-lg btn-neutral"
              style={{ background: '#0a0a0a' }}
            >
              <span>Don't let that happen to you</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Methodology ── */}
      <section style={{ background: '#141414', padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 800,
              color: '#fff',
              marginBottom: 12,
            }}>
              Why Naming Contests Usually Fail<br />(And How We Fix It)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {methodologyItems.map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                borderRadius: 16,
                padding: 28,
              }}>
                <div style={{ marginBottom: 16 }}>{methodIcons[i]}</div>
                <div style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: '#EF4444',
                  marginBottom: 6,
                }}>
                  The Problem
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                  "{item.problem}"
                </h3>
                <p style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 20, lineHeight: 1.5 }}>
                  {item.problemDetail}
                </p>
                <div style={{
                  height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 20,
                }} />
                <div style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: '#10B981',
                  marginBottom: 6,
                }}>
                  Our Fix
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                  {item.solution}
                </h4>
                <p style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.5 }}>
                  {item.solutionDetail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: '#FAFAF7', padding: '80px 0' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(26px, 4vw, 40px)',
              fontWeight: 800,
              color: '#1C1917',
            }}>
              Frequently Asked Questions
            </h2>
          </div>
          <Accordion items={faqData} />
        </div>
      </section>

      {/* ── Newsletter ── */}
      <NewsletterSection />

      {/* ── Footer ── */}
      <footer style={{
        background: '#141414',
        borderTop: '0.5px solid rgba(255,255,255,0.08)',
        padding: '40px 0',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 24,
        }}>
          {/* Logo + tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 24, height: 24, background: '#eaef09', borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Trophy size={13} weight="bold" color="#000" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>NamingContest</span>
            </div>
            <div style={{ fontSize: 12, color: '#7a7a7a' }}>Powered by Catchword, the world's leading naming firm</div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Examples', href: '#examples' },
              { label: 'Dashboard', to: '/dashboard' },
            ].map(link => (
              link.to
                ? <Link key={link.label} to={link.to} style={{ fontSize: 13, color: '#7a7a7a', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#a1a1a1'}
                  onMouseLeave={e => e.target.style.color = '#7a7a7a'}
                >
                  {link.label}
                </Link>
                : <a key={link.label} href={link.href} style={{ fontSize: 13, color: '#7a7a7a', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#a1a1a1'}
                  onMouseLeave={e => e.target.style.color = '#7a7a7a'}
                >
                  {link.label}
                </a>
            ))}
          </div>

          {/* Copyright */}
          <div style={{ fontSize: 12, color: '#7a7a7a' }}>
            © 2026 NamingContest.com
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
      background: 'linear-gradient(180deg, #0a0a0a 0%, #141414 100%)',
      padding: '100px 0',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>

        {/* Eyebrow */}
        <div style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: '#eaef09', marginBottom: 20,
        }}>
          Stay in the loop
        </div>

        {/* Heading */}
        <h2 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(24px, 3vw, 34px)',
          fontWeight: 800, color: '#fff',
          marginBottom: 12, lineHeight: 1.15,
          whiteSpace: 'nowrap',
        }}>
          Naming tips straight to your inbox.
        </h2>

        <p style={{ fontSize: 15, color: '#7a7a7a', marginBottom: 8, lineHeight: 1.6 }}>
          Platform updates, naming methodology, and real contest examples.
        </p>

        {/* Social proof */}
        <p style={{ fontSize: 12, color: '#4a4a4a', marginBottom: 36 }}>
          Join 2,400+ naming enthusiasts
        </p>

        {status === 'success' ? (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(16,185,129,0.1)',
            border: '0.5px solid rgba(16,185,129,0.3)',
            borderRadius: 12, padding: '16px 28px',
            fontSize: 15, fontWeight: 600, color: '#10B981',
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
                  background: '#141414',
                  border: `0.5px solid ${status === 'error' ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 10, padding: '0 16px',
                  color: '#fff', fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(234,239,9,0.5)'}
                onBlur={e => e.target.style.borderColor = status === 'error' ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                className={`btn-primary btn-business${status === 'loading' ? ' btn-disabled' : ''}`}
                style={{
                  background: '#eaef09',
                  height: 48, padding: '0 24px',
                  flexShrink: 0,
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
                    <span style={{ color: '#000' }}>Subscribe</span>
                    <ArrowRight size={14} weight="bold" style={{ color: '#000', position: 'relative', zIndex: 1 }} />
                  </>
                )}
              </button>
            </form>

            <p style={{
              fontSize: 12, marginTop: 8,
              color: status === 'error' ? '#ef4444' : 'transparent',
              transition: 'color 0.2s',
            }}>
              Please enter a valid email address.
            </p>

            <p style={{ fontSize: 11, color: '#3a3a3a', marginTop: 16 }}>
              No spam. Unsubscribe anytime.
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
            border: '0.5px solid rgba(0,0,0,0.15)',
            borderRadius: 9999,
            padding: '10px 22px',
            fontSize: 13, fontWeight: 600, color: '#4a4a4a',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
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
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, fontWeight: 700, color: '#1C1917', margin: 0 }}>
            Everything included, plan by plan
          </h3>
        </div>
        <PricingFeatureTable />
      </div>
    </div>
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
        navigate('/auth');
      }}
      style={{
        background: '#1a1a1a',
        border: `0.5px solid ${hovered ? `rgba(${card.colorRgb},0.4)` : 'rgba(255,255,255,0.1)'}`,
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
          fontSize: 10, fontWeight: 700,
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
        fontFamily: 'Inter, sans-serif',
        fontSize: 20, fontWeight: 700, color: '#fff',
        lineHeight: 1.2,
      }}>
        {card.title}
      </h3>

      {/* Subtitle */}
      <p style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.5 }}>
        {card.subtitle}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {card.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 11, fontWeight: 500,
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
        <span style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
          {card.price}
        </span>
        {card.priceSub && (
          <span style={{ fontSize: 11, color: '#7a7a7a' }}>{card.priceSub}</span>
        )}
      </div>

      {/* Free preview note */}
      <div style={{ fontSize: 11, color: '#4a4a4a', lineHeight: 1.4 }}>
        Free preview available · 5 participants · voting only
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
              fontSize: 12,
              color: f.included ? '#a1a1a1' : '#3a3a3a',
              textDecoration: f.included ? 'none' : 'line-through',
            }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA — uses btn-primary CSS class for ripple animation */}
      <button className={`btn-primary btn-${card.group}`} style={{
        marginTop: 4,
        width: '100%',
        justifyContent: 'center',
        height: 40,
        color: card.color,
        fontSize: 13, fontWeight: 600,
      }}>
        <span>{card.cta}</span>
        <ArrowRight size={14} weight="bold" style={{ position: 'relative', zIndex: 1 }} />
      </button>

      {/* Ghost try free CTA */}
      <button
        onClick={e => { e.stopPropagation(); localStorage.setItem('selectedGroup', card.group); navigate('/auth'); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 12, color: '#4a4a4a',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          padding: '2px 0',
          fontFamily: 'Inter, sans-serif',
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
    business: { color: '#eaef09', rgb: '234,239,9', label: 'Business' },
    team: { color: '#8B5CF6', rgb: '139,92,246', label: 'Team' },
    personal: { color: '#10B981', rgb: '16,185,129', label: 'Personal' },
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
        fontSize: 11, fontWeight: 600, color: tc.color,
        marginBottom: 16,
      }}>
        {tc.label}
      </div>

      {/* Stars */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={14} weight="fill" color="#f59e0b" />
        ))}
      </div>

      {/* Quote */}
      <p style={{
        fontSize: 15, color: '#292524', lineHeight: 1.65,
        marginBottom: 20, fontStyle: 'italic',
      }}>
        "{testimonial.quote}"
      </p>

      {/* Result callout */}
      <div style={{
        background: `rgba(${tc.rgb},0.06)`,
        border: `0.5px solid rgba(${tc.rgb},0.15)`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12, color: tc.color, fontWeight: 600,
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
          fontSize: 12, fontWeight: 700, color: tc.color,
        }}>
          {testimonial.avatar}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>{testimonial.name}</div>
          <div style={{ fontSize: 11, color: '#78716C' }}>{testimonial.role}</div>
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
