import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import namicoIcon from '../../assets/namico-icon.svg';
import {
  Trophy, House, ListBullets, ChartBar, GearSix, Plus,
  Users, Lightning, ArrowRight, Bell, Export, Eye
} from '@phosphor-icons/react';
import { mockContests } from '../../data/mockData';
import { loadCreatorQuality, loadParticipantQuality, qualityLabel } from '../../utils/quality';

const TIER = {
  business: { color: '#eaef09', rgb: '234,239,9', label: 'Business' },
  team: { color: '#8B5CF6', rgb: '139,92,246', label: 'Team' },
  personal: { color: '#10B981', rgb: '16,185,129', label: 'Personal' },
};

const PHASE_LABELS = {
  submissions: { label: 'Submissions', color: '#7a7a7a' },
  voting: { label: 'Voting', color: '#7a7a7a' },
  results: { label: 'Results', color: '#7a7a7a' },
};

function SegmentPill({ group }) {
  const tc = TIER[group] || TIER.business;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 12, background: `rgba(${tc.rgb},0.1)`, border: `0.5px solid rgba(${tc.rgb},0.3)`, fontSize: 10, fontWeight: 700, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {tc.label}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [autoRenewal, setAutoRenewal] = useState(true);

  const active = mockContests.filter(c => c.status === 'active');
  const completed = mockContests.filter(c => c.status === 'completed');

  const navItems = [
    { id: 'contests', label: 'My Contests', icon: <ListBullets size={16} /> },
  ];

  const totalContests = mockContests.length;
  const totalParticipants = mockContests.reduce((sum, c) => sum + c.participantCount, 0);
  const avgParticipation = Math.round(mockContests.reduce((sum, c) => sum + (c.participantCount > 0 ? (c.submissionCount / c.participantCount) * 100 : 0), 0) / mockContests.length);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: '#0f0f0f', borderRight: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '20px 12px', flexShrink: 0 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 32, padding: '0 8px' }}>
          <div style={{ width: 28, height: 28, background: '#eaef09', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={namicoIcon} alt="Namico" style={{ width: 18, height: 18, display: 'block' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Namico</span>
        </Link>

        {/* New Contest */}
        <button onClick={() => navigate('/select')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 36, border: '1.5px solid #eaef09', borderRadius: 8, background: 'rgba(234,239,9,0.08)', color: '#eaef09', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 24 }}>
          <Plus size={14} weight="bold" /> New Contest
        </button>

        {/* Nav */}
        <div style={{ flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, height: 36, padding: '0 10px', borderRadius: 8, border: 'none', background: 'rgba(234,239,9,0.1)', color: '#eaef09', fontSize: 13, cursor: 'default', textAlign: 'left', marginBottom: 2 }}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* User */}
        <div style={{ padding: '12px 10px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(234,239,9,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#eaef09' }}>SC</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Sarah Chen</div>
              <div style={{ fontSize: 11, color: '#7a7a7a' }}>sarah@example.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, color: '#fff', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#7a7a7a' }}>Manage your active contests and track results.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 24 }}>

          {/* Column 1: Active Contests */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Active Contests</span>
              <span style={{ padding: '2px 8px', background: '#222', borderRadius: 12, fontSize: 12, color: '#a1a1a1' }}>{active.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {active.map(contest => {
                const tc = TIER[contest.group] || TIER.business;
                const phase = PHASE_LABELS[contest.phase] || PHASE_LABELS.submissions;
                const participationPct = Math.round((contest.submissionCount / (contest.participantCount * 2)) * 100);
                const cq = loadCreatorQuality(contest.group);
                const pq = loadParticipantQuality(contest.group);
                const totalQ = cq + pq;

                return (
                  <div key={contest.id} style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{contest.title}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <SegmentPill group={contest.group} />
                          <span style={{ padding: '2px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', fontSize: 10, fontWeight: 600, color: phase.color }}>
                            {phase.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: '#a1a1a1', fontWeight: 600, marginBottom: 8 }}>
                      Closes in {contest.daysLeft} day{contest.daysLeft !== 1 ? 's' : ''}
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7a7a7a', marginBottom: 4 }}>
                        <span>Participation</span>
                        <span>{participationPct}%</span>
                      </div>
                      <div style={{ height: 4, background: '#222', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${participationPct}%`, background: tc.color, borderRadius: 4 }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#7a7a7a', marginBottom: 12 }}>
                      <span>{contest.participantCount} participants</span>
                      <span>·</span>
                      <span>{contest.submissionCount} submissions</span>
                      <span>·</span>
                      <span>{contest.daysLeft}d left</span>
                    </div>

                    {/* Quality Score */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7a7a7a', marginBottom: 4 }}>
                        <span>Contest Quality — <span style={{ color: totalQ >= 65 ? tc.color : totalQ >= 40 ? '#a1a1a1' : '#555', fontWeight: 600 }}>{qualityLabel(totalQ)}</span></span>
                        <span style={{ color: tc.color, fontWeight: 700 }}>{totalQ}%</span>
                      </div>
                      <div style={{ position: 'relative', height: 5, background: '#222', borderRadius: 3 }}>
                        {/* Creator portion */}
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${cq}%`, background: tc.color, borderRadius: 3, opacity: 0.6 }} />
                        {/* Participant portion */}
                        <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: `${pq}%`, background: tc.color, borderRadius: 3 }} />
                        {/* Midpoint */}
                        <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1, background: 'rgba(255,255,255,0.15)' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#444', marginTop: 3 }}>
                        <span>Creator {cq}/50</span>
                        <span>Participants {pq}/50</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ flex: 1, height: 32, border: `1px solid rgba(${tc.rgb},0.3)`, borderRadius: 7, background: `rgba(${tc.rgb},0.06)`, color: tc.color, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Eye size={12} /> View
                      </button>
                      <button style={{ height: 32, padding: '0 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, background: 'transparent', color: '#a1a1a1', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Bell size={12} /> Remind
                      </button>
                      <button style={{ height: 32, padding: '0 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, background: 'transparent', color: '#a1a1a1', fontSize: 12, cursor: 'pointer' }}>
                        Extend
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Create new card */}
              <button onClick={() => navigate('/select')} style={{ padding: '20px', border: '1.5px dashed rgba(255,255,255,0.12)', borderRadius: 12, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#7a7a7a', fontSize: 13 }}>
                <Plus size={16} /> Create New Contest
              </button>
            </div>
          </div>

          {/* Column 2: Completed */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Completed</span>
              <span style={{ padding: '2px 8px', background: '#222', borderRadius: 12, fontSize: 12, color: '#a1a1a1' }}>{completed.length}</span>
            </div>

            {completed.length === 0 ? (
              <div style={{ padding: 20, background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, textAlign: 'center', color: '#7a7a7a', fontSize: 13 }}>
                No completed contests yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {completed.map(contest => {
                  const tc = TIER[contest.group] || TIER.business;
                  const participationPct = Math.round((contest.submissionCount / (contest.participantCount * 2)) * 100);
                  return (
                    <div key={contest.id} style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{contest.title}</div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, color: tc.color, marginBottom: 6 }}>
                        {contest.winner}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7a7a7a', marginBottom: 10 }}>
                        <span>{contest.endsAt}</span>
                        <span>{participationPct}% participation</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => navigate(`/results/${contest.id}`)} style={{ flex: 1, height: 30, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, background: 'transparent', color: '#a1a1a1', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          View Results <ArrowRight size={11} />
                        </button>
                        <button style={{ height: 30, padding: '0 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, background: 'transparent', color: '#a1a1a1', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Export size={11} /> Export
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 3: Account Overview */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Account Overview</div>

            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Total Contests', value: totalContests, icon: <Trophy size={16} color="#eaef09" />, color: '#eaef09' },
                { label: 'Participants Reached', value: totalParticipants, icon: <Users size={16} color="#8B5CF6" />, color: '#8B5CF6' },
                { label: 'Avg Participation', value: `${avgParticipation}%`, icon: <Lightning size={16} color="#10B981" />, color: '#10B981' },
              ].map(stat => (
                <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(${stat.color === '#eaef09' ? '234,239,9' : stat.color === '#8B5CF6' ? '139,92,246' : '16,185,129'},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', fontWeight: 700 }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#7a7a7a' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subscription Card */}
            <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(234,239,9,0.15)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#eaef09', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Subscription</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', padding: '2px 8px', background: 'rgba(16,185,129,0.1)', border: '0.5px solid rgba(16,185,129,0.3)', borderRadius: 4 }}>ACTIVE</span>
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 2 }}>Business Plan</div>
              <div style={{ fontSize: 13, color: '#a1a1a1', marginBottom: 12 }}>$89 per contest</div>
              <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 12 }}>Renews Apr 15, 2026</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 13, color: '#a1a1a1' }}>Auto-renewal</span>
                <div onClick={() => setAutoRenewal(!autoRenewal)} style={{ width: 40, height: 22, borderRadius: 11, background: autoRenewal ? '#10B981' : '#333', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: autoRenewal ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating action button removed */}

      {/* No modal needed */}
    </div>
  );
}
