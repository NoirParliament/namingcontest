import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import '@styles/globals.css';
import { getJourneyMeta, buildJourneySteps, detectStep, PHASE_COLORS } from './utils/journey';
import { CurrencyDollar, Handshake } from '@phosphor-icons/react';
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

  const tierColor     = path === '/' ? '#eaef09' : meta.color;
  const tierTextColor = path === '/' ? '#000'    : meta.textColor;
  const roleColor     = isParticipantStep ? '#3b82f6' : tierColor;
  const roleText      = isParticipantStep ? '#fff'    : tierTextColor;
  const roleLabel     = isParticipantStep ? '👤 Participant' : '🏗 Creator';

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
        background: '#1a1a1a',
        border: `0.5px solid ${tierColor}40`,
        borderRadius: 12, overflow: 'hidden', width: 300,
        boxShadow: `0 0 0 1px ${tierColor}18, 0 8px 24px rgba(0,0,0,0.5)`,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 13px', background: '#202020',
          borderBottom: `0.5px solid ${tierColor}28`,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 8, color: '#555', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
              Journey Tracker
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: '#fff',
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
          }}>
            {roleLabel}
          </div>
          <button onClick={() => setPanelOpen(v => !v)} style={{
            marginLeft: 6, width: 20, height: 20, borderRadius: 4, border: 'none',
            background: 'rgba(255,255,255,0.06)', color: '#666', fontSize: 9, cursor: 'pointer',
          }}>
            {panelOpen ? '▼' : '▲'}
          </button>
        </div>

        {panelOpen && (
          <>
            {/* Progress bar */}
            <div style={{ padding: '10px 13px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                  Step {safeStep + 1}
                  <span style={{ color: '#3a3a3a' }}> / {steps.length}</span>
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: tierColor,
                  maxWidth: 155, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {currentStep?.label}
                </span>
              </div>
              <div style={{ height: 3, background: '#262626', borderRadius: 2, marginBottom: 10 }}>
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
                const stepRoleColor = stepIsParticipant ? '#3b82f6' : tierColor;
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
                      border: `1.5px solid ${(isPast || isCurrent) ? tierColor : '#272727'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 7, fontWeight: 800,
                      color: (isPast || isCurrent) ? tierTextColor : '#333',
                    }}>
                      {isPast ? '✓' : i + 1}
                    </div>

                    {/* Label */}
                    <span style={{
                      fontSize: 11, flex: 1,
                      color: isCurrent ? '#fff' : isPast ? '#444' : '#2e2e2e',
                      fontWeight: isCurrent ? 700 : 400,
                    }}>
                      {s.label}
                    </span>

                    {/* Role badge */}
                    <span style={{
                      fontSize: 7, fontWeight: 800,
                      background: (isCurrent || isPast) ? stepRoleColor : 'transparent',
                      color: (isCurrent || isPast) ? stepRoleText : '#252525',
                      border: `0.5px solid ${(isCurrent || isPast) ? 'transparent' : '#1e1e1e'}`,
                      borderRadius: 3, padding: '1px 4px',
                      textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: 2,
                    }}>
                      {stepIsParticipant ? '👤' : '🏗'} {stepIsParticipant ? 'Participant' : 'Creator'}
                    </span>

                    {isCurrent && (
                      <span style={{
                        fontSize: 7, background: tierColor, color: tierTextColor,
                        borderRadius: 3, padding: '1px 4px', fontWeight: 800,
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
              borderTop: '0.5px solid rgba(255,255,255,0.05)',
            }}>
              <button
                onClick={() => goToStep(safeStep - 1)}
                disabled={safeStep === 0}
                style={{
                  padding: '7px 12px', borderRadius: 7,
                  border: '0.5px solid rgba(255,255,255,0.08)', background: 'transparent',
                  color: safeStep === 0 ? '#222' : '#7a7a7a',
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
                  flex: 1, padding: '7px 14px', borderRadius: 7, border: 'none',
                  background: safeStep >= steps.length - 1 ? '#1e1e1e' : tierColor,
                  color: safeStep >= steps.length - 1 ? '#333' : tierTextColor,
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
                  width: '100%', height: 28, borderRadius: 6,
                  border: `0.5px solid ${tierColor}${simOpen ? '80' : '33'}`,
                  background: simOpen ? `${tierColor}2e` : `${tierColor}0f`,
                  color: tierColor, fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.02em',
                  transition: 'all 0.2s',
                }}
              >
                <CurrencyDollar size={11} weight="bold" style={{ marginRight: 3 }} /> {simOpen ? 'Exit' : 'Enter'} Paywall Simulation
              </button>
              <button
                onClick={() => { setAffOpen(v => !v); setSimOpen(false); }}
                style={{
                  width: '100%', height: 28, borderRadius: 6,
                  border: `0.5px solid ${tierColor}${affOpen ? '80' : '33'}`,
                  background: affOpen ? `${tierColor}2e` : `${tierColor}0f`,
                  color: tierColor, fontSize: 10, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.02em',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Handshake size={11} weight="bold" style={{ marginRight: 3 }} /> {affOpen ? 'Exit' : 'Enter'} Affiliate Simulation
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
