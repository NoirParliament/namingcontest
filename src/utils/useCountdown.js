// Live ticking countdown. Updates every second; returns
// { d, h, m, s, isReady, unknown }. Used by ParticipantStatus and
// Settings to render the time-until-voting-opens display.

import { useState, useEffect } from 'react';

export default function useCountdown(targetMs) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!Number.isFinite(targetMs)) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  if (!Number.isFinite(targetMs)) {
    return { d: 0, h: 0, m: 0, s: 0, isReady: false, unknown: true };
  }
  const diff = targetMs - now;
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, isReady: true };
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
    isReady: false,
  };
}

export const pad2 = (n) => String(n).padStart(2, '0');
