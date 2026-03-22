import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, ArrowRight, Copy, Check, CalendarBlank, Users, BookOpen } from '@phosphor-icons/react';
import { computeCreatorScore, saveCreatorQuality, getFieldDefs } from '../utils/quality';

const TIER = {
  business: { color: '#eaef09', rgb: '234,239,9', label: 'Business', textColor: '#000' },
  team: { color: '#8B5CF6', rgb: '139,92,246', label: 'Team', textColor: '#fff' },
  personal: { color: '#10B981', rgb: '16,185,129', label: 'Personal', textColor: '#fff' },
};

// ── Primer content by subSegment ──
function getPrimerContent(group, subSegment, tc) {
  const boxStyle = {
    border: `1px solid rgba(${tc.rgb},0.4)`,
    borderRadius: 10,
    padding: '14px 16px',
    marginTop: 16,
    background: `rgba(${tc.rgb},0.05)`,
    fontSize: 14,
    color: '#a1a1a1',
    lineHeight: 1.6,
  };
  const quoteStyle = { fontFamily: 'Inter, sans-serif', fontSize: 17, color: '#fff', fontWeight: 600, display: 'block', marginBottom: 8 };

  if (subSegment === 'company-name') return (
    <div>
      <blockquote style={{ margin: '0 0 10px', padding: 0 }}>
        <span style={quoteStyle}>"A name isn't a strategy. It's a vessel you fill with meaning."</span>
        <span style={quoteStyle}>"The best name isn't the one everyone likes. It's the one that works."</span>
        <span style={quoteStyle}>"Your job: Define what 'works' means for your company."</span>
      </blockquote>
      <div style={boxStyle}>
        <strong style={{ color: '#fff' }}>Real example:</strong> "Apple" tells you nothing about computers. But it's distinctive, memorable, ownable. That's what matters.
      </div>
    </div>
  );
  if (subSegment === 'product-name') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>Products live under a brand umbrella. Your company name sets the stage. Your product name extends the story.</p>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}><strong style={{ color: '#fff' }}>Branded house</strong> (Google everything) vs <strong style={{ color: '#fff' }}>House of brands</strong> (P&G approach)</p>
      <div style={boxStyle}><strong style={{ color: '#fff' }}>Example:</strong> Salesforce → Sales Cloud, Service Cloud, Marketing Cloud</div>
    </div>
  );
  if (subSegment === 'project-name') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>Generic names kill momentum. 'Project Phoenix' has been done to death. A distinctive internal name drives adoption and builds morale.</p>
      <div style={boxStyle}><strong style={{ color: '#fff' }}>Example:</strong> Google's "Project Loon" (internet balloons) became a cultural touchstone</div>
    </div>
  );
  if (subSegment === 'rebrand') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>You're not starting from scratch. You have brand equity. The question is: <strong style={{ color: '#fff' }}>Evolution or Revolution?</strong></p>
      <div style={boxStyle}><strong style={{ color: '#fff' }}>Examples:</strong> Mastercard (evolution — kept the name, dropped "MasterCard" spacing), Facebook→Meta (revolution), Dunkin' Donuts→Dunkin' (evolution — simplified)</div>
    </div>
  );
  if (subSegment === 'sports-team') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>The best sports names are chanted, cheerable, intimidating OR identity-building.</p>
      <div style={boxStyle}><strong style={{ color: '#fff' }}>Examples:</strong> Oklahoma City Thunder (chosen by public vote from 64,000 submissions), Seattle Kraken</div>
    </div>
  );
  if (subSegment === 'band-music') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>Your band name is your first song. Fans will ask <em>'How'd you get your name?'</em> — have a good story.</p>
      <div style={boxStyle}><strong style={{ color: '#fff' }}>Examples:</strong> Radiohead (from Talking Heads song), Foo Fighters (Dave Grohl's WWII UFO reference)</div>
    </div>
  );
  if (subSegment === 'podcast-channel') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>You're on a spectrum between <strong style={{ color: '#fff' }}>ultra-clear</strong> ("How I Built This") and <strong style={{ color: '#fff' }}>utterly intriguing</strong> ("Radiolab"). Both work — but they work differently.</p>
      <div style={boxStyle}><strong style={{ color: '#fff' }}>The sweet spot:</strong> Most winning podcast names balance both. "Hidden Brain" is intriguing (why hidden?) but clearly about psychology. Aim for that.</div>
    </div>
  );
  if (subSegment === 'civic-school-nonprofit') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>You're naming something that should outlast you by decades. <strong style={{ color: '#fff' }}>Clarity</strong> beats cleverness. <strong style={{ color: '#fff' }}>Aspiration</strong> beats description.</p>
      <div style={boxStyle}><strong style={{ color: '#fff' }}>Examples:</strong> Habitat for Humanity (clear + aspirational), charity: water (memorable lowercase), Doctors Without Borders (communicates scope and courage in 3 words).</div>
    </div>
  );
  if (subSegment === 'other-team') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>Names shape group identity before a single shared experience happens. A great group name creates <strong style={{ color: '#fff' }}>belonging</strong> — outsiders want in.</p>
      <div style={boxStyle}><strong style={{ color: '#fff' }}>Research shows:</strong> Groups named with aspirational titles ("The Visionaries") demonstrate more creative output than generic identifiers. Your name becomes a self-fulfilling prophecy.</div>
    </div>
  );
  if (subSegment === 'gaming-group') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>Two camps: <strong style={{ color: '#fff' }}>intimidating</strong> (FaZe Clan, Team Liquid) or <strong style={{ color: '#fff' }}>meme-worthy</strong> (Panda Global, Golden Guardians).</p>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7 }}>Test: Can you yell it when you clutch a 1v5?</p>
    </div>
  );
  if (subSegment === 'baby-name') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>Invite family and friends. Everyone gets a voice. All in one place. Private voting. Beautiful certificate.</p>
      <div style={boxStyle}><strong style={{ color: '#fff' }}>Example:</strong> The Morrison family invited 23 people. The certificate hangs in the nursery.</div>
    </div>
  );
  if (subSegment === 'pet-name') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>Pets are family. Get input from everyone who loves them.</p>
      <div style={boxStyle}>A shared naming process means everyone feels invested from day one.</div>
    </div>
  );
  if (subSegment === 'home-property-fun') return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>Named places feel more like <strong style={{ color: '#fff' }}>home</strong>. "The Bungalow" becomes a person. "Stella" the sailboat becomes a family legend.</p>
      <div style={boxStyle}><strong style={{ color: '#fff' }}>Research shows:</strong> Named spaces are used more, cared for more, and remembered more fondly. The name you choose becomes part of the story you tell about this place.</div>
    </div>
  );
  return (
    <div>
      <p style={{ color: '#a1a1a1', lineHeight: 1.7, marginBottom: 14 }}>A great name doesn't just describe what you do — it creates a container for everything you'll become.</p>
      <div style={boxStyle}><strong style={{ color: '#fff' }}>Key insight:</strong> The best name isn't the one everyone likes. It's the one that works. Trust the process.</div>
    </div>
  );
}

function getPrimerTitle(subSegment) {
  const titles = {
    'company-name': 'Before You Start: The Naming Philosophy',
    'product-name': 'Naming Products vs Companies: What\'s Different',
    'project-name': 'Why Internal Project Names Matter More Than You Think',
    'rebrand': 'Rebranding: Evolution or Revolution?',
    'sports-team': 'Sports Team Naming: What Makes Fans Yell It',
    'band-music': 'Band Naming: The Mythology Matters',
    'podcast-channel': 'Podcast Naming: Clarity vs. Intrigue — Both Can Win',
    'civic-school-nonprofit': 'Naming for Generations: Civic & Community Names',
    'other-team': 'Group Names Create Identity Before the First Meeting',
    'gaming-group': 'Gaming Names: Intimidate or Meme — Both Work',
    'baby-name': 'Let Everyone Help Name Your Baby',
    'pet-name': 'Name Your New Best Friend',
    'home-property-fun': 'Named Places Have Souls',
    'other-personal': 'The Right Name Changes How Something Feels',
  };
  return titles[subSegment] || 'Before You Start: The Naming Philosophy';
}

// ── Tip expandable component ──
function TipRow({ tipContent }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 4 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 12, color: '#7a7a7a', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <span style={{ fontSize: 10 }}>{open ? '▼' : '▶'}</span>
        Why does this matter?
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: '12px 14px', background: '#141414', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 13, color: '#a1a1a1', lineHeight: 1.65 }}>
          {tipContent}
          <div style={{ marginTop: 8, paddingTop: 6, borderTop: '0.5px solid rgba(255,255,255,0.06)', fontSize: 10, color: '#3a3a3a' }}>
            Source: Catchword Branding — naming strategy
          </div>
        </div>
      )}
    </div>
  );
}

// ── Toggle Switch ──
function Toggle({ value, onChange, color }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{ width: 44, height: 24, borderRadius: 12, background: value ? color : '#333', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </div>
  );
}

