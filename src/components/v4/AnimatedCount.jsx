// Count-up display — animates a number from its previous value to a
// new target over ~800ms with an ease-out curve. Used in LiveResults
// during the voting phase so vote totals "lock in" like a scoreboard,
// and so any ambient vote increment shows the +1 as a brief tick
// rather than a jump-cut.

import { useEffect, useRef, useState } from 'react';

export function useCountUp(target, durationMs = 1600, startDelayMs = 0) {
  // Start at 0 so first mount animates the climb from 0 → target.
  // After that, prev.current tracks the last shown value so future
  // changes (e.g. ambient tick +1) animate from the current value.
  const [value, setValue] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const startVal = prev.current;
    if (startVal === target) return;
    if (typeof window === 'undefined') {
      prev.current = target;
      setValue(target);
      return;
    }
    // Respect reduced-motion — snap to final.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      prev.current = target;
      setValue(target);
      return;
    }
    let raf = 0;
    let delayTimer = 0;
    const runAnim = () => {
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setValue(Math.round(startVal + (target - startVal) * eased));
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          prev.current = target;
        }
      };
      raf = requestAnimationFrame(tick);
    };
    if (startDelayMs > 0) {
      delayTimer = window.setTimeout(runAnim, startDelayMs);
    } else {
      runAnim();
    }
    return () => {
      cancelAnimationFrame(raf);
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [target, durationMs, startDelayMs]);

  return value;
}

/**
 * Drop-in: <AnimatedCount value={18} startDelayMs={420} />
 */
export default function AnimatedCount({ value, durationMs = 1600, startDelayMs = 0 }) {
  const display = useCountUp(value, durationMs, startDelayMs);
  return <>{display}</>;
}
