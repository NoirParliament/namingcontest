// Inline article opener for the brief chat.
// Shows a "📖 Read the guide" pill; tap to expand the full article body
// with sections + callouts. Article data shape per src/data/v4/briefQuestions.js
// ARTICLES export.

import { useState } from 'react';
import {
  BookOpen, CaretDown, CaretRight, X as CloseIcon,
  TextAa, Quotes, BookBookmark,
  Target, Compass, MagnifyingGlass,
  UsersThree, Heart, Hand,
  Clock, Hourglass, Tree,
  Trophy, SoccerBall, Lightning,
  Sparkle, PaintBrush, MusicNote,
  CheckCircle, ListChecks, Wrench,
  Lightbulb, ShieldWarning, ChatCircleText,
} from '@phosphor-icons/react';

// Map Phosphor icon names (string from data file) to component refs.
// Supports both casing variants Phosphor has used over versions.
const ICONS = {
  TextAa, Quotes, BookOpen, BookBookmark,
  Target, Compass, MagnifyingGlass,
  UsersThree, Heart, Hand,
  Clock, Hourglass, Tree,
  Trophy, SoccerBall, Lightning,
  Sparkle, PaintBrush, Paintbrush: PaintBrush, MusicNote,
  CheckCircle, ListChecks, Wrench,
};

// Callout kinds keep distinct icons + labels, but their accent colour now
// comes from the segment tone (var --guide-accent) so the guide reads as
// one coloured object instead of scattering unrelated hues (client
// feedback 2026-08-19: "random colors in guides not matching segment").
const CALLOUT_META = {
  insight: { Icon: Lightbulb,      label: 'Insight' },
  example: { Icon: ChatCircleText, label: 'Example' },
  warning: { Icon: ShieldWarning,  label: 'Heads up' },
};

export default function GuideExpandable({ article, compact = false, tone = null }) {
  const [open, setOpen] = useState(false);
  if (!article) return null;

  // Segment tone drives the callout's wash + accent so the guide reads as
  // an editorial aside in the contest's own colour, not a look-alike of the
  // white input/radio cards above it (client feedback 2026-08-19).
  const toneVars = tone
    ? { '--guide-tint': tone.bg, '--guide-accent': tone.fg }
    : undefined;

  const HeaderIcon = ICONS[article.icon] || BookOpen;
  const callout = article.callout;
  const calloutMeta = callout ? CALLOUT_META[callout.type] : null;
  // Authored teaser: the article's first section heading doubles as a
  // one-line takeaway, so the card reads as an editorial object (title +
  // what you'll get) instead of a second block of instructions after the
  // hint. Client feedback 2026-08-19: hint then guide-chip read as two
  // stacked "helpful things"; the card separates their jobs visually.
  const teaser = article.sections?.[0]?.heading || null;

  return (
    <div
      className={`v4-guide ${open ? 'is-open' : ''} ${compact ? 'v4-guide-compact' : ''}`}
      style={toneVars}
    >
      <button
        type="button"
        className="v4-guide-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="v4-guide-trigger-icon" aria-hidden="true">
          <HeaderIcon weight="duotone" size={compact ? 17 : 19} />
        </span>
        <span className="v4-guide-trigger-text">
          <span className="v4-guide-trigger-eyebrow">
            <BookOpen weight="fill" size={11} aria-hidden="true" />
            Guide · {article.readTime} read
          </span>
          <span className="v4-guide-trigger-title">{article.title}</span>
          {!compact && teaser && (
            <span className="v4-guide-trigger-teaser">{teaser}</span>
          )}
        </span>
        <span className="v4-guide-trigger-meta">
          <span className="v4-guide-trigger-cta">{open ? 'Hide' : 'Read'}</span>
          <span className="v4-guide-trigger-caret" aria-hidden="true">
            {open ? <CaretDown size={12} weight="bold" /> : <CaretRight size={12} weight="bold" />}
          </span>
        </span>
      </button>

      {open && (
        <div className="v4-guide-body">
          <div className="v4-guide-head">
            <span className="v4-guide-head-icon" aria-hidden="true">
              <HeaderIcon weight="duotone" size={20} />
            </span>
            <div className="v4-guide-head-text">
              <h3 className="v4-guide-title">{article.title}</h3>
              <span className="v4-guide-readtime">{article.readTime} read</span>
            </div>
          </div>

          {article.sections?.map((sec, i) => (
            <section key={i} className="v4-guide-section">
              <h4 className="v4-guide-section-head">{sec.heading}</h4>
              <p className="v4-guide-section-body">{sec.body}</p>
            </section>
          ))}

          {callout && calloutMeta && (
            <aside className="v4-guide-callout">
              <div className="v4-guide-callout-label">
                <calloutMeta.Icon weight="duotone" size={14} />
                <span>{calloutMeta.label}</span>
              </div>
              <p className="v4-guide-callout-quote">{callout.text}</p>
            </aside>
          )}

          <button
            type="button"
            className="v4-guide-close"
            onClick={() => setOpen(false)}
          >
            <CloseIcon weight="bold" size={14} />
            <span>Close guide</span>
          </button>
        </div>
      )}
    </div>
  );
}
