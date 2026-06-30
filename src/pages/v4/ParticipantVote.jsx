// V4 ParticipantVote — the voting interface.
//
// URL: /v4/contest/:id/vote
//
// Mirrors the submission chat's staged-reveal pattern so it feels
// like a continuing conversation rather than a separate dashboard:
//   stage 0 → typing dots
//   stage 1 → welcome bubble ("You're back — voting's open…")
//   stage 1 → typing dots (for ready chip)
//   stage 2 → "ready to pick favourites?" prompt + chip (WAITS)
//   stage 3 → user-bubble "Yes, let's vote" + brief card + typing
//   stage 4 → "Pick up to N…" bubble + toolbar + vote cards + sticky
//             submit bar
//
// One consistent UI regardless of submission count (15 or 500):
// search + sort always present; pagination kicks in silently above
// ~20 entries.

import { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  MagnifyingGlass, ArrowsDownUp, CheckCircle, X, PaperPlaneTilt,
} from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import participantProfile from '../../assets/participant-profile.png';
import { getMockContestById } from '../../data/v4/mockContests';
import { SegmentThemeBackdrop, getSegmentTone } from '../../data/v4/segmentTheme';
import { readSetup, getQuestionsFor } from '../../utils/v4Brief';
import { SHARED_SETTINGS_QUESTIONS } from '../../data/v4/briefQuestions';
import { readParticipation, recordVotes } from '../../utils/v4Participant';
import { showSubmitter, anonymityMode } from '../../utils/v4Anonymity';
import AvatarMenu from '../../components/v4/AvatarMenu';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

const PAGE_SIZE = 20;
const SORT_MODES = [
  { id: 'random', label: 'Random shuffle' },
  { id: 'alpha',  label: 'Alphabetical' },
  { id: 'newest', label: 'Newest first' },
];

// Same formatter ParticipantChat uses — keeps brief recap copy
// consistent across pages (Yes/No, joined arrays, etc.).
function formatAnswer(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value === '[configure-later]') return 'Configure after launch';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    return value.join(' · ');
  }
  if (value && typeof value === 'object') {
    if ('enabled' in value) {
      if (!value.enabled) return 'No';
      if (value.text) return value.text;
      if (value.name) return value.name;
      return 'Yes';
    }
  }
  return String(value);
}

// Build proper-label brief + settings rows — mirrors ParticipantChat
// so the brief card on this page reads identically.
function buildBriefRows(contest) {
  if (!contest) return { rows: [], settingsRows: [] };
  const briefQs = getQuestionsFor(contest.subSegmentId);
  const briefAnswers = contest.brief || {};
  const settingsAnswers = contest.settings || {};

  const rows = briefQs
    .filter((q) => q.id !== 'projectSummary')
    .filter((q) => {
      const v = briefAnswers[q.id];
      if (v === undefined || v === null || v === '') return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    })
    .map((q) => ({ id: q.id, label: q.label, value: briefAnswers[q.id] }));

  const settingsRows = SHARED_SETTINGS_QUESTIONS
    .filter((q) => q.id === 'customRequirements')
    .filter((q) => {
      const v = settingsAnswers[q.id];
      if (v && typeof v === 'object' && 'enabled' in v && !v.enabled) return false;
      return v != null && v !== '';
    })
    .map((q) => ({ id: q.id, label: q.label, value: settingsAnswers[q.id] }));

  return { rows, settingsRows };
}

