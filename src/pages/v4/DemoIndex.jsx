// V4 Demo Index — single source of truth for "what screens exist".
//
// URL: /v4/demo
//
// Lives alongside the app so it stays in lockstep with reality:
// every time we ship a new screen, we add a row here. No external
// doc to keep in sync, no stale snapshots. Clients open this page,
// click through, see everything in one place.
//
// Sections:
//   - Creator flow (current v5)
//   - Participant flow (current v5)
//   - Planned screens (to be designed)
//   - Quick actions (reset state, jump to common entry points)

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Trash, UsersThree, Megaphone, House, CheckSquare,
} from '@phosphor-icons/react';
import { joinContest, recordSubmission } from '../../utils/v4Participant';
import { writeSetup } from '../../utils/v4Brief';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

// Demo contest used as the :id parameter for routes that expect one.
const DEMO_CONTEST_ID = 'mock_ongoing_1';
const VOTING_DEMO_CONTEST_ID = 'mock_voting_demo';

const STATUS = {
  LIVE:    { label: 'Live',    color: '#1f5430', bg: '#bce5c8' },
  WIP:     { label: 'WIP',     color: '#8a6a14', bg: '#fceebc' },
  PLANNED: { label: 'Planned', color: '#283b78', bg: '#c4cff5' },
  LEGACY:  { label: 'Legacy',  color: '#5e5e58', bg: '#e5e5e2' },
};

// ── Section definitions ──────────────────────────────────────────
// Each screen = { title, path, status, description, notes? }
// To add a new screen: just push a row to the right array.

const CREATOR_SCREENS = [
  {
    title: 'Landing page',
    path: '/',
    status: 'LIVE',
    description: 'Public homepage. Hero animation, tier offerings, sign-in modal entry point.',
  },
  {
    title: 'Pick a tier',
    path: '/v4/pick',
    status: 'LIVE',
    description: 'First step of creator setup — choose Personal / Group / Business pricing.',
  },
  {
    title: 'Brief setup chat',
    path: '/v4/setup/brief',
    status: 'LIVE',
    description: 'Chat-style brief builder. Walks through sub-segment pick → working name → brief questions → shared settings.',
    notes: 'State persisted to v4_contest_setup. Articles + primers per sub-segment.',
  },
  {
    title: 'Review & launch',
    path: '/v4/setup/review',
    status: 'LIVE',
    description: 'Pre-launch summary of every brief + settings answer. Launch modal triggers fake-Stripe checkout.',
  },
  {
    title: 'Contest manage (post-launch)',
    path: `/v4/contest/${DEMO_CONTEST_ID}`,
    status: 'LIVE',
    description: 'Creator dashboard. Phase-aware journey, live results, pick-winner flow, winner hero card, PNG/PDF exports.',
  },
  {
    title: 'Workspace (creator mode)',
    path: '/v4/settings',
    status: 'LIVE',
    description: 'Account home. Running contests (with current contest card), past contests, billing, profile.',
    notes: 'Adapts automatically when in participant mode — see Participant section below.',
  },
];

const PARTICIPANT_SCREENS = [
  {
    title: 'Vote',
    path: `/v4/contest/${VOTING_DEMO_CONTEST_ID}/vote`,
    status: 'LIVE',
    description: 'Voting interface. Same chat-style scaffold as the submission chat (staged reveal, brief recap, user-bubble replies). Multi-select up to votingLimit favourites with search + sort and sticky bottom submit.',
    notes: 'Use the "Open voting-stage demo" quick action above to seed state and land on the workspace first.',
  },
  {
    title: 'Post-vote thanks',
    path: `/v4/contest/${VOTING_DEMO_CONTEST_ID}/vote-thanks`,
    status: 'LIVE',
    description: 'Confirmation after voting. Big live d/h/m/s countdown to the winner announcement, 3-step strip with done steps muted and step 3 (Winner picked) active with ticking clock.',
  },
  {
    title: 'Join / invitation',
    path: `/v4/join/${DEMO_CONTEST_ID}`,
    status: 'LIVE',
    description: 'The page you hit from an invite link. Segment-tinted backdrop, prize card, magic-link entry. Resets participation state on each visit (fresh demo every time).',
    notes: 'Best entry point for testing the participant flow from scratch.',
  },
  {
    title: 'Submission chat',
    path: `/v4/contest/${DEMO_CONTEST_ID}/submit`,
    status: 'LIVE',
    description: 'Chat-style submission flow. Staged reveal (welcome → "show brief?" → brief → "ready?" → first prompt), per-turn ack + prompt phrases, composite name + why-it-fits cards, one-shot submission.',
    notes: 'Auto-redirects to /thanks if you already submitted.',
  },
  {
    title: 'Post-submit thanks',
    path: `/v4/contest/${DEMO_CONTEST_ID}/thanks`,
    status: 'LIVE',
    description: 'Confirmation page with 3-step lifecycle strip, pulsing "voting opens" dot, ticking clock animation.',
  },
  {
    title: 'Status / countdown dashboard',
    path: `/v4/contest/${DEMO_CONTEST_ID}/status`,
    status: 'LIVE',
    description: 'Persistent participant dashboard with live d/h/m/s countdown to voting opens, greyed vote CTA that activates when the clock hits zero.',
    notes: 'Mostly bypassed in normal flows — workspace shows the same data inline now.',
  },
  {
    title: 'Workspace (participant mode)',
    path: '/v4/settings',
    status: 'LIVE',
    description: 'Same /v4/settings URL as the creator workspace — auto-adapts when you have joined contests but no launched one. Joined-contest row shows live countdown + greyed Vote button inline.',
  },
];

