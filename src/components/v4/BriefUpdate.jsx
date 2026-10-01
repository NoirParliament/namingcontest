// The two pieces that tie the written brief to the answers on the review
// page:
//
//   BriefUpdateNotice  above the brief, only when the answers no longer match
//                      what the brief was written from. One action: "Update
//                      the brief", with the rewrites left beside it.
//   BriefUpdatedNote   a short confirmation after a rewrite lands.
//
// The rule they make visible: the answers are the source, the brief is
// written from them, and nothing rewrites until the creator asks (at most
// MAX_REWRITES times per contest).

import { ArrowsClockwise, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { MAX_REWRITES } from '../../utils/composeBrief';

export function RewritesLeft({ left }) {
  return (
    <span className={`v4-bupd-left${left === 0 ? ' is-none' : ''}`}>
      <span className="v4-bupd-pips" aria-hidden="true">
        {Array.from({ length: MAX_REWRITES }, (_, i) => (
          <span key={i} className={i < left ? 'is-on' : ''} />
        ))}
      </span>
      {left === 0 ? 'No rewrites left' : `${left} of ${MAX_REWRITES} rewrites left`}
    </span>
  );
}

export function BriefUpdateNotice({ changes, edited, left, onUpdate, failed, nudge, tone }) {
  const n = changes.filter((c) => c !== '*').length;
  const title = n > 0
    ? `You changed ${n} ${n === 1 ? 'answer' : 'answers'} since this brief was written.`
    : 'Your answers have changed since this brief was written.';
  const vars = tone ? { '--bupd-tint': tone.bg, '--bupd-accent': tone.fg } : undefined;
  return (
    <div className={`v4-bupd${nudge ? ' is-nudged' : ''}`} style={vars} role="status">
      <div className="v4-bupd-body">
        <p className="v4-bupd-title">{title}</p>
        {left > 0 ? (
          <p className="v4-bupd-text">
            Update the brief to rewrite it from your answers.
            {edited && ' This replaces the wording you changed by hand.'}
          </p>
        ) : (
          <p className="v4-bupd-text">
            You’ve used all {MAX_REWRITES} rewrites, so reword the brief below yourself to match.
          </p>
        )}
        {nudge && (
          <p className="v4-bupd-text v4-bupd-strong">
            If you launch now, participants get the brief exactly as it reads below.
          </p>
        )}
        {failed && (
          <p className="v4-bupd-text v4-bupd-error">
            <WarningCircle size={13} weight="fill" aria-hidden="true" />
            The rewrite didn’t go through and your brief is unchanged. It didn’t use a rewrite.
          </p>
        )}
      </div>
      <div className="v4-bupd-actions">
        {left > 0 && (
          <button type="button" className="v4-bupd-btn" onClick={onUpdate}>
            <ArrowsClockwise size={14} weight="bold" aria-hidden="true" />
            {failed ? 'Try again' : 'Update the brief'}
          </button>
        )}
        <RewritesLeft left={left} />
      </div>
    </div>
  );
}

export function BriefUpdatedNote({ left }) {
  return (
    <p className="v4-bupd-done" role="status">
      <CheckCircle size={14} weight="fill" aria-hidden="true" />
      Brief rewritten from your answers.
      <span className="v4-bupd-done-meta">
        {left === 0 ? 'That was your last rewrite.' : `${left} of ${MAX_REWRITES} rewrites left.`}
      </span>
    </p>
  );
}
