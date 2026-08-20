// V4 user avatar menu — top-right of every authenticated v4 surface.
// Click avatar → dropdown with Settings + Sign out. Uses segment tone
// for the avatar fill so it matches the rest of the page identity.

import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gear, SignOut, ArrowRight, CaretDown } from '@phosphor-icons/react';
import heroProfile1 from '../../assets/hero-profile-1.png';
import { readAllParticipations } from '../../utils/v4Participant';
import { supabase } from '../../lib/supabaseClient';
import { useLatestContest } from '../../lib/useLatestContest';
import UserAvatar from './UserAvatar';

export default function AvatarMenu({ email, name, photo, defaultPhoto, seed, tone, activeContest, userId }) {
  // When a page doesn't hand us a contest, resolve the signed-in creator's
  // latest one ourselves — so the "active contest" card shows on EVERY screen
  // (chat, tier pick, review…), not just the two that fetched it inline. A
  // page that passes activeContest (even null) keeps full control.
  const fetchedContest = useLatestContest(activeContest === undefined ? userId : null);
  const resolvedContest = activeContest !== undefined ? activeContest : fetchedContest;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  const fallbackTone = { bg: '#fadecc', fg: '#9c4818' };
  const t = tone || fallbackTone;
  // `photo` = real upload from the user; falls back to a per-page
  // default illustration (`defaultPhoto`), else heroProfile1. We track
  // whether we're showing a default so CSS can apply the face-zoom
  // transform without zooming real selfies.
  const isDefault = !photo;
  const photoSrc = photo || defaultPhoto || heroProfile1;

  // Identity reads "Anonymous" once the user has submitted anonymously to
  // a contest — mirrors the workspace account card.
  const submittedAnonymously = useMemo(() => {
    try {
      return readAllParticipations().some(
        (p) =>
          p.anonymous ||
          (p.submittedNames?.length > 0 &&
            p.submittedNames.every((n) => n.anonymous))
      );
    } catch {
      return false;
    }
  }, []);
  const displayName = submittedAnonymously ? 'Anonymous' : (name || 'You');

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleSignOut = async () => {
    // AWAIT the sign-out. It's a network round trip, and leaving without it
    // meant navigating home while the session was still live in context —
    // where the landing page, seeing a signed-in user, bounced you straight
    // back to the namespace. You'd land on an account page a moment after
    // asking to leave one.
    // Global sign-out revokes the refresh token server-side, which is the
    // right thing — but it's a network call, and if it fails the session is
    // still in local storage and you are still signed in. Fall back to a
    // LOCAL sign-out, which just drops the stored session and cannot fail for
    // network reasons. Being unable to leave is worse than a token that stays
    // valid until it expires.
    try {
      const { error } = await supabase.auth.signOut();
      if (error) await supabase.auth.signOut({ scope: 'local' });
    } catch {
      try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* nothing left to try */ }
    }
    // Then the guest blob, so no stale identity lingers behind.
    try { localStorage.removeItem('v4_contest_setup'); } catch {}
    // Same body-fade exit treatment as ExitLink/BrandLink, so signing
    // out has the gentle "leaving" feel instead of a jump-cut to the
    // marketing homepage.
    document.body.classList.add('is-exiting');
    window.setTimeout(() => {
      document.body.style.transition = 'none';
      document.body.classList.remove('is-exiting');
      navigate('/');
      window.requestAnimationFrame(() => {
        document.body.style.transition = '';
      });
    }, 180);
  };

  return (
    <div className="v4-avatar-menu" ref={wrapRef}>
      <button
        type="button"
        className={`v4-avatar-btn ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span className="v4-avatar-photo-wrap" aria-hidden="true">
          {/* Real photo wins; otherwise the generated avatar (seeded by the
              user id) — falling back to the legacy default image only for
              callers that don't pass a seed yet. */}
          {photo ? (
            <img src={photo} alt="" className="v4-avatar-photo is-custom" />
          ) : seed ? (
            <UserAvatar seed={seed} size={28} />
          ) : (
            <img src={photoSrc} alt="" className={`v4-avatar-photo ${isDefault ? 'is-default' : 'is-custom'}`} />
          )}
        </span>
        {/* Caret signals "this is a menu trigger, not just a photo".
            Rotates 180° when open for an extra clarity cue. */}
        <span className="v4-avatar-caret" aria-hidden="true">
          <CaretDown weight="bold" size={10} />
        </span>
      </button>

      {open && (
        <div className="v4-avatar-dropdown" role="menu">
          <div className="v4-avatar-dropdown-head">
            <div className="v4-avatar-dropdown-name">{displayName}</div>
            <div className="v4-avatar-dropdown-email">{email || 'no email saved'}</div>
          </div>

          {/* Active-contest card — uses the CONTEST'S own tone (not the
              user's segment tone), so it matches how that specific
              contest is colored throughout the rest of the app. */}
          {resolvedContest?.id && (() => {
            const ct = resolvedContest.tone || t;
            return (
            <>
              <div className="v4-avatar-dropdown-divider" aria-hidden="true"></div>
              <Link
                /* Pages can pass `to` on activeContest to override the
                   default route. Used by participant pages to send the
                   user to /status instead of the creator's manage page. */
                to={resolvedContest.to || `/v4/contest/${resolvedContest.id}`}
                state={resolvedContest.contest ? { contest: resolvedContest.contest } : undefined}
                className="v4-avatar-dropdown-contest"
                role="menuitem"
                onClick={() => setOpen(false)}
                style={{ background: ct.bg + '40' }}
              >
                <div className="v4-avatar-dropdown-contest-text">
                  <div className="v4-avatar-dropdown-contest-eyebrow" style={{ color: ct.fg }}>
                    <span className="v4-manage-live-dot" aria-hidden="true" style={{ background: ct.fg }}></span>
                    <span>{(resolvedContest.phase || 'LIVE').toUpperCase()}</span>
                    {resolvedContest.daysLeft != null && (
                      <>
                        <span className="v4-avatar-dropdown-contest-sep">·</span>
                        <span>
                          {resolvedContest.daysLeft === 0 ? 'Closes today'
                            : resolvedContest.daysLeft === 1 ? '1 day left'
                            : `${resolvedContest.daysLeft}d left`}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="v4-avatar-dropdown-contest-name" style={{ color: ct.fg }}>
                    {resolvedContest.name}
                  </div>
                </div>
                <ArrowRight weight="bold" size={14} className="v4-avatar-dropdown-contest-arrow" style={{ color: ct.fg }} />
              </Link>
            </>
            );
          })()}

          <div className="v4-avatar-dropdown-divider" aria-hidden="true"></div>
          <Link
            to="/v4/settings"
            className="v4-avatar-dropdown-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Gear weight="duotone" size={16} />
            <span>Namespace</span>
          </Link>
          <button
            type="button"
            className="v4-avatar-dropdown-item v4-avatar-dropdown-item-danger"
            role="menuitem"
            onClick={handleSignOut}
          >
            <SignOut weight="duotone" size={16} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
