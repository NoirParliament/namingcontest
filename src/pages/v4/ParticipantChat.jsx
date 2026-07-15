// V4 ParticipantChat — name-submission flow.
//
// URL: /v4/contest/:id/submit
//
// Layout: brief-first, chat-style one-at-a-time submissions.
//   1. Welcome bubble (one)
//   2. Full brief card — every creator answer
//   3. Inline article tip (collapsed)
//   4. Fun-facts card (collapsed)
//   5. Chat flow:
//        "Suggestion 1 of N — what's your name?"  → card → user-bubble
//        "Suggestion 2 of N — or are you done?"   → card OR done
//        ... up to submissionLimit
//   6. Before-you-send checklist + Submit button (sends all at once)
//   7. Navigate to /v4/contest/:id/thanks

import { useState, useMemo, useEffect, useRef, Fragment } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { PaperPlaneTilt, PencilSimple, CheckCircle } from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
// Default participant avatar — used if the user hasn't uploaded a
// photo from Settings. Pick profile-3 (Marcus is profile-4, so this
// stays visually distinct from the inviter).
// Default participant avatar. hero-profile-5 reads as a woman in the
// illustration set — keeps the participant identity distinct from the
// creator side's default (heroProfile1) and Marcus the inviter (profile-4).
import participantProfile from '../../assets/participant-profile.png';
import { getMockContestById } from '../../data/v4/mockContests';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { SegmentThemeBackdrop, getSegmentTone } from '../../data/v4/segmentTheme';
import { readSetup, writeSetup } from '../../utils/v4Brief';
import { readParticipation, recordSubmission, writeParticipation } from '../../utils/v4Participant';
import { anonymityMode } from '../../utils/v4Anonymity';
import {
  getParticipantArticles, getChecklist,
} from '../../data/v4/participantArticles';
import { getQuestionsFor } from '../../utils/v4Brief';
import { SHARED_SETTINGS_QUESTIONS } from '../../data/v4/briefQuestions';
import GuideExpandable from '../../components/v4/GuideExpandable';
import AvatarMenu from '../../components/v4/AvatarMenu';
import { useFadeNav } from '../../components/v4/useFadeNav';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

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

  // Slim the settings rows shown on the brief card. Drop:
  //  - submissionDays / votingDays (logistics, not naming context)
  //  - submitterPrize (mentioned naturally in the welcome bubble)
  //  - anonymous (irrelevant to the participant's craft)
  // Keep only customRequirements — the creator's actual note about
  // what they're looking for, which is real naming guidance.
  const settingsRows = SHARED_SETTINGS_QUESTIONS
    .filter((q) => {
      const v = settingsAnswers[q.id];
      if (v === undefined || v === null || v === '') return false;
      const KEEP = ['customRequirements'];
      if (!KEEP.includes(q.id)) return false;
      if (v && typeof v === 'object' && 'enabled' in v && !v.enabled) return false;
      return true;
    })
    .map((q) => ({ id: q.id, label: q.label, value: settingsAnswers[q.id] }));

  return { rows, settingsRows };
}

const SUBMIT_BUBBLE_DELAY = 600;  // pacing between user-bubble and the next prompt

// Per-submission tips. Generic on purpose — about the creative
// process, not the segment. Rotates by submission number so each card
// has its own little nudge without repeating the fun facts above.
const SUBMISSION_TIPS = [
  `Your first instinct is usually your most obvious — submit it anyway, it sets the baseline.`,
  `Try a different angle from #1 — change the tone, archetype, or length.`,
  `The third one is usually the boldest. Don’t censor it.`,
  `You’ve covered the obvious territory — try something the room would push back on.`,
  `Diminishing returns from here. Make this one weird or call it.`,
];
const TIPPED_LIMIT = 5; // submissions 1–5 get a tip; 6+ go rapid-fire
function getSubmissionTip(n) {
  if (n > TIPPED_LIMIT) return null;
  return SUBMISSION_TIPS[n - 1] || null;
}

// First-turn prompt — only used when there are no drafts yet.
// Subsequent prompts are baked into the system response that follows
// each user-bubble (one bubble per turn, never two in a row).
const INITIAL_PROMPT = `OK — what’s the first name that comes to mind?`;

