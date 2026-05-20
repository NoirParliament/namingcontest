// V4 Pick-the-winner modal — creator's final-call surface when voting
// has ended. Top-voted name is pre-selected; the creator can pick a
// different name from the leaderboard before confirming. Confirm sets
// the winner sub-state on the contest URL, which transforms the
// ContestManage page into the winner-picked celebration view.

import { useState, useEffect, useMemo } from 'react';
import { X, Trophy, Gift, Check, ArrowRight } from '@phosphor-icons/react';
import { NAMES, getParticipantById } from '../../data/v4/mockContestData';
import '../../styles/landing-v3.css';

export default function PickWinnerModal({ open, onClose, onConfirm, tone, prize }) {
  // Names sorted by votes desc — top vote becomes the pre-selected
  // winner. The list is what the radio buttons render below.
  const sortedNames = useMemo(
    () => [...NAMES].sort((a, b) => b.voteCount - a.voteCount),
    []
  );
  const topName = sortedNames[0];
  const [selectedId, setSelectedId] = useState(topName?.id || null);

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

  const selectedName = sortedNames.find((n) => n.id === selectedId) || topName;
  const submitter = selectedName ? getParticipantById(selectedName.submittedBy) : null;
  const isTopVote = selectedName?.id === topName.id;
  const fallbackTone = { bg: '#fadecc', fg: '#9c4818' };
  const t = tone || fallbackTone;

  const handleConfirm = () => {
    if (!selectedName) return;
    onConfirm?.(selectedName.id);
  };

  return (
    <div className="v4 lp-v3 v4-pickwinner-overlay" onClick={onClose}>
      <div
        className="v4-pickwinner-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="v4-pickwinner-title"
      >
        <button
          type="button"
          className="v4-pickwinner-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X weight="regular" size={16} />
        </button>

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
              "{selectedName.text}"
            </div>
            <div className="v4-pickwinner-preview-meta">
              Submitted by <strong>{submitter?.name || 'a participant'}</strong>
            </div>
            {prize?.enabled && (
              <div className="v4-pickwinner-preview-prize">
                <Gift weight="duotone" size={14} />
                <span>
                  <strong>{submitter?.name}</strong> wins
                  {prize.name ? <> &nbsp;<em>"{prize.name}"</em></> : <> &nbsp;the prize</>}
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
            Crown "{selectedName?.text || '…'}"
            <ArrowRight weight="bold" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