const PLANNED_SCREENS = [
  {
    title: 'Post-vote confirmation',
    path: `/v4/contest/${DEMO_CONTEST_ID}/vote-thanks`,
    status: 'PLANNED',
    description: '"Thanks for voting" + countdown to winner announcement. Could extend the existing /thanks page or live separately.',
  },
  {
    title: 'Winner reveal (participant)',
    path: `/v4/contest/${DEMO_CONTEST_ID}/winner`,
    status: 'PLANNED',
    description: 'What participants see after the creator picks a winner. Special celebration if they submitted the winning name.',
  },
  {
    title: 'Invite-by-email modal (creator)',
    path: '(creator manage page → Invite)',
    status: 'PLANNED',
    description: 'Lets the creator share the join URL or send magic links to a list of emails. May live as a modal inside ContestManage rather than its own route.',
  },
  {
    title: 'Footer + dropdown additions',
    path: '(all pages)',
    status: 'PLANNED',
    description: 'Help center, contact us, privacy policy, terms, cookie policy — accessible from a slim footer + the avatar dropdown.',
    notes: 'Discussed earlier, deferred. Resurface before launch.',
  },
];

const LEGACY_SCREENS = [
  { title: 'Wireframe dashboard',     path: '/wireframe',                      status: 'LEGACY' },
  { title: 'Segment select',          path: '/select',                          status: 'LEGACY' },
  { title: 'Auth (legacy)',           path: '/auth',                            status: 'LEGACY' },
  { title: 'Brief builder (legacy)',  path: '/brief/team/sports',               status: 'LEGACY' },
  { title: 'Upload names (legacy)',   path: '/upload-names',                    status: 'LEGACY' },
  { title: 'Contest live (legacy)',   path: `/contest/${DEMO_CONTEST_ID}`,      status: 'LEGACY' },
  { title: 'Voting (legacy)',         path: `/vote/${DEMO_CONTEST_ID}`,         status: 'LEGACY' },
  { title: 'Results (legacy)',        path: `/results/${DEMO_CONTEST_ID}`,      status: 'LEGACY' },
  { title: 'Dashboard (legacy)',      path: '/dashboard',                       status: 'LEGACY' },
  { title: 'Documentation (legacy)',  path: '/docs',                            status: 'LEGACY' },
];

