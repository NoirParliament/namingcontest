import { useState } from 'react';
import { PAYWALL_MOMENTS, PLAN_LABEL } from '../utils/paywallMoments';
import { getGroupTheme, LIGHT_THEME } from '../data/themeConfig';
import { SUB_LABELS } from '../utils/journey';

const SUB_SEGMENTS = {
  business: [
    { id: 'company-name', label: 'Company' },
    { id: 'product-name', label: 'Product' },
    { id: 'project-name', label: 'Project' },
    { id: 'rebrand', label: 'Rebrand' },
    { id: 'other-business', label: 'Other' },
  ],
  team: [
    { id: 'sports-team', label: 'Sports' },
    { id: 'band-music', label: 'Band' },
    { id: 'podcast-channel', label: 'Podcast' },
    { id: 'civic-school-nonprofit', label: 'Civic' },
    { id: 'gaming-group', label: 'Gaming' },
    { id: 'other-team', label: 'Other' },
  ],
  personal: [
    { id: 'baby-name', label: 'Baby' },
    { id: 'pet-name', label: 'Pet' },
    { id: 'home-property-fun', label: 'Home' },
  ],
};

// ── Upgrade Card ──────────────────────────────────────────────────────────────
function UpgradeCard({ moment, group }) {
  const [clicked, setClicked] = useState(false);
  const groupTc = getGroupTheme(group || 'business');
  const color = groupTc.primary, rgb = groupTc.primaryRgb, tc = groupTc.btnText;
  const ctaLabel = moment.retroactive
    ? `Pay once — unlock this report`
    : `Upgrade for ${moment.price} →`;

  return (
    <div style={{
      background: '#fff', border: `1px solid rgba(${rgb},0.25)`,
      borderRadius: 12, padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9, flexShrink: 0,
          background: `rgba(${rgb},0.12)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>🔒</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e2330', marginBottom: 6, lineHeight: 1.4 }}>
            {moment.headline}
          </div>
          <div style={{ fontSize: 12, color: '#676b5f', lineHeight: 1.65, marginBottom: 14 }}>
            {moment.subtext}
          </div>
          {clicked ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 16px', borderRadius: 8,
              background: 'rgba(253,199,0,0.1)', border: '1px solid rgba(253,199,0,0.3)',
              color: '#d2e823', fontSize: 12, fontWeight: 700,
            }}>
              ✓ Upgraded — contest unlocked! (simulated)
            </div>
          ) : (
            <button
              onClick={() => setClicked(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 8, border: 'none',
                background: color, color: tc, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mockup: Toggle Gate ───────────────────────────────────────────────────────
function ToggleGateMockup({ group }) {
  const { primary: color, primaryRgb: rgb } = getGroupTheme(group || 'business');
  return (
    <div>
      <div style={breadcrumb}>Brief Builder — Submission Mode</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ padding: 16, borderRadius: 10, border: `2px solid ${color}`, background: `rgba(${rgb},0.06)` }}>
          <div style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>✓ Selected (Free)</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e2330', marginBottom: 4 }}>Voting Only</div>
          <div style={{ fontSize: 11, color: '#676b5f', lineHeight: 1.5 }}>You pre-load the names. Participants vote on your list.</div>
        </div>
        <div style={{ padding: 16, borderRadius: 10, border: '1px solid rgba(30,35,48,0.08)', background: '#f5f5f0', position: 'relative', opacity: 0.65 }}>
          <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, background: 'rgba(30,35,48,0.06)', color: '#8a8a82', padding: '1px 6px', borderRadius: 3, fontWeight: 700 }}>🔒 PAID</div>
          <div style={{ fontSize: 10, color: '#8a8a82', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Open Submissions</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#8a8a82', marginBottom: 4 }}>Let group suggest names</div>
          <div style={{ fontSize: 11, color: '#a1a1a1', lineHeight: 1.5 }}>Participants submit their own name ideas for everyone to vote on.</div>
        </div>
      </div>
    </div>
  );
}

// ── Mockup: Cap Gate ──────────────────────────────────────────────────────────
function CapGateMockup({ moment, group }) {
  const { primary: color, primaryRgb: rgb } = getGroupTheme(group || 'business');
  const fakeNames = ['Sarah Chen', 'Marcus Lee', 'Priya Patel', 'Jordan Webb', 'Alex Kim'];
  return (
    <div>
      <div style={breadcrumb}>Invite Participants — {moment.capNumber} of {moment.capNumber} (free limit)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
        {fakeNames.slice(0, moment.capNumber).map((name, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fff', border: '0.5px solid rgba(30,35,48,0.08)', borderRadius: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: `rgba(${rgb},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color, fontWeight: 700, flexShrink: 0 }}>
              {name[0]}
            </div>
            <span style={{ fontSize: 12, color: '#1e2330', flex: 1 }}>{name}</span>
            <span style={{ fontSize: 10, color }}>✓ Invited</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: `1px dashed rgba(${rgb},0.3)`, borderRadius: 8, background: `rgba(${rgb},0.04)` }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(30,35,48,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🔒</div>
          <span style={{ fontSize: 12, color: '#8a8a82' }}>Add more participants — upgrade required</span>
        </div>
      </div>
    </div>
  );
}

// ── Mockup: Method Gate ───────────────────────────────────────────────────────
function MethodGateMockup({ group }) {
  const { primary: color, primaryRgb: rgb } = getGroupTheme(group || 'business');
  const methods = [
    { label: 'Simple Majority', desc: 'Most votes wins', free: true, icon: '◉' },
    { label: 'Ranked Choice', desc: 'Rank names 1 to 5', free: false, icon: '⑤' },
    { label: 'Pairwise', desc: 'Head-to-head battles', free: false, icon: '⚔' },
    { label: 'Multi-Criteria', desc: 'Score across dimensions', free: false, icon: '◈' },
  ];
  return (
    <div>
      <div style={breadcrumb}>Contest Type Selection — Voting Method</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {methods.map((m, i) => (
          <div key={i} style={{ padding: '14px', borderRadius: 10, border: m.free ? `1.5px solid ${color}` : '0.5px solid rgba(30,35,48,0.08)', background: m.free ? `rgba(${rgb},0.06)` : '#f5f5f0', opacity: m.free ? 1 : 0.6, position: 'relative' }}>
            {!m.free && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, background: 'rgba(30,35,48,0.06)', color: '#8a8a82', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>🔒 PAID</div>}
            {m.free && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, background: `rgba(${rgb},0.15)`, color, padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>FREE</div>}
            <div style={{ fontSize: 20, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: m.free ? '#1e2330' : '#8a8a82', marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: '#8a8a82' }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mockup: PDF Gate ──────────────────────────────────────────────────────────
function PdfGateMockup({ moment, group }) {
  return (
    <div>
      <div style={breadcrumb}>Results Page {moment.retroactive ? '— Contest Closed' : '— Active Contest'}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px', background: '#fff', border: '0.5px solid rgba(30,35,48,0.08)', borderRadius: 12, marginBottom: 20 }}>
        <div style={{ width: 72, height: 90, background: '#f5f5f0', border: '0.5px solid rgba(30,35,48,0.08)', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 22 }}>📄</div>
          <div style={{ fontSize: 7, color: '#8a8a82', marginTop: 3, textAlign: 'center', padding: '0 4px' }}>Contest Report</div>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔒</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e2330', marginBottom: 5 }}>
            {moment.retroactive ? 'Contest Report — Closed 2 days ago' : 'Contest Report — Updating live'}
          </div>
          <div style={{ fontSize: 11, color: '#676b5f', marginBottom: 12 }}>
            {moment.retroactive ? '47 submissions · 18 participants · Contest complete' : '47 submissions · 5 days remaining'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '0.5px solid rgba(30,35,48,0.1)', borderRadius: 8, background: '#f5f5f0', color: '#8a8a82', fontSize: 11, fontWeight: 600, width: 'fit-content' }}>
            🔒 Download PDF Report
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mockup: Articles Gate ─────────────────────────────────────────────────────
function ArticlesGateMockup() {
  const titles = [
    'Why Names Matter More Than You Think',
    'The Five Types of Brand Names',
    "Catchword's 10 Criteria for Great Names",
  ];
  return (
    <div>
      <div style={breadcrumb}>Participant Education — Naming Methodology</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, opacity: 0.55 }}>
        {titles.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#fff', border: '0.5px solid rgba(30,35,48,0.07)', borderRadius: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f0f0eb', border: '1px solid rgba(30,35,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0 }}>🔒</div>
            <div>
              <div style={{ fontSize: 12, color: '#8a8a82', fontWeight: 600 }}>{t}</div>
              <div style={{ fontSize: 10, color: '#a1a1a1', marginTop: 1 }}>3–4 min read · Quiz included · +% quality</div>
            </div>
          </div>
        ))}
        <div style={{ padding: '10px 14px', background: 'rgba(30,35,48,0.02)', border: '0.5px dashed rgba(30,35,48,0.08)', borderRadius: 8, fontSize: 11, color: '#8a8a82', textAlign: 'center' }}>
          🔒 Contest quality score — locked on free tier
        </div>
      </div>
    </div>
  );
}

// ── Mockup: Reminders Gate ────────────────────────────────────────────────────
function RemindersGateMockup() {
  const items = [
    { label: '3 days before deadline', sub: 'Sent to participants who haven\'t submitted yet' },
    { label: '1 day before deadline', sub: 'Final nudge — highest open rate' },
    { label: 'Voting opens', sub: 'Notifies all participants when voting phase begins' },
  ];
  return (
    <div>
      <div style={breadcrumb}>Brief Builder — Automated Reminders</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, opacity: 0.55 }}>
        {items.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: '#fff', border: '0.5px solid rgba(30,35,48,0.07)', borderRadius: 8 }}>
            <div style={{ fontSize: 16 }}>🔒</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#8a8a82', fontWeight: 600 }}>{r.label}</div>
              <div style={{ fontSize: 10, color: '#a1a1a1', marginTop: 1 }}>{r.sub}</div>
            </div>
            <div style={{ width: 34, height: 18, background: '#e8e8e2', borderRadius: 9, border: '1px solid rgba(30,35,48,0.1)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mockup: Branding Gate ─────────────────────────────────────────────────────
function BrandingGateMockup({ group }) {
  const { primary: color, primaryRgb: rgb } = getGroupTheme(group || 'business');
  return (
    <div>
      <div style={breadcrumb}>PDF Report — Page Footer</div>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.1)', marginBottom: 20 }}>
        <div style={{ padding: '18px 22px', background: '#fff' }}>
          <div style={{ height: 9, background: '#e5e5e5', borderRadius: 3, marginBottom: 7, width: '55%' }} />
          <div style={{ height: 7, background: '#f0f0f0', borderRadius: 3, marginBottom: 5, width: '78%' }} />
          <div style={{ height: 7, background: '#f0f0f0', borderRadius: 3, marginBottom: 5, width: '65%' }} />
          <div style={{ height: 7, background: '#f0f0f0', borderRadius: 3, width: '45%' }} />
        </div>
        <div style={{ padding: '11px 22px', background: '#fafafa', borderTop: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 10, color: '#bbb', fontStyle: 'italic' }}>Contest Report · {new Date().toLocaleDateString()}</div>
          <div style={{ fontSize: 10, color: '#888', padding: '2px 8px', background: `rgba(${rgb},0.12)`, border: `1px solid rgba(${rgb},0.35)`, borderRadius: 4 }}>
            Powered by NamingContest.com
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#7a7a7a', display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color }}>↑</span> This footer appears on all free-tier output. Any paid plan removes it.
      </div>
    </div>
  );
}

// ── Mockup: Quality Gate ──────────────────────────────────────────────────────
function QualityGateMockup({ group }) {
  const { primary: color, primaryRgb: rgb } = getGroupTheme(group || 'business');
  return (
    <div>
      <div style={breadcrumb}>Brief Builder & ContestLive — Quality Score Sidebar</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {/* BriefBuilder sidebar mockup */}
        <div style={{ padding: '14px 16px', background: '#fff', border: '0.5px solid rgba(30,35,48,0.08)', borderRadius: 10, opacity: 0.55 }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a8a82', marginBottom: 8 }}>
            🔒 Contest Quality — locked on free
          </div>
          <div style={{ position: 'relative', height: 7, borderRadius: 3, background: '#f0f0eb', border: '0.5px solid rgba(30,35,48,0.1)', marginBottom: 6 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '38%', background: '#deded8', borderRadius: 3 }} />
            <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1.5, background: 'rgba(30,35,48,0.1)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#a1a1a1' }}>
            <span>Your setup: 0/50</span>
            <span>Participants: 0/50</span>
          </div>
        </div>
        {/* What it looks like paid */}
        <div style={{ padding: '14px 16px', background: '#fafaf5', border: `0.5px solid rgba(${rgb},0.2)`, borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: 8 }}>
            Contest Quality — paid preview
          </div>
          <div style={{ position: 'relative', height: 7, borderRadius: 3, background: '#f0f0eb', marginBottom: 6 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '34%', background: color, opacity: 0.6, borderRadius: 3 }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: '28%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
            <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1.5, background: 'rgba(255,255,255,0.2)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#555' }}>
            <span>Creator: <span style={{ color, fontWeight: 700 }}>34/50</span></span>
            <span>Participants: <span style={{ color, fontWeight: 700 }}>28/50</span></span>
          </div>
          <div style={{ fontSize: 9, color: '#8a8a82', marginTop: 6 }}>Live score · updates as participants engage</div>
        </div>
      </div>
    </div>
  );
}

// ── Shared breadcrumb style ───────────────────────────────────────────────────
const breadcrumb = {
  fontSize: 10, color: '#8a8a82', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.07em', marginBottom: 14,
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function PaywallSimulator({ group, onClose }) {
  const [selected, setSelected] = useState(0);
  const [activeGroup, setActiveGroup] = useState(group || 'business');
  const [activeSub, setActiveSub] = useState(SUB_SEGMENTS[group || 'business'][0].id);
  const tc = getGroupTheme(activeGroup);
  const moments = PAYWALL_MOMENTS[activeGroup] || PAYWALL_MOMENTS.business;
  const moment  = moments[selected];
  const color   = tc.primary;
  const rgb     = tc.primaryRgb;
  const label   = PLAN_LABEL[activeGroup];

  function renderMockup() {
    switch (moment.type) {
      case 'toggle-gate':    return <ToggleGateMockup group={activeGroup} />;
      case 'cap-gate':       return <CapGateMockup moment={moment} group={activeGroup} />;
      case 'method-gate':    return <MethodGateMockup group={activeGroup} />;
      case 'pdf-gate':       return <PdfGateMockup moment={moment} group={activeGroup} />;
      case 'articles-gate':  return <ArticlesGateMockup />;
      case 'branding-gate':  return <BrandingGateMockup group={activeGroup} />;
      case 'reminders-gate': return <RemindersGateMockup />;
      case 'quality-gate':   return <QualityGateMockup group={activeGroup} />;
      default: return null;
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)', zIndex: 99998 }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '92vw', maxWidth: 840, maxHeight: '88vh',
        background: '#fafaf5', border: `0.5px solid rgba(${rgb},0.25)`,
        borderRadius: 16, boxShadow: `0 0 0 1px rgba(${rgb},0.08), 0 24px 80px rgba(0,0,0,0.85)`,
        display: 'flex', flexDirection: 'column',
        zIndex: 99999, overflow: 'hidden', fontFamily: 'Inter, sans-serif',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#fff', borderBottom: `0.5px solid rgba(${rgb},0.18)`, flexShrink: 0 }}>
          <div style={{ padding: '3px 8px', borderRadius: 5, background: `rgba(${rgb},0.14)`, color, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            * Paywall Simulation
          </div>
          <div style={{ fontSize: 12, color: '#676b5f' }}>
            {SUB_LABELS[activeSub] || label} · {moments.length} upgrade moments
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
            {[
              { id: 'personal', label: 'Personal', c: '#2665d6' },
              { id: 'team', label: 'Group', c: '#780016' },
              { id: 'business', label: 'Business', c: '#254f1a' },
            ].map(seg => (
              <button key={seg.id} onClick={() => { setActiveGroup(seg.id); setActiveSub(SUB_SEGMENTS[seg.id][0].id); setSelected(0); }} style={{
                padding: '4px 10px', borderRadius: 4, border: 'none',
                background: activeGroup === seg.id ? seg.c : 'rgba(30,35,48,0.05)',
                color: activeGroup === seg.id ? '#fff' : '#676b5f',
                fontSize: 10, fontWeight: 700, cursor: 'pointer',
              }}>
                {seg.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ width: 26, height: 26, borderRadius: 5, border: 'none', background: 'rgba(30,35,48,0.06)', color: '#676b5f', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        {/* Sub-segment selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 18px', background: '#f5f5f0', borderBottom: '0.5px solid rgba(30,35,48,0.07)', flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: '#8a8a82', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>Segment:</span>
          {SUB_SEGMENTS[activeGroup].map(s => (
            <button key={s.id} onClick={() => setActiveSub(s.id)} style={{
              padding: '2px 8px', borderRadius: 3, border: 'none',
              background: activeSub === s.id ? `rgba(${rgb},0.15)` : 'transparent',
              color: activeSub === s.id ? color : '#8a8a82',
              fontSize: 10, fontWeight: activeSub === s.id ? 700 : 500, cursor: 'pointer',
            }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left: moment list */}
          <div style={{ width: 196, borderRight: '0.5px solid rgba(30,35,48,0.07)', overflowY: 'auto', background: '#f5f5f0', flexShrink: 0 }}>
            <div style={{ padding: '10px 14px 6px', fontSize: 9, color: '#8a8a82', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Upgrade Moments
            </div>
            {moments.map((m, i) => (
              <button key={m.id} onClick={() => setSelected(i)} style={{
                width: '100%', padding: '9px 14px', background: selected === i ? `rgba(${rgb},0.07)` : 'transparent',
                border: 'none', borderLeft: `2px solid ${selected === i ? color : 'transparent'}`,
                textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: selected === i ? color : '#8a8a82', background: selected === i ? `rgba(${rgb},0.15)` : '#e8e8e2', padding: '1px 5px', borderRadius: 3 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: selected === i ? '#1e2330' : '#676b5f' }}>{m.title}</span>
                </div>
                <div style={{ fontSize: 9, color: '#a1a1a1', paddingLeft: 24 }}>{m.where}</div>
              </button>
            ))}
          </div>

          {/* Right: mockup + upgrade card */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
            {/* Context */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#8a8a82', marginBottom: 18 }}>
              <span>{SUB_LABELS[activeSub] || label}</span><span>›</span>
              <span>{moment.where}</span><span>›</span>
              <span style={{ color: '#676b5f' }}>{moment.trigger}</span>
            </div>

            {renderMockup()}
            <UpgradeCard moment={moment} group={activeGroup} />
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderTop: '0.5px solid rgba(30,35,48,0.07)', background: '#f5f5f0', flexShrink: 0 }}>
          <button onClick={() => setSelected(i => Math.max(0, i - 1))} disabled={selected === 0} style={{ padding: '6px 12px', borderRadius: 6, border: '0.5px solid rgba(30,35,48,0.1)', background: 'transparent', color: selected === 0 ? '#c8c8c0' : '#676b5f', fontSize: 11, fontWeight: 600, cursor: selected === 0 ? 'default' : 'pointer' }}>
            ← Prev
          </button>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 5 }}>
            {moments.map((_, i) => (
              <button key={i} onClick={() => setSelected(i)} style={{ width: selected === i ? 18 : 5, height: 5, borderRadius: 3, border: 'none', background: selected === i ? color : '#d0d0c8', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
            ))}
          </div>
          <button onClick={() => setSelected(i => Math.min(moments.length - 1, i + 1))} disabled={selected >= moments.length - 1} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: selected >= moments.length - 1 ? '#e8e8e2' : color, color: selected >= moments.length - 1 ? '#a1a1a1' : tc.btnText, fontSize: 11, fontWeight: 700, cursor: selected >= moments.length - 1 ? 'default' : 'pointer' }}>
            Next →
          </button>
        </div>
      </div>
    </>
  );
}
