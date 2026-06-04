// V4 Platform Map — the single clickable source of truth for every
// screen + flow in the product.
//
// URL: /v4/map  (old /v4/demo redirects here)
//
// Each numbered step seeds the exact localStorage state it needs
// (creator setup / participant state / per-contest stage override,
// with a profile picture + logged-in identity) and then opens the
// target screen in a NEW TAB. Because localStorage is shared across
// same-origin tabs and the seed write is synchronous, the new tab
// reads the right state — so opening the in-app menu from any step
// lands on the matching workspace stage.
//
// Sections: Creator flow · Participant flow · Additional pages ·
// Simulations (every group × segment, creator + participant).

import { Link } from 'react-router-dom';
import {
  ArrowSquareOut, House, Megaphone, UsersThree, ArrowRight, ShareNetwork,
} from '@phosphor-icons/react';
import { writeSetup } from '../../utils/v4Brief';
import { joinContest, recordSubmission, recordVotes, clearParticipation } from '../../utils/v4Participant';
import { getMockContestById } from '../../data/v4/mockContests';
import { SIM_CONTESTS, SIM_GROUPS } from '../../data/v4/simContests';
import { getSegmentTone } from '../../data/v4/segmentTheme';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import heroProfile4 from '../../assets/hero-profile-4.png';
import heroProfile5 from '../../assets/hero-profile-5.png';
import creatorProfile from '../../assets/creator-profile.png';
import participantProfile from '../../assets/participant-profile.png';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

const DAY = 24 * 60 * 60 * 1000;

// Football demo contest ids (the canonical, fully-built example).
const SUBMIT_ID = 'mock_ongoing_1';
const VOTE_ID = 'mock_voting_demo';

// Seeded identities (logged-in, with profile pictures).
// Creator persona is a WOMAN (matches creator-profile.png); participant is a
// MAN (matches participant-profile.png) — names must agree with the pictures.
const CREATOR = { userEmail: 'maya@brookside.fc', userName: 'Maya', userPhoto: creatorProfile };
const PARTICIPANT = { userEmail: 'sam@brookside.fc', userName: 'Sam', userPhoto: participantProfile };

// ── localStorage helpers ─────────────────────────────────────────
function wipeAll() {
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
}

function setStageOverride(contestId, launchedAt) {
  try {
    localStorage.setItem(
      'v4_contest_override_' + contestId,
      JSON.stringify({ launchedAt })
    );
  } catch {}
}

// Seed a logged-out, fresh visitor (public landing / sign-in screens).
function seedFresh() {
  wipeAll();
}

// Seed a logged-in creator with no launched contest yet (setup steps).
function seedCreatorIdentity() {
  wipeAll();
  writeSetup({ ...CREATOR, contestId: null, workingName: null, subSegmentId: null, group: null, launchedAt: null });
}

// Seed a logged-in creator whose contest is `contestId` (post-launch
// steps). Pulls meta from the contest so the workspace + manage page
// show the right running contest.
function seedCreatorContest(contestId) {
  wipeAll();
  const c = getMockContestById(contestId);
  writeSetup({
    ...CREATOR,
    contestId,
    workingName: c?.workingName || c?.name,
    subSegmentId: c?.subSegmentId,
    group: c?.group,
    launchedAt: c?.launchedAt || Date.now() - 4 * DAY,
    brief: c?.brief,
    settings: c?.settings,
  });
}

// Seed a logged-in participant on `contestId` at a given lifecycle
// point: 'joined' (no submissions), 'submitted' (3 names), or 'voted'
// (3 names + votes). The "own" submissions are pulled from THIS
// contest's shortlist so they match the segment (not football names in
// a baby-name contest). Clears creator-side contest fields so the
// workspace shows participant mode.
function seedParticipant(contestId, point) {
  wipeAll();
  writeSetup({ ...PARTICIPANT, contestId: null, workingName: null, subSegmentId: null, group: null, launchedAt: null });
  joinContest(contestId, { name: PARTICIPANT.userName, email: PARTICIPANT.userEmail });
  const c = getMockContestById(contestId);
  const ownSubs = (c?.allSubmissions || []).slice(0, 3);
  if (point === 'submitted' || point === 'voted') {
    ownSubs.forEach((n) =>
      recordSubmission(contestId, { text: n.text, whyItFits: n.whyItFits })
    );
  }
  if (point === 'voted') {
    const ids = (c?.allSubmissions || []).slice(0, 3).map((s) => s.id);
    recordVotes(contestId, ids);
  }
}

