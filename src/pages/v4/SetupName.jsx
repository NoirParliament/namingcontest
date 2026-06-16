import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, X, PencilSimple } from '@phosphor-icons/react';
import ExitLink from '../../components/v4/ExitLink';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import '../../styles/v4.css';

// Reads the in-progress contest setup state from localStorage.
// Returns sensible defaults if missing (e.g., direct navigation to this URL).
function readSetup() {
  try {
    const raw = localStorage.getItem('v4_contest_setup');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeSetup(patch) {
  const current = readSetup();
  const next = { ...current, ...patch };
  localStorage.setItem('v4_contest_setup', JSON.stringify(next));
  return next;
}

// Phase progression:
// 0 = nothing yet
// 1 = typing #1 (acknowledgment)
// 2 = ack bubble visible
// 3 = typing #2 (question)
// 4 = question bubble visible
// 5 = hint bubble + input field visible
const PHASE_TIMINGS = [
  { phase: 1, at: 300 },
  { phase: 2, at: 1100 },
  { phase: 3, at: 1700 },
  { phase: 4, at: 2400 },
  { phase: 5, at: 2700 },
];

export default function SetupName() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);
  const setup = readSetup();

  useEffect(() => {
    const timers = PHASE_TIMINGS.map(({ phase: p, at }) =>
      setTimeout(() => setPhase(p), at)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Auto-focus the input when it becomes visible
  useEffect(() => {
    if (phase >= 5 && inputRef.current && !submitted) {
      inputRef.current.focus();
    }
  }, [phase, submitted]);

  const trimmed = value.trim();
  const canSubmit = trimmed.length >= 1 && trimmed.length <= 60 && !submitted;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    setSubmitted(true);
    writeSetup({ workingName: trimmed });
    setTimeout(() => navigate('/v4/setup/brief'), 1500);
  };

  return (
    <div className="v4">
      <div className="v4-screen">
        {/* Slim nav */}
        <header className="v4-nav">
          <BrandLink />
          <div className="v4-progress">
            <span className="v4-step-dot is-done"></span>
            <span className="v4-step-dot is-active"></span>
            <span className="v4-step-dot"></span>
            <span className="v4-step-dot"></span>
            <span className="v4-step-dot"></span>
            <span className="v4-step-label">Step 2 of 5</span>
          </div>
          <ExitLink to="/" aria-label="Exit" />
        </header>

        {/* Decorative pastel blobs */}
        <span className="v4-blob v4-blob-1" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-2" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-3" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-4" aria-hidden="true"></span>

        <main className="v4-chat" role="main">
          {/* Acknowledgment — typing then bubble */}
          {phase === 1 && (
            <div className="v4-typing" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
          )}
          {phase >= 2 && (
            <div className="v4-bubble">
              <span className="v4-bubble-icon" aria-hidden="true">✨</span>
              <span>Got it.</span>
            </div>
          )}

          {/* Question — typing then bubble */}
          {phase === 3 && (
            <div className="v4-typing" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
          )}
          {phase >= 4 && (
            <div className="v4-bubble">
              What should we call this contest?
            </div>
          )}

          {/* Hint + input */}
          {phase >= 5 && !submitted && (
            <>
              <div className="v4-hint">
                Just a working title for your dashboard. Like
                {' '}<span className="v4-hint-eg">“Sarah’s puppy”</span> or
                {' '}<span className="v4-hint-eg">“New mascot search”</span>. You can rename it anytime.
              </div>

              <form className="v4-input-row" onSubmit={handleSubmit}>
                <span className="v4-input-icon" aria-hidden="true">
                  <PencilSimple weight="duotone" size={20} />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className="v4-input"
                  placeholder="Type a working name…"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  maxLength={60}
                  aria-label="Working name for the contest"
                />
                <button
                  type="submit"
                  className="v4-input-submit"
                  disabled={!canSubmit}
                  aria-label="Continue"
                >
                  <ArrowRight weight="bold" size={18} />
                </button>
              </form>

              <div className="v4-input-meta">
                <span>{trimmed.length}/60</span>
                <span className="v4-input-hint-key">
                  Press <kbd>Enter</kbd> to continue
                </span>
              </div>
            </>
          )}

          {/* User reply bubble after submit */}
          {submitted && (
            <div className="v4-bubble v4-bubble-user">
              <span>{trimmed}</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
