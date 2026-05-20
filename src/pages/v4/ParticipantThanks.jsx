// V4 ParticipantThanks — confirmation after the participant submits.
//
// URL: /v4/contest/:id/thanks
//
// Receipt + waiting room. Same shell as the join page (segment color
// wash, white blobs, footer timeline). The body shows the user's
// actual submitted names back as a numbered receipt slab. The "what's
// next" countdown lives inside the footer timeline's current step
// (where it naturally belongs), not as a separate floating element.
//
// Deliberately NO primary CTA button — the user is waiting; there's
// nothing actionable until voting opens. They can leave via the nav
// logo if they want out.

import { useRef } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { Clock } from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import { getMockContestById } from '../../data/v4/mockContests';
import { getSegmentTone, SEGMENT_THEME } from '../../data/v4/segmentTheme';
import { readParticipation } from '../../utils/v4Participant';
import useCountdown, { pad2 } from '../../utils/useCountdown';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

// Compact nav-pill copy.
function shortCountdown(c) {
  if (!c || c.unknown) return 'Voting opens soon';
  if (c.isReady) return 'Voting is open';
  if (c.d > 0) return `Voting opens in ${c.d}d ${pad2(c.h)}h`;
  return `Voting opens in ${pad2(c.h)}:${pad2(c.m)}:${pad2(c.s)}`;
}

// Compact "in 2d 14h" ETA for the disabled CTA button.
// Calmer than the precise d hh:mm:ss in the nav pill — this surface
// doesn't need second-by-second ticking. Shows the largest two units
// that read clearly.
function ctaEta(c) {
  if (!c || c.unknown || c.isReady) return null;
  if (c.d > 0) return `in ${c.d}d ${c.h}h`;
  if (c.h > 0) return `in ${c.h}h ${c.m}m`;
  return `in ${c.m}m`;
}

