// V4 Settings page — single page with two sections (Account + Subscription).
// Reads identity + plan info from localStorage v4_contest_setup blob.
// All "save" / "cancel plan" actions are mock for now; wire to real
// backend (Supabase) and Stripe customer portal later.

import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X, EnvelopeSimple, User, CreditCard, Receipt, ArrowSquareOut,
  Heart, UsersThree, Briefcase, Camera, Info, Trash, Plus,
  ArrowRight, ListBullets, Trophy,
} from '@phosphor-icons/react';
// Heart/UsersThree/Briefcase still used by TIER_INFO below for billing rows.
import heroProfile1 from '../../assets/hero-profile-1.png';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import { readSetup, writeSetup } from '../../utils/v4Brief';
import { SegmentThemeBackdrop, getSegmentTone } from '../../data/v4/segmentTheme';
import AvatarMenu from '../../components/v4/AvatarMenu';
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
import { MOCK_CONTESTS } from '../../data/v4/mockContests';
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
  // subId follows whichever contest is showing as the colored "current"
  // card — the user's real one if they have it, the mock sports one
  // otherwise. This keeps the SegmentThemeBackdrop + accent colors in
  // sync with the contest the user is looking at.
  const subId = setup.subSegmentId || MOCK_ONGOING.subSegmentId;
  const segmentTone = getSegmentTone(subId);
  const tierKey = setup.group || MOCK_ONGOING.tierKey;

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
    writeSetup({ userEmail: email.trim(), userName: name.trim() });
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
    <div className="v4">
      <div className="v4-screen">
        <SegmentThemeBackdrop subId={subId} />

        <main className="v4-review" role="main">
          {/* Glass nav — matches ContestManage pattern */}
          <header className="v4-nav">
            <Link to="/" className="v4-brand">
              <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
            </Link>
            <div className="v4-progress">
              <span className="v4-step-label">Workspace</span>
            </div>
            <div className="v4-nav-right">
              <AvatarMenu
                email={email}
                name={name}
                photo={photo}
                tone={segmentTone}
                activeContest={
                  currentContest
                    ? {
                        id: currentContest.id,
                        name: currentContest.name,
                        ...describeContestStatus(currentContest),
                        tone: segmentTone,
                      }
                    : null
                }
              />
            </div>
          </header>

          <div className="v4-review-inner">
            {/* ── Page heading ─────────────────────────────────── */}
            <div className="v4-settings-head">
              <h1 className="v4-settings-title">My workspace</h1>
              <p className="v4-settings-subtitle">
                Your contests, billing, and account in one place.
              </p>
            </div>

            {/* ── Contests section (drafts + live + closed) ─────── */}
            <section className="v4-settings-section">
              <header className="v4-settings-section-head">
                <ListBullets weight="duotone" size={18} />
                <h2>Contests</h2>
              </header>

              {/* CURRENT CONTEST — the only fully-tinted card. Hierarchy
                  of one: this gets the user's full attention because it
                  needs action right now. */}
              {(() => {
                const status = describeContestStatus(currentContest);
                // Prefer a contest-specific icon (e.g. SoccerBall for the
                // sports mock) over the generic tier icon (UsersThree).
                const TierIcon = currentContest.Icon || currentContest.tierInfo.Icon;
                // segmentTone always matches the displayed contest now
                // (subId follows real → fallback to mock).
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
                        <span className="v4-manage-live-dot" aria-hidden="true"></span>
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
                        {currentContest.name}
                      </div>
                      <div className="v4-settings-current-meta">
                        {currentContest.tierInfo.label} contest · paid ${currentContest.tierInfo.price}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="v4-settings-btn v4-settings-btn-primary"
                      onClick={() => navigate(`/v4/contest/${currentContest.id}`)}
                    >
                      Manage
                      <ArrowRight weight="bold" size={14} />
                    </button>
                  </div>
                );
              })()}


              {/* PAST CLOSED contests — quiet history rows. Visually
                  subdued so they don't compete with the colored ongoing
                  card above: grey stripe (no tier color), muted text,
                  reduced opacity. Still accessible, just whispered. */}
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
                        <span>Closed {closed.closedAgo} · won "{closed.winner}"</span>
                      </div>
                      <div className="v4-settings-contest-row-name">
                        {closed.name}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="v4-settings-btn v4-settings-btn-link"
                      onClick={() => window.alert('Results page lands when we build it.')}
                    >
                      View results
                    </button>
                  </div>
                );
              })}

              {/* Quiet "start another" action — bottom of contests section */}
              <div className="v4-settings-newcontest-quiet">
                <button
                  type="button"
                  className="v4-settings-btn v4-settings-btn-secondary"
                  onClick={handleStartNewContest}
                >
                  <Plus weight="bold" size={14} />
                  Start another contest
                </button>
                <span className="v4-settings-newcontest-quiet-meta">
                  One-time fee · Personal $9 · Group $29 · Business $89
                </span>
              </div>
            </section>

            {/* ── Billing section (compact, collapsed by default) ── */}
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
                    <button type="button" className="v4-settings-btn v4-settings-btn-link">
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
                                <span className="v4-settings-billing-sub"> · "{inv.contestName}"</span>
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
                    src={photo || heroProfile1}
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
                        src={photo || heroProfile1}
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
                          className="v4-settings-btn v4-settings-btn-secondary"
                          onClick={() => fileRef.current?.click()}
                        >
                          <Camera weight="bold" size={14} />
                          Upload new photo
                        </button>
                        {photo && (
                          <button
                            type="button"
                            className="v4-settings-btn v4-settings-btn-link"
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

                    <label className="v4-settings-field">
                      <span className="v4-settings-field-label">Email</span>
                      <div className="v4-settings-input-with-icon">
                        <EnvelopeSimple weight="bold" size={14} className="v4-settings-input-icon" />
                        <input
                          type="email"
                          className="v4-settings-input v4-settings-input-padded"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>
                      <span className="v4-settings-field-hint">
                        Where contest updates and receipts are sent.
                      </span>
                    </label>

                    <div className="v4-settings-form-foot">
                      <button
                        type="submit"
                        className="v4-settings-btn v4-settings-btn-primary"
                      >
                        {savedFlash ? 'Saved!' : 'Save changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