// 20 ack phrases + 20 prompt phrases. Combined per turn so the bot
// never sounds identical twice. Early turns (#1–5) use hand-picked
// best matches; later turns rotate through the full pool. Indexing by
// submission count keeps phrasing deterministic across re-renders.
const ACK_PHRASES = [
  'Got it — added.', 'Nice one.', 'Solid.', 'Cool, locked in.',
  'Got that.', 'Logged.', 'Niiice.', 'Heard.',
  'OK, in the pile.', 'Decent.', 'That works.', 'Saved.',
  'Like it.', 'Cool.', 'OK.', 'Right on.',
  'Smart.', 'Good one.', 'Solid pick.', 'In the bag.',
];
const PROMPT_PHRASES = [
  `What’s the next name?`,
  `Got another?`,
  `One more, or call it?`,
  `Hit me with another.`,
  `Got more, or wrap up?`,
  `Anything else come to mind?`,
  `Throw another one in?`,
  `Another idea, or that’s it?`,
  `Got one more in you?`,
  `What else?`,
  `Another, or you done?`,
  `Try another angle?`,
  `Want to add another?`,
  `Add one more, or call it?`,
  `Got something else?`,
  `One more, or wrap?`,
  `Keep going?`,
  `Got another idea?`,
  `Add another?`,
  `One more, or send what you have?`,
];
// Hand-picked best pairings for the first 5 turns so the rhythm
// reads naturally early; falls back to mod-cycling for 6+.
const TURN_RESPONSE_OVERRIDES = [
  null, // 1 (handled separately as INITIAL_PROMPT before any drafts)
  `Got it — first one’s in. What’s another?`,           // after #1
  `Nice — that’s two. One more, or call it?`,           // after #2
  `Three solid ones. Anything else, or wrap?`,          // after #3
  `Four in. You’ve covered a lot — want a fifth?`,      // after #4
  `Five — diminishing returns from here. Last one?`,    // after #5
];
function getSystemResponse(submittedCount, isFinalTurn) {
  // Hitting the creator-set limit lands on a "thank you + next move"
  // bubble. Two doors: tap any name above to edit it inline, or hit
  // submit. No "add another" since they've used their last slot.
  if (isFinalTurn) {
    return `That’s your last one — thanks! Tap any name above to edit, or send them when you’re ready.`;
  }
  const override = TURN_RESPONSE_OVERRIDES[submittedCount];
  if (override) return override;
  const ack = ACK_PHRASES[submittedCount % ACK_PHRASES.length];
  const prompt = PROMPT_PHRASES[submittedCount % PROMPT_PHRASES.length];
  return `${ack} ${prompt}`;
}

