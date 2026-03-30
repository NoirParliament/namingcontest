import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GROUP_THEME, LIGHT_THEME, getGroupTheme } from '../data/themeConfig';
import namicoIcon from '../assets/namico-icon.svg';
import { Buildings, Users, Baby, ArrowRight, CheckCircle, X } from '@phosphor-icons/react';

const SEGMENT_CONFIG = [
  {
    group: 'personal',
    label: 'Personal',
    icon: <Baby size={28} weight="duotone" color="#2665d6" />,
    color: '#2665d6',
    colorRgb: '38,101,214',
    title: 'No opinions are too many',
    subtitle: 'Invite the people whose opinion matters',
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
    icon: <Users size={28} weight="duotone" color="#780016" />,
    color: '#780016',
    colorRgb: '120,0,22',
    title: 'Let the squad decide',
    subtitle: 'From group chat chaos to a name everyone reps',
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
    color: '#254f1a',
    colorRgb: '37,79,26',
    title: 'Naming is a business decision',
    subtitle: 'Structured naming with real methodology',
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

export default function SelectSegment() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafaf5',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        borderBottom: '0.5px solid rgba(30,35,48,0.08)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28,
            background: '#d2e823',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={namicoIcon} alt="NamingContest" style={{ width: 20, height: 20, display: 'block' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1e2330' }}>NamingContest</span>
        </Link>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['Choose Type', 'Account', 'Sub-type', 'Brief'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: i === 0 ? '#1e2330' : 'rgba(30,35,48,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700,
                  color: i === 0 ? '#ffffff' : '#8a8a82',
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === 0 ? '#1e2330' : '#8a8a82', fontWeight: i === 0 ? 600 : 400 }}>
                  {step}
                </span>
              </div>
              {i < 3 && <div style={{ width: 20, height: 1, background: 'rgba(30,35,48,0.08)' }} />}
            </div>
          ))}
        </div>

        <div style={{ width: 130 }} />
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontSize: 10, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: '#8a8a82', marginBottom: 10,
          }}>
            Step 1 of 4
          </div>
          <h1 style={{
            fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            color: '#1e2330',
            marginBottom: 12,
          }}>
            What are you naming?
          </h1>
          <p style={{ fontSize: 15, color: '#676b5f', maxWidth: 440, margin: '0 auto', lineHeight: 1.65 }}>
            Choose your category — then tell us if you're organizing a contest or joining one as a participant
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 28,
          maxWidth: 1200,
          width: '100%',
        }}>
          {SEGMENT_CONFIG.map(seg => (
            <SegmentCard
              key={seg.group}
              seg={seg}
              isHovered={hovered === seg.group}
              onHover={() => setHovered(seg.group)}
              onLeave={() => setHovered(null)}
              onClick={() => {
                localStorage.setItem('selectedGroup', seg.group);
                localStorage.removeItem('selectedSubSegment');
                navigate('/auth');
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
}

function SegmentCard({ seg, isHovered, onHover, onLeave, onClick }) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{
        background: '#ffffff',
        border: `0.5px solid ${isHovered ? `rgba(${seg.colorRgb},0.4)` : 'rgba(30,35,48,0.1)'}`,
        borderRadius: 16,
        padding: 28,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 16px 48px rgba(${seg.colorRgb},0.15)` : 'none',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Icon + Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 48, height: 48,
          background: `rgba(${seg.colorRgb},0.12)`,
          border: `0.5px solid rgba(${seg.colorRgb},0.2)`,
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {seg.icon}
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: seg.color, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '3px 10px', background: `rgba(${seg.colorRgb},0.1)`, border: `0.5px solid rgba(${seg.colorRgb},0.25)`, borderRadius: 20 }}>
          {seg.label}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif", fontSize: 20, fontWeight: 700, color: '#1e2330', lineHeight: 1.2, margin: 0 }}>
        {seg.title}
      </h3>

      {/* Subtitle */}
      <p style={{ fontSize: 13, color: '#676b5f', lineHeight: 1.5, margin: 0 }}>{seg.subtitle}</p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: '75%' }}>
        {seg.tags.map(tag => (
          <span key={tag} style={{ fontSize: 11, fontWeight: 500, background: `rgba(${seg.colorRgb},0.08)`, color: seg.color, border: `0.5px solid rgba(${seg.colorRgb},0.2)`, borderRadius: 9999, padding: '2px 8px' }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(30,35,48,0.07)', margin: '4px 0' }} />

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#1e2330', lineHeight: 1 }}>{seg.price}</span>
        <span style={{ fontSize: 11, color: '#8a8a82' }}>{seg.priceSub}</span>
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {seg.features.map(f => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: f.included ? '#676b5f' : '#c0c0b8' }}>
            {f.included
              ? <CheckCircle size={14} weight="fill" color={seg.color} />
              : <X size={14} color="#c0c0b8" />
            }
            <span style={{ textDecoration: f.included ? 'none' : 'line-through' }}>{f.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button style={{
        marginTop: 4, width: '100%', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        border: 'none', borderRadius: 10,
        background: seg.color, color: '#ffffff',
        fontSize: 13, fontWeight: 700, cursor: 'pointer',
      }}>
        {seg.cta} <ArrowRight size={14} weight="bold" />
      </button>
    </div>
  );
}
