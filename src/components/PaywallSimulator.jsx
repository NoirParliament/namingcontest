import { useState } from 'react';
import { PAYWALL_MOMENTS, PLAN_LABEL } from '../utils/paywallMoments';

const GC = { business: '#eaef09', team: '#8B5CF6', personal: '#10B981' };
const GR = { business: '234,239,9', team: '139,92,246', personal: '16,185,129' };
const GT = { business: '#000', team: '#fff', personal: '#fff' };

// ── Upgrade Card ──────────────────────────────────────────────────────────────
function UpgradeCard({ moment, group }) {
  const [clicked, setClicked] = useState(false);
  const color = GC[group], rgb = GR[group], tc = GT[group];
  const ctaLabel = moment.retroactive
    ? `Pay once — unlock this report`
    : `Upgrade for ${moment.price} →`;

  return (
    <div style={{
      background: '#0d0d0d', border: `1px solid rgba(${rgb},0.25)`,
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
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.4 }}>
            {moment.headline}
          </div>
          <div style={{ fontSize: 12, color: '#7a7a7a', lineHeight: 1.65, marginBottom: 14 }}>
            {moment.subtext}
          </div>
          {clicked ? (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 16px', borderRadius: 8,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#10B981', fontSize: 12, fontWeight: 700,
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
  const color = GC[group], rgb = GR[group];
  return (
    <div>
      <div style={breadcrumb}>Brief Builder — Submission Mode</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ padding: 16, borderRadius: 10, border: `2px solid ${color}`, background: `rgba(${rgb},0.06)` }}>
          <div style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>✓ Selected (Free)</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Voting Only</div>
          <div style={{ fontSize: 11, color: '#7a7a7a', lineHeight: 1.5 }}>You pre-load the names. Participants vote on your list.</div>
        </div>
        <div style={{ padding: 16, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: '#0f0f0f', position: 'relative', opacity: 0.65 }}>
          <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, background: 'rgba(255,255,255,0.07)', color: '#555', padding: '1px 6px', borderRadius: 3, fontWeight: 700 }}>🔒 PAID</div>
          <div style={{ fontSize: 10, color: '#444', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase' }}>Open Submissions</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#444', marginBottom: 4 }}>Let group suggest names</div>
          <div style={{ fontSize: 11, color: '#333', lineHeight: 1.5 }}>Participants submit their own name ideas for everyone to vote on.</div>
        </div>
      </div>
    </div>
  );
}

