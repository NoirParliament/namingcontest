import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Buildings, Users, Sparkle, ArrowRight, Trophy } from '@phosphor-icons/react';

const SEGMENT_CONFIG = [
  {
    group: 'business',
    icon: <Buildings size={28} weight="duotone" color="#eaef09" />,
    color: '#eaef09',
    colorRgb: '234,239,9',
    title: 'Name something that means business',
    subtitle: 'Your team has ideas. Structure the conversation.',
    tags: ['Company', 'Product', 'Project', 'Rebrand'],
    cta: 'Start Business Contest',
    creatorCta: "I'm organizing a naming contest",
    participantCta: 'I was invited to participate',
  },
  {
    group: 'team',
    icon: <Users size={28} weight="duotone" color="#8B5CF6" />,
    color: '#8B5CF6',
    colorRgb: '139,92,246',
    title: 'Give your whole group a voice',
    subtitle: "Give everyone a voice. Pick a name you'll all own.",
    tags: ['Sports Team', 'Band', 'Podcast', 'Gaming Group'],
    cta: 'Start Team Contest',
    creatorCta: "I'm organizing a naming contest",
    participantCta: 'I was invited to participate',
  },
  {
    group: 'personal',
    icon: <Sparkle size={28} weight="duotone" color="#10B981" />,
    color: '#10B981',
    colorRgb: '16,185,129',
    title: 'Let everyone weigh in. Make it official.',
    subtitle: "Let everyone vote. Pick the name you'll love.",
    tags: ['Baby Name', 'Pet Name', 'Home', 'Something Fun'],
    cta: 'Start Personal Contest',
    creatorCta: "I'm organizing this contest",
    participantCta: 'I was invited to vote / suggest',
  },
];

export default function SelectSegment() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
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
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28,
            background: '#eaef09',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trophy size={15} weight="bold" color="#000" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>NamingContest</span>
        </Link>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['Choose Type', 'Account', 'Sub-type', 'Brief'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: i === 0 ? '#eaef09' : 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700,
                  color: i === 0 ? '#000' : '#7a7a7a',
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === 0 ? '#fff' : '#7a7a7a', fontWeight: i === 0 ? 600 : 400 }}>
                  {step}
                </span>
              </div>
              {i < 3 && <div style={{ width: 20, height: 1, background: 'rgba(255,255,255,0.08)' }} />}
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
            color: '#7a7a7a', marginBottom: 10,
          }}>
            Step 1 of 4
          </div>
          <h1 style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            color: '#fff',
            marginBottom: 12,
          }}>
            What are you naming?
          </h1>
          <p style={{ fontSize: 15, color: '#a1a1a1', maxWidth: 440, margin: '0 auto', lineHeight: 1.65 }}>
            Choose your category — then tell us if you're organizing a contest or joining one as a participant
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(280px, 340px))',
          gap: 24,
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
        background: '#1a1a1a',
        border: `0.5px solid ${isHovered ? `rgba(${seg.colorRgb},0.4)` : 'rgba(255,255,255,0.1)'}`,
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
      {/* Icon */}
      <div style={{
        width: 48, height: 48,
        background: `rgba(${seg.colorRgb},0.12)`,
        border: `0.5px solid rgba(${seg.colorRgb},0.2)`,
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {seg.icon}
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 20, fontWeight: 700, color: '#fff',
        lineHeight: 1.2, margin: 0,
      }}>
        {seg.title}
      </h2>

      {/* Subtitle */}
      <p style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.5, margin: 0 }}>
        {seg.subtitle}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {seg.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 11, fontWeight: 500,
            background: `rgba(${seg.colorRgb},0.08)`,
            color: seg.color,
            border: `0.5px solid rgba(${seg.colorRgb},0.2)`,
            borderRadius: 9999,
            padding: '2px 8px',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <button className={`btn-primary btn-${seg.group}`} style={{
        marginTop: 4,
        width: '100%',
        justifyContent: 'center',
        height: 40,
        color: seg.color,
        fontSize: 13, fontWeight: 600,
      }}>
        <span>{seg.cta}</span>
        <ArrowRight size={14} weight="bold" style={{ position: 'relative', zIndex: 1 }} />
      </button>
    </div>
  );
}
