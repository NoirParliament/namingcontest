// Renders the right input affordance for a brief question.
// Slice 1: text, textarea, chips.
// Slice 2: radioCards, numberChips, toggle, date.
// Deferred: colorPicker, fileUpload, repeater, toggleTextarea,
// toggleNameDesc, brandingBlock — these only appear in shared settings
// and will be handled in Slice 4.

import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight, ArrowLeft, CaretRight, CalendarBlank,
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
import { readSetup, formatWindowDuration } from '../../utils/v4Brief';

const SEGMENT_ICONS = {
  Baby, PawPrint, House, PencilSimple,
  SoccerBall, MusicNote, Microphone, GraduationCap, GameController,
  Buildings, Package, Target, ArrowsClockwise,
};

export default function QuestionInput({ question, onSubmit, autoFocus = true }) {
  const { type } = question;

  // Optional free-text questions get an explicit Skip affordance — the
  // "answer as many or as few as you'd like" promise needs a visible way
  // out, not just the secret empty-submit.
  if (type === 'text') {
    return (
      <>
        <TextInput question={question} onSubmit={onSubmit} autoFocus={autoFocus} />
        {!question.required && <SkipLink onSkip={() => onSubmit('')} />}
      </>
    );
  }
  if (type === 'textarea') {
    return (
      <>
        <TextareaInput question={question} onSubmit={onSubmit} autoFocus={autoFocus} />
        {!question.required && <SkipLink onSkip={() => onSubmit('')} />}
      </>
    );
  }
  if (type === 'chips')          return <ChipsInput question={question} onSubmit={onSubmit} />;
  if (type === 'multiChips')     return <MultiChipsInput question={question} onSubmit={onSubmit} />;
  if (type === 'radioCards')     return <RadioCardsInput question={question} onSubmit={onSubmit} />;
  if (type === 'numberChips')    return <NumberChipsInput question={question} onSubmit={onSubmit} />;
  if (type === 'contestSchedule') return <ContestScheduleInput question={question} onSubmit={onSubmit} />;
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

// ── Skip link — shown under optional free-text inputs ───────────────
function SkipLink({ onSkip }) {
  return (
    <button type="button" className="v4-input-skip-link" onClick={onSkip}>
      Skip this question
    </button>
  );
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
  // An option can reveal a follow-up text field (e.g. "Specific language"
  // → type which one) via question.describeOption. Picking it shows the
  // input instead of submitting; the typed text becomes the answer.
  const describeOption = question.describeOption;
  const [describing, setDescribing] = useState(false);
  const [describeValue, setDescribeValue] = useState('');

  const handlePick = (val) => {
    if (describeOption && val === describeOption) {
      setDescribing(true);
      return;
    }
    // For chips, the answer is the option value itself (a string)
    onSubmit(typeof val === 'string' ? val : val.label || val.id);
  };

  const submitDescribe = (e) => {
    e?.preventDefault?.();
    const t = describeValue.trim();
    if (t) onSubmit(t);
  };

  return (
    <div className="v4-chips-block">
      <div className="v4-chips-row" role="radiogroup" aria-label={question.label}>
        {opts.map((opt) => {
          const value = typeof opt === 'string' ? opt : (opt.label || opt.id);
          const label = typeof opt === 'string' ? opt : (opt.label || opt.id);
          const active = describing && value === describeOption;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              className={`v4-chip ${active ? 'is-checked' : ''}`}
              onClick={() => handlePick(value)}
            >
              {label}
            </button>
          );
        })}
      </div>
      {describing && (
        <form className="v4-chips-custom-row" style={{ display: 'flex', gap: 8, marginTop: 10 }} onSubmit={submitDescribe}>
          <input
            type="text"
            className="v4-input"
            value={describeValue}
            onChange={(e) => setDescribeValue(e.target.value)}
            placeholder={question.describePlaceholder || 'Type your answer…'}
            aria-label={question.label}
            autoFocus
            style={{ flex: 1 }}
          />
          <button type="submit" className="v4-input-submit" disabled={!describeValue.trim()} aria-label="Continue">
            <ArrowRight weight="bold" size={18} />
          </button>
        </form>
      )}
    </div>
  );
}

