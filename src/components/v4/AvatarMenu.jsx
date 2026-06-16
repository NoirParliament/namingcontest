// V4 user avatar menu — top-right of every authenticated v4 surface.
// Click avatar → dropdown with Settings + Sign out. Uses segment tone
// for the avatar fill so it matches the rest of the page identity.

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gear, SignOut, ArrowRight, CaretDown } from '@phosphor-icons/react';
import heroProfile1 from '../../assets/hero-profile-1.png';

export default function AvatarMenu({ email, name, photo, defaultPhoto, tone, activeContest }) {
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

  const handleSignOut = () => {
    // Prototype: clears the v4 setup blob. Real auth call lands here later.
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
          <img
            src={photoSrc}
            alt=""
            className={`v4-avatar-photo ${isDefault ? 'is-default' : 'is-custom'}`}
          />
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
            <div className="v4-avatar-dropdown-name">{name || 'You'}</div>
            <div className="v4-avatar-dropdown-email">{email || 'no email saved'}</div>
          </div>

          {/* Active-contest card — uses the CONTEST'S own tone (not the
              user's segment tone), so it matches how that specific
              contest is colored throughout the rest of the app. */}
          {activeContest?.id && (() => {
            const ct = activeContest.tone || t;
            return (
            <>
              <div className="v4-avatar-dropdown-divider" aria-hidden="true"></div>
              <Link
                /* Pages can pass `to` on activeContest to override the
                   default route. Used by participant pages to send the
                   user to /status instead of the creator's manage page. */
                to={activeContest.to || `/v4/contest/${activeContest.id}`}
                className="v4-avatar-dropdown-contest"
                role="menuitem"
                onClick={() => setOpen(false)}
                style={{ background: ct.bg + '40' }}
              >
                <div className="v4-avatar-dropdown-contest-text">
                  <div className="v4-avatar-dropdown-contest-eyebrow">
                    <span className="v4-manage-live-dot" aria-hidden="true"></span>
                    <span>{(activeContest.phase || 'LIVE').toUpperCase()}</span>
                    {activeContest.daysLeft != null && (
                      <>
                        <span className="v4-avatar-dropdown-contest-sep">·</span>
                        <span>
                          {activeContest.daysLeft === 0 ? 'Closes today'
                            : activeContest.daysLeft === 1 ? '1 day left'
                            : `${activeContest.daysLeft}d left`}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="v4-avatar-dropdown-contest-name">
                    {activeContest.name}
                  </div>
                </div>
                <ArrowRight weight="bold" size={14} className="v4-avatar-dropdown-contest-arrow" />
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