// ── Page ─────────────────────────────────────────────────────────
export default function DemoIndex() {
  const navigate = useNavigate();
  const [resetFlash, setResetFlash] = useState(false);

  // Wipe every v4 localStorage key so the demo runs from a clean
  // slate. Useful between client walkthroughs.
  const handleReset = () => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k.startsWith('v4_') || k === 'selectedGroup' || k === 'selectedSubSegment') {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      setResetFlash(true);
      setTimeout(() => setResetFlash(false), 1800);
    } catch {}
  };

  // Open the workspace in the VOTING-stage demo. Seeds:
  //   - identity on setup blob (so AvatarMenu reads a name)
  //   - participation for mock_voting_demo with 3 submitted names
  //     (since voting requires the user to have already submitted)
  //   - clears creator-side state so the workspace shows
  //     participant-only mode (joined section only)
  const handleEnterVotingDemo = () => {
    const email = 'demo@participant.com';
    const displayName = 'demo';
    writeSetup({
      userEmail: email,
      userName: displayName,
      contestId: null,
      workingName: null,
      subSegmentId: null,
      group: null,
      launchedAt: null,
    });
    joinContest(VOTING_DEMO_CONTEST_ID, { name: displayName, email });
    [
      { text: 'Iron Boots FC',     whyItFits: 'Sounds like Saturday-night football in the mud — and a long bus home.' },
      { text: 'Brookside Rovers',  whyItFits: 'Local geography wins community loyalty. Easy chant: "ROVERS!"' },
      { text: 'North Park United', whyItFits: 'Direct, two-syllable, chantable. Names the pitch.' },
    ].forEach((n) => recordSubmission(VOTING_DEMO_CONTEST_ID, n));
    navigate('/v4/settings');
  };

  return (
    <div className="v4 lp-v3">
      <div className="v4-screen">
        <main className="v4-review" role="main">
          <header className="v4-nav">
            <BrandLink />
            <div className="v4-progress">
              <span className="v4-step-label">Demo index</span>
            </div>
            <div className="v4-nav-right" />
          </header>

          <div className="v4-review-inner v4-demo-inner">
            <div className="v4-demo-head">
              <h1 className="v4-demo-title">NamingContest.com — Screen Index</h1>
              <p className="v4-demo-sub">
                Every screen in the demo, grouped by lifecycle stage.
                Click any link to open. This page updates whenever a new
                screen ships — it lives in the app, not a separate doc.
              </p>
            </div>

            {/* Quick actions row */}
            <section className="v4-demo-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                title="Wipe all v4_* localStorage keys so the next test starts clean"
              >
                <Trash weight="bold" size={14} />
                {resetFlash ? 'Reset ✓' : 'Reset all demo state'}
              </button>
              <Link to="/" className="btn btn-secondary">
                <House weight="bold" size={14} />
                Landing page
              </Link>
              <Link to="/v4/pick" className="btn btn-secondary">
                <Megaphone weight="bold" size={14} />
                Start a contest (creator)
              </Link>
              <Link to={`/v4/join/${DEMO_CONTEST_ID}`} className="btn btn-secondary">
                <UsersThree weight="bold" size={14} />
                Get invited (participant)
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleEnterVotingDemo}
                title="Pre-seeds participation in the voting-stage demo contest and opens the workspace"
              >
                <CheckSquare weight="bold" size={14} />
                Open voting-stage demo
              </button>
            </section>

            {/* Flow walk-throughs (top-level guidance) */}
            <section className="v4-demo-flows">
              <h2 className="v4-demo-section-title">Demo walk-throughs</h2>
              <div className="v4-demo-flow">
                <strong>Creator flow:</strong>{' '}
                <Link to="/">Landing</Link> →{' '}
                <Link to="/v4/pick">Pick</Link> →{' '}
                <Link to="/v4/setup/brief">Brief</Link> →{' '}
                <Link to="/v4/setup/review">Review</Link> →{' '}
                <Link to={`/v4/contest/${DEMO_CONTEST_ID}`}>Manage</Link> →{' '}
                <Link to="/v4/settings">Workspace</Link>
              </div>
              <div className="v4-demo-flow">
                <strong>Participant flow (fresh):</strong>{' '}
                <Link to={`/v4/join/${DEMO_CONTEST_ID}`}>Join</Link> →{' '}
                <Link to={`/v4/contest/${DEMO_CONTEST_ID}/submit`}>Submit chat</Link> →{' '}
                <Link to={`/v4/contest/${DEMO_CONTEST_ID}/thanks`}>Thanks</Link> →{' '}
                <Link to="/v4/settings">Workspace</Link>
              </div>
              <div className="v4-demo-flow">
                <strong>Participant flow (returning, post-submit):</strong>{' '}
                <Link to="/">Landing</Link> → "Sign in as participant" →{' '}
                <Link to="/v4/settings">Workspace with countdown</Link>
              </div>
            </section>

            <ScreenSection title="Creator side" screens={CREATOR_SCREENS} navigate={navigate} />
            <ScreenSection title="Participant side" screens={PARTICIPANT_SCREENS} navigate={navigate} />
            <ScreenSection title="Planned (to be designed)" screens={PLANNED_SCREENS} navigate={navigate} />
            <ScreenSection
              title="Legacy v0–v3 routes (still in router)"
              screens={LEGACY_SCREENS}
              navigate={navigate}
              collapsed
            />

            <footer className="v4-demo-foot">
              <p>
                Source of truth: <code>src/pages/v4/DemoIndex.jsx</code>.
                To add a new screen, append a row to the relevant array
                at the top of that file.
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Screen section ───────────────────────────────────────────────
function ScreenSection({ title, screens, navigate, collapsed = false }) {
  const [open, setOpen] = useState(!collapsed);
  return (
    <section className="v4-demo-section">
      <button
        type="button"
        className="v4-demo-section-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h2 className="v4-demo-section-title">{title}</h2>
        <span className="v4-demo-section-count">
          {screens.length} {screens.length === 1 ? 'screen' : 'screens'}
        </span>
        <span className="v4-demo-section-toggle">{open ? '–' : '+'}</span>
      </button>

      {open && (
        <ul className="v4-demo-list">
          {screens.map((s) => (
            <li key={s.title + s.path} className="v4-demo-row">
              <div className="v4-demo-row-head">
                <span
                  className="v4-demo-status"
                  style={{
                    background: STATUS[s.status].bg,
                    color: STATUS[s.status].color,
                  }}
                >
                  {STATUS[s.status].label}
                </span>
                <span className="v4-demo-row-title">{s.title}</span>
                {s.status !== 'PLANNED' && s.path.startsWith('/') && (
                  <button
                    type="button"
                    className="v4-demo-row-open"
                    onClick={() => navigate(s.path)}
                  >
                    Open <ArrowRight weight="bold" size={12} />
                  </button>
                )}
              </div>
              <code className="v4-demo-row-path">{s.path}</code>
              {s.description && (
                <p className="v4-demo-row-desc">{s.description}</p>
              )}
              {s.notes && (
                <p className="v4-demo-row-notes">↳ {s.notes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
