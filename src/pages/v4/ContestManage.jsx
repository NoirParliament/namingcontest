// V4 contest manage page — single workspace for one contest, content
// adapts based on phase (submission / voting / closed). For Slice 1 we
// build the submission-phase view. Voting + results views come later
// inside the same shell.
//
// URL: /v4/contest/[id]
// From: Launch button on /v4/setup/review
// Future: dashboard list links here per contest

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  X, Heart, UsersThree, Briefcase,
  Copy, Check, EnvelopeSimple, ShareNetwork,
  PencilSimple, CalendarBlank, Hash, Clock,
  PaperPlaneTilt, Eye, Trophy, Lightbulb,
} from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import heroProfile1 from '../../assets/hero-profile-1.png';
import heroProfile2 from '../../assets/hero-profile-2.png';
import heroProfile4 from '../../assets/hero-profile-4.png';
import {
  readSetup, writeSetup, getSegmentLabel,
} from '../../utils/v4Brief';
import { PARTICIPANTS } from '../../data/v4/mockContestData';
import { getMockContestById } from '../../data/v4/mockContests';
import {
  BRIEF_QUESTIONS, SHARED_SETTINGS_QUESTIONS,
} from '../../data/v4/briefQuestions';
import { SegmentThemeBackdrop, getSegmentTone } from '../../data/v4/segmentTheme';
import EditQuestionModal from '../../components/v4/EditQuestionModal';
import ActivityFlyOver from '../../components/v4/ActivityFlyOver';
import LiveResults from '../../components/v4/LiveResults';
import AvatarMenu from '../../components/v4/AvatarMenu';
import '../../styles/v4.css';

const TIER_ICON = {
  personal: { Icon: Heart,      tone: { bg: '#fadecc', fg: '#9c4818' }, label: 'Personal contest' },
  group:    { Icon: UsersThree, tone: { bg: '#c4cff5', fg: '#283b78' }, label: 'Group contest' },
  business: { Icon: Briefcase,  tone: { bg: '#bce5c8', fg: '#1f5430' }, label: 'Business contest' },
};

function formatAnswer(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value === '[configure-later]') return 'Configure after launch';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    if (value.length <= 3) return value.join(' · ');
    return `${value.slice(0, 2).join(' · ')} +${value.length - 2} more`;
  }
  if (value && typeof value === 'object') {
    if ('enabled' in value) {
      if (!value.enabled) return 'No';
      if (value.text) return value.text;
      if (value.name) return value.name;
      if (value.configureAfterLaunch) return 'Set up after launch';
      return 'Yes';
    }
  }
  return String(value);
}

// Days from "now" to a target date — used for phase countdowns
function formatDaysFrom(launchedAt, daysOffset) {
  const target = new Date(launchedAt);
  target.setDate(target.getDate() + daysOffset);
  const diffMs = target.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Closed';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  return `in ${diffDays} days`;
}

