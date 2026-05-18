// V4 PDF report — rendered as a hidden, off-screen HTML component using
// the SAME design language as the live website (Fraunces + Inter via
// the global @font-face from index.html, segment blobs, scattered
// icons, gradient washes). The PDF export captures THIS component as
// a high-resolution image and embeds it in a single-A4 jsPDF document.
//
// A4 portrait at 96 DPI ≈ 794 × 1123 px. We render at this size and
// capture at 4x pixel ratio for crisp print quality.

import { forwardRef } from 'react';
import { Trophy, Quotes, Gift } from '@phosphor-icons/react';
import { SEGMENT_THEME } from '../../data/v4/segmentTheme';
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
}, ref) {
  if (!winner) return null;
  const theme = SEGMENT_THEME[subId] || {};
  const t = tone || { bg: '#fadecc', fg: '#9c4818' };
  const sortedNames = [...names].sort((a, b) => b.voteCount - a.voteCount);
  const topNames = sortedNames.slice(0, MAX_NAMES_ON_REPORT);
  const remainingNames = Math.max(0, sortedNames.length - MAX_NAMES_ON_REPORT);

  return (
    <div
      ref={ref}
      className="v4-pdf-report"
      style={{
        '--report-tint-bg': t.bg,
        '--report-tint-fg': t.fg,
        '--report-tint-border': t.fg + '33',
        // Set segment blob colors via the same CSS vars the backdrop uses
        '--v4-blob-1-color': theme.blobs?.[0] || t.bg,
        '--v4-blob-2-color': theme.blobs?.[1] || t.bg,
        '--v4-blob-3-color': theme.blobs?.[2] || t.bg,
        '--v4-blob-4-color': theme.blobs?.[0] || t.bg,
      }}
    >
      {/* Decorative blobs — segment-tinted, soft */}
      <span className="v4-pdf-report-blob v4-pdf-report-blob-1" aria-hidden="true"></span>
      <span className="v4-pdf-report-blob v4-pdf-report-blob-2" aria-hidden="true"></span>
      <span className="v4-pdf-report-blob v4-pdf-report-blob-3" aria-hidden="true"></span>

      {/* Scattered segment icons (smaller scale, low opacity) */}
      {theme.iconPositions?.map((pos, i) => {
        const { Icon, size, rotate, ...positionStyle } = pos;
        return (
          <span
            key={`icon-${i}`}
            className="v4-pdf-report-icon"
            style={{
              ...positionStyle,
              transform: `rotate(${rotate})`,
            }}
            aria-hidden="true"
          >
            <Icon weight="duotone" size={Math.round(size * 0.75)} />
          </span>
        );
      })}

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
          {winner.tagline && (
            <div className="v4-pdf-report-winner-tagline">
              <Quotes weight="fill" size={14} />
              <span>{winner.tagline}</span>
            </div>
          )}
          <div className="v4-pdf-report-winner-credit">
            <strong>{submitter?.name || 'A participant'}</strong> suggested it
            <span className="v4-pdf-report-winner-credit-sep">·</span>
            <strong>{winner.voteCount} of {stats.votes ?? 0} votes</strong>
          </div>
        </div>

        {/* Prize (if set) */}
        {prize?.enabled && (
          <div className="v4-pdf-report-prize">
            <Gift weight="duotone" size={16} />
            <span>
              <strong>{submitter?.name}</strong> wins{' '}
              <em>"{prize.name || 'the prize'}"</em>
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
          {remainingNames > 0 && (
            <div className="v4-pdf-report-names-more">
              + {remainingNames} more name{remainingNames === 1 ? '' : 's'}
              {' '}in the full contest
            </div>
          )}
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
