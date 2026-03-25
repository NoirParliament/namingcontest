import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import namicoIcon from '../assets/namico-icon.svg';
import {
  ArrowLeft, BookOpen, CurrencyDollar, TreeStructure, Lightbulb,
  Warning, CaretRight, ArrowSquareOut, Users, Star, Trophy,
  ChartBar, ShieldCheck, Scales, Gift, Lightning, Crosshair,
  CheckCircle, Clock, FileText, Palette, Globe, Tag,
  Wrench, User
} from '@phosphor-icons/react';

/* ── Section IDs ── */
const SECTIONS = [
  { id: 'journey-tracker', label: 'Journey Tracker', icon: <Lightbulb size={14} weight="light" /> },
  { id: 'paywall-sim', label: 'Paywall Simulation', icon: <CurrencyDollar size={14} weight="light" /> },
  { id: 'affiliate-sim', label: 'Affiliate Simulation', icon: <Gift size={14} weight="light" /> },
  { id: 'platform-flow', label: 'Platform Flow', icon: <TreeStructure size={14} weight="light" /> },
  { id: 'screens', label: 'Screen Breakdown', icon: <BookOpen size={14} weight="light" /> },
  { id: 'segments', label: 'Segments & Sub-types', icon: <Tag size={14} weight="light" /> },
  { id: 'quality-score', label: 'Quality Score System', icon: <ChartBar size={14} weight="light" /> },
  { id: 'contest-types', label: 'Contest Types', icon: <Scales size={14} weight="light" /> },
  { id: 'pricing', label: 'Pricing Strategy', icon: <CurrencyDollar size={14} weight="light" /> },
  { id: 'revenue', label: 'Revenue Projections', icon: <ChartBar size={14} weight="light" /> },
  { id: 'infra-costs', label: 'Infrastructure Costs', icon: <Globe size={14} weight="light" /> },
  { id: 'scope', label: 'Wireframe Scope', icon: <Warning size={14} weight="light" /> },
  { id: 'roadmap', label: 'Project Roadmap - Action Required', icon: <Lightning size={14} weight="bold" />, highlight: true },
];

/* ── Reusable Components ── */
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#eaef09', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
      {children}
    </div>
  );
}

function SectionHeading({ id, children }) {
  return (
    <h2 id={id} style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8, scrollMarginTop: 80 }}>
      {children}
    </h2>
  );
}

function SubHeading({ children }) {
  return (
    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 12, marginTop: 32 }}>
      {children}
    </h3>
  );
}

function Paragraph({ children }) {
  return (
    <p style={{ fontSize: 14, color: '#a1a1a1', lineHeight: 1.75, marginBottom: 16, maxWidth: 720 }}>
      {children}
    </p>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px', marginBottom: 16, ...style }}>
      {children}
    </div>
  );
}

function DataTable({ headers, rows, compact = false }) {
  const cellPad = compact ? '8px 12px' : '12px 16px';
  return (
    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: compact ? 12 : 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: cellPad, borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#eaef09', fontWeight: 700, fontSize: compact ? 11 : 12, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : '#141414' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: cellPad, borderBottom: '0.5px solid rgba(255,255,255,0.05)', color: ci === 0 ? '#fff' : '#a1a1a1', fontWeight: ci === 0 ? 600 : 400, whiteSpace: compact ? 'nowrap' : 'normal' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '48px 0' }} />;
}

function Badge({ color, icon, children }) {
  const colors = {
    yellow: { bg: 'rgba(234,239,9,0.1)', border: 'rgba(234,239,9,0.3)', text: '#eaef09' },
    purple: { bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)', text: '#8B5CF6' },
    green: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', text: '#10B981' },
    blue: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
    grey: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.15)', text: '#a1a1a1' },
  };
  const c = colors[color] || colors.grey;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: c.bg, border: `0.5px solid ${c.border}`, fontSize: 11, fontWeight: 700, color: c.text, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {icon}{children}
    </span>
  );
}

/* ── Flow Diagram ── */
function FlowDiagram() {
  const nodeStyle = (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 8,
    background: `rgba(${color},0.06)`, border: `1px solid rgba(${color},0.25)`,
    fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap',
  });
  const arrow = { color: '#444', fontSize: 11, margin: '0 4px' };
  const branchLine = { borderLeft: '2px solid rgba(255,255,255,0.08)', marginLeft: 20, paddingLeft: 16, paddingTop: 8, paddingBottom: 8 };
  const c = { y: '234,239,9', p: '139,92,246', g: '16,185,129', w: '255,255,255' };

  return (
    <Card style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Landing */}
        <div style={nodeStyle(c.w)}>Landing Page</div>
        <div style={arrow}><CaretRight size={10} /> Select Segment</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 20 }}>
          <span style={nodeStyle(c.y)}>Business ($89)</span>
          <span style={nodeStyle(c.p)}>Team ($29)</span>
          <span style={nodeStyle(c.g)}>Personal ($9)</span>
        </div>
        <div style={arrow}><CaretRight size={10} /> Auth / Sign Up <CaretRight size={10} /> Select Sub-type <CaretRight size={10} /> Contest Type</div>

        {/* Branches */}
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Open Contest */}
          <div>
            <Badge color="yellow">Open Contest</Badge>
            <div style={branchLine}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', fontSize: 12, color: '#a1a1a1' }}>
                <span style={{ color: '#eaef09' }}>Brief Builder</span> <CaretRight size={9} />
                <span>Invite Participants</span> <CaretRight size={9} />
                <span>Contest Overview</span> <CaretRight size={9} />
                <span style={{ color: '#10B981' }}>Submission Phase</span> <CaretRight size={9} />
                <span style={{ color: '#f97316' }}>[Curate Shortlist]</span> <CaretRight size={9} />
                <span style={{ color: '#3b82f6' }}>Voting Phase</span> <CaretRight size={9} />
                <span style={{ color: '#ec4899' }}>Results</span>
              </div>
            </div>
          </div>
          {/* Voting Only */}
          <div>
            <Badge color="purple">Voting Only</Badge>
            <div style={branchLine}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', fontSize: 12, color: '#a1a1a1' }}>
                <span style={{ color: '#eaef09' }}>Upload Names</span> <CaretRight size={9} />
                <span>Invite Participants</span> <CaretRight size={9} />
                <span>Contest Overview</span> <CaretRight size={9} />
                <span style={{ color: '#3b82f6' }}>Voting Phase</span> <CaretRight size={9} />
                <span style={{ color: '#ec4899' }}>Results</span>
              </div>
            </div>
          </div>
          {/* Internal Brainstorm */}
          <div>
            <Badge color="green">Internal Brainstorm</Badge>
            <div style={branchLine}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', fontSize: 12, color: '#a1a1a1' }}>
                <span style={{ color: '#eaef09' }}>Brief Builder</span> <CaretRight size={9} />
                <span>Invite Submitters</span> <CaretRight size={9} />
                <span>Contest Overview</span> <CaretRight size={9} />
                <span style={{ color: '#10B981' }}>Submission Phase</span> <CaretRight size={9} />
                <span style={{ color: '#f97316' }}>[Curate Shortlist]</span> <CaretRight size={9} />
                <span>Invite Voters</span> <CaretRight size={9} />
                <span style={{ color: '#3b82f6' }}>Voting Phase</span> <CaretRight size={9} />
                <span style={{ color: '#ec4899' }}>Results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div style={{ marginTop: 16 }}>
          <div style={arrow}><CaretRight size={10} /> Dashboard (all contests) <CaretRight size={10} /> Contest Detail</div>
        </div>
      </div>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════════════ */