// Stable shuffle keyed by contestId for consistent within-session order.
function shuffleStable(arr, seed) {
  const out = [...arr];
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) | 0;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function ParticipantVote() {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const contest = getMockContestById(contestId);
  const participation = readParticipation(contestId);
  const chatRef = useRef(null);
  const didFirstAutoscrollRef = useRef(false);

  const subId = contest?.subSegmentId;
  const tone = subId ? getSegmentTone(subId) : null;
  const setup = readSetup();
  const userEmail = setup.userEmail || '';
  const userName = setup.userName || (userEmail.split('@')[0] || 'You');
  const userPhoto = setup.userPhoto || null;
  const creatorName = contest?.creator?.name || 'the organizer';
  const votingLimit = contest?.settings?.votingLimit || 3;
  const allSubmissions = contest?.allSubmissions || [];
  const alreadyVoted = (participation?.votedFor || []).length > 0;
  const { rows: briefRows, settingsRows } = useMemo(
    () => buildBriefRows(contest),
    [contest]
  );

  // ── Intro reveal stages (mirrors ParticipantChat's brief gate) ───
  //   0 → typing for welcome
  //   1 → welcome bubble + typing for the brief prompt
  //   2 → "refresher on the brief?" prompt + chip (WAITS for click)
  //   3 → user "Show me the brief" + brief card + typing for vote prompt
  //   4 → "ready to see the names?" prompt + chip (WAITS for click)
  //   5 → user "Yes, show me" + typing for vote prompt
  //   6 → "Pick up to N…" prompt + toolbar + vote cards + sticky bar
  const [introStage, setIntroStage] = useState(0);
  const INTRO_AUTO_TIMINGS = { 0: 700, 1: 900, 3: 1000, 5: 800 };

  // Voting state
  const [selectedIds, setSelectedIds] = useState(() =>
    participation?.votedFor ? [...participation.votedFor] : []
  );
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState('random');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Sorted + filtered
  const sortedSubmissions = useMemo(() => {
    if (!allSubmissions.length) return [];
    if (sortMode === 'alpha') return [...allSubmissions].sort((a, b) => a.text.localeCompare(b.text));
    if (sortMode === 'newest') return [...allSubmissions].reverse();
    return shuffleStable(allSubmissions, contestId || 'seed');
  }, [allSubmissions, sortMode, contestId]);

  const filteredSubmissions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedSubmissions;
    return sortedSubmissions.filter((s) => {
      // Don't let search match a hidden author's name.
      const who = showSubmitter(contest, s) ? (s.submitterName || '') : '';
      const hay = `${s.text} ${s.whyItFits || ''} ${who}`.toLowerCase();
      return hay.includes(q);
    });
  }, [sortedSubmissions, search]);

  const visibleSubmissions = filteredSubmissions.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSubmissions.length;

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, sortMode]);

  // Intro reveal auto-pacer.
  useEffect(() => {
    const delay = INTRO_AUTO_TIMINGS[introStage];
    if (!delay) return;
    const t = setTimeout(() => setIntroStage((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [introStage]);

  // Autoscroll on stage changes (but not on initial mount — start at top).
  useEffect(() => {
    if (!didFirstAutoscrollRef.current) {
      didFirstAutoscrollRef.current = true;
      return;
    }
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [introStage]);

  // Guards
  if (!contest) return <Navigate to="/v4/settings" replace />;
  if (!participation) return <Navigate to={`/v4/join/${contestId}`} replace />;
  const hasSubmittedNames = (participation.submittedNames || []).length > 0;
  if (!hasSubmittedNames) return <Navigate to={`/v4/contest/${contestId}/submit`} replace />;

  // Handlers
  const toggleVote = (id) => {
    setSelectedIds((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= votingLimit) return cur;
      return [...cur, id];
    });
  };

  const handleSubmitVotes = () => {
    if (selectedIds.length === 0) return;
    recordVotes(contestId, selectedIds);
    navigate(`/v4/contest/${contestId}/vote-thanks`, { replace: true });
  };

  return (
    <div className="v4 lp-v3">
      <div className="v4-screen">
        <SegmentThemeBackdrop subId={subId} />
        <main className="v4-review" role="main" ref={chatRef}>
          <header className="v4-nav">
            <button
              type="button"
              className="v4-brand v4-brand-button"
              onClick={() => chatRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top"
            >
              <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
            </button>
            <div className="v4-progress">
              <span className="v4-step-label">
                Vote
                <span className="v4-step-counter">
                  {' '}· {selectedIds.length}/{votingLimit}
                </span>
              </span>
            </div>
            <div className="v4-nav-right">
              <AvatarMenu
                email={userEmail}
                name={userName}
                photo={participantProfile}
                tone={tone}
                activeContest={{
                  id: contest.id,
                  name: contest.workingName || contest.name,
                  phase: 'VOTING',
                  tone,
                  to: '/v4/settings',
                }}
              />
            </div>
          </header>

          <div className="v4-chat-inner v4-pvote-inner">
            {/* ── Stage 0 → typing for welcome ─────────────────────── */}
            {introStage === 0 && (
              <div className="v4-typing" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
            )}

            {/* ── Stage 1+ → welcome bubble ─────────────────────────── */}
            {introStage >= 1 && (
              <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                <span>
                  You’re back — voting’s open for{' '}
                  <em>{contest.workingName || contest.name}</em>.{' '}
                  {alreadyVoted
                    ? 'You can update your picks any time before voting closes.'
                    : 'Time to pick the names that should win.'}
                </span>
              </div>
            )}

            {/* ── Stage 1 → typing for the "see the brief?" prompt ──── */}
            {introStage === 1 && (
              <div className="v4-typing" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
            )}

            {/* ── Stage 2 → "refresher on the brief?" prompt + chip ─── */}
            {introStage === 2 && (
              <>
                <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                  <span>Want a quick refresher on {creatorName}’s brief first?</span>
                </div>
                <div className="v4-chips-row" role="group">
                  <button
                    type="button"
                    className="v4-chip"
                    onClick={() => setIntroStage(3)}
                  >
                    Show me the brief
                  </button>
                </div>
              </>
            )}

            {/* ── Stage 3+ → user reply + brief card ─────────────────── */}
            {introStage >= 3 && (
              <>
                <div className="v4-bubble v4-bubble-user" style={{ animationDelay: '0.05s' }}>
                  <span>Show me the brief</span>
                </div>
                <ParticipantBriefCard
                  contest={contest}
                  tone={tone}
                  briefRows={briefRows}
                  settingsRows={settingsRows}
                />
              </>
            )}

            {/* ── Stage 3 → typing for the "ready to vote?" prompt ──── */}
            {introStage === 3 && (
              <div className="v4-typing" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
            )}

            {/* ── Stage 4 → "ready to see the names?" + chip ────────── */}
            {introStage === 4 && (
              <>
                <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                  <span>Ready to see what everyone suggested?</span>
                </div>
                <div className="v4-chips-row" role="group">
                  <button
                    type="button"
                    className="v4-chip"
                    onClick={() => setIntroStage(5)}
                  >
                    Yes, show me
                  </button>
                </div>
              </>
            )}

            {/* ── Stage 5+ → user reply + typing for vote prompt ────── */}
            {introStage >= 5 && (
              <div className="v4-bubble v4-bubble-user" style={{ animationDelay: '0.05s' }}>
                <span>Yes, show me</span>
              </div>
            )}
            {introStage === 5 && (
              <div className="v4-typing" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
            )}

            {/* ── Stage 6 → vote prompt + toolbar + cards ───────────── */}
            {introStage >= 6 && (
              <>
                <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                  <span>
                    Pick up to {votingLimit} favourites. Tap a card to vote.
                  </span>
                </div>

                {/* Toolbar — same regardless of submission count */}
                <div className="v4-pvote-toolbar">
                  <div className="v4-pvote-search">
                    <MagnifyingGlass weight="bold" size={14} className="v4-pvote-search-icon" />
                    <input
                      type="text"
                      className="v4-settings-input v4-pvote-search-input"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={`Search ${filteredSubmissions.length} ${filteredSubmissions.length === 1 ? 'name' : 'names'}…`}
                      aria-label="Search submissions"
                    />
                    {search && (
                      <button
                        type="button"
                        className="v4-pvote-search-clear"
                        onClick={() => setSearch('')}
                        aria-label="Clear search"
                      >
                        <X weight="bold" size={11} />
                      </button>
                    )}
                  </div>
                  <div className="v4-pvote-sort">
                    <ArrowsDownUp weight="bold" size={12} />
                    <select
                      className="v4-pvote-sort-select"
                      value={sortMode}
                      onChange={(e) => setSortMode(e.target.value)}
                      aria-label="Sort order"
                    >
                      {SORT_MODES.map((m) => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {visibleSubmissions.length === 0 ? (
                  <div className="v4-pvote-empty">
                    <p>No submissions match “<strong>{search}</strong>”. Try a different search.</p>
                  </div>
                ) : (
                  <ol className="v4-pvote-list">
                    {visibleSubmissions.map((sub) => (
                      <VoteCard
                        key={sub.id}
                        submission={sub}
                        contest={contest}
                        isSelected={selectedIds.includes(sub.id)}
                        canSelectMore={selectedIds.length < votingLimit}
                        tone={tone}
                        onToggle={() => toggleVote(sub.id)}
                      />
                    ))}
                  </ol>
                )}

                {hasMore && (
                  <button
                    type="button"
                    className="v4-pvote-loadmore"
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  >
                    Load {Math.min(PAGE_SIZE, filteredSubmissions.length - visibleCount)} more
                    {' '}<span className="arrow">↓</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Sticky bottom bar — only after stage 6 (vote cards visible) */}
          {introStage >= 6 && (
            <div className="v4-pvote-bottom">
              <div className="v4-pvote-bottom-inner">
                <span className="v4-pvote-bottom-count">
                  {selectedIds.length === 0
                    ? `Select up to ${votingLimit}`
                    : `${selectedIds.length} of ${votingLimit} selected`}
                </span>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmitVotes}
                  disabled={selectedIds.length === 0}
                >
                  <PaperPlaneTilt weight="bold" size={14} />
                  {alreadyVoted ? 'Update my votes' : 'Submit my votes'}
                  <span className="arrow">→</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Brief card — same exact classes as ParticipantChat's brief
//    card so the layout reads identically across the two pages.
function ParticipantBriefCard({ contest, tone, briefRows, settingsRows }) {
  const projectSummary = contest.brief?.projectSummary;
  return (
    <section className="v4-pchat-brief">
      <header className="v4-pchat-brief-head">
        <div
          className="v4-pchat-brief-eyebrow"
          style={tone ? { color: tone.fg } : undefined}
        >
          The brief
        </div>
        <h2 className="v4-pchat-brief-name">
          {contest.workingName || contest.name}
        </h2>
        {projectSummary && (
          <p className="v4-pchat-brief-summary">“{projectSummary}”</p>
        )}
      </header>
      <ul className="v4-pchat-brief-list">
        {briefRows.map((r) => (
          <li key={r.id} className="v4-pchat-brief-row">
            <span className="v4-pchat-brief-row-label">{r.label}</span>
            <span className="v4-pchat-brief-row-value">{formatAnswer(r.value)}</span>
          </li>
        ))}
        {settingsRows.map((r) => (
          <li key={r.id} className="v4-pchat-brief-row v4-pchat-brief-row-settings">
            <span className="v4-pchat-brief-row-label">{r.label}</span>
            <span className="v4-pchat-brief-row-value">{formatAnswer(r.value)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Single vote card ─────────────────────────────────────────────
function VoteCard({ submission, contest, isSelected, canSelectMore, tone, onToggle }) {
  const disabled = !isSelected && !canSelectMore;
  const showName = showSubmitter(contest, submission);
  // In "participants choose" mode, surface the opted-out names as
  // "anonymous" so the mix is visible; in a fully anonymous contest we
  // stay silent (every card would otherwise repeat it).
  const showAnonTag = !showName && anonymityMode(contest) === 'participant';
  // When selected, paint the card with a soft segment-tinted gradient
  // so the pick reads as exciting / committed, not just "checkbox on."
  const selectedStyle = isSelected && tone
    ? {
        background: `linear-gradient(135deg, ${tone.bg}60 0%, ${tone.bg}30 100%)`,
        borderColor: tone.fg,
      }
    : undefined;
  return (
    <li
      className={`v4-pvote-card ${isSelected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
      style={selectedStyle}
    >
      <button
        type="button"
        className="v4-pvote-card-btn"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={isSelected}
      >
        <div className="v4-pvote-card-text">
          <div className="v4-pvote-card-name">{submission.text}</div>
          {submission.whyItFits && (
            <div className="v4-pvote-card-tagline">“{submission.whyItFits}”</div>
          )}
          {showName && submission.submitterName && (
            <div className="v4-pvote-card-by">
              Submitted by {submission.submitterName}
            </div>
          )}
          {showAnonTag && (
            <div className="v4-pvote-card-by is-anon">Submitted anonymously</div>
          )}
        </div>
        <div
          className="v4-pvote-card-check"
          aria-hidden="true"
          style={isSelected && tone ? { color: tone.fg } : undefined}
        >
          {isSelected ? (
            <CheckCircle weight="fill" size={24} />
          ) : (
            <span className="v4-pvote-card-check-empty" />
          )}
        </div>
      </button>
    </li>
  );
}
