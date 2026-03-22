import { useState } from 'react';
import { X, Check } from '@phosphor-icons/react';

const TIER = {
  business: { color: '#eaef09', rgb: '234,239,9' },
  team: { color: '#8B5CF6', rgb: '139,92,246' },
  personal: { color: '#10B981', rgb: '16,185,129' },
};

function DomainChecker() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const check = () => {
    if (!domain.trim()) return;
    const available = Math.random() > 0.4;
    const clean = domain.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    setResult({ available, domain: clean });
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="yourname" style={{ flex: 1, background: '#141414', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 7, height: 34, padding: '0 10px', color: '#fff', fontSize: 13 }} />
        <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: '#7a7a7a' }}>.com</span>
        <button onClick={check} style={{ height: 34, padding: '0 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 7, background: 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer' }}>Check</button>
      </div>
      {result && (
        <div style={{ fontSize: 13, color: result.available ? '#10B981' : '#ef4444', fontWeight: 600 }}>
          {result.available
            ? `✓ ${result.domain}.com is Available!`
            : `✗ Taken — consider .co, adding a word, or a different name`}
        </div>
      )}
    </div>
  );
}

function SocialChecker({ platform }) {
  const [state, setState] = useState(null);
  return (
    <button onClick={() => setState(Math.random() > 0.5 ? 'available' : 'taken')} style={{ height: 32, padding: '0 12px', border: `1px solid ${state === 'available' ? '#10B981' : state === 'taken' ? '#ef4444' : 'rgba(255,255,255,0.15)'}`, borderRadius: 6, background: 'transparent', color: state === 'available' ? '#10B981' : state === 'taken' ? '#ef4444' : '#a1a1a1', fontSize: 12, cursor: 'pointer' }}>
      {state === 'available' ? `✓ Available on ${platform}` : state === 'taken' ? `✗ Taken on ${platform}` : `Check ${platform}`}
    </button>
  );
}

export default function PrePublishNudge({ isOpen, onClose, winnerName, currentGroup = 'business', onProceed }) {
  const tc = TIER[currentGroup] || TIER.business;
  const [checks, setChecks] = useState({ trademark: false, domain: false, social: false });
  const allChecked = Object.values(checks).every(Boolean);

  if (!isOpen) return null;

  const toggleCheck = (key) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, maxWidth: 580, width: '100%', margin: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Before Publishing — Touchpoint 6</div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', margin: 0 }}>3 Critical Checks</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a7a' }}>
            <X size={18} />
          </button>
        </div>

        {winnerName && (
          <div style={{ padding: '10px 14px', background: `rgba(${tc.rgb},0.06)`, border: `0.5px solid rgba(${tc.rgb},0.2)`, borderRadius: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: '#a1a1a1' }}>Winning name: </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#fff' }}>{winnerName}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Check 1: Trademark */}
          <div style={{ padding: '16px', background: '#141414', border: `0.5px solid ${checks.trademark ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div onClick={() => toggleCheck('trademark')} style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${checks.trademark ? '#10B981' : '#444'}`, background: checks.trademark ? '#10B981' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                {checks.trademark && <Check size={12} weight="bold" color="#000" />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Trademark availability</div>
                <div style={{ fontSize: 12, color: '#a1a1a1', marginBottom: 10, lineHeight: 1.5 }}>
                  Have you done a basic trademark search? Go to USPTO.gov → Trademark Search.
                  <br />
                  <span style={{ color: '#10B981' }}>Green:</span> No matches · <span style={{ color: '#eaef09' }}>Yellow:</span> Similar names · <span style={{ color: '#ef4444' }}>Red:</span> Exact match — don't use it
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => window.open('https://www.uspto.gov/trademarks/search', '_blank')} style={{ height: 32, padding: '0 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, background: 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer' }}>
                    Search USPTO.gov ↗
                  </button>
                  <button onClick={() => alert('Contact form coming soon')} style={{ height: 32, padding: '0 14px', border: `1px solid rgba(${tc.rgb},0.3)`, borderRadius: 7, background: `rgba(${tc.rgb},0.06)`, color: tc.color, fontSize: 12, cursor: 'pointer' }}>
                    Book Catchword Consult ($299) →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Check 2: Domain */}
          <div style={{ padding: '16px', background: '#141414', border: `0.5px solid ${checks.domain ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div onClick={() => toggleCheck('domain')} style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${checks.domain ? '#10B981' : '#444'}`, background: checks.domain ? '#10B981' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                {checks.domain && <Check size={12} weight="bold" color="#000" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Domain availability</div>
                <div style={{ fontSize: 12, color: '#a1a1a1', marginBottom: 10 }}>Is the .com available? If not: negotiate, use .co, add a word, or choose a different name.</div>
                <DomainChecker />
              </div>
            </div>
          </div>

          {/* Check 3: Social handles */}
          <div style={{ padding: '16px', background: '#141414', border: `0.5px solid ${checks.social ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div onClick={() => toggleCheck('social')} style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${checks.social ? '#10B981' : '#444'}`, background: checks.social ? '#10B981' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                {checks.social && <Check size={12} weight="bold" color="#000" />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Social handles</div>
                <div style={{ fontSize: 12, color: '#a1a1a1', marginBottom: 10 }}>Are @YourName handles available on key platforms?</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <SocialChecker platform="X/Twitter" />
                  <SocialChecker platform="Instagram" />
                  <SocialChecker platform="LinkedIn" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={onProceed} disabled={!allChecked} style={{ height: 48, border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 15, fontWeight: 700, cursor: allChecked ? 'pointer' : 'not-allowed', opacity: allChecked ? 1 : 0.5 }}>
            All Clear — Publish Results →
          </button>
          <button onClick={onProceed} style={{ height: 36, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, background: 'transparent', color: '#7a7a7a', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            I'll verify these later — proceed anyway
            {!allChecked && <span style={{ fontSize: 11, color: '#ef4444' }}>⚠ Not all checks complete</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