export default function ParticipantChat() {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const fadeNav = useFadeNav();
  const { user } = useAuth();

  // Mock demo contest, or a real one loaded from the DB (a participant can
  // read the full contest — brief + settings — via RLS once they've joined).
  const mockContest = getMockContestById(contestId);
  const [dbContest, setDbContest] = useState(null);
  const [dbLoading, setDbLoading] = useState(!mockContest);
  useEffect(() => {
    if (mockContest) return;
    let active = true;
    supabase.from('contests').select('*').eq('id', contestId).single().then(({ data }) => {
      if (!active) return;
      setDbContest(data || null);
      setDbLoading(false);
    });
    return () => { active = false; };
  }, [contestId, mockContest]);
  const isRealContest = !mockContest && !!dbContest;
  const contest = mockContest || (dbContest ? {
    id: dbContest.id,
    subSegmentId: dbContest.sub_segment_id,
    subSegmentTitle: dbContest.sub_segment_title,
    group: dbContest.tier,
    settings: dbContest.settings || {},
    brief: dbContest.brief || {},
    creator: {},
  } : null);
  // Real participants got here by joining (real participant row); the DB
  // submission trigger still enforces membership, so we don't gate on the
  // localStorage participation for real contests.
  const participation = mockContest ? readParticipation(contestId) : (isRealContest ? { submittedNames: [] } : null);

  // Resolve the creator-set cap. Numbers are used as-is; 'Unlimited'
  // (a valid numberChips option) maps to a high ceiling so the slot
  // math never goes NaN; anything missing/odd falls back to 3.
  const rawLimit = contest?.settings?.submissionLimit;
  const submissionLimit = Number.isFinite(rawLimit)
    ? rawLimit
    : (rawLimit === 'Unlimited' ? 99 : 3);
  const tone = contest ? getSegmentTone(contest.subSegmentId) : null;
  const creatorName = contest?.creator?.name || 'the organizer';

  // Authenticated user (the participant) — read from setup blob,
  // populated either by the join flow or the SignInModal participant
  // shortcut. Used by AvatarMenu in the nav.
  const setup = readSetup();
  const userEmail = setup.userEmail || '';
  const userName = setup.userName || (userEmail.split('@')[0] || 'You');
  const userPhoto = setup.userPhoto || null;
  // Real signed-in identity for the account menu (so it shows YOU, not the
  // mock participant photo).
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => { if (active && data) setProfile(data); });
    return () => { active = false; };
  }, [user?.id]);
  const articles = useMemo(
    () => (contest ? getParticipantArticles(contest.subSegmentId) : []),
    [contest]
  );
  const checklist = useMemo(
    () => (contest ? getChecklist(contest.subSegmentId) : []),
    [contest]
  );
  const featuredArticle = articles[0] || null;
  const { rows: briefRows, settingsRows } = useMemo(
    () => buildBriefRows(contest),
    [contest]
  );

  const alreadySubmitted = participation?.submittedNames || [];
  const remainingSlots = Math.max(0, submissionLimit - alreadySubmitted.length);

  // Prize sentence for the welcome bubble — single mention point.
  const prize = contest?.settings?.submitterPrize?.enabled
    ? contest?.settings?.submitterPrize
    : null;
  const prizeLine = prize?.name
    ? `Winning name gets ${prize.name}.`
    : null;

  // "Let participants choose" mode — the credit question is asked up front
  // (intro stage 4) so people suggest names already knowing their choice.
  // Credited by default; opting out hides the name everywhere and (if a
  // prize is offered) forfeits it.
  const anonMode = anonymityMode(contest); // 'participant' | 'public' | 'anonymous'
  const letsParticipantChoose = anonMode === 'participant';
  const [creditMe, setCreditMe] = useState(true);
  // Credit sub-flow: in participant mode, "Yes, credit me" reveals a name
  // entry; in public mode the name entry shows straight away (crediting is
  // mandatory). The entered name is saved as the account/profile name.
  const [creditChosen, setCreditChosen] = useState(false);
  // Two separate fields, always empty to start (no email-derived prefill).
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmedName, setConfirmedName] = useState(null);
  // Public (mandatory-credit) mode: the participant can decline sharing
  // their name, which means they can't take part — we say so gracefully.
  const [declinedPublic, setDeclinedPublic] = useState(false);

  // Local accumulated submissions for this session. These are NOT
  // persisted until the user hits the final submit button.
  const [drafts, setDrafts] = useState([]);
  // Current open submission card. null = none open (between submissions
  // or after "I'm done"). When index === drafts.length it's the active
  // draft being filled.
  const [activeDraft, setActiveDraft] = useState({ text: '', whyItFits: '' });
  const [showForm, setShowForm] = useState(true);
  const [submittedDone, setSubmittedDone] = useState(false);
  // Typing-dots state for per-turn responses (after each draft).
  // The intro reveal (welcome + brief + article + first prompt) is
  // sequenced separately via `introStage` below — it ALL types in
  // staged bubbles instead of dumping everything on mount.
  const [typingFor, setTypingFor] = useState(null);
  // Inline draft editing — index of the draft currently in edit mode
  // (null = none). Click any draft bubble to enter; Save replaces the
  // entry in place; Cancel exits without changes. Mirrors BriefChat's
  // edit-in-place pattern so the participant flow feels consistent
  // with the creator flow.
  const [editingDraftIndex, setEditingDraftIndex] = useState(null);
  // Intro reveal stages:
  //   0 = typing for welcome bubble
  //   1 = welcome shown + typing for the "ready to see brief?" prompt
  //   2 = "ready to see the brief?" prompt + chip (WAITS for user)
  //   3 = user reply + brief shown + typing for "ready to name?" prompt
  //   4 = "ready to start suggesting?" prompt + chip (WAITS for user)
  //   5 = user reply + typing for first submission prompt
  //   6 = first prompt + article + form (submission flow starts here)
  const [introStage, setIntroStage] = useState(0);
  // Stages 0→1, 1→2, 3→4, 5→6 advance on a timer.
  // Stages 2→3 and 4→5 wait for a user chip click.
  const INTRO_AUTO_TIMINGS = {
    0: 800,
    1: 1100,
    3: 1100,
    5: 800,
  };

  // Auto-scroll uses the SAME pattern as BriefChat: ref the scroll
  // container (the <main>), then scrollTo(top: scrollHeight) on every
  // state change. We SKIP the very first effect run though —
  // otherwise the user lands on the page already scrolled past the
  // welcome bubble + brief card before they've read anything.
  const chatRef = useRef(null);
  const didFirstAutoscrollRef = useRef(false);

  // Guards moved to AFTER the hooks (React rule). See `if (...) return
  // <Navigate>` below — render-time redirect is more reliable than
  // useEffect + null-return because there's no blank frame.

  useEffect(() => {
    // Skip initial mount — let the user start at the top so they
    // actually read the welcome / brief / article before the chat
    // begins. Subsequent state changes (added a draft, hit submit
    // flow, etc.) scroll-to-bottom normally.
    if (!didFirstAutoscrollRef.current) {
      didFirstAutoscrollRef.current = true;
      return;
    }
    const el = chatRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [drafts.length, showForm, submittedDone, typingFor, introStage]);

  // Intro reveal sequencer — auto-advances only on stages with a
  // defined timing (0, 1, 3). Stage 2 waits for the user to click
  // "Show me the brief"; stage 4 is the form so we stop there.
  useEffect(() => {
    const delay = INTRO_AUTO_TIMINGS[introStage];
    if (!delay) return;
    const t = setTimeout(() => setIntroStage((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [introStage]);

  // Real contest still loading — hold, don't bounce to settings.
  if (!mockContest && dbLoading) {
    return (
      <div className="v4 lp-v3">
        <div className="v4-screen">
          <main className="v4-review" role="main">
            <div className="v4-review-inner" style={{ textAlign: 'center', paddingTop: 120 }}>
              <p className="v4-review-subtitle">Loading the contest…</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  if (!contest) return <Navigate to="/v4/settings" replace />;
  if (!participation) return <Navigate to={`/v4/join/${contestId}`} replace />;
  if (alreadySubmitted.length > 0) {
    return <Navigate to={`/v4/contest/${contestId}/thanks`} replace />;
  }

  // Current submission number (1-indexed). Sits at remainingSlots
  // boundary when all slots filled.
  const submissionNumber = drafts.length + 1;
  const submissionsRemaining = remainingSlots - drafts.length;
  // Just require both fields to have something. The earlier
  // length-thresholds silently disabled the button if "why it fits"
  // was under 6 chars — confusing because the button still looked
  // active. Now: any non-empty text passes; we trust the writer.
  const hasMin =
    activeDraft.text.trim().length > 0 && activeDraft.whyItFits.trim().length > 0;
  const reachedLimit = drafts.length >= remainingSlots;

  // ── Handlers ───────────────────────────────────────────────────────
  const handleAddDraft = () => {
    if (!hasMin) return;
    const entry = {
      text: activeDraft.text.trim(),
      whyItFits: activeDraft.whyItFits.trim(),
    };
    setDrafts((d) => [...d, entry]);
    setActiveDraft({ text: '', whyItFits: '' });
    setShowForm(false);
    // Typing dots appear immediately after the user-bubble lands,
    // then 700ms later the system response bubble replaces them.
    setTypingFor('response');
    setTimeout(() => {
      setTypingFor(null);
      if (drafts.length + 1 >= remainingSlots) {
        setSubmittedDone(true); // hit the limit — go straight to checklist
      } else {
        setShowForm(true);
      }
    }, SUBMIT_BUBBLE_DELAY);
  };

  const handleStartEditDraft = (i) => {
    // Pull the user out of the "submitted/done" gate while editing —
    // editing is a parallel flow, not the active turn. Same idea as
    // BriefChat: editing pauses the rest of the chat machinery.
    setEditingDraftIndex(i);
  };

  const handleEditDraftSave = (updated) => {
    if (editingDraftIndex == null) return;
    setDrafts((d) =>
      d.map((entry, i) => (i === editingDraftIndex ? updated : entry))
    );
    setEditingDraftIndex(null);
  };

  const handleCancelEditDraft = () => {
    setEditingDraftIndex(null);
  };

  // Record all drafts (with the chosen credit visibility) then head to
  // the thanks page. `anonymous` only matters in participant-choose mode.
  const recordAndGo = async (anonymous) => {
    if (isRealContest && user?.id) {
      // Real contest → write each name to the submissions table (the DB
      // trigger enforces membership + the max-3 cap).
      for (const entry of drafts) {
        const { error } = await supabase.from('submissions').insert({
          contest_id: contestId,
          user_id: user.id,
          text: entry.text,
          rationale: entry.whyItFits || null,
          credited: !anonymous,
        });
        if (error) {
          console.error('[submit] failed:', error);
          window.alert('Could not submit your name: ' + (error.message || error));
          return;
        }
      }
      navigate(`/v4/contest/${contestId}/thanks`, { replace: true });
      return;
    }
    // Mock demo path.
    drafts.forEach((entry) =>
      recordSubmission(contestId, {
        text: entry.text,
        whyItFits: entry.whyItFits,
        tagline: '',
        inspiration: '',
        anonymous,
      })
    );
    if (anonymous) writeParticipation(contestId, { anonymous: true });
    navigate(`/v4/contest/${contestId}/thanks`, { replace: true });
  };

  // Confirm the credited name → save it as the account/profile name (so it
  // shows in the avatar menu + workspace) and advance past the credit step.
  const confirmName = () => {
    const nm = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (nm) {
      writeSetup({ userName: nm });
      setConfirmedName(nm);
    }
    setCreditMe(true);
    setIntroStage(5);
  };

  // Exit from the mandatory-credit decline → log out and go home, using
  // the same gentle fade-out → homepage as ExitLink/BrandLink elsewhere
  // (so the homepage animates in instead of jump-cutting).
  const handleExitLoggedOut = (e) => {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('v4_') || k === 'selectedGroup' || k === 'selectedSubSegment')) {
          keys.push(k);
        }
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {}
    fadeNav('/#top')(e);
  };

  // The persistent user-reply bubble for the credit step (stage ≥ 5).
  const creditReply =
    anonMode === 'participant'
      ? (creditMe ? `Credit me — ${confirmedName || userName}` : 'Keep me anonymous')
      : anonMode === 'public'
        ? `Share my name — ${confirmedName || userName}`
        : 'Yes, let’s go';

  // Both submit paths ("that's enough" + the checklist submit) record with
  // the credit choice already made up front in the intro. Public/anonymous
  // modes don't carry a per-name choice, so they record as credited.
  const submitAll = () => {
    if (drafts.length === 0) return;
    recordAndGo(letsParticipantChoose ? !creditMe : false);
  };

  const handleImDone = submitAll;
  const handleFinalSubmit = submitAll;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="v4 lp-v3">
      <div className="v4-screen v4-screen--chat">
        <SegmentThemeBackdrop subId={contest.subSegmentId} minimal />
        <main className="v4-review" role="main" ref={chatRef}>
          <header className="v4-nav v4-nav-clear">
            {/* Click logo → scroll the chat container to top (mimics
                the "go to top of this page" expectation; we don't
                navigate away since the user is mid-flow). */}
            <button
              type="button"
              className="v4-brand v4-brand-button"
              onClick={() => chatRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top"
            >
              <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
            </button>
            <div className="v4-progress">
              <span className="v4-step-label">Suggest names</span>
            </div>
            <div className="v4-nav-right">
              <AvatarMenu
                email={user?.email || userEmail}
                name={profile?.display_name || userName}
                photo={profile?.avatar_url || (isRealContest ? null : participantProfile)}
                seed={user?.id}
                tone={tone}
                activeContest={{
                  id: contest.id,
                  name: contest.workingName || contest.name,
                  phase: 'SUBMISSIONS',
                  tone,
                  // Clicking the contest card from the dropdown lands
                  // back on the workspace (which now holds the live
                  // countdown + greyed vote button inline), not on the
                  // separate /status page.
                  to: `/v4/settings`,
                }}
              />
            </div>
          </header>

          <div className="v4-chat-inner v4-pchat-inner">
            {/* ── Stage 0 → typing for welcome bubble ─────────────── */}
            {introStage === 0 && (
              <div className="v4-typing" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
            )}

            {/* ── Stage 1+ → welcome bubble appears ───────────────── */}
            {introStage >= 1 && (
              <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                <span>
                  Welcome — {creatorName} invited you to
                  suggest names for{' '}
                  <em>{contest.workingName || contest.name}</em>.
                  {prizeLine && <> {prizeLine}</>} You’ll add up to{' '}
                  {remainingSlots}{' '}
                  {remainingSlots === 1 ? 'suggestion' : 'suggestions'}.
                </span>
              </div>
            )}

            {/* ── Stage 1 → typing for the "ready?" prompt ────────── */}
            {introStage === 1 && (
              <div className="v4-typing" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
            )}

            {/* ── Stage 2 → "ready?" prompt + chip button (waits) ── */}
            {introStage === 2 && (
              <>
                <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                  <span>Ready to see what {creatorName} is looking for?</span>
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

            {/* ── Stage 3+ → user replied "yes" → reply bubble + brief ── */}
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

            {/* ── Stage 3 → typing for the "ready to name?" prompt ── */}
            {introStage === 3 && (
              <div className="v4-typing" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
            )}

            {/* ── Stage 4 → the credit question (participant-choose mode)
                  or the plain "ready to suggest?" gate, then chips ───── */}
            {introStage === 4 && (
              <>
                {/* ── Participant-choose mode: credit or stay anonymous ── */}
                {anonMode === 'participant' && !creditChosen && (
                  <>
                    <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                      <span>
                        First — should your name show on the names you suggest?
                      </span>
                    </div>
                    {prize?.name && (
                      <div className="v4-hint">
                        Heads up — anonymous names aren’t eligible for{' '}
                        {prize.name}.
                      </div>
                    )}
                    <div
                      className="v4-chips-row"
                      role="radiogroup"
                      aria-label="Show your name on your suggestions?"
                    >
                      <button
                        type="button"
                        role="radio"
                        aria-checked="false"
                        className="v4-chip"
                        onClick={() => setCreditChosen(true)}
                      >
                        Yes, credit me
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked="false"
                        className="v4-chip"
                        onClick={() => { setCreditMe(false); setIntroStage(5); }}
                      >
                        Keep me anonymous
                      </button>
                    </div>
                  </>
                )}

                {/* Participant chose to be credited → enter the name. */}
                {anonMode === 'participant' && creditChosen && (
                  <>
                    <div className="v4-bubble v4-bubble-user" style={{ animationDelay: '0.05s' }}>
                      <span>Yes, credit me</span>
                    </div>
                    <div className="v4-bubble" style={{ animationDelay: '0.12s' }}>
                      <span>
                        Great — what name should show on your suggestions?
                      </span>
                    </div>
                    <CreditNameEntry
                      firstName={firstName}
                      lastName={lastName}
                      onFirstChange={setFirstName}
                      onLastChange={setLastName}
                      onConfirm={confirmName}
                      confirmLabel="Use this name"
                    />
                  </>
                )}

                {/* ── Public mode: crediting is mandatory (host turned off
                      anonymity). Explain, then take the name. ── */}
                {anonMode === 'public' && !declinedPublic && (
                  <>
                    <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                      <span>
                        Quick heads up — {contest.creator?.name || 'the host'} set
                        this contest to public, so every name shows who
                        suggested it. Sharing your name is required to take part here.
                      </span>
                    </div>
                    <div className="v4-bubble" style={{ animationDelay: '0.14s' }}>
                      <span>
                        Are you okay with that? Enter the name you’d like shown.
                      </span>
                    </div>
                    <CreditNameEntry
                      firstName={firstName}
                      lastName={lastName}
                      onFirstChange={setFirstName}
                      onLastChange={setLastName}
                      onConfirm={confirmName}
                      confirmLabel="Yes, share my name"
                    />
                    <button
                      type="button"
                      className="v4-credit-decline"
                      onClick={() => setDeclinedPublic(true)}
                    >
                      I’d rather not share my name
                    </button>
                  </>
                )}

                {/* Declined to share on a mandatory-credit contest → they
                    can't take part, said kindly. Can change their mind. */}
                {anonMode === 'public' && declinedPublic && (
                  <>
                    <div className="v4-bubble v4-bubble-user" style={{ animationDelay: '0.05s' }}>
                      <span>I’d rather not share my name</span>
                    </div>
                    <div className="v4-bubble" style={{ animationDelay: '0.12s' }}>
                      <span>
                        Totally fair, not everyone wants the crown. That said,
                        this contest only takes names with a face behind them,
                        so it’s completely okay to sit it out.
                      </span>
                    </div>
                    <div className="v4-chips-row" role="group">
                      <button
                        type="button"
                        className="v4-chip"
                        onClick={() => setDeclinedPublic(false)}
                      >
                        Actually, I’ll share it
                      </button>
                      <button
                        type="button"
                        className="v4-chip"
                        onClick={handleExitLoggedOut}
                      >
                        Exit
                      </button>
                    </div>
                  </>
                )}

                {/* ── Anonymous mode: no names shown at all. ── */}
                {anonMode === 'anonymous' && (
                  <>
                    <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                      <span>
                        This contest is anonymous — no names are shown to anyone,
                        the host included. Ready to start suggesting?
                      </span>
                    </div>
                    <div className="v4-chips-row" role="group">
                      <button
                        type="button"
                        className="v4-chip"
                        onClick={() => setIntroStage(5)}
                      >
                        Yes, let’s go
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── Stage 5+ → user reply + typing for first prompt ── */}
            {introStage >= 5 && (
              <div className="v4-bubble v4-bubble-user" style={{ animationDelay: '0.05s' }}>
                <span>{creditReply}</span>
              </div>
            )}
            {introStage === 5 && (
              <div className="v4-typing" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
            )}

            {/* Submission is one-shot: once user clicks "Send N
                suggestions" they go to /thanks and can't come back.
                The guard above redirects any participant with
                alreadySubmitted.length > 0 to /thanks, so this page
                only ever renders for fresh participants. No prior-
                submissions UI, no resume state. */}
            {true && (
              <>
                {/* Existing submissions render as a system→user→system
                    chat: user-bubble (their entry), then a system
                    response bubble acknowledging it. The very next
                    prompt bubble is rendered separately below when
                    the next form is active. */}
                {drafts.map((d, i) => {
                  const submittedCount = i + 1;
                  const isLastDraft = i === drafts.length - 1;
                  const isFinalTurn = isLastDraft && submittedDone;
                  // Show typing dots in place of the response bubble
                  // ONLY for the most-recent draft while the typing
                  // state is active. Older drafts always show their
                  // resolved response.
                  const showTyping = isLastDraft && typingFor === 'response';
                  const isEditingThis = editingDraftIndex === i;
                  return (
                    <Fragment key={`turn-${i}`}>
                      <DraftBubble
                        index={i}
                        draft={d}
                        isEditing={isEditingThis}
                        segmentExample={
                          contest.subSegmentId === 't1'
                            ? 'e.g. Iron Boots FC'
                            : 'A name…'
                        }
                        onStartEdit={() => handleStartEditDraft(i)}
                        onEditSave={handleEditDraftSave}
                        onEditCancel={handleCancelEditDraft}
                      />
                      {showTyping ? (
                        <div className="v4-typing" aria-hidden="true">
                          <span></span><span></span><span></span>
                        </div>
                      ) : (
                        <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                          <span>{getSystemResponse(submittedCount, isFinalTurn)}</span>
                        </div>
                      )}
                    </Fragment>
                  );
                })}

                {/* Active turn. One bubble per turn rule:
                    - On the FIRST submission (no drafts yet), render
                      the initial prompt bubble here.
                    - On subsequent submissions, the response bubble
                      from the previous draft (rendered above in
                      drafts.map) already asks for the next one — so
                      we skip the prompt here to avoid two system
                      bubbles in a row.
                    Tip and form follow either way. No "Suggestion N
                    of M" counter — it pressures people to fill all
                    slots when the creator allowed many. */}
                {!submittedDone && showForm && editingDraftIndex === null && (
                  <>
                    {/* Initial prompt bubble — appears at intro stage 4
                        (after typing dots from stage 3). The article
                        tip slides in alongside it: "Read the guide" is
                        context for the very first question, not a
                        standalone intro element. */}
                    {drafts.length === 0 && introStage >= 6 && (
                      <>
                        <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                          <span>{INITIAL_PROMPT}</span>
                        </div>
                        {featuredArticle && (
                          <GuideExpandable article={featuredArticle} compact />
                        )}
                      </>
                    )}
                    {/* Tip + form. Stage gating only matters on the
                        first turn — once drafts exist, the user is
                        past intro and everything renders normally. */}
                    {(drafts.length > 0 || introStage >= 6) && (
                      <>
                        {getSubmissionTip(submissionNumber) && (
                          <div className="v4-hint">
                            <strong>Tip · </strong>
                            {getSubmissionTip(submissionNumber)}
                          </div>
                        )}
                        <SubmissionCard
                          draft={activeDraft}
                          onChange={setActiveDraft}
                          segmentExample={
                            contest.subSegmentId === 't1'
                              ? 'e.g. Iron Boots FC'
                              : 'A name…'
                          }
                          canAdd={hasMin}
                          onAdd={handleAddDraft}
                          canSkip={drafts.length > 0}
                          onSkip={handleImDone}
                        />
                      </>
                    )}
                  </>
                )}

                {/* Checklist + submit — appears after user hits limit
                    or chooses "submit what I have". Also offers a
                    "keep adding" escape hatch so they can back out
                    and add more before locking in. */}
                {submittedDone && drafts.length > 0 && editingDraftIndex === null && (
                  <>
                    <ChecklistCard items={checklist} />
                    <div className="v4-pchat-submit-row">
                      <p className="v4-pchat-submit-warn">
                        Once you submit, you can’t add or edit names later.
                      </p>
                      <div className="v4-pchat-submit-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-lg"
                          onClick={handleFinalSubmit}
                        >
                          <PaperPlaneTilt weight="bold" size={14} />
                          Send {drafts.length}{' '}
                          {drafts.length === 1 ? 'suggestion' : 'suggestions'}
                          <span className="arrow">→</span>
                        </button>
                        {drafts.length < remainingSlots && (
                          <button
                            type="button"
                            className="v4-pchat-keep-adding"
                            onClick={() => {
                              setSubmittedDone(false);
                              setShowForm(true);
                            }}
                          >
                            Wait — let me add one more
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}

              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// ── Brief card (full creator answers as label/value rows) ──────────
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

// (Dropped: NamingTipsCard + FunFactsCard. The article (GuideExpandable)
// is the sole tip surface now — wrapping it in another card just
// nested two collapsibles inside each other.)

// ── Active submission card — just fields + actions, no header.
// The chat (prompt bubble above + tip + user reply below) carries
// all the context; the card is a clean input surface.
function SubmissionCard({
  draft, onChange, segmentExample,
  canAdd, onAdd, canSkip, onSkip,
}) {
  return (
    <div className="v4-pchat-card">
      <label className="v4-pchat-card-field">
        <span className="v4-pchat-card-label">The name</span>
        <input
          type="text"
          className="v4-settings-input"
          value={draft.text}
          onChange={(e) => onChange({ ...draft, text: e.target.value })}
          placeholder={segmentExample}
          maxLength={48}
          autoFocus
        />
      </label>
      <label className="v4-pchat-card-field">
        <span className="v4-pchat-card-label">
          What it means + why it fits
          <em className="v4-pchat-card-hint">
            — start with the meaning, then why it lands for this brief
          </em>
        </span>
        <textarea
          className="v4-settings-input v4-pchat-textarea"
          rows={4}
          value={draft.whyItFits}
          onChange={(e) => onChange({ ...draft, whyItFits: e.target.value })}
          placeholder="Heron — the bird that fishes along our river. Single sharp word, easy on a jersey."
          maxLength={320}
        />
      </label>
      <div className="v4-pchat-card-foot">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAdd}
          disabled={!canAdd}
        >
          Add this <span className="arrow">→</span>
        </button>
      </div>
      {canSkip && (
        /* Lives OUTSIDE the form's primary action row so it's
           clearly a different kind of action — finalizing, not
           adding. Quieter visual weight (outline button) + an
           irreversibility note right under it. */
        <div className="v4-pchat-finalize">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onSkip}
          >
            That’s enough — submit what I have
          </button>
          <p className="v4-pchat-finalize-note">
            You can still tap any name above to edit it before sending.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Drafted name — right-aligned user-bubble, click to edit inline.
// Pattern mirrors BriefChat's HistoryTurn: the bubble itself is the
// click target (pencil + Edit hint floating top-right); when editing
// it swaps to an inline edit form with Save / Cancel. Saves replace
// the entry in-place; cancels exit without changes.
function DraftBubble({
  index, draft, isEditing, segmentExample,
  onStartEdit, onEditSave, onEditCancel,
}) {
  const [edit, setEdit] = useState(draft);
  // Reset the local edit state every time we re-enter edit mode so
  // a previous half-typed edit doesn't bleed across draft rows.
  useEffect(() => {
    if (isEditing) setEdit(draft);
  }, [isEditing, draft]);

  if (isEditing) {
    const canSave =
      edit.text.trim().length > 0 && edit.whyItFits.trim().length > 0;
    return (
      <div className="v4-pchat-draft-edit">
        <div className="v4-pchat-draft-edit-head">
          Editing <strong>#{index + 1}</strong>
        </div>
        <label className="v4-pchat-card-field">
          <span className="v4-pchat-card-label">The name</span>
          <input
            type="text"
            className="v4-settings-input"
            value={edit.text}
            onChange={(e) => setEdit({ ...edit, text: e.target.value })}
            placeholder={segmentExample}
            maxLength={48}
            autoFocus
          />
        </label>
        <label className="v4-pchat-card-field">
          <span className="v4-pchat-card-label">
            What it means + why it fits
          </span>
          <textarea
            className="v4-settings-input v4-pchat-textarea"
            rows={4}
            value={edit.whyItFits}
            onChange={(e) => setEdit({ ...edit, whyItFits: e.target.value })}
            placeholder="Heron — the bird that fishes along our river. Single sharp word, easy on a jersey."
            maxLength={320}
          />
        </label>
        <div className="v4-pchat-draft-edit-foot">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() =>
              onEditSave({
                text: edit.text.trim(),
                whyItFits: edit.whyItFits.trim(),
              })
            }
            disabled={!canSave}
          >
            Save changes
          </button>
          <button
            type="button"
            className="btn btn-link"
            onClick={onEditCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="v4-pchat-draft v4-pchat-draft-editable"
      style={{ animationDelay: '0.05s' }}
      onClick={onStartEdit}
      aria-label={`Edit name #${index + 1}: ${draft.text}`}
    >
      <div className="v4-pchat-draft-head">
        <span className="v4-pchat-draft-num">#{index + 1}</span>
        <strong className="v4-pchat-draft-name">{draft.text}</strong>
      </div>
      <div className="v4-pchat-draft-why">{draft.whyItFits}</div>
      <span className="v4-pchat-draft-edit-hint" aria-hidden="true">
        <PencilSimple weight="bold" size={12} />
        Edit
      </span>
    </button>
  );
}

// ── Credit name entry — a text field + confirm, used when the
// participant opts to be credited (or when the host made it mandatory).
// The confirmed name is saved as the account/profile name.
function CreditNameEntry({ firstName, lastName, onFirstChange, onLastChange, onConfirm, confirmLabel }) {
  const canConfirm = firstName.trim().length > 0;
  const submitOnEnter = (e) => { if (e.key === 'Enter' && canConfirm) onConfirm(); };
  return (
    <div className="v4-credit-name">
      <input
        type="text"
        className="v4-settings-input v4-credit-name-input"
        value={firstName}
        onChange={(e) => onFirstChange(e.target.value)}
        onKeyDown={submitOnEnter}
        placeholder="First name"
        aria-label="First name"
        autoFocus
      />
      <input
        type="text"
        className="v4-settings-input v4-credit-name-input"
        value={lastName}
        onChange={(e) => onLastChange(e.target.value)}
        onKeyDown={submitOnEnter}
        placeholder="Last name"
        aria-label="Last name"
      />
      <button
        type="button"
        className="v4-chip v4-credit-name-confirm"
        onClick={onConfirm}
        disabled={!canConfirm}
      >
        {confirmLabel}
      </button>
    </div>
  );
}

// ── Read-only checklist before submit ──────────────────────────────
function ChecklistCard({ items }) {
  return (
    <section className="v4-pchat-checklist">
      {items.map((item, i) => (
        <div key={i} className="v4-pchat-checklist-row">
          <CheckCircle weight="duotone" size={18} className="v4-pchat-checklist-icon" />
          <div>
            <div className="v4-pchat-checklist-question">{item.question}</div>
            <div className="v4-pchat-checklist-hint">{item.hint}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