// ── multiChips (multi-select pill list — needs Continue button) ─────
function MultiChipsInput({ question, onSubmit }) {
  const opts = question.options || [];
  const norm = (opt) => (typeof opt === 'string' ? opt : (opt.label || opt.id));
  const [selected, setSelected] = useState([]);
  // Custom-added options (question.allowCustom) — let people add their own
  // (e.g. "Shy / Timid") alongside the preset chips.
  const [extra, setExtra] = useState([]);
  const [customText, setCustomText] = useState('');

  const toggle = (val) => {
    setSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  const addCustom = () => {
    const v = customText.trim();
    if (!v) return;
    if (![...opts.map(norm), ...extra].includes(v)) setExtra((e) => [...e, v]);
    setSelected((s) => (s.includes(v) ? s : [...s, v]));
    setCustomText('');
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (selected.length === 0) return;
    onSubmit(selected);
  };

  const chips = [...opts.map(norm), ...extra];

  return (
    <form className="v4-multichips-block" onSubmit={handleSubmit}>
      <div className="v4-chips-row" role="group" aria-label={question.label}>
        {chips.map((value) => {
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
              {value}
            </button>
          );
        })}
      </div>
      {question.allowCustom && (
        <div className="v4-chips-custom-row" style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            type="text"
            className="v4-input"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            placeholder="Add your own…"
            aria-label="Add your own option"
            style={{ flex: 1 }}
          />
          <button type="button" className="v4-chip" onClick={addCustom} disabled={!customText.trim()}>
            Add
          </button>
        </div>
      )}
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

// ── contestSchedule (one roadmap for both windows) ──────────────────
// A vertical stepper of the whole contest — Launch → Submissions →
// Names in → Voting → Winner — with as-if-launched-today dates. Tapping
// a leg swaps to a focused picker (day chips per the client's options,
// plus 3/6/12h same-day presets stored as day fractions); picking
// returns to the roadmap. Continue submits BOTH values at once as
// { submissionDays, votingDays }.
function ContestScheduleInput({ question, onSubmit }) {
  // Prefill from anything already stored (editing from review/manage).
  const stored = readSetup()?.settings || {};
  const [sub, setSub] = useState(
    Number(stored.submissionDays) > 0 ? Number(stored.submissionDays) : (question.subDefault ?? 5)
  );
  const [vote, setVote] = useState(
    Number(stored.votingDays) > 0 ? Number(stored.votingDays) : (question.voteDefault ?? 3)
  );
  const [editing, setEditing] = useState(null); // null | 'submission' | 'voting'

  const DAY = 86400000;
  const now = Date.now();
  const subEnd = now + sub * DAY;
  const voteEnd = now + (sub + vote) * DAY;
  const fmtWhen = (t, hourLevel) =>
    hourLevel
      ? new Date(t).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })
      : new Date(t).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  // ── Picker view — one slider over one standardized scale ───────────
  // Stops run from a 3-hour sprint to 10 days (hours as day fractions);
  // the SAME scale serves both stages, only the recommendation differs.
  const stops = [
    ...(question.hourOptions || []).map((h) => h / 24),
    ...(question.dayOptions || []),
  ];
  if (editing) {
    const isSub = editing === 'submission';
    const value = isSub ? sub : vote;
    const setValue = isSub ? setSub : setVote;
    const def = isSub ? question.subDefault : question.voteDefault;
    const idx = Math.max(0, stops.findIndex((x) => x === value));
    return (
      <div className="v4-sched-block">
        <div className="v4-sched-picker-title">
          {isSub ? 'How long should submissions stay open?' : 'How long should voting stay open?'}
        </div>
        <div className="v4-sched-picker-value">
          {formatWindowDuration(value)}
          {value === def && <span className="v4-sched-picker-rec">Recommended</span>}
        </div>
        <input
          type="range"
          className="v4-sched-slider"
          min={0}
          max={stops.length - 1}
          step={1}
          value={idx}
          onChange={(e) => setValue(stops[Number(e.target.value)])}
          aria-label={isSub ? 'Submission window' : 'Voting window'}
          aria-valuetext={formatWindowDuration(value)}
        />
        <div className="v4-sched-slider-scale">
          <span>{formatWindowDuration(stops[0])}</span>
          <span>{formatWindowDuration(stops[stops.length - 1])}</span>
        </div>
        {value !== def && (
          <button type="button" className="v4-sched-rec-link" onClick={() => setValue(def)}>
            Use recommended · {formatWindowDuration(def)}
          </button>
        )}
        <div className="v4-multichips-footer">
          <button type="button" className="v4-sched-back" onClick={() => setEditing(null)}>
            <ArrowLeft weight="bold" size={13} />
            Back to schedule
          </button>
          <button type="button" className="v4-multichips-submit" onClick={() => setEditing(null)}>
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── Roadmap view ────────────────────────────────────────────────────
  const Event = ({ label, when }) => (
    <div className="v4-sched-row">
      <span className="v4-sched-rail"><span className="v4-sched-dot" /></span>
      <span className="v4-sched-event">{label}</span>
      <span className="v4-sched-when">{when}</span>
    </div>
  );
  const Leg = ({ label, value, onClick }) => (
    <div className="v4-sched-row">
      <span className="v4-sched-rail"><span className="v4-sched-line" /></span>
      <button type="button" className="v4-sched-leg" onClick={onClick}>
        <span className="v4-sched-leg-label">{label}</span>
        <span className="v4-sched-leg-value">
          {formatWindowDuration(value)}
          <CaretRight weight="bold" size={12} />
        </span>
      </button>
    </div>
  );

  return (
    <div className="v4-sched-block">
      <span className="v4-sched-note">If you launch today</span>
      <div className="v4-sched-steps">
        <Event label="Launch" when="Today" />
        <Leg label="Submissions open" value={sub} onClick={() => setEditing('submission')} />
        <Event label="Names are in" when={fmtWhen(subEnd, sub < 1)} />
        <Leg label="Voting opens" value={vote} onClick={() => setEditing('voting')} />
        <Event label="Pick the winner" when={fmtWhen(voteEnd, sub + vote < 1)} />
      </div>
      <div className="v4-multichips-footer">
        <span className="v4-multichips-count">Tap a stage to change it</span>
        <button
          type="submit"
          className="v4-multichips-submit"
          onClick={() => onSubmit({ submissionDays: sub, votingDays: vote })}
        >
          Continue <ArrowRight weight="bold" size={14} />
        </button>
      </div>
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
          Up to {t.voters} participants · ${t.price}
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
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  // Compute the date N days from today as a YYYY-MM-DD string
  const dateFromOffset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!value) return;
    onSubmit(value);
  };

  return (
    <div className="v4-date-block">
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
