import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import namicoIcon from '../../assets/namico-icon.svg';
import {
  Trophy, House, ListBullets, ChartBar, GearSix, Plus,
  Users, Lightning, ArrowRight, Bell, Export, Eye
} from '@phosphor-icons/react';
import { mockContests } from '../../data/mockData';
import { loadCreatorQuality, loadParticipantQuality, qualityLabel } from '../../utils/quality';
import { getGroupTheme, getNeutralTheme, LIGHT_THEME, GROUP_THEME } from '../../data/themeConfig';

const PHASE_LABELS = {
  submissions: { label: 'Submissions', color: LIGHT_THEME.textMuted },
  voting: { label: 'Voting', color: LIGHT_THEME.textMuted },
  results: { label: 'Results', color: LIGHT_THEME.textMuted },
};

function SegmentPill({ group }) {
  const gt = GROUP_THEME[group] || GROUP_THEME.business;
  return (
    <span style={{ padding: '2px 8px', borderRadius: 12, background: gt.tagBg, border: `0.5px solid ${gt.tagBorder}`, fontSize: 10, fontWeight: 700, color: gt.tagText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {gt.label}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [autoRenewal, setAutoRenewal] = useState(true);
  const ntc = getNeutralTheme();

  const active = mockContests.filter(c => c.status === 'active');
  const completed = mockContests.filter(c => c.status === 'completed');

  const navItems = [
    { id: 'contests', label: 'My Contests', icon: <ListBullets size={16} /> },
  ];

  const totalContests = mockContests.length;
  const totalParticipants = mockContests.reduce((sum, c) => sum + c.participantCount, 0);
  const avgParticipation = Math.round(mockContests.reduce((sum, c) => sum + (c.participantCount > 0 ? (c.submissionCount / c.participantCount) * 100 : 0), 0) / mockContests.length);

  return (
    <div style={{ minHeight: '100vh', background: LIGHT_THEME.pageBg, fontFamily: LIGHT_THEME.fontBody, display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: LIGHT_THEME.sidebarBg, borderRight: `0.5px solid ${LIGHT_THEME.sidebarBorder}`, display: 'flex', flexDirection: 'column', padding: '20px 12px', flexShrink: 0 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 32, padding: '0 8px' }}>
          <div style={{ width: 28, height: 28, background: '#1e2330', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={namicoIcon} alt="NamingContest" style={{ width: 18, height: 18, display: 'block', filter: 'brightness(0) invert(1)' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1e2330' }}>NamingContest</span>
        </Link>

        {/* New Contest */}
        <button onClick={() => navigate('/select')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 36, border: `1.5px solid ${ntc.tagBorder}`, borderRadius: 8, background: ntc.tagBg, color: ntc.primary, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 24 }}>
          <Plus size={14} weight="bold" /> New Contest
        </button>

        {/* Nav */}
        <div style={{ flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, height: 36, padding: '0 10px', borderRadius: 8, border: 'none', background: ntc.tagBg, color: ntc.primary, fontSize: 13, cursor: 'default', textAlign: 'left', marginBottom: 2 }}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* User */}
        <div style={{ padding: '12px 10px', background: LIGHT_THEME.cardBg, border: `0.5px solid ${LIGHT_THEME.cardBorder}`, borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: ntc.tagBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: ntc.primary }}>SC</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: LIGHT_THEME.textPrimary }}>Sarah Chen</div>
              <div style={{ fontSize: 11, color: LIGHT_THEME.textMuted }}>sarah@example.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: LIGHT_THEME.fontDisplay, fontSize: 28, color: LIGHT_THEME.textPrimary, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: LIGHT_THEME.textMuted }}>Manage your active contests and track results.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 24 }}>

          {/* Column 1: Active Contests */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: LIGHT_THEME.textPrimary }}>Active Contests</span>
              <span style={{ padding: '2px 8px', background: ntc.tagBg, borderRadius: 12, fontSize: 12, color: LIGHT_THEME.textSecondary }}>{active.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {active.map(contest => {
                const tc = GROUP_THEME[contest.group] || GROUP_THEME.business;
                const phase = PHASE_LABELS[contest.phase] || PHASE_LABELS.submissions;
                const participationPct = Math.round((contest.submissionCount / (contest.participantCount * 2)) * 100);
                // Per-contest demo scores for variety
                const DEMO_SCORES = {
                  'demo-1': { cq: 42, pq: 44 }, // 86 Excellent
                  'demo-2': { cq: 28, pq: 18 }, // 46 Good
                  'demo-3': { cq: 10, pq: 8 },  // 18 Low
                  'demo-4': { cq: 35, pq: 32 }, // 67 Strong
                  'demo-5': { cq: 15, pq: 12 }, // 27 Fair
                  'demo-6': { cq: 40, pq: 38 }, // 78 Strong
                  'demo-7': { cq: 22, pq: 26 }, // 48 Good
                  'demo-8': { cq: 8, pq: 5 },   // 13 Low
                };
                const ds = DEMO_SCORES[contest.id] || { cq: 25, pq: 20 };
                const cq = loadCreatorQuality(contest.group) || ds.cq;
                const pq = loadParticipantQuality(contest.group) || ds.pq;
                const totalQ = cq + pq;

                return (
                  <div key={contest.id} style={{ background: LIGHT_THEME.cardBg, border: `1px solid ${LIGHT_THEME.cardBorder}`, borderRadius: 12, padding: 16, boxShadow: LIGHT_THEME.cardShadow }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: LIGHT_THEME.textPrimary, marginBottom: 4 }}>{contest.title}</div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <SegmentPill group={contest.group} />
                          <span style={{ padding: '2px 8px', borderRadius: 12, background: LIGHT_THEME.hoverBg, fontSize: 10, fontWeight: 600, color: phase.color }}>
                            {phase.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: LIGHT_THEME.textSecondary, fontWeight: 600, marginBottom: 8 }}>
                      Closes in {contest.daysLeft} day{contest.daysLeft !== 1 ? 's' : ''}
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: LIGHT_THEME.textMuted, marginBottom: 4 }}>
                        <span>Participation</span>
                        <span>{participationPct}%</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(30,35,48,0.08)', borderRadius: 4 }}>
                        <div style={{ height: '100%', width: `${participationPct}%`, background: tc.primary, borderRadius: 4 }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: LIGHT_THEME.textMuted, marginBottom: 12 }}>
                      <span>{contest.participantCount} participants</span>
                      <span>·</span>
                      <span>{contest.submissionCount} submissions</span>
                      <span>·</span>
                      <span>{contest.daysLeft}d left</span>
                    </div>

                    {/* Quality Score */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: LIGHT_THEME.textMuted, marginBottom: 4 }}>
                        <span>Contest Quality — <span style={{ color: totalQ >= 65 ? tc.primary : totalQ >= 40 ? LIGHT_THEME.textSecondary : LIGHT_THEME.textMuted, fontWeight: 600 }}>{qualityLabel(totalQ)}</span></span>
                        <span style={{ color: tc.primary, fontWeight: 700 }}>{totalQ}%</span>
                      </div>
                      <div style={{ position: 'relative', height: 5, background: 'rgba(30,35,48,0.08)', borderRadius: 3 }}>
                        {/* Creator portion */}
                        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${cq}%`, background: tc.primary, borderRadius: 3, opacity: 0.6 }} />
                        {/* Participant portion */}
                        <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', width: `${pq}%`, background: tc.primary, borderRadius: 3 }} />
                        {/* Midpoint */}
                        <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1, background: LIGHT_THEME.cardBorder }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: LIGHT_THEME.textMuted, marginTop: 3 }}>
                        <span>Creator {cq}/50</span>
                        <span>Participants {pq}/50</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={{ flex: 1, height: 32, border: `1px solid ${tc.tagBorder}`, borderRadius: 7, background: tc.tagBg, color: tc.primary, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Eye size={12} /> View
                      </button>
                      <button style={{ height: 32, padding: '0 10px', border: `1px solid ${LIGHT_THEME.cardBorder}`, borderRadius: 7, background: 'transparent', color: LIGHT_THEME.textSecondary, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Bell size={12} /> Remind
                      </button>
                      <button style={{ height: 32, padding: '0 10px', border: `1px solid ${LIGHT_THEME.cardBorder}`, borderRadius: 7, background: 'transparent', color: LIGHT_THEME.textSecondary, fontSize: 12, cursor: 'pointer' }}>
                        Extend
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Create new card */}
              <button onClick={() => navigate('/select')} style={{ padding: '20px', border: `1.5px dashed ${LIGHT_THEME.cardBorder}`, borderRadius: 12, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: LIGHT_THEME.textMuted, fontSize: 13 }}>
                <Plus size={16} /> Create New Contest
              </button>
            </div>
          </div>

          {/* Column 2: Completed */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: LIGHT_THEME.textPrimary }}>Completed</span>
              <span style={{ padding: '2px 8px', background: ntc.tagBg, borderRadius: 12, fontSize: 12, color: LIGHT_THEME.textSecondary }}>{completed.length}</span>
            </div>

            {completed.length === 0 ? (
              <div style={{ padding: 20, background: LIGHT_THEME.cardBg, border: `1px solid ${LIGHT_THEME.cardBorder}`, borderRadius: 12, textAlign: 'center', color: LIGHT_THEME.textMuted, fontSize: 13, boxShadow: LIGHT_THEME.cardShadow }}>
                No completed contests yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {completed.map(contest => {
                  const tc = GROUP_THEME[contest.group] || GROUP_THEME.business;
                  const participationPct = Math.round((contest.submissionCount / (contest.participantCount * 2)) * 100);
                  return (
                    <div key={contest.id} style={{ background: LIGHT_THEME.cardBg, border: `1px solid ${LIGHT_THEME.cardBorder}`, borderRadius: 12, padding: '14px 16px', boxShadow: LIGHT_THEME.cardShadow }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: LIGHT_THEME.textPrimary, marginBottom: 4 }}>{contest.title}</div>
                      <div style={{ fontFamily: LIGHT_THEME.fontDisplay, fontSize: 18, color: tc.primary, marginBottom: 6 }}>
                        {contest.winner}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: LIGHT_THEME.textMuted, marginBottom: 10 }}>
                        <span>{contest.endsAt}</span>
                        <span>{participationPct}% participation</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => navigate(`/results/${contest.id}`)} style={{ flex: 1, height: 30, border: `1px solid ${LIGHT_THEME.cardBorder}`, borderRadius: 6, background: 'transparent', color: LIGHT_THEME.textSecondary, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          View Results <ArrowRight size={11} />
                        </button>
                        <button style={{ height: 30, padding: '0 10px', border: `1px solid ${LIGHT_THEME.cardBorder}`, borderRadius: 6, background: 'transparent', color: LIGHT_THEME.textSecondary, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Export size={11} /> Export
                        </button>
                      </div>
                      {contest.group === 'business' && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `0.5px solid ${LIGHT_THEME.divider}` }}>
                          <a href="#" style={{ fontSize: 11, color: tc.primary, textDecoration: 'none', fontWeight: 600, opacity: 0.8 }}>
                            Want professional naming? Talk to Catchword →
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 3: Account Overview */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: LIGHT_THEME.textPrimary, marginBottom: 16 }}>Account Overview</div>

            {/* Subscription Card */}
            <div style={{ background: LIGHT_THEME.cardBg, border: `1px solid ${LIGHT_THEME.cardBorder}`, borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: LIGHT_THEME.cardShadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ntc.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Subscription</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: ntc.primary, padding: '2px 8px', background: ntc.tagBg, border: `0.5px solid ${ntc.tagBorder}`, borderRadius: 4 }}>ACTIVE</span>
              </div>
              <div style={{ fontFamily: LIGHT_THEME.fontDisplay, fontSize: 22, fontWeight: 800, color: LIGHT_THEME.textPrimary, marginBottom: 2 }}>Business Plan</div>
              <div style={{ fontSize: 13, color: LIGHT_THEME.textSecondary, marginBottom: 12 }}>$89 per contest</div>
              <div style={{ fontSize: 12, color: LIGHT_THEME.textMuted, marginBottom: 12 }}>Renews Apr 15, 2026</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: `0.5px solid ${LIGHT_THEME.divider}` }}>
                <span style={{ fontSize: 13, color: LIGHT_THEME.textSecondary }}>Auto-renewal</span>
                <div onClick={() => setAutoRenewal(!autoRenewal)} style={{ width: 40, height: 22, borderRadius: 11, background: autoRenewal ? ntc.primary : '#ccc', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: autoRenewal ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Total Contests', value: totalContests, icon: <Trophy size={16} color={ntc.primary} /> },
                { label: 'Participants Reached', value: totalParticipants, icon: <Users size={16} color={ntc.primary} /> },
                { label: 'Avg Participation', value: `${avgParticipation}%`, icon: <Lightning size={16} color={ntc.primary} /> },
              ].map(stat => (
                <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: LIGHT_THEME.cardBg, border: `1px solid ${LIGHT_THEME.cardBorder}`, borderRadius: 10, boxShadow: LIGHT_THEME.cardShadow }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: ntc.tagBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: LIGHT_THEME.fontDisplay, fontSize: 22, color: LIGHT_THEME.textPrimary, fontWeight: 700 }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: LIGHT_THEME.textMuted }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating action button removed */}

      {/* No modal needed */}
    </div>
  );
}
