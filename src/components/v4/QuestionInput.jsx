// Renders the right input affordance for a brief question.
// Slice 1: text, textarea, chips.
// Slice 2: radioCards, numberChips, toggle, date.
// Deferred: colorPicker, fileUpload, repeater, toggleTextarea,
// toggleNameDesc, brandingBlock — these only appear in shared settings
// and will be handled in Slice 4.

import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight, CalendarBlank,
  // Sub-segment card icons (resolved by name from question.options[].icon)
  Baby, PawPrint, House, PencilSimple,
  SoccerBall, MusicNote, Microphone, GraduationCap, GameController,
  Buildings, Package, Target, ArrowsClockwise,
} from '@phosphor-icons/react';
import {
  ToggleTextareaInput,
  ToggleNameDescInput,
  BrandingBlockInput,
  BrandingFullInput,
  DeferLaunchInput,
} from './CompoundInputs';
import { VOTER_TIERS } from '../../data/v4/voterTiers';

const SEGMENT_ICONS = {
  Baby, PawPrint, House, PencilSimple,
  SoccerBall, MusicNote, Microphone, GraduationCap, GameController,
  Buildings, Package, Target, ArrowsClockwise,
};

export default function QuestionInput({ question, onSubmit, autoFocus = true }) {
  const { type } = question;

  if (type === 'text')           return <TextInput question={question} onSubmit={onSubmit} autoFocus={autoFocus} />;
  if (type === 'textarea')       return <TextareaInput question={question} onSubmit={onSubmit} autoFocus={autoFocus} />;
  if (type === 'chips')          return <ChipsInput question={question} onSubmit={onSubmit} />;
  if (type === 'multiChips')     return <MultiChipsInput question={question} onSubmit={onSubmit} />;
  if (type === 'radioCards')     return <RadioCardsInput question={question} onSubmit={onSubmit} />;
  if (type === 'numberChips')    return <NumberChipsInput question={question} onSubmit={onSubmit} />;
  if (type === 'voterTier')      return <VoterTierInput question={question} onSubmit={onSubmit} />;
  if (type === 'toggle')         return <ToggleInput question={question} onSubmit={onSubmit} />;
  if (type === 'date')           return <DateInput question={question} onSubmit={onSubmit} />;
  if (type === 'toggleTextarea') return <ToggleTextareaInput question={question} onSubmit={onSubmit} />;
  if (type === 'toggleNameDesc') return <ToggleNameDescInput question={question} onSubmit={onSubmit} />;
  if (type === 'brandingBlock')  return <BrandingBlockInput question={question} onSubmit={onSubmit} />;
  if (type === 'brandingFull')   return <BrandingFullInput question={question} onSubmit={onSubmit} />;
  if (type === 'segmentCards')   return <SegmentCardsInput question={question} onSubmit={onSubmit} />;

  // Heavy types not yet built — colorPicker, fileUpload, repeater
  return <DeferLaunchInput question={question} onSubmit={onSubmit} />;
}

// ── text (single line) ───────────────────────────────────────────────
function TextInput({ question, onSubmit, autoFocus }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  const trimmed = value.trim();
  const canSubmit = question.required ? trimmed.length >= 1 : true;

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    onSubmit(trimmed);
  };

  return (
    <form className="v4-input-row" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="v4-input"
        placeholder={question.placeholder || 'Type your answer…'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={200}
        aria-label={question.label}
      />
      <button
        type="submit"
        className="v4-input-submit"
        disabled={!canSubmit}
        aria-label="Continue"
      >
        <ArrowRight weight="bold" size={18} />
      </button>
    </form>
  );
}

