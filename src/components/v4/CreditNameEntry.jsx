// Name + avatar entry for a participant choosing to be credited. Shared by the
// submission chat and the voting page so "credit me" captures identity the
// same way in both. Mirrors the creator identity step: a generated beam avatar
// until they upload a real photo. Participants are always signed in (they join
// via magic link), so the upload can write straight to their profile.
import { useState, useRef } from 'react';
import { UploadSimple } from '@phosphor-icons/react';
import UserAvatar from './UserAvatar';
import { uploadUserFile } from '../../lib/uploads';
import { writeProfileCache } from '../../lib/useProfile';
import { supabase } from '../../lib/supabaseClient';

export default function CreditNameEntry({
  firstName, lastName, onFirstChange, onLastChange, onConfirm, confirmLabel,
  user, seed, photoUrl, onPhotoChange,
}) {
  const [photo, setPhoto] = useState(photoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  // Stable placeholder-avatar seed for guests (no user id, no explicit seed).
  // Seeding on the typed name reshuffles the avatar on every keystroke, so we
  // mint one seed per mount and keep it steady while they type.
  const [fallbackSeed] = useState(() => 'you-' + Math.random().toString(36).slice(2, 10));

  const canConfirm = firstName.trim().length > 0;
  const submitOnEnter = (e) => { if (e.key === 'Enter' && canConfirm) onConfirm(); };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!user) { setError('Sign in to add a photo.'); return; }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadUserFile({ file, folder: 'avatar' });
      setPhoto(url);
      onPhotoChange?.(url);
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
      writeProfileCache(user.id, { avatar_url: url });
    } catch (err) {
      setError(err?.message || 'Upload failed. Try a smaller image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="v4-credit">
      <div className="v4-credit-identity">
        <span className="v4-credit-avatar">
          <UserAvatar seed={seed || user?.id || fallbackSeed} photoUrl={photo} size={52} />
        </span>
        <button
          type="button"
          className="v4-credit-upload"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <UploadSimple weight="bold" size={13} />
          {uploading ? 'Uploading…' : photo ? 'Change photo' : 'Add a photo'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
      </div>

      <div className="v4-credit-name">
        <input
          type="text"
          className="v4-settings-input v4-credit-name-input"
          value={firstName}
          onChange={(e) => onFirstChange(e.target.value)}
          onKeyDown={submitOnEnter}
          placeholder="First name"
          aria-label="First name"
          autoFocus
        />
        <input
          type="text"
          className="v4-settings-input v4-credit-name-input"
          value={lastName}
          onChange={(e) => onLastChange(e.target.value)}
          onKeyDown={submitOnEnter}
          placeholder="Last name"
          aria-label="Last name"
        />
        <button
          type="button"
          className="v4-chip v4-credit-name-confirm"
          onClick={onConfirm}
          disabled={!canConfirm}
        >
          {confirmLabel}
        </button>
      </div>
      {error && <div className="v4-credit-error">{error}</div>}
    </div>
  );
}
