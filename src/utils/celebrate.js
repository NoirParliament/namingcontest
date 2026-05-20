// Confetti burst helper — shared by the creator's pick-winner moment
// and the participant's submit-names / submit-votes moments. Same
// visual signature across surfaces so wins feel familiar.
//
// Pass a `tone` (segment tone object) to thread the contest's accent
// color into the palette. Falls back to the default v4 panel palette.

import confetti from 'canvas-confetti';

const DEFAULT_PALETTE = ['#fadecc', '#fceebc', '#a6dcb3', '#c4dffb', '#c4cff5'];

export default function celebrate(tone) {
  const colors = tone?.fg
    ? [...DEFAULT_PALETTE, tone.fg]
    : DEFAULT_PALETTE;

  const burst = (opts) => confetti({
    particleCount: 80,
    startVelocity: 55,
    spread: 70,
    ticks: 220,
    scalar: 0.9,
    colors,
    ...opts,
  });

  // Two diagonal arcs from the bottom corners — matches the creator
  // pick-winner moment exactly.
  burst({ origin: { x: 0.1, y: 0.9 }, angle: 60 });
  burst({ origin: { x: 0.9, y: 0.9 }, angle: 120 });
}
