// The organizer's guides reader for the setup chat.
//
// Desktop: a drawer that slides in from the right edge, full height, with
// the chat dimmed but visible behind it. Phone: the same panel rises from
// the bottom as a sheet with a handle. It opens on the category's guides as
// a list (the review page's compact cards); tapping one slides the article
// in as a reading view with "Back to guides". Closes on the X, the
// backdrop, Escape, or a swipe down on the handle (phone).
import { useEffect, useRef, useState } from 'react';
import { X, CaretLeft, BookOpen } from '@phosphor-icons/react';
import GuideExpandable, { GuideBody } from './GuideExpandable';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

export default function GuidesDrawer({ open, articles = [], tone = null, onClose }) {
  const [active, setActive] = useState(null);
  const [closing, setClosing] = useState(false);
  const bodyRef = useRef(null);
  const touchStartY = useRef(null);
  const closeTimer = useRef(null);

  // Fresh list every time it opens.
  useEffect(() => { if (open) { setActive(null); setClosing(false); } }, [open]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Leave the way it came: the out animation runs, then the parent unmounts.
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => onClose?.(), 240);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (active) setActive(null); else requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Reading view starts at the top.
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [active]);

  if (!open) return null;

  const toneVars = tone ? { '--guide-tint': tone.bg, '--guide-accent': tone.fg } : undefined;

  // Phone: drag the handle (or header) down to close.
  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => {
    if (touchStartY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (dy > 80) requestClose();
  };

  return (
    <div className={`v4 lp-v3 v4-gdrawer-backdrop${closing ? ' is-closing' : ''}`} onClick={requestClose}>
      <aside
        className={`v4-gdrawer${active ? ' is-reading' : ''}${closing ? ' is-closing' : ''}`}
        style={toneVars}
        role="dialog"
        aria-modal="true"
        aria-labelledby="v4-gdrawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="v4-gdrawer-handle" aria-hidden="true" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} />

        <header className="v4-gdrawer-head" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {active ? (
            <button type="button" className="v4-gdrawer-back" onClick={() => setActive(null)}>
              <CaretLeft weight="bold" size={14} />
              <span>Back to guides</span>
            </button>
          ) : (
            <div className="v4-gdrawer-title-wrap">
              <span className="v4-gdrawer-icon" aria-hidden="true"><BookOpen weight="duotone" size={18} /></span>
              <div>
                <h2 id="v4-gdrawer-title" className="v4-gdrawer-title">Naming guides</h2>
                <p className="v4-gdrawer-sub">Short reads on what makes a name work.</p>
              </div>
            </div>
          )}
          <button type="button" className="v4-auth-close v4-gdrawer-close" onClick={requestClose} aria-label="Close">
            <X weight="regular" size={16} />
          </button>
        </header>

        <div className="v4-gdrawer-body" ref={bodyRef}>
          {active ? (
            <div key={active.id} className="v4-guide v4-guide-compact is-open v4-gdrawer-article">
              <GuideBody article={active} showClose={false} />
            </div>
          ) : (
            <div key="list" className="v4-brief-guides-list v4-gdrawer-list">
              {articles.map((a) => (
                <GuideExpandable key={a.id} article={a} compact tone={tone} onOpen={setActive} />
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
