import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, Briefcase, Users, Heart, Eye, ChartBar, Gear, Play, Path } from '@phosphor-icons/react';

// ─── Journey definitions ──────────────────────────────────────────────────────

const JOURNEYS = [
  {
    id: 'business', label: 'Business', color: '#eaef09', textColor: '#000',
    icon: <Briefcase size={16} weight="bold" />,
    subSegments: [
      { id: 'company-name', label: 'B1 — Company/Startup Name' },
      { id: 'product-name', label: 'B2 — Product/Service Name' },
      { id: 'project-name', label: 'B3 — Project/Initiative Name' },
      { id: 'rebrand', label: 'B4 — Rebrand' },
      { id: 'other-business', label: 'B5 — Other Business' },
    ],
    contestTypes: [
      { id: 'submission_voting', label: 'Open Contest', badge: 'Popular' },
      { id: 'voting_only', label: 'Voting Only', badge: null },
      { id: 'internal_brainstorm', label: 'Internal Brainstorm', badge: null },
    ],
  },
  {
    id: 'team', label: 'Team', color: '#8B5CF6', textColor: '#fff',
    icon: <Users size={16} weight="bold" />,
    subSegments: [
      { id: 'sports-team', label: 'T1 — Sports Team' },
      { id: 'band-music', label: 'T2 — Band / Music Group' },
      { id: 'podcast-channel', label: 'T3 — Podcast / Channel' },
      { id: 'civic-school-nonprofit', label: 'T4 — Civic / School / Nonprofit' },
      { id: 'gaming-group', label: 'T5 — Gaming Group' },
      { id: 'other-team', label: 'T6 — Other Team' },
    ],
    contestTypes: [
      { id: 'submission_voting', label: 'Open Contest', badge: null },
      { id: 'voting_only', label: 'Voting Only', badge: 'Common' },
      { id: 'internal_brainstorm', label: 'Internal Brainstorm', badge: null },
    ],
  },
  {
    id: 'personal', label: 'Personal', color: '#10B981', textColor: '#fff',
    icon: <Heart size={16} weight="bold" />,
    subSegments: [
      { id: 'baby-name', label: 'P1 — Baby Name' },
      { id: 'pet-name', label: 'P2 — Pet Name' },
      { id: 'home-property-fun', label: 'P3 — Home / Property / Fun' },
      { id: 'other-personal', label: 'P4 — Other Personal' },
    ],
    contestTypes: [
      { id: 'submission_voting', label: 'Open Contest', badge: null },
      { id: 'voting_only', label: 'Voting Only', badge: 'Common' },
      { id: 'internal_brainstorm', label: 'Internal Brainstorm', badge: null },
    ],
  },
];

// ─── All Routes (flat list tab) ───────────────────────────────────────────────

