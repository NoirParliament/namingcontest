// V4 Settings page — single page with two sections (Account + Subscription).
// Reads identity + plan info from localStorage v4_contest_setup blob.
// All "save" / "cancel plan" actions are mock for now; wire to real
// backend (Supabase) and Stripe customer portal later.

import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import {
  X, EnvelopeSimple, User, CreditCard, Receipt, ArrowSquareOut,
  Heart, UsersThree, Briefcase, Camera, Info, Trash, Plus,
  ArrowRight, ListBullets, Trophy, Clock, CheckCircle, PaperPlaneTilt,
} from '@phosphor-icons/react';
import useCountdown, { pad2 } from '../../utils/useCountdown';
import participantProfile from '../../assets/participant-profile.png';
import creatorProfile from '../../assets/creator-profile.png';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import { readSetup, writeSetup } from '../../utils/v4Brief';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { uploadUserFile } from '../../lib/uploads';
import UserAvatar from '../../components/v4/UserAvatar';
import { readAllParticipations, getParticipantRow } from '../../utils/v4Participant';
import { getMockContestById, MOCK_CONTESTS } from '../../data/v4/mockContests';
import { SegmentThemeBackdrop, getSegmentTone, getSegmentIcon } from '../../data/v4/segmentTheme';
import AvatarMenu from '../../components/v4/AvatarMenu';
import CatchwordConsultBlock from '../../components/v4/CatchwordConsultBlock';
import ResumeDraftPill from '../../components/v4/ResumeDraftPill';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

// Tier metadata — same source of truth as the launch modal pricing.
// Tint is the small accent color used on draft rows (left-edge stripe).
const TIER_INFO = {
  personal: { Icon: Heart,      label: 'Personal',  price: 9,  per: 'contest', tint: '#fadecc' },
  group:    { Icon: UsersThree, label: 'Group',     price: 29, per: 'contest', tint: '#c4cff5' },
  business: { Icon: Briefcase,  label: 'Business',  price: 89, per: 'contest', tint: '#bce5c8' },
};

// Build the billing history. The mock invoices for past closed contests
// are always present so the section never looks empty. When the user has
// launched a real contest, that invoice goes on top (most recent first).
function buildBillingHistory({ realContest, mockClosed }) {
  const fmt = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const list = [];

  if (realContest) {
    const info = realContest.tierInfo;
    const launched = realContest.launchedAt
      ? new Date(realContest.launchedAt)
      : new Date();
    list.push({
      id: 'inv_real',
      date: fmt(launched),
      desc: `${info.label} contest launch`,
      amount: info.price,
      status: 'Paid',
      contestName: realContest.name,
    });
  }

  mockClosed.forEach((c, i) => {
    const info = TIER_INFO[c.tierKey] || TIER_INFO.personal;
    // Older than the real launch — push back further with each entry.
    const date = new Date(Date.now() - (14 + i * 7) * 24 * 60 * 60 * 1000);
    list.push({
      id: `inv_mock_${c.id}`,
      date: fmt(date),
      desc: `${info.label} contest launch`,
      amount: info.price,
      status: 'Paid',
      contestName: c.name,
    });
  });

  return list;
}

// Always-present mock data so the workspace never looks empty.
// The mock contest record itself lives in src/data/v4/mockContests.js
// (shared with ContestManage so the dashboard renders coherently when
// the user opens it). Here we only adapt the field name (`group` →
// `tierKey`) for the local TIER_INFO lookup.
const MOCK_ONGOING = {
  ...MOCK_CONTESTS.mock_ongoing_1,
  tierKey: MOCK_CONTESTS.mock_ongoing_1.group,
};

const MOCK_CLOSED = [
  {
    id: 'closed_1',
    name: 'Indie band name',
    tierKey: 'group',
    closedAgo: '2 weeks ago',
    winner: 'Echo Bloom',
  },
];