const inputStyle = { width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, height: 36, padding: '0 12px', color: '#fff', fontSize: 14, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' };
const textareaStyle = { ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' };
const labelStyle = { fontSize: 13, fontWeight: 600, color: '#fff', display: 'block', marginBottom: 6 };
const fieldWrap = { marginBottom: 28 };

// ── Business B1 fields ──
function B1Fields({ data, setData, tc, subSegment }) {
  const isRebrand = subSegment === 'rebrand';
  const today = new Date();
  const suggestDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const namingStyles = [
    { id: 'descriptive', label: 'Descriptive', example: 'QuickBooks' },
    { id: 'suggestive', label: 'Suggestive', example: 'Salesforce' },
    { id: 'abstract', label: 'Abstract', example: 'Verizon' },
    { id: 'any', label: 'Not sure (any)', example: 'Show me all' },
  ];
  const votingMethods = [
    { id: 'simple', label: 'Simple Poll', desc: 'Fast, use for <8 finalists' },
    { id: 'ranked', label: 'Ranked Choice', desc: 'Shows consensus, prevents polarization' },
    { id: 'multicriteria', label: 'Multi-Criteria', desc: 'Evaluates 5 dimensions', recommended: true },
    { id: 'pairwise', label: 'Pairwise', desc: '6-12 names, head-to-head' },
    { id: 'weighted', label: 'Weighted', desc: 'Some voters count more (Business only)' },
  ];
  const subLimits = [1, 2, 3, 5, 10, 'Unlimited'];

  return (
    <div>
      {isRebrand && (
        <>
          <div style={fieldWrap}>
            <label style={labelStyle}>Current name</label>
            <input style={inputStyle} placeholder="What is your current brand name?" value={data.currentName || ''} onChange={e => setData({ ...data, currentName: e.target.value })} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Why are you rebranding?</label>
            <textarea style={{ ...textareaStyle }} rows={3} placeholder="What prompted this rebrand? What's changing about your business?" value={data.rebrandReason || ''} onChange={e => setData({ ...data, rebrandReason: e.target.value })} />
          </div>
        </>
      )}

      <div style={fieldWrap}>
        <label style={labelStyle}>What does your company do?</label>
        <TipRow tipContent="Don't overthink this. You're not writing a mission statement. You're giving participants context. Example: 'We make project management software for remote teams' is perfect. Keep it to 2-3 sentences." />
        <textarea style={{ ...textareaStyle, marginTop: 8 }} rows={4} placeholder="Describe your company in 2-3 sentences..." value={data.companyDesc || ''} onChange={e => setData({ ...data, companyDesc: e.target.value })} />
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Naming Style Preference</label>
        <TipRow tipContent="Descriptive names tell you what it is (QuickBooks). Suggestive names hint at benefits (Salesforce). Abstract names mean nothing until you make them mean something (Verizon). Most successful tech companies choose Suggestive — trademarkable + memorable + flexible as you scale. Real examples: Asana (suggestive), Notion (abstract), Basecamp (descriptive)." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {namingStyles.map(s => (
            <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: data.namingStyle === s.id ? `rgba(${tc.rgb},0.08)` : '#141414', border: `0.5px solid ${data.namingStyle === s.id ? tc.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, cursor: 'pointer' }}>
              <input type="radio" name="namingStyle" value={s.id} checked={data.namingStyle === s.id} onChange={() => setData({ ...data, namingStyle: s.id })} style={{ accentColor: tc.color }} />
              <span style={{ color: '#fff', fontSize: 14 }}>{s.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#7a7a7a', background: '#222', padding: '2px 8px', borderRadius: 4 }}>{s.example}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Competitor Names (list 3-5)</label>
        <TipRow tipContent="This is the most important field. If all your competitors sound the same, you need to sound different. List 3-5 direct competitors. Participants will see these and know what NOT to sound like. Example: If you list Asana, Monday, ClickUp — all suggestive, all 2-syllable compounds — the smart move is to go abstract (like Notion did)." />
        <textarea style={{ ...textareaStyle, marginTop: 8 }} rows={3} placeholder="e.g. Slack, Notion, Asana, Monday" value={data.competitors || ''} onChange={e => setData({ ...data, competitors: e.target.value })} />
      </div>

      <div style={fieldWrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Anonymous Submissions</label>
          <Toggle value={data.anonymous !== false} onChange={v => setData({ ...data, anonymous: v })} color={tc.color} />
        </div>
        <TipRow tipContent="We recommend anonymous for one simple reason: it removes bias. When people don't know who suggested what, they judge ideas on merit, not relationships. In our data, anonymous contests have 23% higher satisfaction with final results. The exception? If your team is small (<5 people) and wants attribution for morale, turn this off. Stat: 78% of contests use anonymous mode." />
        <div style={{ marginTop: 6, fontSize: 12, color: '#7a7a7a' }}>Stat: 78% of contests use anonymous mode</div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Submission Limit per Person</label>
        <TipRow tipContent="Sweet spot: 3-5 names per person. Here's why: 1 name = overthinking. Unlimited = quality drops after the first few. 3-5 = people submit their best ideas without overthinking or spamming. Data: Contests with 3-5 limit have 31% more 'quality badge' submissions. Recommended: 3 for small teams (<10), 5 for larger groups." />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {subLimits.map(l => (
            <button key={l} onClick={() => setData({ ...data, submissionLimit: l })} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Voting Method</label>
        <TipRow tipContent="Simple Poll: Fast and familiar. Best for small groups. Ranked Choice: Shows true consensus, prevents spoiler effect. Multi-Criteria: Most rigorous — participants score each name on 5 dimensions. Pairwise: Head-to-head matchups, great for 6-12 names. Weighted: Some voters count more (ideal for boards or panels)." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {votingMethods.map(m => (
            <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: data.votingMethod === m.id ? `rgba(${tc.rgb},0.08)` : '#141414', border: `0.5px solid ${data.votingMethod === m.id ? tc.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, cursor: 'pointer', position: 'relative' }}>
              <input type="radio" name="votingMethod" value={m.id} checked={data.votingMethod === m.id} onChange={() => setData({ ...data, votingMethod: m.id })} style={{ accentColor: tc.color }} />
              <div>
                <div style={{ color: '#fff', fontSize: 14 }}>{m.label}</div>
                <div style={{ color: '#7a7a7a', fontSize: 12 }}>{m.desc}</div>
              </div>
              {m.recommended && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: tc.color, border: `1px solid ${tc.color}`, borderRadius: 4, padding: '2px 6px' }}>★ RECOMMENDED</span>}
            </label>
          ))}
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Contest Deadline</label>
        <TipRow tipContent="Recommended timeline: 5-7 days for submissions, then 3-4 days for voting. Total: 8-11 days. Launch on Monday. Close submissions Friday. Open voting Monday. Close voting Thursday. Publish results Friday. Stat: 8-11 day contests have 76% avg participation vs 54% for <5 days." />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <input type="date" style={{ ...inputStyle, flex: 1 }} value={data.deadline || ''} min={new Date().toISOString().split('T')[0]} onChange={e => setData({ ...data, deadline: e.target.value })} />
          <button onClick={() => setData({ ...data, deadline: suggestDate })} style={{ padding: '0 12px', height: 36, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, background: 'transparent', color: tc.color, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            +10 days
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Business B2 fields (Product / Service Name) ──
function B2Fields({ data, setData, tc }) {
  const architectures = [
    { id: 'branded-house', label: 'Branded House', example: 'Google Maps, Google Docs, Google Meet' },
    { id: 'house-of-brands', label: 'House of Brands', example: "P&G, Unilever — each product standalone" },
    { id: 'endorsed', label: 'Endorsed Brand', example: 'Marriott Courtyard — parent lends credibility' },
    { id: 'standalone', label: 'Standalone (not sure)', example: 'Figure it out later' },
  ];
  const suggestDate = new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>What does this product / service do?</label>
        <TipRow tipContent="Be specific about the problem it solves and who it's for. Example: 'A B2B SaaS tool that automates payroll for remote teams under 50 employees.' Participants need this to name it intelligently." />
        <textarea style={{ ...textareaStyle, marginTop: 8 }} rows={4} placeholder="What does it do? Who is it for? What's the core benefit in one sentence?" value={data.prodDesc || ''} onChange={e => setData({ ...data, prodDesc: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Company / Brand name (the parent)</label>
        <TipRow tipContent="The product name needs to work with your company name. Participants will design a name that fits — whether that's extending your brand (like Salesforce → Sales Cloud) or standing alone (like Apple → iPhone)." />
        <input style={{ ...inputStyle, marginTop: 8 }} placeholder="e.g. Acme Corp, or leave blank if not yet named" value={data.parentBrand || ''} onChange={e => setData({ ...data, parentBrand: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Brand architecture preference</label>
        <TipRow tipContent="Branded house (Google) = all products feel like extensions of the parent. House of brands (P&G) = each product is its own world. Endorsed brand = parent name lends credibility but product has its own identity. This affects whether the product name should reference your company at all." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {architectures.map(a => (
            <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: data.architecture === a.id ? `rgba(${tc.rgb},0.08)` : '#141414', border: `0.5px solid ${data.architecture === a.id ? tc.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, cursor: 'pointer' }}>
              <input type="radio" name="architecture" value={a.id} checked={data.architecture === a.id} onChange={() => setData({ ...data, architecture: a.id })} style={{ accentColor: tc.color }} />
              <div>
                <div style={{ color: '#fff', fontSize: 14 }}>{a.label}</div>
                <div style={{ color: '#7a7a7a', fontSize: 12 }}>{a.example}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Competitor product names (list 3-5)</label>
        <TipRow tipContent="Product naming needs market differentiation just as much as company naming. If all your competitors have technical/descriptive names, a evocative name will stand out — and vice versa." />
        <textarea style={{ ...textareaStyle, marginTop: 8 }} rows={3} placeholder="e.g. Stripe Billing, Chargebee, Paddle..." value={data.competitors || ''} onChange={e => setData({ ...data, competitors: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Submission Limit per Person</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {[1, 2, 3, 5, 10, 'Unlimited'].map(l => (
            <button key={l} onClick={() => setData({ ...data, submissionLimit: l })} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Contest Deadline</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <input type="date" style={{ ...inputStyle, flex: 1 }} value={data.deadline || ''} min={new Date().toISOString().split('T')[0]} onChange={e => setData({ ...data, deadline: e.target.value })} />
          <button onClick={() => setData({ ...data, deadline: suggestDate })} style={{ padding: '0 12px', height: 36, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, background: 'transparent', color: tc.color, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>+10 days</button>
        </div>
      </div>
    </div>
  );
}

// ── Business B3 fields (Project / Initiative Name) ──
function B3Fields({ data, setData, tc }) {
  const nameTypes = [
    { id: 'functional', label: 'Functional', example: '"Migration 2025", "Customer Portal Rebuild"' },
    { id: 'inspirational', label: 'Inspirational', example: '"Project Phoenix", "Operation Clarity"' },
    { id: 'codename', label: 'Codename / Abstract', example: 'Random word — Everest, Sequoia, Saturn' },
    { id: 'any', label: "Any — I'll know it when I see it", example: '' },
  ];
  const suggestDate = new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>What is this project / initiative?</label>
        <TipRow tipContent="Describe the project's goal, scope, and who it affects. Great internal names capture the spirit of the work, not just the task. 'Project Heartbeat' for a customer retention initiative says something about the stakes." />
        <textarea style={{ ...textareaStyle, marginTop: 8 }} rows={4} placeholder="What is the project's goal? Who is involved? What changes when it succeeds?" value={data.projDesc || ''} onChange={e => setData({ ...data, projDesc: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>How long will this project run?</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {['<3 months', '3–12 months', '1–3 years', 'Ongoing / permanent'].map(d => (
            <button key={d} onClick={() => setData({ ...data, projDuration: d })} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${data.projDuration === d ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.projDuration === d ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer' }}>{d}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Name type preference</label>
        <TipRow tipContent="Functional names are clear but forgettable. Inspirational names build morale but can feel forced. Codenames/abstract names (like Google's internal project names) feel cool but need internal adoption. The right choice depends on how much the name needs to communicate outside the core team." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {nameTypes.map(t => (
            <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: data.projNameType === t.id ? `rgba(${tc.rgb},0.08)` : '#141414', border: `0.5px solid ${data.projNameType === t.id ? tc.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, cursor: 'pointer' }}>
              <input type="radio" name="projNameType" value={t.id} checked={data.projNameType === t.id} onChange={() => setData({ ...data, projNameType: t.id })} style={{ accentColor: tc.color }} />
              <div>
                <div style={{ color: '#fff', fontSize: 14 }}>{t.label}</div>
                {t.example && <div style={{ color: '#7a7a7a', fontSize: 12 }}>{t.example}</div>}
              </div>
            </label>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Submission Limit per Person</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {[1, 2, 3, 5, 10, 'Unlimited'].map(l => (
            <button key={l} onClick={() => setData({ ...data, submissionLimit: l })} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Contest Deadline</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <input type="date" style={{ ...inputStyle, flex: 1 }} value={data.deadline || ''} min={new Date().toISOString().split('T')[0]} onChange={e => setData({ ...data, deadline: e.target.value })} />
          <button onClick={() => setData({ ...data, deadline: suggestDate })} style={{ padding: '0 12px', height: 36, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, background: 'transparent', color: tc.color, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>+10 days</button>
        </div>
      </div>
    </div>
  );
}

// ── Team T1 fields ──
function T1Fields({ data, setData, tc }) {
  const personalities = ['Intimidating', 'Pride-Based', 'Fun', 'Not sure'];
  const limits = [3, 5, 'Unlimited'];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Describe your team</label>
        <textarea style={{ ...textareaStyle }} rows={3} placeholder="Sport, league, age group, competitive level..." value={data.teamDesc || ''} onChange={e => setData({ ...data, teamDesc: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Team Personality</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {personalities.map(p => (
            <button key={p} onClick={() => setData({ ...data, personality: p })} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${data.personality === p ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.personality === p ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Local connection / geography <span style={{ color: '#7a7a7a', fontWeight: 400 }}>(optional)</span></label>
        <textarea style={{ ...textareaStyle }} rows={2} placeholder="City, region, or local landmarks that could inspire the name..." value={data.geography || ''} onChange={e => setData({ ...data, geography: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Submission Limit per Person</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {limits.map(l => (
            <button key={l} onClick={() => setData({ ...data, submissionLimit: l })} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Team T2 fields ──
function T2Fields({ data, setData, tc }) {
  const styles = ['Absurdist / Provocative', 'Evocative / Poetic', 'Personal / Story-based', 'Any'];
  const today = new Date();
  const suggestDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Genre / Sound</label>
        <TipRow tipContent="Genre shapes the name archetype. Metal names trend aggressive (Slayer, Pantera, Megadeth). Indie names trend literary/abstract (Fleet Foxes, Beach House, Bon Iver). Pop names trend catchy and pronounceable. Share the genre so participants know the naming territory." />
        <input style={{ ...inputStyle, marginTop: 8 }} placeholder="e.g. Indie rock, hip-hop, classical, electronic..." value={data.genre || ''} onChange={e => setData({ ...data, genre: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Band origin story <span style={{ color: '#7a7a7a', fontWeight: 400 }}>(optional)</span></label>
        <TipRow tipContent="Fans always ask 'How did you get your name?' A name with a great story is a permanent conversation starter. Lynyrd Skynyrd = named after a gym teacher. Radiohead = from a Talking Heads song. Foo Fighters = Dave Grohl's WWII UFO reference. Share the origin context so participants can suggest something with meaning." />
        <textarea style={{ ...textareaStyle, marginTop: 8 }} rows={3} placeholder="How did the band form? Any meaningful context, inside references, or stories that could inspire a name?" value={data.originStory || ''} onChange={e => setData({ ...data, originStory: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Name archetype preference</label>
        <TipRow tipContent="Three archetypes dominate great band names. Absurdist/Provocative (Arctic Monkeys, Vampire Weekend, Panic! at the Disco) — memorable for their strangeness. Evocative/Poetic (The National, Fleet Foxes, Portishead) — mood-first, feels like the music. Personal/Story-based (Dave Matthews Band, Lynyrd Skynyrd) — built around identity or lore. Pick one to guide submissions." />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {styles.map(s => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: data.nameStyle === s ? `rgba(${tc.rgb},0.08)` : '#141414', border: `0.5px solid ${data.nameStyle === s ? tc.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, cursor: 'pointer' }}>
              <input type="radio" name="nameStyle" value={s} checked={data.nameStyle === s} onChange={() => setData({ ...data, nameStyle: s })} style={{ accentColor: tc.color }} />
              <span style={{ color: '#fff', fontSize: 14 }}>{s}</span>
            </label>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Stage name or legal name?</label>
        <TipRow tipContent="If this is the legal band name for contracts, merch, and licensing — it needs to be distinctive enough to trademark and simple enough for legal docs. If it's a stage name only, you have more creative freedom. Some bands use a simplified version legally (The Artist Formerly Known As Prince → Prince legally)." />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {['Stage name (creative freedom)', 'Legal name (needs trademark-ability)', 'Both same name'].map(opt => (
            <button key={opt} onClick={() => setData({ ...data, nameType: opt })} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${data.nameType === opt ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.nameType === opt ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer' }}>{opt}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Google / searchability test</label>
        <TipRow tipContent="In the streaming era, a band name that's searchable without 10,000 false positives is a real competitive advantage. 'The The', 'Girls', and '!!!' are famously unsearchable. 'Foo Fighters' returns exactly what you want. Tell participants: do you want a highly distinctive, searchable name, or are you okay with something more common?" />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {['Highly distinctive / searchable', 'Okay with some ambiguity', "Don't mind"].map(opt => (
            <button key={opt} onClick={() => setData({ ...data, searchability: opt })} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${data.searchability === opt ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.searchability === opt ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{opt}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Submission limit per person</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[3, 5, 'Unlimited'].map(l => (
            <button key={l} onClick={() => setData({ ...data, submissionLimit: l })} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Contest Deadline</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" style={{ ...inputStyle, flex: 1 }} value={data.deadline || ''} min={new Date().toISOString().split('T')[0]} onChange={e => setData({ ...data, deadline: e.target.value })} />
          <button onClick={() => setData({ ...data, deadline: suggestDate })} style={{ padding: '0 12px', height: 36, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, background: 'transparent', color: tc.color, fontSize: 12, cursor: 'pointer' }}>+10 days</button>
        </div>
      </div>
    </div>
  );
}

// ── Team T3 fields (Podcast / Channel) ──
function T3Fields({ data, setData, tc }) {
  const platforms = ['Spotify / Apple Podcasts', 'YouTube', 'Twitch', 'Both Podcast + Video', 'Other'];
  const tones = ['Educational / Informative', 'Storytelling / Narrative', 'Interview-based', 'Comedy / Entertainment', 'News & Commentary', 'Any'];
  const suggestDate = new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>What is your show about?</label>
        <TipRow tipContent="Be specific. 'Tech' is too broad. 'How solo founders build profitable SaaS businesses in under 12 months' is clear. Participants need to understand your show's topic to name it well." />
        <textarea style={{ ...textareaStyle, marginTop: 8 }} rows={4} placeholder="Describe the show's topic, angle, and target audience in 2-3 sentences..." value={data.showDesc || ''} onChange={e => setData({ ...data, showDesc: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Primary Platform</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {platforms.map(p => (
            <button key={p} onClick={() => setData({ ...data, platform: p })} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${data.platform === p ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.platform === p ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Tone / Format</label>
        <TipRow tipContent="Tone affects the name hugely. A comedy podcast can be absurdist. An educational show needs clarity. An interview show might lean on the host's personality. Share the tone so participants name appropriately." />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {tones.map(t => (
            <button key={t} onClick={() => setData({ ...data, tone: t })} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${data.tone === t ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.tone === t ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Existing shows you admire <span style={{ color: '#7a7a7a', fontWeight: 400 }}>(name style reference)</span></label>
        <TipRow tipContent="Like competitor names for brands, comparable show names tell participants what naming territory is taken and what style resonates with you. e.g. 'I love how How I Built This is clear, but want something with more personality like Radiolab.'" />
        <input style={{ ...inputStyle, marginTop: 8 }} placeholder="e.g. How I Built This, Lex Fridman, Hidden Brain..." value={data.compShows || ''} onChange={e => setData({ ...data, compShows: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Submission Limit per Person</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {[3, 5, 'Unlimited'].map(l => (
            <button key={l} onClick={() => setData({ ...data, submissionLimit: l })} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${data.submissionLimit === l || (!data.submissionLimit && l === 3) ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.submissionLimit === l || (!data.submissionLimit && l === 3) ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Contest Deadline</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" style={{ ...inputStyle, flex: 1 }} value={data.deadline || ''} min={new Date().toISOString().split('T')[0]} onChange={e => setData({ ...data, deadline: e.target.value })} />
          <button onClick={() => setData({ ...data, deadline: suggestDate })} style={{ padding: '0 12px', height: 36, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, background: 'transparent', color: tc.color, fontSize: 12, cursor: 'pointer' }}>+10 days</button>
        </div>
      </div>
    </div>
  );
}

// ── Team T4 fields (Civic / Nonprofit) ──
function T4Fields({ data, setData, tc }) {
  const orgTypes = ['School or PTA', 'Neighborhood Association', 'Nonprofit / Charity', 'Civic Group', 'Club or Society', 'Other'];
  const suggestDate = new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Organization type</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {orgTypes.map(t => (
            <button key={t} onClick={() => setData({ ...data, orgType: t })} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${data.orgType === t ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.orgType === t ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Mission / Purpose</label>
        <TipRow tipContent="Civic names need to communicate purpose instantly. Describe your mission in 1-2 sentences. The best civic names are either crystal-clear (Habitat for Humanity) or deeply aspirational (Doctors Without Borders). Tell participants which direction to go." />
        <textarea style={{ ...textareaStyle, marginTop: 8 }} rows={4} placeholder="What is this organization's mission? Who does it serve? What change does it create?" value={data.mission || ''} onChange={e => setData({ ...data, mission: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Community served</label>
        <TipRow tipContent="Is this local (a specific neighborhood), regional, or aspiring to be national? Geographic scope affects whether a location should be in the name. 'Riverside Community Garden' works locally but limits future expansion." />
        <input style={{ ...inputStyle, marginTop: 8 }} placeholder="e.g. Families in the Oak Park district, youth ages 12-18, local small businesses..." value={data.community || ''} onChange={e => setData({ ...data, community: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Acronym test — will people use initials?</label>
        <TipRow tipContent="Some civic names are universally known by acronym: ACLU, YMCA, NAACP. If your organization will likely be shortened to initials, participants should know — so they can suggest names where the acronym is also strong. Ask yourself: will people say the full name or the letters?" />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {['Full name (no acronym expected)', 'Acronym likely (initials matter)', 'Not sure'].map(opt => (
            <button key={opt} onClick={() => setData({ ...data, acronymPref: opt })} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${data.acronymPref === opt ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.acronymPref === opt ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer' }}>{opt}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Longevity aspiration</label>
        <TipRow tipContent="Community organizations often outlast their founders. A name should work for 50+ years. Avoid trend-driven language, technology references, or anything that feels 'of this moment.' Participants should know: is this meant to be timeless?" />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {['5-10 years', '10-25 years', '25+ years / permanent'].map(l => (
            <button key={l} onClick={() => setData({ ...data, longevity: l })} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${data.longevity === l ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.longevity === l ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Submission Limit per Person</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {[3, 5, 'Unlimited'].map(l => (
            <button key={l} onClick={() => setData({ ...data, submissionLimit: l })} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${data.submissionLimit === l || (!data.submissionLimit && l === 3) ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.submissionLimit === l || (!data.submissionLimit && l === 3) ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Contest Deadline</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" style={{ ...inputStyle, flex: 1 }} value={data.deadline || ''} min={new Date().toISOString().split('T')[0]} onChange={e => setData({ ...data, deadline: e.target.value })} />
          <button onClick={() => setData({ ...data, deadline: suggestDate })} style={{ padding: '0 12px', height: 36, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, background: 'transparent', color: tc.color, fontSize: 12, cursor: 'pointer' }}>+10 days</button>
        </div>
      </div>
    </div>
  );
}

// ── Team T6 fields (Other Team) ──
function T6Fields({ data, setData, tc }) {
  const vibes = ['Serious / Professional', 'Fun / Casual', 'Aspirational', 'Irreverent / Playful'];
  const suggestDate = new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Describe your group</label>
        <TipRow tipContent="The more context participants have, the better the names. What does your group do? Who's in it? What makes you unique?" />
        <textarea style={{ ...textareaStyle, marginTop: 8 }} rows={4} placeholder="What kind of group is this? What do you do together? What makes your group unique?" value={data.groupDesc || ''} onChange={e => setData({ ...data, groupDesc: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Group vibe / personality</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {vibes.map(v => (
            <button key={v} onClick={() => setData({ ...data, vibe: v })} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${data.vibe === v ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.vibe === v ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{v}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Any shared history or inside references? <span style={{ color: '#7a7a7a', fontWeight: 400 }}>(optional)</span></label>
        <TipRow tipContent="Group names with personal meaning create stronger belonging. If there's a shared joke, a founding story, or a place that matters — share it. Participants who know the group well might suggest something that hits differently." />
        <input style={{ ...inputStyle, marginTop: 8 }} placeholder="e.g. We all met at a conference in Berlin, our group chat is named after an inside joke..." value={data.history || ''} onChange={e => setData({ ...data, history: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Submission Limit per Person</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {[3, 5, 'Unlimited'].map(l => (
            <button key={l} onClick={() => setData({ ...data, submissionLimit: l })} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${data.submissionLimit === l || (!data.submissionLimit && l === 3) ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.submissionLimit === l || (!data.submissionLimit && l === 3) ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Contest Deadline</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" style={{ ...inputStyle, flex: 1 }} value={data.deadline || ''} min={new Date().toISOString().split('T')[0]} onChange={e => setData({ ...data, deadline: e.target.value })} />
          <button onClick={() => setData({ ...data, deadline: suggestDate })} style={{ padding: '0 12px', height: 36, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, background: 'transparent', color: tc.color, fontSize: 12, cursor: 'pointer' }}>+10 days</button>
        </div>
      </div>
    </div>
  );
}

// ── Team T5 fields ──
function T5Fields({ data, setData, tc }) {
  const vibes = ['Intimidating', 'Fun', 'Meme-worthy'];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Games you play</label>
        <input style={inputStyle} placeholder="e.g. Valorant, League of Legends, Minecraft..." value={data.games || ''} onChange={e => setData({ ...data, games: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Competitive or casual?</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {['Competitive', 'Casual'].map(c => (
            <button key={c} onClick={() => setData({ ...data, competitiveLevel: c })} style={{ padding: '8px 20px', borderRadius: 8, border: `1px solid ${data.competitiveLevel === c ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.competitiveLevel === c ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{c}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Vibe</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {vibes.map(v => (
            <button key={v} onClick={() => setData({ ...data, vibe: v })} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${data.vibe === v ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.vibe === v ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{v}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Personal P1 fields ──
function P1Fields({ data, setData, tc }) {
  const genders = ['Boy', 'Girl', 'Surprise', 'Prefer not to say'];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>When is your baby due? <span style={{ color: '#7a7a7a', fontWeight: 400 }}>(optional)</span></label>
        <TipRow tipContent="If already born, enter birth date — we'll generate a 'Welcome to the world' certificate with the actual birth date." />
        <input type="date" style={{ ...inputStyle, marginTop: 8 }} value={data.dueDate || ''} onChange={e => setData({ ...data, dueDate: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Do you know the gender?</label>
        <TipRow tipContent="If surprise, people can suggest both boy and girl names. You pick after baby arrives. We'll keep all submissions organized." />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {genders.map(g => (
            <button key={g} onClick={() => setData({ ...data, gender: g })} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${data.gender === g ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.gender === g ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{g}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Any names to avoid? <span style={{ color: '#7a7a7a', fontWeight: 400 }}>(optional)</span></label>
        <TipRow tipContent="Family names that didn't work out? Names of exes? We won't show these to voters — they stay private between you and the platform." />
        <input style={{ ...inputStyle, marginTop: 8 }} placeholder="Ex: No names starting with K (too many cousins already)" value={data.avoidNames || ''} onChange={e => setData({ ...data, avoidNames: e.target.value })} />
      </div>
    </div>
  );
}

// ── Personal P2 fields ──
function P2Fields({ data, setData, tc }) {
  const pets = ['Dog', 'Cat', 'Bird', 'Reptile', 'Other'];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>What kind of pet?</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {pets.map(p => (
            <button key={p} onClick={() => setData({ ...data, petType: p })} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${data.petType === p ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.petType === p ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Describe their personality <span style={{ color: '#7a7a7a', fontWeight: 400 }}>(optional)</span></label>
        <input style={inputStyle} placeholder="'Chaotic gremlin energy' or 'Regal and aloof'" value={data.petPersonality || ''} onChange={e => setData({ ...data, petPersonality: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Any names to avoid? <span style={{ color: '#7a7a7a', fontWeight: 400 }}>(optional)</span></label>
        <input style={inputStyle} placeholder="Names already taken by other pets, etc." value={data.avoidNames || ''} onChange={e => setData({ ...data, avoidNames: e.target.value })} />
      </div>
    </div>
  );
}

// ── Personal P3 fields (Home / Property / Fun) ──
function P3Fields({ data, setData, tc }) {
  const namingTargets = ['House / Home', 'Vacation Home / Cabin', 'Boat / Watercraft', 'Car / Vehicle', 'Room / Space', 'Other'];
  const vibes = ['Cozy / Warm', 'Adventurous / Outdoorsy', 'Elegant / Sophisticated', 'Funny / Playful', 'Not sure'];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>What are you naming?</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {namingTargets.map(t => (
            <button key={t} onClick={() => setData({ ...data, namingTarget: t })} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${data.namingTarget === t ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.namingTarget === t ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Tell people about it <span style={{ color: '#7a7a7a', fontWeight: 400 }}>(optional)</span></label>
        <TipRow tipContent="A little context sparks better names. Is there something unique about this place or thing? A quirk, a story, a feeling? Share what makes it special and participants will suggest names that actually fit." />
        <textarea style={{ ...textareaStyle, marginTop: 8 }} rows={3} placeholder="e.g. A 1920s craftsman bungalow with a big porch, always full of people on summer evenings..." value={data.propDesc || ''} onChange={e => setData({ ...data, propDesc: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Vibe / personality</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {vibes.map(v => (
            <button key={v} onClick={() => setData({ ...data, vibe: v })} style={{ padding: '8px 14px', borderRadius: 8, border: `1px solid ${data.vibe === v ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.vibe === v ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{v}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Generic fallback fields ──
function GenericFields({ data, setData, tc }) {
  const today = new Date();
  const suggestDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return (
    <div>
      <div style={fieldWrap}>
        <label style={labelStyle}>What are you naming?</label>
        <textarea style={{ ...textareaStyle }} rows={3} placeholder="Describe what you're naming in 2-3 sentences..." value={data.companyDesc || ''} onChange={e => setData({ ...data, companyDesc: e.target.value })} />
      </div>
      <div style={fieldWrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Anonymous Submissions</label>
          <Toggle value={data.anonymous !== false} onChange={v => setData({ ...data, anonymous: v })} color={tc.color} />
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Submission Limit per Person</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {[1, 2, 3, 5, 10, 'Unlimited'].map(l => (
            <button key={l} onClick={() => setData({ ...data, submissionLimit: l })} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? tc.color : 'rgba(255,255,255,0.15)'}`, background: data.submissionLimit === l || (data.submissionLimit === undefined && l === 3) ? `rgba(${tc.rgb},0.1)` : 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={fieldWrap}>
        <label style={labelStyle}>Contest Deadline</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="date" style={{ ...inputStyle, flex: 1 }} value={data.deadline || ''} min={new Date().toISOString().split('T')[0]} onChange={e => setData({ ...data, deadline: e.target.value })} />
          <button onClick={() => setData({ ...data, deadline: suggestDate })} style={{ padding: '0 12px', height: 36, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, background: 'transparent', color: tc.color, fontSize: 12, cursor: 'pointer' }}>+10 days</button>
        </div>
      </div>
    </div>
  );
}

// ── Invite config per subsegment ──
const INVITE_CONFIG = {
  'company-name': {
    essential: ['Founders / C-suite', 'Marketing / Brand lead', "Anyone who'll use the name daily"],
    recommended: ['2-3 outsiders — investors, advisors, or customers'],
    recommendedNote: "30% of winning names came from someone outside the company. Airbnb's name came from a designer they hired, not the founders.",
    optional: ['Early employees (builds ownership)', 'Board members (if involved in brand decisions)'],
    sweetSpot: '12–25',
    sweetSpotNote: '<10 = not enough diversity · 12–25 = sweet spot · >30 = diminishing returns',
  },
  'product-name': {
    essential: ['Product team lead', 'Brand / Marketing team', 'Customer-facing staff (sales, support)'],
    recommended: ['2–3 existing customers who know the problem your product solves'],
    recommendedNote: "Customers name things differently than internal teams. They use the words your market actually uses — not your internal jargon.",
    optional: ['Product designers / UX team', 'Key investors or advisors'],
    sweetSpot: '10–20',
    sweetSpotNote: 'Product naming benefits from diverse internal + a few external voices. Keep it tight.',
  },
  'project-name': {
    essential: ['Project team lead(s)', 'Department heads impacted by the project', 'Executive sponsor'],
    recommended: ['2–3 people most affected by this project (end users, downstream teams)'],
    recommendedNote: "The people most affected by the project often suggest names that stick — they know what this work means on the ground.",
    optional: ['Cross-functional stakeholders if broad impact'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Internal project naming works best with a focused group. Too many voices = political naming.',
  },
  'rebrand': {
    essential: ['Founders / CEO', 'Brand / Marketing team', 'Long-tenured employees (they carry brand memory)'],
    recommended: ['Customers who know the current name and what it means to them'],
    recommendedNote: "Brand equity lives in customer memory. They'll tell you what's worth keeping — and what associations the new name needs to escape.",
    optional: ['PR / Communications team', 'Board members if involved in brand decisions'],
    sweetSpot: '10–20',
    sweetSpotNote: 'Rebrands need internal buy-in AND external reality check. Balance both.',
  },
  'other-business': {
    essential: ['Key decision-makers', 'Marketing or brand lead', "People who'll use the name daily"],
    recommended: ['2–3 outsiders for an external perspective'],
    recommendedNote: "Fresh eyes catch assumptions insiders miss. Even one outside voice can unlock a better name.",
    optional: ['Advisors, investors, or stakeholders'],
    sweetSpot: '10–25',
    sweetSpotNote: 'Sweet spot for most business naming contests.',
  },
  'sports-team': {
    essential: ['Team captain(s)', 'Coach / Manager'],
    recommended: ['3–5 core team members'],
    recommendedNote: "The whole team should feel ownership of the name — it will define their identity every game.",
    optional: ['Parents or guardians (youth teams)', 'Fans or supporters if established'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Enough voices for variety, small enough for consensus.',
  },
  'band-music': {
    essential: ['All band members (everyone in)'],
    recommended: ['Producer or manager', '1–2 superfans who know your sound'],
    recommendedNote: "Superfans tell you what the name means from the outside — they hear the music without the insider bias.",
    optional: ['Label reps if signed', 'Collaborators or session musicians'],
    sweetSpot: '5–10',
    sweetSpotNote: "Band names are personal — keep the circle tight. Too many outside voices dilute what makes you you.",
  },
  'podcast-channel': {
    essential: ['Host(s)', 'Producer / Editor'],
    recommended: ['3–5 people who match your target audience profile'],
    recommendedNote: "Your target listener knows what show names attract them. They're your most valuable naming input.",
    optional: ['Guest speakers who know your content well', 'Social media followers you trust'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Mix of creators and target audience gives you both insider vision and market reality.',
  },
  'civic-school-nonprofit': {
    essential: ['Founding team members', 'Board members', 'Executive Director'],
    recommended: ['5–10 community members you serve or plan to serve'],
    recommendedNote: "The community you serve should have a voice in what you're called. This is also a trust-building act — invite them in.",
    optional: ['Major donors or funders (if brand matters to them)', 'Volunteers and long-term supporters'],
    sweetSpot: '15–25',
    sweetSpotNote: 'Civic naming benefits from broad inclusion. More voices = more community ownership of the final name.',
  },
  'gaming-group': {
    essential: ['All group members'],
    recommended: [],
    recommendedNote: '',
    optional: ['Friends who play with you regularly'],
    sweetSpot: '3–8',
    sweetSpotNote: "Gaming groups are tight-knit. Everyone who matters is already in the group.",
  },
  'other-team': {
    essential: ['All group members'],
    recommended: ['Friends who know the group well — they see you from the outside'],
    recommendedNote: "Outside friends often suggest names that capture what the group looks like from the outside — which is the name that will stick with others.",
    optional: ['Anyone who has been part of the group in the past'],
    sweetSpot: '8–20',
    sweetSpotNote: 'Depends on group size — invite everyone who matters.',
  },
  'baby-name': {
    essential: ['Immediate family — parents, siblings, grandparents'],
    recommended: ['Close friends in the baby\'s life — godparents, best friends'],
    recommendedNote: "People who'll be in this child's life should feel included. It also means more people invested in the name from day one.",
    optional: ['Distant relatives, coworkers — anyone you want to feel involved'],
    sweetSpot: '15–30',
    sweetSpotNote: "Great way to make distant relatives feel connected. The certificate on the nursery wall tells the whole story.",
  },
  'pet-name': {
    essential: ['Immediate family members'],
    recommended: ['Anyone who will regularly see or care for the pet'],
    recommendedNote: "Pets become part of the community around them. The people who'll call the name most often should help choose it.",
    optional: ['Friends of the family who know about the new pet'],
    sweetSpot: '5–15',
    sweetSpotNote: "Keep it personal — this is a family moment.",
  },
  'home-property-fun': {
    essential: ["People who'll live in or regularly use the space"],
    recommended: ['Friends who know the space and your style'],
    recommendedNote: "Friends who've visited often name places better than the owners — they see the vibe without the familiarity bias.",
    optional: ['Neighbors, frequent guests, anyone with a connection to the space'],
    sweetSpot: '5–15',
    sweetSpotNote: 'Keep it fun and intimate.',
  },
  'other-personal': {
    essential: ['People closest to you who understand what you\'re naming'],
    recommended: ['A few friends or family for fresh perspective'],
    recommendedNote: "Outside voices catch what feels obvious to you but surprising to the world.",
    optional: ['Anyone with a connection to the thing you\'re naming'],
    sweetSpot: '5–20',
    sweetSpotNote: 'Scale to the occasion.',
  },
};

// ══════════════════════════════════════════════════════════════
// TOUCHPOINT 2 — CREATOR EDUCATION ARTICLES (per subsegment)
// ══════════════════════════════════════════════════════════════
const CREATOR_ARTICLES = {
  'company-name': [
    { id: 'b1-arc', title: 'The 5 Name Archetypes — and Which One Wins', readTime: '3 min',
      sections: [
        { heading: 'Not all names are created equal', body: 'Every company name fits one of five archetypes: Descriptive, Suggestive, Abstract/Coined, Real-word repurposed, or Founder/Acronym. Each has tradeoffs. Understanding them is the difference between a name that constrains you at Series B and one that grows with you to IPO.' },
        { heading: 'Descriptive names (QuickBooks, PayPal)', body: "They tell you what they do. Good for early traction, SEO, zero ambiguity. Bad for future pivots, trademark protection, and global expansion. Rule of thumb: if you're 100% confident in your category and positioning for the next 10 years, descriptive can work. If not, think twice." },
        { heading: 'Suggestive names (Salesforce, Shopify, Slack)', body: "They hint at the benefit without stating it literally. Most Fortune 500 tech companies live here. Why? Trademarkable + memorable + flexible as the business evolves. 'Salesforce' became a CRM AND a marketing platform AND an AI company without the name fighting back." },
        { heading: 'Abstract/Coined names (Google, Xerox, Verizon)', body: 'Meaningless until you make them mean something. Hardest to launch, strongest moat once established. These require the most marketing investment but provide the deepest long-term competitive advantage — no one can accidentally use your name in a sentence.' },
      ],
      callout: { type: 'example', text: "Slack started as a gaming company's internal tool. A descriptive name like 'TeamChat' would have fought the pivot to enterprise. An abstract name gave them a clean surface to project any meaning onto." },
    },
    { id: 'b1-comp', title: "Why Competitor Names Are Your Most Important Research", readTime: '2 min',
      sections: [
        { heading: 'The differentiation principle', body: 'If five of your competitors have two-syllable, suggestive names — do not be the sixth. Research on brand recall is clear: names that do not fit the category pattern are remembered 47% more often than names that blend in. The competitor field in your brief is the highest-leverage field you will fill out.' },
        { heading: 'What to look for', body: "List 5 competitors and analyze: What archetype? What length? What tone (serious, playful, technical)? Where there's density — that's exactly where your name should not be." },
        { heading: 'The pattern break wins', body: "When HubSpot launched, every CRM was descriptive or founder-named. HubSpot was a compound abstract — stood alone immediately. When Notion launched against Evernote, Confluence, OneNote — they chose a single abstract word. They owned that positioning." },
      ],
      callout: { type: 'insight', text: "The sweet spot: sounds like it belongs in your category, but doesn't sound like anyone already there." },
    },
    { id: 'b1-brief', title: 'The Briefing Paradox: More Context = Better Names', readTime: '2 min',
      sections: [
        { heading: 'The most common organizer mistake', body: "Most organizers share too little context, afraid of 'leading' participants. This is backwards. The more specific context you give, the more creative and on-target submissions become. Vague brief → creative anxiety → generic submissions. 'Make us something catchy' is not a brief." },
        { heading: 'What participants actually need', body: 'They need: What you do (2-3 sentences), who it\'s for (specific, not "everyone"), what the name should signal (your tone/archetype preference), what the competition looks like (so they can differentiate), and what to avoid (saves everyone time).' },
      ],
      callout: { type: 'warning', text: "Warning: 'I'll know the right name when I see it' is not a brief. That's a wish. Great briefs define success criteria before the contest starts — so participants aim at a defined target, not a moving one." },
    },
  ],
  'product-name': [
    { id: 'b2-arch', title: 'Brand Architecture: Decide This Before Naming Anything', readTime: '2 min',
      sections: [
        { heading: 'The decision that shapes everything', body: "Before you name a product, decide: will this product extend your company brand, or live independently? This is brand architecture. Get it wrong and the product name will fight the company name rather than amplifying it." },
        { heading: 'Three models', body: "Branded House (Google, Apple): every product extends the master brand. House of Brands (P&G, Unilever): each product is standalone — consumers don't know the parent. Endorsed Brand (Marriott Courtyard): parent lends credibility, product has distinct identity." },
        { heading: 'Which model is right?', body: "Branded house works when the parent brand is strong and consistent. House of brands works when products serve radically different markets. Tell participants which model you're using — it completely changes what 'good' looks like for a submission." },
      ],
      callout: { type: 'example', text: "Salesforce chose branded house → Sales Cloud, Service Cloud, Marketing Cloud. Every product extends the master. Consistent, scalable — but every product must feel 'salesforce-y.' Choose your architecture before you brief." },
    },
    { id: 'b2-diff', title: 'Product Names Live in a Different Ecosystem', readTime: '2 min',
      sections: [
        { heading: 'Why product naming is harder', body: "Company names compete in a broad landscape. Product names must work in context: alongside your company name, your other products, competitors' products, and in specific usage contexts (app store, sales deck, support ticket). Each context adds pressure the company name never faces." },
        { heading: 'The precision requirement', body: "A new product name often has to work on first contact — in a headline, a demo, a pitch. If it doesn't land in 3 seconds, it's working against your sales team, not for them. Precision matters more in product naming than in company naming." },
      ],
      callout: { type: 'insight', text: "The best product name has a 'job.' AirPods = air (wireless, invisible) + pods (small, self-contained). Clear benefit, suggests the experience, in two syllables. Know the job before you name." },
    },
    { id: 'b2-sound', title: 'The Sound of Your Product: Phonetics That Match the Experience', readTime: '2 min',
      sections: [
        { heading: 'Sound carries meaning before the dictionary does', body: "Hard consonants (K, T, B, P) signal speed, strength, and precision. Soft sounds (L, M, S, vowel-heavy names) signal ease, warmth, and approachability. 'Crisp' feels sharper than 'Smooth.' Neither is wrong — but the phonetic profile of your product name creates subconscious expectations before a customer reads a single word of copy." },
        { heading: 'Onomatopoeia is an underused weapon', body: "Names that sound like the experience they deliver are processed faster and remembered longer. 'Zip' for a file compressor. 'Glide' for a presentation tool. 'Snap' for anything instant. The product name that sounds like its core benefit is doing double marketing duty every time someone says it aloud." },
        { heading: 'Apply this to your brief', body: "Think about how your product feels to use — fast, calm, precise, expansive, warm? Write that adjective down before you brief. Tell participants the emotional experience the name should evoke. Sound design in naming is invisible when done right and glaring when wrong." },
      ],
      callout: { type: 'example', text: "'Zoom' — short, explosive, onomatopoeic. You feel the speed before you know it's a video tool. Compare to 'WebEx' — technical, hyphenated, sounds like IT infrastructure. Same category, completely different phonetic signal." },
    },
  ],
  'project-name': [
    { id: 'b3-momentum', title: 'Generic Project Names Kill Momentum', readTime: '2 min',
      sections: [
        { heading: "What's in a project name?", body: "More than you think. Research shows named projects achieve their objectives 34% more often than unnamed or numbered ones. A great project name creates shared mental model, motivates ownership, and makes status updates feel like progress rather than reporting." },
        { heading: '"Project Phoenix" has been done to death', body: "Phoenix, Titan, Horizon, Compass, Catalyst — these are the cargo shorts of project naming. They signal nothing, commit to nothing. The most effective project names are: (a) crystal-clear about the goal, or (b) so specific to your culture that outsiders wouldn't get it but insiders feel it." },
      ],
      callout: { type: 'example', text: "Google's 'Project Loon' (internet balloons) captured both the literal mechanism and the audacious feeling of the work. The name became a cultural touchstone inside and outside the company." },
    },
    { id: 'b3-funcvsinsp', title: 'Functional vs Inspirational: Two Cultures', readTime: '2 min',
      sections: [
        { heading: 'Functional names', body: '"Customer Portal Migration," "Q4 Data Architecture Upgrade." Pros: zero ambiguity, perfect for regulatory contexts. Cons: generates no energy, no ownership, no pride. People report the work but do not own the vision.' },
        { heading: 'Inspirational names', body: '"Project Catalyst," "Operation Clarity," "Mission Backbone." Research shows team members with project names they are proud of work 18% more hours and report 31% higher satisfaction with outcomes. Best for transformation and culture-change projects.' },
      ],
      callout: { type: 'insight', text: 'Research verdict: for culture-change or transformation projects, inspirational names outperform. For technical migrations or compliance work, functional wins. Know which you are running before you brief.' },
    },
  ],
  'rebrand': [
    { id: 'b4-equity', title: 'What Is Your Brand Equity Actually Worth?', readTime: '3 min',
      sections: [
        { heading: 'Brand equity is real money', body: "Before rebranding, answer honestly: what does the current name mean to customers? Not what you wish it meant — what does it actually mean? Brand equity is the sum of all associations, memories, and expectations your name triggers. Some is valuable. Some is what you're trying to escape." },
        { heading: 'What to preserve', body: "Mastercard evolved from 'MasterCard' — they kept the name, the red circle, the two-hemisphere concept because the equity was enormous. Before you start this contest: identify specifically what about the current name or brand is worth preserving. This becomes a constraint for participants." },
        { heading: 'What to escape', body: "Philip Morris → Altria (after tobacco litigation). Facebook → Meta (after regulatory pressure). If the existing name has become a liability, the new name needs to create distance while preserving underlying trust. Tell participants what associations you are moving away from." },
      ],
      callout: { type: 'warning', text: "Warning: rebrands that change too much simultaneously (name + logo + color + tone) confuse customers more than they help. Research shows customers require 7-12 exposures to recognize a new brand from a previous relationship. Evolutionary rebrands outperform revolutionary ones in retention." },
    },
    { id: 'b4-evolverev', title: 'Evolution vs Revolution — How to Choose', readTime: '2 min',
      sections: [
        { heading: 'Evolution (the safer path)', body: "Tweak, modernize, refine. Dunkin' Donuts → Dunkin'. They shortened and simplified, kept the equity. Evolution works when the core identity is sound but the expression needs updating for a new era or market segment." },
        { heading: 'Revolution (the riskier path)', body: "Rename and reposition entirely. Andersen Consulting → Accenture. BackRub → Google. Revolution is warranted when: (a) the existing name is a genuine barrier to growth, (b) scandal has made the name toxic, or (c) the business has fundamentally changed beyond what the name can contain." },
      ],
      callout: { type: 'example', text: "Dunkin' removed 'Donuts' because 60% of revenue was beverages, not donuts. The word was misleading. They kept 'Dunkin'' because that's where 60+ years of equity lived. That's precision equity management." },
    },
  ],
  'sports-team': [
    { id: 't1-anatomy', title: 'The Anatomy of a Great Sports Team Name', readTime: '2 min',
      sections: [
        { heading: 'Four qualities that separate great from forgettable', body: 'Chantable (can 10,000 people yell it?), Visualizable (does it create an instant image?), Emotionally loaded (intimidating OR identity-building — pick one), Ownable (feels specific to this team, not interchangeable with anyone else).' },
        { heading: 'The geography question', body: "Location-based names anchor the team in community. But they limit the team if it moves. Names that reference local culture without naming the city directly (Golden State Warriors) travel better. Think about whether this team will always be in one location." },
        { heading: 'Mascot vs abstract', body: "Miami Heat has no animal mascot. Oklahoma City Thunder has no mascot. Abstract team names (Heat, Magic, Jazz, Thunder) create more visual identity flexibility. But animal names are instantly visualizable. Both strategies have deep histories of success — choose based on your identity goals." },
      ],
      callout: { type: 'example', text: "Oklahoma City Thunder was chosen from 64,000 public submissions. It beat Bisons, Wind, and Energy. Thunder won because it was local, powerful, abstract, and chantable — without limiting the visual identity team." },
    },
    { id: 't1-chant', title: 'Chantability: The Test Every Team Name Must Pass', readTime: '1 min',
      sections: [
        { heading: 'The stadium test', body: "Imagine 10,000 people chanting your team name after a goal. Not reading it. Not typing it. Screaming it. Does it work? Names with natural stress patterns and sharp endings pass this test: 'HEAT! HEAT! HEAT!' 'THUNDER! THUNDER!' Names with three syllables or soft endings fail it: try chanting 'Navigators' for 90 seconds. You will not enjoy it." },
        { heading: 'What makes a name chant-ready', body: "One or two syllables. A hard consonant or sharp vowel at the end. Or a name that compresses naturally (Sacramento Kings → 'KINGS!'). Test every submission by yelling it three times fast. If your voice trips on it, cut it from the shortlist." },
      ],
      callout: { type: 'insight', text: "Chantability correlates with merchandise sales. Names that are easy to chant are easy to print, easy to hashtag, and easy to remember mid-game. It is not a soft criterion — it is infrastructure." },
    },
  ],
  'band-music': [
    { id: 't2-firstsong', title: 'The Band Name Is Your First Song', readTime: '2 min',
      sections: [
        { heading: 'The name sets tone before a note plays', body: "Before anyone hears your music, they see your name. It's on the flyer, the playlist, the algorithm recommendation. The name creates expectation. 'Death Cab for Cutie' creates completely different expectations than 'The 1975.' Both great — but they signal different worlds." },
        { heading: 'The story test', body: "Fans always ask: 'How did you get your name?' A great answer is a great story. Radiohead = from a Talking Heads B-side. Lynyrd Skynyrd = named after a gym teacher who told them to cut their hair. Foo Fighters = Dave Grohl's WWII UFO reference. A name with a story becomes band mythology before the first album." },
        { heading: 'The searchability problem', body: "In the streaming era, a searchable band name is a competitive advantage. 'The The', 'Girls', and '!!!' are all legitimate band names — and all impossible to find on any platform. 'Foo Fighters' returns exactly what you want. Distinctiveness and searchability are not the same thing — you need both." },
      ],
      callout: { type: 'insight', text: 'Music discovery data: 67% of new listeners find artists through search (Spotify, YouTube, Google). A highly distinctive band name drives 2-3x more organic monthly plays in the first 6 months than a common word or phrase.' },
    },
    { id: 't2-archetypes', title: 'Three Archetypes That Dominate Music Naming History', readTime: '2 min',
      sections: [
        { heading: 'Absurdist / Provocative', body: "Arctic Monkeys, Vampire Weekend, Panic! at the Disco, Chumbawamba. Memorable for strangeness. Make you stop and think. Best for genres where personality is part of the brand. Risk: can feel gimmicky if the music doesn't match the name's attitude." },
        { heading: 'Evocative / Poetic', body: "The National, Fleet Foxes, Beach House, Portishead, Mazzy Star. Mood-first. Feels like the music before you hear it. Names that suggest a feeling, a place, an aesthetic. Ages beautifully — doesn't feel tied to any era or trend." },
        { heading: 'Personal / Story-based', body: "Dave Matthews Band, Lynyrd Skynyrd, Radiohead. The name carries identity — either the artist's or a moment in the band's history. Best for artist-driven projects where personality is the product." },
      ],
      callout: { type: 'insight', text: "Top 50 band names in history split roughly: 40% Absurdist, 40% Evocative, 20% Personal. Absurdist dominates indie/alt. Evocative dominates ambient/folk. Personal dominates hip-hop and country. Know your genre archetype before you brief." },
    },
  ],
  'podcast-channel': [
    { id: 't3-discovery', title: 'Discovery vs Memory: The Two Jobs of a Podcast Name', readTime: '2 min',
      sections: [
        { heading: 'Job 1: Discovery', body: "When someone searches 'business podcast' or 'true crime,' does your name surface? Discovery-optimized names lean clear: 'The Daily,' 'Crime Junkie,' 'How I Built This.' These work when you have no existing audience and search is your primary acquisition channel." },
        { heading: 'Job 2: Memory', body: "When a listener recommends your show in conversation, can they remember the name? Memory-optimized names lean intriguing: 'Serial,' 'S-Town,' '99% Invisible,' 'Radiolab.' These work when word-of-mouth is your growth engine." },
        { heading: 'The balanced approach wins long-term', body: "'Hidden Brain' (NPR psychology): 'Hidden' = intriguing. 'Brain' = instantly signals the subject. You know it's about psychology before you read the description. Balanced names outperform pure-clarity or pure-mystery in long-term growth." },
      ],
      callout: { type: 'example', text: "'Stuff You Should Know' is extremely clear and SEO-rich — 2.5 billion downloads. 'Radiolab' is abstract and memorable — 120M downloads. Clear names front-load audience. Memorable names compound over time. Choose your growth strategy first." },
    },
    { id: 't3-algorithm', title: 'The Algorithm vs Memory Tension — How to Win Both', readTime: '2 min',
      sections: [
        { heading: 'What the algorithm wants', body: "Podcast platforms surface shows based on keyword relevance. Clear, descriptive names ('The Marketing Podcast,' 'Daily News Brief') index well in search and get recommended in the right categories automatically. If search is your only acquisition channel, lean descriptive — you will get traffic earlier." },
        { heading: 'What memory wants', body: "Word-of-mouth — still the highest-conversion podcast acquisition channel — requires a name that lives in the brain and rolls off the tongue. 'You Must Remember This,' 'My Favorite Murder,' 'Conan Needs a Friend' spread because the names are interesting enough to repeat. Distinctive names compound." },
        { heading: 'The hybrid strategy', body: "Name the show memorably. Use the subtitle for clarity and keywords. 'Hidden Brain: A Podcast About the Unconscious Forces That Drive Human Behavior.' The name is memorable; the subtitle handles SEO. Many top shows use this approach — give participants both a name and subtitle brief." },
      ],
      callout: { type: 'insight', text: "Spotify's internal data shows that shows with distinctive (non-descriptive) names have 40% higher episode completion rates. Listeners who chose the show based on its name — not keywords — are more committed listeners." },
    },
  ],
  'civic-school-nonprofit': [
    { id: 't4-longevity', title: 'The 50-Year Test for Civic Organization Names', readTime: '2 min',
      sections: [
        { heading: 'Names that outlast their founders', body: "YMCA was founded in 1844. Habitat for Humanity in 1976. Doctors Without Borders in 1971. None use trendy language. None reference technology. None use slang. Great civic organization names are built to outlast their founders by decades. Ask every participant: will this name still make sense in 50 years?" },
        { heading: 'What makes a civic name age well', body: "Names that age well: reference human values ('humanity' is permanent), name the impact not the process (Doctors Without Borders describes impact, not methodology), stay away from tech buzzwords (anything with 'digital,' 'smart,' 'e-,' 'cyber-' will be dated within 15 years)." },
        { heading: 'The dual audience requirement', body: "Civic names must communicate purpose to two audiences: the people served AND the donors/funders. A name that resonates with one but not the other is a strategic liability. 'Feeding America' works for both: donors know what they're funding; recipients know what they're getting." },
      ],
      callout: { type: 'example', text: "'eCorps' (2000s nonprofit): the 'e-' prefix aged terribly. 'charity: water' (2006): aged beautifully — the lowercase and colon feel intentional and modern without being tied to any tech era." },
    },
    { id: 't4-community', title: 'Clarity vs Aspiration — When Each Approach Wins', readTime: '2 min',
      sections: [
        { heading: 'The clarity approach', body: "Crystal-clear civic names tell you exactly what they do: Habitat for Humanity, Feeding America, Girls Who Code. Best for service organizations where the mission IS the brand and you need to communicate in seconds without context." },
        { heading: 'The aspiration approach', body: "Aspirational names evoke the world being worked toward. Aspiration works when you're building a movement, not just delivering a service. The name should inspire, not just describe — donors fund visions, not services." },
        { heading: 'Community ownership', body: "The best civic names feel like they belong to everyone. 'Big Brothers Big Sisters' could be anyone. 'The Johnson Initiative' belongs to Johnson. Unless your founder carries enormous equity (Gates, Obama), naming after a person limits community participation." },
      ],
      callout: { type: 'insight', text: 'Research on donor behavior: civic names that communicate mission in the name receive 31% more first-time donations than abstract names. First impressions drive first dollars.' },
    },
  ],
  'gaming-group': [
    { id: 't5-psychology', title: 'The Psychology Behind Great Gaming Group Names', readTime: '1 min',
      sections: [
        { heading: 'Two camps, both dominate', body: "Intimidating names (FaZe Clan, Team Liquid, Cloud9) signal competitive dominance. Meme-worthy names (Panda Global, Golden Guardians) signal a different confidence: we're secure enough to be playful. Both work. Choice depends on how seriously competitive you are." },
        { heading: 'The functional tests', body: "Can you yell it when you clutch a 1v5? Can it go on a jersey? Does it have a tag/abbreviation that works? (Cloud9 → C9, Team Liquid → TL). Gaming names should be 1-2 words max, distinctive within your game's community, and functional as a competitive tag." },
      ],
      callout: { type: 'insight', text: 'Merchandise data from top esports teams: 2-syllable team names generate 2.3x more fan gear searches than longer names. Brevity is a feature, not a constraint.' },
    },
    { id: 't5-tag', title: 'The Tag Test: How Esports Names Get Compressed', readTime: '1 min',
      sections: [
        { heading: 'Every name becomes a tag', body: "In competitive gaming, team names live as 2-3 character tags in brackets: [C9] Cloud9, [TL] Team Liquid, [FaZe] FaZe Clan. The tag is what players see in-game, in tournament brackets, and on leaderboards. A great team name produces a great tag naturally. Test every submission: what's the obvious 2-3 letter compression? If it's awkward, the name will feel wrong in competitive play." },
        { heading: 'Tag collision and uniqueness', body: "Before finalizing any name, check if the tag is already claimed in your game's community or in major esports. A unique tag is not just aesthetic — it determines search results, community identity on Discord and Reddit, and how other players refer to you in comms. 'GG' was taken before online gaming existed. Plan ahead." },
      ],
      callout: { type: 'example', text: "'NaVi' (Natus Vincere — Latin for 'born to win') compresses perfectly: memorable tag, meaningful full name, global audience doesn't need to know the Latin to feel the dominance. The tag and the name work as a system." },
    },
  ],
  'other-team': [
    { id: 't6-identity', title: 'Names Shape Group Identity Before the First Meeting', readTime: '2 min',
      sections: [
        { heading: 'The name creates the group before the group exists', body: "Research on organizational behavior shows groups given aspirational names produce measurably more creative output than groups with generic identifiers. The name becomes a self-fulfilling prophecy. A great group name is the first act of leadership." },
        { heading: 'Inside vs. outside meaning', body: "The best group names work on two levels: they mean something to members (inside reference, shared history) AND they create the right impression for outsiders. A great group name says 'there's something going on here' even to people who don't know the inside story." },
      ],
      callout: { type: 'insight', text: "Groups with distinctive, creative names attract more qualified members than groups with generic identifiers. Your name is not just identity — it's a membership signal." },
    },
    { id: 't6-future', title: 'Will Your Group Name Make Sense in 5 Years?', readTime: '1 min',
      sections: [
        { heading: 'The time horizon problem', body: "Groups evolve. The 'Tuesday Night Crew' stops meeting Tuesdays. The 'Book Club' stops reading books and becomes a social outlet. The 'Marketing Brainstorm Team' becomes a full strategy department. Names built around logistics, schedules, or current activities age into irony. Names built around values, shared identity, or purpose stay accurate as the group evolves." },
        { heading: 'Future-proof naming criteria', body: "Ask: if this group's activity changes but the people stay the same, does the name still fit? If yes — it's identity-based and will age well. If no — it's activity-based and will need updating. For most groups, identity-based names are worth the extra effort to find." },
      ],
      callout: { type: 'insight', text: "The best group names describe who you are, not what you do — because what you do will change." },
    },
  ],
  'baby-name': [
    { id: 'p1-science', title: 'The Science of Name Perception', readTime: '2 min',
      sections: [
        { heading: 'Sound shapes perception', body: "Research in linguistics shows name sounds affect perceived personality. Names with hard consonants (Kate, Jack, Blake) are perceived as more assertive. Names with soft sounds (Lily, Maya, Noah) are perceived as warmer. Neither is better — but phonetics create expectations that follow a person into every introduction they make." },
        { heading: 'The uniqueness question', body: "Names easy to pronounce and spell correlate with slightly higher career success metrics — not because of the name itself, but because mispronunciation and misspelling create friction in every professional interaction over a lifetime. Consider the lifetime administrative cost of unusual spellings." },
      ],
      callout: { type: 'insight', text: 'SSA data shows name popularity cycles every ~25 years. For uniqueness without invention, look at names ranked #500-1000: distinctive but phonetically established.' },
    },
    { id: 'p1-lifetime', title: 'The Lifetime Test: Toddler, Teen, Professional, Elderly', readTime: '2 min',
      sections: [
        { heading: 'A name is worn for 80+ years', body: "Most parents think about how a name sounds for a baby. Few think about how it plays at a job interview, a first date, or at 75 years old. The most durable names work at every life stage. 'Eleanor' works for a toddler, a teenager, a CEO, and an 80-year-old. 'Braylee' is harder to carry into every stage with equal dignity." },
        { heading: 'The nickname architecture', body: "Built-in nickname flexibility is a feature, not a compromise. 'Alexander' gives you Alex, Al, Xander, Lex, Alec. The child gets to choose how they self-identify at different life stages. Single-form names (no natural nickname) give the name to the world; nickname-rich names give the child editorial control." },
        { heading: 'The professional context test', body: "Say the name in a business context: 'I'd like to introduce our CEO, [name].' Say it in a casual context: 'Have you met [name]?' If it sounds right in both settings, the name has range. If it only works in one, consider whether that constraint fits the life you're imagining for the child." },
      ],
      callout: { type: 'insight', text: "Research on name and career outcomes: names that are easy to pronounce and spell in the target culture correlate with fewer friction points across a lifetime of professional interactions. Spelling variation rarely adds character — it mainly adds correction burden." },
    },
  ],
  'pet-name': [
    { id: 'p2-personality', title: 'Personality-Forward Naming Works Best for Pets', readTime: '1 min',
      sections: [
        { heading: 'Names that fit the animal', body: "The best pet names capture personality rather than appearance. 'Chaos' or 'Gremlin' beats 'Spot' or 'Fluffy.' Personality names age better — a puppy grows into an adult but their personality tends to stay consistent." },
        { heading: 'The practical tests', body: "Say the name out loud 20 times: can you yell it in a dog park without embarrassment? Does it have a one-syllable call name? (Maximilian → Max). Can you say it with authority when they're misbehaving? The call name and the full name are both part of the choice." },
      ],
      callout: { type: 'example', text: 'Top pet names 2024: Luna, Bella, Charlie, Max, Cooper. If distinctiveness matters to you, these are the exact names to avoid. Look one tier down for uniqueness with established phonetics.' },
    },
    { id: 'p2-callname', title: 'The Call Name Principle', readTime: '1 min',
      sections: [
        { heading: 'The name you actually use is the one that matters', body: "The formal name and the call name are two different things. 'Bartholomew' becomes 'Bart' at the dog park. 'Persephone' becomes 'Percy.' When naming a pet, work backward from the call name you will actually use 50 times a day. The full name can be ceremonial — but the one-syllable version is the functional name and it needs to work." },
        { heading: 'Response training and phonetics', body: "Animal trainers consistently recommend names ending in a vowel sound (Bella, Luna, Coco, Milo) because they carry further in open spaces and are easier for animals to distinguish from ambient noise. Hard consonants at the start also help: 'Kira' cuts through a crowd better than 'Nana.' Brief participants with both the aesthetic and the practical." },
      ],
      callout: { type: 'insight', text: "Veterinary behaviorists note that pets named with clear two-syllable patterns (MAX-i, BEL-la, CO-co) respond to recall commands faster than pets with names that blend into sentences. The call name is a functional tool, not just a label." },
    },
  ],
  'home-property-fun': [
    { id: 'p3-places', title: 'Why Named Places Feel Different Than Unnamed Ones', readTime: '1 min',
      sections: [
        { heading: 'The psychology of place names', body: "Environmental psychology research shows named spaces are used differently than unnamed ones. Named vacation homes get booked more often, maintained better, remembered more fondly. A name creates emotional ownership that transfers — 'We're going to Willowbend' creates different anticipation than 'We're going to the lake house.'" },
        { heading: 'What makes a great property name', body: "Great property names have: a story (where the name comes from matters), a sound that fits the place, and work as both formal name and casual reference. 'The Bungalow' works. 'Casa Serenidad' works. 'Our Place' doesn't — that's a pronoun, not a name." },
      ],
      callout: { type: 'example', text: 'Airbnb hosts who give their properties names see 23% higher booking rates than those who do not. The name creates a story guests want to be part of before they even arrive.' },
    },
    { id: 'p3-stick', title: 'What Makes a Property Name Stick', readTime: '1 min',
      sections: [
        { heading: 'The four sources that work', body: "The most memorable property names come from: (1) geography — a local feature, view, or landmark ('Ridgecrest,' 'Harborside'); (2) history — a previous use or long-ago owner ('The Old Mill,' 'Shepherd's Rest'); (3) nature — flora, fauna, or natural elements specific to the land ('Heronwood,' 'Cliffside'); (4) feeling — the emotional experience the place creates ('Stillwater,' 'Driftwood'). Abstract invented names rarely stick — grounding in something real gives people a story to tell." },
        { heading: 'The conversational test', body: "Will people use the name in natural conversation, or will it always need explanation? 'We're going to Willowbend' works. 'We're going to Casa Bella Serenissima Di Toscana' does not — it becomes 'the Italian place.' Shorter always wins. One or two words, phonetically easy, immediately evocative." },
      ],
      callout: { type: 'insight', text: "Property names that reference something visible from the property — a view, a tree, a body of water — are repeated more often by guests and neighbors. Anchoring the name to something people can point at makes it real, not decorative." },
    },
  ],
  'other-personal': [
    { id: 'p4-generic', title: 'A Great Name Changes How Something Feels', readTime: '1 min',
      sections: [
        { heading: 'Names create meaning', body: "Research across psychology and linguistics consistently shows named things are treated differently than unnamed things. Named projects get more attention. Named spaces get more care. Named initiatives get more funding. Whatever you're naming, the act of choosing a name is the act of giving something a place in the world." },
        { heading: 'What makes it worth doing with a group', body: "When people help name something, they feel invested in it. The process of finding the right name together is itself the first shared experience. Collective naming creates shared ownership from the very first moment." },
      ],
      callout: { type: 'insight', text: "The right name doesn't just describe what something is — it tells people how to feel about it. A name is the shortest story you can tell." },
    },
    { id: 'p4-collective', title: 'Collective Naming Creates Collective Ownership', readTime: '1 min',
      sections: [
        { heading: 'Why the process matters as much as the outcome', body: "When a group names something together — a friendship circle, a club, a tradition, a shared space — the naming process is itself the first shared act of ownership. Research on group cohesion shows that groups who create shared symbols (names, rituals, inside references) together report significantly higher belonging and commitment than groups where symbols are assigned from outside." },
        { heading: 'How to brief for collective resonance', body: "Tell participants who the group is and what it means to them. The best submissions will come from understanding the relationship, not just the object being named. A brief that says 'we are five friends who met studying abroad and this is our annual reunion' will generate completely different — and better — names than 'we need a name for our group.'" },
      ],
      callout: { type: 'insight', text: "The name you choose together becomes a shared artifact — a piece of language that belongs to everyone who helped create it. That ownership transfers into how the name gets used and protected for years." },
    },
  ],
};

function ArticleCallout({ callout }) {
  const styles = {
    insight: { bg: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', label: 'Insight', labelColor: '#8B5CF6' },
    example: { bg: 'rgba(234,239,9,0.06)', border: '1px solid rgba(234,239,9,0.2)', label: 'Real Example', labelColor: '#eaef09' },
    warning: { bg: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', label: 'Warning', labelColor: '#ef4444' },
  };
  const s = styles[callout.type] || styles.insight;
  return (
    <div style={{ padding: '12px 14px', background: s.bg, border: s.border, borderRadius: 8, marginTop: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: s.labelColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{s.label}</div>
      <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.6 }}>{callout.text}</div>
    </div>
  );
}

function CreatorArticlesScreen({ subSegment, tc, onContinue }) {
  const articles = CREATOR_ARTICLES[subSegment] || CREATOR_ARTICLES['other-personal'];
  const [expanded, setExpanded] = useState(null);
  const [read, setRead] = useState({});
  const readCount = Object.keys(read).length;

  const markRead = (id) => { setRead(prev => ({ ...prev, [id]: true })); setExpanded(null); };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Touchpoint 2 · Creator Education · {readCount}/{articles.length} read
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>
          Before You Build: The Naming Strategy Guides
        </h1>
        <p style={{ fontSize: 14, color: '#7a7a7a', lineHeight: 1.6 }}>
          Read these before filling out your brief. The more you understand about naming strategy, the better your brief — and the better the names participants suggest.
        </p>
      </div>

      <div style={{ height: 3, background: '#222', borderRadius: 3, marginBottom: 24 }}>
        <div style={{ height: '100%', width: `${articles.length ? (readCount / articles.length) * 100 : 0}%`, background: tc.color, borderRadius: 3, transition: 'width 0.4s' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {articles.map((article) => {
          const isOpen = expanded === article.id;
          const isDone = read[article.id];
          return (
            <div key={article.id} style={{ background: isDone ? `rgba(${tc.rgb},0.04)` : '#1a1a1a', border: `0.5px solid ${isDone ? `rgba(${tc.rgb},0.3)` : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, overflow: 'hidden' }}>
              <div onClick={() => setExpanded(isOpen ? null : article.id)} style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isDone ? tc.color : '#222', border: isDone ? 'none' : '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isDone ? <Check size={14} weight="bold" color={tc.color === '#eaef09' ? '#000' : '#fff'} /> : <BookOpen size={13} color="#4a4a4a" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{article.title}</div>
                  <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 3 }}>{article.readTime}</div>
                </div>
                <div style={{ fontSize: 11, color: '#4a4a4a' }}>{isOpen ? '▲' : '▼'}</div>
              </div>
              {isOpen && (
                <div style={{ padding: '0 20px 20px' }}>
                  <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {article.sections.map((sec, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: tc.color, marginBottom: 6 }}>{sec.heading}</div>
                        <div style={{ fontSize: 14, color: '#a1a1a1', lineHeight: 1.7 }}>{sec.body}</div>
                      </div>
                    ))}
                    {article.callout && <ArticleCallout callout={article.callout} />}
                    <button onClick={() => markRead(article.id)} style={{ height: 38, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, background: `rgba(${tc.rgb},0.08)`, color: tc.color, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>
                      ✓ Got it — mark as read
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={onContinue} style={{ width: '100%', height: 48, border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {readCount > 0 ? `Continue to Brief Builder (${readCount}/${articles.length} read)` : 'Skip to Brief Builder →'}
        <ArrowRight size={18} />
      </button>
      {readCount === 0 && <p style={{ textAlign: 'center', fontSize: 12, color: '#4a4a4a', marginTop: 8 }}>Reading takes 5 minutes. It saves hours of back-and-forth with participants.</p>}
    </div>
  );
}

// ── Invitation Screen ──
function InviteScreen({ group, subSegment, tc, onLaunch }) {
  const [copied, setCopied] = useState(false);
  const inviteCode = 'xk9p2m';
  const inviteLink = `namingcontest.com/join/${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${inviteLink}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cfg = INVITE_CONFIG[subSegment] || INVITE_CONFIG['other-personal'];
  const tierColors = { essential: '#10B981', recommended: tc.color, optional: '#7a7a7a' };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, color: '#fff', marginBottom: 8 }}>Who Should You Invite?</h1>
      <p style={{ color: '#a1a1a1', fontSize: 14, marginBottom: 32 }}>Choose carefully — the right voices lead to the best names.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {/* Essential */}
        <div style={{ padding: '16px', background: '#1a1a1a', border: `1px solid ${tierColors.essential}`, borderRadius: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: tierColors.essential, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Essential ✓</div>
          {cfg.essential.map(item => (
            <div key={item} style={{ fontSize: 14, color: '#a1a1a1', marginBottom: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: tierColors.essential, flexShrink: 0, marginTop: 1 }}>·</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Recommended */}
        {cfg.recommended.length > 0 && (
          <div style={{ padding: '16px', background: '#1a1a1a', border: `1px solid ${tierColors.recommended}`, borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tierColors.recommended, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Recommended</div>
            {cfg.recommended.map(item => (
              <div key={item} style={{ fontSize: 14, color: '#a1a1a1', marginBottom: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: tierColors.recommended, flexShrink: 0, marginTop: 1 }}>·</span>
                <span>{item}</span>
              </div>
            ))}
            {cfg.recommendedNote && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#7a7a7a', lineHeight: 1.6, fontStyle: 'italic', borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                {cfg.recommendedNote}
              </div>
            )}
          </div>
        )}

        {/* Optional */}
        {cfg.optional.length > 0 && (
          <div style={{ padding: '16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tierColors.optional, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Optional</div>
            {cfg.optional.map(item => (
              <div key={item} style={{ fontSize: 14, color: '#a1a1a1', marginBottom: 6, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: '#4a4a4a', flexShrink: 0, marginTop: 1 }}>·</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Sweet spot bar */}
        <div style={{ padding: '14px 16px', background: '#141414', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 13, color: '#a1a1a1', marginBottom: 4 }}>
            Sweet spot: <strong style={{ color: '#fff' }}>{cfg.sweetSpot} people</strong>
          </div>
          <div style={{ fontSize: 12, color: '#7a7a7a', lineHeight: 1.5 }}>{cfg.sweetSpotNote}</div>
        </div>
      </div>

      {/* Invite link section */}
      <div style={{ padding: '20px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>Your invite link:</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: '#141414', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#a1a1a1', fontFamily: 'monospace' }}>
            {inviteLink}
          </div>
          <button onClick={handleCopy} style={{ padding: '0 14px', height: 36, border: `1px solid ${copied ? '#10B981' : 'rgba(255,255,255,0.2)'}`, borderRadius: 8, background: copied ? 'rgba(16,185,129,0.1)' : 'transparent', color: copied ? '#10B981' : '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {copied ? <><Check size={14} />Copied!</> : <><Copy size={14} />Copy</>}
          </button>
        </div>
      </div>

      <button onClick={onLaunch} style={{ width: '100%', height: 48, border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        Launch Contest <ArrowRight size={18} />
      </button>
    </div>
  );
}

// ── Post-Launch Debrief ──
const GROUP_DEMO_ID = { business: 'demo-1', team: 'demo-2', personal: 'demo-3' };

function LaunchedScreen({ group, tc, navigate }) {
  const demoId = GROUP_DEMO_ID[group] || 'demo-1';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes holo-shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .holo-launch-card {
          width: 100%;
          box-sizing: border-box;
          border: 1.5px solid ${tc.color}55;
          border-radius: 16px;
          padding: 32px 28px;
          background: linear-gradient(135deg,
            #0d0d0d 0%,
            rgba(${tc.rgb},0.1) 18%,
            rgba(255,255,255,0.07) 28%,
            rgba(${tc.rgb},0.32) 45%,
            rgba(255,255,255,0.06) 58%,
            rgba(${tc.rgb},0.12) 78%,
            #0d0d0d 100%
          );
          background-size: 400% 400%;
          animation: holo-shimmer 5s ease infinite;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: Inter, sans-serif;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .holo-launch-card:hover {
          transform: translateY(-4px) scale(1.015);
          box-shadow: 0 0 60px ${tc.color}70, 0 0 120px ${tc.color}28, inset 0 0 40px ${tc.color}12;
          border-color: ${tc.color};
          animation-duration: 1.5s;
        }
        .holo-launch-card:active {
          transform: translateY(-1px) scale(1.005);
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, color: '#fff', margin: 0 }}>Here's What to Expect</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
        {/* Card 1 */}
        <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>📅 What Happens Next</div>
          {[
            { range: 'Day 1-2', color: '#3B82F6', label: 'Trickle of submissions (normal)' },
            { range: 'Day 3-5', color: '#eaef09', label: 'Spike in submissions (deadline effect)' },
            { range: 'Day 6-7', color: '#10B981', label: 'Voting opens' },
            { range: 'Day 8-10', color: '#8B5CF6', label: 'Results' },
          ].map(item => (
            <div key={item.range} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#a1a1a1', minWidth: 60 }}>{item.range}</span>
              <span style={{ fontSize: 13, color: '#fff' }}>{item.label}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '10px 12px', background: '#141414', borderRadius: 8, fontSize: 13, color: '#a1a1a1', fontStyle: 'italic' }}>
            "Don't panic if submissions are slow the first 48 hours. Most people submit in the final 2 days."
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>👤 Your Role While It Runs</div>
          <div style={{ marginBottom: 10 }}>
            {['Send a reminder email at Day 4', 'Answer questions participants post'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13, color: '#10B981' }}>
                <Check size={14} weight="bold" />
                <span style={{ color: '#fff' }}>{item}</span>
              </div>
            ))}
          </div>
          {['Tell people your favorite name before voting (anchoring bias)', 'Extend the deadline unless truly necessary'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 13, color: '#ef4444' }}>
              <span style={{ fontWeight: 700 }}>✗</span>
              <span style={{ color: '#a1a1a1' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Card 3 */}
        <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>📊 Typical Participation Rates</div>
          {[
            { label: 'Good', range: '60-70%', color: '#a1a1a1' },
            { label: 'Great', range: '70-85%', color: '#eaef09' },
            { label: 'Elite', range: '>85%', color: '#10B981' },
          ].map(tier => (
            <div key={tier.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '8px 12px', background: '#141414', borderRadius: 8 }}>
              <span style={{ fontSize: 13, color: tier.color, fontWeight: 600 }}>{tier.label}</span>
              <span style={{ fontSize: 13, color: '#fff' }}>{tier.range} participation</span>
            </div>
          ))}
          <div style={{ marginTop: 12, fontSize: 13, color: '#a1a1a1', lineHeight: 1.6 }}>
            What drives it: 1) Clear brief ✓ · 2) Day 4 reminder · 3) Organizer engagement<br />
            <span style={{ color: '#7a7a7a' }}>If participation is &lt;60%, send another reminder and extend deadline by 2 days.</span>
          </div>
        </div>
      </div>

      <button className="holo-launch-card" onClick={() => navigate(`/invite/${demoId}`)}>
        <div style={{ fontSize: 11, fontWeight: 700, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          Ready?
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
          Go Live &amp; Invite Participants →
        </div>
        <div style={{ fontSize: 13, color: '#a1a1a1', marginTop: 4 }}>
          Start spreading the word — the right voices are waiting.
        </div>
      </button>
    </div>
  );
}

// ── Main BriefBuilder ──
export default function BriefBuilder() {
  const { group, subSegment } = useParams();
  const navigate = useNavigate();
  const tc = TIER[group] || TIER.business;

  const contestType = localStorage.getItem('contestType') || 'submission_voting';
  const votingPermissions = localStorage.getItem('votingPermissions') || 'all_participants';
  const voterEmails = localStorage.getItem('voterEmails') || '';
  const voterCount = voterEmails.split('\n').filter(e => e.trim()).length;

  const [step, setStep] = useState('primer');
  const [briefData, setBriefData] = useState({});
  
  const [transitionMode, setTransitionMode] = useState('manual');
  const [randomizeBallot, setRandomizeBallot] = useState(true);
  const [votingDays, setVotingDays] = useState(5);
  const [primerRead, setPrimerRead] = useState(false);

  // Compute and persist creator quality score whenever brief data or primer changes
  const fieldDefs = getFieldDefs(group, subSegment);
  const creatorScore = computeCreatorScore(briefData, group, subSegment, primerRead);
  useEffect(() => {
    saveCreatorQuality(group, creatorScore);
  }, [creatorScore, group]);

  const subSegmentLabel = subSegment?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const groupLabel = group?.charAt(0).toUpperCase() + group?.slice(1);

  function renderFormFields() {
    if (group === 'team') {
      if (subSegment === 'sports-team') return <T1Fields data={briefData} setData={setBriefData} tc={tc} />;
      if (subSegment === 'band-music') return <T2Fields data={briefData} setData={setBriefData} tc={tc} />;
      if (subSegment === 'podcast-channel') return <T3Fields data={briefData} setData={setBriefData} tc={tc} />;
      if (subSegment === 'civic-school-nonprofit') return <T4Fields data={briefData} setData={setBriefData} tc={tc} />;
      if (subSegment === 'gaming-group') return <T5Fields data={briefData} setData={setBriefData} tc={tc} />;
      if (subSegment === 'other-team') return <T6Fields data={briefData} setData={setBriefData} tc={tc} />;
      return <GenericFields data={briefData} setData={setBriefData} tc={tc} />;
    }
    if (group === 'personal') {
      if (subSegment === 'baby-name') return <P1Fields data={briefData} setData={setBriefData} tc={tc} />;
      if (subSegment === 'pet-name') return <P2Fields data={briefData} setData={setBriefData} tc={tc} />;
      if (subSegment === 'home-property-fun') return <P3Fields data={briefData} setData={setBriefData} tc={tc} />;
      return <GenericFields data={briefData} setData={setBriefData} tc={tc} />;
    }
    // Business (B1-B5)
    if (subSegment === 'product-name') return <B2Fields data={briefData} setData={setBriefData} tc={tc} />;
    if (subSegment === 'project-name') return <B3Fields data={briefData} setData={setBriefData} tc={tc} />;
    return <B1Fields data={briefData} setData={setBriefData} tc={tc} subSegment={subSegment} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
      {/* Nav bar */}
      <div style={{ height: 56, background: '#141414', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, background: '#eaef09', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={13} weight="bold" color="#000" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>NamingContest</span>
        </Link>
        {step === 'brief' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
            <button onClick={() => setStep('primer')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a7a', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <span style={{ color: '#7a7a7a', fontSize: 13 }}>·</span>
            <span style={{ fontSize: 13, color: '#a1a1a1' }}>{groupLabel}</span>
            <span style={{ color: '#7a7a7a', fontSize: 13 }}>→</span>
            <span style={{ fontSize: 13, color: '#fff' }}>{subSegmentLabel}</span>
          </div>
        )}
        {step === 'articles' && (
          <button onClick={() => setStep('primer')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a7a', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginLeft: 16 }}>
            <ArrowLeft size={14} /> Back
          </button>
        )}
        {step === 'invite' && (
          <button onClick={() => setStep('brief')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a7a', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginLeft: 16 }}>
            <ArrowLeft size={14} /> Back to Brief
          </button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: '3px 10px', background: `rgba(${tc.rgb},0.1)`, border: `0.5px solid rgba(${tc.rgb},0.3)`, borderRadius: 20, fontSize: 11, fontWeight: 600, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {groupLabel}
          </div>
        </div>
      </div>

      {/* Primer Modal Overlay */}
      {step === 'primer' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>~90 seconds to read</div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, color: '#fff', marginBottom: 20, lineHeight: 1.3 }}>
              {getPrimerTitle(subSegment)}
            </h2>
            {getPrimerContent(group, subSegment, tc)}
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => setStep('articles')} style={{ height: 48, border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <BookOpen size={18} /> Read the Naming Strategy Guides
              </button>
              <button onClick={() => setStep('brief')} style={{ height: 36, border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'transparent', color: '#a1a1a1', fontSize: 13, cursor: 'pointer' }}>
                Skip guides (I've done this before)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creator Education Articles — Touchpoint 2 */}
      {step === 'articles' && (
        <CreatorArticlesScreen subSegment={subSegment} tc={tc} onContinue={() => { setPrimerRead(true); setStep('brief'); }} />
      )}

      {/* Brief Form */}
      {step === 'brief' && (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
          {/* ── Contest Quality Bar ── */}
          <div style={{ marginBottom: 32, padding: '16px 18px', background: '#111', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: tc.color }}>
                Contest Quality
              </div>
              <div style={{ fontSize: 11, color: '#555' }}>Step 1 of 2</div>
            </div>

            {/* Bar */}
            <div style={{ position: 'relative', height: 8, borderRadius: 4, background: '#1e1e1e' }}>
              {/* Creator fill */}
              <div style={{
                position: 'absolute', left: 0, top: 0, height: '100%',
                width: `${creatorScore}%`,
                background: `linear-gradient(90deg, ${tc.color}cc, ${tc.color})`,
                borderRadius: 4, transition: 'width 0.4s ease',
              }} />
              {/* Midpoint divider */}
              <div style={{
                position: 'absolute', left: '50%', top: -3, bottom: -3,
                width: 1.5, background: 'rgba(255,255,255,0.18)', borderRadius: 1,
              }} />
              {/* Right half (participant zone) */}
              <div style={{
                position: 'absolute', left: '50%', right: 0, top: 0, height: '100%',
                background: 'rgba(255,255,255,0.03)', borderRadius: '0 4px 4px 0',
              }} />
            </div>

            {/* Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: creatorScore >= 40 ? tc.color : '#a1a1a1' }}>
                Your setup: <span style={{ color: tc.color }}>{creatorScore}</span>/50
                {primerRead && <span style={{ marginLeft: 6, fontSize: 10, color: '#555' }}>+10 guides read</span>}
              </div>
              <div style={{ fontSize: 11, color: '#383838' }}>
                ← participants fill the other half →
              </div>
            </div>

            {/* Field completion detail */}
            <div style={{ marginTop: 6, fontSize: 11, color: '#444' }}>
              {fieldDefs.filter(k => briefData[k] !== undefined && briefData[k] !== '' && briefData[k] !== null).length}/{fieldDefs.length} fields complete
              {!primerRead && <span style={{ marginLeft: 8, color: '#333' }}>· +10 pts if you read the guides</span>}
            </div>
          </div>

          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, color: '#fff', marginBottom: 8 }}>Build Your Brief</h1>
          <p style={{ color: '#a1a1a1', fontSize: 14, marginBottom: 32 }}>This context helps participants submit better names. Be specific — the more detail you share, the better the results.</p>

          {renderFormFields()}

          {/* ── Affiliate Nudge — contextual to sub-segment ── */}
          {(subSegment === 'company-name' || subSegment === 'rebrand') && (
            <div style={{ marginTop: 24, padding: '18px 20px', background: '#1a1a1a', border: '0.5px solid rgba(249,115,22,0.25)', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#f97316' }} />
              <div style={{ fontSize: 9, fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Business Formation · LegalZoom · Sponsored
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Ready to make it official?</div>
              <div style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 14, lineHeight: 1.5 }}>
                Once you have your name, register your LLC or corporation in minutes. LegalZoom handles the paperwork so you can focus on the launch.
              </div>
              <a href="#" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: '#f97316', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Register your business →
              </a>
            </div>
          )}

          {subSegment === 'baby-name' && (
            <div style={{ marginTop: 24, padding: '18px 20px', background: '#1a1a1a', border: '0.5px solid rgba(16,185,129,0.25)', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#10B981' }} />
              <div style={{ fontSize: 9, fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Resource · Amazon · Sponsored
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Need more inspiration?</div>
              <div style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 14, lineHeight: 1.5 }}>
                Explore the most comprehensive baby name book — meanings, origins, and trends. Great if you want to check that the shortlist includes the right options.
              </div>
              <a href="#" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, background: '#10B981', color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Browse baby name books →
              </a>
            </div>
          )}

          {/* ── Phase Transition Settings ── */}
          <div style={{ marginTop: 32, paddingTop: 28, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Phase Transition Settings</div>

            {/* When submissions close */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 10 }}>When submissions close:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { value: 'manual', label: 'Manual review first (recommended)', desc: 'You review submissions, create a shortlist (5-12 names), then open voting. Shows curation guide.' },
                  { value: 'automatic', label: 'Automatic transition to voting', desc: `All ${contestType === 'internal_brainstorm' ? 'submitted' : 'names go to the'} ballot immediately after the submission deadline.` },
                ].map(opt => (
                  <label key={opt.value} onClick={() => { setTransitionMode(opt.value); localStorage.setItem('transitionMode', opt.value); window.dispatchEvent(new Event('storage')); }} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', background: transitionMode === opt.value ? `rgba(${tc.rgb},0.05)` : '#1a1a1a', border: `0.5px solid ${transitionMode === opt.value ? `rgba(${tc.rgb},0.4)` : 'rgba(255,255,255,0.08)'}`, borderRadius: 9, cursor: 'pointer' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${transitionMode === opt.value ? tc.color : '#444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      {transitionMode === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: tc.color }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: '#7a7a7a', lineHeight: 1.5, marginTop: 2 }}>{opt.desc}</div>
                      {opt.value === 'automatic' && transitionMode === 'automatic' && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, cursor: 'pointer' }}>
                          <input type="checkbox" checked={randomizeBallot} onChange={e => setRandomizeBallot(e.target.checked)} style={{ accentColor: tc.color }} />
                          <span style={{ fontSize: 12, color: '#a1a1a1' }}>Randomize ballot order</span>
                        </label>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Voting duration */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Voting duration:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {[2, 3, 5, 7, 10].map(d => (
                  <button key={d} onClick={() => setVotingDays(d)} style={{ width: 44, height: 36, border: `1px solid ${votingDays === d ? tc.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, background: votingDays === d ? `rgba(${tc.rgb},0.1)` : 'transparent', color: votingDays === d ? tc.color : '#a1a1a1', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    {d}d
                  </button>
                ))}
                <span style={{ fontSize: 12, color: '#7a7a7a', marginLeft: 4 }}>
                  → Closes {new Date(Date.now() + votingDays * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Voting permissions summary */}
            <div style={{ padding: '12px 16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1a1' }}>Voting permissions</div>
                <div style={{ fontSize: 13, color: '#fff', marginTop: 2 }}>
                  {contestType === 'voting_only'
                    ? votingPermissions === 'all_participants'
                      ? 'Anyone invited can vote'
                      : voterCount > 0
                        ? `Only specific people: ${voterCount} added`
                        : 'Only specific people (none added yet)'
                    : votingPermissions === 'all_participants'
                      ? 'Everyone who submitted can vote'
                      : voterCount > 0
                        ? `Only selected voters: ${voterCount} people`
                        : 'Only selected voters (none added yet)'}
                </div>
              </div>
              {contestType === 'voting_only'
                ? <span style={{ fontSize: 12, color: '#7a7a7a', fontStyle: 'italic' }}>You'll invite voters in the next stage</span>
                : <button onClick={() => navigate(-3)} style={{ fontSize: 12, color: tc.color, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Edit voter list</button>
              }
            </div>
          </div>

          <button onClick={() => setStep('launched')} style={{ width: '100%', height: 48, border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Review <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Launch Screen */}
      {step === 'launched' && (
        <LaunchedScreen group={group} tc={tc} navigate={navigate} />
      )}
    </div>
  );
}
