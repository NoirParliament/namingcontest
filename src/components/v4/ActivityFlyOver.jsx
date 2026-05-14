// V4 activity fly-over — small avatar pills that appear in two specific
// zones (upper-left + lower-right) — like activity hubs in the side gutters.
// Each spawn rises gently a short distance and fades. Alternates between
// the two zones for balance. Calm cadence (~one every 4s), per-segment tint.

import { useState, useEffect, useRef } from 'react';
import { UserCircle } from '@phosphor-icons/react';

const FLY_LIFETIME_MS  = 3800;
const SPAWN_INTERVAL_MS = 4000;

// Both zones live in the wide empty space flanking the centered hero,
// up high (above where the contest name sits). Pills drift INWARD
// toward the title but fade before crossing into its safe zone.
const ZONES = [
  // Left empty space — between brand logo and contest area
  { side: 'left',  xMin: 16, xMax: 30, yKey: 'top', yMin: 5, yMax: 22,
    pillEndX: '18vw',  pillEndY: '4vh' },
  // Right empty space — between contest area and exit
  { side: 'right', xMin: 16, xMax: 30, yKey: 'top', yMin: 5, yMax: 22,
    pillEndX: '-18vw', pillEndY: '4vh' },
];

const FALLBACK_PALETTE = { bg: '#fadecc', fg: '#9c4818' };

// Palette is now driven by the per-sub-segment tone passed in from the
// page (see getSegmentTone). Keeps the floating avatars on the same color
// as the hero badge, journey active step, and submitter pills.
export default function ActivityFlyOver({ tone = FALLBACK_PALETTE, enabled = true }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);
  const zoneIdxRef = useRef(0);
  const palette = tone;

  useEffect(() => {
    if (!enabled) return;

    const spawn = () => {
      const id = idRef.current++;
      // Alternate zones for balance — left, right, left, right…
      const zone = ZONES[zoneIdxRef.current % ZONES.length];
      zoneIdxRef.current++;

      const xPos = `${zone.xMin + Math.random() * (zone.xMax - zone.xMin)}%`;
      const yPos = `${zone.yMin + Math.random() * (zone.yMax - zone.yMin)}%`;
      const points = 1 + Math.floor(Math.random() * 5); // +1 through +5

      setItems((prev) => [
        ...prev,
        {
          id,
          side: zone.side,
          [zone.side]: xPos,
          [zone.yKey]: yPos,
          pillEndX: zone.pillEndX,
          pillEndY: zone.pillEndY,
          points,
          sizeBoost: Math.random() * 6,
        },
      ]);

      setTimeout(() => {
        setItems((prev) => prev.filter((it) => it.id !== id));
      }, FLY_LIFETIME_MS);
    };

    const initialTimer = setTimeout(spawn, 600);
    const interval = setInterval(spawn, SPAWN_INTERVAL_MS);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [enabled]);

  return (
    <div className="v4-flyover-layer" aria-hidden="true">
      {items.map((it) => {
        const { id, sizeBoost, side, pillEndX, pillEndY, points, ...positionStyle } = it;
        return (
          <span key={id} className="v4-flyover-group" style={positionStyle}>
            {/* The avatar — appears, sits in zone, fades out */}
            <span
              className="v4-flyover-avatar"
              style={{
                background: palette.bg,
                color: palette.fg,
              }}
            >
              <UserCircle weight="duotone" size={26 + sizeBoost} />
            </span>
            {/* The +N points pill — emerges from avatar, flies toward
                the contest name in hero, fades out */}
            <span
              className="v4-flyover-pill"
              style={{
                '--end-x': pillEndX,
                '--end-y': pillEndY,
              }}
            >
              +{points}
            </span>
          </span>
        );
      })}
    </div>
  );
}
