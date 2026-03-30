import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import namicoIcon from '../assets/namico-icon.svg';
import { ArrowLeft, ArrowRight, CheckCircle } from '@phosphor-icons/react';
import { segments } from '../data/segments';
import { getGroupTheme, LIGHT_THEME } from '../data/themeConfig';

export default function SelectSubSegment() {
  const { group } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  const segmentData = segments[group];

  const tc = getGroupTheme(group);

  if (!segmentData) {
    return (
      <div style={{
        minHeight: '100vh', background: '#fafaf5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#676b5f', marginBottom: 16 }}>Group "{group}" not found.</p>
          <button onClick={() => navigate('/select')} style={{
            background: 'transparent', border: '1px solid rgba(30,35,48,0.2)',
            color: '#1e2330', borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
            ← Back to Select
          </button>
        </div>
      </div>
    );
  }

  const handleContinue = () => {
    if (!selected) return;
    localStorage.setItem('selectedGroup', group);
    localStorage.setItem('selectedSubSegment', selected);
    navigate(`/contest-type/${group}/${selected}`);
  };

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
        borderBottom: '0.5px solid rgba(30,35,48,0.08)',
        background: '#ffffff',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28,
            background: tc.primary,
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={namicoIcon} alt="Naming Contest" style={{ width: 20, height: 20, display: 'block', filter: 'brightness(0) invert(1)' }} />
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
                  background: i <= 2 ? tc.primary : 'rgba(30,35,48,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700,
                  color: i <= 2 ? '#fff' : '#8a8a82',
                }}>
                  {i < 2 ? <CheckCircle size={11} weight="fill" /> : i + 1}
                </div>
                <span style={{
                  fontSize: 11,
                  color: i === 2 ? '#1e2330' : i < 2 ? tc.primary : '#8a8a82',
                  fontWeight: i <= 2 ? 600 : 400,
                }}>
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
        maxWidth: 760,
        margin: '0 auto',
        padding: '56px 24px',
        width: '100%',
      }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/select')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none',
            color: '#8a8a82', fontSize: 13, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            marginBottom: 32,
            padding: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#1e2330'}
          onMouseLeave={e => e.currentTarget.style.color = '#8a8a82'}
        >
          <ArrowLeft size={14} weight="bold" />
          Back to segment types
        </button>

        {/* Headline */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: `rgba(${tc.primaryRgb},0.1)`,
            border: `0.5px solid rgba(${tc.primaryRgb},0.25)`,
            borderRadius: 9999,
            padding: '3px 12px',
            fontSize: 11, fontWeight: 600, color: tc.primary,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 16,
          }}>
            {tc.label} · Step 2 of 4
          </div>

          <h1 style={{
            fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800,
            color: '#1e2330',
            marginBottom: 10,
          }}>
            What specifically are you naming?
          </h1>
          <p style={{ fontSize: 15, color: '#676b5f', lineHeight: 1.5 }}>
            {segmentData.description}
          </p>
        </div>

        {/* Sub-segment radio cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {segmentData.subSegments.map(sub => {
            const isSelected = selected === sub.id;
            return (
              <SubSegmentCard
                key={sub.id}
                sub={sub}
                isSelected={isSelected}
                onClick={() => setSelected(sub.id)}
                tc={tc}
              />
            );
          })}
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!selected}
          style={{
            width: '100%',
            height: 52,
            background: selected ? tc.primary : 'rgba(30,35,48,0.1)',
            border: 'none',
            borderRadius: 12,
            color: selected ? '#ffffff' : '#8a8a82',
            fontSize: 15, fontWeight: 700,
            cursor: selected ? 'pointer' : 'not-allowed',
            fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
            opacity: selected ? 1 : 0.5,
          }}
        >
          Continue
          <ArrowRight size={16} weight="bold" />
        </button>

        {selected && (
          <p style={{
            textAlign: 'center', fontSize: 12, color: '#8a8a82',
            marginTop: 12,
          }}>
            You selected: <strong style={{ color: '#676b5f' }}>
              {segmentData.subSegments.find(s => s.id === selected)?.name}
            </strong>
          </p>
        )}
      </div>

    </div>
  );
}

function SubSegmentCard({ sub, isSelected, onClick, tc }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: isSelected
          ? `rgba(${tc.primaryRgb},0.06)`
          : hovered ? 'rgba(30,35,48,0.03)' : '#ffffff',
        border: `0.5px solid ${isSelected
          ? `rgba(${tc.primaryRgb},0.5)`
          : hovered ? 'rgba(30,35,48,0.15)' : 'rgba(30,35,48,0.1)'}`,
        borderRadius: 12,
        padding: '16px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      {/* Radio indicator */}
      <div style={{
        width: 20, height: 20,
        borderRadius: '50%',
        border: `2px solid ${isSelected ? tc.primary : 'rgba(30,35,48,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s',
      }}>
        {isSelected && (
          <div style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: tc.primary,
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: isSelected ? tc.primary : '#8a8a82',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {sub.code}
          </span>
          <span style={{
            fontSize: 15, fontWeight: 600,
            color: isSelected ? '#1e2330' : '#1e2330',
          }}>
            {sub.name}
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#8a8a82', lineHeight: 1.4 }}>
          {sub.description}
        </div>
      </div>

      {/* Selected check */}
      {isSelected && (
        <CheckCircle size={20} weight="fill" color={tc.primary} style={{ flexShrink: 0 }} />
      )}
    </div>
  );
}
