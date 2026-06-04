// V4 shared settings chat — walks the user through SHARED_SETTINGS_QUESTIONS
// after the brief is done. Same conversational pattern as BriefChat.
//
// On finish, navigates to /v4/setup/review for the final launch screen.

import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ExitLink from '../../components/v4/ExitLink';
import { X } from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import { readSetup, writeSetup, getSegmentLabel } from '../../utils/v4Brief';
import { SHARED_SETTINGS_QUESTIONS } from '../../data/v4/briefQuestions';
import QuestionInput from '../../components/v4/QuestionInput';
import '../../styles/v4.css';

const Q_PHASE_TIMINGS = [
  { phase: 1, at: 350 },
  { phase: 2, at: 750 },
  { phase: 3, at: 1050 },
];
const POST_SUBMIT_DELAY = 1100;

function persistSettingsAnswer(id, value) {
  const current = readSetup();
  const settings = { ...(current.settings || {}), [id]: value };
  return writeSetup({ settings });
}

// Display helper — turns various answer shapes into a single readable string
// for the user-reply bubble.
function answerToDisplay(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value && typeof value === 'object') {
    if ('enabled' in value) {
      if (!value.enabled) return 'No, skip';
      if (value.text) return value.text;
      if (value.name) return value.name;
      if (value.configureAfterLaunch) return 'Yes — set up after launch';
      return 'Yes';
    }
  }
  return String(value);
}

export default function SettingsChat() {
  const navigate = useNavigate();
  const subId = useMemo(() => readSetup().subSegmentId || 'b1', []);
  const segmentLabel = getSegmentLabel(subId);

  // Apply conditional reveal: most settings always show. The weighted-voters
  // repeater (conditionalQuestions.weighted) is deferred — we just save the
  // votingMethod choice and let users configure weights from the dashboard.
  const questions = SHARED_SETTINGS_QUESTIONS;

  const [history, setHistory] = useState([]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(0);
  const [userReply, setUserReply] = useState(null);

  const currentQ = questions[idx];
  const isDone = idx >= questions.length;

  useEffect(() => {
    if (isDone) return;
    setPhase(0);
    setUserReply(null);
    const timers = Q_PHASE_TIMINGS.map(({ phase: p, at }) =>
      setTimeout(() => setPhase(p), at)
    );
    return () => timers.forEach(clearTimeout);
  }, [idx, isDone]);

  useEffect(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, [phase, history.length, userReply]);

  const handleSubmit = (value) => {
    if (!currentQ) return;
    persistSettingsAnswer(currentQ.id, value);
    setUserReply(answerToDisplay(value));

    setTimeout(() => {
      setHistory((prev) => [
        ...prev,
        { question: currentQ, answer: answerToDisplay(value) },
      ]);
      setIdx((i) => i + 1);
    }, POST_SUBMIT_DELAY);
  };

  useEffect(() => {
    if (isDone && history.length > 0) {
      const t = setTimeout(() => navigate('/v4/setup/review'), 1400);
      return () => clearTimeout(t);
    }
  }, [isDone, history.length, navigate]);

  return (
    <div className="v4">
      <div className="v4-screen">
        <header className="v4-nav">
          <BrandLink />
          <div className="v4-progress">
            <span className="v4-step-dot is-done"></span>
            <span className="v4-step-dot is-done"></span>
            <span className="v4-step-dot is-done"></span>
            <span className="v4-step-dot is-active"></span>
            <span className="v4-step-dot"></span>
            <span className="v4-step-label">Settings · {segmentLabel}</span>
          </div>
          <ExitLink to="/" aria-label="Exit" />
        </header>

        <span className="v4-blob v4-blob-1" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-2" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-3" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-4" aria-hidden="true"></span>

        <main className="v4-chat" role="main">
          {history.map((turn, i) => (
            <Turn key={turn.question.id + i} turn={turn} />
          ))}

          {!isDone && currentQ && (
            <CurrentQuestion
              question={currentQ}
              phase={phase}
              userReply={userReply}
              onSubmit={handleSubmit}
            />
          )}

          {isDone && (
            <div className="v4-bubble">
              <span className="v4-bubble-icon" aria-hidden="true">🚀</span>
              <span>Almost there — let's review and launch.</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Turn({ turn }) {
  return (
    <>
      <div className="v4-bubble">{turn.question.prompt}</div>
      <div className="v4-bubble v4-bubble-user">
        <span>{turn.answer}</span>
      </div>
    </>
  );
}

function CurrentQuestion({ question, phase, userReply, onSubmit }) {
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

      {phase >= 3 && !userReply && (
        <QuestionInput question={question} onSubmit={onSubmit} />
      )}

      {userReply !== null && (
        <div className="v4-bubble v4-bubble-user">
          <span>{userReply}</span>
        </div>
      )}
    </>
  );
}