const ALL_SECTIONS = [
  {
    title: 'Landing & Onboarding', icon: <Trophy size={18} />, color: '#eaef09',
    routes: [
      { path: '/', label: 'Landing Page', description: 'Hero, testimonials, FAQ', dot: '#eaef09' },
      { path: '/select', label: 'Select Segment', description: 'Choose Business, Team, or Personal', dot: '#eaef09' },
      { path: '/select/business', label: 'Select Sub-Segment (Business)', description: '5 business sub-types', dot: '#eaef09' },
      { path: '/select/team', label: 'Select Sub-Segment (Team)', description: '6 team sub-types', dot: '#8B5CF6' },
      { path: '/select/personal', label: 'Select Sub-Segment (Personal)', description: '4 personal sub-types', dot: '#10B981' },
      { path: '/contest-type/business/company-name', label: 'Contest Type Selection (B1)', description: 'Open Contest / Voting Only / Internal Brainstorm', dot: '#eaef09', badge: 'NEW' },
      { path: '/contest-type/team/sports-team', label: 'Contest Type Selection (T1)', description: 'Contest type + voting permissions (Team)', dot: '#8B5CF6', badge: 'NEW' },
      { path: '/contest-type/personal/baby-name', label: 'Contest Type Selection (P1)', description: 'Contest type + voting permissions (Personal)', dot: '#10B981', badge: 'NEW' },
      { path: '/upload-names', label: 'Upload Names (Voting Only)', description: 'Add name candidates + voting method', dot: '#ffffff', badge: 'NEW' },
      { path: '/auth', label: 'Auth Page', description: 'Account creation gate', dot: '#ffffff' },
    ],
  },
  {
    title: 'Business Flows', icon: <Briefcase size={18} />, color: '#eaef09',
    routes: [
      { path: '/brief/business/company-name', label: 'Brief — Company/Startup Name (B1)', description: 'Brief builder for company naming', dot: '#eaef09' },
      { path: '/brief/business/product-name', label: 'Brief — Product/Service Name (B2)', description: 'Brief builder for product naming', dot: '#eaef09' },
      { path: '/brief/business/project-name', label: 'Brief — Project/Initiative Name (B3)', description: 'Brief builder for project naming', dot: '#eaef09' },
      { path: '/brief/business/rebrand', label: 'Brief — Rebrand (B4)', description: 'Brief builder for rebranding', dot: '#eaef09' },
      { path: '/brief/business/other-business', label: 'Brief — Other Business (B5)', description: 'General business brief builder', dot: '#eaef09' },
    ],
  },
  {
    title: 'Team Flows', icon: <Users size={18} />, color: '#8B5CF6',
    routes: [
      { path: '/brief/team/sports-team', label: 'Brief — Sports Team (T1)', description: 'Brief builder for sports teams', dot: '#8B5CF6' },
      { path: '/brief/team/band-music', label: 'Brief — Band / Music Group (T2)', description: 'Brief builder for bands', dot: '#8B5CF6' },
      { path: '/brief/team/podcast-channel', label: 'Brief — Podcast / Channel (T3)', description: 'Brief builder for podcasts', dot: '#8B5CF6' },
      { path: '/brief/team/civic-school-nonprofit', label: 'Brief — Civic / School / Nonprofit (T4)', description: 'Brief builder for organizations', dot: '#8B5CF6' },
      { path: '/brief/team/gaming-group', label: 'Brief — Gaming Group (T5)', description: 'Brief builder for gaming teams', dot: '#8B5CF6' },
      { path: '/brief/team/other-team', label: 'Brief — Other Team (T6)', description: 'General team brief builder', dot: '#8B5CF6' },
    ],
  },
  {
    title: 'Personal Flows', icon: <Heart size={18} />, color: '#10B981',
    routes: [
      { path: '/brief/personal/baby-name', label: 'Brief — Baby Name (P1)', description: 'Brief builder for baby names', dot: '#10B981' },
      { path: '/brief/personal/pet-name', label: 'Brief — Pet Name (P2)', description: 'Brief builder for pet names', dot: '#10B981' },
      { path: '/brief/personal/home-property-fun', label: 'Brief — Home / Property / Fun (P3)', description: 'Brief builder for home/fun projects', dot: '#10B981' },
      { path: '/brief/personal/other-personal', label: 'Brief — Other Personal (P4)', description: 'General personal brief builder', dot: '#10B981' },
    ],
  },
  {
    title: 'Participant Views', icon: <Eye size={18} />, color: '#ffffff',
    routes: [
      { path: '/invite/demo-1', label: 'Invitation Guidance (Phase 5)', description: 'Post-launch — share via link/email/QR', dot: '#a1a1a1', badge: 'UPDATED' },
      { path: '/contest/demo-1', label: 'Contest Live — Submit Names', description: 'Participant submission interface', dot: '#a1a1a1' },
      { path: '/vote/demo-1', label: 'Voting — Simple Poll', description: 'One vote per person', dot: '#a1a1a1' },
      { path: '/vote/demo-2', label: 'Voting — Ranked Choice', description: 'Rank all options', dot: '#a1a1a1' },
      { path: '/vote/demo-3', label: 'Voting — Multi-Criteria', description: 'Rate across dimensions', dot: '#a1a1a1' },
      { path: '/vote/demo-4', label: 'Voting — Pairwise', description: 'Head-to-head matchups', dot: '#a1a1a1' },
      { path: '/vote/demo-5', label: 'Voting — Weighted', description: 'Vote weight by role', dot: '#a1a1a1' },
    ],
  },
  {
    title: 'Results', icon: <ChartBar size={18} />, color: '#10B981',
    routes: [
      { path: '/results/demo-1', label: 'Results — Business Contest', description: 'Full results with analytics and certificate', dot: '#10B981' },
      { path: '/results/demo-5', label: 'Results — Band Contest (Completed)', description: 'Completed contest results view', dot: '#8B5CF6' },
      { path: '/results/demo-8', label: 'Results — Personal Contest', description: 'Personal contest results', dot: '#10B981' },
    ],
  },
  {
    title: 'Organizer Dashboard', icon: <Gear size={18} />, color: '#eaef09',
    routes: [
      { path: '/dashboard', label: 'Dashboard', description: 'All contests overview', dot: '#eaef09' },
      { path: '/contest-detail/demo-1', label: 'Contest Detail — Business (demo-1)', description: 'Deep-dive view with phase management + email flows', dot: '#eaef09' },
      { path: '/contest-detail/demo-2', label: 'Contest Detail — Team (demo-2)', description: 'Team contest detail view', dot: '#8B5CF6' },
      { path: '/contest-detail/demo-3', label: 'Contest Detail — Personal (demo-3)', description: 'Personal contest detail view', dot: '#10B981' },
    ],
  },
];

