// V4 unified setup chat — walks the user through:
//   1. Working name (replaces the old SetupName screen)
//   2. Sub-segment-specific brief questions
//   3. Section-break narrator bubble
//   4. Shared settings questions
//
// All on one URL (/v4/setup/brief) so the chat reads as a single continuous
// conversation. Finishes by navigating to /v4/setup/review.
//
// Features:
//   - Per-question phase reveal (typing dots → prompt → hint + guide → input)
//   - History accumulates above; older bubbles fade via CSS for focus
//   - Edit-in-place: tap any prior user-reply bubble to revise that answer
//     (no cascade — subsequent answers preserved)
//
// Persistence shape in localStorage `v4_contest_setup`:
//   { group, subSegmentId, workingName, brief: {...}, settings: {...} }

import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X, PencilSimple,
  // Segment user-reply icons (mirrors the picked card)
  Baby, PawPrint, House, SoccerBall, MusicNote, Microphone,
  GraduationCap, GameController, Buildings, Package, Target, ArrowsClockwise,
  // Used only inside the section-break divider badge
  Confetti,
} from '@phosphor-icons/react';
import { SegmentThemeBackdrop } from '../../data/v4/segmentTheme';


import namingContestLogo from "../../assets/namingcontestlogo-cropped.svg";


// Phosphor icon name (string from data file) → component map.
// Used by the segment user-reply bubble to mirror the icon from the card.
const SEGMENT_ICONS = {
  Baby, PawPrint, House, PencilSimple,
  SoccerBall, MusicNote, Microphone, GraduationCap, GameController,
  Buildings, Package, Target, ArrowsClockwise,
};
import {
  readSetup,
  writeSetup,
  getQuestionsFor,
  getArticleFor,
  getSegmentLabel,
} from '../../utils/v4Brief';
import { SHARED_SETTINGS_QUESTIONS } from '../../data/v4/briefQuestions';
import { SUB_SEGMENTS } from '../../data/v4/subSegments';
import GuideExpandable from '../../components/v4/GuideExpandable';
import QuestionInput from '../../components/v4/QuestionInput';
import AuthModal from '../../components/v4/AuthModal';
import '../../styles/v4.css';

// Per-question reveal timings (ms from when this question becomes current)
const Q_PHASE_TIMINGS = [
  { phase: 1, at: 350 },   // prompt bubble
  { phase: 2, at: 750 },   // hint + guide
  { phase: 3, at: 1050 },  // input shows
];
const POST_SUBMIT_DELAY = 1100; // hold user-reply bubble before advancing
const NARRATOR_HOLD = 1500;     // narrator section break visible duration

// Build the sub-segment pick question — shown first when no subId yet
function makeSubSegmentQuestion(group) {
  const segment = SUB_SEGMENTS[group];
  if (!segment) return null;
  return {
    id: 'subSegment',
    section: 'segment',
    type: 'segmentCards',
    label: 'Which kind of naming',
    prompt: `Let's set up your ${segment.label} contest. First — which kind of naming is this?`,
    options: segment.options,
  };
}

// Build the synthetic working-name question
function makeWorkingNameQuestion(subSegmentTitle) {
  const subtle = subSegmentTitle ? ` for ${subSegmentTitle.toLowerCase()}` : '';
  return {
    id: 'workingName',
    section: 'working',
    type: 'text',
    label: 'Working name',
    prompt: `Got it. What should we call this contest${subtle}?`,
    placeholder: 'A short working title (e.g. "Olly the puppy")',
    required: true,
    maxLength: 60,
  };
}

// The section divider that separates brief from settings.
// Short label only — the divider style fits in a small badge.
const SECTION_BREAK = {
  id: '_sectionBreak',
  section: '_meta',
  type: 'narrator',
  prompt: 'A few quick settings',
};

