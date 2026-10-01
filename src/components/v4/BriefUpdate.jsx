// The one control that ties the written brief to the answers on the review
// page: a small bar pinned to the bottom of the screen that exists only
// while the answers differ from what the brief was written from (or while
// an update is running / just landed / just failed). One sentence, one
// button, the rewrites left beside it.
//
// The rule it makes visible: the answers are the source, the brief is
// written from them, and nothing rewrites until the creator asks (at most
// MAX_REWRITES times per contest).

import { createPortal } from 'react-dom';
import { ArrowsClockwise, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { MAX_REWRITES } from '../../utils/composeBrief';

const plural = (n, one, many) => (n === 1 ? one : many);
const leftText = (left) => (left === 0
  ? 'No rewrites left'
  : `${left} ${plural(left, 'rewrite', 'rewrites')} left`);

export default function BriefUpdateBar({ count, left, edited, state, nudge, onUpdate }) {
  // state: 'pending' | 'updating' | 'done' | 'failed'
  let icon = null;
  let text;
  let sub = null;
  let action = null;

  if (state === 'updating') {
    icon = <span className="v4-bupd-spin" aria-hidden="true" />;
    text = 'Updating your brief from your answers…';
  } else if (state === 'done') {
    icon = <CheckCircle size={16} weight="fill" className="v4-bupd-ok" aria-hidden="true" />;
    text = 'Your brief is up to date.';
    sub = left === 0 ? 'That was your last rewrite.' : `${leftText(left)}.`;
  } else {
    const what = count > 0
      ? `You’ve changed ${count} ${plural(count, 'answer', 'answers')} since your brief was written.`
      : 'Your answers have changed since your brief was written.';
    if (state === 'failed') {
      icon = <WarningCircle size={16} weight="fill" className="v4-bupd-err" aria-hidden="true" />;
      text = 'The update didn’t go through, so your brief is unchanged.';
      sub = 'It didn’t use a rewrite.';
    } else if (left === 0) {
      text = what;
      sub = `You’ve used all ${MAX_REWRITES} rewrites, so reword the brief yourself to match.`;
    } else {
      text = what;
      if (nudge) sub = 'Launch now and participants get the brief without these changes.';
      else if (edited) sub = 'Updating replaces any wording you changed yourself.';
    }
    if (left > 0) {
      action = (
        <span className="v4-bupd-act">
          <button type="button" className="v4-bupd-btn" onClick={onUpdate}>
            <ArrowsClockwise size={14} weight="bold" aria-hidden="true" />
            {state === 'failed' ? 'Try again' : 'Update brief'}
          </button>
          <span className="v4-bupd-left">{leftText(left)}</span>
        </span>
      );
    }
  }

  // Portaled to <body>: the review column animates in with a transform,
  // which would otherwise pin this "fixed" bar to the column, not the screen.
  return createPortal(
    <div className={`v4-bupd-bar is-${state}${nudge ? ' is-nudged' : ''}`} role="status" aria-live="polite">
      <div className="v4-bupd-msg">
        {icon}
        <span className="v4-bupd-copy">
          <span className="v4-bupd-text">{text}</span>
          {sub && <span className="v4-bupd-sub">{sub}</span>}
        </span>
      </div>
      {action}
    </div>,
    document.body,
  );
}
