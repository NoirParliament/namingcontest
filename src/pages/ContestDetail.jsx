import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Trophy, Copy, Check, Bell, Export, DownloadSimple,
  Star, Flag, Eye, X, Plus, Trash, DotsThree
} from '@phosphor-icons/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { mockContests, mockSubmissions, mockParticipants } from '../data/mockData';
import { getJourneyMeta, buildJourneySteps } from '../utils/journey';
import UpgradeModal from '../components/UpgradeModal';
import PrePublishNudge from '../components/PrePublishNudge';

const TIER = {
  business: { color: '#eaef09', rgb: '234,239,9', label: 'Business', textColor: '#000' },
  team: { color: '#8B5CF6', rgb: '139,92,246', label: 'Team', textColor: '#fff' },
  personal: { color: '#10B981', rgb: '16,185,129', label: 'Personal', textColor: '#fff' },
};

const PHASE_COLORS = {
  submissions: '#3B82F6',
  voting: '#8B5CF6',
  results: '#10B981',
};

// Submission timeline mock data
const timelineData = [
  { day: 'Day 1', submissions: 4 },
  { day: 'Day 2', submissions: 7 },
  { day: 'Day 3', submissions: 12 },
  { day: 'Day 4', submissions: 15 },
  { day: 'Day 5', submissions: 24 },
  { day: 'Day 6', submissions: 31 },
  { day: 'Day 7', submissions: 35 },
];

// Sortable submission item for curation modal
function SortableSubmission({ id, name }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={{ ...style, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, marginBottom: 6, cursor: 'grab' }} {...attributes} {...listeners}>
      <span style={{ fontSize: 15, fontFamily: 'Inter, sans-serif', color: '#fff', flex: 1 }}>{name}</span>
      <span style={{ color: '#7a7a7a' }}>⠿</span>
    </div>
  );
}

