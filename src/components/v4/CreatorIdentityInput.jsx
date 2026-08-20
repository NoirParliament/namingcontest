// Opening step of the brief: the creator names themselves AND the contest in
// one warm step. Mirrors the participant "credit me" flow — same avatar system
// (generated beam avatar until they upload a real photo), same first/last name
// fields — so both sides of the product feel like one flow.
//
// What it captures (into the setup blob, so it survives to launch):
//   userName        "First Last"     → also updates the account name if signed in
//   userAvatarUrl   uploaded photo    → also written to the profile if signed in
//   userAnonymous   true/false        → when true, participants see "the organizer"
// The step's own committed answer stays the CONTEST name string, so the rest of
// the setup flow (persist, edit-in-place, review) is unchanged.

import { useState, useRef } from 'react';
import { ArrowRight, UploadSimple, EyeSlash } from '@phosphor-icons/react';
import { readSetup, writeSetup } from '../../utils/v4Brief';
import { getSegmentTone } from '../../data/v4/segmentTheme';
import { useAuth } from '../../lib/AuthContext';
import { useProfile, writeProfileCache } from '../../lib/useProfile';
import { uploadUserFile } from '../../lib/uploads';
import { supabase } from '../../lib/supabaseClient';
import UserAvatar from './UserAvatar';
import { fileToAvatarDataUrl } from '../../lib/avatarData';

export default function CreatorIdentityInput({ question, onSubmit, currentAnswer }) {
  const { user } = useAuth();
  const [profile] = useProfile(user);
  const setup = readSetup();
  const subId = setup.subSegmentId;
  const tone = subId ? getSegmentTone(subId) : null;

  const seededName = setup.userName || profile?.display_name || '';
  const [first, setFirst] = useState(seededName.split(' ')[0] || '');
  const [last, setLast] = useState(seededName.split(' ').slice(1).join(' ') || '');
  const [contestName, setContestName] = useState(currentAnswer || setup.workingName || '');
  const [anonymous, setAnonymous] = useState(!!setup.userAnonymous);
  const [photo, setPhoto] = useState(setup.userAvatarUrl || setup.userAvatarData || profile?.avatar_url || null);
  // Stable seed for the generated placeholder avatar. Seeding on the typed
  // name reshuffles the avatar on every keystroke; instead we mint one seed,
  // persist it, and reuse it in the reply bubble so preview and bubble match.
  const [avatarSeed] = useState(() => {
    const s = readSetup();
    if (s.userAvatarSeed) return s.userAvatarSeed;
    const seed = 'id-' + Math.random().toString(36).slice(2, 10);
    writeSetup({ userAvatarSeed: seed });
    return seed;
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileRef = useRef(null);

  const fullName = `${first.trim()} ${last.trim()}`.trim();
  const canContinue = contestName.trim().length > 0;
  const toneVars = tone ? { '--id-tint': tone.bg, '--id-accent': tone.fg } : undefined;

  const pickPhoto = () => fileRef.current?.click();
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      if (user) {
        // Signed in: straight to storage + their profile, like Settings.
        const url = await uploadUserFile({ file, folder: 'avatar' });
        setPhoto(url);
        writeSetup({ userAvatarUrl: url, userAvatarData: null });
        await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
        writeProfileCache(user.id, { avatar_url: url });
      } else {
        // Guest: no session to upload with yet. Keep a compact data URL in the
        // blob; launch-contest uploads it to their new account server-side.
        const dataUrl = await fileToAvatarDataUrl(file);
        setPhoto(dataUrl);
        writeSetup({ userAvatarData: dataUrl, userAvatarUrl: null });
      }
    } catch (err) {
      setUploadError(err?.message || 'That image did not work. Try another.');
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = async () => {
    if (!canContinue) return;
    // Persist identity to the blob (applies at launch for guests).
    writeSetup({ userName: fullName || null, userAnonymous: anonymous });
    // Signed-in creators get their account name updated right away.
    if (user && fullName) {
      try {
        await supabase.from('profiles').update({ display_name: fullName }).eq('id', user.id);
        writeProfileCache(user.id, { display_name: fullName });
      } catch { /* non-blocking — the blob still carries it to launch */ }
    }
    onSubmit(contestName.trim());
  };

  const onEnter = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleContinue(); } };

  return (
    <div className="v4-creator-id" style={toneVars}>
      {/* Identity: avatar + name, mirroring the participant credit step */}
      <div className="v4-creator-id-you">
        <div className="v4-creator-id-avatar-col">
          <span className="v4-creator-id-avatar">
            <UserAvatar seed={user?.id || avatarSeed} photoUrl={photo} size={64} />
          </span>
          <button
            type="button"
            className="v4-creator-id-upload"
            onClick={pickPhoto}
            disabled={uploading}
          >
            <UploadSimple weight="bold" size={13} />
            {uploading ? 'Uploading…' : photo ? 'Change photo' : 'Add photo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            style={{ display: 'none' }}
          />
        </div>
        <div className="v4-creator-id-fields">
          <label className="v4-creator-id-label">Your name</label>
          <div className="v4-creator-id-names">
            <input
              type="text"
              className="v4-settings-input"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
              onKeyDown={onEnter}
              placeholder="First name"
              aria-label="First name"
            />
            <input
              type="text"
              className="v4-settings-input"
              value={last}
              onChange={(e) => setLast(e.target.value)}
              onKeyDown={onEnter}
              placeholder="Last name"
              aria-label="Last name"
            />
          </div>
          <button
            type="button"
            className={`v4-creator-id-anon${anonymous ? ' is-on' : ''}`}
            onClick={() => setAnonymous((v) => !v)}
            aria-pressed={anonymous}
          >
            <EyeSlash weight={anonymous ? 'fill' : 'regular'} size={15} />
            <span>
              {anonymous
                ? 'Anonymous: participants will see “the organizer”'
                : 'Stay anonymous to participants'}
            </span>
          </button>
          {uploadError && <div className="v4-creator-id-error">{uploadError}</div>}
        </div>
      </div>

      {/* Contest name */}
      <div className="v4-creator-id-contest">
        <label className="v4-creator-id-label">Contest name</label>
        <input
          type="text"
          className="v4-settings-input"
          value={contestName}
          onChange={(e) => setContestName(e.target.value)}
          onKeyDown={onEnter}
          placeholder={question.placeholder}
          maxLength={question.maxLength || 60}
          aria-label="Contest name"
        />
      </div>

      <div className="v4-creator-id-actions">
        <button
          type="button"
          className="v4-multichips-submit"
          onClick={handleContinue}
          disabled={!canContinue}
        >
          Continue <ArrowRight weight="bold" size={14} />
        </button>
      </div>
    </div>
  );
}