// ─── Flow builder ─────────────────────────────────────────────────────────────

const PHASE_COLORS = {
  setup: '#eaef09', outreach: '#8B5CF6', submission: '#10B981',
  curation: '#f97316', ballot: '#f97316', voting: '#3b82f6',
  results: '#ec4899', manage: '#eaef09',
};
const PHASE_LABELS = {
  setup: 'Setup', outreach: 'Outreach', submission: 'Submission',
  curation: 'Curation', ballot: 'Ballot', voting: 'Voting',
  results: 'Results', manage: 'Dashboard',
};

function getCreatorFlow(group, sub, contestType) {
  const base = [
    { label: 'Landing', path: '/', phase: null },
    { label: 'Select Segment', path: '/select', phase: null },
    { label: 'Select Sub-type', path: `/select/${group}`, phase: null },
    { label: 'Contest Type', path: `/contest-type/${group}/${sub}`, phase: null },
    { label: 'Auth / Sign Up', path: '/auth', phase: null },
  ];

  if (contestType === 'voting_only') {
    return [
      ...base,
      { label: 'Upload Names', path: '/upload-names', phase: 'setup' },
      { label: 'Invite Participants', path: '/invite/demo-1', phase: 'outreach' },
      { label: 'Voting Phase', path: '/vote/demo-1', phase: 'voting', participant: true },
      { label: 'Results', path: '/results/demo-1', phase: 'results', participant: true },
      { label: 'Contest Dashboard', path: '/contest-detail/demo-1', phase: 'manage' },
    ];
  }

  if (contestType === 'internal_brainstorm') {
    return [
      ...base,
      { label: 'Brief Builder', path: `/brief/${group}/${sub}`, phase: 'setup' },
      { label: 'Invite Submitters', path: '/invite/demo-1', phase: 'outreach' },
      { label: 'Submission Phase', path: '/contest/demo-1', phase: 'submission', participant: true },
      { label: 'Curate Shortlist', path: '/contest-detail/demo-1', phase: 'curation' },
      { label: 'Confirm Ballot', path: '/contest-detail/demo-1', phase: 'ballot' },
      { label: 'Invite Voters', path: '/invite/demo-1', phase: 'outreach' },
      { label: 'Voting Phase', path: '/vote/demo-1', phase: 'voting', participant: true },
      { label: 'Results', path: '/results/demo-1', phase: 'results', participant: true },
      { label: 'Contest Dashboard', path: '/contest-detail/demo-1', phase: 'manage' },
    ];
  }

  // Open Contest (default)
  return [
    ...base,
    { label: 'Brief Builder', path: `/brief/${group}/${sub}`, phase: 'setup' },
    { label: 'Invite Participants', path: '/invite/demo-1', phase: 'outreach' },
    { label: 'Submission Phase', path: '/contest/demo-1', phase: 'submission', participant: true },
    { label: 'Curate Shortlist', path: '/contest-detail/demo-1', phase: 'curation' },
    { label: 'Confirm Ballot', path: '/contest-detail/demo-1', phase: 'ballot' },
    { label: 'Voting Phase', path: '/vote/demo-1', phase: 'voting', participant: true },
    { label: 'Results', path: '/results/demo-1', phase: 'results', participant: true },
    { label: 'Contest Dashboard', path: '/contest-detail/demo-1', phase: 'manage' },
  ];
}