export default function ContestDetail() {
  const { contestId } = useParams();
  const navigate = useNavigate();

  const contest = mockContests.find(c => c.id === contestId) || mockContests[0];
  const _meta = getJourneyMeta(contestId);
  const tc = _meta;

  const submissions = mockSubmissions.filter(s => s.contestId === contest?.id);
  const participants = mockParticipants.filter(p => p.contestId === contest?.id);

  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [shortlisted, setShortlisted] = useState(new Set([submissions[0]?.id, submissions[1]?.id]));
  const [flagged, setFlagged] = useState(new Set());
  const [submissionFilter, setSubmissionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showCuration, setShowCuration] = useState(false);
  const [curationPhase, setCurationPhase] = useState('build'); // 'build' | 'verify'
  const [verifyChecks, setVerifyChecks] = useState({});
  const [shortlistItems, setShortlistItems] = useState(
    submissions.slice(0, 3).map((s, i) => ({ id: String(i), name: s.name }))
  );
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showPrePublish, setShowPrePublish] = useState(false);

  // Settings state
  const [contestName, setContestName] = useState(_meta.contestTitle || contest?.title || '');
  const [deadline, setDeadline] = useState(contest?.endsAt || '');
  const [anonLocked] = useState(true);
  const [pinProtected, setPinProtected] = useState(false);
  const [pinValue, setPinValue] = useState('');
  const [reminderSent, setReminderSent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto-open curation modal when journey widget is on the "Curate Shortlist" step
  useEffect(() => {
    if (localStorage.getItem('skipCurationAutoOpen') === '1') {
      localStorage.removeItem('skipCurationAutoOpen');
      return;
    }
    const steps = buildJourneySteps(_meta.group, _meta.sub, _meta.contestType, _meta.transitionMode);
    const storedStep = parseInt(localStorage.getItem('journeyStep') || '0', 10);
    const currentStep = steps[storedStep];
    if (currentStep?.phase === 'curation') {
      setShowCuration(true);
    }
  }, []);

  const phaseColor = PHASE_COLORS[contest?.phase] || '#3B82F6';
  const participationPct = Math.round((submissions.length / (contest?.participantCount || 1)) * 100);

  const handleCopy = () => {
    navigator.clipboard.writeText('https://namingcontest.com/join/xk9p2m').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleShortlist = (id) => {
    setShortlisted(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const handleToggleFlag = (id) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const filteredSubmissions = submissions
    .filter(s => {
      if (submissionFilter === 'shortlisted') return shortlisted.has(s.id);
      if (submissionFilter === 'quality') return s.voteCount > 10;
      return true;
    })
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'alpha') return a.name.localeCompare(b.name);
      if (sortBy === 'quality') return b.voteCount - a.voteCount;
      return b.id.localeCompare(a.id);
    });

  function handleShortlistDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setShortlistItems(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const tabs = ['overview', 'submissions', 'participants', 'settings'];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#141414', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a7a', fontSize: 13 }}>
          <ArrowLeft size={14} /> Dashboard
        </button>
        <span style={{ color: '#333' }}>·</span>
        <h1 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{contest?.title}</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{ padding: '2px 8px', borderRadius: 12, background: `rgba(${tc.rgb},0.1)`, border: `0.5px solid rgba(${tc.rgb},0.3)`, fontSize: 10, fontWeight: 700, color: tc.color, textTransform: 'uppercase' }}>{tc.label}</span>
          <span style={{ padding: '2px 8px', borderRadius: 12, background: `rgba(255,255,255,0.05)`, fontSize: 10, fontWeight: 700, color: phaseColor, textTransform: 'uppercase' }}>{contest?.phase}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={handleCopy} style={{ height: 32, padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, background: 'transparent', color: copied ? '#10B981' : '#a1a1a1', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Invite Link</>}
          </button>
          <button onClick={() => setReminderSent(true)} style={{ height: 32, padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, background: 'transparent', color: reminderSent ? '#10B981' : '#a1a1a1', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Bell size={12} /> {reminderSent ? 'Sent!' : 'Remind'}
          </button>
          <button style={{ height: 32, padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, background: 'transparent', color: '#a1a1a1', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <DownloadSimple size={12} /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#141414', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '0 28px', display: 'flex', gap: 0 }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ height: 44, padding: '0 18px', border: 'none', borderBottom: `2px solid ${activeTab === tab ? tc.color : 'transparent'}`, background: 'transparent', color: activeTab === tab ? '#fff' : '#7a7a7a', fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', fontWeight: activeTab === tab ? 600 : 400 }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 28px' }}>

        {/* ── Tab 1: Overview ── */}
        {activeTab === 'overview' && (
          <div>

            {/* ── Phase Management Bar ── */}
            {(() => {
              const ct = contest?.contestType || 'submission_voting';
              const cp = contest?.currentPhase || contest?.phase || 'submission';
              const allPhases = ct === 'voting_only'
                ? ['voting', 'results']
                : ct === 'internal_brainstorm'
                ? ['submission', 'curation', 'voting', 'results']
                : ['submission', 'curation', 'voting', 'results'];
              const currentIdx = allPhases.indexOf(cp);

              return (
                <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        Contest Type: <span style={{ color: tc.color }}>
                          {ct === 'submission_voting' ? 'Open Contest' : ct === 'voting_only' ? 'Voting Only' : 'Internal Brainstorm'}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>
                        Current phase: <span style={{ color: tc.color, textTransform: 'capitalize' }}>{cp}</span>
                      </div>
                    </div>
                    {cp === 'submission' && ct !== 'voting_only' && (
                      <button onClick={() => setShowCuration(true)} style={{ height: 34, padding: '0 14px', border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, background: `rgba(${tc.rgb},0.08)`, color: tc.color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Close Submissions → Start Curation
                      </button>
                    )}
                    {cp === 'curation' && (
                      <button onClick={() => alert('Voting phase opened! Invites sent to all voters.')} style={{ height: 34, padding: '0 14px', border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, background: `rgba(${tc.rgb},0.08)`, color: tc.color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        Open Voting →
                      </button>
                    )}
                  </div>
                  {/* Phase timeline */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    {allPhases.map((phase, i) => {
                      const isPast = i < currentIdx;
                      const isCurrent = i === currentIdx;
                      return (
                        <div key={phase} style={{ display: 'flex', alignItems: 'center', flex: i < allPhases.length - 1 ? 1 : undefined }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: isPast ? tc.color : isCurrent ? `rgba(${tc.rgb},0.2)` : '#222', border: `2px solid ${isPast ? tc.color : isCurrent ? tc.color : '#333'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: isPast ? (tc.color === '#eaef09' ? '#000' : '#fff') : isCurrent ? tc.color : '#4a4a4a' }}>
                              {isPast ? '✓' : i + 1}
                            </div>
                            <div style={{ fontSize: 10, color: isCurrent ? '#fff' : isPast ? '#7a7a7a' : '#4a4a4a', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{phase}</div>
                          </div>
                          {i < allPhases.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: isPast ? tc.color : '#222', marginBottom: 14, marginLeft: 4, marginRight: 4 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Internal Brainstorm specific: show submitter vs voter lists */}
                  {ct === 'internal_brainstorm' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ padding: '10px 12px', background: '#141414', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#7a7a7a', textTransform: 'uppercase', marginBottom: 6 }}>Submitters</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                          {contest?.submissionCount || 0} <span style={{ fontSize: 13, color: '#7a7a7a', fontWeight: 400 }}>of {(contest?.submitterEmails || []).length || contest?.participantCount || 0} submitted</span>
                        </div>
                      </div>
                      <div style={{ padding: '10px 12px', background: '#141414', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#7a7a7a', textTransform: 'uppercase', marginBottom: 6 }}>
                          Voters {cp === 'voting' ? '' : '(invited after submissions)'}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                          {cp === 'voting' ? '8 of ' : ''}{(contest?.voterEmails || []).length || 0} <span style={{ fontSize: 13, color: '#7a7a7a', fontWeight: 400 }}>{cp === 'voting' ? 'have voted' : 'will vote'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Voting-only specific: voter participation */}
                  {ct === 'voting_only' && cp === 'voting' && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#7a7a7a', marginBottom: 2 }}>Voter participation</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                          {Math.round((contest?.participantCount || 18) * 0.78)} of {contest?.participantCount || 18} voters
                          <span style={{ fontSize: 12, color: tc.color, fontWeight: 600, marginLeft: 8 }}>78%</span>
                        </div>
                      </div>
                      <div style={{ flex: 1, height: 6, background: '#222', borderRadius: 3 }}>
                        <div style={{ width: '78%', height: '100%', background: tc.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
              {[
                { label: 'Participants', value: contest?.participantCount || 0 },
                { label: 'Submissions', value: contest?.submissionCount || 0 },
                { label: 'Votes Cast', value: contest?.currentPhase === 'voting' || contest?.phase === 'voting' ? 18 : 0 },
                { label: 'Days Remaining', value: contest?.daysLeft || 0 },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px' }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, color: '#fff', fontWeight: 700, marginBottom: 2 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: '#7a7a7a' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
              {/* Timeline chart */}
              <div>
                <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20, marginBottom: 20, height: 220 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Submission Activity</div>
                  <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={timelineData}>
                      <XAxis dataKey="day" tick={{ fill: '#7a7a7a', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#7a7a7a', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                      <Area type="monotone" dataKey="submissions" stroke={tc.color} fill={`rgba(${tc.rgb},0.1)`} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Day 4 reminder prompt */}
                {contest?.daysLeft <= 6 && contest?.daysLeft >= 3 && (
                  <div style={{ padding: '14px 16px', background: 'rgba(234,239,9,0.06)', border: '1px solid rgba(234,239,9,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Bell size={16} color="#eaef09" />
                    <div style={{ flex: 1, fontSize: 13, color: '#a1a1a1' }}>
                      <strong style={{ color: '#fff' }}>Reminder time!</strong> Send a Day 4 reminder to boost participation.
                    </div>
                    <button onClick={() => setReminderSent(true)} style={{ height: 32, padding: '0 14px', border: '1px solid #eaef09', borderRadius: 7, background: 'rgba(234,239,9,0.08)', color: '#eaef09', fontSize: 12, cursor: 'pointer' }}>
                      {reminderSent ? 'Sent ✓' : 'Send Now'}
                    </button>
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div>
                <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Quick Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button onClick={() => setReminderSent(true)} style={{ height: 38, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, background: 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
                      <Bell size={14} /> {reminderSent ? 'Reminder Sent ✓' : 'Send Reminder ✉'}
                    </button>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="date" defaultValue={deadline} style={{ flex: 1, background: '#141414', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 7, height: 36, padding: '0 10px', color: '#fff', fontSize: 12 }} onChange={e => setDeadline(e.target.value)} />
                      <button style={{ height: 36, padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, background: 'transparent', color: '#a1a1a1', fontSize: 12, cursor: 'pointer' }}>Save</button>
                    </div>
                    <button onClick={() => alert('CSV downloaded!')} style={{ height: 38, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, background: 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
                      <Export size={14} /> Export Data
                    </button>
                    <button onClick={handleCopy} style={{ height: 38, border: `1px solid rgba(${tc.rgb},0.3)`, borderRadius: 8, background: `rgba(${tc.rgb},0.06)`, color: tc.color, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px' }}>
                      <Copy size={14} /> {copied ? 'Link Copied!' : 'Copy Invite Link'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Email Flows ── */}
            {(() => {
              const emailFlows = [
                {
                  id: 'day4',
                  subject: 'Don\'t forget — contest closes soon!',
                  preview: 'You\'re invited to submit a name for [Contest]. Only 3 days left...',
                  trigger: 'Day 4 of submission phase',
                  badge: 'Scheduled',
                  badgeColor: '#8B5CF6',
                  sent: false,
                },
                {
                  id: 'voting',
                  subject: 'Voting is now open — have your say!',
                  preview: 'The submissions are in. Now it\'s time to vote for your favourite...',
                  trigger: 'When voting phase opens',
                  badge: 'Auto',
                  badgeColor: '#3b82f6',
                  sent: false,
                },
                {
                  id: 'results',
                  subject: 'The winner has been chosen!',
                  preview: 'Results are in for [Contest Name]. Click to see which name won...',
                  trigger: 'When results are published',
                  badge: 'Auto',
                  badgeColor: '#3b82f6',
                  sent: false,
                },
              ];
              return (
                <div style={{ marginTop: 28 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    Email Flows
                    <span style={{ fontSize: 10, color: '#7a7a7a', fontWeight: 400 }}>Preview and trigger participant emails</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {emailFlows.map(ef => (
                      <div key={ef.id} style={{
                        background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)',
                        borderRadius: 10, padding: '14px 16px',
                        display: 'flex', alignItems: 'center', gap: 14,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{ef.subject}</span>
                            <span style={{
                              fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                              background: `${ef.badgeColor}20`, border: `0.5px solid ${ef.badgeColor}50`,
                              color: ef.badgeColor, textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>{ef.badge}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#7a7a7a', marginBottom: 2 }}>{ef.preview}</div>
                          <div style={{ fontSize: 10, color: '#4a4a4a' }}>Trigger: {ef.trigger}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button style={{
                            height: 30, padding: '0 12px', borderRadius: 7,
                            border: '0.5px solid rgba(255,255,255,0.1)', background: 'transparent',
                            color: '#a1a1a1', fontSize: 11, cursor: 'pointer',
                          }}>
                            Preview
                          </button>
                          <button style={{
                            height: 30, padding: '0 12px', borderRadius: 7,
                            border: `0.5px solid ${tc.color}60`, background: `rgba(${tc.rgb},0.08)`,
                            color: tc.color, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          }}>
                            Send Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Tab 2: Submissions ── */}
        {activeTab === 'submissions' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{submissions.length} Submissions</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['all', 'quality', 'shortlisted'].map(f => (
                  <button key={f} onClick={() => setSubmissionFilter(f)} style={{ height: 28, padding: '0 12px', border: `1px solid ${submissionFilter === f ? tc.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, background: submissionFilter === f ? `rgba(${tc.rgb},0.08)` : 'transparent', color: submissionFilter === f ? tc.color : '#7a7a7a', fontSize: 11, cursor: 'pointer', textTransform: 'capitalize' }}>
                    {f === 'quality' ? '⭐ Quality' : f === 'shortlisted' ? '✓ Shortlisted' : 'All'}
                  </button>
                ))}
              </div>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search names..." style={{ height: 32, padding: '0 12px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#fff', fontSize: 12, width: 180 }} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ height: 32, padding: '0 10px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#a1a1a1', fontSize: 12 }}>
                <option value="recent">Recent</option>
                <option value="alpha">Alphabetical</option>
                <option value="quality">Quality Score</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {filteredSubmissions.map(sub => (
                <div key={sub.id} style={{ background: '#1a1a1a', border: `0.5px solid ${shortlisted.has(sub.id) ? `rgba(${tc.rgb},0.3)` : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#fff' }}>{sub.name}</span>
                    {sub.voteCount > 12 && <span style={{ fontSize: 10, fontWeight: 700, color: '#eaef09', background: 'rgba(234,239,9,0.1)', padding: '2px 7px', borderRadius: 4 }}>⭐ Quality</span>}
                  </div>
                  {sub.rationale && <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8, lineHeight: 1.5 }}>"{sub.rationale}"</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#7a7a7a' }}>{sub.submittedBy || 'Anonymous'}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleToggleShortlist(sub.id)} style={{ height: 28, width: 28, border: `1px solid ${shortlisted.has(sub.id) ? tc.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, background: shortlisted.has(sub.id) ? `rgba(${tc.rgb},0.1)` : 'transparent', color: shortlisted.has(sub.id) ? tc.color : '#7a7a7a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={12} weight={shortlisted.has(sub.id) ? 'fill' : 'regular'} />
                      </button>
                      <button onClick={() => handleToggleFlag(sub.id)} style={{ height: 28, width: 28, border: `1px solid ${flagged.has(sub.id) ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, background: 'transparent', color: flagged.has(sub.id) ? '#ef4444' : '#7a7a7a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Flag size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 16 }}>Showing {filteredSubmissions.length} of {submissions.length}</div>

            <button onClick={() => setShowCuration(true)} style={{ height: 48, padding: '0 24px', border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.1)`, color: tc.color, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Create Shortlist →
            </button>
          </div>
        )}

        {/* ── Tab 3: Participants ── */}
        {activeTab === 'participants' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <input placeholder="Search participants..." style={{ height: 32, padding: '0 12px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#fff', fontSize: 12, width: 220 }} />
              {['All', 'Submitted', 'Voted', 'Not Participated'].map(f => (
                <button key={f} style={{ height: 28, padding: '0 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, background: 'transparent', color: '#7a7a7a', fontSize: 11, cursor: 'pointer' }}>{f}</button>
              ))}
            </div>

            <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', padding: '10px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: '#141414' }}>
                {['Name', 'Email', 'Submitted', 'Voted', 'Naming Pts', 'Status'].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
                ))}
              </div>
              {participants.length > 0 ? participants.map((p, i) => (
                <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: i < participants.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#7a7a7a' }}>{p.email}</div>
                  <div style={{ fontSize: 12, color: p.submitted ? '#10B981' : '#7a7a7a' }}>{p.submitted ? '✓' : '—'}</div>
                  <div style={{ fontSize: 12, color: p.voted ? '#10B981' : '#7a7a7a' }}>{p.voted ? '✓' : '—'}</div>
                  <div style={{ fontSize: 12, color: '#a1a1a1' }}>{p.submitted ? 142 : p.voted ? 80 : 25}</div>
                  <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: p.submitted && p.voted ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: p.submitted && p.voted ? '#10B981' : '#7a7a7a', display: 'inline-block' }}>
                    {p.submitted && p.voted ? 'Complete ✓' : p.submitted ? 'Submitted' : 'Invited'}
                  </div>
                </div>
              )) : (
                <div style={{ padding: '28px', textAlign: 'center', color: '#7a7a7a', fontSize: 13 }}>No participants yet — share your invite link</div>
              )}
            </div>

            {participants.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setShowUpgrade(true)} style={{ height: 32, padding: '0 14px', border: `1px solid rgba(${tc.rgb},0.3)`, borderRadius: 7, background: 'transparent', color: tc.color, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Bell size={12} /> Send Reminder
                </button>
                <button style={{ height: 32, padding: '0 14px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>
                  Remove Selected
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tab 4: Settings ── */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: 520 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Contest name */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'block', marginBottom: 8 }}>Contest Name</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={contestName} onChange={e => setContestName(e.target.value)} style={{ flex: 1, background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, height: 36, padding: '0 12px', color: '#fff', fontSize: 14 }} />
                  <button style={{ height: 36, padding: '0 16px', border: `1px solid rgba(${tc.rgb},0.3)`, borderRadius: 8, background: `rgba(${tc.rgb},0.06)`, color: tc.color, fontSize: 13, cursor: 'pointer' }}>Save</button>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#fff', display: 'block', marginBottom: 8 }}>Contest Deadline</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ flex: 1, background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, height: 36, padding: '0 12px', color: '#fff', fontSize: 14 }} />
                  <button style={{ height: 36, padding: '0 16px', border: `1px solid rgba(${tc.rgb},0.3)`, borderRadius: 8, background: `rgba(${tc.rgb},0.06)`, color: tc.color, fontSize: 13, cursor: 'pointer' }}>Save</button>
                </div>
              </div>

              {/* Anonymous toggle */}
              <div style={{ padding: '14px 16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: anonLocked ? '#7a7a7a' : '#fff' }}>Anonymous Submissions</span>
                  <div style={{ width: 44, height: 24, borderRadius: 12, background: '#10B981', position: 'relative', opacity: anonLocked ? 0.5 : 1 }}>
                    <div style={{ position: 'absolute', top: 3, left: 23, width: 18, height: 18, borderRadius: '50%', background: '#fff' }} />
                  </div>
                </div>
                {anonLocked && <div style={{ fontSize: 12, color: '#7a7a7a' }}>🔒 Locked: submissions received</div>}
              </div>

              {/* Voting method */}
              <div style={{ padding: '14px 16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#7a7a7a', marginBottom: 4 }}>Voting Method</div>
                <div style={{ fontSize: 13, color: '#a1a1a1' }}>Multi-Criteria Scoring <span style={{ color: '#7a7a7a', fontSize: 11 }}>— 🔒 Locked after voting starts</span></div>
              </div>

              {/* PIN */}
              <div style={{ padding: '14px 16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>PIN Protection</span>
                  <div onClick={() => setPinProtected(!pinProtected)} style={{ width: 44, height: 24, borderRadius: 12, background: pinProtected ? tc.color : '#333', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: 3, left: pinProtected ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                  </div>
                </div>
                {pinProtected && (
                  <input type="text" maxLength={6} value={pinValue} onChange={e => setPinValue(e.target.value)} placeholder="Enter 4-6 digit PIN" style={{ width: '100%', background: '#141414', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 7, height: 36, padding: '0 12px', color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
                )}
              </div>

              {/* Danger zone */}
              <div style={{ padding: '16px', background: 'rgba(239,68,68,0.04)', border: '0.5px solid rgba(239,68,68,0.15)', borderRadius: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Danger Zone</div>
                {showDeleteConfirm ? (
                  <div>
                    <div style={{ fontSize: 13, color: '#a1a1a1', marginBottom: 10 }}>Are you sure? This cannot be undone.</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate('/dashboard')} style={{ height: 32, padding: '0 16px', border: '1px solid #ef4444', borderRadius: 7, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>Yes, Delete</button>
                      <button onClick={() => setShowDeleteConfirm(false)} style={{ height: 32, padding: '0 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, background: 'transparent', color: '#a1a1a1', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowDeleteConfirm(true)} style={{ height: 32, padding: '0 16px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>
                    Delete Contest
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Curation Modal ── */}
      {showCuration && (() => {
        // Segment-aware verification checklist
        const group = _meta.group;
        const sub   = _meta.sub;
        const verifyItems = (() => {
          const biz = ['company-name','product-name','project-name','rebrand','other-business'].includes(sub);
          const band = sub === 'band-music';
          const podcast = sub === 'podcast-channel';
          const sports = sub === 'sports-team';
          const baby = sub === 'baby-name';
          const pet = sub === 'pet-name';

          if (biz) return [
            { id: 'tm_free', label: 'Run a free USPTO trademark search', sub: 'Search TESS for identical/similar marks in your class. Free — takes 10 min.', link: 'https://tmsearch.uspto.gov', linkLabel: 'Open TESS →', required: true },
            { id: 'tm_pro', label: 'Consider a professional trademark search', sub: 'LegalZoom full clearance report ($199). Catches phonetic matches & design marks USPTO search misses.', affiliate: 'LegalZoom', required: false },
            { id: 'domain', label: 'Check domain availability', sub: 'Check .com first, then .io / .co / .net / .ai. Real-time via Namecheap.', affiliate: 'Namecheap', required: true },
            { id: 'social', label: 'Check social media handles', sub: 'Instagram, X (Twitter), LinkedIn, TikTok — ideally all match your chosen name.', required: true },
            ...(sub === 'company-name' ? [{ id: 'llc', label: 'Secure the legal entity name', sub: 'You have a name — now make it official. File your LLC before someone else does.', affiliate: 'LegalZoom LLC', required: false }] : []),
            { id: 'logo', label: 'Start thinking about your logo', sub: 'Three paths: custom/premium (99designs), AI-fast (Looka), accessible (Fiverr).', required: false },
          ];
          if (band) return [
            { id: 'tm_free', label: 'Run a free USPTO trademark search', sub: 'Check TESS for your band name in entertainment/music classes (Class 41).', link: 'https://tmsearch.uspto.gov', linkLabel: 'Open TESS →', required: true },
            { id: 'tm_pro', label: 'Consider a full trademark clearance', sub: 'LegalZoom full search catches soundalike band names across markets.', affiliate: 'LegalZoom', required: false },
            { id: 'domain', label: 'Check domain & social handles', sub: 'Claim your .com and social media handles before announcing.', affiliate: 'Namecheap', required: true },
            { id: 'distro', label: 'Verify the name is free on streaming platforms', sub: 'Search Spotify, Apple Music, and Bandcamp — a conflicting artist causes confusion at launch.', required: true },
            { id: 'logo', label: 'Commission your band logo', sub: 'Looka (fast + AI), 99designs (custom), Fiverr (budget-friendly).', required: false },
          ];
          if (podcast) return [
            { id: 'domain', label: 'Check domain availability', sub: 'A matching domain builds credibility with listeners and guests.', affiliate: 'Namecheap', required: true },
            { id: 'social', label: 'Check social handles', sub: 'Instagram, X, YouTube, TikTok — ideally @YourPodcastName across all.', required: true },
            { id: 'platforms', label: 'Search podcast directories', sub: 'Check Apple Podcasts, Spotify, and Google Podcasts for existing shows with your name.', required: true },
            { id: 'logo', label: 'Design your cover art', sub: 'Podcast cover art (3000×3000px) is your first impression. Looka can generate one in minutes.', required: false },
          ];
          if (sports) return [
            { id: 'local', label: 'Check league/association name registry', sub: 'Verify the name is not already used by another team in your league or region.', required: true },
            { id: 'domain', label: 'Claim a website or social handle', sub: 'Even a simple page builds team identity. Namecheap domains from $10/yr.', affiliate: 'Namecheap', required: false },
            { id: 'merch', label: 'Check merch printability', sub: 'Some names are hard to render on jerseys. Order a test print via Printful — no minimums.', affiliate: 'Printful', required: false },
          ];
          if (baby) return [
            { id: 'meaning', label: 'Verify meaning across languages', sub: "Check the name doesn't have unintended meanings in other languages your family speaks or travels to.", required: true },
            { id: 'initials', label: 'Check initials and nicknames', sub: 'Write out the full name with middle and last name. Any awkward initials or nicknames?', required: true },
            { id: 'announce', label: 'Prepare your birth announcement', sub: 'Artifact Uprising makes premium birth announcement cards. Order early — ships in 5–7 days.', affiliate: 'Artifact Uprising', required: false },
          ];
          if (pet) return [
            { id: 'test', label: 'Test the name aloud', sub: 'Say it 10 times fast — can you call it in a park? Does it work as a command prefix?', required: true },
            { id: 'similar', label: 'Check for sound-alike commands', sub: "Avoid names that sound like sit, stay, no, come — your pet will be confused.", required: true },
          ];
          // Default (personal)
          return [
            { id: 'test', label: 'Say the name aloud in context', sub: 'Test how it sounds in real sentences you will use it in.', required: true },
            { id: 'domain', label: 'Check availability if relevant', sub: 'If you plan to create a presence around this name, grab the domain now.', affiliate: 'Namecheap', required: false },
          ];
        })();

        const allRequired = verifyItems.filter(i => i.required).every(i => verifyChecks[i.id]);

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 300, overflowY: 'auto', padding: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, maxWidth: 820, width: '100%', marginTop: 40 }}>

              {/* Phase indicator */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {['Build Shortlist', 'Verify Before Sending'].map((label, i) => (
                  <div key={i} style={{
                    padding: '5px 14px', borderRadius: 20,
                    background: i === (curationPhase === 'build' ? 0 : 1) ? tc.color : '#2a2a2a',
                    color: i === (curationPhase === 'build' ? 0 : 1) ? tc.textColor : '#555',
                    fontSize: 12, fontWeight: 700,
                  }}>{i + 1}. {label}</div>
                ))}
                <button onClick={() => { setShowCuration(false); setCurationPhase('build'); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}><X size={18} /></button>
              </div>

              {curationPhase === 'build' ? (
                <>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', marginBottom: 4 }}>Build Your Shortlist</h2>
                  <p style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 20 }}>Touchpoint 5 — Select the best submissions for your ballot</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                    {[
                      { num: '01', title: 'Diversity of Types', body: 'Mix descriptive, suggestive, and abstract names. Don\'t shortlist 5 similar-style names.' },
                      { num: '02', title: 'Anchoring Bias', body: 'The first option gets 23% more votes. Randomize order — don\'t put your favorite first.' },
                      { num: '03', title: 'Include One Surprise', body: '30% of winners weren\'t the organizer\'s top pick. Add one that surprised you.' },
                    ].map(p => (
                      <div key={p.num} style={{ padding: 12, background: '#141414', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: tc.color, marginBottom: 4 }}>{p.num}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: '#6a6a6a', lineHeight: 1.5 }}>{p.body}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#7a7a7a', textTransform: 'uppercase', marginBottom: 8 }}>All Submissions ({submissions.length})</div>
                      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                        {submissions.map(s => (
                          <div key={s.id} onClick={() => {
                            if (!shortlistItems.find(i => i.name === s.name)) {
                              setShortlistItems(prev => [...prev, { id: String(prev.length), name: s.name }]);
                            }
                          }} style={{ padding: '9px 12px', background: '#141414', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: 5, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#fff' }}>{s.name}</span>
                            <Plus size={13} color="#555" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#7a7a7a', textTransform: 'uppercase', marginBottom: 8 }}>
                        Shortlist — {shortlistItems.length} names {shortlistItems.length >= 5 && shortlistItems.length <= 8 ? '✓ Good range' : shortlistItems.length < 5 ? '(add more)' : '(consider trimming)'}
                      </div>
                      <DndContext collisionDetection={closestCenter} onDragEnd={handleShortlistDragEnd}>
                        <SortableContext items={shortlistItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                          {shortlistItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ flex: 1 }}><SortableSubmission id={item.id} name={item.name} /></div>
                              <button onClick={() => setShortlistItems(prev => prev.filter(i => i.id !== item.id))} style={{ width: 34, height: 34, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, background: 'transparent', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </SortableContext>
                      </DndContext>
                      {shortlistItems.length === 0 && (
                        <div style={{ padding: 18, border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 8, textAlign: 'center', color: '#555', fontSize: 12 }}>
                          Click names on the left to add
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => shortlistItems.length >= 2 && setCurationPhase('verify')}
                      disabled={shortlistItems.length < 2}
                      style={{ flex: 1, height: 44, border: `1.5px solid ${shortlistItems.length >= 2 ? tc.color : '#2a2a2a'}`, borderRadius: 10, background: shortlistItems.length >= 2 ? `rgba(${tc.rgb},0.12)` : 'transparent', color: shortlistItems.length >= 2 ? tc.color : '#333', fontSize: 14, fontWeight: 700, cursor: shortlistItems.length >= 2 ? 'pointer' : 'default' }}>
                      Continue to Verification →
                    </button>
                    <button onClick={() => setShowCuration(false)} style={{ height: 44, padding: '0 20px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, background: 'transparent', color: '#7a7a7a', fontSize: 13, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', marginBottom: 4 }}>Verify Before Publishing</h2>
                  <p style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 20 }}>
                    Complete the required checks for <strong style={{ color: tc.color }}>{_meta.subLabel}</strong>. Required items must be checked before you can publish.
                  </p>

                  <div style={{ marginBottom: 24 }}>
                    {verifyItems.map(item => (
                      <div key={item.id} onClick={() => setVerifyChecks(v => ({ ...v, [item.id]: !v[item.id] }))} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                        background: verifyChecks[item.id] ? `rgba(${tc.rgb},0.07)` : '#141414',
                        border: `0.5px solid ${verifyChecks[item.id] ? tc.color + '40' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                      }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
                          background: verifyChecks[item.id] ? tc.color : 'transparent',
                          border: `1.5px solid ${verifyChecks[item.id] ? tc.color : '#3a3a3a'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, color: tc.textColor,
                        }}>
                          {verifyChecks[item.id] ? '✓' : ''}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.label}</span>
                            {item.required && <span style={{ fontSize: 9, background: '#3a1a1a', color: '#ef4444', borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>REQUIRED</span>}
                            {item.affiliate && <span style={{ fontSize: 9, background: `rgba(${tc.rgb},0.1)`, color: tc.color, borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>{item.affiliate}</span>}
                          </div>
                          <div style={{ fontSize: 12, color: '#6a6a6a', lineHeight: 1.5 }}>{item.sub}</div>
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-block', marginTop: 5, fontSize: 11, color: tc.color, textDecoration: 'none', fontWeight: 600 }}>
                              {item.linkLabel}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!allRequired && (
                    <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 12, color: '#ef4444', marginBottom: 16 }}>
                      Complete all required checks before publishing your shortlist.
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setCurationPhase('build')} style={{ height: 44, padding: '0 20px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, background: 'transparent', color: '#7a7a7a', fontSize: 13, cursor: 'pointer' }}>
                      ← Back
                    </button>
                    <button
                      onClick={() => { if (allRequired) { setShowCuration(false); setCurationPhase('build'); setVerifyChecks({}); } }}
                      disabled={!allRequired}
                      style={{ flex: 1, height: 44, border: `1.5px solid ${allRequired ? tc.color : '#2a2a2a'}`, borderRadius: 10, background: allRequired ? `rgba(${tc.rgb},0.12)` : 'transparent', color: allRequired ? tc.color : '#333', fontSize: 14, fontWeight: 700, cursor: allRequired ? 'pointer' : 'default' }}>
                      {allRequired ? 'Publish Shortlist → Open Voting' : `Complete ${verifyItems.filter(i => i.required && !verifyChecks[i.id]).length} required check(s) first`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} trigger="participants" currentGroup={_meta.group} />

      {/* Pre-Publish Nudge */}
      <PrePublishNudge isOpen={showPrePublish} onClose={() => setShowPrePublish(false)} winnerName={submissions[0]?.name} currentGroup={_meta.group} onProceed={() => { setShowPrePublish(false); navigate(`/results/${contest?.id}`); }} />
    </div>
  );
}
