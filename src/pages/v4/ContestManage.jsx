// V4 contest manage page — single workspace for one contest, content
// adapts based on phase (submission / voting / closed). For Slice 1 we
// build the submission-phase view. Voting + results views come later
// inside the same shell.
//
// URL: /v4/contest/[id]
// From: Launch button on /v4/setup/review
// Future: dashboard list links here per contest

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  X, Heart, UsersThree, Briefcase,
  Copy, Check, EnvelopeSimple, ShareNetwork,
  PencilSimple, CalendarBlank, Hash, Clock,
  PaperPlaneTilt, Eye, Trophy, Lightbulb, Confetti,
  Gift, Download, FilePdf, Quotes,
  FacebookLogo, LinkedinLogo, InstagramLogo,
  Palette, CaretDown, UploadSimple,
} from '@phosphor-icons/react';
import Avatar from 'boring-avatars';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import creatorProfile from '../../assets/creator-profile.png';
import {
  readSetup, writeSetup, getSegmentLabel,
} from '../../utils/v4Brief';
import { buildLiveData } from '../../utils/v4LiveData';
import { getMockContestById } from '../../data/v4/mockContests';
import {
  BRIEF_QUESTIONS, SHARED_SETTINGS_QUESTIONS,
} from '../../data/v4/briefQuestions';
import { SegmentThemeBackdrop, getSegmentTone, getSegmentPalette, getSegmentIcon } from '../../data/v4/segmentTheme';
import confetti from 'canvas-confetti';
import EditQuestionModal from '../../components/v4/EditQuestionModal';
import ActivityFlyOver from '../../components/v4/ActivityFlyOver';
import LiveResults from '../../components/v4/LiveResults';
import AvatarMenu from '../../components/v4/AvatarMenu';
import PickWinnerModal from '../../components/v4/PickWinnerModal';
import ConfirmModal from '../../components/v4/ConfirmModal';
import WinnerHero from '../../components/v4/WinnerHero';
import CatchwordConsultBlock from '../../components/v4/CatchwordConsultBlock';
import PdfReport from '../../components/v4/PdfReport';
import { downloadShareCard, downloadFullReport } from '../../utils/v4ContestExport';
import '../../styles/landing-v3.css';
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

// Two-corner confetti burst for the winner reveal. Shared by the
// pick-winner flow AND a first-load fire, so arriving at the winner
// screen directly (e.g. from the Platform Map) still celebrates.
// Gold confetti — same rich gold shades as the participant winner
// screen (the `accent` arg is no longer used, kept for call-site compat).
function burstWinnerConfetti(accent) {
  const burst = (opts) => confetti({
    particleCount: 80,
    startVelocity: 55,
    spread: 70,
    ticks: 220,
    scalar: 0.9,
    colors: ['#f4c64b', '#e8b923', '#d4a017', '#c99700'],
    ...opts,
  });
  burst({ origin: { x: 0.1, y: 0.9 }, angle: 60 });
  burst({ origin: { x: 0.9, y: 0.9 }, angle: 120 });
}

// Three one-word stages that mirror the real contest lifecycle.
// URL ?phase= drives the view in demo (mock) mode. The "winner" stage
// has two sub-states: pre-pick (CTA to pick) and post-pick (celebration).
// Sub-state is controlled by ?winner=<nameId> or setup.winner.
const PHASES = ['submission', 'voting', 'winner'];
const PHASE_LABELS = {
  'submission': 'Submissions',
  'voting':     'Voting',
  'winner':     'Winner',
};

