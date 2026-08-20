// The reveal's opening beat — who needed a name, and what they asked for in
// their own words — so the crowned name lands as the answer to a real
// question. A cold visitor on the share page otherwise meets a word in big
// type with no story; a participant gets closure on the ask they answered.
//
// Host identity goes through hostIdentity(): an anonymous host shows
// "the organizer" with the contest-seeded generated avatar, never a real
// name or photo. The quote collapses cleanly when the creator never wrote
// an intro, leaving just the host line.

import UserAvatar from './UserAvatar';
import { hostIdentity } from '../../utils/v4Anonymity';

export default function WinnerStory({ contest, contestName, intro }) {
  const host = hostIdentity(contest);
  const quote = typeof intro === 'string' ? intro.trim() : '';
  return (
    <section className="v4-pwinner-story" aria-label="How this contest started">
      <div className="v4-pwinner-story-host">
        <span className="v4-pwinner-story-avatar" aria-hidden="true">
          <UserAvatar seed={host.seed} photoUrl={host.photoUrl} size={36} />
        </span>
        <span className="v4-pwinner-story-line">
          <strong>{host.name}</strong> needed a name for{' '}
          <strong>{contestName}</strong>
        </span>
      </div>
      {quote && <blockquote className="v4-pwinner-story-quote">{quote}</blockquote>}
    </section>
  );
}
