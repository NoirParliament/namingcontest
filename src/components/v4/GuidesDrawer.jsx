// The organizer's guides reader for the setup chat.
//
// A panel that fits its content: on desktop a card anchored under the
// header's Guides button, top right, as tall as what's in it (two guides
// make a compact card; an opened guide grows it to near the screen height
// and it scrolls inside). On phones the same panel rises from the bottom as
// a sheet with a handle. It opens on the category's guides as full cards
// (icon, title, a two-line excerpt and what's inside); tapping one slides
// the article in as a reading view with "Back to guides". Closes on the X,
// the backdrop, Escape, or a swipe down on the handle (phone).
import { useEffect, useRef, useState } from 'react';
import { X, CaretLeft, CaretRight, BookOpen } from '@phosphor-icons/react';
import { GuideBody, ICONS } from './GuideExpandable';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

// One guide in the list: enough to decide whether to read it.
function GuideCard({ article, onOpen }) {
  const Icon = ICONS[article.icon] || BookOpen;
  const sections = article.sections || [];
  const excerpt = sections[0]?.body || '';
  const topics = sections.map((s) => s.heading).filter(Boolean);
  const shown = topics.slice(0, 3);
  const more = topics.length - shown.length;
  return (
    <button type="button" className="v4-gcard" onClick={() => onOpen(article)}>
      <span className="v4-gcard-icon" aria-hidden="true"><Icon weight="duotone" size={20} /></span>
      <span className="v4-gcard-main">
        <span className="v4-gcard-eyebrow">
          <BookOpen weight="fill" size={11} aria-hidden="true" />
          Guide · {article.readTime} read
        </span>
        <span className="v4-gcard-title">{article.title}</span>
        {excerpt && <span className="v4-gcard-excerpt">{excerpt}</span>}
        {shown.length > 0 && (
          <span className="v4-gcard-inside">
            {shown.map((t) => <span key={t} className="v4-gcard-topic">{t}</span>)}
            {more > 0 && <span className="v4-gcard-topic v4-gcard-topic-more">+{more}</span>}
          </span>
        )}
      </span>
      <span className="v4-gcard-cta" aria-hidden="true">
        Read <CaretRight weight="bold" size={12} />
      </span>
    </button>
  );
}

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
            <div key="list" className="v4-gdrawer-list">
              {articles.map((a) => <GuideCard key={a.id} article={a} onOpen={setActive} />)}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
