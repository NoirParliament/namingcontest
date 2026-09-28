// Renders the right input affordance for a brief question.
// Slice 1: text, textarea, chips.
// Slice 2: radioCards, numberChips, toggle, date.
// Deferred: colorPicker, fileUpload, repeater, toggleTextarea,
// toggleNameDesc, brandingBlock — these only appear in shared settings
// and will be handled in Slice 4.

import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight, ArrowLeft, CaretLeft, CaretRight, CalendarBlank,
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
import { VOTER_TIERS, DEFAULT_VOTER_TIER } from '../../data/v4/voterTiers';
import { readSetup, formatWindowDuration } from '../../utils/v4Brief';

const SEGMENT_ICONS = {
  Baby, PawPrint, House, PencilSimple,
  SoccerBall, MusicNote, Microphone, GraduationCap, GameController,
  Buildings, Package, Target, ArrowsClockwise,
};

// `currentAnswer` prefills the input when EDITING an existing answer (review
// recap, manage recap, chat edit). Without it every edit opened blank: text
// had to be retyped, and multi-select selections were silently dropped when
// the creator re-picked only one chip.
import CreatorIdentityInput from './CreatorIdentityInput';

export default function QuestionInput({ question, onSubmit, autoFocus = true, currentAnswer }) {
  const { type } = question;

  // Optional free-text questions get an explicit Skip affordance — the
  // "answer as many or as few as you'd like" promise needs a visible way
  // out, not just the secret empty-submit.
  if (type === 'text') {
    return (
      <>
        <TextInput question={question} onSubmit={onSubmit} autoFocus={autoFocus} currentAnswer={currentAnswer} />
        {!question.required && <SkipLink onSkip={() => onSubmit('')} />}
      </>
    );
  }
  if (type === 'textarea') {
    return (
      <>
        <TextareaInput question={question} onSubmit={onSubmit} autoFocus={autoFocus} currentAnswer={currentAnswer} />
        {!question.required && <SkipLink onSkip={() => onSubmit('')} />}
      </>
    );
  }
  if (type === 'chips')          return <ChipsInput question={question} onSubmit={onSubmit} currentAnswer={currentAnswer} />;
  if (type === 'multiChips')     return <MultiChipsInput question={question} onSubmit={onSubmit} currentAnswer={currentAnswer} />;
  if (type === 'radioCards')     return <RadioCardsInput question={question} onSubmit={onSubmit} />;
  if (type === 'numberChips')    return <NumberChipsInput question={question} onSubmit={onSubmit} currentAnswer={currentAnswer} />;
  if (type === 'contestSchedule') return <ContestScheduleInput question={question} onSubmit={onSubmit} />;
  if (type === 'voterTier')      return <VoterTierInput question={question} onSubmit={onSubmit} />;
  if (type === 'toggle')         return <ToggleInput question={question} onSubmit={onSubmit} />;
  if (type === 'date')           return <DateInput question={question} onSubmit={onSubmit} />;
  if (type === 'toggleTextarea') return <ToggleTextareaInput question={question} onSubmit={onSubmit} currentAnswer={currentAnswer} />;
  if (type === 'toggleNameDesc') return <ToggleNameDescInput question={question} onSubmit={onSubmit} currentAnswer={currentAnswer} />;
  if (type === 'brandingBlock')  return <BrandingBlockInput question={question} onSubmit={onSubmit} />;
  if (type === 'brandingFull')   return <BrandingFullInput question={question} onSubmit={onSubmit} />;
  if (type === 'segmentCards')   return <SegmentCardsInput question={question} onSubmit={onSubmit} />;
  if (type === 'creatorIdentity') return <CreatorIdentityInput question={question} onSubmit={onSubmit} currentAnswer={currentAnswer} />;

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
function TextInput({ question, onSubmit, autoFocus, currentAnswer }) {
  const [value, setValue] = useState(typeof currentAnswer === 'string' ? currentAnswer : '');
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
function TextareaInput({ question, onSubmit, autoFocus, currentAnswer }) {
  const [value, setValue] = useState(typeof currentAnswer === 'string' ? currentAnswer : '');
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
function ChipsInput({ question, onSubmit, currentAnswer }) {
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
          const active = (describing && value === describeOption) || (!describing && value === currentAnswer);
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
function MultiChipsInput({ question, onSubmit, currentAnswer }) {
  const opts = question.options || [];
  const norm = (opt) => (typeof opt === 'string' ? opt : (opt.label || opt.id));
  // Editing an existing answer starts from what's already selected — this
  // used to start empty, so re-picking one chip silently dropped the rest.
  const initial = Array.isArray(currentAnswer) ? currentAnswer : [];
  const [selected, setSelected] = useState(initial);
  // Custom-added options (question.allowCustom) — let people add their own
  // (e.g. "Shy / Timid") alongside the preset chips. Custom values already
  // in the answer are restored as chips so they survive an edit too.
  const [extra, setExtra] = useState(
    () => initial.filter((v) => !opts.map(norm).includes(v))
  );
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

  // Options may be plain strings or { label, eg } — `eg` carries the
  // examples that radioCards used to show as sublabels ("Lions, Hawks").
  // The stored value is always the label, so existing answers still match.
  const chips = [
    ...opts.map((o) => ({ value: norm(o), eg: (o && typeof o === 'object') ? o.eg : null })),
    ...extra.map((v) => ({ value: v, eg: null })),
  ];

  // Example-bearing option sets render as uniform full-width rows (the
  // examples make chips long and ragged when content-sized); plain string
  // sets stay compact inline pills. One rule, applied consistently.
  const hasEgs = opts.some((o) => o && typeof o === 'object' && o.eg);

  return (
    <form className="v4-multichips-block" onSubmit={handleSubmit}>
      <div
        className={`v4-chips-row${hasEgs ? ' v4-chips-row--stacked' : ''}`}
        role="group"
        aria-label={question.label}
      >
        {chips.map(({ value, eg }) => {
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
              {eg && <span className="v4-chip-eg">{eg}</span>}
            </button>
          );
        })}
      </div>
      {/* Custom entry is open by default on allowCustom questions: the
          "Add your own" field sits under the option cards so a picker can
          drop in a territory the presets miss without hunting for it. */}
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
function NumberChipsInput({ question, onSubmit, currentAnswer }) {
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
            className={`v4-chip v4-chip-number ${opt === currentAnswer ? 'is-checked' : ''} ${isDefault ? 'is-default' : ''}`}
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

// ── contestSchedule (roadmap + calendar) ────────────────────────────
// 2026-09-28 (client): "open a calendar to choose… the dates, like you do
// when you're booking a hotel", instead of picking a number of days.
// Launch is still the moment of payment. The owner taps two days on a
// calendar: the day names are due, then the day votes are due. The
// roadmap (Launch → Names due → Voting opens → Votes due → Winner) stays
// as the summary, now showing those real dates.
//
// Storage: { submissionEndsAt, votingEndsAt } (ISO, end of the chosen day
// in the owner's local time) PLUS the derived { submissionDays,
// votingDays }, so every reader that computes launched_at + days keeps
// working. confirm-launch prefers the dates and re-derives the day counts
// at the real launch moment, so both stay in step. Days only: the earliest
// pickable deadline is tomorrow (the hour-based sprint presets were dropped
// with the calendar; older hour drafts open rounded up to one day).
const MS_DAY = 86400000;
const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d; };
const endOfDay = (t) => { const d = new Date(t); d.setHours(23, 59, 0, 0); return d; };
const sameDay = (a, b) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const fmtDay = (d) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const fmtClock = (d) => d.toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

// Resolve the starting dates from whatever is stored: real dates if they
// are still ahead of us, else the day counts (a draft picked with the old
// chips, or one whose dates have passed), else the question's defaults.
function initialEnds(stored, question) {
  const now = Date.now();
  const parse = (s) => { const t = typeof s === 'string' ? Date.parse(s) : NaN; return Number.isFinite(t) && t > now ? new Date(t) : null; };
  let subEnd = parse(stored.submissionEndsAt);
  let voteEnd = parse(stored.votingEndsAt);
  if (!subEnd) {
    const days = Number(stored.submissionDays) > 0 ? Number(stored.submissionDays) : (question.subDefault ?? 5);
    subEnd = endOfDay(now + Math.max(1, Math.round(days)) * MS_DAY);
  }
  if (!voteEnd || voteEnd <= subEnd) {
    const days = Number(stored.votingDays) > 0 ? Number(stored.votingDays) : (question.voteDefault ?? 3);
    voteEnd = endOfDay(subEnd.getTime() + Math.max(1, Math.round(days)) * MS_DAY);
  }
  return { subEnd, voteEnd };
}

export function ContestScheduleInput({ question, onSubmit, mode = 'submit', onChange }) {
  const stored = readSetup()?.settings || {};
  const [{ subEnd, voteEnd }, setEnds] = useState(() => initialEnds(stored, question));
  const [editing, setEditing] = useState(false);
  // In the calendar: true after the first tap (names due picked, waiting
  // for the votes-due tap), so a second tap completes the range.
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  // Calendar month on screen; opens on the month names are due.
  const [month, setMonth] = useState(() => new Date(subEnd.getFullYear(), subEnd.getMonth(), 1));

  const payload = () => {
    const now = Date.now();
    const round = (n) => Math.round(n * 1000) / 1000;
    return {
      submissionDays: round((subEnd.getTime() - now) / MS_DAY),
      votingDays: round((voteEnd.getTime() - subEnd.getTime()) / MS_DAY),
      submissionEndsAt: subEnd.toISOString(),
      votingEndsAt: voteEnd.toISOString(),
    };
  };

  // Inline mode (review page): persist every complete change immediately;
  // the roadmap itself is the saved state.
  useEffect(() => {
    if (mode === 'inline' && subEnd && voteEnd) onChange?.(payload());
  }, [subEnd, voteEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  const today = startOfDay(Date.now());
  // Leg durations count calendar days (Sept 28 → Oct 3 is "5 days"), not
  // the exact end-of-day span, which would round up to 6. Same-day sprints
  // show hours.
  const calDays = (from, to) => Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_DAY);
  const spanLabel = (from, to) =>
    to.getTime() - from.getTime() < MS_DAY && sameDay(from, to)
      ? formatWindowDuration((to.getTime() - from.getTime()) / MS_DAY)
      : formatWindowDuration(Math.max(1, calDays(from, to)));
  const subDur = spanLabel(new Date(), subEnd);
  const voteDur = voteEnd ? spanLabel(subEnd, voteEnd) : '';
  const when = (d) => (d.getTime() - Date.now() < MS_DAY && sameDay(d, new Date()) ? fmtClock(d) : fmtDay(d));

  // ── Calendar view ───────────────────────────────────────────────────
  if (editing) {
    const pick = (day) => {
      if (!awaitingEnd || day <= startOfDay(subEnd)) {
        // First tap (or a tap at/before the current start): names due here.
        setEnds({ subEnd: endOfDay(day), voteEnd: null });
        setAwaitingEnd(true);
      } else {
        setEnds((s) => ({ subEnd: s.subEnd, voteEnd: endOfDay(day) }));
        setAwaitingEnd(false);
      }
    };
    const useRecommended = () => {
      const s = endOfDay(Date.now() + (question.subDefault ?? 5) * MS_DAY);
      setEnds({ subEnd: s, voteEnd: endOfDay(s.getTime() + (question.voteDefault ?? 3) * MS_DAY) });
      setAwaitingEnd(false);
    };

    // Month grid: leading blanks so the 1st lands on its weekday (Sunday first).
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells = [...Array(first.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
    const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);
    const canPrev = month > new Date(today.getFullYear(), today.getMonth(), 1);
    const canNext = month < maxMonth;
    const subDay = startOfDay(subEnd);
    const voteDay = voteEnd ? startOfDay(voteEnd) : null;

    return (
      <div className="v4-sched-block">
        <div className="v4-sched-picker-title">
          {awaitingEnd ? 'Now tap the day votes are due.' : 'Tap the day names are due, then the day votes are due.'}
        </div>
        <div className="v4-cal">
          <div className="v4-cal-head">
            <button type="button" className="v4-cal-nav" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} disabled={!canPrev} aria-label="Previous month">
              <CaretLeft weight="bold" size={14} />
            </button>
            <span className="v4-cal-month">{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
            <button type="button" className="v4-cal-nav" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} disabled={!canNext} aria-label="Next month">
              <CaretRight weight="bold" size={14} />
            </button>
          </div>
          <div className="v4-cal-grid" role="grid">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={`dow-${i}`} className="v4-cal-dow" aria-hidden="true">{d}</span>)}
            {cells.map((day, i) => {
              if (!day) return <span key={`blank-${i}`} className="v4-cal-day is-blank" />;
              const past = day <= today;
              const isStart = sameDay(day, subDay);
              const isEnd = !!voteDay && sameDay(day, voteDay);
              const inRange = !!voteDay && day > subDay && day < voteDay;
              const cls = ['v4-cal-day', past && 'is-past', sameDay(day, today) && 'is-today', isStart && 'is-start', isEnd && 'is-end', inRange && 'is-inrange', isStart && isEnd && 'is-single']
                .filter(Boolean).join(' ');
              return (
                <button key={day.toISOString()} type="button" className={cls} disabled={past} onClick={() => pick(day)}
                  aria-label={fmtDay(day)} aria-pressed={isStart || isEnd}>
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
        <div className="v4-cal-summary">
          <span><b>Names due</b> {when(subEnd)}</span>
          <span><b>Votes due</b> {voteEnd ? when(voteEnd) : 'tap a day'}</span>
        </div>
        <button type="button" className="v4-sched-rec-link" onClick={useRecommended}>
          Use recommended · {question.subDefault ?? 5} days of submissions, {question.voteDefault ?? 3} of voting
        </button>
        <div className="v4-multichips-footer">
          <button type="button" className="v4-sched-back" onClick={() => { if (voteEnd) { setEditing(false); setAwaitingEnd(false); } }} disabled={!voteEnd}>
            <ArrowLeft weight="bold" size={13} />
            Back to schedule
          </button>
          <button type="button" className="v4-multichips-submit" disabled={!voteEnd} onClick={() => { setEditing(false); setAwaitingEnd(false); }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── Roadmap view ────────────────────────────────────────────────────
  const Event = ({ label, when: w }) => (
    <div className="v4-sched-row">
      <span className="v4-sched-rail"><span className="v4-sched-dot" /></span>
      <span className="v4-sched-event">{label}</span>
      <span className="v4-sched-when">{w}</span>
    </div>
  );
  const Leg = ({ label, value, dur }) => (
    <div className="v4-sched-row">
      <span className="v4-sched-rail"><span className="v4-sched-line" /></span>
      <button type="button" className="v4-sched-leg" onClick={() => { setMonth(new Date(subEnd.getFullYear(), subEnd.getMonth(), 1)); setEditing(true); }}>
        <span className="v4-sched-leg-label">{label}</span>
        <span className="v4-sched-leg-value">
          {value}
          {dur && <span className="v4-sched-leg-dur">{dur}</span>}
          <CaretRight weight="bold" size={12} />
        </span>
      </button>
    </div>
  );

  return (
    <div className="v4-sched-block">
      {/* Four rows, each date shown once: the two pills carry the
          deadlines (Matt: "Launch / Names due" and "Voting opens / Votes
          due" repeated the same dates and read as confusing). */}
      <div className="v4-sched-steps">
        <Event label="Launch" when="When you pay" />
        <Leg label="Submissions open until" value={when(subEnd)} dur={subDur} />
        <Leg label="Voting open until" value={when(voteEnd)} dur={voteDur} />
        <Event label="Pick the winner" when="After voting closes" />
      </div>
      {mode === 'submit' && (
        <div className="v4-multichips-footer">
          <span className="v4-multichips-count">Tap a date to change it</span>
          <button type="submit" className="v4-multichips-submit" onClick={() => onSubmit(payload())}>
            Continue <ArrowRight weight="bold" size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── voterTier (the contest's voter-package + price) ─────────────────
// Three chips; returns the numeric voter count (15 | 30 | 60). Price is
// shown inline but derived from VOTER_TIERS so it stays one source.
function VoterTierInput({ question, onSubmit }) {
  // Price cards, not pills: this is the one question that IS a purchase.
  // No colored medallions — v4's voice is typography on white, so the
  // price stands as large ink serif over a muted capacity line, and the
  // default tier is set apart by its border + tag only.
  return (
    <div className="v4-tier-block">
      <div className="v4-tier-cards" role="radiogroup" aria-label={question.label}>
        {VOTER_TIERS.map((t) => {
          const popular = t.voters === DEFAULT_VOTER_TIER;
          return (
            <button
              key={t.voters}
              type="button"
              role="radio"
              aria-checked={false}
              className={`v4-tier-card ${popular ? 'is-popular' : ''}`}
              onClick={() => onSubmit(t.voters)}
            >
              {popular && <span className="v4-tier-card-tag">Most popular</span>}
              <span className="v4-tier-card-price">${t.price}</span>
              <span className="v4-tier-card-cap">
                <b>Up to {t.voters}</b>
                <span>participants</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="v4-tier-note">One payment per contest · no subscription</div>
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
