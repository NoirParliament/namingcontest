import { useEffect, useState } from 'react';

// Scroll rules for the participant chats (suggest and vote), the way current
// chat products handle a long answer: when the brief opens, its start is
// brought up to just under the sticky header and left there to be read; the
// page does not chase the bottom while it is being read. Short turns (a
// prompt, a typing indicator, a draft) still follow the bottom as before.

// Bring `el` up to just under the container's sticky header.
export function pinToTop(container, el, gap = 12) {
  if (!container || !el) return;
  const nav = container.querySelector('.v4-nav');
  const navH = nav ? nav.getBoundingClientRect().height : 0;
  const top = container.scrollTop
    + (el.getBoundingClientRect().top - container.getBoundingClientRect().top)
    - navH - gap;
  container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

export function toBottom(container) {
  if (!container) return;
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
}

// The intro stage both chats share where the brief has just opened: pin it,
// then wait for the reader. The prompt under the brief only starts typing
// once the end of the brief has been scrolled into view (useReachedEnd).
export const BRIEF_OPENED_STAGE = 3;

// True once `targetRef` (a marker at the end of the brief) has been seen
// inside the scroll container while `active`, and at least `minMs` have
// passed since it became active: a brief short enough to fit on screen is
// still given a moment to be read before the next message types.
export function useReachedEnd(rootRef, targetRef, active, minMs = 2000) {
  const [seen, setSeen] = useState(false);
  const [dwelt, setDwelt] = useState(false);
  useEffect(() => {
    setSeen(false);
    setDwelt(false);
    if (!active) return undefined;
    const dwell = setTimeout(() => setDwelt(true), minMs);
    const root = rootRef.current;
    const target = targetRef.current;
    if (!root || !target || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return () => clearTimeout(dwell);
    }
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); } },
      // The marker has to be properly on screen, not just peeking in.
      { root, rootMargin: '0px 0px -48px 0px', threshold: 0 },
    );
    io.observe(target);
    return () => { clearTimeout(dwell); io.disconnect(); };
  }, [active, rootRef, targetRef, minMs]);
  return seen && dwelt;
}
