// The app's chosen avatar system: boring-avatars "beam", seeded by a stable
// per-user value (the auth user id). Because it's deterministic, every user
// gets the same generated avatar every time — no storage needed — until they
// upload a real photo, which takes over.
import Avatar from 'boring-avatars';

// The app's brand pastel palette — same 5 colors every other boring-avatar
// in the app uses (segmentTheme's DEFAULT_PALETTE: blush, butter, mint, sky,
// periwinkle), so user avatars sit in the same visual family.
const USER_AVATAR_COLORS = ['#fadecc', '#fceebc', '#a6dcb3', '#c4dffb', '#b3c4f0'];

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
