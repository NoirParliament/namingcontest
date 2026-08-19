// V4 PDF report — rendered as a hidden, off-screen HTML component using
// the SAME design language as the live website: Fraunces + Inter via the
// global @font-face from index.html, and the segment backdrop every chat
// stage wears (glow + line-art scene). The PDF export captures THIS
// component as a high-resolution image and embeds it in a single-A4 jsPDF
// document.
//
// Tuned for print rather than screen: no centre-fade on the scene (the page
// is one continuous illustration, not a narrow column), the scene sits
// larger and lifted off the bottom edge, and the wash runs further down a
// 1123px page than it needs to on a viewport.
//
// A4 portrait at 96 DPI ≈ 794 × 1123 px. We render at this size and
// capture at 4x pixel ratio for crisp print quality.

import { forwardRef } from 'react';
import { Trophy, Quotes, Gift } from '@phosphor-icons/react';
import { SegmentThemeBackdrop } from '../../data/v4/segmentTheme';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';

// Cap so the report always fits on one A4 page.
const MAX_NAMES_ON_REPORT = 5;

// forwardRef so the parent can attach a ref directly to the
// .v4-pdf-report element. html-to-image needs the actual rendered
// node to capture, not a 0×0 wrapper div.
const PdfReport = forwardRef(function PdfReport({
  contestName,
  segmentLabel,
  subId,
  tone,
  winner,
  submitter,
  prize,
  names = [],
  stats = {},
  durationDays,
  hideBranding = false,
  customLogo,
  customColor, // optional override — when set, paints the ENTIRE doc
}, ref) {
  if (!winner) return null;
  const t = tone || { bg: '#fadecc', fg: '#9c4818' };
  const sortedNames = [...names].sort((a, b) => b.voteCount - a.voteCount);
  const topNames = sortedNames.slice(0, MAX_NAMES_ON_REPORT);

  return (
    <div
      ref={ref}
      className="v4-pdf-report"
      style={{
        // Card tints only. The --v4-blob-* vars that used to live here are
        // gone with the blobs; a customColor now reaches the background
        // through SegmentThemeBackdrop's own colour override instead.
        '--report-tint-bg': t.bg,
        '--report-tint-fg': t.fg,
        '--report-tint-border': t.fg + '33',
      }}
    >
      {/* The same backdrop the chat stages wear — cream page, segment glow,
          the segment's line-art scene — so the exported report reads as the
          same product the contest ran in. Rendered via the shared component
          rather than re-created here, so the two can't drift apart.

          customColor recolours the glow along with everything else; without
          that the page would fight a card the creator had branded. */}
      <SegmentThemeBackdrop subId={subId} minimal color={customColor || null} />

      {/* No scattered segment icons here. The chat stages don't carry them in
          minimal mode either, and on a dense one-page document they read as
          specks behind the copy rather than as decoration. The glow and the
          line-art scene do the segment's work. */}

      <div className="v4-pdf-report-content">
        {/* Brand bar top */}
        <div className="v4-pdf-report-brandbar">
          {customLogo ? (
            <img src={customLogo} alt="" className="v4-pdf-report-brand-logo" />
          ) : !hideBranding ? (
            <img src={namingContestLogo} alt="" className="v4-pdf-report-brand-logo" />
          ) : null}
          <span className="v4-pdf-report-brandbar-meta">
            Final report
          </span>
        </div>

        {/* Title block */}
        <div className="v4-pdf-report-title-block">
          <h1 className="v4-pdf-report-title">{contestName}</h1>
          {segmentLabel && (
            <p className="v4-pdf-report-subtitle">{segmentLabel}</p>
          )}
        </div>

        {/* Winner card — featured panel with gradient + trophy */}
        <div className="v4-pdf-report-winner">
          <div className="v4-pdf-report-winner-eyebrow">
            <Trophy weight="duotone" size={14} />
            <span>The winning name</span>
          </div>
          <div className="v4-pdf-report-winner-name">
            {winner.text}
          </div>
          {/* Tagline removed — not a real participant field. */}
          <div className="v4-pdf-report-winner-credit">
            {winner.anonymous
              ? <span>Submitted anonymously</span>
              : <><strong>{submitter?.name || 'A participant'}</strong> suggested it</>}
            <span className="v4-pdf-report-winner-credit-sep">·</span>
            <strong>{winner.voteCount} of {stats.votes ?? 0} votes</strong>
          </div>
        </div>

        {/* Prize (if set) */}
        {prize?.enabled && (
          <div className="v4-pdf-report-prize">
            <Gift weight="duotone" size={16} />
            <span>
              {winner.anonymous
                ? <><em>“{prize.name || 'The prize'}”</em> forfeited, winner stayed anonymous</>
                : <><strong>{submitter?.name}</strong> wins <em>“{prize.name || 'the prize'}”</em></>}
            </span>
          </div>
        )}

        {/* Top names leaderboard — capped */}
        <div className="v4-pdf-report-names">
          <div className="v4-pdf-report-section-label">
            Top {topNames.length} of {sortedNames.length}
          </div>
          <ul className="v4-pdf-report-names-list">
            {topNames.map((n, i) => (
              <li key={n.id} className="v4-pdf-report-names-row">
                <span className="v4-pdf-report-names-rank">#{i + 1}</span>
                <span className="v4-pdf-report-names-text">{n.text}</span>
                <span className="v4-pdf-report-names-votes">
                  {n.voteCount} {n.voteCount === 1 ? 'vote' : 'votes'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Final stats row */}
        <div className="v4-pdf-report-stats">
          <div className="v4-pdf-report-stat">
            <div className="v4-pdf-report-stat-value">{stats.submissions ?? names.length}</div>
            <div className="v4-pdf-report-stat-label">Names</div>
          </div>
          <div className="v4-pdf-report-stat">
            <div className="v4-pdf-report-stat-value">{stats.participants ?? '—'}</div>
            <div className="v4-pdf-report-stat-label">Voters</div>
          </div>
          <div className="v4-pdf-report-stat">
            <div className="v4-pdf-report-stat-value">{stats.votes ?? 0}</div>
            <div className="v4-pdf-report-stat-label">Votes</div>
          </div>
          {typeof durationDays === 'number' && (
            <div className="v4-pdf-report-stat">
              <div className="v4-pdf-report-stat-value">{durationDays}d</div>
              <div className="v4-pdf-report-stat-label">Contest</div>
            </div>
          )}
        </div>

        {/* Brand footer */}
        {!hideBranding && (
          <div className="v4-pdf-report-foot">
            <span>Named together with</span>
            <strong>namingcontest.com</strong>
          </div>
        )}
      </div>
    </div>
  );
});

export default PdfReport;