export default function ContestManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
  // Phase resolution — defaults to 'voting' for prototype demos. The
  // URL ?phase= param lets us flip a mock contest through every stage
  // without rebuilding mock data.
  const phaseParam = searchParams.get('phase');
  const phase = PHASES.includes(phaseParam) ? phaseParam : 'voting';
  // Sub-state of the "winner" phase: nameId of the picked winner, or
  // null when the creator still needs to pick. ?winner=n1 prefills for
  // demo. In production this would come from setup.winner.
  const winnerNameId = searchParams.get('winner') || setup.winner?.nameId || null;
  const isWinnerPicked = phase === 'winner' && !!winnerNameId;
  // Per-contest live dataset — derived from THIS contest's own
  // submissions (not a shared football set), with vote counts gated by
  // phase (zero/hidden during the submission window).
  const liveData = useMemo(
    () => buildLiveData(mockContest, phase),
    [mockContest, phase]
  );
  const getLiveParticipantById = (pid) =>
    liveData.participants.find((p) => p.id === pid) || null;
  // Resolve winner data (only meaningful when isWinnerPicked).
  const winnerName = isWinnerPicked
    ? liveData.names.find((n) => n.id === winnerNameId)
    : null;
  const winnerSubmitter = winnerName
    ? getLiveParticipantById(winnerName.submittedBy)
    : null;
  // Runners-up: top 5 names that AREN'T the winner, sorted by votes.
  const runnersUp = isWinnerPicked
    ? [...liveData.names]
        .filter((n) => n.id !== winnerNameId)
        .sort((a, b) => b.voteCount - a.voteCount)
        .slice(0, 5)
    : [];
  // Strip the disambiguation suffix some labels carry, e.g.
  // "Something else (personal)" → "Something else". We only need the
  // segment name here; tier is already conveyed by the badge color/icon.
  const segmentLabel = getSegmentLabel(subId).replace(/\s*\([^)]*\)\s*$/, '');
  const tierMeta = TIER_ICON[setup.group] || TIER_ICON.business;
  // Per-sub-segment accent — used for the hero badge, journey active step,
  // and participant pills so the segment's identity color carries through.
  const segmentTone = getSegmentTone(subId);
  const segmentPalette = getSegmentPalette(subId);
  const SegmentIcon = getSegmentIcon(subId);

  // Fire the confetti burst the first time the page is in the
  // winner-picked state — covers BOTH crowning a winner in-session and
  // landing on the winner screen directly (e.g. from the Platform Map),
  // where the pick-winner modal's burst never runs. Ref-guarded so it
  // only celebrates once per mount.
  const winnerConfettiFired = useRef(false);
  useEffect(() => {
    if (!isWinnerPicked || !winnerName) return;
    if (winnerConfettiFired.current) return;
    // Mark fired INSIDE the timeout (not before) so StrictMode's
    // mount→cleanup→remount in dev doesn't cancel the only scheduled
    // burst and then skip rescheduling.
    const t = setTimeout(() => {
      winnerConfettiFired.current = true;
      burstWinnerConfetti(segmentTone.fg);
    }, 420);
    return () => clearTimeout(t);
  }, [isWinnerPicked, winnerName, segmentTone.fg]);

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
  // ?pick=1 (from the platform map) auto-opens the pick-winner modal so
  // that flow step lands directly on the modal.
  const [pickWinnerOpen, setPickWinnerOpen] = useState(
    () => searchParams.get('pick') === '1'
  );
  const [cancelOpen, setCancelOpen] = useState(false);
  // Winner-card customization (only meaningful on winner-picked state).
  // Color & logo override the defaults on WinnerHero so the creator can
  // brand the share card. hideBranding strips the NamingContest marks.
  const [customColor, setCustomColor] = useState(null);
  const [customLogo, setCustomLogo] = useState(null);
  const [hideBranding, setHideBranding] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  // Ref to the WinnerHero DOM node — used by the PNG export to
  // snapshot the card exactly as it appears on the page.
  const winnerHeroRef = useRef(null);
  // Ref to the hidden PdfReport DOM node — used by the PDF export.
  const pdfReportRef = useRef(null);
  // Stats derived from the live dataset so they match the names shown
  // (and the segment). lastActivity is cosmetic flavour.
  const stats = useMemo(
    () => ({ ...liveData.stats, lastActivity: '32 sec ago' }),
    [liveData]
  );

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
    <div className="v4 lp-v3">
      <div className="v4-screen">
        {/* Per-segment theme decoration (carries identity from setup) */}
        <SegmentThemeBackdrop subId={subId} />

        {/* Live activity fly-over — subtle avatar pills drifting up */}
        <ActivityFlyOver tone={segmentTone} enabled={true} />

        <main className="v4-review" role="main">
          {/* Glass nav — same as other v4 surfaces */}
          <header className="v4-nav">
            <BrandLink />
            <div className="v4-progress">
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-label">Live</span>
            </div>
            <div className="v4-nav-right">
              <AvatarMenu
                email={setup.userEmail}
                name={setup.userName}
                photo={creatorProfile}
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
            {/* ── Hero — regular contest hero for live phases, swapped
                for the celebratory WinnerHero when a winner is picked. */}
            {isWinnerPicked && winnerName && (
              <div ref={winnerHeroRef}>
                <WinnerHero
                  name={winnerName}
                  submitter={winnerSubmitter}
                  tone={segmentTone}
                  contestName={setup.workingName || 'Your contest'}
                  totalVotes={stats.votes}
                  customColor={customColor}
                  customLogo={customLogo}
                  hideBranding={hideBranding}
                />
              </div>
            )}
            {!isWinnerPicked && (
            <div className="v4-manage-hero">
              {/* Segment-icon badge — uses the segment-LEVEL icon
                  (e.g. Trophy for any sports team, PawPrint for any
                  pet, House for any home/property) instead of a
                  sport-specific glyph that would mis-cue when the
                  working name doesn't match (a basketball club in
                  the Sports segment shouldn't show SoccerBall). */}
              {SegmentIcon && (
                <span
                  className="v4-review-badge"
                  style={{ background: segmentTone.bg, color: segmentTone.fg }}
                  aria-hidden="true"
                >
                  <SegmentIcon weight="duotone" size={20} />
                </span>
              )}
              <h1 className="v4-review-title">
                {setup.workingName || 'Your contest'}
              </h1>
              <p className="v4-review-subtitle">
                {segmentLabel}
              </p>
              <div className={`v4-manage-status v4-manage-status-${phase}`}>
                <span className="v4-manage-live-dot" aria-hidden="true"></span>
                {phase === 'submission' && (
                  <>
                    <span className="v4-manage-status-label">SUBMISSIONS OPEN</span>
                    <span className="v4-manage-status-sep">·</span>
                    <span>{stats.submissions} names so far</span>
                    <span className="v4-manage-status-sep">·</span>
                    <span>Closes {formatDaysFrom(launchedAt, submissionDays)}</span>
                  </>
                )}
                {phase === 'voting' && (
                  <>
                    <span className="v4-manage-status-label">VOTING</span>
                    <span className="v4-manage-status-sep">·</span>
                    <span>Closes {formatDaysFrom(launchedAt, submissionDays + votingDays)}</span>
                    <span className="v4-manage-status-sep">·</span>
                    <span>Last vote {stats.lastActivity}</span>
                  </>
                )}
                {phase === 'winner' && !isWinnerPicked && (
                  <>
                    <span className="v4-manage-status-label">VOTING ENDED</span>
                    <span className="v4-manage-status-sep">·</span>
                    <span>Pick your winner</span>
                  </>
                )}
                {phase === 'winner' && isWinnerPicked && (
                  <>
                    <span className="v4-manage-status-label">WINNER PICKED</span>
                    <span className="v4-manage-status-sep">·</span>
                    <span>Closed · {stats.votes} votes total</span>
                  </>
                )}
              </div>
            </div>
            )}

            {/* ── Winner-picked surface (action row + prize + story +
                runners-up). Replaces LiveResults + Share card. */}
            {isWinnerPicked && winnerName && (
              <>
                {/* Action row — download share card, export full report,
                    copy contest link. Buttons placeholder for now; PNG +
                    PDF generation wires in the next pass. */}
                <div className="v4-winner-actions">
                  <button
                    type="button"
                    className="v4-winner-action v4-winner-action-primary"
                    onClick={() => downloadShareCard(
                      winnerHeroRef.current,
                      setup.workingName
                    )}
                  >
                    <Download weight="bold" size={14} />
                    Download share card
                  </button>
                  <button
                    type="button"
                    className="v4-winner-action"
                    onClick={() => downloadFullReport(
                      pdfReportRef.current,
                      setup.workingName
                    )}
                  >
                    <FilePdf weight="bold" size={14} />
                    Download full report
                  </button>

                  {/* Social share icon buttons — open native share intents
                      with pre-filled text + the contest URL. Instagram has
                      no web share API, so it just downloads the card and
                      tells the user to upload manually. */}
                  <div className="v4-winner-share-icons">
                    <a
                      className="v4-winner-share-icon"
                      title="Share on X"
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Meet “${winnerName.text}” — our new ${setup.workingName || 'name'}. Picked via naming contest.`)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      𝕏
                    </a>
                    <a
                      className="v4-winner-share-icon"
                      title="Share on Facebook"
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FacebookLogo weight="bold" size={16} />
                    </a>
                    <a
                      className="v4-winner-share-icon"
                      title="Share on LinkedIn"
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkedinLogo weight="bold" size={16} />
                    </a>
                    <button
                      type="button"
                      className="v4-winner-share-icon"
                      title="Download for Instagram"
                      onClick={() => window.alert('Downloads the share card so you can upload it to Instagram (no web share API for IG)')}
                    >
                      <InstagramLogo weight="bold" size={16} />
                    </button>
                  </div>
                </div>

                {/* Customize your branding — collapsible row. Lets the
                    creator swap the segment color, upload their own logo,
                    and hide NamingContest branding. Applies to BOTH the
                    share card and the PDF report. */}
                <div className={`v4-winner-customizer ${customizerOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="v4-winner-customizer-trigger"
                    onClick={() => setCustomizerOpen((v) => !v)}
                    aria-expanded={customizerOpen}
                  >
                    <Palette weight="duotone" size={14} />
                    <span>Customize your branding</span>
                    <CaretDown
                      weight="bold"
                      size={11}
                      style={{
                        marginLeft: 'auto',
                        transform: customizerOpen ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>

                  {customizerOpen && (
                    <div className="v4-winner-customizer-body">
                      {/* Color presets + a custom color picker swatch */}
                      <div className="v4-winner-customizer-field">
                        <div className="v4-winner-customizer-label">Card color</div>
                        <div className="v4-winner-customizer-swatches">
                          {[
                            { id: null,        bg: segmentTone.bg, label: 'Default (segment)' },
                            { id: '#fadecc',   bg: '#fadecc', label: 'Blush' },
                            { id: '#fceebc',   bg: '#fceebc', label: 'Butter' },
                            { id: '#bce5c8',   bg: '#bce5c8', label: 'Mint' },
                            { id: '#c4cff5',   bg: '#c4cff5', label: 'Periwinkle' },
                            { id: '#c4dffb',   bg: '#c4dffb', label: 'Sky' },
                          ].map((s) => (
                            <button
                              key={s.id || 'default'}
                              type="button"
                              className={`v4-winner-customizer-swatch ${customColor === s.id ? 'is-selected' : ''}`}
                              style={{ background: s.bg }}
                              onClick={() => setCustomColor(s.id)}
                              title={s.label}
                              aria-label={s.label}
                            />
                          ))}
                          {/* Custom color picker — clicking opens the
                              native color picker. If a custom (non-preset)
                              color is active, the swatch shows it. */}
                          <label
                            className={`v4-winner-customizer-swatch v4-winner-customizer-swatch-custom ${
                              customColor && !['#fadecc','#fceebc','#bce5c8','#c4cff5','#c4dffb'].includes(customColor)
                                ? 'is-selected'
                                : ''
                            }`}
                            style={{
                              background: customColor && !['#fadecc','#fceebc','#bce5c8','#c4cff5','#c4dffb'].includes(customColor)
                                ? customColor
                                : 'conic-gradient(from 0deg, #fadecc, #fceebc, #bce5c8, #c4cff5, #c4dffb, #fadecc)',
                            }}
                            title="Custom color"
                            aria-label="Pick a custom color"
                          >
                            <input
                              type="color"
                              className="v4-winner-customizer-swatch-input"
                              value={customColor || '#fadecc'}
                              onChange={(e) => setCustomColor(e.target.value)}
                            />
                            <span className="v4-winner-customizer-swatch-plus" aria-hidden="true">+</span>
                          </label>
                        </div>
                      </div>

                      {/* Logo upload */}
                      <div className="v4-winner-customizer-field">
                        <div className="v4-winner-customizer-label">Your logo</div>
                        <div className="v4-winner-customizer-logo-row">
                          {customLogo && (
                            <img
                              src={customLogo}
                              alt="Custom logo preview"
                              className="v4-winner-customizer-logo-preview"
                            />
                          )}
                          <label className="v4-winner-customizer-upload">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 1024 * 1024) {
                                  window.alert('Logo must be under 1 MB.');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (ev) => setCustomLogo(ev.target?.result);
                                reader.readAsDataURL(file);
                              }}
                              style={{ display: 'none' }}
                            />
                            <UploadSimple weight="bold" size={13} />
                            {customLogo ? 'Replace logo' : 'Upload logo'}
                          </label>
                          {customLogo && (
                            <button
                              type="button"
                              className="v4-winner-customizer-link"
                              onClick={() => setCustomLogo(null)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="v4-winner-customizer-hint">
                          PNG or SVG, transparent background works best.
                        </p>
                      </div>

                      {/* Hide NamingContest branding */}
                      <div className="v4-winner-customizer-field">
                        <label className="v4-winner-customizer-toggle">
                          <input
                            type="checkbox"
                            checked={hideBranding}
                            onChange={(e) => setHideBranding(e.target.checked)}
                          />
                          <span>Hide NamingContest branding entirely</span>
                        </label>
                        <p className="v4-winner-customizer-hint">
                          Removes NamingContest marks from the share card
                          and the PDF report. Pure white-label.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prize card — only if a prize was configured */}
                {liveSettingsAnswers.submitterPrize?.enabled && (
                  <section
                    className="v4-winner-prize"
                    style={{
                      '--winner-tint-bg': segmentTone.bg,
                      '--winner-tint-border': segmentTone.fg + '33',
                    }}
                  >
                    <span
                      className="v4-winner-prize-icon"
                      style={{ background: segmentTone.bg, color: segmentTone.fg }}
                      aria-hidden="true"
                    >
                      <Gift weight="duotone" size={20} />
                    </span>
                    <div className="v4-winner-prize-text">
                      <div className="v4-winner-prize-eyebrow">Prize</div>
                      <div className="v4-winner-prize-line">
                        <strong>{winnerSubmitter?.name}</strong> wins{' '}
                        <em>“{liveSettingsAnswers.submitterPrize.name || 'the prize'}”</em>
                      </div>
                      {liveSettingsAnswers.submitterPrize.text && (
                        <p className="v4-winner-prize-desc">
                          {liveSettingsAnswers.submitterPrize.text}
                        </p>
                      )}
                    </div>
                  </section>
                )}

                {/* Story behind the name */}
                <section className="v4-winner-story">
                  <header className="v4-winner-story-head">
                    <Quotes weight="duotone" size={16} />
                    <h2>The story behind the name</h2>
                  </header>
                  {winnerName.tagline && (
                    <p className="v4-winner-story-tagline">
                      “{winnerName.tagline}”
                    </p>
                  )}
                  <dl className="v4-winner-story-list">
                    {winnerName.description && (
                      <div className="v4-winner-story-field">
                        <dt>{winnerSubmitter?.name?.split(' ')[0] || 'Sarah'} said</dt>
                        <dd>{winnerName.description}</dd>
                      </div>
                    )}
                    {winnerName.whyItFits && (
                      <div className="v4-winner-story-field">
                        <dt>Why it fits</dt>
                        <dd>{winnerName.whyItFits}</dd>
                      </div>
                    )}
                    {winnerName.inspiration && (
                      <div className="v4-winner-story-field">
                        <dt>What inspired it</dt>
                        <dd>{winnerName.inspiration}</dd>
                      </div>
                    )}
                  </dl>
                </section>

                {/* Close behind — top 5 non-winners */}
                <section className="v4-winner-runners">
                  <header className="v4-winner-runners-head">
                    <h2>Close behind</h2>
                    <span className="v4-winner-runners-meta">
                      {stats.submissions} names total
                    </span>
                  </header>
                  <ul className="v4-winner-runners-list">
                    {runnersUp.map((n, i) => {
                      const sub = getLiveParticipantById(n.submittedBy);
                      return (
                        <li key={n.id} className="v4-winner-runners-row">
                          <span className="v4-winner-runners-rank">#{i + 2}</span>
                          <div className="v4-winner-runners-name">
                            <div className="v4-winner-runners-name-text">{n.text}</div>
                            <div className="v4-winner-runners-name-meta">
                              {sub?.name} · {n.voteCount} {n.voteCount === 1 ? 'vote' : 'votes'}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </>
            )}

            {/* ── Live Results — names + participants ──
                When the contest is the demo mock (no real launched
                contest), populate from mock data. Real contests show
                an empty state until backend submissions are wired.
                Hidden when a winner has been picked. */}
            {!isWinnerPicked && (
              <LiveResults
                tone={segmentTone}
                palette={segmentPalette}
                names={liveData.names}
                participants={liveData.participants}
                phase={phase}
              />
            )}

            {/* ── Share card (PRIMARY action) — hidden when winner
                has been picked since voting is closed and asking for
                more votes no longer makes sense. */}
            {!isWinnerPicked && (
            <section className="v4-manage-share">
              <header className="v4-manage-share-head">
                <div>
                  <div className="v4-manage-share-eyebrow">Share with participants</div>
                  <h2 className="v4-manage-share-title">
                    {phase === 'submission'
                      ? 'Get your names rolling in'
                      : 'Need a few more votes?'}
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
                  className="btn btn-secondary btn-sm"
                  href={`mailto:?subject=${encodeURIComponent(`Help vote for ${setup.workingName}`)}&body=${encodeURIComponent(`Vote on names here: ${shareUrl}`)}`}
                >
                  <EnvelopeSimple weight="duotone" size={16} /> Email
                </a>
                <a
                  className="btn btn-secondary btn-sm"
                  href={`sms:?body=${encodeURIComponent(`Vote on names for ${setup.workingName}: ${shareUrl}`)}`}
                >
                  <ShareNetwork weight="duotone" size={16} /> Message
                </a>
                <a
                  className="btn btn-secondary btn-sm"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Help me name ${setup.workingName} →`)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  𝕏  Post
                </a>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigator.share({ title: setup.workingName, url: shareUrl })}
                  >
                    <ShareNetwork weight="duotone" size={16} /> More…
                  </button>
                )}
              </div>

              <div className="v4-manage-share-foot">
                <div className="v4-manage-share-avatars" aria-hidden="true">
                  {/* Boring Avatars of the first 3 actual participants
                      — same vocabulary used in Live Results, so the
                      faces stay consistent across surfaces. Falls
                      back to the demo names if no participants yet. */}
                  {(liveData.participants.slice(0, 3).length > 0
                    ? liveData.participants.slice(0, 3).map((p) => p.name)
                    : ['Sam O’Brien', 'Marcus Wright', 'Dan Patel']
                  ).map((nm, i) => (
                    <span
                      key={i}
                      className="v4-manage-share-avatar"
                      style={{ '--avatar-feature': '#030302' }}
                    >
                      <Avatar
                        name={nm}
                        size={30}
                        variant="beam"
                        colors={segmentPalette}
                        square={false}
                      />
                    </span>
                  ))}
                </div>
                <span className="v4-manage-share-meta-bold">
                  {(() => {
                    const featured = liveData.participants.slice(0, 3).map((p) => p.name);
                    const remaining = Math.max(0, stats.participants - featured.length);
                    return remaining > 0
                      ? `${featured.join(', ')} and ${remaining} others joined`
                      : `${featured.join(', ')} joined`;
                  })()}
                </span>
              </div>
            </section>
            )}

            {/* ── Your contest journey — hidden on winner-picked state
                since the contest is concluded and lifecycle is moot. */}
            {!isWinnerPicked && (
            <section
              className="v4-manage-wait"
              style={{
                '--journey-active-bg': segmentTone.bg,
                '--journey-active-border': segmentTone.fg + '33',
              }}
            >
              {(() => {
                // Step index of the active phase (1-based) for the eyebrow.
                const stepIndex = phase === 'submission' ? 1
                  : phase === 'voting' ? 2
                  : 3;
                const eyebrowText = isWinnerPicked
                  ? 'All stages complete · 🎉'
                  : `Stage ${stepIndex} of 3`;
                return (
                  <>
                    <div className="v4-manage-wait-eyebrow">{eyebrowText}</div>
                    <h2 className="v4-manage-wait-title">Your contest journey</h2>
                    <p className="v4-manage-wait-lede">
                      Here’s where your contest stands right now.
                    </p>
                  </>
                );
              })()}

              {/* Three steps mirror the three real contest phases. The
                  third step "Winner" has two sub-states: needs-picking
                  (active CTA) and picked (done).
                  Steps are display-only — lifecycle stages are reached
                  via the platform map, not by clicking these cards. */}
              <div className="v4-manage-wait-steps">

                {/* Step 1 — Submissions */}
                <div
                  className={`v4-manage-wait-step ${
                    phase === 'submission' ? 'is-active' : 'is-done'
                  }`}
                >
                  <span className="v4-manage-wait-step-icon" aria-hidden="true">
                    <PaperPlaneTilt weight="duotone" size={22} />
                  </span>
                  <div className="v4-manage-wait-step-text">
                    <div className="v4-manage-wait-step-status">
                      {phase === 'submission' && (
                        <span className="v4-manage-wait-step-pulse" aria-hidden="true"></span>
                      )}
                      {phase === 'submission' ? 'Now' : 'Done'}
                      <span className="v4-manage-wait-step-meta">
                        {phase === 'submission'
                          ? `${stats.submissions} names so far · Closes ${formatDaysFrom(launchedAt, submissionDays)}`
                          : `${stats.submissions} names · ${stats.participants} joined`}
                      </span>
                    </div>
                    <h3>Submissions</h3>
                    <p>
                      {phase === 'submission'
                        ? 'Share your link and watch the names roll in. The more people you invite, the richer the shortlist.'
                        : 'Submissions are closed — every name that came in is now up for the vote.'}
                    </p>
                  </div>
                </div>

                {/* Step 2 — Voting */}
                <div
                  className={`v4-manage-wait-step ${
                    phase === 'submission' ? 'is-upcoming'
                      : phase === 'voting' ? 'is-active'
                      : 'is-done'
                  }`}
                >
                  <span className="v4-manage-wait-step-icon" aria-hidden="true">
                    <Eye weight="duotone" size={22} />
                  </span>
                  <div className="v4-manage-wait-step-text">
                    <div className="v4-manage-wait-step-status">
                      {phase === 'voting' && (
                        <span className="v4-manage-wait-step-pulse" aria-hidden="true"></span>
                      )}
                      {phase === 'voting' ? 'Now'
                        : phase === 'submission' ? 'Up next'
                        : 'Done'}
                      <span className="v4-manage-wait-step-meta">
                        {phase === 'voting'
                          ? `Voting ends ${formatDaysFrom(launchedAt, submissionDays + votingDays)} (${formatDate(launchedAt, submissionDays + votingDays)})`
                          : phase === 'submission'
                          ? `Opens ${formatDate(launchedAt, submissionDays)}`
                          : `${stats.votes} votes cast`}
                      </span>
                    </div>
                    <h3>Voting</h3>
                    <p>
                      {phase === 'voting'
                        ? 'Voting is live. Picks roll in as they happen — no need to refresh or keep watching.'
                        : phase === 'submission'
                        ? 'Once submissions close, your people vote on the names. You’ll watch the leaderboard fill in live.'
                        : 'Voting is closed and the leaderboard is final — the top names are locked in.'}
                    </p>
                  </div>
                </div>

                {/* Step 3 — Winner (active when needs-picking, done when picked) */}
                <div
                  className={`v4-manage-wait-step ${
                    phase !== 'winner' ? 'is-upcoming'
                      : isWinnerPicked ? 'is-done'
                      : 'is-active'
                  }`}
                >
                  <span className="v4-manage-wait-step-icon" aria-hidden="true">
                    <Trophy weight="duotone" size={22} />
                  </span>
                  <div className="v4-manage-wait-step-text">
                    <div className="v4-manage-wait-step-status">
                      {phase === 'winner' && !isWinnerPicked && (
                        <span className="v4-manage-wait-step-pulse" aria-hidden="true"></span>
                      )}
                      {phase === 'winner' && !isWinnerPicked ? 'Now'
                        : isWinnerPicked ? 'Done'
                        : 'Up next'}
                      <span className="v4-manage-wait-step-meta">
                        {isWinnerPicked
                          ? 'Winner picked · share the results'
                          : formatDate(launchedAt, submissionDays + votingDays)}
                      </span>
                    </div>
                    <h3>Winner</h3>
                    <p>
                      {phase === 'winner' && !isWinnerPicked
                        ? 'Voting is closed. Time to crown the winner — the top vote, or any name that won your heart.'
                        : isWinnerPicked
                        ? 'You crowned the winner. Download the share card or export the full report below.'
                        : 'When voting wraps, the leaderboard is yours. You make the final call — the top vote, or any name that won your heart.'}
                    </p>
                    {phase === 'winner' && !isWinnerPicked && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setPickWinnerOpen(true)}
                      >
                        <Trophy weight="bold" size={14} />
                        Pick the winner
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </section>
            )}

            {/* ── Brief recap — reference material, hidden once the
                winner is picked (contest is concluded, brief is moot). */}
            {!isWinnerPicked && (
              <BriefRecapCollapser
                filledBrief={filledBrief}
                filledSettings={filledSettings}
                briefAnswers={liveBriefAnswers}
                settingsAnswers={liveSettingsAnswers}
                onEditBrief={(q) => setEditingQuestion({ question: q, section: 'brief' })}
                onEditSettings={(q) => setEditingQuestion({ question: q, section: 'settings' })}
              />
            )}

            {/* ── Footer actions ────────────────────────────────────
                Winner phase shows the Catchword consult block instead
                of the Cancel button (contest is already over —
                cancelling doesn't apply, but a "didn't find what you
                wanted? hire the pros" nudge does). */}
            {isWinnerPicked ? (
              <CatchwordConsultBlock
                headline="Still hunting for the perfect name?"
                body={<>The crowd voted, but if it’s not <em>quite</em> there — Catchword is the naming agency NamingContest is built on top of. Book a session for a deeper look.</>}
              />
            ) : (
              <div className="v4-manage-actions">
                <button
                  type="button"
                  className="btn btn-link v4-btn-danger"
                  onClick={() => setCancelOpen(true)}
                >
                  Cancel contest
                </button>
              </div>
            )}

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
          palette={segmentPalette}
        />

        {/* Cancel-contest confirm — on-brand replacement for confirm() */}
        <ConfirmModal
          open={cancelOpen}
          danger
          title="Cancel this contest?"
          body="This can’t be undone — every name and vote so far will be discarded."
          confirmLabel="Cancel contest"
          cancelLabel="Keep it"
          onClose={() => setCancelOpen(false)}
          onConfirm={() => {
            // Mark the contest as cancelled in setup + record an entry
            // the workspace renders under a "Cancelled" section, then
            // send the creator to the workspace where they'll see it.
            const cur = readSetup();
            const cancelledList = Array.isArray(cur.cancelledContests)
              ? cur.cancelledContests
              : [];
            writeSetup({
              cancelledContests: [
                ...cancelledList,
                {
                  id: cur.contestId || id,
                  workingName: cur.workingName || mockContest?.workingName || 'Your contest',
                  subSegmentId: cur.subSegmentId || mockContest?.subSegmentId,
                  cancelledAt: Date.now(),
                },
              ],
              contestId: null,
              workingName: null,
              launchedAt: null,
            });
            setCancelOpen(false);
            navigate('/v4/settings');
          }}
        />

        {/* Hidden off-screen PDF report — captured by the export
            utility when the user clicks "Download full report". The
            ref attaches directly to the absolutely-positioned report
            element (forwardRef inside PdfReport) so html-to-image
            captures the real 794×1123 box, not a 0×0 wrapper. */}
        {isWinnerPicked && winnerName && (
          <PdfReport
            ref={pdfReportRef}
            contestName={setup.workingName || 'Your contest'}
            segmentLabel={segmentLabel}
            subId={subId}
            tone={customColor
              ? { bg: customColor, fg: segmentTone.fg }
              : segmentTone}
            customColor={customColor}
            winner={winnerName}
            submitter={winnerSubmitter}
            prize={liveSettingsAnswers.submitterPrize}
            names={liveData.names}
            stats={stats}
            durationDays={submissionDays + votingDays}
            hideBranding={hideBranding}
            customLogo={customLogo}
          />
        )}

        {/* Pick-the-winner modal */}
        <PickWinnerModal
          open={pickWinnerOpen}
          onClose={() => setPickWinnerOpen(false)}
          tone={segmentTone}
          palette={segmentPalette}
          prize={liveSettingsAnswers.submitterPrize}
          names={liveData.names}
          participants={liveData.participants}
          onConfirm={(nameId) => {
            // Close the modal first so the celebration is unobstructed,
            // then flip the URL into the picked sub-state. ContestManage
            // re-renders into the winner celebration view, which animates
            // in (see .v4-winner-* CSS). A confetti burst punctuates the
            // moment so it feels like a real "win," not a state change.
            setPickWinnerOpen(false);
            // Persist the crowned winner so the workspace (My Namespace)
            // reflects "winner picked" instead of still showing voting.
            // Keyed by contestId so it only applies to this contest.
            const winnerText = liveData.names.find((n) => n.id === nameId)?.text || null;
            writeSetup({ winner: { contestId: id, nameId, name: winnerText } });
            // Scroll the internal review container (NOT window) — the
            // page itself doesn't scroll on v4 surfaces; .v4-review is
            // the overflow:auto container.
            const scroller = document.querySelector('.v4-review');
            scroller?.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
              const params = new URLSearchParams(searchParams);
              params.set('phase', 'winner');
              params.set('winner', nameId);
              setSearchParams(params, { replace: true });
              // Ensure we're at top after the re-render lands too. The
              // confetti burst itself is fired by the winner-state effect
              // above (so it also runs when arriving from the map).
              scroller?.scrollTo({ top: 0, behavior: 'smooth' });
            }, 250);
          }}
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
