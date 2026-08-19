// V4 Pick-the-winner modal — creator's final-call surface when voting
// has ended. Top-voted name is pre-selected; the creator can pick a
// different name from the leaderboard before confirming. Confirm sets
// the winner sub-state on the contest URL, which transforms the
// ContestManage page into the winner-picked celebration view.

import { useState, useEffect, useMemo } from 'react';
import { X, Trophy, Gift, Check, ArrowRight } from '@phosphor-icons/react';
import '../../styles/landing-v3.css';

// Re-seed each time the modal opens so the scattered shapes land in
// slightly different positions / drift phases / sizes. Same recipe
// used by EditQuestionModal — subtle enough to read as "same family,"
// distinct enough that two opens never look identical.
function useShapeSeeds(open) {
  return useMemo(() => {
    if (!open) return null;
    return Array.from({ length: 8 }, () => ({
      dx: Math.round((Math.random() - 0.5) * 20),   // ±10px lateral
      dy: Math.round((Math.random() - 0.5) * 28),   // ±14px vertical
      scale: 0.85 + Math.random() * 0.4,            // 0.85x – 1.25x
      delay: -Math.random() * 10,                   // 0 → -10s float offset
    }));
  }, [open]);
}

// Translate a segment palette into CSS vars the shapes read.
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

