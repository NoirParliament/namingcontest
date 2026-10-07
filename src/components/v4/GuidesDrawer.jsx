// The organizer's guides reader for the setup chat.
//
// Desktop: a full-height panel from the right edge, the chat dimmed behind
// it. Phone: a sheet from the bottom with a handle, sized to its content.
// The panel is laid out like the chat behind it: the segment's soft glow
// at the top and its faint line-art scene standing on the bottom edge, so
// it reads as part of the page it slides over; the scene fades away while
// a guide is open and the text takes the whole height. Tapping a card
// turns the page: the list drifts out to the left as the article arrives
// from the right, and "Back to guides" reverses it. Closes on the X, the
// backdrop, Escape, or a swipe down on the handle.
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X, CaretLeft, CaretRight, BookOpen } from '@phosphor-icons/react';
import { GuideBody, ICONS } from './GuideExpandable';
import { SegmentThemeBackdrop } from '../../data/v4/segmentTheme';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

const PHONE = '(max-width: 760px)';
const TURN_MS = 420; // the page turn between list and article

// One guide in the list: icon, read time, title and the opening lines.
function GuideCard({ article, index, onOpen }) {
  const Icon = ICONS[article.icon] || BookOpen;
  const excerpt = article.sections?.[0]?.body || '';
  return (
    <button type="button" className="v4-gcard" style={{ '--i': index }} onClick={() => onOpen(article)}>
      <span className="v4-gcard-icon" aria-hidden="true"><Icon weight="duotone" size={20} /></span>
      <span className="v4-gcard-main">
        <span className="v4-gcard-eyebrow">
          <BookOpen weight="fill" size={11} aria-hidden="true" />
          Guide · {article.readTime} read
        </span>
        <span className="v4-gcard-title">{article.title}</span>
        {excerpt && <span className="v4-gcard-excerpt">{excerpt}</span>}
      </span>
      <span className="v4-gcard-cta" aria-hidden="true">
        Read <CaretRight weight="bold" size={12} />
      </span>
    </button>
  );
}

export default function GuidesDrawer({ open, articles = [], tone = null, subId = null, onClose }) {
  const [active, setActive] = useState(null);
  const [leaving, setLeaving] = useState(null); // the view on its way out: { kind, article }
  const [closing, setClosing] = useState(false);
  const [settled, setSettled] = useState(false); // the opening stagger has finished
  const [sheetH, setSheetH] = useState(null); // phone: the current view's natural height
  const asideRef = useRef(null);
  const bodyRef = useRef(null);
  const stageRef = useRef(null);
  const touchStartY = useRef(null);
  const timers = useRef([]);

  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  // Mounted fresh on every open (the parent renders it only while open),
  // so the state starts clean; the content stagger runs once per mount.
  useEffect(() => {
    later(() => setSettled(true), 700);
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, []);

  // Leave the way it came: the out animation runs, then the parent unmounts.
  const requestClose = () => {
    if (closing) return;
    setClosing(true);
    later(() => onClose?.(), 300);
  };

  const openArticle = (article) => {
    setLeaving({ kind: 'list' });
    setActive(article);
    later(() => setLeaving(null), TURN_MS);
  };
  const backToList = () => {
    setLeaving({ kind: 'article', article: active });
    setActive(null);
    later(() => setLeaving(null), TURN_MS);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (active) backToList(); else requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Each view starts at the top.
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [active]);

  // Phone: the sheet gets an explicit height so it can glide between the
  // list's height and the article's, each capped at 92dvh. Measured from
  // the parts, not the sheet itself, so one view's height never leaks
  // into the other's. The padding comes from a CSS variable because the
  // computed padding is mid-transition at this point.
  useLayoutEffect(() => {
    if (!open || !asideRef.current || !window.matchMedia(PHONE).matches) return;
    const aside = asideRef.current;
    const body = bodyRef.current;
    const stage = stageRef.current;
    const head = aside.querySelector('.v4-gdrawer-head');
    const handle = aside.querySelector('.v4-gdrawer-handle');
    const px = (el, prop) => parseFloat(getComputedStyle(el)[prop]) || 0;
    const pad = parseFloat(getComputedStyle(aside).getPropertyValue(active ? '--gd-read-pad' : '--gd-list-pad')) || 0;
    const h = (handle ? handle.offsetHeight + px(handle, 'marginTop') : 0)
      + (head ? head.offsetHeight : 0)
      + (stage ? stage.offsetHeight : 0)
      + (body ? px(body, 'paddingTop') : 0)
      + pad;
    setSheetH(Math.ceil(Math.min(h, window.innerHeight * 0.92)));
  }, [open, active, articles.length]);

  if (!open) return null;

  const phone = typeof window !== 'undefined' && window.matchMedia(PHONE).matches;
  const style = {
    ...(tone ? { '--guide-tint': tone.bg, '--guide-accent': tone.fg } : null),
    ...(phone && sheetH ? { height: `${sheetH}px` } : null),
  };

  // Phone: drag the handle (or header) down to close.
  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => {
    if (touchStartY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (dy > 80) requestClose();
  };

  const list = (
    <div className="v4-gdrawer-list">
      {articles.map((a, i) => <GuideCard key={a.id} article={a} index={i} onOpen={openArticle} />)}
    </div>
  );
  const articleView = (a) => (
    <div className="v4-guide v4-guide-compact is-open v4-gdrawer-article">
      <GuideBody article={a} showClose={false} />
    </div>
  );

  return (
    <div className={`v4 lp-v3 v4-gdrawer-backdrop${closing ? ' is-closing' : ''}`} onClick={requestClose}>
      <aside
        ref={asideRef}
        className={`v4-gdrawer${active ? ' is-reading' : ''}${closing ? ' is-closing' : ''}${settled ? ' is-settled' : ''}`}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-labelledby="v4-gdrawer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="v4-gdrawer-handle" aria-hidden="true" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} />

        <header className="v4-gdrawer-head" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {active ? (
            <button type="button" className="v4-gdrawer-back" onClick={backToList}>
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
          <div className="v4-gdrawer-stage" ref={stageRef}>
            {/* The view on its way out sits under the incoming one for the
                length of the page turn, then unmounts. */}
            {leaving && (
              <div className={`v4-gdrawer-view is-leaving from-${leaving.kind}`} aria-hidden="true">
                {leaving.kind === 'list' ? list : articleView(leaving.article)}
              </div>
            )}
            <div key={active ? active.id : 'list'} className="v4-gdrawer-view">
              {active ? articleView(active) : list}
            </div>
          </div>
        </div>

        {/* The segment's glow and scene, behind everything. */}
        <div className="v4-gdrawer-scene" aria-hidden="true">
          <SegmentThemeBackdrop subId={subId} minimal />
        </div>
      </aside>
    </div>
  );
}