// Seed a participant who has voted AND crown a winner, so the winner
// reveal page renders in its celebratory "your name won" state. The
// winnerSubId is written onto the per-contest override (which
// getMockContestById merges) and is set to the participant's own first
// submission so the page shows the win.
function seedParticipantWinner(contestId, winnerSubId) {
  seedParticipant(contestId, 'voted');
  const c = getMockContestById(contestId);
  const totalDays =
    (c?.settings?.submissionDays || 7) + (c?.settings?.votingDays || 3) + 1;
  try {
    localStorage.setItem(
      'v4_contest_override_' + contestId,
      JSON.stringify({ launchedAt: Date.now() - totalDays * DAY, winnerSubId })
    );
  } catch {}
}

// Seed a participant whose own name did NOT win, but who voted for the
// winning name — so the reveal renders its "someone else won" state with
// the "you voted for it" note. Submits two non-winning names; votes for
// three including the winner.
function seedParticipantWinnerOther(contestId, winnerSubId) {
  wipeAll();
  writeSetup({ ...PARTICIPANT, contestId: null, workingName: null, subSegmentId: null, group: null, launchedAt: null });
  joinContest(contestId, { name: PARTICIPANT.userName, email: PARTICIPANT.userEmail });
  const c = getMockContestById(contestId);
  const others = (c?.allSubmissions || []).filter((s) => s.id !== winnerSubId);
  others.slice(0, 2).forEach((n) =>
    recordSubmission(contestId, { text: n.text, whyItFits: n.whyItFits })
  );
  recordVotes(contestId, [winnerSubId, ...others.slice(0, 2).map((s) => s.id)]);
  const totalDays =
    (c?.settings?.submissionDays || 7) + (c?.settings?.votingDays || 3) + 1;
  try {
    localStorage.setItem(
      'v4_contest_override_' + contestId,
      JSON.stringify({ launchedAt: Date.now() - totalDays * DAY, winnerSubId })
    );
  } catch {}
}

// Seed a logged-OUT random visitor landing on the post-contest share
// link. No participation row, no auth — they're a stranger who got
// the URL after the contest closed. Sets the winner override so the
// reveal page resolves with a crowned name.
function seedNeutralReveal(contestId, winnerSubId) {
  wipeAll();
  const c = getMockContestById(contestId);
  const totalDays =
    (c?.settings?.submissionDays || 7) + (c?.settings?.votingDays || 3) + 1;
  try {
    localStorage.setItem(
      'v4_contest_override_' + contestId,
      JSON.stringify({ launchedAt: Date.now() - totalDays * DAY, winnerSubId })
    );
  } catch {}
}

// Seed a logged-in creator dropped straight into the brief chat for a
// specific segment (group + sub-segment pre-picked from the contest).
// BriefChat hydrates the pick into history and opens at the working-name
// question, so the chat shows "in action" instead of an empty picker.
function seedCreatorBriefChat(contestId) {
  wipeAll();
  const c = getMockContestById(contestId);
  writeSetup({
    ...CREATOR,
    contestId: null,
    group: c?.group || 'business',
    subSegmentId: c?.subSegmentId || 'b1',
    subSegmentTitle: c?.subSegmentTitle || 'A company or startup',
    workingName: null,
    brief: {},
    settings: {},
    launchedAt: null,
  });
}

// Open a URL in a new tab AFTER running the seed (synchronous, so the
// new tab reads the freshly-written state).
function openSeeded(seed, url) {
  try { seed?.(); } catch {}
  window.open(url, '_blank', 'noopener');
}

