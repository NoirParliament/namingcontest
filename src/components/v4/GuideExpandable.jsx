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

// Pull-quote tones — left border accent in the segment's pastel hue
const CALLOUT_META = {
  insight: { accent: '#b25620', Icon: Lightbulb,      label: 'Insight' },
  example: { accent: '#3f8850', Icon: ChatCircleText, label: 'Example' },
  warning: { accent: '#8a6a14', Icon: ShieldWarning,  label: 'Heads up' },
};

export default function GuideExpandable({ article, compact = false }) {
  const [open, setOpen] = useState(false);
  if (!article) return null;

  const HeaderIcon = ICONS[article.icon] || BookOpen;
  const callout = article.callout;
  const calloutMeta = callout ? CALLOUT_META[callout.type] : null;

  return (
    <div className={`v4-guide ${open ? 'is-open' : ''} ${compact ? 'v4-guide-compact' : ''}`}>
      <button
        type="button"
        className="v4-guide-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="v4-guide-trigger-icon" aria-hidden="true">
          <BookOpen weight="duotone" size={16} />
        </span>
        <span className="v4-guide-trigger-text">
          {open ? 'Hide guide' : 'Read the guide'}
          <span className="v4-guide-trigger-title"> · {article.title}</span>
        </span>
        <span className="v4-guide-trigger-meta">
          {article.readTime}
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
            <aside
              className="v4-guide-callout"
              style={{ borderLeftColor: calloutMeta.accent }}
            >
              <div className="v4-guide-callout-label" style={{ color: calloutMeta.accent }}>
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
