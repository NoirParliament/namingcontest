// V4 contest manage page — single workspace for one contest, content
// adapts based on phase (submission / voting / closed). For Slice 1 we
// build the submission-phase view. Voting + results views come later
// inside the same shell.
//
// URL: /v4/contest/[id]
// From: Launch button on /v4/setup/review
// Future: dashboard list links here per contest

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  X, Heart, UsersThree, Briefcase,
  Copy, Check, EnvelopeSimple, ShareNetwork,
  PencilSimple, CalendarBlank, Hash, Clock,
  PaperPlaneTilt, Eye, Trophy, Lightbulb, Confetti,
  Gift, FilePdf, Quotes, LinkSimple,
  LinkedinLogo,
  Palette, CaretDown, UploadSimple,
} from '@phosphor-icons/react';
import Avatar from 'boring-avatars';
import UserAvatar from '../../components/v4/UserAvatar';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import creatorProfile from '../../assets/creator-profile.png';
import {
  readSetup, writeSetup, getSegmentLabel, getContestDescriptor, getQuestionsFor,
} from '../../utils/v4Brief';
import { buildLiveData, buildLiveDataFromReal } from '../../utils/v4LiveData';
import { getMockContestById } from '../../data/v4/mockContests';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import {
  BRIEF_QUESTIONS, SHARED_SETTINGS_QUESTIONS, INTRO_QUESTION,
} from '../../data/v4/briefQuestions';
import { SegmentThemeBackdrop, getSegmentTone, getSegmentPalette, getSegmentIcon } from '../../data/v4/segmentTheme';
import confetti from 'canvas-confetti';
import EditQuestionModal from '../../components/v4/EditQuestionModal';
import ActivityFlyOver from '../../components/v4/ActivityFlyOver';
import LiveResults from '../../components/v4/LiveResults';
import AvatarMenu from '../../components/v4/AvatarMenu';
import PickWinnerModal from '../../components/v4/PickWinnerModal';
import ConfirmModal from '../../components/v4/ConfirmModal';
import SignInModal from '../../components/v4/SignInModal';
import WinnerHero from '../../components/v4/WinnerHero';
import CatchwordConsultBlock from '../../components/v4/CatchwordConsultBlock';
import PdfReport from '../../components/v4/PdfReport';
// downloadShareCard still exists in v4ContestExport for future use — nothing
// calls it now that Instagram's button is gone (it downloaded a card while
// claiming to share) and the share-card button was replaced by Copy link.
import { downloadFullReport } from '../../utils/v4ContestExport';
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
  const { user, loading: authLoading } = useAuth();
  // Real signed-in identity for the account menu (avatar + email), so the
  // manage page shows YOU, not the mock creator photo.
  const [profile, setProfile] = useState(null);
  const [signinOpen, setSigninOpen] = useState(false);
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => { if (active && data) setProfile(data); });
    return () => { active = false; };
  }, [user?.id]);

  const mockContest = getMockContestById(id);
  const realSetup = readSetup();

  // Real (DB) contest. If the workspace passed the contest via navigation
  // state, use it immediately (no loading flash / correct color instantly);
  // otherwise fetch it. Either way we refresh from the DB in the background.
  const location = useLocation();
  const preloaded = location.state?.contest || null;
  const [dbContest, setDbContest] = useState(preloaded);
  const [dbLoading, setDbLoading] = useState(!mockContest && !preloaded);
  useEffect(() => {
    if (mockContest) { setDbLoading(false); return; }
    // Wait for auth to resolve before asking. RLS returns a contest only to
    // its creator or a participant, so querying while the session is still
    // being established comes back empty — and arriving from a magic link is
    // exactly that moment: supabase-js is still turning the URL hash into a
    // session when this first runs.
    if (authLoading) return;
    let active = true;
    supabase.from('contests').select('*').eq('id', id).single().then(({ data }) => {
      if (!active) return;
      if (data) setDbContest(data);
      setDbLoading(false);
    });
    return () => { active = false; };
    // user?.id is a dependency so signing in refetches. Without it the empty
    // result from the signed-out moment stuck, and someone who had just
    // followed a sign-in link sat on a page telling them to sign in.
  }, [id, mockContest, authLoading, user?.id]);

  const setup = mockContest
    ? { ...realSetup, ...mockContest, contestId: mockContest.id }
    : dbContest
      ? {
          contestId: dbContest.id,
          workingName: dbContest.working_name,
          subSegmentId: dbContest.sub_segment_id,
          subSegmentTitle: dbContest.sub_segment_title,
          group: dbContest.tier,
          brief: dbContest.brief || {},
          settings: dbContest.settings || {},
          voterTier: dbContest.voter_tier,
          launchedAt: dbContest.launched_at ? new Date(dbContest.launched_at).getTime() : Date.now(),
        }
      // A real contest id that didn't load falls back to NOTHING, not to the
      // localStorage blob. It used to use realSetup, so opening a manage link
      // while signed out — which is what happens when the receipt email is
      // read in a different browser — rendered your old guest contest's name,
      // segment and brief at a real contest's URL. It looked like the demo
      // because it WAS the demo, dressed in a real URL.
      : (mockContest ? realSetup : {});
  const subId = setup.subSegmentId || 'b1';

  // Phase: a mock/demo contest uses the URL ?phase= param (defaults to
  // voting). A real contest uses its DB status — a fresh launch is in the
  // submission phase — unless the URL explicitly overrides it.
  const phaseParam = searchParams.get('phase');
  const STATUS_PHASE = { submission: 'submission', voting: 'voting', closed: 'winner' };
  const phase = mockContest
    // Demo/mock contests are driven by the URL ?phase= (defaults to voting).
    ? (PHASES.includes(phaseParam) ? phaseParam : 'voting')
    // A real contest ALWAYS follows its true DB status — never a URL override —
    // so the stage pill, journey and countdowns can't disagree with reality.
    : (dbContest ? (STATUS_PHASE[dbContest.status] || 'submission') : 'submission');
  // Sub-state of the "winner" phase: the picked winner's id, or null when the
  // creator still needs to pick. A real contest stores it on the row
  // (winner_submission_id); the demo uses ?winner= / setup.winner.
  const winnerNameId = (!mockContest ? dbContest?.winner_submission_id : null)
    || searchParams.get('winner') || setup.winner?.nameId || null;
  const isWinnerPicked = phase === 'winner' && !!winnerNameId;
  // ── Real submissions + live vote counts (creator dashboard) ─────────
  // For a real contest, load its actual submissions (with the denormalized
  // vote_count), the joined-participant count, and submitter display names.
  // A realtime channel re-loads on any submission/vote change so the creator
  // watches entries and votes arrive live; window focus is a fallback.
  const [realSubs, setRealSubs] = useState(null);
  const [realParticipantCount, setRealParticipantCount] = useState(0);
  const [profilesById, setProfilesById] = useState({});
  useEffect(() => {
    if (mockContest || !dbContest?.id) return;
    const cid = dbContest.id;
    let active = true;
    const load = async () => {
      const [subsRes, partRes] = await Promise.all([
        supabase.from('submissions')
          .select('id, text, rationale, credited, user_id, vote_count, created_at')
          .eq('contest_id', cid)
          .order('created_at', { ascending: true }),
        supabase.from('participants').select('id', { count: 'exact', head: true }).eq('contest_id', cid),
      ]);
      if (!active) return;
      const subs = subsRes.data || [];
      // Resolve names + avatars for credited submitters (profiles_read is open)
      // so the dashboard shows the same face each participant sees for itself.
      const ids = [...new Set(subs.filter((s) => s.credited).map((s) => s.user_id))];
      let profs = {};
      if (ids.length) {
        const { data: pr } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', ids);
        (pr || []).forEach((p) => { profs[p.id] = { name: p.display_name, avatarUrl: p.avatar_url }; });
      }
      if (!active) return;
      setRealSubs(subs);
      setRealParticipantCount(partRes.count || 0);
      setProfilesById(profs);
    };
    load();
    const channel = supabase
      .channel(`contest-live-${cid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions', filter: `contest_id=eq.${cid}` }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `contest_id=eq.${cid}` }, load)
      // The cron phase flip (submission→voting→closed) updates the contest row;
      // pick it up live so the stage, journey and countdowns move on their own.
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'contests', filter: `id=eq.${cid}` }, (payload) => {
        if (payload.new) setDbContest(payload.new);
      })
      .subscribe();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => {
      active = false;
      supabase.removeChannel(channel);
      window.removeEventListener('focus', onFocus);
    };
  }, [mockContest, dbContest?.id]);

  // Per-contest live dataset. Mock/demo contests derive a synthetic set from
  // their own allSubmissions; a real contest uses its real DB rows + counts.
  const liveData = useMemo(
    () => mockContest
      ? buildLiveData(mockContest, phase)
      : buildLiveDataFromReal(realSubs || [], profilesById, realParticipantCount, phase),
    [mockContest, phase, realSubs, profilesById, realParticipantCount]
  );
  // Is there anything to crown? A closed contest with no submissions has an
  // empty leaderboard — the pick-winner flow must not be offered for it.
  const hasNamesToCrown = (liveData.names?.length || 0) > 0;

  // 2026-08-18 (client decision): a real contest locks at launch — the launch
  // modal says "Your contest can't be edited after launch", and this is what
  // makes that true. Used to allow edits until the first submission; now the
  // recap is read-only for every real contest. Demo/mock contests stay
  // editable (they're a sandbox, not a launched contest).
  const briefEditable = !!mockContest;
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
  const segmentLabel = getContestDescriptor(setup).replace(/\s*\([^)]*\)\s*$/, '');
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

  // Brief + settings answers (for the recap collapser). Use getQuestionsFor
  // so the recap matches the effective brief (cuts/merges applied) and picks
  // up customRequirements, which now closes the brief. The intro (written on
  // the review page, not in the chat) leads the recap so it stays editable
  // after launch through the same modal.
  const briefQuestions = [INTRO_QUESTION, ...getQuestionsFor(subId, null)];
  const settingsAnswers = setup.settings || {};
  const briefAnswers = { ...(setup.brief || {}) };
  // customRequirements moved from settings to the brief (2026-08-17); older
  // contests still store it under settings, so fall back for display.
  if (briefAnswers.customRequirements == null && settingsAnswers.customRequirements != null) {
    briefAnswers.customRequirements = settingsAnswers.customRequirements;
  }
  const filledBrief = briefQuestions.filter((q) => briefAnswers[q.id] !== undefined);
  const filledSettings = SHARED_SETTINGS_QUESTIONS.filter((q) => settingsAnswers[q.id] !== undefined);

  // Phase timing. A real contest reads its actual submission_ends_at /
  // voting_ends_at — the very timestamps the cron job flips on — so the
  // countdowns can never disagree with the real transition. Mock/demo (or a
  // contest missing the columns) falls back to the settings day counts.
  const launchedAt = setup.launchedAt || Date.now();
  const MS_DAY = 86400000;
  const subEndsAt = !mockContest && dbContest?.submission_ends_at ? new Date(dbContest.submission_ends_at).getTime() : null;
  const voteEndsAt = !mockContest && dbContest?.voting_ends_at ? new Date(dbContest.voting_ends_at).getTime() : null;
  const submissionDays = subEndsAt ? Math.max(1, Math.round((subEndsAt - launchedAt) / MS_DAY)) : (settingsAnswers.submissionDays || 7);
  const votingDays = (voteEndsAt && subEndsAt) ? Math.max(1, Math.round((voteEndsAt - subEndsAt) / MS_DAY)) : (settingsAnswers.votingDays || 3);

  const [copied, setCopied] = useState(false);
  // Separate from `copied`: the invite link and the winner link can both be
  // on screen, and one confirming shouldn't tick the other.
  const [winnerCopied, setWinnerCopied] = useState(false);
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
  // (and the segment). Every field here is real: the status strip used to
  // carry a hardcoded "last vote 32 sec ago", which claimed activity on
  // contests where nobody had voted. There's no timestamp available to
  // replace it — votes_read RLS deliberately limits each voter to their own
  // rows, so a creator can't read vote times without breaking ballot
  // secrecy — so the strip shows the vote COUNT, which is aggregated onto
  // submissions.vote_count and already legitimately visible.
  const stats = liveData.stats;

  // Edit modal state
  const [editingQuestion, setEditingQuestion] = useState(null);  // {question, section}
  // Force re-render of recap when answers change
  const [editTick, setEditTick] = useState(0);
  // For mock contests we want the recap to show the mock's pre-filled
  // brief answers, not the user's real (likely empty) ones. The merge
  // mirrors what we do for `setup` above so the recap stays coherent.
  const liveSetup = useMemo(() => {
    const real = readSetup();
    if (mockContest) return { ...real, ...mockContest, contestId: mockContest.id };
    // Real contest → show ITS brief/settings (from the DB), not the stale
    // localStorage blob, so the creator sees their actual answers.
    if (dbContest) {
      return {
        ...real,
        contestId: dbContest.id,
        workingName: dbContest.working_name,
        subSegmentId: dbContest.sub_segment_id,
        group: dbContest.tier,
        brief: dbContest.brief || {},
        settings: dbContest.settings || {},
      };
    }
    return real;
  }, [editTick, mockContest, dbContest]);
  const liveBriefAnswers = { ...(liveSetup.brief || {}) };
  const liveSettingsAnswers = liveSetup.settings || {};
  // customRequirements moved from settings to the brief (2026-08-17); older
  // contests (and the mock/demo data) still store it under settings, so fall
  // back so the recap renders its value in the Brief group, not "undefined".
  if (liveBriefAnswers.customRequirements == null && liveSettingsAnswers.customRequirements != null) {
    liveBriefAnswers.customRequirements = liveSettingsAnswers.customRequirements;
  }

  const handleEditSave = async (newValue) => {
    if (!editingQuestion) return;
    const { question, section } = editingQuestion;
    if (dbContest && !mockContest && (section === 'brief' || section === 'settings')) {
      // Real contest → persist the edit to the database and update state.
      const updated = { ...(dbContest[section] || {}), [question.id]: newValue };
      await supabase.from('contests').update({ [section]: updated }).eq('id', dbContest.id);
      setDbContest((c) => (c ? { ...c, [section]: updated } : c));
    } else {
      const cur = readSetup();
      if (section === 'brief') {
        writeSetup({ brief: { ...(cur.brief || {}), [question.id]: newValue } });
      } else if (section === 'settings') {
        writeSetup({ settings: { ...(cur.settings || {}), [question.id]: newValue } });
      }
    }
    setEditTick((t) => t + 1);
  };

  // Two different links, for two different moments.
  //   shareUrl  — the invitation. Correct while names are still wanted.
  //   winnerUrl — the public result. Everything on the winner surface points
  //               here; it used to point at shareUrl, so celebrating a
  //               finished contest sent people to a "help name this" page for
  //               something that already had a name. The reveal reads through
  //               get_winner_info, which is security definer and granted to
  //               anon, so a stranger with the link needs no account.
  const shareUrl = `${window.location.origin}/v4/join/${id}`;
  const winnerUrl = `${window.location.origin}/v4/contest/${id}/reveal`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback or noop
    }
  };

  // Post body for X. Leads with the name because that's the news, and states
  // how it was chosen — a name picked by a crowd is a better story than a
  // name announced. The vote count is dropped when it's absent rather than
  // printing "0 votes" under a winner the creator picked directly.
  const winnerVotes = winnerName?.voteCount ?? 0;
  const shareText = [
    `Meet “${winnerName?.text ?? ''}” — the new name for ${setup.workingName || 'our project'}.`,
    winnerVotes > 0
      ? `Chosen by ${winnerVotes} vote${winnerVotes === 1 ? '' : 's'} in a naming contest. 🏆`
      : 'Picked from a naming contest. 🏆',
  ].join(' ');

  const handleCopyWinner = async () => {
    try {
      await navigator.clipboard.writeText(winnerUrl);
      setWinnerCopied(true);
      setTimeout(() => setWinnerCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (permissions, insecure context) — staying
      // silent is fine here; the social buttons alongside still work.
    }
  };

  // Loaded, but nothing came back. RLS only returns a contest to its creator,
  // a participant, or anyone once it's closed — so this is almost always
  // "you're not signed in", which is the normal case for a link opened from
  // email in another browser.
  if (!mockContest && !authLoading && !dbLoading && !dbContest) {
    return (
      <div className="v4 lp-v3">
        <div className="v4-screen">
          <SegmentThemeBackdrop subId={subId} minimal />
          <main className="v4-review" role="main">
            {/* The nav isn't decoration here. This page is most often reached
                from an email link, so it's the first thing someone sees —
                without the logo there's nothing saying whose site this is,
                and without the avatar someone signed into the WRONG account
                has no way to switch. A dead end that can't be left is worse
                than the error it's reporting. */}
            <header className="v4-nav v4-nav-clear">
              <BrandLink />
              {user && (
                <div className="v4-nav-right" style={{ gridColumn: 3, justifySelf: 'end' }}>
                  <AvatarMenu
                    email={user.email}
                    name={profile?.display_name || user.email?.split('@')[0] || 'You'}
                    photo={profile?.avatar_url || null}
                    seed={user.id}
                    tone={segmentTone}
                  />
                </div>
              )}
            </header>
            <div className="v4-review-inner" style={{ textAlign: 'center', paddingTop: 72 }}>
              <h1 className="v4-review-title">Sign in to open this contest</h1>
              <p className="v4-review-subtitle" style={{ maxWidth: '42ch', margin: '10px auto 26px' }}>
                {user
                  ? 'This contest isn’t on your account. If someone else set it up, ask them to send you their invitation link.'
                  : 'You’re signed out in this browser. Sign in with the email you used and we’ll bring you straight here.'}
              </p>
              {!user && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => setSigninOpen(true)}
                >
                  <PaperPlaneTilt weight="bold" size={14} />
                  Send me a sign-in link
                </button>
              )}
            </div>
          </main>
          <SignInModal
            open={signinOpen}
            onClose={() => setSigninOpen(false)}
            redirectPath={`/v4/contest/${id}`}
          />
        </div>
      </div>
    );
  }

  // While a real contest is still loading, show a calm loading state rather
  // than flashing the stale default ("Your Contest", blue) first.
  if (!mockContest && dbLoading) {
    let loadingSub = dbContest?.sub_segment_id;
    if (!loadingSub) { try { loadingSub = localStorage.getItem('v4_last_sub'); } catch { /* ignore */ } }
    return (
      <div className="v4 lp-v3">
        <div className="v4-screen">
          <SegmentThemeBackdrop subId={loadingSub || 'b1'} minimal />
          <main className="v4-review" role="main">
            <div className="v4-review-inner" style={{ textAlign: 'center', paddingTop: 120 }}>
              <p className="v4-review-subtitle">Loading your contest…</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="v4 lp-v3">
      <div className="v4-screen">
        {/* Per-segment theme decoration (carries identity from setup) */}
        <SegmentThemeBackdrop subId={subId} minimal />

        {/* Live activity fly-over disabled — dashboards stay static. */}
        <ActivityFlyOver tone={segmentTone} enabled={false} />

        <main className="v4-review" role="main">
          {/* Glass nav — same as other v4 surfaces */}
          <header className="v4-nav v4-nav-clear">
            <BrandLink />
            <div className="v4-progress">
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-dot is-done"></span>
              <span className="v4-step-label">Live</span>
            </div>
            <div className="v4-nav-right">
              <AvatarMenu
                email={user?.email || setup.userEmail}
                /* Falls back to the email's local part, as Settings does. An
                   account that has never set a display name would otherwise
                   render a nameless avatar, which reads as "not signed in"
                   rather than "no name yet". */
                name={profile?.display_name || setup.userName
                  || user?.email?.split('@')[0] || 'You'}
                photo={profile?.avatar_url || (mockContest ? creatorProfile : null)}
                seed={user?.id}
                tone={segmentTone}
                activeContest={
                  setup.contestId
                    ? {
                        id: setup.contestId,
                        name: setup.workingName || 'Your contest',
                        // Real contests show their actual phase; mock demos
                        // stay on the page's (voting) demo phase.
                        phase: mockContest ? 'Voting' : (phase === 'submission' ? 'Submissions' : phase === 'winner' ? 'Winner' : 'Voting'),
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
                    <span>
                      {stats.votes > 0
                        ? `${stats.votes} ${stats.votes === 1 ? 'vote' : 'votes'} so far`
                        : 'No votes yet'}
                    </span>
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
                {/* Action row — export the full report, then the social
                    share icons. The separate "Download share card" button is
                    gone: the report is the thing worth keeping, and the card
                    is still generated on demand by the Instagram share, which
                    has no web share API to hand it to. */}
                <div className="v4-winner-actions">
                  <button
                    type="button"
                    className="v4-winner-action v4-winner-action-primary"
                    onClick={() => downloadFullReport(
                      pdfReportRef.current,
                      setup.workingName
                    )}
                  >
                    <FilePdf weight="bold" size={14} />
                    Download full report
                  </button>
                  <button
                    type="button"
                    className="v4-winner-action"
                    onClick={handleCopyWinner}
                  >
                    {winnerCopied
                      ? <><Check weight="bold" size={14} /> Link copied</>
                      : <><LinkSimple weight="bold" size={14} /> Copy link</>}
                  </button>

                  {/* Social share icon buttons — open native share intents
                      that open a real composer, both pointed at the public
                      reveal page.

                      Only two: Facebook's sharer ignores prefilled text and
                      adds nothing over a pasted link, and Instagram has no
                      share API at all — its button was a download dressed as
                      a share. The Copy link button covers both cases better
                      than a button that lies about what it does.

                      LinkedIn takes a URL only; they dropped text prefill in
                      2021, so the post body is whatever the sharer types. */}
                  <div className="v4-winner-share-icons">
                    <a
                      className="v4-winner-share-icon"
                      title="Share on X"
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(winnerUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      𝕏
                    </a>
                    <a
                      className="v4-winner-share-icon"
                      title="Share on LinkedIn"
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(winnerUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkedinLogo weight="bold" size={16} />
                    </a>
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
                      {winnerName.anonymous ? (
                        <div className="v4-winner-prize-line">
                          <em>“{liveSettingsAnswers.submitterPrize.name || 'The prize'}”</em>{' '}
                          forfeited — the winner chose to stay anonymous.
                        </div>
                      ) : (
                        <div className="v4-winner-prize-line">
                          <strong>{winnerSubmitter?.name}</strong> wins{' '}
                          <em>“{liveSettingsAnswers.submitterPrize.name || 'the prize'}”</em>
                        </div>
                      )}
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
                        <dt>{winnerName.anonymous ? 'The winner' : (winnerSubmitter?.name?.split(' ')[0] || 'Sarah')} said</dt>
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
                simulateVotes={!!mockContest}
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

              {(() => {
                const featured = liveData.participants.slice(0, 3);
                // Real contest, nobody yet → no fake faces; a plain nudge.
                if (featured.length === 0) {
                  return (
                    <div className="v4-manage-share-foot">
                      <span className="v4-manage-share-meta-bold">
                        {phase === 'submission'
                          ? 'No one’s joined yet — share the link to get your first names in.'
                          : 'No one’s joined yet — share the link to gather votes.'}
                      </span>
                    </div>
                  );
                }
                const names = featured.map((p) => p.name);
                const remaining = Math.max(0, stats.participants - names.length);
                return (
                  <div className="v4-manage-share-foot">
                    <div className="v4-manage-share-avatars" aria-hidden="true">
                      {/* The first 3 actual participants — real contests use
                          each person's own avatar (the same face they see for
                          themselves); the demo uses segment-tinted boring
                          avatars keyed by name. */}
                      {featured.map((p, i) => (
                        <span
                          key={p.id || i}
                          className="v4-manage-share-avatar"
                          style={{ '--avatar-feature': '#030302' }}
                        >
                          {mockContest ? (
                            <Avatar
                              name={p.name}
                              size={30}
                              variant="beam"
                              colors={segmentPalette}
                              square={false}
                            />
                          ) : (
                            <UserAvatar seed={p.avatarSeed} photoUrl={p.avatarUrl} size={30} />
                          )}
                        </span>
                      ))}
                    </div>
                    <span className="v4-manage-share-meta-bold">
                      {remaining > 0
                        ? `${names.join(', ')} and ${remaining} others joined`
                        : `${names.join(', ')} joined`}
                    </span>
                  </div>
                );
              })()}
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
                        ? (hasNamesToCrown
                            ? 'Voting is closed. Time to crown the winner — the top vote, or any name that won your heart.'
                            : 'Voting is closed, but no names were submitted, so there’s nothing to crown.')
                        : isWinnerPicked
                        ? 'You crowned the winner. Export the full report below, or share the result straight out.'
                        : 'When voting wraps, the leaderboard is yours. You make the final call — the top vote, or any name that won your heart.'}
                    </p>
                    {/* Only offer the pick when there's actually something to
                        pick from. A contest can close empty (nobody entered a
                        name), and offering "Pick the winner" there led into a
                        modal with an empty leaderboard. */}
                    {phase === 'winner' && !isWinnerPicked && hasNamesToCrown && (
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
                editable={briefEditable}
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
          body={
            <>
              This can’t be undone. Every name and vote so far will be discarded,
              and the {!mockContest && dbContest?.price ? <strong>${dbContest.price}</strong> : ''} launch
              fee you paid is <strong>non-refundable</strong>.
            </>
          }
          confirmLabel="Cancel contest"
          cancelLabel="Keep it"
          onClose={() => setCancelOpen(false)}
          onConfirm={async () => {
            // Real contest → move it to the terminal 'cancelled' status in the
            // DB. That stops new names/votes/joins (enforced by triggers) and
            // drops it from the creator's active list.
            if (!mockContest && dbContest?.id) {
              const { error } = await supabase
                .from('contests')
                .update({ status: 'cancelled' })
                .eq('id', dbContest.id);
              if (error) {
                window.alert('Could not cancel the contest: ' + (error.message || error));
                return;
              }
              setCancelOpen(false);
              navigate('/v4/settings');
              return;
            }
            // Demo/mock path — record a cosmetic cancelled entry in setup so the
            // workspace shows a "Cancelled" section.
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
          onConfirm={async (nameId) => {
            // Close the modal first so the celebration is unobstructed,
            // then flip into the picked sub-state. ContestManage re-renders
            // into the winner celebration view (see .v4-winner-* CSS), with a
            // confetti burst so it feels like a real "win," not a state change.
            setPickWinnerOpen(false);
            const winnerText = liveData.names.find((n) => n.id === nameId)?.text || null;
            if (!mockContest && dbContest?.id) {
              // Real contest → persist the winner on the contest row. This is
              // what the participant winner/reveal pages read.
              const { error } = await supabase
                .from('contests')
                .update({ winner_submission_id: nameId })
                .eq('id', dbContest.id);
              if (error) { window.alert('Could not save the winner: ' + (error.message || error)); return; }
              setDbContest((c) => (c ? { ...c, winner_submission_id: nameId } : c));
            } else {
              // Demo — keyed by contestId so it only applies to this contest.
              writeSetup({ winner: { contestId: id, nameId, name: winnerText } });
            }
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
  onEditBrief, onEditSettings, editable = true,
}) {
  const [open, setOpen] = useState(false);
  const totalAnswered = filledBrief.length + filledSettings.length;

  // Once editing is locked (a real contest with submissions in), rows are
  // plain read-only lines — no pencil, no click — so the creator can still
  // review the brief but can't change it under the participants.
  const Row = ({ q, value, onEdit }) => editable ? (
    <button type="button" className="v4-manage-recap-row" onClick={() => onEdit?.(q)}>
      <span className="v4-manage-recap-row-label">{q.label}</span>
      <span className="v4-manage-recap-row-value">{formatAnswer(value)}</span>
      <PencilSimple weight="regular" size={12} className="v4-manage-recap-row-edit" />
    </button>
  ) : (
    <div className="v4-manage-recap-row is-readonly">
      <span className="v4-manage-recap-row-label">{q.label}</span>
      <span className="v4-manage-recap-row-value">{formatAnswer(value)}</span>
    </div>
  );

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
          Your brief · {totalAnswered} answered{editable ? ' · click any to edit' : ' · locked at launch'}
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
                    <Row q={q} value={briefAnswers[q.id]} onEdit={onEditBrief} />
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
                    <Row q={q} value={settingsAnswers[q.id]} onEdit={onEditSettings} />
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
