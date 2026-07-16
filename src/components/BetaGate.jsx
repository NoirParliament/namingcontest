// Soft beta gate. When VITE_BETA_PASSWORD is set (e.g. on the private beta
// domain), the whole app sits behind a shared access code. Leave the env var
// UNSET (local dev, and public launch) and the gate disappears entirely — so
// flipping to public is just "remove the env var + redeploy".
//
// This is a courtesy curtain to keep the beta out of public view, not hard
// security: it's client-side, and the real data is always behind Supabase
// auth. Styled with the same sign-in-card design system as SignInModal
// (Fraunces title, .v4-settings-input, .btn-primary slide-hover).
import { useState } from 'react';
import keyImg from '../assets/key.png';
import '../styles/landing-v3.css';
import '../styles/v4.css';

const BETA_PASSWORD = import.meta.env.VITE_BETA_PASSWORD;
const STORAGE_KEY = 'nc_beta_ok';

export default function BetaGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  });
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  // No code configured → gate is off (local dev + public launch).
  if (!BETA_PASSWORD) return children;
  if (unlocked) return children;

  const submit = (e) => {
    e.preventDefault();
    if (value.trim() === BETA_PASSWORD) {
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  return (
    <div
      className="v4 lp-v3"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, background: 'var(--v4-bg, #fcf9f7)', overflow: 'auto',
      }}
    >
      <span className="v4-signin-halo" aria-hidden="true" />
      <div className="v4-signin-modal" role="dialog" aria-modal="true" aria-labelledby="betagate-title">
        <span className="v4-signin-shape v4-signin-shape-1" aria-hidden="true" />
        <span className="v4-signin-shape v4-signin-shape-2" aria-hidden="true" />
        <span className="v4-signin-shape v4-signin-shape-3" aria-hidden="true" />
        <span className="v4-signin-shape v4-signin-shape-4" aria-hidden="true" />
        <span className="v4-signin-shape v4-signin-shape-5" aria-hidden="true" />

        <img className="v4-signin-hero-key" src={keyImg} alt="" aria-hidden="true" />
        <h2 id="betagate-title" className="v4-signin-title">This site isn’t public yet</h2>
        <p className="v4-signin-subtitle">Enter your access code to continue.</p>

        <form className="v4-signin-form" onSubmit={submit}>
          <label className="v4-signin-field">
            <span className="v4-signin-field-label">Access code</span>
            <input
              type="password"
              className="v4-settings-input"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(false); }}
              placeholder="Enter code"
              autoFocus
              aria-label="Access code"
            />
          </label>
          <button type="submit" className="btn btn-primary btn-lg v4-signin-submit">
            Enter <span className="arrow">→</span>
          </button>
        </form>

        {error && (
          <p
            className="v4-signin-error"
            role="alert"
            style={{ margin: '10px 2px 0', fontSize: 13, lineHeight: 1.4, color: '#a8321f', fontFamily: 'var(--font-text)' }}
          >
            That code isn’t right — try again.
          </p>
        )}
      </div>
    </div>
  );
}