function saveJourneyContext(group, sub, contestType, stepIndex) {
  localStorage.setItem('selectedGroup', group);
  localStorage.setItem('selectedSubSegment', sub);
  localStorage.setItem('contestType', contestType);
  localStorage.setItem('journeyStep', String(stepIndex));
}

// ─── Components ───────────────────────────────────────────────────────────────

function FlowNode({ step, stepIndex, isLast, onActivate }) {
  const phaseColor = step.phase ? PHASE_COLORS[step.phase] : '#3a3a3a';
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <Link to={step.path} style={{ textDecoration: 'none' }} onClick={() => onActivate(stepIndex)}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
          background: '#1e1e1e', border: `0.5px solid ${phaseColor}50`,
          minWidth: 82, maxWidth: 100, transition: 'border-color 0.15s',
        }}>
          {step.phase && (
            <div style={{
              fontSize: 7, fontWeight: 800, color: phaseColor,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              background: `${phaseColor}18`, borderRadius: 3, padding: '1px 5px',
            }}>
              {PHASE_LABELS[step.phase]}
            </div>
          )}
          <div style={{
            fontSize: 10, fontWeight: 600,
            color: step.participant ? '#93c5fd' : '#fff',
            textAlign: 'center', lineHeight: 1.3,
          }}>
            {step.participant && <span style={{ marginRight: 2 }}>👤</span>}
            {step.label}
          </div>
        </div>
      </Link>
      {!isLast && (
        <div style={{ color: '#2a2a2a', margin: '0 3px', flexShrink: 0 }}>
          <ArrowRight size={11} />
        </div>
      )}
    </div>
  );
}

