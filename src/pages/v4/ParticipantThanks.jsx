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

import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { Clock, LockSimple } from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import participantProfile from '../../assets/participant-profile.png';
import AvatarMenu from '../../components/v4/AvatarMenu';
import { getMockContestById } from '../../data/v4/mockContests';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { useProfile } from '../../lib/useProfile';
import { getSegmentTone, SEGMENT_THEME, SegmentThemeBackdrop } from '../../data/v4/segmentTheme';
import { readSetup } from '../../utils/v4Brief';
import { readParticipation } from '../../utils/v4Participant';
import useCountdown, { pad2 } from '../../utils/useCountdown';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

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
  const { user } = useAuth();
  // Real signed-in identity for the account menu (cached → no placeholder
  // flash). Without it this page showed the generated avatar even when the
  // participant had uploaded a photo.
  const [profile] = useProfile(user);

  const mockContest = getMockContestById(contestId);
  const [dbContest, setDbContest] = useState(null);
  const [mySubs, setMySubs] = useState([]);
  const [dbLoading, setDbLoading] = useState(!mockContest);
  useEffect(() => {
    if (mockContest || !user?.id) return;
    let active = true;
    Promise.all([
      supabase.from('contests').select('*').eq('id', contestId).single(),
      supabase.from('submissions').select('text').eq('contest_id', contestId).eq('user_id', user.id),
    ]).then(([c, s]) => {
      if (!active) return;
      setDbContest(c.data || null);
      setMySubs((s.data || []).map((r) => ({ text: r.text })));
      setDbLoading(false);
      // Cache this contest's segment so Namespace paints its color instantly.
      if (c.data?.sub_segment_id) {
        try { localStorage.setItem('v4_last_sub', c.data.sub_segment_id); } catch { /* ignore */ }
      }
    });
    return () => { active = false; };
  }, [contestId, mockContest, user?.id]);
  const isRealContest = !mockContest && !!dbContest;
  const contest = mockContest || (dbContest ? {
    id: dbContest.id,
    workingName: dbContest.working_name,
    subSegmentId: dbContest.sub_segment_id,
    settings: dbContest.settings || {},
    launchedAt: dbContest.launched_at ? new Date(dbContest.launched_at).getTime() : null,
    creator: {},
  } : null);
  const participation = mockContest
    ? readParticipation(contestId)
    : (isRealContest ? { submittedNames: mySubs } : null);
  const subId = contest?.subSegmentId;
  const tone = subId ? getSegmentTone(subId) : null;
  const segmentBg = SEGMENT_THEME[subId]?.blobs?.[0] || tone?.bg || '#a6dcb3';

  const submitted = participation?.submittedNames || [];
  const submittedCount = submitted.length;
  const creatorName = contest?.creator?.name || 'the organizer';
  const contestName = contest?.workingName || contest?.name || 'the contest';
  const submissionDays = contest?.settings?.submissionDays;

  // Authed user — AvatarMenu pulls these from the same source as
  // every other authed v4 surface.
  const setup = readSetup();
  const userEmail = setup.userEmail || '';
  const userName = setup.userName || (userEmail.split('@')[0] || 'You');
  const userPhoto = setup.userPhoto || null;

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

  // Card overflow handling — show first N + a "+X more" pill so the
  // page height stays constant regardless of how many names were
  // submitted. Click expands inline. Closed by default.
  const VISIBLE_LIMIT = 3;
  const [expanded, setExpanded] = useState(false);
  const visibleSubmitted = expanded ? submitted : submitted.slice(0, VISIBLE_LIMIT);
  const overflowCount = Math.max(0, submitted.length - VISIBLE_LIMIT);

  if (!mockContest && dbLoading) {
    return (
      <div className="v4 lp-v3"><div className="v4-screen"><main className="v4-review" role="main">
        <div className="v4-review-inner" style={{ textAlign: 'center', paddingTop: 120 }}>
          <p className="v4-review-subtitle">Loading…</p>
        </div>
      </main></div></div>
    );
  }
  if (!contest) return <Navigate to="/v4/settings" replace />;
  if (!participation) return <Navigate to={`/v4/join/${contestId}`} replace />;

  return (
    <div className="v4 lp-v3">
      <div
        className="v4-screen v4-join-screen"
        style={{ '--join-bg': segmentBg, '--join-fg': tone?.fg || '#0a3b1f' }}
      >
        {/* Same backdrop as every chat stage — see JoinContest. */}
        <SegmentThemeBackdrop subId={subId} minimal />

        <main className="v4-review" role="main" ref={scrollRef}>
          <header className="v4-nav v4-join-nav">
            <BrandLink />
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
              <AvatarMenu
                email={user?.email || userEmail}
                name={profile?.display_name || userName}
                photo={profile?.avatar_url || (isRealContest ? null : participantProfile)}
                seed={user?.id}
                tone={tone}
                activeContest={{
                  id: contest.id,
                  name: contestName,
                  phase: 'VOTING SOON',
                  tone,
                  to: '/v4/settings',
                }}
              />
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
                We saved your {submittedCount === 1 ? 'suggestion' : 'suggestions'};
                you’ll get an email the moment voting opens.
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
                  {visibleSubmitted.map((n, i) => (
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
                {overflowCount > 0 && (
                  <button
                    type="button"
                    className="v4-pthanks-overflow"
                    onClick={() => setExpanded((v) => !v)}
                  >
                    {expanded
                      ? 'Show fewer'
                      : `+ ${overflowCount} more ${overflowCount === 1 ? 'name' : 'names'}`}
                  </button>
                )}
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
                {c.isReady ? (
                  <>
                    <Clock weight="bold" size={14} className="v4-pthanks-cta-icon" />
                    Vote now <span className="arrow">→</span>
                  </>
                ) : c.unknown ? (
                  <>
                    <LockSimple weight="fill" size={14} className="v4-pthanks-cta-icon" />
                    Vote <span className="v4-pthanks-cta-eta">· opens soon</span>
                  </>
                ) : (
                  <>
                    <LockSimple weight="fill" size={14} className="v4-pthanks-cta-icon" />
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
                  <em>Just now</em>
                </span>
              </li>
              <li className="v4-join-flow-step is-current">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Come back to vote</strong>
                  <em>
                    {c.unknown ? 'Opens soon'
                      : c.isReady ? 'Voting is open'
                      : `Opens ${voteOpensDateStr}`}
                  </em>
                </span>
              </li>
              <li className="v4-join-flow-step is-upcoming">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>See who won</strong>
                  <em>Shoutout if it’s yours</em>
                </span>
              </li>
            </ol>
          </footer>
        </main>
      </div>
    </div>
  );
}
