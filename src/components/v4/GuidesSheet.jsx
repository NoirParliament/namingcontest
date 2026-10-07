// The organizer's guides in one place: a sheet opened from the "Guides"
// button in the setup chat's header. Mark and Maria found the guides
// confusing when they appeared inside the chat under individual questions
// (2026-10-07), so the chat no longer shows them; this lists the category's
// guides as one set of short reads, the same cards as the review page's
// "Naming guides" block, each expanding in place.
//
// Shell: the edit-answer modal (backdrop, halo, white card, scattered
// shapes in the segment palette, close button), widened for a list.
import { useEffect, useMemo } from 'react';
import { X } from '@phosphor-icons/react';
import BriefSectionHead from './BriefSectionHead';
import GuideExpandable from './GuideExpandable';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

function paletteVars(palette) {
  if (!palette || !palette.length) return undefined;
  return {
    '--shape-c1': palette[0],
    '--shape-c2': palette[1],
    '--shape-c3': palette[2],
    '--shape-c4': palette[3],
    '--shape-c5': palette[4],
  };
}

function useShapeSeeds(open) {
  return useMemo(() => {
    if (!open) return null;
    return Array.from({ length: 5 }, () => ({
      dx: Math.round((Math.random() - 0.5) * 24),
      dy: Math.round((Math.random() - 0.5) * 24),
      scale: 0.8 + Math.random() * 0.5,
      delay: -Math.random() * 10,
    }));
  }, [open]);
}

export default function GuidesSheet({ open, articles = [], tone, palette, onClose }) {
  const shapeSeeds = useShapeSeeds(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="v4 lp-v3 v4-auth-backdrop" onClick={onClose}>
      <span className="v4-edit-halo" aria-hidden="true" />
      <div
        className="v4-edit-modal v4-guides-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="v4-guides-title"
        style={paletteVars(palette)}
      >
        <button type="button" className="v4-auth-close" onClick={onClose} aria-label="Close">
          <X weight="regular" size={16} />
        </button>

        {shapeSeeds && shapeSeeds.map((s, i) => (
          <span
            key={i}
            className={`v4-edit-shape v4-edit-shape-${i + 1}`}
            style={{ marginLeft: `${s.dx}px`, marginTop: `${s.dy}px`, '--jitter-scale': s.scale, animationDelay: `${s.delay}s` }}
            aria-hidden="true"
          />
        ))}

        <div id="v4-guides-title">
          <BriefSectionHead
            title="Naming guides"
            sub="Short reads on naming craft, shared with your participants"
            icon="BookOpen"
            tone={tone}
          />
        </div>

        <div className="v4-brief-guides-list v4-guides-sheet-list">
          {articles.map((a) => (
            <GuideExpandable key={a.id} article={a} compact tone={tone} />
          ))}
        </div>
      </div>
    </div>
  );
}
