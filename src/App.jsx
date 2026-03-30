import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import '@styles/tokens.css';
import '@styles/globals.css';
import { getJourneyMeta, buildJourneySteps, detectStep, PHASE_COLORS } from './utils/journey';
import { getGroupTheme } from './data/themeConfig';
import { CurrencyDollar, Handshake, BookOpen, User, Wrench } from '@phosphor-icons/react';
import PaywallSimulator from './components/PaywallSimulator';
import AffiliateSimulator from './components/AffiliateSimulator';

// Pages
import LandingPage          from '@pages/LandingPage';
import WireframeDashboard   from '@pages/WireframeDashboard';
import SelectSegment        from '@pages/SelectSegment';
import SelectSubSegment     from '@pages/SelectSubSegment';
import AuthPage             from '@pages/AuthPage';
import BriefBuilder         from '@pages/BriefBuilder';
import ContestTypeSelection from '@pages/ContestTypeSelection';
import UploadNames          from '@pages/UploadNames';
import InvitationGuidance   from '@pages/InvitationGuidance';
import ContestLive          from '@pages/ContestLive';
import VotingInterface      from '@pages/VotingInterface';
import ResultsPage          from '@pages/ResultsPage';
import Dashboard            from '@pages/dashboard/Dashboard';
import ContestDetail        from '@pages/ContestDetail';
import DocumentationPage    from '@pages/DocumentationPage';

// ─── FloatingNav ─────────────────────────────────────────────────────────────