// ── Flow step definitions ────────────────────────────────────────
const CREATOR_STEPS = [
  { n: 1,  title: 'Landing page', desc: 'Public homepage with the hero animation, tier offerings, and sign-in entry point.', seed: seedFresh, url: '/' },
  { n: 2,  title: 'Sign in / register', desc: 'Passwordless magic-link modal — the creator enters an email to start.', seed: seedFresh, url: '/?signin=creator' },
  { n: 3,  title: 'Pick a tier', desc: 'Choose Personal, Group, or Business pricing for the contest.', seed: seedCreatorIdentity, url: '/v4/pick' },
  { n: 4,  title: 'Brief setup chat', desc: 'Chat-style builder, opened mid-flow on a company example: working name, then the segment-specific brief questions.', seed: () => seedCreatorBriefChat('sim_b1'), url: '/v4/setup/brief' },
  { n: 5,  title: 'Review & launch', desc: 'Summary of every answer, then the fake-Stripe checkout modal to go live.', seed: () => seedCreatorContest(SUBMIT_ID), url: '/v4/setup/review?launch=1', payHint: 'Test card 4242 4242 4242 4242 · any future expiry · any 3-digit CVC' },
  { n: 6,  title: 'Manage — submission stage', desc: 'Creator dashboard while names roll in, with live results and the brief recap.', seed: () => seedCreatorContest(SUBMIT_ID), url: `/v4/contest/${SUBMIT_ID}?phase=submission` },
  { n: 7,  title: 'Manage — voting stage', desc: 'Same dashboard once submissions close and votes start accumulating.', seed: () => seedCreatorContest(VOTE_ID), url: `/v4/contest/${VOTE_ID}?phase=voting` },
  { n: 8,  title: 'Pick the winner', desc: 'Creator crowns a name from the leaderboard in the pick-winner modal.', seed: () => seedCreatorContest(VOTE_ID), url: `/v4/contest/${VOTE_ID}?phase=winner&pick=1` },
  { n: 9,  title: 'Winner screen', desc: 'The winner hero card with share + PNG/PDF export once a name is crowned.', seed: () => seedCreatorContest(VOTE_ID), url: `/v4/contest/${VOTE_ID}?phase=winner&winner=vsub_2` },
  { n: 10, title: 'Workspace (creator)', desc: 'Account home — running and past contests, billing, and profile.', seed: () => seedCreatorContest(VOTE_ID), url: '/v4/settings' },
];

const PARTICIPANT_STEPS = [
  { n: 1,  title: 'Join from an invite link (new)', desc: 'First-time participant: someone shares the contest link, you land on the segment-themed invitation page, see the prize, and enter your email to join.', seed: seedFresh, url: `/v4/join/${SUBMIT_ID}` },
  { n: 2,  title: 'Sign in from the homepage (returning)', desc: 'Already registered from a past contest? Sign in from the homepage with a magic link — no invite needed — and your joined contests are waiting.', seed: seedFresh, url: '/?signin=participant' },
  { n: 3,  title: 'Submission chat', desc: 'Chat-style flow to propose names, each with its meaning and why it fits.', seed: () => seedParticipant(SUBMIT_ID, 'joined'), url: `/v4/contest/${SUBMIT_ID}/submit` },
  { n: 4,  title: 'Post-submit thanks', desc: 'Receipt of your names plus a countdown to when voting opens.', seed: () => seedParticipant(SUBMIT_ID, 'submitted'), url: `/v4/contest/${SUBMIT_ID}/thanks` },
  { n: 5,  title: 'Workspace (pre-vote)', desc: 'Your joined contest with a greyed Vote button + countdown until voting opens.', seed: () => seedParticipant(SUBMIT_ID, 'submitted'), url: '/v4/settings' },
  { n: 6,  title: 'Vote', desc: 'Pick your favourites from the shortlist with search, sort, and a sticky submit bar.', seed: () => seedParticipant(VOTE_ID, 'submitted'), url: `/v4/contest/${VOTE_ID}/vote` },
  { n: 7,  title: 'Post-vote thanks', desc: 'Receipt of your votes plus a countdown to the winner announcement.', seed: () => seedParticipant(VOTE_ID, 'voted'), url: `/v4/contest/${VOTE_ID}/vote-thanks` },
  { n: 8,  title: 'Winner reveal — your name won', desc: 'The celebratory state: your own submission took it. Confetti, a YOU WON badge, and the prize.', seed: () => seedParticipantWinner(VOTE_ID, 'vsub_1'), url: `/v4/contest/${VOTE_ID}/winner` },
  { n: 9,  title: 'Winner reveal — a teammate won', desc: "The same reveal when someone else's name took it — with a note here because you voted for the winner.", seed: () => seedParticipantWinnerOther(VOTE_ID, 'vsub_5'), url: `/v4/contest/${VOTE_ID}/winner` },
  { n: 10, title: 'Workspace (post-vote)', desc: '"Voted ✓" status with a countdown to the winner announcement.', seed: () => seedParticipant(VOTE_ID, 'voted'), url: '/v4/settings' },
];