function JourneySwimlane({ journey }) {
  const [activeType, setActiveType] = useState('submission_voting');
  const [activeSub, setActiveSub] = useState(journey.subSegments[0]);
  const navigate = useNavigate();
  const flow = getCreatorFlow(journey.id, activeSub.id, activeType);

  const typeLabel = journey.contestTypes.find(c => c.id === activeType)?.label || '';
  const journeyLabel = `${journey.label} · ${activeSub.label} · ${typeLabel}`;

  function activateStep(stepIndex) {
    saveJourneyContext(journey.id, activeSub.id, activeType, stepIndex);
  }

  function runFullFlow() {
    saveJourneyContext(journey.id, activeSub.id, activeType, 0);
    navigate('/');
  }

  return (
    <div style={{
      background: '#141414', border: `0.5px solid ${journey.color}30`,
      borderRadius: 14, marginBottom: 16, overflow: 'hidden',
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', background: `${journey.color}0a`,
        borderBottom: `0.5px solid ${journey.color}18`, flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: journey.color, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: journey.textColor, flexShrink: 0,
          }}>
            {journey.icon}
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{journey.label}</span>
          <span style={{ fontSize: 11, color: '#5a5a5a' }}>{journey.subSegments.length} sub-types</span>
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
          {journey.contestTypes.map(ct => (
            <button key={ct.id} onClick={() => setActiveType(ct.id)} style={{
              padding: '3px 9px', borderRadius: 5,
              background: activeType === ct.id ? journey.color : '#1e1e1e',
              border: `0.5px solid ${activeType === ct.id ? 'transparent' : 'rgba(255,255,255,0.09)'}`,
              color: activeType === ct.id ? journey.textColor : '#7a7a7a',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              {ct.label}{ct.badge && activeType === ct.id ? ' ★' : ''}
            </button>
          ))}
          <button onClick={runFullFlow} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 11px', borderRadius: 5,
            background: 'rgba(16,185,129,0.12)', border: '0.5px solid rgba(16,185,129,0.28)',
            color: '#10B981', fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>
            <Play size={9} weight="fill" /> Run Full Flow
          </button>
        </div>
      </div>

      {/* Sub-segment pills */}
      <div style={{
        display: 'flex', gap: 5, padding: '8px 18px',
        borderBottom: '0.5px solid rgba(255,255,255,0.04)', overflowX: 'auto',
      }}>
        {journey.subSegments.map(sub => (
          <button key={sub.id} onClick={() => setActiveSub(sub)} style={{
            padding: '3px 9px', borderRadius: 4, flexShrink: 0,
            background: activeSub.id === sub.id ? '#252525' : 'transparent',
            border: `0.5px solid ${activeSub.id === sub.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
            color: activeSub.id === sub.id ? '#fff' : '#5a5a5a',
            fontSize: 10, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            {sub.label}
          </button>
        ))}
      </div>

      {/* Flow nodes */}
      <div style={{ padding: '14px 18px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 'max-content' }}>
          {flow.map((step, i) => (
            <FlowNode
              key={`${step.path}-${i}`}
              step={step}
              stepIndex={i}
              isLast={i === flow.length - 1}
              onActivate={activateStep}
            />
          ))}
        </div>
        {/* Phase legend */}
        <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: '#4a4a4a' }}>
            <span style={{ color: '#93c5fd' }}>👤</span> Participant screen
          </span>
          {Object.entries(PHASE_LABELS).map(([key, lbl]) => (
            <span key={key} style={{ fontSize: 9, color: '#4a4a4a', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 1, background: PHASE_COLORS[key] }} />
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* Participant path sub-row */}
      <div style={{
        padding: '8px 18px 12px',
        borderTop: '0.5px solid rgba(255,255,255,0.04)',
        background: 'rgba(59,130,246,0.03)',
      }}>
        <div style={{ fontSize: 9, color: '#3a5a7a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Participant path
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
          {flow.filter(s => s.participant || s.phase === 'results').map((step, i, arr) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <Link to={step.path} style={{ textDecoration: 'none' }}
                onClick={() => activateStep(flow.indexOf(step))}>
                <div style={{
                  padding: '4px 9px', borderRadius: 5,
                  background: 'rgba(59,130,246,0.09)', border: '0.5px solid rgba(59,130,246,0.18)',
                  fontSize: 10, fontWeight: 600, color: '#93c5fd', whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </div>
              </Link>
              {i < arr.length - 1 && (
                <ArrowRight size={9} color="#1e3a5a" style={{ margin: '0 3px', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteCard({ route }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={route.path} style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{
        background: hovered ? '#242424' : '#1a1a1a',
        border: `0.5px solid ${hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 10, padding: '13px 15px', transition: 'all 0.18s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        display: 'flex', alignItems: 'flex-start', gap: 11,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: route.dot, flexShrink: 0, marginTop: 5 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{route.label}</div>
            {route.badge && (
              <span style={{
                padding: '1px 5px',
                background: route.badge === 'UPDATED' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.12)',
                border: `0.5px solid ${route.badge === 'UPDATED' ? 'rgba(59,130,246,0.35)' : 'rgba(16,185,129,0.35)'}`,
                borderRadius: 4, fontSize: 8, fontWeight: 700,
                color: route.badge === 'UPDATED' ? '#93c5fd' : '#10B981',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{route.badge}</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: '#6a6a6a', lineHeight: 1.4, marginBottom: 7 }}>{route.description}</div>
          <div style={{ fontSize: 10, color: '#3a3a3a', fontFamily: 'monospace' }}>{route.path}</div>
        </div>
        <ArrowRight size={13} color={hovered ? '#a1a1a1' : '#3a3a3a'} style={{ flexShrink: 0, marginTop: 3 }} />
      </div>
    </Link>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function WireframeDashboard() {
  const [activeTab, setActiveTab] = useState('journey');
  const totalRoutes = ALL_SECTIONS.reduce((sum, s) => sum + s.routes.length, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '56px 36px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 11, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, background: '#eaef09', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={20} weight="bold" color="#000" />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>
              NamingContest.com — Wireframe Testing Hub
            </h1>
          </div>
          <p style={{ fontSize: 14, color: '#6a6a6a', marginBottom: 28 }}>
            Click any node to jump to that screen. Use <strong style={{ color: '#10B981' }}>Run Full Flow</strong> to walk the entire journey with a progress tracker.
          </p>
          <div style={{
            display: 'inline-flex', gap: 44, background: '#141414',
            border: '0.5px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '14px 36px',
          }}>
            {[
              { value: '3', label: 'Segments', color: '#eaef09' },
              { value: '15', label: 'Sub-types', color: '#8B5CF6' },
              { value: '3', label: 'Contest Types', color: '#10B981' },
              { value: totalRoutes + '+', label: 'Routes', color: '#fff' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 9, color: '#5a5a5a', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: 4, background: '#141414',
          border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 4,
          maxWidth: 360, margin: '0 auto 28px',
        }}>
          {[
            { id: 'journey', label: 'Journey Paths', icon: <Path size={13} /> },
            { id: 'routes', label: 'All Routes', icon: <Gear size={13} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '8px 14px', borderRadius: 7,
              background: activeTab === tab.id ? '#252525' : 'transparent',
              border: `0.5px solid ${activeTab === tab.id ? 'rgba(255,255,255,0.11)' : 'transparent'}`,
              color: activeTab === tab.id ? '#fff' : '#6a6a6a',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Journey Paths Tab */}
        {activeTab === 'journey' && (
          <div>
            {/* How to use callout */}
            <div style={{
              background: '#141414', border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: 10, padding: '12px 18px', marginBottom: 22,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <div style={{ fontSize: 12, color: '#7a7a7a', lineHeight: 1.6 }}>
                Switch <strong style={{ color: '#a1a1a1' }}>Contest Type</strong> to see how the flow changes.
                Switch <strong style={{ color: '#a1a1a1' }}>Sub-type</strong> to update brief builder links.
                Click any <strong style={{ color: '#a1a1a1' }}>node</strong> to jump to that screen — a <strong style={{ color: '#eaef09' }}>Journey Tracker</strong> appears bottom-right so you always know your position and can step forward/back.
                <span style={{ color: '#93c5fd' }}> 👤 blue</span> nodes are participant-facing screens.
                The <strong style={{ color: '#f97316' }}>Confirm Ballot</strong> step is where you review curated names and lock the voting list.
              </div>
            </div>

            {JOURNEYS.map(j => <JourneySwimlane key={j.id} journey={j} />)}

            {/* Voting methods quick-jump */}
            <div style={{
              background: '#141414', border: '0.5px solid rgba(59,130,246,0.18)',
              borderRadius: 12, padding: '18px 22px', marginTop: 8,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>5 Voting Methods — Quick Jump</div>
              <div style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 13 }}>Each demo URL loads a different voting interface variant</div>
              <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                {[
                  { demo: 'demo-1', label: 'Simple Poll', desc: 'One vote per person' },
                  { demo: 'demo-2', label: 'Ranked Choice', desc: 'Order all options' },
                  { demo: 'demo-3', label: 'Multi-Criteria', desc: 'Rate across dimensions' },
                  { demo: 'demo-4', label: 'Pairwise', desc: 'Head-to-head matchups' },
                  { demo: 'demo-5', label: 'Weighted', desc: 'Vote weight by role' },
                ].map(v => (
                  <Link key={v.demo} to={`/vote/${v.demo}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '9px 13px', borderRadius: 8,
                      background: 'rgba(59,130,246,0.07)', border: '0.5px solid rgba(59,130,246,0.18)',
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#93c5fd', marginBottom: 2 }}>{v.label}</div>
                      <div style={{ fontSize: 10, color: '#4a6a8a' }}>{v.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* All Routes Tab */}
        {activeTab === 'routes' && (
          <div>
            {ALL_SECTIONS.map(section => (
              <div key={section.title} style={{ marginBottom: 44 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  paddingBottom: 13, marginBottom: 15,
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ color: section.color }}>{section.icon}</div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{section.title}</h2>
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.09)',
                    borderRadius: 9999, padding: '2px 9px', color: '#6a6a6a', marginLeft: 3,
                  }}>
                    {section.routes.length} routes
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
                  {section.routes.map(route => <RouteCard key={route.path} route={route} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center', marginTop: 56, padding: 32,
          background: '#141414', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12,
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 7 }}>Build Status: Foundation Complete</h3>
          <p style={{ fontSize: 12, color: '#6a6a6a', lineHeight: 1.8 }}>
            Landing ✓ · Segment Selection ✓ · Contest Type Selection ✓ · Auth Gate ✓ · Brief Builder (15 sub-types) ✓<br />
            Upload Names ✓ · Invitation Guidance ✓ · Contest Live ✓ · 5 Voting Methods ✓ · Results ✓ · Dashboard ✓<br />
            Curation + Ballot Confirmation ✓ · Phase Management ✓ · Email Flows ✓ · Journey Tracker ✓
          </p>
        </div>

      </div>
    </div>
  );
}