export default function ParticipantThanks() {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const contest = getMockContestById(contestId);
  const participation = readParticipation(contestId);
  const subId = contest?.subSegmentId;
  const tone = subId ? getSegmentTone(subId) : null;
  const segmentBg = SEGMENT_THEME[subId]?.blobs?.[0] || tone?.bg || '#a6dcb3';

  const submitted = participation?.submittedNames || [];
  const submittedCount = submitted.length;
  const creatorName = contest?.creator?.name || 'the organizer';
  const contestName = contest?.workingName || contest?.name || 'the contest';
  const submissionDays = contest?.settings?.submissionDays;

  const day = 86400000;
  const voteOpensAt =
    Number.isFinite(contest?.launchedAt) && Number.isFinite(submissionDays)
      ? contest.launchedAt + submissionDays * day
      : null;
  const c = useCountdown(voteOpensAt);
  const voteOpensDateStr = voteOpensAt
    ? new Date(voteOpensAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric',
      })
    : 'soon';

  const scrollRef = useRef(null);

  if (!contest) return <Navigate to="/v4/settings" replace />;
  if (!participation) return <Navigate to={`/v4/join/${contestId}`} replace />;

  return (
    <div className="v4 lp-v3">
      <div
        className="v4-screen v4-join-screen"
        style={{ '--join-bg': segmentBg, '--join-fg': tone?.fg || '#0a3b1f' }}
      >
        <span className="v4-blob v4-join-blob v4-join-blob-1" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-2" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-3" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-4" aria-hidden="true" />
        <span className="v4-blob v4-join-blob v4-join-blob-5" aria-hidden="true" />

        {/* No drifting-voter animation here — that's the /join + /vote
            crowd vibe. The submission thanks moment is personal and
            quiet: you just dropped your ideas in the box. Animations
            live on the receipt cards themselves (card-land stagger +
            idea-bubble rise — see .v4-pthanks-card / ::before / ::after
            keyframes in v4.css). */}

        <main className="v4-review" role="main" ref={scrollRef}>
          <header className="v4-nav v4-join-nav">
            <Link to="/" className="v4-brand">
              <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
            </Link>
            <div className="v4-progress v4-join-nav-inviter">
              <span className="v4-join-inviter-invites">Submitted to</span>
              <strong className="v4-join-inviter-name-inline">
                {creatorName}
              </strong>
              <span className="v4-join-inviter-role-inline">
                ({contestName})
              </span>
            </div>
            <div className="v4-nav-right">
              <span className="v4-join-nav-deadline">
                <Clock weight="duotone" size={14} />
                {shortCountdown(c)}
              </span>
            </div>
          </header>

          <div className="v4-review-inner v4-pthanks-inner">
            {/* ── HERO — matches the join page hero shape exactly:
                2-word Inter caps eyebrow + Fraunces italic contest
                name + Inter sub. The three pages (join / thanks /
                vote-thanks) share this hero structure; only the
                eyebrow verb changes. */}
            <section className="v4-pthanks-hero">
              <div className="v4-pthanks-eyebrow">
                {contestName}
              </div>
              <h1 className="v4-pthanks-title">
                {submittedCount === 1 ? 'Name locked in.' : 'Names locked in.'}
              </h1>
              <p className="v4-pthanks-sub">
                We saved your {submittedCount === 1 ? 'suggestion' : 'suggestions'} —
                you'll get an email the moment voting opens.
              </p>
            </section>

            {/* ── Cards — mini ticket-stubs matching the join page's
                .v4-join-prize. Segment-tinted band with rank number,
                perforated edge, name + why on the body. */}
            {submittedCount > 0 && (
              <section
                className="v4-pthanks-receipt"
                aria-label="Names you submitted"
              >
                <ul className="v4-pthanks-card-list">
                  {submitted.map((n, i) => (
                    <li key={n.id} className="v4-pthanks-card">
                      <div className="v4-pthanks-card-band" aria-hidden="true">
                        <span className="v4-pthanks-card-band-num">
                          {i + 1}
                        </span>
                      </div>
                      <div className="v4-pthanks-card-body">
                        <div className="v4-pthanks-card-name">{n.text}</div>
                        {n.whyItFits && (
                          <div className="v4-pthanks-card-why">
                            {n.whyItFits}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── Anticipation CTA — disabled until voting opens.
                Sits after the cards' confirmation, showing the user
                the next step + how long until it's available.
                Activates and routes to /vote when ready. */}
            <div className="v4-pthanks-cta">
              {/* aria-disabled (not the HTML disabled attr) so hover still
                  fires — the click is no-op'd in onClick instead. Lets the
                  user feel the button as a button: it lights up under the
                  cursor and tells them "almost — time is ticking" rather
                  than reading as a broken/dead element. */}
              <button
                type="button"
                className="btn btn-primary btn-lg v4-pthanks-cta-btn"
                aria-disabled={!c.isReady}
                onClick={() => {
                  if (!c.isReady) return;
                  navigate(`/v4/contest/${contestId}/vote`);
                }}
                title={
                  c.isReady ? 'Cast your vote' : 'Voting opens soon'
                }
              >
                <Clock weight="bold" size={14} className="v4-pthanks-cta-icon" />
                {c.isReady ? (
                  <>Vote now <span className="arrow">→</span></>
                ) : c.unknown ? (
                  <>Vote <span className="v4-pthanks-cta-eta">· opens soon</span></>
                ) : (
                  <>
                    Vote{' '}
                    <span className="v4-pthanks-cta-eta">
                      · {ctaEta(c)}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Footer timeline — countdown lives INSIDE the current
              step ("Come back to vote"), as a ticking monospace line. */}
          <footer className="v4-join-foot">
            <ol className="v4-join-flow">
              <li className="v4-join-flow-step is-done">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Suggested ✓</strong>
                  <em>just now</em>
                </span>
              </li>
              <li className="v4-join-flow-step is-current">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Come back to vote</strong>
                  <em>
                    {c.unknown ? 'opens soon'
                      : c.isReady ? 'voting is open'
                      : `opens ${voteOpensDateStr}`}
                  </em>
                </span>
              </li>
              <li className="v4-join-flow-step is-upcoming">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>See who won</strong>
                  <em>shoutout if it's yours</em>
                </span>
              </li>
            </ol>
          </footer>
        </main>
      </div>
    </div>
  );
}