export default function DocumentationPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const mainRef = useRef(null);

  /* Track scroll position to highlight sidebar */
  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;
    const onScroll = () => {
      const ids = SECTIONS.map(s => s.id);
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top < 160) {
          setActiveSection(ids[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif', display: 'flex' }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 240, background: '#0f0f0f', borderRight: '0.5px solid rgba(255,255,255,0.06)', position: 'fixed', top: 0, bottom: 0, left: 0, display: 'flex', flexDirection: 'column', padding: '20px 12px', zIndex: 10, overflowY: 'auto' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 24, padding: '0 8px' }}>
          <div style={{ width: 28, height: 28, background: '#eaef09', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={namicoIcon} alt="Namico" style={{ width: 18, height: 18, display: 'block' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Namico</span>
        </Link>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#a1a1a1', fontSize: 13, cursor: 'pointer', marginBottom: 24 }}>
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ fontSize: 10, fontWeight: 700, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px', marginBottom: 8 }}>Documentation</div>

        {/* Nav items */}
        {SECTIONS.map((s, si) => (
          <div key={s.id}>
            {s.highlight && <div style={{ height: 1, background: 'rgba(234,239,9,0.15)', margin: '12px 10px 10px' }} />}
            <a
              href={`#${s.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                height: s.highlight ? 40 : 34,
                padding: s.highlight ? '0 12px' : '0 10px',
                borderRadius: 8,
                textDecoration: 'none', fontSize: 12, marginBottom: 1,
                background: s.highlight
                  ? (activeSection === s.id ? 'rgba(234,239,9,0.15)' : 'rgba(234,239,9,0.06)')
                  : (activeSection === s.id ? 'rgba(234,239,9,0.1)' : 'transparent'),
                color: s.highlight
                  ? '#eaef09'
                  : (activeSection === s.id ? '#eaef09' : '#7a7a7a'),
                fontWeight: s.highlight ? 700 : (activeSection === s.id ? 600 : 400),
                transition: 'all 0.15s',
                border: s.highlight ? '0.5px solid rgba(234,239,9,0.2)' : 'none',
                animation: s.highlight ? 'sidebarPulse 3s ease-in-out infinite' : 'none',
              }}
            >
              {s.icon} {s.label}
            </a>
          </div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div ref={mainRef} style={{ flex: 1, marginLeft: 240, padding: '40px 48px', maxWidth: 900 }}>

        {/* Page title */}
        <div style={{ marginBottom: 48 }}>
          <SectionLabel>Phase 2 Wireframe</SectionLabel>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            Namico Documentation
          </h1>
          <Paragraph>
            Complete feature specification, platform architecture, pricing strategy, and revenue model for the Namico naming contest platform. All data in this document reflects the current wireframe build.
          </Paragraph>

          {/* Namico disclaimer */}
          <div style={{ padding: '16px 20px', background: 'rgba(234,239,9,0.04)', border: '1px solid rgba(234,239,9,0.15)', borderRadius: 10 }}>
            <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.7 }}>
              <strong style={{ color: '#eaef09' }}>A note on the name:</strong> "Namico" is a working title — a feminine name derived from "Naming Contest" — created to personalize the platform during development. It is recommended to keep this personalization strategy for the final product: retain the current URL (namingcontest.com) for SEO and clarity, while using "Namico" as the brand personality throughout the interface. This makes the system feel like a friendly assistant guiding you through the naming process, rather than a complex, unnavigable system. Alternatively, the platform can simply use "Naming Contest" in all placements, or adopt a different naming agent name entirely.
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: JOURNEY TRACKER
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Development Tool</SectionLabel>
        <SectionHeading id="journey-tracker">How to Use the Journey Tracker</SectionHeading>
        <Paragraph>
          The floating widget in the bottom-right corner is a development-only tool for navigating the wireframe prototype. It will not appear in the production build. It shows your current position in the Namico flow and distinguishes between two roles:
        </Paragraph>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Badge color="yellow" icon={<Wrench size={10} weight="bold" />}>Creator</Badge>
            </div>
            <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.6 }}>
              The person who creates the naming contest, writes the brief, invites participants, curates the shortlist, and manages the process end-to-end.
            </div>
          </Card>
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Badge color="blue" icon={<User size={10} weight="bold" />}>Participant</Badge>
            </div>
            <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.6 }}>
              The person invited to participate — submitting name ideas, voting on candidates, or both. They see the education content and earn naming points.
            </div>
          </Card>
        </div>

        <SubHeading>Navigation</SubHeading>
        <Paragraph>
          Use the Prev and Next Step buttons to walk through the flow step by step. You can also click any step circle to jump directly to that screen. The progress bar shows overall completion. At the final step, the button reads "Journey Complete".
        </Paragraph>

        <Divider />

        {/* ── Paywall Simulation ── */}
        <SectionLabel>Monetization</SectionLabel>
        <SectionHeading id="paywall-sim">Paywall Simulation</SectionHeading>
        <Paragraph>
          The paywall simulator shows every place where a free user would encounter an upgrade prompt. It demonstrates the freemium model: users can run a basic contest for free, but meaningful features require a paid contest.
        </Paragraph>

        <SubHeading>What's Free</SubHeading>
        <Card>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Voting-only mode', 'Up to 5 participants', 'Simple poll voting', 'Basic analytics', 'Shareable URL', 'Brief builder', 'Anonymous voting'].map(f => (
              <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.08)', border: '0.5px solid rgba(16,185,129,0.2)', fontSize: 12, color: '#10B981' }}>
                <CheckCircle size={12} weight="fill" /> {f}
              </span>
            ))}
          </div>
        </Card>

        <SubHeading>All Paywall Moments (9 per segment)</SubHeading>
        <DataTable
          headers={['#', 'Moment', 'Where', 'Trigger', 'Type']}
          rows={[
            ['1', 'Open Submissions', 'Brief Builder', 'Toggling "Let participants suggest names"', 'Toggle gate'],
            ['2', 'Participant Cap', 'Invite Participants', 'Exceeding free limit (5 participants)', 'Cap gate'],
            ['3', 'Advanced Voting', 'Contest Type Selection', 'Selecting ranked-choice, pairwise, or multi-criteria', 'Method gate'],
            ['4', 'Naming Methodology', 'Participant Education', 'Accessing Catchword naming articles', 'Articles gate'],
            ['5', 'Contest Quality Score', 'Brief Builder sidebar', 'Viewing the quality score bar (business/team only)', 'Quality gate'],
            ['6', 'Automated Reminders', 'Brief Builder — Deadlines', 'Setting up participant email reminders', 'Reminders gate'],
            ['7', 'PDF Report', 'Results Page', 'Clicking "Download PDF Report" (business/team only)', 'PDF gate'],
            ['8', 'White-label Branding', 'PDF / Participant View', 'Previewing output with "Powered by Namico" footer', 'Branding gate'],
            ['9', 'Second Round Discount', 'Results Page', 'Selecting "We\'re still not sure" after results', 'Discount offer'],
          ]}
        />

        <Paragraph>
          Prices scale by segment: Personal ($9), Team ($29), Business ($89). The second-round discount is always 50% off the segment price. All free contests cap at 5 participants regardless of segment.
        </Paragraph>

        <Divider />

        {/* ── Affiliate Simulation ── */}
        <SectionLabel>Revenue</SectionLabel>
        <SectionHeading id="affiliate-sim">Affiliate Simulation</SectionHeading>
        <Paragraph>
          The affiliate simulator shows contextual partner recommendations that appear primarily on the Results Page. These are upsells that generate affiliate revenue — each placement is matched to the user's segment and sub-type so it feels relevant, not spammy.
        </Paragraph>

        <SubHeading>Business Placements</SubHeading>
        <DataTable
          compact
          headers={['Placement', 'Partner', 'Where', 'Context']}
          rows={[
            ['Domain Check', 'Namecheap', 'Results Page', 'Check domain availability for winning name'],
            ['Trademark Search', 'LegalZoom', 'Results Page', 'Professional trademark conflict search'],
            ['Logo Design', 'Looka / 99designs', 'Results Page', 'AI logos or full design contest'],
            ['Business Registration', 'LegalZoom', 'Results Page', 'LLC/corporation formation'],
            ['Catchword Services *', 'Catchword Branding (own service)', 'Results Page — All Paths', 'Confident: brand identity upsell; Unhappy: professional naming upsell'],
            ['Naming & Branding Guide', 'Amazon', 'Brief Builder', 'Expert naming strategy books to improve brief quality'],
          ]}
        />

        <SubHeading>Team Placements</SubHeading>
        <DataTable
          compact
          headers={['Placement', 'Partner', 'Where', 'Context']}
          rows={[
            ['Team Merchandise', 'Printful', 'Results Page', 'Print team name on jerseys and gear'],
            ['Team Logo', '99designs', 'Results Page', 'Professional team logo design'],
            ['Team Website', 'Squarespace', 'Results Page', 'Build a team website'],
            ['Domain Check', 'Namecheap', 'Results Page', 'Secure the team domain'],
          ]}
        />

        <SubHeading>Personal Placements</SubHeading>
        <DataTable
          compact
          headers={['Placement', 'Partner', 'Where', 'Context']}
          rows={[
            ['Birth Announcement', 'Artifact Uprising', 'Results Page', 'Premium printed announcement cards'],
            ['Personalised Gift', 'Etsy', 'Results Page', 'Gifts featuring the chosen name'],
            ['Baby Name Guide', 'Amazon', 'Brief Builder', 'Comprehensive name inspiration books'],
            ['Pet ID Tag', 'Chewy', 'Results Page', 'Custom pet tags and accessories'],
          ]}
        />

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2: FEATURE SPECIFICATION
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Architecture</SectionLabel>
        <SectionHeading id="platform-flow">Platform Architecture & Flow</SectionHeading>
        <Paragraph>
          Namico supports three contest types across three segments, with 15 sub-types total. Every flow starts at the Landing Page and ends at the Results Page. The flow diagram below shows all possible paths.
        </Paragraph>

        <FlowDiagram />

        <Paragraph>
          Steps in [brackets] are conditional — the Curate Shortlist step only appears when the creator selects manual transition mode (vs. automatic). The Internal Brainstorm type splits invitations into two phases: submitters first, then voters.
        </Paragraph>

        <Divider />

        {/* ── Screen Breakdown ── */}
        <SectionLabel>Screens</SectionLabel>
        <SectionHeading id="screens">Screen-by-Screen Breakdown</SectionHeading>

        {[
          { name: 'Landing Page', path: '/', role: 'Public', desc: 'Marketing page with hero animation, social proof (Catchword Branding clients marquee), three segment cards with pricing, methodology section explaining Catchword\'s naming framework, testimonials, FAQ, and feature breakdown comparison.' },
          { name: 'Select Segment', path: '/select', role: 'Creator', desc: 'Choose between Business ($89, up to 240 participants), Team ($29, up to 60), or Personal ($9, up to 15). Cards show pricing, key features, and segment-specific messaging.' },
          { name: 'Auth / Sign Up', path: '/auth', role: 'Creator', desc: 'Email/password authentication or social login. Captures user before they invest time in the brief.' },
          { name: 'Select Sub-type', path: '/select/:group', role: 'Creator', desc: 'Pick the specific naming need within your segment. Business has 5 options (company, product, project, rebrand, other). Team has 6 (sports, band, podcast, civic, gaming, other). Personal has 4 (baby, pet, home, other).' },
          { name: 'Contest Type', path: '/contest-type/:group/:sub', role: 'Creator', desc: 'Choose between Open Contest (participants submit + vote), Voting Only (creator pre-loads names), or Internal Brainstorm (separate submitter and voter groups). Also select the voting method.' },
          { name: 'Brief Builder', path: '/brief/:group/:sub', role: 'Creator', desc: 'Multi-step form that adapts to the sub-type. Starts with a naming primer (methodology introduction), then context-specific fields (1-8 required depending on sub-type), voting configuration, optional prizes, and deadline. Each completed field contributes to the Creator Quality Score.' },
          { name: 'Upload Names', path: '/upload-names', role: 'Creator', desc: 'For Voting Only contests: creator pre-loads the candidate names that participants will vote on. Skips the submission phase entirely.' },
          { name: 'Invite Participants', path: '/invite/:contestId', role: 'Creator', desc: 'Share the contest link, manage voter/submitter email list, send invitations. Shows participant count against the segment limit (5 free, 15/60/240 paid).' },
          { name: 'Contest Overview', path: '/contest-detail/:contestId', role: 'Creator', desc: 'Single-contest dashboard: phase tracker, submissions list with vote counts, participation stats, quality score widget, quick actions (remind, extend deadline, export). Shows real-time progress.' },
          { name: 'Submission Phase', path: '/contest/:contestId', role: 'Participant', desc: 'Submit name ideas with optional rationale. View education content (Catchword naming methodology articles). Earn naming points that contribute to the Participant Quality Score.' },
          { name: 'Curate Shortlist', path: '(within Contest Overview)', role: 'Creator', desc: 'Review all submissions and select finalists for the voting round. Only appears when manual transition mode is selected. Creator sees vote counts, rationale, and can shortlist the strongest candidates.' },
          { name: 'Voting Phase', path: '/vote/:contestId', role: 'Participant', desc: 'Vote on shortlisted names using the selected voting method (simple poll, ranked choice, pairwise comparison, multi-criteria, or weighted voting). Anonymous by default.' },
          { name: 'Results Page', path: '/results/:contestId', role: 'Both', desc: 'Winner announcement with particle animation and countdown reveal. Vote breakdown, sentiment analysis, affiliate recommendations, official naming certificate with branding toggle (Catchword vs white-label), social sharing, and post-vote reflection with second-round discount option.' },
          { name: 'Dashboard', path: '/dashboard', role: 'Creator', desc: 'Multi-contest management: active contests with progress bars, completed contests with winners, account overview (total contests, participants reached, participation rate), and subscription status.' },
        ].map((screen, i) => (
          <Card key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{screen.name}</span>
              <Badge color={screen.role === 'Creator' ? 'yellow' : screen.role === 'Participant' ? 'blue' : 'grey'} icon={screen.role === 'Creator' ? <Wrench size={10} weight="bold" /> : screen.role === 'Participant' ? <User size={10} weight="bold" /> : null}>{screen.role}</Badge>
              <span style={{ fontSize: 11, color: '#7a7a7a', fontFamily: 'monospace' }}>{screen.path}</span>
            </div>
            <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.65 }}>{screen.desc}</div>
          </Card>
        ))}

        <Divider />

        {/* ── Segments ── */}
        <SectionLabel>Segments</SectionLabel>
        <SectionHeading id="segments">Segments & Sub-types</SectionHeading>

        {[
          {
            name: 'Business', color: '#eaef09', rgb: '234,239,9', price: '$89', participants: '240',
            subs: [
              { code: 'B1', name: 'Company or Startup Name', fields: 6, tone: 'Professional' },
              { code: 'B2', name: 'Product or Service Name', fields: 6, tone: 'Professional' },
              { code: 'B3', name: 'Project or Initiative Name', fields: 5, tone: 'Professional' },
              { code: 'B4', name: 'Rebrand', fields: 8, tone: 'Professional' },
              { code: 'B5', name: 'Other Business Naming', fields: 6, tone: 'Professional' },
            ]
          },
          {
            name: 'Team', color: '#8B5CF6', rgb: '139,92,246', price: '$29', participants: '60',
            subs: [
              { code: 'T1', name: 'Sports Team', fields: 3, tone: 'Energetic' },
              { code: 'T2', name: 'Band or Music Group', fields: 6, tone: 'Creative' },
              { code: 'T3', name: 'Podcast, Channel, or Creative Project', fields: 6, tone: 'Creative' },
              { code: 'T4', name: 'School, Club, Nonprofit, or Civic Org', fields: 7, tone: 'Collaborative' },
              { code: 'T5', name: 'Gaming Group', fields: 3, tone: 'Fun' },
              { code: 'T6', name: 'Other Team or Group', fields: 4, tone: 'Friendly' },
            ]
          },
          {
            name: 'Personal', color: '#10B981', rgb: '16,185,129', price: '$9', participants: '15',
            subs: [
              { code: 'P1', name: 'Baby Name', fields: 1, tone: 'Warm' },
              { code: 'P2', name: 'Pet Name', fields: 1, tone: 'Playful' },
              { code: 'P3', name: 'Home, Property, or Something Fun', fields: 2, tone: 'Lighthearted' },
              { code: 'P4', name: 'Other Personal Naming', fields: 3, tone: 'Casual' },
            ]
          },
        ].map(seg => (
          <div key={seg.name} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: seg.color }} />
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{seg.name}</span>
              <span style={{ fontSize: 13, color: '#7a7a7a' }}>{seg.price} / up to {seg.participants} participants</span>
            </div>
            <DataTable
              compact
              headers={['Code', 'Sub-type', 'Brief Fields', 'Tone']}
              rows={seg.subs.map(s => [s.code, s.name, String(s.fields), s.tone])}
            />
          </div>
        ))}

        <Divider />

        {/* ── Quality Score ── */}
        <SectionLabel>Scoring</SectionLabel>
        <SectionHeading id="quality-score">Contest Quality Score System</SectionHeading>
        <Paragraph>
          Naming is a collaborative task. The quality of the result depends equally on how well the creator prepares the brief and how engaged participants are. The double-sided quality score (0-100) makes this visible to both sides — creating shared accountability and replacing the chaos of "just throw names in a Google Doc" with structured guidance.
        </Paragraph>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Badge color="yellow" icon={<Wrench size={10} weight="bold" />}>Creator Score</Badge>
              <span style={{ fontSize: 13, color: '#7a7a7a' }}>0-50 points</span>
            </div>
            <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.65 }}>
              <div style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Field completion (40 pts):</strong> Each required brief field is worth an equal share of 40 points. Auto-scales — if a sub-type has 6 fields, each is worth ~6.7 points.</div>
              <div><strong style={{ color: '#fff' }}>Naming primer (10 pts):</strong> Bonus for reading the methodology introduction before building the brief.</div>
            </div>
          </Card>
          <Card style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Badge color="blue" icon={<User size={10} weight="bold" />}>Participant Score</Badge>
              <span style={{ fontSize: 13, color: '#7a7a7a' }}>0-50 points</span>
            </div>
            <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.65 }}>
              <div style={{ marginBottom: 8 }}><strong style={{ color: '#fff' }}>Articles read (25 pts):</strong> Based on completion percentage of Catchword naming methodology articles.</div>
              <div><strong style={{ color: '#fff' }}>Naming points earned (25 pts):</strong> Based on participation activity — submissions, votes, quality of rationale.</div>
            </div>
          </Card>
        </div>

        <SubHeading>Quality Labels</SubHeading>
        <DataTable
          compact
          headers={['Score Range', 'Label', 'What It Means']}
          rows={[
            ['85-100', 'Excellent', 'Both sides fully prepared — high-confidence result'],
            ['65-84', 'Strong', 'Solid preparation and engagement — reliable result'],
            ['45-64', 'Good', 'Adequate effort — result is usable but could be stronger'],
            ['25-44', 'Fair', 'Gaps in preparation or participation — result may need review'],
            ['0-24', 'Low', 'Minimal effort — consider re-running with better preparation'],
          ]}
        />

        <Paragraph>
          The score is visible to both sides during the contest. Creators can see which brief fields are boosting their score. Participants see their education progress and naming points. This transparency motivates both sides to invest effort — because they can see it matters.
        </Paragraph>

        <Divider />

        {/* ── Contest Types ── */}
        <SectionLabel>Contest Types</SectionLabel>
        <SectionHeading id="contest-types">Contest Types Explained</SectionHeading>

        <DataTable
          headers={['Type', 'Flow Length', 'Who Submits Names?', 'Who Votes?', 'Best For']}
          rows={[
            ['Open Contest', 'Full (13 steps)', 'Participants', 'Same participants', 'Crowdsourcing ideas from a group'],
            ['Voting Only', 'Short (11 steps)', 'Creator pre-loads', 'Participants', 'Already have candidates, need a decision'],
            ['Internal Brainstorm', 'Extended (14 steps)', 'Submitter group', 'Separate voter group', 'Splitting ideation from evaluation'],
          ]}
        />

        <Paragraph>
          All types support all voting methods (simple poll, ranked-choice, pairwise comparison, multi-criteria, weighted). Advanced methods require a paid contest. The Curate Shortlist step is optional in Open Contest and Internal Brainstorm — it only appears when the creator selects manual transition mode.
        </Paragraph>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3: PRICING & REVENUE
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Business Model</SectionLabel>
        <SectionHeading id="pricing">Pricing Strategy</SectionHeading>

        <SubHeading>Per-Contest Pricing</SubHeading>
        <DataTable
          headers={['Tier', 'Price', 'Max Participants', 'Price per Participant', 'Scaling']}
          rows={[
            ['Personal', '$9', '15', '$0.60', 'Base'],
            ['Team', '$29', '60', '$0.48', '~3x price, ~4x participants'],
            ['Business', '$89', '240', '$0.37', '~3x price, ~4x participants'],
          ]}
        />

        <Paragraph>
          Price scales approximately 3x between tiers while participants scale 4x — meaning the price per participant decreases at higher tiers. This rewards larger contests and makes the business tier the best value per seat. All tiers include a free version with 5 participants and voting-only mode.
        </Paragraph>

        <SubHeading>Why These Prices</SubHeading>
        <Card>
          <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.75 }}>
            <div style={{ marginBottom: 12 }}>
              <strong style={{ color: '#fff' }}>Competitor pricing for context:</strong> Squadhelp starts at $299, Crowdspring at $299, NamingForce at $649, Hatchwise at $89. Namico's $9-$89 range is 3-30x cheaper than most alternatives.
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong style={{ color: '#fff' }}>Why competitors charge more:</strong> Most naming contest platforms (Squadhelp, Crowdspring, NamingForce) are creative marketplaces that source freelance namers to work on your project. Their pricing includes prize pools for winning freelancers, managed service overhead, and platform fees. Contest holders are paying for professional creative labor.
            </div>
            <div>
              <strong style={{ color: '#fff' }}>Why Namico is different:</strong> Namico is a collaborative decision tool for teams and families who already have people with opinions. No freelancers, no prize pools — just structured naming with the people who matter. The platform provides the methodology, the structure, and the voting infrastructure. The ideas come from your own people.
            </div>
          </div>
        </Card>

        <SubHeading>Revenue Streams</SubHeading>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <Card style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Stream 1: Contest Purchases</div>
            <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.6 }}>
              Direct revenue from paid contests at $9/$29/$89 per contest. Weighted average: ~$23 per paid contest (assuming 50% personal, 30% team, 20% business by volume).
            </div>
          </Card>
          <Card style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Stream 2: Affiliate Revenue</div>
            <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.6 }}>
              Contextual partner placements on the Results Page. Commissions range from 4% (Etsy) to $100/sale (Squarespace). Business segment generates highest affiliate value (LegalZoom, 99designs).
            </div>
          </Card>
        </div>
        <div style={{ marginBottom: 24 }}>
          <Card style={{ borderColor: 'rgba(234,239,9,0.2)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#eaef09', marginBottom: 8 }}>Stream 3: Catchword Professional Services (Own Service)</div>
            <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.6 }}>
              Business users are prompted to engage Catchword's professional services on all three post-vote paths. Confident users see a brand identity upsell ("Need a full brand identity? Catchword can help."), while users with second thoughts or uncertainty see a professional naming upsell ("Need expert help? Let Catchword name it for you."). This is not an affiliate — it's Catchword's own service. Contest data (brief, submissions, votes) transfers as a starting brief, reducing onboarding friction. Also appears as a persistent link on completed business contests in the Dashboard.
            </div>
          </Card>
        </div>

        <SubHeading>Affiliate Commission Rates</SubHeading>
        <DataTable
          compact
          headers={['Partner', 'Commission', 'Cookie', 'Network', 'Est. per Conversion']}
          rows={[
            ['Namecheap', '20-35% (first purchase only)', '30 days', 'Impact / CJ', '$2-4 (domains)'],
            ['LegalZoom', '15% per sale (tiered up to $125+)', '30 days', 'CJ', '$22-45 (LLC/trademark)'],
            ['99designs', '$40-100 per sale (tiered)', '30 days', 'Impact', '$40-100 (design contests)'],
            ['Looka', '25-35% (tiered by volume)', '90 days', 'PartnerStack', '$16-23 (logo packages)'],
            ['Squarespace', '$100-200 flat per subscription', '45 days', 'Impact', '$100-200 (website plans)'],
            ['Printful', '10% for 12 months per customer', '30 days', 'Direct', '$3-5 (merch orders)'],
            ['Artifact Uprising', '10%', '180 days', 'ShareASale', '$3-6 (cards/prints)'],
            ['Etsy', '4% on qualifying sales', '30 days', 'Awin', '$1-2 (gifts)'],
            ['Chewy', '4% or $15 flat (new customers)', '15 days', 'Partnerize', '$3-15 (pet products)'],
            ['Amazon', '4.5% (physical books)', '24 hrs', 'Amazon Associates', '$0.50-1 (naming books)'],
          ]}
        />
        <div style={{ fontSize: 12, color: '#555', marginTop: 8, lineHeight: 1.5 }}>
          * Commission rates verified March 2026. Rates may vary by tier, volume, and specific agreement. Highest-value affiliates: LegalZoom (business formation), 99designs (design contests), and Squarespace (website subscriptions).
        </div>

        <Divider />

        {/* ── Revenue Projections ── */}
        <SectionLabel>Projections</SectionLabel>
        <SectionHeading id="revenue">Revenue Projections (Traffic-Based)</SectionHeading>

        <SubHeading>Funnel Assumptions</SubHeading>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, color: '#a1a1a1' }}>
            <div><strong style={{ color: '#fff' }}>Visitor to free contest:</strong> 8-12%</div>
            <div><strong style={{ color: '#fff' }}>Free to paid upgrade:</strong> 3-5%</div>
            <div><strong style={{ color: '#fff' }}>Results Page affiliate click:</strong> 10-15%</div>
            <div><strong style={{ color: '#fff' }}>Affiliate click to conversion:</strong> 2-4%</div>
            <div><strong style={{ color: '#fff' }}>Contest mix:</strong> 50% personal, 30% team, 20% business</div>
            <div><strong style={{ color: '#fff' }}>Weighted avg price:</strong> ~$23</div>
          </div>
        </Card>

        <SubHeading>Pessimistic Scenario</SubHeading>
        <Paragraph>Organic growth only, minimal marketing, slow SEO traction.</Paragraph>
        <DataTable
          compact
          headers={['Month', 'Visitors/mo', 'Free Contests', 'Paid Contests', 'Contest Rev', 'Affiliate Rev', 'Total']}
          rows={[
            ['3', '800', '64', '2', '$46', '$8', '$54'],
            ['6', '2,000', '160', '5', '$115', '$25', '$140'],
            ['12', '5,000', '400', '12', '$276', '$60', '$336'],
            ['18', '8,000', '640', '19', '$437', '$100', '$537'],
            ['24', '12,000', '960', '29', '$667', '$150', '$817'],
          ]}
        />
        <Paragraph>Pessimistic Year 1: ~$1,500 | Year 2: ~$8,200</Paragraph>

        <SubHeading>Moderate Scenario</SubHeading>
        <Paragraph>Content marketing, targeted SEO, some social presence, word-of-mouth.</Paragraph>
        <DataTable
          compact
          headers={['Month', 'Visitors/mo', 'Free Contests', 'Paid Contests', 'Contest Rev', 'Affiliate Rev', 'Total']}
          rows={[
            ['3', '2,000', '200', '8', '$184', '$30', '$214'],
            ['6', '5,000', '500', '20', '$460', '$100', '$560'],
            ['12', '15,000', '1,500', '60', '$1,380', '$350', '$1,730'],
            ['18', '25,000', '2,500', '100', '$2,300', '$650', '$2,950'],
            ['24', '40,000', '4,000', '160', '$3,680', '$1,100', '$4,780'],
          ]}
        />
        <Paragraph>Moderate Year 1: ~$10,000 | Year 2: ~$42,000</Paragraph>

        <SubHeading>Optimistic Scenario</SubHeading>
        <Paragraph>Active marketing, paid acquisition, PR/press coverage, strong product-market fit.</Paragraph>
        <DataTable
          compact
          headers={['Month', 'Visitors/mo', 'Free Contests', 'Paid Contests', 'Contest Rev', 'Affiliate Rev', 'Total']}
          rows={[
            ['3', '5,000', '600', '30', '$690', '$120', '$810'],
            ['6', '15,000', '1,800', '90', '$2,070', '$500', '$2,570'],
            ['12', '40,000', '4,800', '240', '$5,520', '$1,800', '$7,320'],
            ['18', '70,000', '8,400', '420', '$9,660', '$3,500', '$13,160'],
            ['24', '100,000', '12,000', '600', '$13,800', '$5,500', '$19,300'],
          ]}
        />
        <Paragraph>Optimistic Year 1: ~$40,000 | Year 2: ~$160,000</Paragraph>

        <Card style={{ borderColor: 'rgba(234,239,9,0.2)' }}>
          <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.75 }}>
            <strong style={{ color: '#eaef09' }}>Notes:</strong> Traffic numbers assume organic SEO + content marketing + word-of-mouth. No paid acquisition budget factored into pessimistic/moderate scenarios. Affiliate revenue only counts Results Page placements. Per-contest model means no recurring churn — each sale is one-time. Repeat usage is upside, not a dependency.
          </div>
        </Card>

        <Divider />

        {/* ── Infrastructure Costs ── */}
        <SectionHeading id="infra-costs">Platform Running Costs</SectionHeading>
        <Paragraph>
          Estimated monthly infrastructure costs based on projected traffic and the tech stack defined in "What Comes Next." All services start on free tiers — costs only kick in as usage grows. Calculations use real 2025-2026 pricing.
        </Paragraph>

        <SubHeading>Service Stack & Pricing</SubHeading>
        <DataTable
          headers={['Service', 'Purpose', 'Free Tier', 'First Paid Tier']}
          rows={[
            ['Supabase', 'Database, auth, real-time', '500 MB DB, 50K auth users', '$25/mo (8 GB DB, 100K auth)'],
            ['Stripe', 'Payments', 'No monthly fee', '2.9% + $0.30 per transaction'],
            ['Resend', 'Transactional email', '3,000 emails/mo', '$20/mo (50K emails)'],
            ['Vercel', 'Hosting & deployment', '100 GB bandwidth', '$20/mo (1 TB bandwidth)'],
            ['PostHog', 'Product analytics', '1M events/mo', 'Pay-per-event after 1M'],
            ['Sentry', 'Error tracking', '5K errors/mo', '$29/mo (Team)'],
            ['UptimeRobot', 'Uptime monitoring', '50 monitors free', '$7/mo (1-min checks)'],
            ['GA4', 'Website analytics', 'Fully free', 'Free (GA360 at $50K/yr unnecessary)'],
            ['Meta Pixel', 'Ad conversion tracking', 'Fully free', 'Free (you pay for ads, not the pixel)'],
          ]}
        />

        <SubHeading>Email Volume Per Contest</SubHeading>
        <Paragraph>
          Each participant receives ~4 transactional emails (invitation, reminder, voting open, results). Creators receive ~3 (confirmation, submissions closed, results ready). Paid contests with higher participant caps generate significantly more email volume.
        </Paragraph>
        <DataTable
          headers={['Tier', 'Max Participants', 'Emails/Contest']}
          rows={[
            ['Free (all segments)', '5', '~23'],
            ['Personal ($9)', '15', '~63'],
            ['Team ($29)', '60', '~243'],
            ['Business ($89)', '240', '~963'],
          ]}
        />

        <SubHeading>Monthly Costs by Growth Stage</SubHeading>
        <Paragraph>
          Mapped to the traffic projections from the Revenue section. Email volumes calculated using weighted averages: ~80% free contests (23 emails), ~20% paid contests (weighted ~200 emails avg across tiers). Resend charges $0.40 per 1,000 emails beyond the included tier.
        </Paragraph>
        <DataTable
          compact
          headers={['Stage', 'Visitors/mo', 'Contests/mo', 'Emails/mo', 'Infra Cost', 'Stripe Fees', 'Total Cost', 'Revenue', 'Net']}
          rows={[
            ['Launch (Mo 1-3)', '5,000', '630', '~20,000', '$20', '~$20', '~$40', '$810', '+$770'],
            ['Growth (Mo 6)', '15,000', '1,890', '~60,000', '$90', '~$60', '~$150', '$2,570', '+$2,420'],
            ['Traction (Mo 12)', '40,000', '5,040', '~160,000', '$170', '~$160', '~$330', '$7,320', '+$6,990'],
            ['Scale (Mo 18)', '70,000', '8,820', '~280,000', '$240', '~$280', '~$520', '$13,160', '+$12,640'],
            ['Mature (Mo 24)', '100,000', '12,600', '~400,000', '$310', '~$400', '~$710', '$19,300', '+$18,590'],
          ]}
        />

        <SubHeading>Cost Breakdown at Scale (Month 24, ~100K visitors)</SubHeading>
        <DataTable
          headers={['Service', 'Monthly Cost', 'Why']}
          rows={[
            ['Supabase Pro', '$45', '~12K contests stored, 100K+ auth users, real-time voting'],
            ['Vercel Pro', '$20', '1 TB bandwidth covers 100K visitors'],
            ['Resend Scale + overflow', '$210', '~400K emails/mo (100K included + 300K × $0.40/1K)'],
            ['Sentry Team', '$29', 'Error tracking across all flows'],
            ['PostHog', '$15', '~2M events/mo (1M free + overflow)'],
            ['UptimeRobot', '$7', '1-minute monitoring intervals'],
            ['GA4 + Meta Pixel', '$0', 'Free regardless of traffic'],
            ['Stripe fees', '~$400', '2.9% + $0.30 on ~$13,800 contest revenue'],
            ['Total', '~$710', 'Infrastructure cost = ~3.7% of revenue'],
          ]}
        />

        <Card style={{ borderColor: 'rgba(234,239,9,0.2)' }}>
          <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.75 }}>
            <strong style={{ color: '#eaef09' }}>Key takeaway:</strong> The platform launches on <strong style={{ color: '#fff' }}>$0/month</strong> using free tiers. First paid upgrade is <strong style={{ color: '#fff' }}>~$20/month</strong> (Resend Pro when email volume exceeds 3K/mo). The biggest cost driver is <strong style={{ color: '#fff' }}>transactional email</strong> — business contests with 240 participants generate ~963 emails each. Even at 100K monthly visitors, total infrastructure stays under <strong style={{ color: '#fff' }}>4% of revenue</strong> — healthy SaaS gross margins. No dedicated DevOps needed — the entire stack is serverless and managed.
          </div>
        </Card>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4: WIREFRAME SCOPE
            ═══════════════════════════════════════════════════════════════════ */}
        <SectionLabel>Scope</SectionLabel>
        <SectionHeading id="scope">What This Wireframe Is — and Isn't</SectionHeading>

        <SubHeading>What this wireframe defines</SubHeading>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {[
            'Complete user flows for all 3 segments and 15 sub-types',
            'Screen-by-screen logic and navigation',
            'Paywall trigger points and upgrade messaging',
            'Affiliate placement strategy',
            'Quality scoring system architecture',
            'Pricing model and tier structure',
            'Contest lifecycle from brief to results',
          ].map(item => (
            <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(234,239,9,0.06)', border: '0.5px solid rgba(234,239,9,0.15)', fontSize: 12, color: '#a1a1a1' }}>
              <CheckCircle size={12} color="#eaef09" weight="fill" /> {item}
            </span>
          ))}
        </div>

        <SubHeading>What this wireframe is NOT</SubHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {[
            ['Actual platform development', 'This is Phase 3 — a separate SOW will follow'],
            ['Go-to-market strategy', 'Marketing channel planning is a separate effort'],
            ['Copywriting', 'Educational content, website copy, and naming tips will be written separately. Structure and topics are defined here; actual writing is a separate effort'],
            ['Visual design', 'Brand identity, color system, typography, and UI polish are separate'],
            ['Live backend or integrations', 'No database, payment processing, or API connections'],
          ].map(([title, desc]) => (
            <Card key={title} style={{ padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Warning size={16} color="#f97316" weight="fill" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#7a7a7a' }}>{desc}</div>
              </div>
            </Card>
          ))}
        </div>

        <SubHeading>Important Note</SubHeading>
        <Paragraph>
          Wireframes set the base logic and architecture for the build. Exact field placements, layouts, text, and visual details will evolve during development — for example, educational content sections will be refined in the final build, naming tips will be rewritten, and UI elements will be polished. The core logic and step-by-step flows, however, should remain largely as defined in this Phase 2 wireframe.
        </Paragraph>

        <SubHeading>What Comes Next</SubHeading>
        <Card style={{ borderColor: 'rgba(234,239,9,0.2)' }}>
          <div style={{ fontSize: 14, color: '#a1a1a1', lineHeight: 1.75, marginBottom: 20 }}>
            The current wireframe is very close to becoming a functioning product. Below are the specific implementation steps required to go from wireframe to production:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { title: 'Backend & Database', service: 'Supabase', tech: true, desc: 'PostgreSQL database for contests, users, submissions, and votes. Built-in auth (email + social login), row-level security, and real-time subscriptions for live vote updates during contests. Replaces all current localStorage persistence.' },
              { title: 'Payment Processing', service: 'Stripe', tech: true, desc: 'Checkout for $9/$29/$89 contest tiers. Webhook-based feature unlocking (participant caps, advanced voting methods, PDF reports). Handles second-round 50% discount codes and subscription management.' },
              { title: 'Transactional Email', service: 'Resend', tech: true, desc: 'Participant invitations, automated deadline reminders (day 3 + day 1 before close), winner announcements, and post-vote reflection emails. Currently all email flows are simulated in the wireframe.' },
              { title: 'Analytics & Conversion Tracking', service: 'GA4 + Meta Pixel + PostHog', tech: true, desc: 'Google Analytics 4 for traffic and funnel analysis. Meta Pixel for retargeting and ad conversion tracking. PostHog (or Mixpanel) for product analytics — paywall conversion rates, affiliate click-through, feature adoption.' },
              { title: 'Affiliate Link Management', service: 'Impact / CJ / PartnerStack', tech: true, desc: 'API integrations with affiliate networks for Namecheap, LegalZoom, Looka, 99designs, Squarespace, Printful, Etsy, Chewy, and Amazon. Track referral clicks, attribute conversions, manage commission payouts per partner.' },
              { title: 'PDF Generation', service: 'React-PDF / @react-pdf/renderer', tech: true, desc: 'Server-side generation of contest result reports and official naming certificates (both Catchword-branded and white-label versions). Currently referenced in feature lists but not yet functional.' },
              { title: 'Domain & Hosting', service: 'Vercel + DNS routing', tech: true, desc: 'Connect namingcontest.com domain to existing Vercel deployment. Configure DNS records, SSL certificate, and edge caching. Set up staging and production environments.' },
              { title: 'Mobile Responsive Design', service: 'CSS / responsive layout', tech: true, desc: 'All 14 screens adapted for mobile and tablet. Touch-friendly voting interfaces (especially drag-and-drop ranked choice), collapsible brief builder, mobile-optimized dashboard. Currently desktop-only.' },
              { title: 'Error Tracking & Monitoring', service: 'Sentry + BetterStack', tech: true, desc: 'Sentry for real-time error tracking — catches bugs and crashes before users report them. BetterStack (or UptimeRobot) for uptime monitoring with instant alerts when the site goes down. Essential for a production SaaS handling payments and live contests.' },
              { title: 'Security Audit', service: 'Pre-launch review', tech: true, desc: 'One-time professional security review before public launch. Covers input sanitization (XSS/injection), Supabase row-level security policies, Stripe webhook verification, CORS configuration, GDPR/privacy compliance (cookie consent, data deletion rights), and rate limiting.' },
              { title: 'Copywriting & Content', service: '', tech: false, desc: 'Production-quality educational content (naming methodology articles read by participants), UI microcopy, onboarding flows, email templates, and brief builder guidance text. Structure is defined in wireframe; actual writing is a separate effort.' },
              { title: 'Visual Design & Brand Identity', service: '', tech: false, desc: 'Polish UI components, microinteractions, loading states, error states, and empty states. Colors, fonts, and visual details can absolutely be adjusted — but it is recommended to evolve the current design rather than commissioning a full brand identity from scratch, which would add significant cost and timeline. The wireframe already establishes a functional layout and component system. Budget should prioritize functionality over visual overhaul.' },
            ].map((step, i) => (
              <div key={i} style={{ padding: '14px 16px', background: '#141414', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(234,239,9,0.1)', border: '1px solid rgba(234,239,9,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#eaef09', flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{step.title}</span>
                  <span style={{ fontSize: 11, color: step.tech ? '#eaef09' : '#7a7a7a', fontWeight: 600, marginLeft: 'auto', flexShrink: 0 }}>{step.service}</span>
                </div>
                <div style={{ fontSize: 13, color: '#7a7a7a', lineHeight: 1.6, paddingLeft: 34 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        <SectionLabel>Action Required</SectionLabel>
        <SectionHeading id="roadmap">Project Roadmap</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            {
              phase: 'Phase 2 into Phase 3',
              title: 'Payment, Feedback, Final Build',
              color: '#eaef09',
              rgb: '234,239,9',
              status: 'You are here',
              desc: 'Invoice payment for the completed Phase 2 wireframe. Following payment, any suggestions, questions, or small adjustments to the platform can be addressed. This is the window to refine details and request minor changes before moving into production.',
              divider: true,
              desc2: 'Then — full platform development: backend integration (Supabase, Stripe, Resend), mobile responsiveness, affiliate API connections, PDF generation, analytics setup, security audit, and testing. The wireframe becomes a functioning product.',
              options: [
                { label: 'Option A', text: 'I build the final version, hiring an expert at the final stage before launch for review and security audit.' },
                { label: 'Option B', text: 'Your coder builds the final version using this wireframe as the blueprint, possibly hiring an additional set of hands at the final stage too.' },
              ],
            },
            {
              phase: 'Phase 4',
              title: 'Go-to-Market',
              color: '#eaef09',
              rgb: '234,239,9',
              status: 'Next step',
              dimmed: true,
              desc: 'Developing go-to-market strategy, creating marketing assets (ad creatives, landing page variants, social content), preparing ad campaigns across Google and Meta, SEO groundwork, and generating initial traffic to the platform.',
            },
          ].map((step, i, arr) => (
            <div key={i}>
              <div style={{ padding: '20px 20px', background: step.dimmed ? '#111' : '#141414', border: `1px solid ${step.dimmed ? 'rgba(255,255,255,0.06)' : `rgba(${step.rgb},0.2)`}`, borderRadius: 12, borderStyle: step.dimmed ? 'dashed' : 'solid' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 6, background: step.dimmed ? 'rgba(255,255,255,0.04)' : `rgba(${step.rgb},0.1)`, border: `0.5px solid ${step.dimmed ? 'rgba(255,255,255,0.1)' : `rgba(${step.rgb},0.3)`}`, fontSize: 10, fontWeight: 700, color: step.dimmed ? '#666' : step.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{step.phase}</span>
                  {step.status && <span style={{ padding: '3px 8px', borderRadius: 5, background: step.status === 'You are here' ? 'rgba(234,239,9,0.15)' : 'rgba(255,255,255,0.04)', fontSize: 10, fontWeight: 700, color: step.status === 'You are here' ? '#eaef09' : '#555', letterSpacing: '0.03em' }}>{step.status}</span>}
                  <span style={{ fontSize: 16, fontWeight: 700, color: step.dimmed ? '#888' : '#fff' }}>{step.title}</span>
                </div>
                {step.desc && <div style={{ fontSize: 13, color: step.dimmed ? '#555' : '#a1a1a1', lineHeight: 1.65 }}>{step.desc}</div>}
                {step.divider && <div style={{ height: 1, background: 'rgba(234,239,9,0.15)', margin: '16px 0' }} />}
                {step.desc2 && <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.65 }}>{step.desc2}</div>}
                {step.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                    {step.options.map((opt, j) => (
                      <div key={j} style={{ padding: '12px 14px', background: `rgba(${step.rgb},0.04)`, border: `0.5px solid rgba(${step.rgb},0.15)`, borderRadius: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: step.color, marginRight: 8 }}>{opt.label}:</span>
                        <span style={{ fontSize: 13, color: '#a1a1a1' }}>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {i < arr.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0', gap: 3 }}>
                  <div style={{ width: 2, height: 12, background: 'rgba(234,239,9,0.3)' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid rgba(234,239,9,0.3)', background: 'transparent' }} />
                  <div style={{ width: 2, height: 12, background: 'rgba(255,255,255,0.08)' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer spacer */}
        <div style={{ height: 80 }} />
      </div>

      <style>{`
        @keyframes sidebarPulse {
          0%, 100% { background: rgba(234,239,9,0.04); border-color: rgba(234,239,9,0.15); }
          50% { background: rgba(234,239,9,0.18); border-color: rgba(234,239,9,0.4); }
        }
      `}</style>
    </div>
  );
}
