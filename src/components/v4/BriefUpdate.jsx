// The one control that ties the written brief to the answers on the review
// page: a dark bar at the bottom of the screen that exists only while the
// answers differ from what the brief was written from, or while an update
// is running / has just landed / has just failed. One sentence, one button.
//
// The button is the footer's dark-surface control reversed: the footer's
// buttons are translucent and brighten on hover; this one is solid white
// and settles to a soft warm grey on hover. Nothing moves. The bar enters
// like the resume-draft pill.
//
// The rule it makes visible: the answers are the source, the brief is
// written from them, and nothing rewrites until the creator asks (at most
// MAX_REWRITES times per contest).

import { createPortal } from 'react-dom';
import { CheckCircle, ArrowClockwise } from '@phosphor-icons/react';
import { MAX_REWRITES } from '../../utils/composeBrief';

const plural = (n, one, many) => (n === 1 ? one : many);
const leftText = (left) => (left === 0 ? 'No updates left' : `${left} ${plural(left, 'update', 'updates')} left`);

export default function BriefUpdateBar({ count, left, state, nudge, onUpdate }) {
  // state: 'pending' | 'updating' | 'done' | 'failed'
  let lead = null;
  let text;
  let sub = null;
  const canUpdate = (state === 'pending' || state === 'failed') && left > 0;

  if (state === 'updating') {
    lead = <span className="v4-bupd-spin" aria-hidden="true" />;
    text = 'Rewriting your brief from your answers…';
  } else if (state === 'done') {
    lead = <CheckCircle size={18} weight="fill" className="v4-bupd-ok" aria-hidden="true" />;
    text = 'Your brief is up to date.';
    sub = left === 0 ? 'That was your last update, so your brief is final.' : `${leftText(left)}.`;
  } else if (state === 'failed') {
    text = 'The update didn’t go through, so your brief is unchanged.';
    sub = `It didn’t use an update. ${leftText(left)}.`;
  } else {
    text = count > 0
      ? `You’ve changed ${count} ${plural(count, 'answer', 'answers')} since your brief was written.`
      : 'Your answers have changed since your brief was written.';
    if (left === 0) {
      sub = `You’ve used all ${MAX_REWRITES} updates, so participants will see the brief as it is.`;
    } else {
      sub = nudge
        ? `Launch now and the brief goes out without these changes. ${leftText(left)}.`
        : leftText(left);
    }
  }

  // Portaled to <body>: the review column animates in with a transform,
  // which would otherwise pin this "fixed" bar to the column, not the screen.
  // Wrapped in the v4 / lp-v3 scope so the site's .btn styles apply.
  return createPortal(
    <div className="v4 lp-v3" style={{ display: 'contents' }}>
      <div className={`v4-bupd is-${state}${nudge ? ' is-nudged' : ''}`} role="status" aria-live="polite">
        <div className="v4-bupd-msg">
          {lead}
          <span className="v4-bupd-copy">
            <span className="v4-bupd-text">{text}</span>
            {sub && <span className="v4-bupd-sub">{sub}</span>}
          </span>
        </div>
        {canUpdate && (
          <button type="button" className="v4-bupd-btn" onClick={onUpdate}>
            <ArrowClockwise size={14} weight="bold" aria-hidden="true" />
            {state === 'failed' ? 'Try again' : 'Update brief'}
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
