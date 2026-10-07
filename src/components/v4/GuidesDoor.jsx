// The one door to the naming guides, for every page that shows a brief.
//
// A "Guides" button in the page header, lit in the category's colour with
// the number of guides, that opens the GuidesDrawer. When `nudge` turns
// true the door makes its entrance: after a short pause (time to read what
// just landed on the page) the button arrives together with a small
// callout asking the category's question, pulses twice, and the callout
// leaves after a few seconds or on the next tap. With `nudge` false the
// button is simply there, no callout: the host on the review page, or a
// visitor who has seen the callout before (`once` is a localStorage key
// that remembers it, per contest and per role).
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen } from '@phosphor-icons/react';
import GuidesDrawer from './GuidesDrawer';
import { getSegmentLabel } from '../../utils/v4Brief';

const READ_PAUSE = 1400; // after the trigger, before the entrance
const HOLD = 9000;       // how long the callout stays on its own

const remembered = (key) => { if (!key) return false; try { return localStorage.getItem(key) === '1'; } catch { return true; } };
const remember = (key) => { if (!key) return; try { localStorage.setItem(key, '1'); } catch { /* storage off: nudge again next time */ } };

export default function GuidesDoor({ articles = [], tone = null, subId = null, nudge = false, once = null }) {
  // idle: waiting for the trigger · shown / leaving: the callout is up ·
  // done: lit button only.
  const [state, setState] = useState('idle');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state !== 'idle' || !nudge || articles.length === 0) return undefined;
    if (remembered(once)) { setState('done'); return undefined; }
    const t = setTimeout(() => { remember(once); setState('shown'); }, READ_PAUSE);
    return () => clearTimeout(t);
  }, [state, nudge, articles.length, once]);

  // The callout leaves with a short fade before it unmounts.
  useEffect(() => {
    if (state === 'shown') {
      const t = setTimeout(() => setState('leaving'), HOLD);
      const dismiss = () => setState('leaving');
      document.addEventListener('pointerdown', dismiss, { capture: true, once: true });
      return () => { clearTimeout(t); document.removeEventListener('pointerdown', dismiss, { capture: true }); };
    }
    if (state === 'leaving') {
      const t = setTimeout(() => setState('done'), 260);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [state]);

  if (articles.length === 0) return null;
  // Making an entrance: nothing until the callout is ready, so button and
  // callout arrive together.
  if (nudge && state === 'idle') return null;

  // "Curious what makes a great band or club name?"; categories without a
  // clear noun ("something else") ask about a great name, full stop.
  const label = (getSegmentLabel(subId) || '').trim();
  const question = !label || /something else/i.test(label)
    ? 'Curious what makes a great name?'
    : `Curious what makes a great ${label.toLowerCase()} name?`;
  const nudging = state === 'shown' || state === 'leaving';
  const openDrawer = () => { setState('done'); setOpen(true); };

  return (
    <>
      <div className="v4-nav-guides-wrap">
        <button
          type="button"
          className={`v4-exit v4-nav-guides is-lit${nudging ? ' is-pulsing' : ''}`}
          style={tone ? { '--nav-tint': tone.bg, '--nav-accent': tone.fg } : undefined}
          aria-label={`Naming guides (${articles.length})`}
          onClick={openDrawer}
        >
          <BookOpen weight="fill" size={14} />
          <span>Guides</span>
          <span className="v4-nav-guides-count" aria-hidden="true">{articles.length}</span>
        </button>
        {nudging && (
          <div className={`v4-gnudge${state === 'leaving' ? ' is-leaving' : ''}`} role="status">
            <span className="v4-gnudge-text">{question}</span>
            <button type="button" className="v4-gnudge-open" onClick={openDrawer}>Show me</button>
          </div>
        )}
      </div>
      {/* The drawer is fixed to the viewport; rendered at the body so a
          header's own stacking (blur, sticky) can't trap it. */}
      {open && createPortal(
        <GuidesDrawer open articles={articles} tone={tone} subId={subId} onClose={() => setOpen(false)} />,
        document.body,
      )}
    </>
  );
}