// Display helper for compound answers
function answerToDisplay(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value === '[configure-later]') return 'Configure after launch';
  // Multi-select chips → array of strings
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    if (value.length <= 3) return value.join(' · ');
    return `${value.slice(0, 2).join(' · ')} +${value.length - 2} more`;
  }
  if (value && typeof value === 'object') {
    if ('enabled' in value) {
      if (!value.enabled) return 'No, skip';
      // brandingFull
      if ('primaryColor' in value) {
        const parts = [];
        if (value.logo) parts.push(`Logo: ${value.logo.name}`);
        parts.push(`Colors: ${value.primaryColor}, ${value.accentColor}`);
        return parts.join(' · ');
      }
      if (value.text) return value.text;
      if (value.name) return value.name;
      if (value.configureAfterLaunch) return 'Yes — set up after launch';
      return 'Yes';
    }
  }
  return String(value);
}

// Persist a single answer to the right localStorage path based on section
function persistAnswer(question, value) {
  const current = readSetup();
  if (question.section === 'segment') {
    // value is the picked option object from segmentCards
    return writeSetup({
      subSegmentId: value.id,
      subSegmentTitle: value.title,
    });
  }
  if (question.section === 'working') {
    return writeSetup({ workingName: value });
  }
  if (question.section === 'brief') {
    return writeSetup({ brief: { ...(current.brief || {}), [question.id]: value } });
  }
  if (question.section === 'settings') {
    return writeSetup({ settings: { ...(current.settings || {}), [question.id]: value } });
  }
  return current;
}

