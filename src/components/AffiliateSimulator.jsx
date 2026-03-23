import { useState } from 'react';
import { AFFILIATE_MOMENTS, AFFILIATE_PLAN_LABEL } from '../utils/affiliateMoments';

const GC = { business: '#eaef09', team: '#8B5CF6', personal: '#10B981' };
const GR = { business: '234,239,9', team: '139,92,246', personal: '16,185,129' };
const GT = { business: '#000', team: '#fff', personal: '#fff' };

// All affiliate cards that appear in the Results Page per segment
const RESULTS_PAGE_AFFILIATES = {
  business: [
    { emoji: '*', partner: 'Namecheap', tag: 'Domain Registrar', headline: 'Claim your .com', body: 'Check availability now. .io, .co, .ai, and .net also checked automatically.', cta: 'Check on Namecheap →', accent: '#eaef09', accentText: '#000' },
    { emoji: '*', partner: 'USPTO (Free)', tag: 'Trademark Search', headline: 'Free trademark search', body: 'Search the USPTO database before you invest further. Free, takes 10 minutes.', cta: 'Search TESS (Free) →', accent: '#3b82f6', accentText: '#fff' },
    { emoji: '*', partner: 'LegalZoom', tag: 'Trademark Search', headline: 'Full clearance search', body: 'Professional search catches phonetic matches and design marks the free search misses.', cta: 'Full Search via LegalZoom →', accent: '#8B5CF6', accentText: '#fff' },
    { emoji: '*', partner: 'LegalZoom', tag: 'LLC Formation', headline: 'Make it a legal entity', body: 'File your LLC before someone else registers it. Handles paperwork in all 50 states.', cta: 'Form Your LLC →', accent: '#f97316', accentText: '#fff' },
    { emoji: '*', partner: 'Looka / 99designs', tag: 'Logo Design', headline: 'Get a logo to match', body: 'AI-fast (Looka), custom/premium (99designs), or budget (Fiverr). Coverage at every price point.', cta: 'Create on Looka →', accent: '#ec4899', accentText: '#fff' },
  ],
  team: [
    { emoji: '*', partner: 'Printful', tag: 'Custom Merchandise', headline: 'Make it official with merch.', body: 'Custom jerseys, hats, hoodies. No minimums. Ships in 3–5 days.', cta: 'Design team merch →', accent: '#8B5CF6', accentText: '#fff' },
    { emoji: '*', partner: '99designs', tag: 'Brand Design', headline: 'Every great team name needs a great logo.', body: 'Multiple concepts, unlimited revisions. Work with a dedicated designer.', cta: 'Get a team logo →', accent: '#ec4899', accentText: '#fff' },
    { emoji: '*', partner: 'Squarespace', tag: 'Website Builder', headline: "Claim your team's home online.", body: 'Schedules, roster, news. No coding required. Looks great on every device.', cta: 'Build your team site →', accent: '#3b82f6', accentText: '#fff' },
    { emoji: '*', partner: 'Namecheap', tag: 'Domain Registrar', headline: 'Secure your domain.', body: 'Lock in the domain for your new team name before someone else does.', cta: 'Check domain →', accent: '#8B5CF6', accentText: '#fff' },
  ],
  personal: [
    { emoji: '*', partner: 'Artifact Uprising', tag: 'Custom Cards & Prints', headline: 'Share the name with the world.', body: 'Premium birth announcement cards, printed and shipped. The name you chose together, beautifully presented.', cta: 'Design announcements →', accent: '#10B981', accentText: '#fff' },
    { emoji: '*', partner: 'Etsy', tag: 'Personalised Gifts', headline: 'Celebrate the name.', body: 'Personalised gifts featuring the chosen name — perfect for new babies, pets, or homes.', cta: 'Shop personalised gifts →', accent: '#f59e0b', accentText: '#fff' },
    { emoji: '*', partner: 'Chewy', tag: 'Pet Accessories', headline: 'Make it official for your pet.', body: 'Custom ID tags and personalised accessories engraved with your pet\'s new name. Fast shipping.', cta: 'Get a custom ID tag →', accent: '#10B981', accentText: '#fff' },
    { emoji: '*', partner: 'Namecheap', tag: 'Domain Registrar', headline: 'Claim the name online.', body: 'If you plan to create any presence around this name, grab the domain while it\'s available.', cta: 'Check on Namecheap →', accent: '#10B981', accentText: '#fff' },
  ],
};

const breadcrumb = {
  fontSize: 10, color: '#555', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.07em', marginBottom: 14,
};

// ── Mockups ────────────────────────────────────────────────────────────────────