// Neutral flow — a single page (for now): a stranger who clicked the
// share link after the contest is already over. They didn't submit,
// didn't vote, may not even be logged in. The public reveal page
// hosts the result + a single Share button + an "Exit" out.
const NEUTRAL_STEPS = [
  { n: 1, title: 'Public winner reveal', desc: "What anyone sees if they click the share link after the contest closed — winning name, who suggested it, vote count, and a Share button that copies the page URL. No auth required. Exit returns to the homepage.", seed: () => seedNeutralReveal(VOTE_ID, 'vsub_2'), url: `/v4/contest/${VOTE_ID}/reveal` },
];

const ADDITIONAL = {
  legal: [
    { title: 'Privacy policy', desc: 'What data we collect, why, sub-processors, and your rights.', url: '/privacy' },
    { title: 'Terms of service', desc: 'The contract: fees, user content, name-legality disclaimers, liability.', url: '/terms' },
    { title: 'Cookie policy', desc: 'Strictly-necessary storage only; no consent banner needed.', url: '/cookies' },
  ],
  resources: [
    { title: 'Frequently asked', desc: 'Common questions for creators and participants.', url: '/#faq' },
    { title: 'Contact us', desc: 'Get in touch with the team.', url: '/contact' },
    { title: 'Catchword Branding', desc: 'The naming agency behind NamingContest.', url: 'https://catchwordbranding.com/' },
  ],
  errors: [
    { title: '404 — Not found', desc: 'Shown for any unknown URL; on-brand with a way back.', url: '/this-page-does-not-exist' },
    { title: 'Error state', desc: 'Generic "something went wrong" page for unexpected failures.', url: '/error' },
  ],
};

// ── Page ─────────────────────────────────────────────────────────
// Jump-nav targets — section ids on the page.
const MAP_SECTIONS = [
  { id: 'map-creator', label: 'Creator flow' },
  { id: 'map-participant', label: 'Participant flow' },
  { id: 'map-neutral', label: 'Neutral flow' },
  { id: 'map-additional', label: 'Additional pages' },
  { id: 'map-simulations', label: 'Simulations' },
];