// ── Mockup: Cap Gate ──────────────────────────────────────────────────────────
function CapGateMockup({ moment, group }) {
  const color = GC[group], rgb = GR[group];
  const fakeNames = ['Sarah Chen', 'Marcus Lee', 'Priya Patel', 'Jordan Webb', 'Alex Kim'];
  return (
    <div>
      <div style={breadcrumb}>Invite Participants — {moment.capNumber} of {moment.capNumber} (free limit)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
        {fakeNames.slice(0, moment.capNumber).map((name, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: `rgba(${rgb},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color, fontWeight: 700, flexShrink: 0 }}>
              {name[0]}
            </div>
            <span style={{ fontSize: 12, color: '#fff', flex: 1 }}>{name}</span>
            <span style={{ fontSize: 10, color: '#10B981' }}>✓ Invited</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: `1px dashed rgba(${rgb},0.3)`, borderRadius: 8, background: `rgba(${rgb},0.04)` }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🔒</div>
          <span style={{ fontSize: 12, color: '#555' }}>Add more participants — upgrade required</span>
        </div>
      </div>
    </div>
  );
}

// ── Mockup: Method Gate ───────────────────────────────────────────────────────
function MethodGateMockup({ group }) {
  const color = GC[group], rgb = GR[group];
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
          <div key={i} style={{ padding: '14px', borderRadius: 10, border: m.free ? `1.5px solid ${color}` : '0.5px solid rgba(255,255,255,0.07)', background: m.free ? `rgba(${rgb},0.06)` : '#0f0f0f', opacity: m.free ? 1 : 0.6, position: 'relative' }}>
            {!m.free && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, background: 'rgba(255,255,255,0.06)', color: '#555', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>🔒 PAID</div>}
            {m.free && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, background: `rgba(${rgb},0.15)`, color, padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>FREE</div>}
            <div style={{ fontSize: 20, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: m.free ? '#fff' : '#555', marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: '#444' }}>{m.desc}</div>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, marginBottom: 20 }}>
        <div style={{ width: 72, height: 90, background: '#0f0f0f', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
          <div style={{ fontSize: 22 }}>📄</div>
          <div style={{ fontSize: 7, color: '#444', marginTop: 3, textAlign: 'center', padding: '0 4px' }}>Contest Report</div>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔒</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 5 }}>
            {moment.retroactive ? 'Contest Report — Closed 2 days ago' : 'Contest Report — Updating live'}
          </div>
          <div style={{ fontSize: 11, color: '#7a7a7a', marginBottom: 12 }}>
            {moment.retroactive ? '47 submissions · 18 participants · Contest complete' : '47 submissions · 5 days remaining'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, background: '#141414', color: '#555', fontSize: 11, fontWeight: 600, width: 'fit-content' }}>
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
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#222', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0 }}>🔒</div>
            <div>
              <div style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>{t}</div>
              <div style={{ fontSize: 10, color: '#333', marginTop: 1 }}>3–4 min read · Quiz included · +% quality</div>
            </div>
          </div>
        ))}
        <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '0.5px dashed rgba(255,255,255,0.07)', borderRadius: 8, fontSize: 11, color: '#444', textAlign: 'center' }}>
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
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
            <div style={{ fontSize: 16 }}>🔒</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>{r.label}</div>
              <div style={{ fontSize: 10, color: '#333', marginTop: 1 }}>{r.sub}</div>
            </div>
            <div style={{ width: 34, height: 18, background: '#222', borderRadius: 9, border: '1px solid #333' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mockup: Branding Gate ─────────────────────────────────────────────────────
function BrandingGateMockup({ group }) {
  const color = GC[group], rgb = GR[group];
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
            Powered by Namico.com
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
  const color = GC[group], rgb = GR[group];
  return (
    <div>
      <div style={breadcrumb}>Brief Builder & ContestLive — Quality Score Sidebar</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {/* BriefBuilder sidebar mockup */}
        <div style={{ padding: '14px 16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, opacity: 0.55 }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#444', marginBottom: 8 }}>
            🔒 Contest Quality — locked on free
          </div>
          <div style={{ position: 'relative', height: 7, borderRadius: 3, background: '#1a1a1a', border: '0.5px solid #222', marginBottom: 6 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '38%', background: '#2a2a2a', borderRadius: 3 }} />
            <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1.5, background: 'rgba(255,255,255,0.08)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#333' }}>
            <span>Your setup: 0/50</span>
            <span>Participants: 0/50</span>
          </div>
        </div>
        {/* What it looks like paid */}
        <div style={{ padding: '14px 16px', background: '#111', border: `0.5px solid rgba(${rgb},0.2)`, borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: 8 }}>
            Contest Quality — paid preview
          </div>
          <div style={{ position: 'relative', height: 7, borderRadius: 3, background: '#1e1e1e', marginBottom: 6 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '34%', background: color, opacity: 0.6, borderRadius: 3 }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: '28%', background: color, borderRadius: 3, transition: 'width 0.4s' }} />
            <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1.5, background: 'rgba(255,255,255,0.2)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#555' }}>
            <span>Creator: <span style={{ color, fontWeight: 700 }}>34/50</span></span>
            <span>Participants: <span style={{ color, fontWeight: 700 }}>28/50</span></span>
          </div>
          <div style={{ fontSize: 9, color: '#383838', marginTop: 6 }}>Live score · updates as participants engage</div>
        </div>
      </div>
    </div>
  );
}

// ── Shared breadcrumb style ───────────────────────────────────────────────────
const breadcrumb = {
  fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.07em', marginBottom: 14,
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function PaywallSimulator({ group, onClose }) {
  const [selected, setSelected] = useState(0);
  const moments = PAYWALL_MOMENTS[group] || PAYWALL_MOMENTS.business;
  const moment  = moments[selected];
  const color   = GC[group];
  const rgb     = GR[group];
  const label   = PLAN_LABEL[group];

  function renderMockup() {
    switch (moment.type) {
      case 'toggle-gate':    return <ToggleGateMockup group={group} />;
      case 'cap-gate':       return <CapGateMockup moment={moment} group={group} />;
      case 'method-gate':    return <MethodGateMockup group={group} />;
      case 'pdf-gate':       return <PdfGateMockup moment={moment} group={group} />;
      case 'articles-gate':  return <ArticlesGateMockup />;
      case 'branding-gate':  return <BrandingGateMockup group={group} />;
      case 'reminders-gate': return <RemindersGateMockup />;
      case 'quality-gate':   return <QualityGateMockup group={group} />;
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
        background: '#141414', border: `0.5px solid rgba(${rgb},0.25)`,
        borderRadius: 16, boxShadow: `0 0 0 1px rgba(${rgb},0.08), 0 24px 80px rgba(0,0,0,0.85)`,
        display: 'flex', flexDirection: 'column',
        zIndex: 99999, overflow: 'hidden', fontFamily: 'Inter, sans-serif',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#1c1c1c', borderBottom: `0.5px solid rgba(${rgb},0.18)`, flexShrink: 0 }}>
          <div style={{ padding: '3px 8px', borderRadius: 5, background: `rgba(${rgb},0.14)`, color, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            * Paywall Simulation
          </div>
          <div style={{ fontSize: 12, color: '#555' }}>
            {label} · {moments.length} upgrade moments
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', width: 26, height: 26, borderRadius: 5, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#666', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left: moment list */}
          <div style={{ width: 196, borderRight: '0.5px solid rgba(255,255,255,0.05)', overflowY: 'auto', background: '#0f0f0f', flexShrink: 0 }}>
            <div style={{ padding: '10px 14px 6px', fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Upgrade Moments
            </div>
            {moments.map((m, i) => (
              <button key={m.id} onClick={() => setSelected(i)} style={{
                width: '100%', padding: '9px 14px', background: selected === i ? `rgba(${rgb},0.07)` : 'transparent',
                border: 'none', borderLeft: `2px solid ${selected === i ? color : 'transparent'}`,
                textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: selected === i ? color : '#383838', background: selected === i ? `rgba(${rgb},0.15)` : '#1a1a1a', padding: '1px 5px', borderRadius: 3 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: selected === i ? '#fff' : '#4a4a4a' }}>{m.title}</span>
                </div>
                <div style={{ fontSize: 9, color: '#333', paddingLeft: 24 }}>{m.where}</div>
              </button>
            ))}
          </div>

          {/* Right: mockup + upgrade card */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
            {/* Context */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#444', marginBottom: 18 }}>
              <span>{label}</span><span>›</span>
              <span>{moment.where}</span><span>›</span>
              <span style={{ color: '#666' }}>{moment.trigger}</span>
            </div>

            {renderMockup()}
            <UpgradeCard moment={moment} group={group} />
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderTop: '0.5px solid rgba(255,255,255,0.05)', background: '#0f0f0f', flexShrink: 0 }}>
          <button onClick={() => setSelected(i => Math.max(0, i - 1))} disabled={selected === 0} style={{ padding: '6px 12px', borderRadius: 6, border: '0.5px solid rgba(255,255,255,0.07)', background: 'transparent', color: selected === 0 ? '#2a2a2a' : '#666', fontSize: 11, fontWeight: 600, cursor: selected === 0 ? 'default' : 'pointer' }}>
            ← Prev
          </button>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 5 }}>
            {moments.map((_, i) => (
              <button key={i} onClick={() => setSelected(i)} style={{ width: selected === i ? 18 : 5, height: 5, borderRadius: 3, border: 'none', background: selected === i ? color : '#2a2a2a', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
            ))}
          </div>
          <button onClick={() => setSelected(i => Math.min(moments.length - 1, i + 1))} disabled={selected >= moments.length - 1} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: selected >= moments.length - 1 ? '#1a1a1a' : color, color: selected >= moments.length - 1 ? '#333' : GT[group], fontSize: 11, fontWeight: 700, cursor: selected >= moments.length - 1 ? 'default' : 'pointer' }}>
            Next →
          </button>
        </div>
      </div>
    </>
  );
}
