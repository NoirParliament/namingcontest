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
// Shaped like the site footer, a dark card of the same colour: 20px from
// the screen edges, 32px corners, the footer's side padding, so its text and
// buttons line up with the footer's content. Text on the left, the two
// answers on the right; stacked on narrow screens.
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

  // A policy link opened from "Cookie settings" closes the bar; on a first
  // ask it stays, since no answer has been given yet.
  const close = () => { if (mode === 'settings') setMode(null); };

  return createPortal(
    <section className={`nc-choice${mode === 'settings' ? ' is-settings' : ''}`} role="region" aria-label="Cookie choices">
      <div className="nc-choice-copy">
        <div className="nc-choice-head">
          <p className="nc-choice-title">Cookies on NamingContest</p>
          {/* Opened from "Cookie settings": where the visitor stands now. */}
          {mode === 'settings' && current !== null && (
            <span className={`nc-choice-status ${current ? 'is-on' : 'is-off'}`}>
              <span className="nc-choice-dot" aria-hidden="true" />
              {current ? 'Analytics on' : 'Analytics off'}
            </span>
          )}
        </div>
        {/* First-layer notice (GDPR art. 7 and 13, EDPB guidance): what is
            essential, what we ask permission for, who provides it, why, how
            to change your mind, and where to read more. One link, to the
            Cookie policy, which names the company and links the Privacy
            policy. The Terms of Service stay off the bar on purpose: consent
            must not look tied to accepting terms. */}
        <p className="nc-choice-text">
          We use essential cookies to run the site, such as keeping you signed in.
          With your permission, we would also like to use analytics cookies from
          Google Analytics and Microsoft Clarity to understand how the site is used,
          including session recordings, so we can improve it. You can change your
          choice at any time under Cookie settings in the footer.{' '}
          <Link to="/cookies" className="nc-choice-link" onClick={close}>Cookie policy</Link>
        </p>
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