export default function PickWinnerModal({
  open, onClose, onConfirm, tone, prize, palette,
  names = [], participants = [],
}) {
  // Leaderboard comes from THIS contest's own names (passed in), so the
  // id we hand back on confirm matches what ContestManage resolves the
  // winner from. Sorted by votes desc — top vote is pre-selected.
  const sortedNames = useMemo(
    () => [...names].sort((a, b) => b.voteCount - a.voteCount),
    [names]
  );
  const getParticipantById = (id) =>
    participants.find((p) => p.id === id) || null;
  const topName = sortedNames[0];
  const [selectedId, setSelectedId] = useState(topName?.id || null);
  // Hooks must run unconditionally — call useShapeSeeds before the
  // early-return below so React's hook order stays stable.
  const shapeSeeds = useShapeSeeds(open);

  // Reset selection to the top vote each time the modal re-opens.
  useEffect(() => {
    if (open) setSelectedId(topName?.id || null);
  }, [open, topName?.id]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  // A contest can close with zero submissions (nobody entered a name), in
  // which case there is nothing to crown. ContestManage avoids opening the
  // picker in that case, but guard here too: this used to blank the whole
  // page, because `topName` was undefined and `topName.id` below threw.
  if (sortedNames.length === 0) {
    return (
      <div className="v4 lp-v3 v4-pickwinner-overlay" onClick={onClose}>
        <div className="v4-pickwinner-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
          <button type="button" className="v4-pickwinner-close" onClick={onClose} aria-label="Close">
            <X weight="regular" size={16} />
          </button>
          <h2 className="v4-pickwinner-title">No names to crown</h2>
          <p className="v4-pickwinner-sub">
            This contest closed without any submissions, so there&rsquo;s no
            winner to pick. Nothing more to do here.
          </p>
          <button type="button" className="btn btn-primary btn-lg" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const selectedName = sortedNames.find((n) => n.id === selectedId) || topName;
  const submitter = selectedName ? getParticipantById(selectedName.submittedBy) : null;
  const isTopVote = !!selectedName && selectedName.id === topName?.id;
  const fallbackTone = { bg: '#fadecc', fg: '#9c4818' };
  const t = tone || fallbackTone;

  const handleConfirm = () => {
    if (!selectedName) return;
    onConfirm?.(selectedName.id);
  };

  return (
    <div className="v4 lp-v3 v4-pickwinner-overlay" onClick={onClose}>
      {/* Soft blush halo behind the modal — same warm NamingContest
          glow used by the sign-in and edit modals, ties this surface
          into the same family. */}
      <span className="v4-pickwinner-halo" aria-hidden="true" />
      <div
        className="v4-pickwinner-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="v4-pickwinner-title"
        style={paletteVars(palette)}
      >
        <button
          type="button"
          className="v4-pickwinner-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X weight="regular" size={16} />
        </button>

        {/* Scattered decorative shapes — same five-shape recipe as
            the sign-in / edit modals, re-seeded on each open so two
            picks never look identical. */}
        {shapeSeeds && shapeSeeds.map((s, i) => (
          <span
            key={i}
            className={`v4-pickwinner-shape v4-pickwinner-shape-${i + 1}`}
            style={{
              marginLeft: `${s.dx}px`,
              marginTop: `${s.dy}px`,
              '--jitter-scale': s.scale,
              animationDelay: `${s.delay}s`,
            }}
            aria-hidden="true"
          />
        ))}

        {/* Header */}
        <div className="v4-pickwinner-head">
          <span
            className="v4-pickwinner-icon"
            style={{ background: t.bg, color: t.fg }}
            aria-hidden="true"
          >
            <Trophy weight="duotone" size={22} />
          </span>
          <div>
            <h2 id="v4-pickwinner-title" className="v4-pickwinner-title">
              Pick the winner
            </h2>
            <p className="v4-pickwinner-subtitle">
              Top vote is pre-selected. Pick a different name if you want.
            </p>
          </div>
        </div>

        {/* Selected preview — segment-tinted gradient, matches the
            "highlighted card" pattern used by the active journey step
            and the current-contest card in Settings. */}
        {selectedName && (
          <div
            className="v4-pickwinner-preview"
            style={{
              '--pickwinner-tint-bg': t.bg,
              '--pickwinner-tint-border': t.fg + '33',
            }}
          >
            <div className="v4-pickwinner-preview-eyebrow">
              {isTopVote ? (
                <>
                  <Trophy weight="bold" size={11} />
                  TOP VOTE · {selectedName.voteCount} votes
                </>
              ) : (
                <>
                  Your pick · {selectedName.voteCount} votes
                </>
              )}
            </div>
            <div className="v4-pickwinner-preview-name">
              “{selectedName.text}”
            </div>
            <div className="v4-pickwinner-preview-meta">
              {selectedName.anonymous
                ? <span className="is-anon">Submitted anonymously</span>
                : <>Submitted by <strong>{submitter?.name || 'a participant'}</strong></>}
            </div>
            {prize?.enabled && (
              <div className="v4-pickwinner-preview-prize">
                <Gift weight="duotone" size={14} />
                <span>
                  {selectedName.anonymous
                    ? <>{prize.name ? <em>“{prize.name}”</em> : 'The prize'} forfeited, winner is anonymous</>
                    : <><strong>{submitter?.name}</strong> wins{prize.name ? <> &nbsp;<em>“{prize.name}”</em></> : <> &nbsp;the prize</>}</>}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Radio list — pick any other name */}
        <div className="v4-pickwinner-list-label">Or pick a different name</div>
        <div className="v4-pickwinner-list">
          {sortedNames.map((name, i) => {
            const isSelected = name.id === selectedId;
            const sub = getParticipantById(name.submittedBy);
            return (
              <button
                key={name.id}
                type="button"
                className={`v4-pickwinner-row ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setSelectedId(name.id)}
              >
                <span className="v4-pickwinner-row-radio" aria-hidden="true">
                  {isSelected && <Check weight="bold" size={12} />}
                </span>
                <span className="v4-pickwinner-row-rank">#{i + 1}</span>
                <span className="v4-pickwinner-row-name">{name.text}</span>
                <span className="v4-pickwinner-row-meta">
                  {sub?.name} · {name.voteCount} {name.voteCount === 1 ? 'vote' : 'votes'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="v4-pickwinner-foot">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!selectedName}
          >
            <Trophy weight="bold" size={14} />
            Crown “{selectedName?.text || '…'}”
            <ArrowRight weight="bold" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
