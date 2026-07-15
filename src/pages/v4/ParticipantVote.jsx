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
import { readSetup, writeSetup, getQuestionsFor } from '../../utils/v4Brief';
import { SHARED_SETTINGS_QUESTIONS } from '../../data/v4/briefQuestions';
import { readParticipation, recordVotes } from '../../utils/v4Participant';
import { showSubmitter, anonymityMode } from '../../utils/v4Anonymity';
import AvatarMenu from '../../components/v4/AvatarMenu';
import CreditNameEntry from '../../components/v4/CreditNameEntry';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
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
  const { user } = useAuth();
  const mockContest = getMockContestById(contestId);
  const chatRef = useRef(null);
  const didFirstAutoscrollRef = useRef(false);

  // ── Real contest data (DB) ─────────────────────────────────────────
  // Load the contest, all its submissions, this user's existing votes, and
  // their profile (avatar/name). The votes DB triggers enforce phase, member-
  // ship, no-self-vote and the ≤3 cap — the UI mirrors those rules for UX.
  const [dbContest, setDbContest] = useState(null);
  const [dbSubs, setDbSubs] = useState([]);
  const [myVoteIds, setMyVoteIds] = useState([]);
  const [profile, setProfile] = useState(null);
  const [dbLoading, setDbLoading] = useState(!mockContest);
  useEffect(() => {
    if (mockContest || !user?.id) return;
    let active = true;
    Promise.all([
      supabase.from('contests').select('*').eq('id', contestId).single(),
      supabase.from('submissions')
        .select('id, text, rationale, credited, user_id, vote_count, created_at')
        .eq('contest_id', contestId)
        .order('created_at', { ascending: true }),
      supabase.from('votes').select('submission_id').eq('contest_id', contestId).eq('user_id', user.id),
      supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single(),
    ]).then(([c, s, v, p]) => {
      if (!active) return;
      setDbContest(c.data || null);
      setDbSubs(s.data || []);
      setMyVoteIds((v.data || []).map((r) => r.submission_id));
      setProfile(p.data || null);
      setDbLoading(false);
      if (c.data?.sub_segment_id) {
        try { localStorage.setItem('v4_last_sub', c.data.sub_segment_id); } catch { /* ignore */ }
      }
    });
    return () => { active = false; };
  }, [contestId, mockContest, user?.id]);
  const isRealContest = !mockContest && !!dbContest;

  const contest = mockContest || (dbContest ? {
    id: dbContest.id,
    name: dbContest.working_name,
    workingName: dbContest.working_name,
    subSegmentId: dbContest.sub_segment_id,
    subSegmentTitle: dbContest.sub_segment_title,
    group: dbContest.tier,
    settings: dbContest.settings || {},
    brief: dbContest.brief || {},
    status: dbContest.status,
    creator: {},
  } : null);
  const participation = mockContest ? readParticipation(contestId) : null;

  const subId = contest?.subSegmentId;
  const tone = subId ? getSegmentTone(subId) : null;
  const setup = readSetup();
  // Identity: real session for a real contest, else the demo setup blob.
  const userEmail = isRealContest ? (user?.email || '') : (setup.userEmail || '');
  const userName = isRealContest
    ? (profile?.display_name || user?.email?.split('@')[0] || 'You')
    : (setup.userName || (userEmail.split('@')[0] || 'You'));
  const userPhoto = isRealContest ? (profile?.avatar_url || null) : (setup.userPhoto || null);
  const creatorName = contest?.creator?.name || 'the organizer';
  // The DB trigger hard-caps at 3 picks, so clamp the real cap there even if a
  // creator's settings say otherwise (avoids a confusing DB rejection).
  const rawVotingLimit = contest?.settings?.votingLimit || 3;
  const votingLimit = isRealContest ? Math.min(rawVotingLimit, 3) : rawVotingLimit;
  const allSubmissions = mockContest
    ? (contest?.allSubmissions || [])
    : dbSubs
        // You can't vote for your own name — drop it from the votable list.
        .filter((s) => s.user_id !== user?.id)
        .map((s) => ({
          id: s.id,
          text: s.text,
          whyItFits: s.rationale || '',
          // Submitter identity for real contests is deferred (anonymity +
          // profile-name join TBD); cards show the name + rationale only.
          submitterName: null,
          credited: s.credited,
        }));
  const alreadyVoted = mockContest ? (participation?.votedFor || []).length > 0 : myVoteIds.length > 0;
  // Did this person submit a name to THIS contest? Drives the welcome copy
  // (a returning submitter vs a first-time voter) and whether we ask for a
  // profile name later.
  const iSubmitted = mockContest
    ? (participation?.submittedNames?.length || 0) > 0
    : dbSubs.some((s) => s.user_id === user?.id);
  const [saving, setSaving] = useState(false);
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

  // ── Voter credit gate ───────────────────────────────────────────────
  // A voter who never submitted a name has no profile name on record here yet.
  // Votes are always private, so there's no "credit vs anonymous" to decide —
  // we simply ask for a name to save to their profile (optional, skippable).
  // Submitters already gave a name in the submit chat, so they skip this.
  // 'done' means the gate is cleared and the normal intro runs.
  const [creditStep, setCreditStep] = useState('done'); // 'name' | 'done'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const creditInitRef = useRef(false);
  useEffect(() => {
    if (creditInitRef.current || !isRealContest || dbLoading) return;
    creditInitRef.current = true;
    const submittedByMe = dbSubs.some((s) => s.user_id === user?.id);
    // Only ask when they have no real name yet. A freshly auto-created account
    // defaults its display_name to the email local-part (e.g. "matt" from
    // matt@…); anything else means they've already named themselves (via a
    // submission, Settings, or another contest) and shouldn't be re-asked.
    const emailPrefix = (user?.email || '').split('@')[0].trim().toLowerCase();
    const nameNow = (profile?.display_name || '').trim();
    const hasRealName = !!nameNow && nameNow.toLowerCase() !== emailPrefix;
    if (!submittedByMe && !hasRealName) setCreditStep('name');
  }, [isRealContest, dbLoading, dbSubs, user?.id, user?.email, profile?.display_name]);
  // Save the shared name as this voter's profile name (their choice becomes
  // their Namespace name), then clear the gate.
  const confirmVoterName = () => {
    const nm = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (nm && user?.id) {
      setProfile((p) => ({ ...(p || {}), display_name: nm }));
      try { writeSetup({ userName: nm }); } catch { /* ignore */ }
      supabase.from('profiles').update({ display_name: nm }).eq('id', user.id)
        .then(({ error }) => { if (error) console.error('[voter credit] profile update failed:', error); });
    }
    setCreditStep('done');
  };

  // Voting state
  const [selectedIds, setSelectedIds] = useState(() =>
    participation?.votedFor ? [...participation.votedFor] : []
  );
  // Real contest: once this user's existing votes load, seed the selection
  // (once) so a returning voter sees their current picks and can update them.
  const didInitVotesRef = useRef(false);
  useEffect(() => {
    if (isRealContest && !didInitVotesRef.current) {
      didInitVotesRef.current = true;
      setSelectedIds([...myVoteIds]);
    }
  }, [isRealContest, myVoteIds]);
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
  if (!mockContest) {
    // Real contest: wait for the load, then only allow voting in the voting
    // phase. Otherwise send the participant to the right place for the stage.
    if (dbLoading) {
      return (
        <div className="v4 lp-v3"><div className="v4-screen">
          <SegmentThemeBackdrop subId={subId} minimal />
        </div></div>
      );
    }
    if (!dbContest) return <Navigate to="/v4/settings" replace />;
    if (contest.status !== 'voting') {
      return (
        <Navigate
          to={contest.status === 'closed'
            ? `/v4/contest/${contestId}/winner`
            : `/v4/contest/${contestId}/submit`}
          replace
        />
      );
    }
    // Voting is one-shot: once you've cast your picks they're locked in, so a
    // returning voter goes to the confirmation (votes in · winner coming),
    // not back into a re-votable ballot.
    if (myVoteIds.length > 0) {
      return <Navigate to={`/v4/contest/${contestId}/vote-thanks`} replace />;
    }
  } else {
    if (!contest) return <Navigate to="/v4/settings" replace />;
    if (!participation) return <Navigate to={`/v4/join/${contestId}`} replace />;
    const hasSubmittedNames = (participation.submittedNames || []).length > 0;
    if (!hasSubmittedNames) return <Navigate to={`/v4/contest/${contestId}/submit`} replace />;
  }

  // Handlers
  const toggleVote = (id) => {
    setSelectedIds((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= votingLimit) return cur;
      return [...cur, id];
    });
  };

  const handleSubmitVotes = async () => {
    if (selectedIds.length === 0 || saving) return;
    if (!isRealContest) {
      recordVotes(contestId, selectedIds);
      navigate(`/v4/contest/${contestId}/vote-thanks`, { replace: true });
      return;
    }
    // Real contest: diff against existing votes so re-submitting updates them.
    // Delete removed picks first (frees room under the ≤3 cap), then insert
    // the new ones. Server triggers still enforce every rule.
    setSaving(true);
    const existing = new Set(myVoteIds);
    const selected = new Set(selectedIds);
    const toDelete = [...existing].filter((id) => !selected.has(id));
    const toInsert = [...selected].filter((id) => !existing.has(id));
    try {
      if (toDelete.length) {
        const { error } = await supabase.from('votes')
          .delete().eq('contest_id', contestId).eq('user_id', user.id).in('submission_id', toDelete);
        if (error) throw error;
      }
      if (toInsert.length) {
        const rows = toInsert.map((sid) => ({ contest_id: contestId, submission_id: sid, user_id: user.id }));
        const { error } = await supabase.from('votes').insert(rows);
        if (error) throw error;
      }
      navigate(`/v4/contest/${contestId}/vote-thanks`, { replace: true });
    } catch (err) {
      window.alert(err.message || 'Could not save your votes. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="v4 lp-v3">
      <div className="v4-screen">
        <SegmentThemeBackdrop subId={subId} minimal />
        <main className="v4-review" role="main" ref={chatRef}>
          <header className="v4-nav v4-nav-clear">
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
                photo={isRealContest ? userPhoto : participantProfile}
                /* Real user with no photo → avatar generated from their id. */
                seed={isRealContest ? user?.id : undefined}
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

            {/* ── Stage 1+ → welcome bubble. Copy depends on whether this
                person suggested names here (a returning submitter) or is a
                first-time voter. ─────────────────────────────────────── */}
            {introStage >= 1 && (
              <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                <span>
                  {iSubmitted ? 'You’re back — voting’s open for ' : 'Voting’s open for '}
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

            {/* ── Stage 6a → name gate for pure voters. Sits AFTER the
                intro (welcome + brief refresher), right before the cards.
                Votes are always private, so this only sets a profile name. */}
            {introStage >= 6 && creditStep !== 'done' && (
              <>
                <div className="v4-bubble" style={{ animationDelay: '0.05s' }}>
                  <span>
                    One quick thing before the names — what should we save as
                    your profile name? Every vote is private, so this is only
                    how you show up in your own Namespace, never next to your votes.
                  </span>
                </div>
                <CreditNameEntry
                  firstName={firstName}
                  lastName={lastName}
                  onFirstChange={setFirstName}
                  onLastChange={setLastName}
                  onConfirm={confirmVoterName}
                  confirmLabel="Save name"
                />
                <button
                  type="button"
                  className="v4-credit-decline"
                  onClick={() => setCreditStep('done')}
                >
                  Skip — I’d rather not
                </button>
              </>
            )}

            {/* ── Stage 6 → vote prompt + toolbar + cards ───────────── */}
            {introStage >= 6 && creditStep === 'done' && (
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

          {/* Sticky bottom bar — only once the cards are visible (after the
              intro and any pure-voter name step). */}
          {introStage >= 6 && creditStep === 'done' && (
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
                  disabled={selectedIds.length === 0 || saving}
                >
                  <PaperPlaneTilt weight="bold" size={14} />
                  {saving ? 'Saving…' : alreadyVoted ? 'Update my votes' : 'Submit my votes'}
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
