// V4 winner hero — poster-style celebration card shown on ContestManage
// once a winner has been picked. Designed as the snapshot target for the
// PNG share card: what you see IS what downloads.
//
// Built for social media legibility: a stranger seeing this in their
// feed should understand within 2 seconds that (1) this is a naming
// contest result, (2) what was named, (3) what won, (4) where they
// can run their own. Brand mark top, tagline as pull-quote, credit
// line, growth footer at the bottom.
//
// Copy is intentionally warm + personal — no enterprise "Winner Picked"
// formality. The trophy carries the celebration; the typography carries
// the moment.

import { Trophy, ArrowRight } from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';

export default function WinnerHero({
  name,           // winner name object from mockContestData NAMES
  submitter,      // participant object
  tone,           // segment tone { bg, fg } — used if customColor not set
  contestName,    // e.g. "Sunday football crew"
  totalVotes,     // total across the contest, for "X of Y votes"
  // Customization (set via WinnerCustomizer below)
  customColor,    // optional override for the hero tint background
  customLogo,     // optional data URL for the user's own logo
  hideBranding,   // true → hide the NamingContest brand bar + footer
}) {
  if (!name) return null;
  const segmentT = tone || { bg: '#fadecc', fg: '#9c4818' };
  // Use custom color if provided, otherwise fall back to segment tone.
  const t = customColor
    ? { bg: customColor, fg: segmentT.fg }
    : segmentT;

  return (
    <div
      className="v4-winner-hero"
      style={{
        '--winner-tint-bg': t.bg,
        '--winner-tint-fg': t.fg,
        '--winner-tint-border': t.fg + '33',
      }}
    >
      {/* Top bar — small trophy inline replaces the old standalone
          trophy block. One row carries: identity (logo) + celebration
          cue (trophy) + context (eyebrow). Three jobs, one strip. */}
      {!hideBranding && (
        <div className="v4-winner-hero-brandbar">
          {customLogo ? (
            <img
              src={customLogo}
              alt="Your logo"
              className="v4-winner-hero-brand-logo v4-winner-hero-brand-logo-custom"
            />
          ) : (
            <img
              src={namingContestLogo}
              alt="NamingContest"
              className="v4-winner-hero-brand-logo"
            />
          )}
          <span
            className="v4-winner-hero-trophy-inline"
            aria-hidden="true"
          >
            <Trophy weight="duotone" size={14} style={{ color: t.fg }} />
            <span>{customLogo ? 'Naming contest winner' : 'Naming contest result'}</span>
          </span>
        </div>
      )}

      <div className="v4-winner-hero-inner">
        <h1 className="v4-winner-hero-name">
          {name.text}
        </h1>

        {/* Tagline removed — not a real participant field. */}

        {/* Credit line — who + what + votes, flowing naturally. The vote
            count is kept as one nowrap unit so it never splits mid-phrase
            ("15 of" / "98 votes"); it only moves as a whole if it has to. */}
        <div className="v4-winner-hero-credit">
          {name.anonymous
            ? <>Submitted anonymously for </>
            : <><strong>{submitter?.name || 'A participant'}</strong> suggested it for </>}
          <strong>{contestName}</strong>
          {typeof name.voteCount === 'number' && (
            <span className="v4-winner-hero-credit-votes">
              {' · '}
              {name.voteCount}{typeof totalVotes === 'number' ? ` of ${totalVotes}` : ''} votes
            </span>
          )}
        </div>
      </div>

      {/* Growth footer — hidden when the user has chosen to hide
          NamingContest branding entirely. */}
      {!hideBranding && (
        <div className="v4-winner-hero-foot">
          <span className="v4-winner-hero-foot-text">
            Named together with <strong>namingcontest.com</strong>
          </span>
          <span className="v4-winner-hero-foot-cta">
            Run your own
            <ArrowRight weight="bold" size={11} />
          </span>
        </div>
      )}
    </div>
  );
}
