// The creator's note to participants — the warm, personal lead of the brief.
// A soft panel in the segment's own tone, the host's avatar + name, and the
// message set in the display serif so it reads as a note, distinct from the
// question/answer rows below.
//
// Avatar follows the app's rule everywhere: the creator's uploaded photo if
// they have one, otherwise the deterministic boring-avatars "beam" generator
// (never a hardcoded illustration), via the shared UserAvatar component.

import UserAvatar from './UserAvatar';

export default function HostNote({ intro, name = 'the organizer', seed, photoUrl, tone }) {
  if (!intro || !intro.trim()) return null;
  const vars = tone ? { '--note-tint': tone.bg, '--note-accent': tone.fg } : undefined;
  return (
    <div className="v4-hostnote" style={vars}>
      <div className="v4-hostnote-by">
        <UserAvatar
          seed={seed || name}
          photoUrl={photoUrl}
          size={28}
          className="v4-hostnote-avatar"
        />
        <span className="v4-hostnote-name">A note from {name}</span>
      </div>
      <p className="v4-hostnote-text">{intro}</p>
    </div>
  );
}