function FloatingNav() {
  const location = useLocation();
  const navigate  = useNavigate();
  const path      = location.pathname;

  const [journeyStep, setJourneyStepState] = useState(() =>
    parseInt(localStorage.getItem('journeyStep') || '0', 10)
  );
  const [transitionMode, setTransitionModeState] = useState(
    () => localStorage.getItem('transitionMode') || 'manual'
  );
  const [panelOpen, setPanelOpen] = useState(() => path !== '/');
  const [simOpen, setSimOpen] = useState(false);
  const [affOpen, setAffOpen] = useState(false);

  // Sync localStorage + state
  const setStep = (idx) => {
    localStorage.setItem('journeyStep', String(idx));
    setJourneyStepState(idx);
  };

  // ── Extract journey context from URL on arrival ───────────────────────────
  // This makes tracking work from landing page, not just wireframe flow
  useEffect(() => {
    const groupMatch = path.match(/^\/select\/(business|team|personal)$/);
    if (groupMatch) localStorage.setItem('selectedGroup', groupMatch[1]);

    const typeMatch = path.match(/^\/contest-type\/(business|team|personal)\/(.+)$/);
    if (typeMatch) {
      localStorage.setItem('selectedGroup',      typeMatch[1]);
      localStorage.setItem('selectedSubSegment', typeMatch[2]);
    }

    const briefMatch = path.match(/^\/brief\/(business|team|personal)\/(.+)$/);
    if (briefMatch) {
      localStorage.setItem('selectedGroup',      briefMatch[1]);
      localStorage.setItem('selectedSubSegment', briefMatch[2]);
    }
  }, [path]);

  // ── Auto-detect step from current URL ────────────────────────────────────
  useEffect(() => {
    const meta   = getJourneyMeta();
    const tm     = localStorage.getItem('transitionMode') || 'manual';
    const steps  = buildJourneySteps(meta.group, meta.sub, meta.contestType, tm);
    const stored = parseInt(localStorage.getItem('journeyStep') || '0', 10);
    const detected = detectStep(path, steps, stored);

    if (detected >= 0) {
      const matchCount = steps.filter(s => {
        const mp = s.matchPath || s.path;
        return mp === path || (mp.length > 1 && path.startsWith(mp));
      }).length;

      if (matchCount === 1) {
        // Unambiguous URL — always sync (handles both forward and backward navigation)
        setStep(detected);
      } else {
        // Ambiguous URL (multiple steps share same prefix like /contest-detail/)
        // Only advance forward; going back requires Prev button
        if (detected > stored) setStep(detected);
        else setJourneyStepState(stored);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  // Sync from other tabs / localStorage writes
  useEffect(() => {
    const handler = () => {
      const s = parseInt(localStorage.getItem('journeyStep') || '0', 10);
      const tm = localStorage.getItem('transitionMode') || 'manual';
      setJourneyStepState(s);
      setTransitionModeState(tm);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // ── Hide on hub pages ─────────────────────────────────────────────────────
  if (path === '/wireframe') return null;

  // ── Fresh meta (read after URL extraction effects have fired) ────────────
  const meta  = getJourneyMeta();
  const steps = buildJourneySteps(meta.group, meta.sub, meta.contestType, transitionMode);
  const safeStep = Math.min(Math.max(journeyStep, 0), steps.length - 1);

  const currentStep = steps[safeStep];
  const isParticipantStep = currentStep?.role === 'participant';

  const _tc           = getGroupTheme(meta.group || 'business');
  const tierColor     = _tc.primary;
  const tierTextColor = _tc.btnText;
  const roleColor     = isParticipantStep ? '#2538d4' : tierColor;
  const roleText      = isParticipantStep ? '#fff'    : tierTextColor;
  const RoleIcon      = isParticipantStep ? User : Wrench;
  const roleLabel     = isParticipantStep ? 'Participant' : 'Creator';

  function goToStep(idx) {
    if (idx < 0 || idx >= steps.length) return;
    setStep(idx);
    navigate(steps[idx].path);
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
      maxWidth: 310, fontFamily: 'Inter, sans-serif',
    }}>
      {/* ── Paywall Simulator ────────────────────────────────────────────── */}
      {simOpen && (
        <PaywallSimulator
          group={meta.group || 'business'}
          onClose={() => setSimOpen(false)}
        />
      )}
      {affOpen && (
        <AffiliateSimulator
          group={meta.group || 'business'}
          onClose={() => setAffOpen(false)}
        />
      )}

      {/* ── Journey tracker ─────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e8e8e0',
        borderRadius: 24, overflow: 'hidden', width: 300,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 13px', background: '#f5f5f0',
          borderBottom: '1px solid #e8e8e0',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 8, color: '#a8a8a0', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
              Journey Tracker
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: '#1a1a16',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {(path === '/' || !meta.hasGroup)
                ? 'Select a segment to begin'
                : `${meta.journeyLabel} · ${meta.typeLabel}`}
            </div>
          </div>
          {/* Current step role indicator (non-clickable) */}
          <div style={{
            marginLeft: 8, padding: '3px 8px', borderRadius: 5,
            background: roleColor, color: roleText,
            fontSize: 9, fontWeight: 800, letterSpacing: '0.04em',
            textTransform: 'uppercase', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <RoleIcon size={10} weight="bold" /> {roleLabel}
          </div>
          <button onClick={() => setPanelOpen(v => !v)} style={{
            marginLeft: 6, width: 20, height: 20, borderRadius: 4, border: 'none',
            background: '#e8e8e0', color: '#58584f', fontSize: 9, cursor: 'pointer',
          }}>
            {panelOpen ? '▼' : '▲'}
          </button>
        </div>

        {panelOpen && (
          <>
            {/* Progress bar */}
            <div style={{ padding: '10px 13px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a16' }}>
                  Step {safeStep + 1}
                  <span style={{ color: '#a8a8a0' }}> / {steps.length}</span>
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: tierColor,
                  maxWidth: 155, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {currentStep?.label}
                </span>
              </div>
              <div style={{ height: 3, background: '#e8e8e0', borderRadius: 2, marginBottom: 10 }}>
                <div style={{
                  height: 3, borderRadius: 2,
                  background: `linear-gradient(90deg, ${tierColor}, ${roleColor})`,
                  width: `${Math.round(((safeStep + 1) / steps.length) * 100)}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            {/* Step list */}
            <div style={{ padding: '0 13px', maxHeight: 210, overflowY: 'auto' }}>
              {steps.map((s, i) => {
                const isPast    = i < safeStep;
                const isCurrent = i === safeStep;
                const stepIsParticipant = s.role === 'participant';
                const stepRoleColor = stepIsParticipant ? '#2538d4' : tierColor;
                const stepRoleText  = stepIsParticipant ? '#fff'    : tierTextColor;

                return (
                  <button key={i} onClick={() => goToStep(i)} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    width: '100%', padding: '3px 0', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    {/* Circle */}
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      background: (isPast || isCurrent) ? tierColor : 'transparent',
                      border: `1.5px solid ${(isPast || isCurrent) ? tierColor : '#d4d4cc'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 7, fontWeight: 800,
                      color: (isPast || isCurrent) ? tierTextColor : '#a8a8a0',
                    }}>
                      {isPast ? '✓' : i + 1}
                    </div>

                    {/* Label */}
                    <span style={{
                      fontSize: 11, flex: 1,
                      color: isCurrent ? '#1a1a16' : isPast ? '#a8a8a0' : '#58584f',
                      fontWeight: isCurrent ? 700 : 400,
                    }}>
                      {s.label}
                    </span>

                    {/* Role badge */}
                    <span style={{
                      fontSize: 7, fontWeight: 800,
                      background: (isCurrent || isPast) ? stepRoleColor : 'transparent',
                      color: (isCurrent || isPast) ? stepRoleText : '#a8a8a0',
                      border: `1px solid ${(isCurrent || isPast) ? 'transparent' : '#e8e8e0'}`,
                      borderRadius: 3, padding: '1px 4px',
                      textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: 2,
                    }}>
                      {stepIsParticipant ? <User size={9} weight="bold" /> : <Wrench size={9} weight="bold" />} {stepIsParticipant ? 'Participant' : 'Creator'}
                    </span>

                    {isCurrent && (
                      <span style={{
                        fontSize: 7, background: tierColor, color: tierTextColor,
                        borderRadius: 999, padding: '1px 6px', fontWeight: 800,
                        textTransform: 'uppercase', flexShrink: 0,
                      }}>
                        HERE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Prev / Next */}
            <div style={{
              display: 'flex', gap: 6, padding: '10px 13px',
              borderTop: '1px solid #e8e8e0',
            }}>
              <button
                onClick={() => goToStep(safeStep - 1)}
                disabled={safeStep === 0}
                style={{
                  padding: '7px 12px', borderRadius: 999,
                  border: '1px solid #e8e8e0', background: 'transparent',
                  color: safeStep === 0 ? '#d4d4cc' : '#58584f',
                  fontSize: 12, fontWeight: 600,
                  cursor: safeStep === 0 ? 'default' : 'pointer',
                }}
              >
                ← Prev
              </button>
              <button
                onClick={() => goToStep(safeStep + 1)}
                disabled={safeStep >= steps.length - 1}
                style={{
                  flex: 1, padding: '7px 14px', borderRadius: 999, border: 'none',
                  background: safeStep >= steps.length - 1 ? '#e8e8e0' : tierColor,
                  color: safeStep >= steps.length - 1 ? '#a8a8a0' : tierTextColor,
                  fontSize: 12, fontWeight: 700,
                  cursor: safeStep >= steps.length - 1 ? 'default' : 'pointer',
                }}
              >
                {safeStep >= steps.length - 1 ? 'Journey Complete ✓' : 'Next Step →'}
              </button>
            </div>

            {/* Simulation Toggles */}
            <div style={{ padding: '0 13px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => { setSimOpen(v => !v); setAffOpen(false); }}
                style={{
                  width: '100%', height: 28, borderRadius: 999,
                  border: `1px solid ${simOpen ? tierColor : '#e8e8e0'}`,
                  background: simOpen ? '#f0f5c8' : '#fafaf7',
                  color: simOpen ? '#254f1a' : '#58584f',
                  fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.02em',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <CurrencyDollar size={11} weight="bold" style={{ marginRight: 3 }} /><span>{simOpen ? 'Exit' : 'Enter'} Paywall Simulation</span>
              </button>
              <button
                onClick={() => { setAffOpen(v => !v); setSimOpen(false); }}
                style={{
                  width: '100%', height: 28, borderRadius: 999,
                  border: `1px solid ${affOpen ? tierColor : '#e8e8e0'}`,
                  background: affOpen ? '#f0f5c8' : '#fafaf7',
                  color: affOpen ? '#254f1a' : '#58584f',
                  fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.02em',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Handshake size={11} weight="bold" style={{ marginRight: 3 }} /><span>{affOpen ? 'Exit' : 'Enter'} Affiliate Simulation</span>
              </button>
              <button
                onClick={() => navigate('/docs')}
                style={{
                  width: '100%', height: 28, borderRadius: 999,
                  border: '1px solid #e8e8e0',
                  background: '#fafaf7',
                  color: '#58584f', fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.02em',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <BookOpen size={11} weight="bold" style={{ marginRight: 3 }} /> Documentation
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

function AppInner() {
  return (
    <>
      <Routes>
        <Route path="/"                                element={<LandingPage />} />
        <Route path="/wireframe"                       element={<WireframeDashboard />} />
        <Route path="/select"                          element={<SelectSegment />} />
        <Route path="/select/:group"                   element={<SelectSubSegment />} />
        <Route path="/contest-type/:group/:subSegment" element={<ContestTypeSelection />} />
        <Route path="/auth"                            element={<AuthPage />} />
        <Route path="/brief/:group/:subSegment"        element={<BriefBuilder />} />
        <Route path="/upload-names"                    element={<UploadNames />} />
        <Route path="/invite/:contestId"               element={<InvitationGuidance />} />
        <Route path="/contest/:contestId"              element={<ContestLive />} />
        <Route path="/vote/:contestId"                 element={<VotingInterface />} />
        <Route path="/results/:contestId"              element={<ResultsPage />} />
        <Route path="/dashboard"                       element={<Dashboard />} />
        <Route path="/contest-detail/:contestId"       element={<ContestDetail />} />
        <Route path="/docs"                            element={<DocumentationPage />} />
      </Routes>
      <FloatingNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
