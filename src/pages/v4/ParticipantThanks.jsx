// V4 ParticipantThanks — confirmation after the participant submits
// their names. Shows the same 3-step progress strip the invitation
// page uses, but with step 2 (Voting) highlighted as the current /
// upcoming phase, complete with a ticking-clock animation and the
// "voting opens in N days" date.
//
// URL: /v4/contest/:id/thanks

import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, HouseLine, Trophy } from '@phosphor-icons/react';
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import heroProfile3 from '../../assets/hero-profile-3.png';
import { getMockContestById } from '../../data/v4/mockContests';
import { SegmentThemeBackdrop, getSegmentTone } from '../../data/v4/segmentTheme';
import { readSetup } from '../../utils/v4Brief';
import { readParticipation } from '../../utils/v4Participant';
import AvatarMenu from '../../components/v4/AvatarMenu';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';

// Pretty relative deadline string for the "voting opens in N days" line.
function relTime(days) {
  if (!Number.isFinite(days) || days < 0) return null;
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

export default function ParticipantThanks() {
  const { id: contestId } = useParams();
  const navigate = useNavigate();
  const contest = getMockContestById(contestId);
  const participation = readParticipation(contestId);
  const subId = contest?.subSegmentId;
  const tone = subId ? getSegmentTone(subId) : null;
  const submittedCount = participation?.submittedNames?.length || 0;
  const creatorName = contest?.creator?.name || 'the organizer';
  const submissionDays = contest?.settings?.submissionDays;
  const votingOpens = relTime(submissionDays);

  // Authenticated user — used by AvatarMenu in the nav.
  const setup = readSetup();
  const userEmail = setup.userEmail || '';
  const userName = setup.userName || (userEmail.split('@')[0] || 'You');
  const userPhoto = setup.userPhoto || null;

  // Logo scrolls the <main> back to the top instead of navigating
  // away — the user just submitted and shouldn't be bounced home.
  const scrollRef = useRef(null);

  return (
    <div className="v4 lp-v3">
      <div className="v4-screen">
        <SegmentThemeBackdrop subId={subId} />
        <main className="v4-review" role="main" ref={scrollRef}>
          <header className="v4-nav">
            <button
              type="button"
              className="v4-brand v4-brand-button"
              onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top"
            >
              <img src={namingContestLogo} alt="NamingContest" className="v4-logo" />
            </button>
            <div className="v4-progress" />
            <div className="v4-nav-right">
              <AvatarMenu
                email={userEmail}
                name={userName}
                photo={userPhoto}
                defaultPhoto={heroProfile3}
                tone={tone}
                activeContest={contest ? {
                  id: contest.id,
                  name: contest.workingName || contest.name,
                  phase: 'VOTING SOON',
                  tone,
                  to: `/v4/settings`,
                } : null}
              />
            </div>
          </header>

          <div className="v4-review-inner v4-pthanks-inner">
            <div
              className="v4-pthanks-icon"
              style={tone ? { background: tone.bg, color: tone.fg } : undefined}
            >
              <CheckCircle weight="duotone" size={42} />
            </div>
            <h1 className="v4-pthanks-title">Locked in. Thanks.</h1>
            <p className="v4-pthanks-sub">
              {submittedCount > 0 ? (
                <>
                  You submitted{' '}
                  <strong>
                    {submittedCount} {submittedCount === 1 ? 'name' : 'names'}
                  </strong>
                  {' '}for {creatorName}'s contest. Voting opens
                  {votingOpens ? ` ${votingOpens}` : ' soon'} — you'll
                  get an email when it's time.
                </>
              ) : (
                <>
                  You're signed up. Voting opens
                  {votingOpens ? ` ${votingOpens}` : ' soon'} — you'll
                  get an email when it's time.
                </>
              )}
            </p>

            {/* ── 3-step strip — same as the invitation page but with
                step 2 (Voting) highlighted as the active "next" phase
                and a ticking-clock animation drawing the eye. */}
            <ol className="v4-join-flow v4-pthanks-flow">
              <li className="v4-join-flow-step v4-pthanks-flow-step-done">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>Suggested ✓</strong>
                  <em>just now</em>
                </span>
              </li>
              <li className="v4-join-flow-step v4-pthanks-flow-step-active">
                <span className="v4-join-flow-dot v4-pthanks-flow-dot-pulse" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>
                    <Clock weight="duotone" size={14} className="v4-pthanks-clock-icon" />
                    {' '}Vote
                  </strong>
                  <em>{votingOpens ? `opens ${votingOpens}` : 'opens soon'}</em>
                </span>
              </li>
              <li className="v4-join-flow-step v4-pthanks-flow-step-upcoming">
                <span className="v4-join-flow-dot" aria-hidden="true" />
                <span className="v4-join-flow-label">
                  <strong>
                    <Trophy weight="duotone" size={14} />
                    {' '}Winner picked
                  </strong>
                  <em>shoutout if it's yours</em>
                </span>
              </li>
            </ol>

            <div className="v4-pthanks-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/v4/settings')}
              >
                <HouseLine weight="bold" size={14} />
                Go to my workspace <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
