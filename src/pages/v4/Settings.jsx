// V4 Settings page — single page with two sections (Account + Subscription).
// Reads identity + plan info from localStorage v4_contest_setup blob.
// All "save" / "cancel plan" actions are mock for now; wire to real
// backend (Supabase) and Stripe customer portal later.

import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X, EnvelopeSimple, User, CreditCard, Receipt, ArrowSquareOut,
  Heart, UsersThree, Briefcase, Camera, Info, Trash, Plus,
  ArrowRight, ListBullets, Trophy, Clock,
} from '@phosphor-icons/react';
import useCountdown, { pad2 } from '../../utils/useCountdown';
import participantProfile from '../../assets/participant-profile.png';
import creatorProfile from '../../assets/creator-profile.png';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import { readSetup, writeSetup } from '../../utils/v4Brief';
import { readAllParticipations, getParticipantRow } from '../../utils/v4Participant';
import { getMockContestById, MOCK_CONTESTS } from '../../data/v4/mockContests';
import { SegmentThemeBackdrop, getSegmentTone } from '../../data/v4/segmentTheme';
import AvatarMenu from '../../components/v4/AvatarMenu';
import CatchwordConsultBlock from '../../components/v4/CatchwordConsultBlock';
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
  // Every contest the user has joined (most-recent first) — read up here
  // so the page background can follow a participant's joined contest.
  const participations = useMemo(() => readAllParticipations(), []);
  // The SegmentThemeBackdrop + accent follow, in priority order:
  //   1. the user's own launched contest (creator), else
  //   2. the contest they most recently joined (participant), else
  //   3. the mock ongoing contest (demo fallback).
  // Without (2) a participant who joined e.g. a baby contest would get
  // the football mock's green wash — info right, background wrong.
  const primaryJoined = participations[0]
    ? getMockContestById(participations[0].contestId)
    : null;
  const subId = setup.subSegmentId || primaryJoined?.subSegmentId || MOCK_ONGOING.subSegmentId;
  const segmentTone = getSegmentTone(subId);
  const tierKey = setup.group || primaryJoined?.group || MOCK_ONGOING.tierKey;

  // Account form state — photo + name + email, persisted to setup blob.
  const [photo, setPhoto] = useState(setup.userPhoto || null);
  const [email, setEmail] = useState(setup.userEmail || '');
  const [name, setName] = useState(setup.userName || '');
  const [savedFlash, setSavedFlash] = useState(false);
  const fileRef = useRef(null);

  // Read uploaded image as a data URL → store it on the setup blob.
  // (Prototype-grade. In production, upload to Supabase Storage and
  // persist the public URL instead.)
  const handlePhotoFile = (file) => {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      window.alert('Please choose an image file (PNG, JPG, etc.).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      window.alert('Image must be under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (typeof dataUrl === 'string') {
        setPhoto(dataUrl);
        writeSetup({ userPhoto: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };
  const handleRemovePhoto = () => {
    setPhoto(null);
    writeSetup({ userPhoto: null });
  };

  // Real contest from setup (only present after the user has launched).
  const realContest = setup.contestId ? {
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
  const currentContest = realContest || mockOngoingContest;
  const closedContests = MOCK_CLOSED;

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

  const handleSave = (e) => {
    e.preventDefault();
    // Email is read-only here — only the display name is editable
    // through this form. (Photo persists on upload immediately.)
    writeSetup({ userName: name.trim() });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2200);
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


  return (
    <div className="v4 lp-v3">
      <div className="v4-screen">
        <SegmentThemeBackdrop subId={subId} />

        <main className="v4-review" role="main">
          {/* Glass nav — matches ContestManage pattern */}
          <header className="v4-nav">
            <BrandLink />
            <div className="v4-progress">
              <span className="v4-step-label">Home</span>
            </div>
            <div className="v4-nav-right">
              <AvatarMenu
                email={email}
                name={name}
                photo={photo}
                /* Side-specific default profile picture: participant-profile
                   when in participant mode (joined, no launched contest),
                   creator-profile otherwise. A real upload still wins. */
                defaultPhoto={!realContest && joinedRows.length > 0 ? participantProfile : creatorProfile}
                tone={segmentTone}
                activeContest={
                  currentContest
                    ? {
                        id: currentContest.id,
                        name: currentContest.name,
                        ...describeContestStatus(currentContest),
                        tone: segmentTone,
                        /* Participant-only mode → contest card in the
                           dropdown stays on the workspace (creator
                           manage page would be the wrong destination).
                           Real-creator mode → default contest route. */
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
                  : joinedRows.length > 0
                    ? 'Your contests and account, in one place.'
                    : 'Your account — and the home for any contest you run or join.'}
              </p>
            </div>

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
                      body={<>Naming is hard. Catchword — the agency NamingContest is built on top of — runs deeper, one-on-one sessions when the crowd doesn’t crack it.</>}
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
                  body={<>Naming is hard. Catchword — the agency NamingContest is built on top of — runs deeper, one-on-one sessions when the crowd doesn’t crack it.</>}
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
                        No purchases yet — your first contest launch will appear here.
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
                  <img
                    src={photo || (!realContest && joinedRows.length > 0 ? participantProfile : creatorProfile)}
                    alt=""
                    className={`v4-settings-account-photo-img ${photo ? 'is-custom' : 'is-default'}`}
                  />
                </span>
                <div className="v4-settings-account-meta">
                  <div className="v4-settings-account-name">
                    {name || 'Add your name'}
                  </div>
                  <div className="v4-settings-account-email">
                    {email || 'no email saved'}
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
                      <img
                        src={photo || (!realContest && joinedRows.length > 0 ? participantProfile : creatorProfile)}
                        alt=""
                        className={`v4-settings-photo-img ${photo ? 'is-custom' : 'is-default'}`}
                      />
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
                        >
                          <Camera weight="bold" size={14} />
                          Upload new photo
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
                        onChange={(e) => setName(e.target.value)}
                        placeholder="What should we call you?"
                      />
                    </label>

                    {/* Email is locked. It's the magic-link sign-in
                        identity, so changing it would orphan the
                        account. Shown read-only so the user knows what
                        we have on file. In the future this could open
                        a "change email" confirmation flow. */}
                    <label className="v4-settings-field">
                      <span className="v4-settings-field-label">Email</span>
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
                      <span className="v4-settings-field-hint">
                        Tied to your sign-in — can’t be changed here.
                      </span>
                    </label>

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

            {/* ── QUIET "START A CONTEST" NUDGE ──────────────────
                Bottom of the page, only for users who haven't
                launched anything yet. One soft line so participants
                aren't pestered — they can run their own naming
                contest whenever they're ready. */}
            {!realContest && (
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
            )}
          </div>
        </main>
      </div>
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
          {isConcluded ? 'Winner revealed — see who took it' : row.description}
        </div>
      </div>
      {actionUI}
    </div>
  );
}