function formatDate(launchedAt, daysOffset) {
  const target = new Date(launchedAt);
  target.setDate(target.getDate() + daysOffset);
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ContestManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // If the URL points to a mock contest (e.g. the demo "Sunday football
  // crew"), render the page with that contest's data instead of the
  // user's real setup blob — otherwise the dashboard shows their
  // unrelated brief and segment, which is confusing.
  const mockContest = getMockContestById(id);
  const realSetup = readSetup();
  const setup = mockContest
    ? {
        ...realSetup,
        ...mockContest,
        contestId: mockContest.id,
      }
    : realSetup;
  const subId = setup.subSegmentId || 'b1';
  // Strip the disambiguation suffix some labels carry, e.g.
  // "Something else (personal)" → "Something else". We only need the
  // segment name here; tier is already conveyed by the badge color/icon.
  const segmentLabel = getSegmentLabel(subId).replace(/\s*\([^)]*\)\s*$/, '');
  const tierMeta = TIER_ICON[setup.group] || TIER_ICON.business;
  // Per-sub-segment accent — used for the hero badge, journey active step,
  // and participant pills so the segment's identity color carries through.
  const segmentTone = getSegmentTone(subId);

  // Brief + settings answers (for the recap collapser)
  const briefQuestions = BRIEF_QUESTIONS[subId]?.questions || [];
  const briefAnswers = setup.brief || {};
  const settingsAnswers = setup.settings || {};
  const filledBrief = briefQuestions.filter((q) => briefAnswers[q.id] !== undefined);
  const filledSettings = SHARED_SETTINGS_QUESTIONS.filter((q) => settingsAnswers[q.id] !== undefined);

  // Phase timing — derived from settings
  const launchedAt = setup.launchedAt || Date.now();
  const submissionDays = settingsAnswers.submissionDays || 7;
  const votingDays = settingsAnswers.votingDays || 3;

  const [copied, setCopied] = useState(false);
  // Hardcoded simulated stats — currently showing VOTING-phase state
  // so we can see how the page reads when the contest is mid-voting.
  // When backend is wired, replace this with realtime data + auto-switch
  // tile labels based on actual phase.
  const [stats] = useState({
    submissions: 47,
    participants: 23,
    votes: 89,
    lastActivity: '32 sec ago',
    leadingName: 'Lighthouse',
  });

  // Edit modal state
  const [editingQuestion, setEditingQuestion] = useState(null);  // {question, section}
  // Force re-render of recap when answers change
  const [editTick, setEditTick] = useState(0);
  // For mock contests we want the recap to show the mock's pre-filled
  // brief answers, not the user's real (likely empty) ones. The merge
  // mirrors what we do for `setup` above so the recap stays coherent.
  const liveSetup = useMemo(() => {
    const real = readSetup();
    return mockContest
      ? { ...real, ...mockContest, contestId: mockContest.id }
      : real;
  }, [editTick, mockContest]);
  const liveBriefAnswers = liveSetup.brief || {};
  const liveSettingsAnswers = liveSetup.settings || {};

  const handleEditSave = (newValue) => {
    if (!editingQuestion) return;
    const { question, section } = editingQuestion;
    const cur = readSetup();
    if (section === 'brief') {
      writeSetup({ brief: { ...(cur.brief || {}), [question.id]: newValue } });
    } else if (section === 'settings') {
      writeSetup({ settings: { ...(cur.settings || {}), [question.id]: newValue } });
    }
    setEditTick((t) => t + 1);
  };

  const shareUrl = `${window.location.origin}/v4/join/${id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback or noop
    }
  };

  return (
    <div className="v4">
      <div className="v4-screen">
        {/* Per-segment theme decoration (carries identity from setup) */}
        <SegmentThemeBackdrop subId={subId} />

        {/* Live activity fly-over — subtle avatar pills drifting up */}
        <ActivityFlyOver tone={segmentTone} enabled={true} />

        <main className="v4-review" role="main">
          {/* Glass nav — same as other v4 surfaces */}
          <header className="v4-nav">
            <Link to="/" className="v4-brand">
              <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
            </Link>
            <div className="v4-progress">
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-label">Live</span>
            </div>
            <div className="v4-nav-right">
              <Link to="/" className="v4-exit" aria-label="Exit">
                <X weight="regular" size={14} />
                <span>Exit</span>
              </Link>
              <AvatarMenu
                email={setup.userEmail}
                name={setup.userName}
                photo={setup.userPhoto}
                tone={segmentTone}
                activeContest={
                  setup.contestId
                    ? {
                        id: setup.contestId,
                        name: setup.workingName || 'Your contest',
                        // Mock voting phase to match the rest of the page
                        phase: 'Voting',
                        daysLeft: votingDays,
                        tone: segmentTone,
                      }
                    : null
                }
              />
            </div>
          </header>

          <div className="v4-review-inner">
            {/* ── Hero (simple) — poster JSX kept in chat history,
                CSS still in v4.css under .v4-manage-hero-poster. ── */}
            <div className="v4-manage-hero">
              <span
                className="v4-review-badge"
                style={{ background: segmentTone.bg, color: segmentTone.fg }}
                aria-hidden="true"
              >
                {/* Segment-specific icon override (e.g. SoccerBall for
                    the sports mock). Falls back to the generic tier
                    icon for real user contests. */}
                {(() => {
                  const HeroIcon = mockContest?.Icon || tierMeta.Icon;
                  return <HeroIcon weight="duotone" size={20} />;
                })()}
              </span>
              <h1 className="v4-review-title">
                {setup.workingName || 'Your contest'}
              </h1>
              <p className="v4-review-subtitle">
                {segmentLabel}
              </p>
              <div className="v4-manage-status">
                <span className="v4-manage-live-dot" aria-hidden="true"></span>
                <span className="v4-manage-status-label">VOTING</span>
                <span className="v4-manage-status-sep">·</span>
                <span>Closes {formatDaysFrom(launchedAt, submissionDays + votingDays)}</span>
                <span className="v4-manage-status-sep">·</span>
                <span>Last vote {stats.lastActivity}</span>
              </div>
            </div>

            {/* ── Live Results — names + participants ──
                When the contest is the demo mock (no real launched
                contest), populate from mock data. Real contests show
                an empty state until backend submissions are wired. */}
            <LiveResults tone={segmentTone} isMock={!!mockContest} />

            {/* ── Share card (PRIMARY action) ──────────────────────── */}
            <section className="v4-manage-share">
              <header className="v4-manage-share-head">
                <div>
                  <div className="v4-manage-share-eyebrow">Share with participants</div>
                  <h2 className="v4-manage-share-title">
                    Need a few more votes?
                  </h2>
                </div>
              </header>

              <div className="v4-manage-share-bigrow">
                <div className="v4-manage-share-url">{shareUrl}</div>
                <button
                  type="button"
                  className={`v4-manage-copy-btn-big ${copied ? 'is-copied' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check weight="bold" size={16} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy weight="bold" size={16} /> Copy link
                    </>
                  )}
                </button>
              </div>

              <div className="v4-manage-share-actions">
                <a
                  className="v4-manage-share-btn"
                  href={`mailto:?subject=${encodeURIComponent(`Help vote for ${setup.workingName}`)}&body=${encodeURIComponent(`Vote on names here: ${shareUrl}`)}`}
                >
                  <EnvelopeSimple weight="duotone" size={16} /> Email
                </a>
                <a
                  className="v4-manage-share-btn"
                  href={`sms:?body=${encodeURIComponent(`Vote on names for ${setup.workingName}: ${shareUrl}`)}`}
                >
                  <ShareNetwork weight="duotone" size={16} /> Message
                </a>
                <a
                  className="v4-manage-share-btn"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Help me name ${setup.workingName} →`)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  𝕏  Post
                </a>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    type="button"
                    className="v4-manage-share-btn"
                    onClick={() => navigator.share({ title: setup.workingName, url: shareUrl })}
                  >
                    <ShareNetwork weight="duotone" size={16} /> More…
                  </button>
                )}
              </div>

              <div className="v4-manage-share-foot">
                <div className="v4-manage-share-avatars" aria-hidden="true">
                  {[heroProfile1, heroProfile2, heroProfile4].map((src, i) => (
                    <span key={i} className="v4-manage-share-avatar">
                      <img src={src} alt="" />
                    </span>
                  ))}
                </div>
                <span className="v4-manage-share-meta-bold">
                  {(() => {
                    const featured = PARTICIPANTS.slice(0, 3).map((p) => p.name);
                    const remaining = stats.participants - featured.length;
                    return `${featured.join(', ')} and ${remaining} others joined`;
                  })()}
                </span>
              </div>
            </section>

            {/* ── Your contest journey — 3 steps; only active step is
                tinted with the segment's color, others are outline cards ── */}
            <section
              className="v4-manage-wait"
              style={{
                '--journey-active-bg': segmentTone.bg,
                '--journey-active-border': segmentTone.fg + '33',
              }}
            >
              <div className="v4-manage-wait-eyebrow">Step 2 of 3 · You are here</div>
              <h2 className="v4-manage-wait-title">Your contest journey</h2>
              <p className="v4-manage-wait-lede">
                Where you are in the lifecycle — and what's coming next.
              </p>

              <div className="v4-manage-wait-steps">
                <div className="v4-manage-wait-step is-done">
                  <span className="v4-manage-wait-step-icon" aria-hidden="true">
                    <PaperPlaneTilt weight="duotone" size={22} />
                  </span>
                  <div className="v4-manage-wait-step-text">
                    <div className="v4-manage-wait-step-status">
                      Done
                      <span className="v4-manage-wait-step-meta">
                        Launched {formatDate(launchedAt, 0)} · {stats.participants} joined
                      </span>
                    </div>
                    <h3>Share the link</h3>
                    <p>
                      You sent the join link to participants. The sweet spot is 12–25 — variety without voting drag.
                    </p>
                  </div>
                </div>

                <div className="v4-manage-wait-step is-active">
                  <span className="v4-manage-wait-step-icon" aria-hidden="true">
                    <Eye weight="duotone" size={22} />
                  </span>
                  <div className="v4-manage-wait-step-text">
                    <div className="v4-manage-wait-step-status">
                      <span className="v4-manage-wait-step-pulse" aria-hidden="true"></span>
                      Now
                      <span className="v4-manage-wait-step-meta">
                        Submissions closed · Voting ends {formatDaysFrom(launchedAt, submissionDays + votingDays)} ({formatDate(launchedAt, submissionDays + votingDays)})
                      </span>
                    </div>
                    <h3>Watch the contest unfold</h3>
                    <p>
                      {stats.submissions} names submitted. Voting is live. Activity rolls in real-time — no need to refresh, and you don't have to be watching.
                    </p>
                  </div>
                </div>

                <div className="v4-manage-wait-step is-upcoming">
                  <span className="v4-manage-wait-step-icon" aria-hidden="true">
                    <Trophy weight="duotone" size={22} />
                  </span>
                  <div className="v4-manage-wait-step-text">
                    <div className="v4-manage-wait-step-status">
                      Up next
                      <span className="v4-manage-wait-step-meta">
                        {formatDate(launchedAt, submissionDays + votingDays)}
                      </span>
                    </div>
                    <h3>Pick the winner</h3>
                    <p>
                      When voting closes, we'll send you the leaderboard. You make the final call — top vote or any name that won your heart.
                    </p>
                  </div>
                </div>
              </div>

            </section>

            {/* ── Brief recap (collapsible, click-to-edit per row) ─
                Sits below the journey since it's reference material —
                you set it during creation, glance at it occasionally,
                edit it rarely. The journey + live results are higher
                priority on this surface. */}
            <BriefRecapCollapser
              filledBrief={filledBrief}
              filledSettings={filledSettings}
              briefAnswers={liveBriefAnswers}
              settingsAnswers={liveSettingsAnswers}
              onEditBrief={(q) => setEditingQuestion({ question: q, section: 'brief' })}
              onEditSettings={(q) => setEditingQuestion({ question: q, section: 'settings' })}
            />

            {/* ── Quiet actions ────────────────────────────────────── */}
            <div className="v4-manage-actions">
              <button
                type="button"
                className="v4-manage-action v4-manage-action-danger"
                onClick={() => {
                  if (window.confirm('Cancel this contest? This cannot be undone.')) {
                    navigate('/');
                  }
                }}
              >
                Cancel contest
              </button>
            </div>
          </div>
        </main>

        {/* Per-row edit modal */}
        <EditQuestionModal
          open={!!editingQuestion}
          question={editingQuestion?.question}
          currentAnswer={
            editingQuestion?.section === 'brief'
              ? liveBriefAnswers[editingQuestion?.question?.id]
              : liveSettingsAnswers[editingQuestion?.question?.id]
          }
          onClose={() => setEditingQuestion(null)}
          onSave={handleEditSave}
        />
      </div>
    </div>
  );
}

// ── Brief recap collapser — each row is clickable, opens edit modal ──
function BriefRecapCollapser({
  filledBrief, filledSettings, briefAnswers, settingsAnswers,
  onEditBrief, onEditSettings,
}) {
  const [open, setOpen] = useState(false);
  const totalAnswered = filledBrief.length + filledSettings.length;

  return (
    <section className={`v4-manage-recap ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="v4-manage-recap-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="v4-manage-recap-icon" aria-hidden="true">
          <CalendarBlank weight="duotone" size={16} />
        </span>
        <span className="v4-manage-recap-text">
          Your brief · {totalAnswered} answered · click any to edit
        </span>
        <span className="v4-manage-recap-meta">
          {open ? 'Hide' : 'Show'}
        </span>
      </button>

      {open && (
        <div className="v4-manage-recap-body">
          {filledBrief.length > 0 && (
            <div className="v4-manage-recap-group">
              <h3 className="v4-manage-recap-group-title">Brief</h3>
              <ul className="v4-manage-recap-list">
                {filledBrief.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      className="v4-manage-recap-row"
                      onClick={() => onEditBrief?.(q)}
                    >
                      <span className="v4-manage-recap-row-label">{q.label}</span>
                      <span className="v4-manage-recap-row-value">
                        {formatAnswer(briefAnswers[q.id])}
                      </span>
                      <PencilSimple weight="regular" size={12} className="v4-manage-recap-row-edit" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {filledSettings.length > 0 && (
            <div className="v4-manage-recap-group">
              <h3 className="v4-manage-recap-group-title">Settings</h3>
              <ul className="v4-manage-recap-list">
                {filledSettings.map((q) => (
                  <li key={q.id}>
                    <button
                      type="button"
                      className="v4-manage-recap-row"
                      onClick={() => onEditSettings?.(q)}
                    >
                      <span className="v4-manage-recap-row-label">{q.label}</span>
                      <span className="v4-manage-recap-row-value">
                        {formatAnswer(settingsAnswers[q.id])}
                      </span>
                      <PencilSimple weight="regular" size={12} className="v4-manage-recap-row-edit" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
