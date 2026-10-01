// The one control that ties the written brief to the answers on the review
// page: a floating pill at the bottom of the screen, built from the same
// parts as the resume-draft pill (white card, faint border, soft shadow,
// eyebrow + display-serif title, dark pill CTA, lift on hover). It exists
// only while the answers differ from what the brief was written from, or
// while an update is running / has just landed / has just failed.
//
// The rule it makes visible: the answers are the source, the brief is
// written from them, and nothing rewrites until the creator asks (at most
// MAX_REWRITES times per contest).

import { createPortal } from 'react-dom';
import { ArrowsClockwise, CheckCircle } from '@phosphor-icons/react';
import { MAX_REWRITES } from '../../utils/composeBrief';

const plural = (n, one, many) => (n === 1 ? one : many);
const leftText = (left) => (left === 0 ? 'No rewrites left' : `${left} ${plural(left, 'rewrite', 'rewrites')} left`);

export default function BriefUpdateBar({ count, left, edited, state, nudge, onUpdate }) {
  // state: 'pending' | 'updating' | 'done' | 'failed'
  const changed = count > 0 ? `${count} ${plural(count, 'answer', 'answers')} changed` : 'Answers changed';
  let eyebrow;
  let title;
  let note = null;
  let cta = null;
  const canUpdate = (state === 'pending' || state === 'failed') && left > 0;

  if (state === 'updating') {
    eyebrow = 'Updating';
    title = 'Rewriting your brief…';
    cta = <span className="v4-bupd-spin" aria-hidden="true" />;
  } else if (state === 'done') {
    eyebrow = leftText(left);
    title = 'Your brief is up to date';
    cta = <CheckCircle size={22} weight="fill" className="v4-bupd-ok" aria-hidden="true" />;
  } else if (state === 'failed') {
    eyebrow = 'Update didn’t go through';
    title = 'Your brief is unchanged';
    note = 'No rewrite was used. Try once more.';
  } else if (left === 0) {
    eyebrow = changed;
    title = 'Reword the brief to match';
    note = `You’ve used all ${MAX_REWRITES} rewrites.`;
  } else {
    eyebrow = changed;
    title = 'Update your brief to include it';
    if (count > 1) title = 'Update your brief to include them';
    if (nudge) note = 'Launch now and the brief goes out without these changes.';
    else if (edited) note = 'This replaces wording you changed yourself.';
  }

  if (canUpdate) {
    eyebrow = `${eyebrow} · ${leftText(left)}`;
    cta = (
      <span className="v4-bupd-cta">
        <ArrowsClockwise size={13} weight="bold" aria-hidden="true" />
        {state === 'failed' ? 'Try again' : 'Update brief'}
      </span>
    );
  }

  const body = (
    <>
      <span className="v4-bupd-text">
        <span className="v4-bupd-eyebrow">{eyebrow}</span>
        <span className="v4-bupd-title">{title}</span>
        {note && <span className="v4-bupd-note">{note}</span>}
      </span>
      {cta}
    </>
  );

  // Portaled to <body>: the review column animates in with a transform,
  // which would otherwise pin this "fixed" pill to the column, not the screen.
  // Same wrapper classes as ResumeDraftPill so the v4 tokens apply.
  return createPortal(
    <div className="v4 lp-v3" style={{ display: 'contents' }}>
      {canUpdate ? (
        <button
          type="button"
          className={`v4-bupd is-${state}${nudge ? ' is-nudged' : ''}`}
          onClick={onUpdate}
          aria-live="polite"
        >
          {body}
        </button>
      ) : (
        <div className={`v4-bupd is-${state}`} role="status" aria-live="polite">
          {body}
        </div>
      )}
    </div>,
    document.body,
  );
}