export default function BriefChat() {
  const navigate = useNavigate();
  // Read group + sub-segment from localStorage on mount. The flow:
  //   - If user reached here from /v4/pick, only `group` is set → first
  //     question becomes sub-segment pick.
  //   - If subSegmentId is already set (resume / direct nav), skip the pick.
  const initial = useMemo(() => readSetup(), []);
  const [subId, setSubId] = useState(initial.subSegmentId || null);
  const segmentLabel = subId ? getSegmentLabel(subId) : null;

  // Build the unified question list. Sub-segment pick is always index 0.
  // When subId is null, that's the only entry. Once a sub-segment is picked,
  // working name + brief + settings get appended so the index of the
  // sub-segment pick stays stable.
  const questions = useMemo(() => {
    const list = [];
    const subQ = makeSubSegmentQuestion(initial.group);
    if (subQ) list.push(subQ);

    if (!subId) return list;

    const segment = SUB_SEGMENTS[initial.group];
    const pickedOption = segment?.options.find((o) => o.id === subId);
    list.push(makeWorkingNameQuestion(pickedOption?.title));

    const brief = getQuestionsFor(subId, null).map((q) => ({ ...q, section: 'brief' }));
    const settings = SHARED_SETTINGS_QUESTIONS.map((q) => ({ ...q, section: 'settings' }));
    list.push(...brief, SECTION_BREAK, ...settings);
    return list;
  }, [subId, initial]);

  const [history, setHistory] = useState([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [userReply, setUserReply] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  const currentQ = questions[idx];
  const currentArticle = currentQ && subId ? getArticleFor(subId, currentQ.guideId) : null;
  const isDone = subId !== null && idx >= questions.length;
  const isEditing = editingIndex !== null;

  // "X/Y" counter — counts every step including the tier pick that
  // happened on the previous screen (which was step 1). So segment pick
  // here = step 2, working name = step 3, etc.
  // Before segment is picked, the question list only has the segment-pick
  // question, so total isn't yet accurate — fall back to APPROX_TOTAL
  // (matches PickTier's 1/16 estimate so transition isn't jarring).
  const TIER_PICK_OFFSET = 1;
  const APPROX_TOTAL = 16;
  const realQuestions = questions.filter((q) => q.type !== 'narrator');
  const realTotal = subId
    ? realQuestions.length + TIER_PICK_OFFSET
    : APPROX_TOTAL;
  let realCurrent;
  if (isDone) {
    realCurrent = realTotal;
  } else if (currentQ?.type === 'narrator') {
    const prevReal = questions.slice(0, idx).filter(
      (q) => q.type !== 'narrator'
    ).length;
    realCurrent = Math.max(1, prevReal) + TIER_PICK_OFFSET;
  } else {
    const inRealList = realQuestions.findIndex((q) => q.id === currentQ?.id);
    realCurrent = Math.max(1, inRealList + 1) + TIER_PICK_OFFSET;
  }

  // Drive the per-question reveal phases. For narrator bubbles, skip straight
  // to phase 1 (no input shown) and auto-advance after NARRATOR_HOLD.
  useEffect(() => {
    if (isDone || isEditing) return;
    setPhase(0);
    setUserReply(null);

    if (currentQ?.type === 'narrator') {
      const t1 = setTimeout(() => setPhase(1), 350);
      const t2 = setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          { question: currentQ, answer: null, display: null, article: null },
        ]);
        setIdx((i) => i + 1);
      }, NARRATOR_HOLD);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }

    const timers = Q_PHASE_TIMINGS.map(({ phase: p, at }) =>
      setTimeout(() => setPhase(p), at)
    );
    return () => timers.forEach(clearTimeout);
  }, [idx, isDone, isEditing, currentQ]);

  // Auto-scroll the chat container (option B: internal scroll, not window).
  // Skip during edit to keep view stable while user is typing.
  const chatRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (isEditing) return;
    const el = chatRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [phase, history.length, userReply, isEditing]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const handler = () => setIsScrolled(el.scrollTop > 8);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  // Normal-flow submission — advance to next question.
  // Sub-segment pick is special: after submit, set subId so the questions
  // memo rebuilds with the full brief + settings list, then reset idx to 1
  // (we leave the sub-segment pick as the first history entry).
  const handleSubmit = (value) => {
    if (!currentQ) return;
    persistAnswer(currentQ, value);

    if (currentQ.section === 'segment') {
      // value is the picked option object — keep it raw for icon rendering
      setUserReply(value);
      setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          {
            question: currentQ,
            answer: value,
            display: value.title || value.id || 'Selected',
            article: null,
          },
        ]);
        setSubId(value.id);
        setIdx(1); // sub-segment is now in history; next question (workingName) is index 1
        // Clear in the same batch so the next question's CurrentQuestion
        // doesn't render with the stale reply for one frame.
        setUserReply(null);
        setPhase(0);
      }, POST_SUBMIT_DELAY);
      return;
    }

    const display = answerToDisplay(value);
    setUserReply(display);
    setTimeout(() => {
      setHistory((prev) => [
        ...prev,
        { question: currentQ, answer: value, display, article: currentArticle },
      ]);
      setIdx((i) => i + 1);
      // Clear in the same batch — see comment above.
      setUserReply(null);
      setPhase(0);
    }, POST_SUBMIT_DELAY);
  };

  // Edit submission — update history entry in place, return to normal flow.
  // SPECIAL CASE: editing the sub-segment pick cascades because every brief
  // question after it depends on the segment. We confirm and then reset all
  // downstream answers + history, returning the user to the workingName step.
  const handleEditSubmit = (value) => {
    const i = editingIndex;
    if (i === null) return;
    const turn = history[i];

    if (turn.question.section === 'segment') {
      // No-op if user picked the same segment they already had
      const newId = value?.id;
      if (newId && newId === subId) {
        setEditingIndex(null);
        return;
      }
      const ok = window.confirm(
        "Changing the naming type will clear your brief answers (you'll need to answer them again). Continue?"
      );
      if (!ok) {
        setEditingIndex(null);
        return;
      }
      // Persist new segment + clear downstream answers in localStorage
      persistAnswer(turn.question, value);
      const cur = readSetup();
      writeSetup({ ...cur, brief: {}, settings: {}, workingName: '' });
      // Truncate history to just the (updated) segment turn
      setHistory([{
        ...turn,
        answer: value,
        display: value.title || value.id || 'Selected',
      }]);
      // Rebuild downstream by re-setting subId; idx jumps to first post-pick Q
      setSubId(newId);
      setIdx(1);
      setEditingIndex(null);
      return;
    }

    // Standard edit — update this single entry, no cascade
    persistAnswer(turn.question, value);
    setHistory((prev) => {
      const next = [...prev];
      next[i] = {
        ...turn,
        answer: value,
        display: answerToDisplay(value),
      };
      return next;
    });
    setEditingIndex(null);
  };

  const startEditing = (i) => {
    const q = history[i]?.question;
    // Don't allow editing narrator entries (section break system bubbles)
    if (q?.type === 'narrator') return;
    setEditingIndex(i);
  };

  const cancelEditing = () => setEditingIndex(null);

  // After every question answered, head to review
  useEffect(() => {
    if (isDone && history.length > 0 && !isEditing) {
      const t = setTimeout(() => navigate('/v4/setup/review'), 1400);
      return () => clearTimeout(t);
    }
  }, [isDone, history.length, isEditing, navigate]);

  return (
    <div className="v4">
      <div className="v4-screen">
        {/* Per-segment theme decoration (blobs + icons + illustrations).
            Carries from setup → live so the contest keeps its identity. */}
        <SegmentThemeBackdrop subId={subId} />

        <main className="v4-chat" role="main" ref={chatRef}>
          {/* Glass nav — sticky inside the chat scroll container so
              chat content slides UNDER it as user scrolls. */}
          <header className={`v4-nav ${isScrolled ? 'is-scrolled' : ''}`}>
          <Link to="/" className="v4-brand">
            <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
          </Link>
          {(() => {
            // Active dot based on current section
            const inSettings =
              isDone ||
              currentQ?.section === 'settings' ||
              currentQ?.section === '_meta';
            return (
              <div className="v4-progress">
                <span className={`v4-step-dot ${!inSettings ? 'is-active' : 'is-done'}`}></span>
                <span className={`v4-step-dot ${inSettings ? 'is-active' : ''}`}></span>
                <span className="v4-step-dot"></span>
                <span className="v4-step-label">
                  {inSettings ? 'Settings' : 'Setup'}
                  <span className="v4-step-counter"> · {realCurrent}/{realTotal}</span>
                </span>
              </div>
            );
          })()}
          <Link to="/" className="v4-exit" aria-label="Exit">
            <X weight="regular" size={14} />
            <span>Exit</span>
          </Link>
        </header>

          <div className="v4-chat-inner">
            {/* History — completed turns, with optional edit-in-place */}
            <div className="v4-history">
              {history.map((turn, i) => (
                <HistoryTurn
                  key={turn.question.id + '_' + i}
                  turn={turn}
                  isEditing={editingIndex === i}
                  onStartEdit={() => startEditing(i)}
                  onEditSubmit={handleEditSubmit}
                  onCancelEdit={cancelEditing}
                />
              ))}
            </div>

            {/* Current question — only when not editing and not done */}
            {!isDone && !isEditing && currentQ && (
              <CurrentQuestion
                question={currentQ}
                article={currentArticle}
                phase={phase}
                userReply={userReply}
                onSubmit={handleSubmit}
              />
            )}

            {/* All-done wrapping bubble */}
            {isDone && !isEditing && (
              <div className="v4-bubble">
                Almost there — taking you to review&hellip;
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Section break — visual divider with hairlines + label ────────────
function SectionBreak({ text }) {
  return (
    <div className="v4-section-break" role="separator">
      <span className="v4-section-break-rule" aria-hidden="true"></span>
      <span className="v4-section-break-badge">
        <Confetti weight="duotone" size={14} />
        <span>{text}</span>
      </span>
      <span className="v4-section-break-rule" aria-hidden="true"></span>
    </div>
  );
}

// ── Segment-pick reply bubble — mirrors the card's pastel icon ──────
function SegmentReply({ option, editable, onEdit, ariaLabel }) {
  if (!option) return null;
  const Icon = SEGMENT_ICONS[option.icon] || PencilSimple;
  const inner = (
    <>
      <span
        className="v4-bubble-user-icon"
        style={{ background: option.tone.bg, color: option.tone.fg }}
        aria-hidden="true"
      >
        <Icon weight="duotone" size={18} />
      </span>
      <span>{option.title}</span>
    </>
  );
  if (editable) {
    return (
      <button
        type="button"
        className="v4-bubble-user v4-bubble-editable"
        onClick={onEdit}
        aria-label={ariaLabel}
      >
        {inner}
        <span className="v4-bubble-edit-hint" aria-hidden="true">
          <PencilSimple weight="bold" size={12} />
          Edit
        </span>
      </button>
    );
  }
  return (
    <div className="v4-bubble v4-bubble-user">{inner}</div>
  );
}

// ── Single completed turn in history ────────────────────────────────
function HistoryTurn({ turn, isEditing, onStartEdit, onEditSubmit, onCancelEdit, onSaveProgress, alreadySaved }) {
  const { question, answer, display, article } = turn;
  const isNarrator = question.type === 'narrator';
  const isSegment = question.section === 'segment';

  // Narrator (section break) — proper visual divider, not editable
  if (isNarrator) {
    return (
      <SectionBreak
        text={question.prompt}
        onSaveProgress={onSaveProgress}
        alreadySaved={alreadySaved}
      />
    );
  }

  return (
    <>
      <div className="v4-bubble">{question.prompt}</div>

      {/* Guide stays attached to the question in history — collapsed by
          default but always one tap away if the user wants to re-read. */}
      {article && <GuideExpandable article={article} compact />}


      {!isEditing && isSegment && (
        <SegmentReply
          option={answer}
          editable
          onEdit={onStartEdit}
          ariaLabel={`Edit naming type (currently: ${answer?.title || display})`}
        />
      )}

      {!isEditing && !isSegment && (
        <button
          type="button"
          className="v4-bubble-user v4-bubble-editable"
          onClick={onStartEdit}
          aria-label={`Edit answer to: ${question.label || question.prompt}`}
        >
          <span>{display}</span>
          <span className="v4-bubble-edit-hint" aria-hidden="true">
            <PencilSimple weight="bold" size={12} />
            Edit
          </span>
        </button>
      )}

      {isEditing && (
        <div className="v4-edit-block">
          <QuestionInput
            question={question}
            onSubmit={onEditSubmit}
            autoFocus
          />
          <button
            type="button"
            className="v4-edit-cancel"
            onClick={onCancelEdit}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}

// ── Current question being revealed ─────────────────────────────────
function CurrentQuestion({ question, article, phase, userReply, onSubmit }) {
  const isNarrator = question.type === 'narrator';

  // Narrator — visual divider, no input
  if (isNarrator) {
    return phase >= 1 ? <SectionBreak text={question.prompt} /> : null;
  }

  return (
    <>
      {phase === 0 && (
        <div className="v4-typing" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
      )}

      {phase >= 1 && (
        <div className="v4-bubble">{question.prompt}</div>
      )}

      {phase >= 2 && question.hint && !userReply && (
        <div className="v4-hint">{question.hint}</div>
      )}

      {phase >= 2 && article && !userReply && (
        <GuideExpandable article={article} />
      )}

      {phase >= 3 && !userReply && (
        <QuestionInput question={question} onSubmit={onSubmit} />
      )}

      {userReply !== null && question.section === 'segment' && (
        <SegmentReply option={userReply} />
      )}

      {userReply !== null && question.section !== 'segment' && (
        <div className="v4-bubble v4-bubble-user">
          <span>{typeof userReply === 'string' ? userReply : answerToDisplay(userReply)}</span>
        </div>
      )}
    </>
  );
}
