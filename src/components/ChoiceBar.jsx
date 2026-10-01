// The cookie choice bar. Named "ChoiceBar" (classes nc-choice-*), not
// "cookie"/"consent", so blockers don't drop the module by name; see
// utils/visitorChoice.js for the rules it follows.
//
// Shows by itself only where the law asks first (EEA, UK, Switzerland) and
// no choice is stored. Anywhere, the footer's "Cookie settings" link opens it
// again. "Reject all" and "Accept all" are the same button, side by side, so
// saying no is exactly as easy as saying yes.
//
// Look: the site's dark bottom bar (the review page's "Update brief" bar):
// ink surface, white text, solid white buttons with the ink hover wash.
// 880px wide, the top navigation pill's width, with the text on the left
// and the two answers on the right; stacked on narrow screens.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { decide, onOpenSettings, readChoice, saveChoice } from '../utils/visitorChoice';
import '../styles/choiceBar.css';

export default function ChoiceBar() {
  // 'ask' = first time (no close button: the visitor answers),
  // 'settings' = opened from the footer (closable, shows the current state).
  const [mode, setMode] = useState(null);
  const [current, setCurrent] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    decide().then((d) => { if (alive && d.ask) setMode('ask'); });
    const off = onOpenSettings(() => {
      decide().then((d) => {
        if (!alive) return;
        const stored = readChoice();
        setCurrent(stored ? stored.analytics : d.analytics);
        setMode('settings');
      });
    });
    return () => { alive = false; off(); };
  }, []);

  useEffect(() => {
    if (mode !== 'settings') return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMode(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode]);

  if (!mode) return null;

  const choose = async (yes) => {
    if (saving) return;
    setSaving(true);
    try {
      await saveChoice(yes, mode === 'ask' ? 'bar' : 'settings');
      setMode(null);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <section className={`nc-choice${mode === 'settings' ? ' is-settings' : ''}`} role="region" aria-label="Cookie choices">
      <div className="nc-choice-copy">
        <p className="nc-choice-title">Cookies on NamingContest</p>
        <p className="nc-choice-text">
          We use essential storage to keep you signed in and save your drafts.
          With your OK, we also use Google Analytics and Microsoft Clarity to see
          how people use the site, including recordings of clicks and scrolling,
          with what you type hidden. None of it is used for ads.{' '}
          <Link to="/cookies" className="nc-choice-link" onClick={() => mode === 'settings' && setMode(null)}>
            Cookie policy
          </Link>
        </p>
        {mode === 'settings' && current !== null && (
          <p className="nc-choice-state">
            {current ? 'Analytics is on for you right now.' : 'Analytics is off for you right now.'}
          </p>
        )}
      </div>
      <div className="nc-choice-btns">
        <button type="button" className="nc-choice-btn" onClick={() => choose(false)} disabled={saving}>
          Reject all
        </button>
        <button type="button" className="nc-choice-btn" onClick={() => choose(true)} disabled={saving}>
          Accept all
        </button>
      </div>
      {mode === 'settings' && (
        <button type="button" className="nc-choice-close" aria-label="Close" onClick={() => setMode(null)}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </section>,
    document.body,
  );
}
