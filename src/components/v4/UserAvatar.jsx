// The app's chosen avatar system: boring-avatars "beam", seeded by a stable
// per-user value (the auth user id). Because it's deterministic, every user
// gets the same generated avatar every time — no storage needed — until they
// upload a real photo, which takes over.
import Avatar from 'boring-avatars';

// Warm, on-brand palette for the generated avatars.
const USER_AVATAR_COLORS = ['#F5B851', '#EC7357', '#4B68C3', '#57B894', '#E86AA6'];

export default function UserAvatar({ seed, photoUrl, size = 40, className = '' }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt=""
        className={className}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
    );
  }
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', width: size, height: size, borderRadius: '50%', overflow: 'hidden' }}
      aria-hidden="true"
    >
      <Avatar
        name={seed || 'namingcontest'}
        size={size}
        variant="beam"
        colors={USER_AVATAR_COLORS}
        square={false}
      />
    </span>
  );
}