function DomainCheckMockup({ moment, group }) {
  const color = GC[group], rgb = GR[group];
  const names = ['nova', 'creo', 'vela', 'kova'];
  const avail = [true, false, true, false];
  return (
    <div>
      <div style={breadcrumb}>{moment.where} — Domain Availability Widget</div>
      <div style={{ background: '#1a1a1a', border: `0.5px solid rgba(${rgb},0.2)`, borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
          🌐 Domain Availability — Powered by {moment.partner}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {names.map((n, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#141414', border: `0.5px solid ${avail[i] ? `rgba(${rgb},0.2)` : 'rgba(255,255,255,0.05)'}`, borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: avail[i] ? '#fff' : '#3a3a3a', fontWeight: 600 }}>{n}.com</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: avail[i] ? color : '#333' }}>
                {avail[i] ? '✓ Available' : '✗ Taken'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrademarkMockup({ moment, group }) {
  const color = GC[group], rgb = GR[group];
  return (
    <div>
      <div style={breadcrumb}>{moment.where} — Trademark Search Banner</div>
      <div style={{ background: '#1a1a1a', border: `0.5px solid rgba(${rgb},0.2)`, borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 20, flexShrink: 0, fontWeight: 700, color: '#3b82f6' }}>TM</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Before you invest in branding…</div>
            <div style={{ fontSize: 11, color: '#7a7a7a', lineHeight: 1.5 }}>Search 50M+ trademarks instantly. Know if your name is safe to use.</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', background: '#141414', border: `0.5px solid rgba(${rgb},0.15)`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#3a3a3a', flex: 1 }}>Search "nova"…</span>
          <span style={{ fontSize: 10, fontWeight: 700, color, background: `rgba(${rgb},0.12)`, padding: '3px 8px', borderRadius: 4 }}>Search →</span>
        </div>
        <div style={{ fontSize: 9, color: '#333', marginTop: 8 }}>Powered by {moment.partner} · Sponsored</div>
      </div>
    </div>
  );
}

function LogoMockup({ moment, group }) {
  const color = GC[group], rgb = GR[group];
  return (
    <div>
      <div style={breadcrumb}>{moment.where} — Partner Card (Footer)</div>
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.08)', marginBottom: 20 }}>
        {/* Simulated PDF page */}
        <div style={{ padding: '18px 22px', background: '#fff' }}>
          <div style={{ height: 8, background: '#e5e5e5', borderRadius: 3, marginBottom: 6, width: '50%' }} />
          <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, marginBottom: 4, width: '75%' }} />
          <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, width: '60%' }} />
        </div>
        <div style={{ padding: '12px 22px', background: '#f8f8f8', borderTop: '1px solid #eee' }}>
          <div style={{ fontSize: 9, color: '#999', marginBottom: 8 }}>PARTNER RESOURCE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 20 }}>🎨</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#222' }}>Your name is chosen. Now build the brand.</div>
              <div style={{ fontSize: 10, color: '#888' }}>{moment.partner} — Professional Logo Design</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, color: '#fff', background: '#222', padding: '4px 10px', borderRadius: 4 }}>
              {moment.cta}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenericAffiliateMockup({ moment, group }) {
  const color = GC[group], rgb = GR[group];
  return (
    <div>
      <div style={breadcrumb}>{moment.where} — Affiliate Card</div>
      <div style={{ background: '#1a1a1a', border: `0.5px solid rgba(${rgb},0.2)`, borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `rgba(${rgb},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {moment.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
              {moment.partnerTag} · {moment.partner}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{moment.headline}</div>
            <div style={{ fontSize: 11, color: '#7a7a7a', lineHeight: 1.45 }}>{moment.subtext}</div>
          </div>
        </div>
        <div style={{ marginTop: 12, padding: '7px 14px', background: `rgba(${rgb},0.08)`, border: `0.5px solid rgba(${rgb},0.2)`, borderRadius: 7, fontSize: 11, fontWeight: 700, color, width: 'fit-content' }}>
          {moment.cta}
        </div>
        <div style={{ fontSize: 9, color: '#2a2a2a', marginTop: 8 }}>Sponsored · Namico partner</div>
      </div>
    </div>
  );
}

// ── Affiliate Card (right panel bottom) ───────────────────────────────────────
function AffiliateCard({ moment, group }) {
  const [clicked, setClicked] = useState(false);
  const color = GC[group], rgb = GR[group], tc = GT[group];

  return (
    <div style={{ background: '#0d0d0d', border: `1px solid rgba(${rgb},0.25)`, borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0, background: `rgba(${rgb},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {moment.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{moment.partner}</div>
            <div style={{ fontSize: 9, color: '#333', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: 3 }}>Affiliate Partner</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.4 }}>{moment.headline}</div>
          <div style={{ fontSize: 12, color: '#7a7a7a', lineHeight: 1.65, marginBottom: 14 }}>{moment.subtext}</div>
          {clicked ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: 12, fontWeight: 700 }}>
              ✓ Link opened — (simulated click)
            </div>
          ) : (
            <button onClick={() => setClicked(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: color, color: tc, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {moment.cta}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Results Page All-Cards Mockup ─────────────────────────────────────────────
function ResultsPageAllCards({ group }) {
  const color = GC[group], rgb = GR[group];
  const cards = RESULTS_PAGE_AFFILIATES[group] || [];
  const [clicked, setClicked] = useState(null);

  return (
    <div>
      <div style={breadcrumb}>Results Page — "You have a name. Now make it real." section</div>

      {/* Simulated page header stub */}
      <div style={{ background: '#1a1a1a', border: `0.5px solid rgba(${rgb},0.15)`, borderRadius: 10, padding: '14px 18px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>You have a name. Now make it real.</div>
        <div style={{ fontSize: 11, color: '#555' }}>
          <span style={{ color: `rgba(${rgb},0.9)`, fontWeight: 600 }}>WinnerName</span> is chosen — here's what to do next, in order.
        </div>
      </div>

      {/* All affiliate cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
        {cards.map((card, i) => (
          <div key={i} style={{ background: '#1a1a1a', border: `1px solid ${card.accent}28`, borderRadius: 12, padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: card.accent }} />
            <div style={{ fontSize: 8, fontWeight: 800, color: card.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {card.tag} · {card.partner}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.35 }}>{card.headline}</div>
            <div style={{ fontSize: 10, color: '#5a5a5a', lineHeight: 1.45, marginBottom: 10 }}>{card.body}</div>
            <button
              onClick={() => setClicked(clicked === i ? null : i)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: 'none', background: clicked === i ? 'rgba(16,185,129,0.15)' : card.accent, color: clicked === i ? '#10B981' : card.accentText, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
            >
              {clicked === i ? '✓ Simulated click' : card.cta}
            </button>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: '#2a2a2a', marginTop: 8 }}>
        {cards.length} affiliate cards shown on this segment's Results Page · All sponsored
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
// selected: number = placement index, 'results-all' = results page overview
export default function AffiliateSimulator({ group, onClose }) {
  const [selected, setSelected] = useState(0);
  const moments = AFFILIATE_MOMENTS[group] || AFFILIATE_MOMENTS.business;
  const isResultsAll = selected === 'results-all';
  const moment  = isResultsAll ? null : moments[selected];
  const color   = GC[group];
  const rgb     = GR[group];
  const label   = AFFILIATE_PLAN_LABEL[group];

  const briefMoments = moments.filter(m => m.where === 'Brief Builder');

  function renderMockup() {
    switch (moment.type) {
      case 'domain-check': return <DomainCheckMockup moment={moment} group={group} />;
      case 'trademark':    return <TrademarkMockup moment={moment} group={group} />;
      case 'logo':         return <LogoMockup moment={moment} group={group} />;
      default:             return <GenericAffiliateMockup moment={moment} group={group} />;
    }
  }

  const totalCount = moments.length + 1; // +1 for results-all

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(4px)', zIndex: 99998 }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '92vw', maxWidth: 900, maxHeight: '88vh',
        background: '#141414', border: `0.5px solid rgba(${rgb},0.25)`,
        borderRadius: 16, boxShadow: `0 0 0 1px rgba(${rgb},0.08), 0 24px 80px rgba(0,0,0,0.85)`,
        display: 'flex', flexDirection: 'column',
        zIndex: 99999, overflow: 'hidden', fontFamily: 'Inter, sans-serif',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: '#1c1c1c', borderBottom: `0.5px solid rgba(${rgb},0.18)`, flexShrink: 0 }}>
          <div style={{ padding: '3px 8px', borderRadius: 5, background: `rgba(${rgb},0.14)`, color, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🔗 Affiliate Simulation
          </div>
          <div style={{ fontSize: 12, color: '#555' }}>
            {label} · {moments.length} placement spots · {RESULTS_PAGE_AFFILIATES[group]?.length || 0} results page cards
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', width: 26, height: 26, borderRadius: 5, border: 'none', background: 'rgba(255,255,255,0.06)', color: '#666', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left: placement list */}
          <div style={{ width: 200, borderRight: '0.5px solid rgba(255,255,255,0.05)', overflowY: 'auto', background: '#0f0f0f', flexShrink: 0 }}>

            <div style={{ padding: '10px 14px 6px', fontSize: 9, color: '#333', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Placement Spots
            </div>

            {/* Flat numbered list — all moments in order */}
            {moments.map((m, i) => {
              const active = selected === i;
              return (
                <button key={m.id} onClick={() => setSelected(i)} style={{
                  width: '100%', padding: '9px 14px',
                  background: active ? `rgba(${rgb},0.07)` : 'transparent',
                  border: 'none', borderLeft: `2px solid ${active ? color : 'transparent'}`,
                  textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: active ? color : '#383838', background: active ? `rgba(${rgb},0.15)` : '#1a1a1a', padding: '1px 5px', borderRadius: 3 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#fff' : '#4a4a4a' }}>{m.title}</span>
                  </div>
                  <div style={{ fontSize: 9, color: '#2e2e2e', paddingLeft: 24 }}>{m.where}</div>
                </button>
              );
            })}

            {/* Results All Cards — always last */}
            <button onClick={() => setSelected('results-all')} style={{
              width: '100%', padding: '9px 14px',
              background: isResultsAll ? `rgba(${rgb},0.1)` : 'rgba(255,255,255,0.02)',
              border: 'none', borderLeft: `2px solid ${isResultsAll ? color : 'transparent'}`,
              borderTop: '0.5px solid rgba(255,255,255,0.04)',
              textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: isResultsAll ? color : color + '60', background: isResultsAll ? `rgba(${rgb},0.2)` : `rgba(${rgb},0.06)`, padding: '1px 5px', borderRadius: 3 }}>
                  ALL
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isResultsAll ? '#fff' : color + '90' }}>View All Results Cards</span>
              </div>
              <div style={{ fontSize: 9, color: '#333', paddingLeft: 24 }}>{RESULTS_PAGE_AFFILIATES[group]?.length || 0} cards · full grid</div>
            </button>
          </div>

          {/* Right: mockup + affiliate card */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
            {isResultsAll ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#444', marginBottom: 18 }}>
                  <span>{label}</span><span>›</span>
                  <span>Results Page</span><span>›</span>
                  <span style={{ color }}>"You have a name. Now make it real." — all {RESULTS_PAGE_AFFILIATES[group]?.length} cards</span>
                </div>
                <ResultsPageAllCards group={group} />
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#444', marginBottom: 18 }}>
                  <span>{label}</span><span>›</span>
                  <span>{moment.where}</span><span>›</span>
                  <span style={{ color: '#666' }}>{moment.trigger}</span>
                </div>
                {renderMockup()}
                <AffiliateCard moment={moment} group={group} />
              </>
            )}
          </div>
        </div>

        {/* Footer nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderTop: '0.5px solid rgba(255,255,255,0.05)', background: '#0f0f0f', flexShrink: 0 }}>
          <button
            onClick={() => {
              if (isResultsAll) setSelected(resultsMoments.length > 0 ? moments.indexOf(resultsMoments[resultsMoments.length - 1]) : 0);
              else if (typeof selected === 'number' && selected > 0) setSelected(selected - 1);
            }}
            disabled={selected === 0}
            style={{ padding: '6px 12px', borderRadius: 6, border: '0.5px solid rgba(255,255,255,0.07)', background: 'transparent', color: selected === 0 ? '#2a2a2a' : '#666', fontSize: 11, fontWeight: 600, cursor: selected === 0 ? 'default' : 'pointer' }}
          >
            ← Prev
          </button>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 5 }}>
            {moments.map((_, i) => (
              <button key={i} onClick={() => setSelected(i)} style={{ width: selected === i ? 18 : 5, height: 5, borderRadius: 3, border: 'none', background: selected === i ? color : '#2a2a2a', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
            ))}
            {/* Dot for results-all */}
            <button onClick={() => setSelected('results-all')} style={{ width: isResultsAll ? 18 : 5, height: 5, borderRadius: 3, border: 'none', background: isResultsAll ? color : '#1a3a2a', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
          </div>
          <button
            onClick={() => {
              if (isResultsAll) {
                if (briefMoments.length > 0) setSelected(moments.indexOf(briefMoments[0]));
              } else if (typeof selected === 'number') {
                const nextIdx = selected + 1;
                if (nextIdx < moments.length) setSelected(nextIdx);
                else setSelected('results-all');
              }
            }}
            disabled={isResultsAll && briefMoments.length === 0}
            style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: (isResultsAll && briefMoments.length === 0) ? '#1a1a1a' : color, color: (isResultsAll && briefMoments.length === 0) ? '#333' : GT[group], fontSize: 11, fontWeight: 700, cursor: (isResultsAll && briefMoments.length === 0) ? 'default' : 'pointer' }}
          >
            Next →
          </button>
        </div>
      </div>
    </>
  );
}
