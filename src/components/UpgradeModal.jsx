import { useState } from 'react';
import { X, Check } from '@phosphor-icons/react';

const TIER = {
  business: { color: '#eaef09', rgb: '234,239,9', textColor: '#000' },
  team: { color: '#8B5CF6', rgb: '139,92,246', textColor: '#fff' },
  personal: { color: '#10B981', rgb: '16,185,129', textColor: '#fff' },
};

const TRIGGER_MESSAGES = {
  participants: {
    business: 'Free tier allows up to 3 participants',
    team: 'Free tier allows up to 5 participants',
    personal: 'Free tier allows up to 5 participants',
  },
};

const TABLE_ROWS = [
  { feature: 'Participants', free: '5', standard: '25', professional: 'Unlimited' },
  { feature: 'Voting Methods', free: '1', standard: '3', professional: 'All 5' },
  { feature: 'Export', free: '—', standard: 'CSV', professional: 'CSV + PDF' },
  { feature: 'Multi-Round', free: '—', standard: '2 rounds', professional: '3 rounds' },
  { feature: 'Price', free: '$0', standard: '$19/contest', professional: '$79/contest' },
];

export default function UpgradeModal({ isOpen, onClose, trigger = 'participants', currentGroup = 'business' }) {
  const tc = TIER[currentGroup] || TIER.business;
  const [purchased, setPurchased] = useState(null);

  if (!isOpen) return null;

  const triggerMsg = TRIGGER_MESSAGES[trigger]?.[currentGroup] || 'You\'ve reached the free tier limit';

  const handlePurchase = (tier) => {
    setPurchased(tier);
    setTimeout(() => {
      setPurchased(null);
      onClose();
    }, 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, maxWidth: 560, width: '100%' }}>
        {purchased ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: `rgba(${tc.rgb},0.12)`, border: `2px solid ${tc.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Check size={28} weight="bold" color={tc.color} />
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', marginBottom: 8 }}>Payment processed!</div>
            <div style={{ fontSize: 14, color: '#a1a1a1' }}>Contest upgraded to {purchased}.</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Free Tier Limit Reached</div>
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', margin: 0 }}>You've reached the free tier limit</h2>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a7a', marginTop: 2 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, fontSize: 13, color: '#a1a1a1', marginBottom: 24 }}>
              {triggerMsg}
            </div>

            {/* Comparison table */}
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.08)', marginBottom: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: '#141414' }}>
                {['Feature', 'Free', 'Standard', 'Professional'].map((h, i) => (
                  <div key={h} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: i === 0 ? '#7a7a7a' : i === 2 ? tc.color : '#a1a1a1', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '0.5px solid rgba(255,255,255,0.06)', textAlign: i > 0 ? 'center' : 'left' }}>
                    {h}
                  </div>
                ))}
              </div>
              {TABLE_ROWS.map((row, ri) => (
                <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: ri % 2 === 0 ? '#1a1a1a' : '#161616' }}>
                  <div style={{ padding: '10px 12px', fontSize: 13, color: '#fff', borderBottom: ri < TABLE_ROWS.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none', fontWeight: row.feature === 'Price' ? 700 : 400 }}>{row.feature}</div>
                  {[row.free, row.standard, row.professional].map((val, vi) => (
                    <div key={vi} style={{ padding: '10px 12px', fontSize: 12, color: val === '—' ? '#444' : vi === 1 ? tc.color : '#a1a1a1', textAlign: 'center', borderBottom: ri < TABLE_ROWS.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none', fontWeight: row.feature === 'Price' ? 700 : 400 }}>
                      {val}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => handlePurchase('Standard')} style={{ height: 48, border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Upgrade to Standard — $19
              </button>
              <button onClick={() => handlePurchase('Professional')} style={{ height: 44, border: `1px solid rgba(${tc.rgb},0.3)`, borderRadius: 10, background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Upgrade to Professional — $79
              </button>
              <button onClick={onClose} style={{ height: 36, border: 'none', background: 'transparent', color: '#7a7a7a', fontSize: 13, cursor: 'pointer' }}>
                Maybe later
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
