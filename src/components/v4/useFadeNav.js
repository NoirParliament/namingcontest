// useFadeNav — small hook that returns an onClick handler which
// briefly fades the body out (via `body.is-exiting`) before
// react-router navigates. Used by both ExitLink and BrandLink so the
// X button and the logo both get the same gentle "leaving" feel
// instead of jump-cutting to the destination.
//
// The CSS rule `body.is-exiting { opacity: 0; transition: opacity
// 0.18s ease; }` lives in v4.css.

import { useNavigate } from 'react-router-dom';

const FADE_MS = 180;

export function useFadeNav() {
  const navigate = useNavigate();
  return (to) => (e) => {
    if (!e) return;
    // Let cmd/ctrl-click / middle-click / shift-click open in a
    // new tab via the browser default — don't intercept.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    document.body.classList.add('is-exiting');
    window.setTimeout(() => {
      // Suppress the body's opacity transition for the navigation
      // moment so the destination renders at full opacity from the
      // first paint — otherwise the new page's own animations (chat
      // bubbles, cascades, etc.) compete with a slow fade-IN of the
      // body, which reads as "transitions broken." Only the EXIT
      // side fades; arrival is instant.
      document.body.style.transition = 'none';
      document.body.classList.remove('is-exiting');
      navigate(to);
      // Restore the transition rule on the next frame so future
      // exit fades still work normally.
      window.requestAnimationFrame(() => {
        document.body.style.transition = '';
      });
    }, FADE_MS);
  };
}