export default function Settings() {
  const navigate = useNavigate();
  const setup = readSetup();
  // A real Supabase session means a real account — suppress ALL the mock
  // demo data (the "Sunday football crew" contest, closed history, joined
  // rows) so a real user never sees or clicks a fake contest. Real contests
  // arrive from the database in Phase 2. The non-authenticated demo path
  // (/v4/map) still shows the mocks.
  const { user, loading: authLoading, changeEmail } = useAuth();
  const isRealUser = !!user;
  // Real contests this user created (most-recent first). `latest` drives the
  // page's segment color/background and the account-menu contest chip.
  const [dbContests, setDbContests] = useState([]);
  // Cancelled contests are terminal — keep them out of the active list and
  // out of the color/menu signal; they get their own quiet section instead.
  // Unpaid drafts are excluded as well as cancelled ones. A draft is a
  // contest that was set up but never paid for — an abandoned checkout, or a
  // card that was declined. Listing them alongside real contests, complete
  // with phase pills and countdowns, told creators they had contests running
  // that nobody could join.
  const activeContests = useMemo(
    () => dbContests.filter((c) => c.status !== 'cancelled' && c.status !== 'draft'),
    [dbContests]
  );
  const cancelledDbContests = useMemo(
    () => dbContests.filter((c) => c.status === 'cancelled'),
    [dbContests]
  );
  const latest = isRealUser ? (activeContests[0] || null) : null;
  // Real contests this user has JOINED (as a participant), most-recent first,
  // plus the set of contest ids they've already submitted to. Loaded from the
  // DB so the Namespace lists a participant's invitations and can follow their
  // color. `primaryJoinedReal` is the newest joined contest.
  const [dbJoined, setDbJoined] = useState([]);
  const [submittedIds, setSubmittedIds] = useState(() => new Set());
  const [votedIds, setVotedIds] = useState(() => new Set());
  // A cancelled contest you joined is no longer actionable — drop it.
  const activeJoined = useMemo(
    () => dbJoined.filter((c) => c.status !== 'cancelled'),
    [dbJoined]
  );
  const primaryJoinedReal = isRealUser ? (activeJoined[0] || null) : null;
  // Every contest the user has joined (most-recent first) — read up here
  // so the page background can follow a participant's joined contest.
  const participations = useMemo(() => (isRealUser ? [] : readAllParticipations()), [isRealUser]);
  // If the user has submitted anonymously to a contest, their workspace
  // identity reads "Anonymous" rather than their real name.
  const submittedAnonymously = participations.some(
    (p) =>
      p.anonymous ||
      (p.submittedNames?.length > 0 && p.submittedNames.every((n) => n.anonymous))
  );
  // The SegmentThemeBackdrop + accent follow, in priority order:
  //   1. the user's own launched contest (creator), else
  //   2. the contest they most recently joined (participant), else
  //   3. the mock ongoing contest (demo fallback).
  // Without (2) a participant who joined e.g. a baby contest would get
  // the football mock's green wash — info right, background wrong.
  const primaryJoined = participations[0]
    ? getMockContestById(participations[0].contestId)
    : null;
  // Cached last segment → instant correct color on the Namespace page before
  // the contests query returns (avoids a blue flash).
  const cachedSub = isRealUser ? (() => { try { return localStorage.getItem('v4_last_sub'); } catch { return null; } })() : null;
  // Color priority for a real user: their own launched contest wins; else the
  // contest actually shown on this page — their newest joined contest — so the
  // background matches that card. cachedSub is only the instant pre-load guess
  // (before the joined query returns) to avoid a color flash; then fallbacks.
  const subId = latest?.sub_segment_id || primaryJoinedReal?.sub_segment_id || cachedSub || setup.subSegmentId || primaryJoined?.subSegmentId || (isRealUser ? 'b1' : MOCK_ONGOING.subSegmentId);
  const segmentTone = getSegmentTone(subId);
  const tierKey = setup.group || primaryJoined?.group || MOCK_ONGOING.tierKey;

  // Account identity comes from the real session + profiles table. Email is
  // read-only (it IS the sign-in identity). Display name loads from the
  // profiles row and saves back to it, so it survives re-login.
  const email = user?.email || setup.userEmail || '';
  // Seeded from the guest blob ONLY when this browser has no Supabase session
  // parked in storage. useState's initialiser runs once, before auth resolves,
  // so seeding unconditionally showed a signed-in visitor the demo's name and
  // photo until the profile fetch landed — and kept them if that fetch found
  // no display name. Checking the session token is synchronous, so we can get
  // this right on the first render rather than correcting it afterwards.
  const hasStoredSession = (() => {
    try { return Object.keys(localStorage).some((k) => /^sb-.*-auth-token$/.test(k)); }
    catch { return false; }
  })();
  const [photo, setPhoto] = useState(hasStoredSession ? null : (setup.userPhoto || null));
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [name, setName] = useState(hasStoredSession ? '' : (setup.userName || ''));
  const [savedFlash, setSavedFlash] = useState(false);
  // Until the profile fetch settles we don't know the real name/email, so we
  // hold off the "Add your name" / "no email saved" empty-state text to avoid
  // a flash of it before the real values land.
  const [profileReady, setProfileReady] = useState(false);
  const fileRef = useRef(null);
  // True once the user edits the name — so a late-arriving profile fetch
  // can't clobber what they just typed (the bug that made saves "revert").
  const nameEditedRef = useRef(false);

  // ── Change-email flow ───────────────────────────────────────────────
  // The address stays exactly as it is until Supabase's confirmation link is
  // clicked, so nothing here can strand an account: on submit we only ASK for
  // the change. 'sent' is the waiting state, not a done state.
  const [emailEditing, setEmailEditing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle'); // idle | sending | sent | error
  const [emailError, setEmailError] = useState('');
  const [emailPending, setEmailPending] = useState('');   // address awaiting confirmation

  // Keep the localStorage mirror in step with the real session address, so the
  // moment a confirmation lands (USER_UPDATED) the rest of the app stops
  // showing the old one.
  useEffect(() => {
    if (user?.email && setup.userEmail && setup.userEmail !== user.email) {
      writeSetup({ userEmail: user.email });
    }
  }, [user?.email]);

  // Load the saved display name from the user's profile row on mount.
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    supabase
      .from('profiles')
      .select('*') // '*' is resilient if avatar_url isn't migrated in yet
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!active) return;
        // The profile row is the ONLY source of identity for a signed-in
        // user. Both fields are set unconditionally, including to empty —
        // this used to read `&& data?.display_name`, so someone who hadn't
        // picked a display name yet kept whatever name the localStorage blob
        // still held, which is how a demo identity survived a real sign-in.
        // An empty name is correct there: it shows the "Add your name" prompt.
        if (!nameEditedRef.current) setName(data?.display_name || '');
        setPhoto(data?.avatar_url || null);
        setProfileReady(true);
      });
    return () => { active = false; };
  }, [user?.id]);

  // Only reveal the empty-state placeholders ("Add your name" / "no email
  // saved") once the session and profile have actually loaded.
  const identityLoading = authLoading || (isRealUser && !profileReady);

  // Load this user's real contests (creator side) from the database.
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    supabase
      .from('contests')
      .select('*')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) { console.error('[workspace] contests query failed:', error); return; }
        if (data) {
          setDbContests(data);
          // Cache the latest segment for an instant-color next visit.
          if (data[0]?.sub_segment_id) {
            try { localStorage.setItem('v4_last_sub', data[0].sub_segment_id); } catch {}
          }
        }
      });
    return () => { active = false; };
  }, [user?.id]);

  // Load this user's real JOINED contests (participant side) + which ones
  // they've already submitted to, so the "Contests you've joined" section and
  // the page color reflect a participant's invitations too.
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    (async () => {
      const [pRes, sRes, vRes] = await Promise.all([
        supabase
          .from('participants')
          .select('joined_at, contests(*)')
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false }),
        supabase.from('submissions').select('contest_id').eq('user_id', user.id),
        supabase.from('votes').select('contest_id').eq('user_id', user.id),
      ]);
      if (!active) return;
      if (pRes.error) console.error('[workspace] joined contests query failed:', pRes.error);
      else if (Array.isArray(pRes.data)) {
        // Drop rows whose contest RLS hid, and any the user themselves created
        // (those already show under "Contests you're running").
        setDbJoined(pRes.data.map((r) => r.contests).filter((c) => c && c.creator_id !== user.id));
      }
      if (!sRes.error && Array.isArray(sRes.data)) {
        setSubmittedIds(new Set(sRes.data.map((r) => r.contest_id)));
      }
      if (!vRes.error && Array.isArray(vRes.data)) {
        setVotedIds(new Set(vRes.data.map((r) => r.contest_id)));
      }
    })();
    return () => { active = false; };
  }, [user?.id]);

  // Upload the chosen image to Supabase Storage and save its public URL on
  // the profile, so it persists across re-login and devices. Mirrors to the
  // localStorage setup blob that other (still-mock) pages read.
  const handlePhotoFile = async (file) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      window.alert('Please choose an image file (PNG, JPG, etc.).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      window.alert('Image must be under 5 MB.');
      return;
    }
    setUploadingPhoto(true);
    try {
      const url = await uploadUserFile({ file, folder: 'avatar' });
      setPhoto(url);
      if (user?.id) {
        await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      }
      writeSetup({ userPhoto: url });
    } catch (err) {
      window.alert(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };
  const handleRemovePhoto = async () => {
    setPhoto(null);
    if (user?.id) {
      await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
    }
    writeSetup({ userPhoto: null });
  };

  // Real contest from setup — DEMO PATH ONLY. Real accounts read their
  // contests from the DB (dbContests), never from localStorage, so stale
  // localStorage can't surface a mock contest to a logged-in user.
  // hasStoredSession as well as isRealUser: `user` is null for the first
  // render or two while auth resolves, which flashed a demo contest at a
  // signed-in visitor before it vanished.
  const realContest = (!isRealUser && !hasStoredSession && setup.contestId) ? {
    id: setup.contestId,
    name: setup.workingName || 'Your contest',
    tierKey,
    tierInfo: TIER_INFO[tierKey] || TIER_INFO.personal,
    launchedAt: setup.launchedAt,
    submissionDays: setup.settings?.submissionDays || 7,
    votingDays: setup.settings?.votingDays || 3,
    // Crowned winner (persisted on pick), only if it's for THIS contest.
    winner: setup.winner && setup.winner.contestId === setup.contestId
      ? setup.winner
      : null,
  } : null;

  // Mock ongoing contest — pre-built so the workspace always shows life.
  const mockOngoingContest = {
    ...MOCK_ONGOING,
    tierInfo: TIER_INFO[MOCK_ONGOING.tierKey] || TIER_INFO.personal,
  };

  // Hierarchy of one for the colored card: real contest takes over once
  // the user has launched. The mock ONGOING is only a placeholder for
  // demo viewers and disappears as soon as a real one exists.
  // Mock CLOSED + their billing entries ALWAYS show, so the past-history
  // sections never look empty even after the user creates their first.
  const currentContest = realContest || (isRealUser ? null : mockOngoingContest);
  const closedContests = isRealUser ? [] : MOCK_CLOSED;

  // ── PARTICIPANT-ROLE STATE ─────────────────────────────────────────
  // Same account can be both a creator AND a participant on contests
  // they were invited to. The "Contests you've joined" section reads
  // every v4_participant_* localStorage entry and pairs each with the
  // referenced contest's current phase to derive a row.
  const joinedRows = participations.map((p) => {
    const mock = getMockContestById(p.contestId);
    // Build a minimal contest descriptor for the row helper.
    // For the prototype, all joined contests are mocks; in production
    // this would be a real contest lookup. Phase defaults to 'submission'
    // (the natural state right after joining).
    const contest = {
      id: p.contestId,
      name: mock?.workingName || p.contestName || 'Contest',
      phase: mock?.phase ? (
        // Map mock phase strings → our 3 lifecycle phases
        mock.phase.toLowerCase() === 'voting' ? 'voting'
          : mock.phase.toLowerCase() === 'winner' ? 'winner'
          : 'submission'
      ) : 'submission',
      submissionLimit: mock?.settings?.submissionLimit || 3,
      tierKey: mock?.group || 'group',
      Icon: mock?.Icon,
      subSegmentId: mock?.subSegmentId,
      // For the inline countdowns on the joined row:
      //   - voting-opens-at = launchedAt + submissionDays
      //   - winner-announced-at = launchedAt + submissionDays + votingDays
      launchedAt: mock?.launchedAt,
      submissionDays: mock?.settings?.submissionDays,
      votingDays: mock?.settings?.votingDays,
    };
    return {
      participation: p,
      contest,
      row: getParticipantRow(contest, p),
    };
  });
  const hasRunningContests = !!realContest;
  // Empty-state shape. A brand-new account runs nothing and has joined nothing
  // — that person needs the two ways IN explained (start one, or get invited),
  // not a one-line nudge. Someone who's only ever taken part gets the quieter
  // "run your own" prompt instead, so participants aren't pestered.
  const runsSomething = isRealUser ? activeContests.length > 0 : !!realContest;
  const joinedSomething = isRealUser ? activeJoined.length > 0 : joinedRows.length > 0;
  const isTrulyEmpty = !runsSomething && !joinedSomething;

  const billing = useMemo(
    () => buildBillingHistory({ realContest, mockClosed: closedContests }),
    [realContest, closedContests]
  );

  // Derive phase + days remaining from launch + durations.
  // NOTE: while we're using mock data, the rest of the app pretends the
  // contest is in the VOTING phase regardless of when it was actually
  // launched (see ContestManage's hardcoded VOTING pill). Match that
  // here so Settings doesn't disagree with the manage page.
  function describeContestStatus(c) {
    // Hardcoded mock contests carry their own phase + daysLeft.
    if (c?.phase) return { phase: c.phase, daysLeft: c.daysLeft ?? null };
    // A crowned winner overrides the demo's mid-voting default.
    if (c?.winner) return { phase: 'Winner picked', daysLeft: null };
    const MOCK_VOTING = true;
    if (MOCK_VOTING) {
      // Pretend we're mid-voting with the full vote window remaining.
      return { phase: 'Voting', daysLeft: c?.votingDays || 3 };
    }
    if (!c?.launchedAt) return { phase: 'Live', daysLeft: null };
    const daysSince = Math.floor((Date.now() - c.launchedAt) / (1000 * 60 * 60 * 24));
    const subEnd = c.submissionDays;
    const voteEnd = c.submissionDays + c.votingDays;
    if (daysSince < subEnd) {
      return { phase: 'Submissions', daysLeft: subEnd - daysSince };
    } else if (daysSince < voteEnd) {
      return { phase: 'Voting', daysLeft: voteEnd - daysSince };
    }
    return { phase: 'Closed', daysLeft: 0 };
  }

  const handleSave = async (e) => {
    e.preventDefault();
    // Email is read-only here — only the display name is editable.
    // Persist to the real profile so it survives re-login; also mirror to
    // the localStorage setup blob that other (still-mock) pages read.
    const clean = name.trim();
    if (user?.id) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: clean })
        .eq('id', user.id)
        .select();
      if (error) console.error('[profile save] failed:', error.message);
      else if (!data?.length) console.warn('[profile save] 0 rows updated (check RLS)');
    }
    writeSetup({ userName: clean });
    nameEditedRef.current = false; // saved value is now the source of truth
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
  };

  // Ask Supabase to move the account to a new address. It emails a
  // confirmation link (and, with Secure email change on, one to the current
  // address too); the switch only happens once those are clicked, so a typo
  // here costs nothing but a resend.
  const handleEmailChange = async () => {
    const next = newEmail.trim();
    const current = (email || '').trim();
    if (!next) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next)) {
      setEmailStatus('error');
      setEmailError('That doesn’t look like an email address.');
      return;
    }
    if (next.toLowerCase() === current.toLowerCase()) {
      setEmailStatus('error');
      setEmailError('That’s already the address on this account.');
      return;
    }
    setEmailStatus('sending');
    setEmailError('');
    const { error } = await changeEmail(next, `${window.location.origin}/v4/settings`);
    if (error) {
      setEmailStatus('error');
      // Supabase's own wording is decent here (already registered, rate
      // limited, etc.) — surface it rather than flattening every case.
      setEmailError(error.message || 'Could not start the change. Please try again.');
      return;
    }
    setEmailPending(next);
    setEmailStatus('sent');
    setEmailEditing(false);
    setNewEmail('');
  };

  const cancelEmailChange = () => {
    setEmailEditing(false);
    setNewEmail('');
    setEmailStatus('idle');
    setEmailError('');
  };

  const handleStartNewContest = () => {
    // Send the user back to the tier picker. We deliberately don't
    // clear setup here — the picker decides whether to start fresh.
    navigate('/v4/pick');
  };

  // Both Billing and Account are collapsed by default — they're
  // secondary/tertiary on this workspace page where contests are king.
  const [billingOpen, setBillingOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // The namespace is an account page, so it needs an account. Without this a
  // signed-out visitor got the full workspace shell wrapped around nothing —
  // "Add your name", "no email saved", and AvatarMenu's stock-photo fallback
  // in the corner, which reads as somebody else's profile rather than as
  // being logged out.
  //
  // The guest exception is the launch flow: someone who pays before creating
  // an account lands here with their contest in the setup blob and no session
  // until they open the magic link. That contest is genuinely theirs.
  //
  // Placed after every hook — an early return above one changes the hook
  // count between renders and blanks the page (learned on LandingPage).
  if (!authLoading && !user && !setup.contestId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="v4 lp-v3">
      <div className="v4-screen">
        <SegmentThemeBackdrop subId={subId} minimal />

        <main className="v4-review" role="main">
          {/* Glass nav — matches ContestManage pattern */}
          <header className="v4-nav v4-nav-clear v4-nav--ends">
            <BrandLink />
            <div className="v4-nav-right">
              <AvatarMenu
                email={email}
                name={name}
                photo={photo}
                /* No custom photo → generated avatar seeded by the user id. */
                seed={user?.id}
                tone={segmentTone}
                activeContest={
                  latest
                    ? {
                        id: latest.id,
                        name: latest.working_name || 'Your contest',
                        phase: latest.status === 'submission' ? 'Submissions'
                          : latest.status === 'voting' ? 'Voting'
                          : latest.status === 'closed' ? 'Winner' : 'Live',
                        tone: segmentTone,
                        contest: latest, // passed via nav state → Manage opens instantly
                      }
                    : primaryJoinedReal
                    ? {
                        id: primaryJoinedReal.id,
                        name: primaryJoinedReal.working_name || 'Contest',
                        phase: primaryJoinedReal.status === 'voting' ? 'Voting'
                          : primaryJoinedReal.status === 'closed' ? 'Winner' : 'Submissions',
                        tone: segmentTone,
                        // Take the participant straight back to where they are.
                        to: `/v4/contest/${primaryJoinedReal.id}/${
                          primaryJoinedReal.status === 'closed' ? 'winner'
                          : primaryJoinedReal.status === 'voting'
                            ? (votedIds.has(primaryJoinedReal.id) ? 'vote-thanks' : 'vote')
                          : submittedIds.has(primaryJoinedReal.id) ? 'thanks' : 'submit'
                        }`,
                      }
                    : currentContest
                    ? {
                        id: currentContest.id,
                        name: currentContest.name,
                        ...describeContestStatus(currentContest),
                        tone: segmentTone,
                        to: !realContest && joinedRows.length > 0
                          ? '/v4/settings'
                          : undefined,
                      }
                    : null
                }
              />
            </div>
          </header>

          <div className="v4-review-inner">
            {/* ── Page heading ───────────────────────────────────
                Subtitle adapts to what's actually on the page so it
                never promises a section the user can't see. Three
                cases:
                  - Creator with a launched contest → mentions billing
                  - Participant only (no launched contest) → mentions
                    just the contests they've joined
                  - Fresh user (nothing yet) → friendly catch-all */}
            <div className="v4-settings-head">
              <h1 className="v4-settings-title">Namespace</h1>
              <p className="v4-settings-subtitle">
                {realContest
                  ? 'Your contests, billing, and account in one place.'
                  : (joinedRows.length > 0 || activeJoined.length > 0 || activeContests.length > 0)
                    ? 'Your contests and account, in one place.'
                    : 'Your account, and the home for any contest you run or join.'}
              </p>
            </div>

            {/* ── CONTESTS YOU'VE JOINED (real) ─────────────────────
                Participant invitations from the database. Shown first
                (before your own running contests) because they're the
                time-sensitive ones. Each row routes to exactly where the
                participant is in that contest's lifecycle. */}
            {isRealUser && activeJoined.length > 0 && (
              <section className="v4-settings-section">
                <header className="v4-settings-section-head">
                  <ListBullets weight="duotone" size={18} />
                  <h2>Contests you’ve joined</h2>
                </header>
                {activeJoined.map((c) => {
                  const cTone = getSegmentTone(c.sub_segment_id || 'b1');
                  const CIcon = getSegmentIcon(c.sub_segment_id) || Briefcase;
                  const hasSubmitted = submittedIds.has(c.id);
                  const hasVoted = votedIds.has(c.id);
                  const status = c.status || 'submission';
                  let label, to, cta;
                  if (status === 'closed') { label = 'WINNER'; to = `/v4/contest/${c.id}/winner`; cta = 'See who won'; }
                  // Voting is one-shot: once you've voted, the row shows a
                  // locked "Voted" state that opens the confirmation, not a
                  // re-votable ballot.
                  else if (status === 'voting' && hasVoted) { label = 'VOTED'; to = `/v4/contest/${c.id}/vote-thanks`; cta = 'View your votes'; }
                  else if (status === 'voting') { label = 'VOTING OPEN'; to = `/v4/contest/${c.id}/vote`; cta = 'Vote now'; }
                  else if (hasSubmitted) { label = 'SUBMITTED'; to = `/v4/contest/${c.id}/thanks`; cta = 'See your names'; }
                  else { label = 'SUBMISSIONS OPEN'; to = `/v4/contest/${c.id}/submit`; cta = 'Suggest a name'; }
                  return (
                    <div key={c.id} className="v4-settings-current" style={{ background: cTone.bg + '40' }}>
                      <span
                        className="v4-settings-current-icon"
                        style={{ background: cTone.bg, color: cTone.fg }}
                        aria-hidden="true"
                      >
                        <CIcon weight="duotone" size={22} />
                      </span>
                      <div className="v4-settings-current-text">
                        <div className="v4-settings-current-eyebrow">
                          {status !== 'closed' && <span className="v4-manage-live-dot" aria-hidden="true"></span>}
                          <span>{label}</span>
                        </div>
                        <div className="v4-settings-current-name">{c.working_name || 'Contest'}</div>
                        <div className="v4-settings-current-meta">
                          {c.sub_segment_title || 'Contest'} · you’re a participant
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(to)}
                      >
                        {cta} <ArrowRight weight="bold" size={14} />
                      </button>
                    </div>
                  );
                })}
              </section>
            )}

            {/* ── CONTESTS YOU'VE JOINED ────────────────────────────
                Joined contests come FIRST: if you signed in as a
                participant, that's the only thing you care about. If
                you've also launched your own, you'll still see this
                section first because invitations from other people
                are time-sensitive (submissions / votes open / close)
                while your own running contest is a slower-burn item. */}
            {joinedRows.length > 0 && (
              <section className="v4-settings-section">
                <header className="v4-settings-section-head">
                  <ListBullets weight="duotone" size={18} />
                  <h2>Contests you’ve joined</h2>
                </header>
                {joinedRows.map(({ participation, contest, row }) => (
                  <JoinedContestRow
                    key={contest.id}
                    participation={participation}
                    contest={contest}
                    row={row}
                    navigate={navigate}
                  />
                ))}
              </section>
            )}

            {/* ── CONTESTS YOU'RE RUNNING ─────────────────────────
                Two visual treatments:
                - WITH a real contest: full section with header, the
                  big tinted "current" card, closed-contest history,
                  and a quiet "start another" footer.
                - WITHOUT: no header, no big empty card — just a quiet
                  inline "Start a contest" prompt that lives politely
                  under the joined contests, so participants who never
                  intend to run one aren't pestered. */}
            {/* Real contests you've created — read from the database.
                Cancelled ones are excluded here (shown in their own section). */}
            {isRealUser && activeContests.length > 0 && (
              <section className="v4-settings-section">
                <header className="v4-settings-section-head">
                  <ListBullets weight="duotone" size={18} />
                  <h2>Contests you’re running</h2>
                </header>
                {activeContests.map((c) => {
                  const cTone = getSegmentTone(c.sub_segment_id || 'b1');
                  const CIcon = getSegmentIcon(c.sub_segment_id) || TIER_INFO[c.tier]?.Icon || Briefcase;
                  const statusLabel = (c.status || 'live').replace('_', ' ');
                  return (
                    <div key={c.id} className="v4-settings-current" style={{ background: cTone.bg + '40' }}>
                      <span
                        className="v4-settings-current-icon"
                        style={{ background: cTone.bg, color: cTone.fg }}
                        aria-hidden="true"
                      >
                        <CIcon weight="duotone" size={22} />
                      </span>
                      <div className="v4-settings-current-text">
                        <div className="v4-settings-current-eyebrow">
                          <span className="v4-manage-live-dot" aria-hidden="true"></span>
                          <span>{statusLabel.toUpperCase()}</span>
                        </div>
                        <div className="v4-settings-current-name">{c.working_name || 'Your contest'}</div>
                        <div className="v4-settings-current-meta">
                          {c.sub_segment_title || TIER_INFO[c.tier]?.label || 'Contest'}
                          {c.price ? ` · paid $${c.price}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/v4/contest/${c.id}`, { state: { contest: c } })}
                      >
                        Manage <ArrowRight weight="bold" size={14} />
                      </button>
                    </div>
                  );
                })}
              </section>
            )}

            {/* ── CANCELLED (real) ─────────────────────────────────
                Contests the creator ended. Muted rows, no actions —
                just a record that they were cancelled. */}
            {isRealUser && cancelledDbContests.length > 0 && (
              <section className="v4-settings-section">
                <header className="v4-settings-section-head">
                  <X weight="bold" size={18} />
                  <h2>Cancelled contests</h2>
                </header>
                {cancelledDbContests.map((c) => (
                  <div key={c.id} className="v4-settings-contest-row v4-settings-contest-row-cancelled">
                    <span className="v4-settings-contest-row-icon" aria-hidden="true">
                      <X weight="bold" size={16} />
                    </span>
                    <div className="v4-settings-contest-row-text">
                      <div className="v4-settings-contest-row-eyebrow">
                        <span>Cancelled</span>
                      </div>
                      <div className="v4-settings-contest-row-name">
                        {c.working_name || 'Untitled contest'}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {realContest ? (
              <section className="v4-settings-section">
                <header className="v4-settings-section-head">
                  <ListBullets weight="duotone" size={18} />
                  <h2>Contests you’re running</h2>
                </header>

                {(() => {
                  const status = describeContestStatus(realContest);
                  const TierIcon = realContest.Icon || realContest.tierInfo.Icon;
                  const isConcluded = status.phase === 'Winner picked' || status.phase === 'Closed';
                  return (
                    <div
                      className="v4-settings-current"
                      style={{ background: segmentTone.bg + '40' }}
                    >
                      <span
                        className="v4-settings-current-icon"
                        style={{ background: segmentTone.bg, color: segmentTone.fg }}
                        aria-hidden="true"
                      >
                        <TierIcon weight="duotone" size={22} />
                      </span>
                      <div className="v4-settings-current-text">
                        <div className="v4-settings-current-eyebrow">
                          {!isConcluded && (
                            <span className="v4-manage-live-dot" aria-hidden="true"></span>
                          )}
                          <span>{status.phase.toUpperCase()}</span>
                          {status.daysLeft !== null && status.phase !== 'Closed' && (
                            <>
                              <span className="v4-settings-current-sep">·</span>
                              <span>
                                {status.daysLeft === 0 ? 'Closes today'
                                  : status.daysLeft === 1 ? '1 day left'
                                  : `${status.daysLeft} days left`}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="v4-settings-current-name">
                          {realContest.name}
                        </div>
                        <div className="v4-settings-current-meta">
                          {realContest.winner?.name
                            ? <>Won “{realContest.winner.name}”</>
                            : <>{realContest.tierInfo.label} contest · paid ${realContest.tierInfo.price}</>}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(
                          realContest.winner
                            ? `/v4/contest/${realContest.id}?phase=winner`
                            : `/v4/contest/${realContest.id}`
                        )}
                      >
                        Manage
                        <ArrowRight weight="bold" size={14} />
                      </button>
                    </div>
                  );
                })()}

                {/* PAST CLOSED — only when there's a real creator
                    history. In participant-only simulation, closed
                    contests vanish too (nothing to show). */}
                {closedContests.map((closed) => {
                  const closedTier = TIER_INFO[closed.tierKey] || TIER_INFO.personal;
                  const ClosedIcon = closedTier.Icon;
                  return (
                    <div
                      key={closed.id}
                      className="v4-settings-contest-row v4-settings-contest-row-closed"
                    >
                      <span className="v4-settings-contest-row-icon" aria-hidden="true">
                        <ClosedIcon weight="duotone" size={18} />
                      </span>
                      <div className="v4-settings-contest-row-text">
                        <div className="v4-settings-contest-row-eyebrow">
                          <Trophy weight="bold" size={11} />
                          <span>Closed {closed.closedAgo} · won “{closed.winner}”</span>
                        </div>
                        <div className="v4-settings-contest-row-name">
                          {closed.name}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => window.alert('Results page lands when we build it.')}
                      >
                        View results
                      </button>
                    </div>
                  );
                })}

                {/* CANCELLED contests — only shown when the user has
                    cancelled at least one. Sits below the running
                    contest + the closed ones so the chronology reads
                    naturally. Each row is muted and followed by the
                    Catchword consultation block: "couldn't find a
                    name? book the pros." */}
                {Array.isArray(setup.cancelledContests) && setup.cancelledContests.length > 0 && (
                  <>
                    {setup.cancelledContests.map((c) => (
                      <div
                        key={c.id}
                        className="v4-settings-contest-row v4-settings-contest-row-cancelled"
                      >
                        <span className="v4-settings-contest-row-icon" aria-hidden="true">
                          <X weight="bold" size={16} />
                        </span>
                        <div className="v4-settings-contest-row-text">
                          <div className="v4-settings-contest-row-eyebrow">
                            <span>Cancelled</span>
                          </div>
                          <div className="v4-settings-contest-row-name">
                            {c.workingName || 'Untitled contest'}
                          </div>
                        </div>
                      </div>
                    ))}
                    <CatchwordConsultBlock
                      headline="Couldn't find the right name?"
                      body={<>Naming is hard. Catchword (the agency NamingContest is built on top of) runs deeper, one-on-one sessions when the crowd doesn’t crack it.</>}
                    />
                  </>
                )}

                {/* Quiet "start another" footer. */}
                <div className="v4-settings-newcontest-quiet">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleStartNewContest}
                  >
                    <Plus weight="bold" size={14} />
                    Start another contest
                  </button>
                  <span className="v4-settings-newcontest-quiet-meta">
                    One-time fee · $9 / $19 / $39 by voter count
                  </span>
                </div>
              </section>
            ) : Array.isArray(setup.cancelledContests) && setup.cancelledContests.length > 0 ? (
              /* No running contest but cancelled ones exist — show
                 them in their own section so the workspace isn't
                 silent about the user's recent action. */
              <section className="v4-settings-section">
                <header className="v4-settings-section-head">
                  <X weight="bold" size={18} />
                  <h2>Cancelled contests</h2>
                </header>
                {setup.cancelledContests.map((c) => (
                  <div
                    key={c.id}
                    className="v4-settings-contest-row v4-settings-contest-row-cancelled"
                  >
                    <span className="v4-settings-contest-row-icon" aria-hidden="true">
                      <X weight="bold" size={16} />
                    </span>
                    <div className="v4-settings-contest-row-text">
                      <div className="v4-settings-contest-row-eyebrow">
                        <span>Cancelled</span>
                      </div>
                      <div className="v4-settings-contest-row-name">
                        {c.workingName || 'Untitled contest'}
                      </div>
                    </div>
                  </div>
                ))}
                <CatchwordConsultBlock
                  headline="Couldn't find the right name?"
                  body={<>Naming is hard. Catchword (the agency NamingContest is built on top of) runs deeper, one-on-one sessions when the crowd doesn’t crack it.</>}
                />
              </section>
            ) : null /* Quiet "Start a contest" nudge lives at the
                        very bottom of the page (after the Account
                        section) so it stays out of the way. */}

            {/* ── Billing section (compact, collapsed by default) ──
                Only shown after the user has launched a real contest —
                participants and never-launched creators have nothing to
                bill, so the section is hidden entirely (no Visa-on-file
                placeholder, no "no purchases yet" empty state). */}
            {realContest && (
            <section className={`v4-settings-section v4-settings-section-compact ${billingOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="v4-settings-account-trigger"
                onClick={() => setBillingOpen((v) => !v)}
                aria-expanded={billingOpen}
              >
                <span className="v4-settings-trigger-icon" aria-hidden="true">
                  <CreditCard weight="duotone" size={20} />
                </span>
                <div className="v4-settings-account-meta">
                  <div className="v4-settings-account-name">Billing</div>
                  <div className="v4-settings-account-email">
                    <span className="v4-settings-card-brand">Visa</span> ending in <strong>4242</strong>
                    <span className="v4-settings-row-meta"> · {billing.length} {billing.length === 1 ? 'purchase' : 'purchases'}</span>
                  </div>
                </div>
                <span className="v4-settings-account-action">
                  <CreditCard weight="duotone" size={14} />
                  {billingOpen ? 'Close' : 'Manage'}
                </span>
              </button>

              {billingOpen && (
                <div className="v4-settings-account-body">
                  {/* Saved payment method */}
                  <div className="v4-settings-row">
                    <div className="v4-settings-row-text">
                      <div className="v4-settings-row-label">Payment method on file</div>
                      <div className="v4-settings-row-value">
                        <span className="v4-settings-card-brand">Visa</span> ending in <strong>4242</strong>
                        <span className="v4-settings-row-meta"> · expires 04 / 28</span>
                      </div>
                      <div className="v4-settings-row-hint">
                        Charged the next time you launch a contest. You can pick a
                        different card at checkout.
                      </div>
                    </div>
                    <button type="button" className="btn btn-link">
                      Update <ArrowSquareOut weight="bold" size={12} />
                    </button>
                  </div>

                  {/* Past purchases */}
                  <div className="v4-settings-billing">
                    <div className="v4-settings-billing-head">
                      <Receipt weight="duotone" size={14} />
                      <span>Past contest purchases</span>
                    </div>
                    {billing.length === 0 ? (
                      <div className="v4-settings-billing-empty">
                        No purchases yet. Your first contest launch will appear here.
                      </div>
                    ) : (
                      <ul className="v4-settings-billing-list">
                        {billing.map((inv) => (
                          <li key={inv.id} className="v4-settings-billing-row">
                            <span className="v4-settings-billing-date">{inv.date}</span>
                            <span className="v4-settings-billing-desc">
                              {inv.desc}
                              {inv.contestName && (
                                <span className="v4-settings-billing-sub"> · “{inv.contestName}”</span>
                              )}
                            </span>
                            <span className="v4-settings-billing-amount">${inv.amount}</span>
                            <span className="v4-settings-billing-status">{inv.status}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </section>
            )}

            {/* ── Account section (compact, collapsed by default) ── */}
            <section className={`v4-settings-section v4-settings-section-compact ${accountOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="v4-settings-account-trigger"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
              >
                <span className="v4-settings-account-photo" aria-hidden="true">
                  {photo ? (
                    <img src={photo} alt="" className="v4-settings-account-photo-img is-custom" />
                  ) : (
                    <UserAvatar seed={user?.id} size={40} />
                  )}
                </span>
                <div className="v4-settings-account-meta">
                  <div className="v4-settings-account-name">
                    {submittedAnonymously
                      ? 'Anonymous'
                      : (name || (identityLoading ? ' ' : 'Add your name'))}
                  </div>
                  <div className="v4-settings-account-email">
                    {email || (identityLoading ? ' ' : 'no email saved')}
                  </div>
                </div>
                <span className="v4-settings-account-action">
                  <User weight="duotone" size={14} />
                  {accountOpen ? 'Close' : 'Edit profile'}
                </span>
              </button>

              {accountOpen && (
                <div className="v4-settings-account-body">
                  {/* Photo upload — same drag-drop affordance as before. */}
                  <div className="v4-settings-photo-block">
                    <button
                      type="button"
                      className="v4-settings-photo"
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('is-dragover'); }}
                      onDragLeave={(e) => { e.currentTarget.classList.remove('is-dragover'); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('is-dragover');
                        handlePhotoFile(e.dataTransfer.files?.[0]);
                      }}
                      aria-label="Change profile photo"
                    >
                      {photo ? (
                        <img src={photo} alt="" className="v4-settings-photo-img is-custom" />
                      ) : (
                        <UserAvatar seed={user?.id} size={96} />
                      )}
                      <span className="v4-settings-photo-overlay" aria-hidden="true">
                        <Camera weight="duotone" size={20} />
                        <span>Change photo</span>
                      </span>
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="v4-settings-photo-input"
                      onChange={(e) => handlePhotoFile(e.target.files?.[0])}
                    />
                    <div className="v4-settings-photo-meta">
                      <div className="v4-settings-photo-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => fileRef.current?.click()}
                          disabled={uploadingPhoto}
                        >
                          <Camera weight="bold" size={14} />
                          {uploadingPhoto ? 'Uploading…' : 'Upload new photo'}
                        </button>
                        {photo && (
                          <button
                            type="button"
                            className="btn btn-link"
                            onClick={handleRemovePhoto}
                          >
                            <Trash weight="bold" size={12} />
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="v4-settings-photo-note">
                        <Info weight="duotone" size={14} />
                        <span>
                          This is how participants will see you on invitations
                          you send by email. PNG or JPG, up to 5&nbsp;MB.
                        </span>
                      </p>
                    </div>
                  </div>

                  <form className="v4-settings-form" onSubmit={handleSave}>
                    <label className="v4-settings-field">
                      <span className="v4-settings-field-label">Display name</span>
                      <input
                        type="text"
                        className="v4-settings-input"
                        value={name}
                        onChange={(e) => { nameEditedRef.current = true; setName(e.target.value); }}
                        placeholder="What should we call you?"
                      />
                    </label>

                    {/* Email is the magic-link sign-in identity, so it only
                        moves via Supabase's confirmation link — the address
                        below stays live until that link is clicked. Not a
                        <label>/<form>: this sits inside the profile form, and
                        nesting either would hijack its submit. */}
                    <div className="v4-settings-field">
                      <span className="v4-settings-field-label">Email</span>

                      {!emailEditing && (
                        <>
                          <div className="v4-settings-input-with-icon">
                            <EnvelopeSimple weight="bold" size={14} className="v4-settings-input-icon" />
                            <input
                              type="email"
                              className="v4-settings-input v4-settings-input-padded v4-settings-input-locked"
                              value={email}
                              readOnly
                              disabled
                              aria-readonly="true"
                              tabIndex={-1}
                              placeholder="you@example.com"
                            />
                          </div>

                          {emailStatus === 'sent' ? (
                            <span className="v4-settings-field-hint" role="status">
                              <CheckCircle weight="duotone" size={14} />{' '}
                              Confirmation sent to <strong>{emailPending}</strong>. Open
                              the link there to finish the switch. For security you may
                              also get one at your current address, which needs
                              confirming too. Until then, keep using this address to
                              sign in. If nothing arrives, check the spam folder, or try
                              another address; that one may already have an account.{' '}
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() => { setEmailStatus('idle'); setEmailEditing(true); setNewEmail(emailPending); }}
                              >
                                Send again
                              </button>
                            </span>
                          ) : (
                            <span className="v4-settings-field-hint">
                              Your sign-in links land here.{' '}
                              <button
                                type="button"
                                className="btn btn-link"
                                onClick={() => { setEmailEditing(true); setEmailStatus('idle'); setEmailError(''); }}
                                disabled={!isRealUser}
                              >
                                Change email
                              </button>
                            </span>
                          )}
                        </>
                      )}

                      {emailEditing && (
                        <>
                          <div className="v4-settings-input-with-icon">
                            <EnvelopeSimple weight="bold" size={14} className="v4-settings-input-icon" />
                            <input
                              type="email"
                              className="v4-settings-input v4-settings-input-padded"
                              value={newEmail}
                              onChange={(e) => { setNewEmail(e.target.value); setEmailStatus('idle'); setEmailError(''); }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') { e.preventDefault(); handleEmailChange(); }
                                if (e.key === 'Escape') cancelEmailChange();
                              }}
                              placeholder="new@example.com"
                              autoFocus
                              autoComplete="email"
                              aria-label="New email address"
                            />
                          </div>

                          <div className="v4-settings-photo-actions" style={{ marginTop: 10 }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={handleEmailChange}
                              disabled={emailStatus === 'sending' || !newEmail.trim()}
                            >
                              <PaperPlaneTilt weight="bold" size={14} />
                              {emailStatus === 'sending' ? 'Sending…' : 'Send confirmation'}
                            </button>
                            <button type="button" className="btn btn-link" onClick={cancelEmailChange}>
                              Cancel
                            </button>
                          </div>

                          <span className="v4-settings-field-hint">
                            {emailStatus === 'error' ? (
                              <span role="alert" style={{ color: '#a8321f' }}>{emailError}</span>
                            ) : (
                              <>Nothing changes until you open the confirmation link we
                              send to the new address.</>
                            )}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="v4-settings-form-foot">
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        {savedFlash ? 'Saved!' : 'Save changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </section>

            {/* ── START A CONTEST ────────────────────────────────
                Nothing run, nothing joined → explain BOTH ways in,
                including that joining needs an invite (otherwise people
                hunt for a contest list that doesn't exist).

                Otherwise a quiet one-line nudge, worded for where they
                actually are: joined-but-never-run gets "of your own",
                an existing organiser gets "another". There is always a
                way to start one from here — this branch used to end at
                !runsSomething, which meant the moment you ran a contest
                the route to starting a second one vanished.

                The organiser nudge is real-user only: the guest/demo
                path already carries its own "Start another contest"
                button inside the contests section, so showing both
                would double up. */}
            {isTrulyEmpty ? (
              <section className="v4-settings-empty">
                <h2 className="v4-settings-empty-title">Nothing here yet</h2>
                <p className="v4-settings-empty-body">
                  Two ways to change that: start a contest of your own, or join
                  someone else’s; they’ll send you an invitation link.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleStartNewContest}
                >
                  Start a contest <ArrowRight weight="bold" size={14} />
                </button>
              </section>
            ) : !runsSomething ? (
              <p className="v4-settings-start-nudge">
                Want to name something of your own?{' '}
                <button
                  type="button"
                  className="v4-settings-start-nudge-link"
                  onClick={handleStartNewContest}
                >
                  Start a contest <ArrowRight weight="bold" size={12} />
                </button>
              </p>
            ) : isRealUser ? (
              <p className="v4-settings-start-nudge">
                Got something else to name?{' '}
                <button
                  type="button"
                  className="v4-settings-start-nudge-link"
                  onClick={handleStartNewContest}
                >
                  Start another contest <ArrowRight weight="bold" size={12} />
                </button>
              </p>
            ) : null}
          </div>
        </main>
      </div>
      {/* Pending draft (creator brief or unsent participant names) →
          floating "continue where you left off" pill. Browser-local. */}
      <ResumeDraftPill />
    </div>
  );
}

// ── Joined contest row — with live countdown + greyed-out vote button.
// Lives at the bottom of the file because it uses its own hook
// (useCountdown) so it has to be a component, not inline JSX in map.
function JoinedContestRow({ participation, contest, row, navigate }) {
  const tier = TIER_INFO[contest.tierKey] || TIER_INFO.group;
  const JoinedIcon = contest.Icon || tier.Icon;
  // Left-edge accent always follows the SEGMENT tone (so a sports
  // contest reads green, a business one periwinkle, etc.) — not the
  // pricing tier, which made the stripe look random vs. the segment.
  const segTone = getSegmentTone(contest.subSegmentId);
  const day = 86400000;
  const votingOpensAt =
    Number.isFinite(contest.launchedAt) && Number.isFinite(contest.submissionDays)
      ? contest.launchedAt + contest.submissionDays * day
      : null;
  // Winner announced when the full submit+vote window has passed.
  const winnerAnnouncedAt =
    Number.isFinite(contest.launchedAt)
      && Number.isFinite(contest.submissionDays)
      && Number.isFinite(contest.votingDays)
      ? contest.launchedAt + (contest.submissionDays + contest.votingDays) * day
      : null;
  const voteCountdown = useCountdown(votingOpensAt);
  const winnerCountdown = useCountdown(winnerAnnouncedAt);
  const submittedCount = participation?.submittedNames?.length || 0;
  const votedCount = participation?.votedFor?.length || 0;
  const hasSubmitted = submittedCount > 0;
  const hasVoted = votedCount > 0;

  // Row states (in order of precedence):
  //   - Concluded (winner announced) → whole row links to the reveal
  //   - No submissions yet → "Suggest a name" → /submit
  //   - Voted → "Voted ✓" pill + countdown to winner announcement
  //   - Voting open (countdown done), not voted → enabled "Vote now"
  //   - Submitted, voting NOT open yet → greyed Vote + countdown
  //
  // Concluded wins over everything: once a name is crowned (winnerSubId
  // set, or the announce window has elapsed) the only useful move is
  // "see who won," so the entire row becomes a clickable link to the
  // participant winner reveal.
  const isConcluded = !!contest.winnerSubId || winnerCountdown.isReady;
  const rowClickTo = isConcluded ? `/v4/contest/${contest.id}/winner` : null;

  let actionUI = null;
  if (isConcluded) {
    actionUI = (
      <span className="v4-settings-joined-seewinner">
        See who won
        <ArrowRight weight="bold" size={14} />
      </span>
    );
  } else if (!hasSubmitted) {
    actionUI = (
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={() => navigate(`/v4/contest/${contest.id}/submit`)}
      >
        Suggest a name
        <ArrowRight weight="bold" size={14} />
      </button>
    );
  } else if (hasVoted) {
    const showWinnerCountdown =
      !winnerCountdown.isReady && !winnerCountdown.unknown;
    actionUI = (
      <div className="v4-settings-joined-vote">
        {showWinnerCountdown && (
          <div
            className="v4-settings-joined-countdown"
            title="Time until winner is announced"
          >
            <Clock weight="duotone" size={11} />
            <span className="v4-settings-joined-countdown-time">
              {winnerCountdown.d}d {pad2(winnerCountdown.h)}:{pad2(winnerCountdown.m)}:{pad2(winnerCountdown.s)}
            </span>
          </div>
        )}
        <span className="v4-settings-joined-voted">Voted ✓</span>
      </div>
    );
  } else {
    const showCountdown = !voteCountdown.isReady && !voteCountdown.unknown;
    actionUI = (
      <div className="v4-settings-joined-vote">
        {showCountdown && (
          <div className="v4-settings-joined-countdown" title="Time until voting opens">
            <Clock weight="duotone" size={11} />
            <span className="v4-settings-joined-countdown-time">
              {voteCountdown.d}d {pad2(voteCountdown.h)}:{pad2(voteCountdown.m)}:{pad2(voteCountdown.s)}
            </span>
          </div>
        )}
        <button
          type="button"
          className="btn btn-primary btn-sm v4-settings-joined-vote-btn"
          onClick={() => navigate(`/v4/contest/${contest.id}/vote`)}
          disabled={!voteCountdown.isReady}
          title={voteCountdown.isReady ? 'Cast your vote' : 'Voting opens soon'}
        >
          {voteCountdown.isReady ? 'Vote now' : 'Vote'}
          {voteCountdown.isReady && <ArrowRight weight="bold" size={14} />}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`v4-settings-contest-row v4-settings-contest-row-joined${rowClickTo ? ' is-clickable' : ''}`}
      style={{ '--row-accent': segTone.fg }}
      onClick={rowClickTo ? () => navigate(rowClickTo) : undefined}
      role={rowClickTo ? 'button' : undefined}
      tabIndex={rowClickTo ? 0 : undefined}
      onKeyDown={
        rowClickTo
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(rowClickTo);
              }
            }
          : undefined
      }
    >
      <span className="v4-settings-contest-row-icon" aria-hidden="true">
        <JoinedIcon weight="duotone" size={18} />
      </span>
      <div className="v4-settings-contest-row-text">
        <div className="v4-settings-contest-row-eyebrow">
          <span>{isConcluded ? 'WINNER' : row.phaseLabel}</span>
        </div>
        <div className="v4-settings-contest-row-name">
          {contest.name}
        </div>
        <div className="v4-settings-contest-row-desc">
          {isConcluded ? 'Winner revealed: see who took it' : row.description}
        </div>
      </div>
      {actionUI}
    </div>
  );
}