export default function PlatformMap() {
  const jumpTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="v4 lp-v3">
      <div className="v4-screen">
        <main className="v4-review" role="main">
          <header className="v4-nav">
            <BrandLink />
            <div className="v4-progress">
              <span className="v4-step-label">Platform map</span>
            </div>
            <div className="v4-nav-right" />
          </header>

          <div className="v4-review-inner v4-map-inner">
            <div className="v4-map-head">
              <h1 className="v4-map-title">NamingContest — Platform Map</h1>
              <p className="v4-map-sub">
                Every screen and flow in one place. Click any step to open
                it in a new tab, pre-loaded with the right state (logged in,
                with the Sunday football club example). The in-app menu on
                each screen lands on the matching workspace stage.
              </p>
              {/* Jump-nav — quick links to each section. */}
              <nav className="v4-map-nav" aria-label="Jump to section">
                {MAP_SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="v4-map-nav-link"
                    onClick={() => jumpTo(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
            </div>

            <FlowSection
              id="map-creator"
              icon={<Megaphone weight="duotone" size={18} />}
              title="Creator flow"
              subtitle="From landing to crowning the winning name."
              steps={CREATOR_STEPS}
            />

            <FlowSection
              id="map-participant"
              icon={<UsersThree weight="duotone" size={18} />}
              title="Participant flow"
              subtitle="Two ways in — an invite link (new) or a returning sign-in — through to seeing who won."
              steps={PARTICIPANT_STEPS}
            />

            <FlowSection
              id="map-neutral"
              icon={<ShareNetwork weight="duotone" size={18} />}
              title="Neutral flow"
              subtitle="What a random visitor sees when they click the share link after the contest is already over — no auth, no participation, just the result."
              steps={NEUTRAL_STEPS}
            />

            {/* Additional pages */}
            <section id="map-additional" className="v4-map-section">
              <div className="v4-map-section-head">
                <House weight="duotone" size={18} />
                <div>
                  <h2 className="v4-map-section-title">Additional pages</h2>
                  <p className="v4-map-section-sub">Legal, resources, and error states.</p>
                </div>
              </div>
              <div className="v4-map-extra-grid">
                <ExtraGroup label="Legal" items={ADDITIONAL.legal} />
                <ExtraGroup label="Resources" items={ADDITIONAL.resources} />
                <ExtraGroup label="Error states" items={ADDITIONAL.errors} />
              </div>
            </section>

            {/* Simulations */}
            <section id="map-simulations" className="v4-map-section">
              <div className="v4-map-section-head">
                <ArrowsIcon />
                <div>
                  <h2 className="v4-map-section-title">Simulations — every group &amp; segment</h2>
                  <p className="v4-map-section-sub">
                    End-to-end, themed to each segment&rsquo;s colours. Open the
                    creator dashboard or the participant invitation for any one.
                  </p>
                </div>
              </div>
              {SIM_GROUPS.map((grp) => (
                <div key={grp.key} className="v4-map-sim-group">
                  <h3 className="v4-map-sim-group-title">{grp.label}</h3>
                  <ul className="v4-map-sim-list">
                    {grp.segments.map((id) => {
                      const c = SIM_CONTESTS[id];
                      if (!c) return null;
                      const tone = getSegmentTone(c.subSegmentId);
                      const SegIcon = c.Icon;
                      return (
                        <li key={id} className="v4-map-sim-row">
                          <span
                            className="v4-map-sim-icon"
                            style={{ background: tone.bg, color: tone.fg }}
                            aria-hidden="true"
                          >
                            {SegIcon && <SegIcon weight="duotone" size={18} />}
                          </span>
                          <div className="v4-map-sim-text">
                            <span className="v4-map-sim-name">{c.subSegmentTitle}</span>
                            <span className="v4-map-sim-eg">e.g. &ldquo;{c.workingName}&rdquo;</span>
                          </div>
                          <div className="v4-map-sim-actions">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => openSeeded(
                                () => seedCreatorBriefChat(id),
                                '/v4/setup/brief'
                              )}
                            >
                              Creator <ArrowSquareOut weight="bold" size={12} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => openSeeded(() => {
                                seedParticipant(id, 'joined');
                                setStageOverride(id, Date.now() - 1 * DAY);
                              }, `/v4/join/${id}`)}
                            >
                              Participant <ArrowSquareOut weight="bold" size={12} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>

            <footer className="v4-map-foot">
              <p>
                Source of truth: <code>src/pages/v4/PlatformMap.jsx</code> +{' '}
                <code>src/data/v4/simContests.js</code>. To add a screen,
                append a step; to add a segment, add a contest.
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Flow section (numbered steps) ────────────────────────────────
function FlowSection({ id, icon, title, subtitle, steps }) {
  return (
    <section id={id} className="v4-map-section">
      <div className="v4-map-section-head">
        {icon}
        <div>
          <h2 className="v4-map-section-title">{title}</h2>
          <p className="v4-map-section-sub">{subtitle}</p>
        </div>
      </div>
      <ol className="v4-map-steps">
        {steps.map((s) => (
          <li key={s.n} className="v4-map-step">
            <span className="v4-map-step-num">{s.n}</span>
            <div className="v4-map-step-body">
              <div className="v4-map-step-title">
                {s.title}
                {s.soon && <span className="v4-map-soon">Coming soon</span>}
              </div>
              <p className="v4-map-step-desc">{s.desc}</p>
              {s.payHint && (
                <p className="v4-map-step-pay">
                  <span className="v4-map-step-pay-tag">Payment</span>
                  {s.payHint}
                </p>
              )}
            </div>
            {s.url ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm v4-map-step-open"
                onClick={() => openSeeded(s.seed, s.url)}
              >
                Open <ArrowSquareOut weight="bold" size={12} />
              </button>
            ) : (
              <span className="v4-map-step-disabled">Soon</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

// ── Additional-pages group ───────────────────────────────────────
function ExtraGroup({ label, items }) {
  return (
    <div className="v4-map-extra">
      <h3 className="v4-map-extra-title">{label}</h3>
      <ul className="v4-map-extra-list">
        {items.map((it) => (
          <li key={it.title} className="v4-map-extra-row">
            <div className="v4-map-extra-text">
              <span className="v4-map-extra-name">
                {it.title}
                {it.soon && <span className="v4-map-soon">Coming soon</span>}
              </span>
              <span className="v4-map-extra-desc">{it.desc}</span>
            </div>
            {it.url && (
              <button
                type="button"
                className="btn btn-link"
                onClick={() => window.open(it.url, '_blank', 'noopener')}
              >
                Open <ArrowSquareOut weight="bold" size={12} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Small inline icon (avoids importing another phosphor glyph just for
// the simulations header).
function ArrowsIcon() {
  return <ArrowRight weight="duotone" size={18} />;
}