// ── textarea (multi line) ────────────────────────────────────────────
function TextareaInput({ question, onSubmit, autoFocus }) {
  const [value, setValue] = useState('');
  const taRef = useRef(null);
  const trimmed = value.trim();
  const canSubmit = question.required ? trimmed.length >= 1 : true;
  const rows = question.rows || 3;

  useEffect(() => {
    if (autoFocus && taRef.current) taRef.current.focus();
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e) => {
    // Cmd/Ctrl+Enter submits; plain Enter inserts newline
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form className="v4-input-row v4-input-row-textarea" onSubmit={handleSubmit}>
      <textarea
        ref={taRef}
        className="v4-input v4-textarea"
        placeholder={question.placeholder || 'Type your answer…'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={rows}
        maxLength={1000}
        aria-label={question.label}
      />
      <button
        type="submit"
        className="v4-input-submit"
        disabled={!canSubmit}
        aria-label="Continue"
      >
        <ArrowRight weight="bold" size={18} />
      </button>
    </form>
  );
}

// ── chips (single-select pill list) ──────────────────────────────────
function ChipsInput({ question, onSubmit }) {
  const opts = question.options || [];

  const handlePick = (val) => {
    // For chips, the answer is the option value itself (a string)
    onSubmit(typeof val === 'string' ? val : val.label || val.id);
  };

  return (
    <div className="v4-chips-row" role="radiogroup" aria-label={question.label}>
      {opts.map((opt) => {
        const value = typeof opt === 'string' ? opt : (opt.label || opt.id);
        const label = typeof opt === 'string' ? opt : (opt.label || opt.id);
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={false}
            className="v4-chip"
            onClick={() => handlePick(value)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── multiChips (multi-select pill list — needs Continue button) ─────
function MultiChipsInput({ question, onSubmit }) {
  const opts = question.options || [];
  const [selected, setSelected] = useState([]);

  const toggle = (val) => {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (selected.length === 0) return;
    onSubmit(selected);
  };

  return (
    <form className="v4-multichips-block" onSubmit={handleSubmit}>
      <div className="v4-chips-row" role="group" aria-label={question.label}>
        {opts.map((opt) => {
          const value = typeof opt === 'string' ? opt : (opt.label || opt.id);
          const label = typeof opt === 'string' ? opt : (opt.label || opt.id);
          const isOn = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              role="checkbox"
              aria-checked={isOn}
              className={`v4-chip ${isOn ? 'is-checked' : ''}`}
              onClick={() => toggle(value)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="v4-multichips-footer">
        <span className="v4-multichips-count">
          {selected.length === 0
            ? 'Pick one or more'
            : `${selected.length} selected`}
        </span>
        <button
          type="submit"
          className="v4-multichips-submit"
          disabled={selected.length === 0}
        >
          Continue <ArrowRight weight="bold" size={14} />
        </button>
      </div>
    </form>
  );
}

// ── radioCards (label + sublabel cards, single-select) ──────────────
function RadioCardsInput({ question, onSubmit }) {
  const opts = question.options || [];
  return (
    <div className="v4-radiocards" role="radiogroup" aria-label={question.label}>
      {opts.map((opt) => {
        const id = typeof opt === 'string' ? opt : opt.id;
        const label = typeof opt === 'string' ? opt : opt.label;
        const sublabel = typeof opt === 'object' ? opt.sublabel : null;
        const recommended = typeof opt === 'object' ? opt.recommended : false;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={false}
            className="v4-radiocard"
            onClick={() => onSubmit(label)}
          >
            <div className="v4-radiocard-text">
              <div className="v4-radiocard-label">
                {label}
                {recommended && <span className="v4-radiocard-rec">Recommended</span>}
              </div>
              {sublabel && <div className="v4-radiocard-sub">{sublabel}</div>}
            </div>
            <span className="v4-choice-arrow" aria-hidden="true">→</span>
          </button>
        );
      })}
    </div>
  );
}

// ── numberChips (numeric chip select — submission limit, voting days) ─
function NumberChipsInput({ question, onSubmit }) {
  const opts = question.options || [];
  const defaultVal = question.defaultValue;
  return (
    <div className="v4-chips-row v4-number-chips" role="radiogroup" aria-label={question.label}>
      {opts.map((opt) => {
        const label = String(opt);
        const isDefault = opt === defaultVal;
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={false}
            className={`v4-chip v4-chip-number ${isDefault ? 'is-default' : ''}`}
            onClick={() => onSubmit(opt)}
          >
            {label}
            {isDefault && <span className="v4-chip-tag">Recommended</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── voterTier (the contest's voter-package + price) ─────────────────
// Three chips; returns the numeric voter count (15 | 30 | 60). Price is
// shown inline but derived from VOTER_TIERS so it stays one source.
function VoterTierInput({ question, onSubmit }) {
  return (
    <div className="v4-chips-row v4-number-chips" role="radiogroup" aria-label={question.label}>
      {VOTER_TIERS.map((t) => (
        <button
          key={t.voters}
          type="button"
          role="radio"
          aria-checked={false}
          className="v4-chip"
          onClick={() => onSubmit(t.voters)}
        >
          Up to {t.voters} voters · ${t.price}
        </button>
      ))}
    </div>
  );
}

// ── toggle (Yes / No) ───────────────────────────────────────────────
function ToggleInput({ question, onSubmit }) {
  const defaultOn = question.defaultValue !== false;
  return (
    <div className="v4-chips-row" role="radiogroup" aria-label={question.label}>
      <button
        type="button"
        role="radio"
        aria-checked={false}
        className={`v4-chip ${defaultOn ? 'is-default' : ''}`}
        onClick={() => onSubmit(true)}
      >
        Yes
        {defaultOn && <span className="v4-chip-tag">Recommended</span>}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={false}
        className={`v4-chip ${!defaultOn ? 'is-default' : ''}`}
        onClick={() => onSubmit(false)}
      >
        No
        {!defaultOn && <span className="v4-chip-tag">Recommended</span>}
      </button>
    </div>
  );
}

// ── date (date picker + quick-pick chips) ───────────────────────────
function DateInput({ question, onSubmit }) {
  const defaultDays = question.suggestedDeadlineDays || 10;
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  // Compute the date N days from today as a YYYY-MM-DD string
  const dateFromOffset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const quickPicks = [
    { label: '+5 days', days: 5 },
    { label: '+10 days', days: defaultDays },
    { label: '+14 days', days: 14 },
  ];

  const handleQuickPick = (days) => {
    const iso = dateFromOffset(days);
    setValue(iso);
    onSubmit(iso);
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!value) return;
    onSubmit(value);
  };

  return (
    <div className="v4-date-block">
      <div className="v4-chips-row" role="group" aria-label="Quick pick">
        {quickPicks.map((q) => (
          <button
            key={q.days}
            type="button"
            className="v4-chip"
            onClick={() => handleQuickPick(q.days)}
          >
            {q.label}
          </button>
        ))}
      </div>
      <form className="v4-input-row v4-date-row" onSubmit={handleSubmit}>
        <span className="v4-input-icon" aria-hidden="true">
          <CalendarBlank weight="duotone" size={20} />
        </span>
        <input
          ref={inputRef}
          type="date"
          className="v4-input v4-input-date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min={dateFromOffset(1)}
          aria-label={question.label}
        />
        <button
          type="submit"
          className="v4-input-submit"
          disabled={!value}
          aria-label="Continue"
        >
          <ArrowRight weight="bold" size={18} />
        </button>
      </form>
    </div>
  );
}

// ── segmentCards (sub-segment pick — pastel icon + title + body) ────
// Reuses the .v4-choice pattern from PickSubSegment so the visuals are
// identical to what was on the old standalone screen.
function SegmentCardsInput({ question, onSubmit }) {
  const opts = question.options || [];
  return (
    <div className="v4-choices" role="radiogroup" aria-label={question.label || 'Choose'}>
      {opts.map((opt, i) => {
        const Icon = SEGMENT_ICONS[opt.icon] || PencilSimple;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={false}
            className="v4-choice"
            onClick={() => onSubmit(opt)}
          >
            <span
              className="v4-choice-icon"
              style={{
                background: opt.tone.bg,
                color: opt.tone.fg,
                animationDelay: `${-i * 0.4}s`,
              }}
              aria-hidden="true"
            >
              <Icon weight="duotone" size={28} />
            </span>
            <div className="v4-choice-text">
              <div className="v4-choice-title">{opt.title}</div>
              <div className="v4-choice-body">{opt.body}</div>
            </div>
            <span className="v4-choice-arrow" aria-hidden="true">→</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Not-implemented fallback ────────────────────────────────────────
function NotImplementedSkip({ type, onSubmit }) {
  return (
    <div className="v4-input-skip">
      <span className="v4-input-skip-note">
        <code>{type}</code> input not yet implemented (Slice 2).
      </span>
      <button
        type="button"
        className="v4-chip"
        onClick={() => onSubmit('[skipped]')}
      >
        Skip for now
      </button>
    </div>
  );
}
