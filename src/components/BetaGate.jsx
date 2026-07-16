// Soft beta gate. When VITE_BETA_PASSWORD is set (e.g. on the private beta
// domain), the whole app sits behind a shared access code. Leave the env var
// UNSET (local dev, and public launch) and the gate disappears entirely — so
// flipping to public is just "remove the env var + redeploy."
//
// This is a courtesy curtain to keep the beta out of public view, not hard
// security: it's client-side, and the real data is always behind Supabase
// auth. Good enough to stop randoms wandering in.
import { useState } from 'react';
import namingContestLogo from '../assets/namingcontestlogo-cropped.svg';

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
    <div style={S.screen}>
      <span style={{ ...S.blob, ...S.blob1 }} aria-hidden="true" />
      <span style={{ ...S.blob, ...S.blob2 }} aria-hidden="true" />
      <div style={S.card}>
        <img src={namingContestLogo} alt="NamingContest" style={S.logo} />
        <div style={S.eyebrow}>Private beta</div>
        <h1 style={S.title}>This site isn’t public yet.</h1>
        <p style={S.sub}>Enter your access code to continue.</p>
        <form onSubmit={submit} style={S.form}>
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Access code"
            autoFocus
            aria-label="Access code"
            style={{ ...S.input, ...(error ? S.inputError : null) }}
          />
          <button type="submit" style={S.button}>Enter →</button>
        </form>
        {error && <div style={S.error}>That code isn’t right — try again.</div>}
      </div>
    </div>
  );
}

const S = {
  screen: {
    position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, background: '#fcf9f7', overflow: 'hidden',
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif', color: '#030302',
  },
  blob: { position: 'absolute', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.5, pointerEvents: 'none' },
  blob1: { width: 340, height: 340, background: '#fadecc', top: '-8%', left: '-6%' },
  blob2: { width: 300, height: 300, background: '#c4dffb', bottom: '-8%', right: '-6%' },
  card: {
    position: 'relative', zIndex: 1, width: '100%', maxWidth: 380, background: '#ffffff',
    border: '1px solid rgba(3,3,2,0.06)', borderRadius: 22, padding: '36px 32px',
    boxShadow: '0 24px 60px rgba(3,3,2,0.10)', textAlign: 'center',
  },
  logo: { height: 26, marginBottom: 22 },
  eyebrow: { fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9c4818' },
  title: { fontSize: 22, lineHeight: 1.25, fontWeight: 700, margin: '10px 0 6px' },
  sub: { fontSize: 14.5, lineHeight: 1.5, color: 'rgba(3,3,2,0.6)', margin: '0 0 22px' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: {
    width: '100%', boxSizing: 'border-box', padding: '13px 15px', fontSize: 15,
    border: '1.5px solid rgba(3,3,2,0.12)', borderRadius: 12, outline: 'none',
    fontFamily: 'inherit', background: '#fff',
  },
  inputError: { borderColor: '#bb433a' },
  button: {
    width: '100%', padding: '13px 15px', fontSize: 15, fontWeight: 600, color: '#fff',
    background: '#030302', border: 'none', borderRadius: 12, cursor: 'pointer',
  },
  error: { marginTop: 12, fontSize: 13, color: '#bb433a', fontWeight: 500 },
};
