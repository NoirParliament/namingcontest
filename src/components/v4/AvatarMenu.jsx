// V4 user avatar menu — top-right of every authenticated v4 surface.
// Click avatar → dropdown with Settings + Sign out. Uses segment tone
// for the avatar fill so it matches the rest of the page identity.

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gear, SignOut, ArrowRight } from '@phosphor-icons/react';
import heroProfile1 from '../../assets/hero-profile-1.png';

export default function AvatarMenu({ email, name, photo, tone, activeContest }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  const fallbackTone = { bg: '#fadecc', fg: '#9c4818' };
  const t = tone || fallbackTone;
  const photoSrc = photo || heroProfile1;

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
    navigate('/');
  };

  return (
    <div className="v4-avatar-menu" ref={wrapRef}>
      <button
        type="button"
        className="v4-avatar-btn"
        onClick={() => setOpen((v) => !v)}
        style={{ background: t.bg, color: t.fg }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <img
          src={photoSrc}
          alt=""
          className={`v4-avatar-photo ${photo ? 'is-custom' : 'is-default'}`}
        />
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
                to={`/v4/contest/${activeContest.id}`}
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
            <span>My workspace</span>
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
