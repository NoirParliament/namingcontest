import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Heart, UsersThree, Briefcase, X } from '@phosphor-icons/react';

const TONES = {
  blush:      { bg: '#fadecc', fg: '#9c4818' },
  periwinkle: { bg: '#c4cff5', fg: '#283b78' },
  mint:       { bg: '#bce5c8', fg: '#1f5430' },
};

const TIERS = [
  {
    id: 'personal',
    Icon: Heart,
    tone: TONES.blush,
    title: 'Personal',
    body: 'Babies, pets, holiday homes, the family Wi-Fi.',
    meta: 'Up to 15 voters · $9 / contest',
  },
  {
    id: 'group',
    Icon: UsersThree,
    tone: TONES.periwinkle,
    title: 'Group',
    body: 'Bands, podcasts, sports teams, gaming clans, civic groups.',
    meta: 'Up to 60 voters · $29 / contest',
  },
  {
    id: 'business',
    Icon: Briefcase,
    tone: TONES.mint,
    title: 'Business',
    body: 'Companies, products, rebrands, internal projects.',
    meta: 'Up to 240 voters · $89 / contest',
  },
];

export default function TierPickerModal({ open, onClose }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  // Esc dismisses (only when no selection in flight)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape' && !selected) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, selected, onClose]);

  // Lock scroll on body when open
  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  if (!open) return null;

  const handleSelect = (tier) => {
    if (selected) return;
    setSelected(tier);
    // Quick fade out, then navigate
    setTimeout(() => {
      navigate(`/v4/pick/${tier.id}`);
      onClose();
    }, 200);
  };

  return createPortal(
    <div
      className="v4-modal-backdrop"
      onClick={() => !selected && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Pick a contest type"
    >
      <div
        className="v4-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="v4-modal-close" onClick={onClose} aria-label="Close">
          <X weight="regular" size={18} />
        </button>
        <h2 className="v4-modal-title">What kind of contest?</h2>

        <div className="v4-modal-tiers">
          {TIERS.map((tier) => (
            <button
              key={tier.id}
              type="button"
              className="v4-tier-card"
              onClick={() => handleSelect(tier)}
              disabled={!!selected}
            >
              <span
                className="v4-tier-icon"
                style={{ background: tier.tone.bg, color: tier.tone.fg }}
                aria-hidden="true"
              >
                <tier.Icon weight="duotone" size={26} />
              </span>
              <div className="v4-tier-text">
                <div className="v4-tier-title">{tier.title}</div>
                <div className="v4-tier-body">{tier.body}</div>
                <div className="v4-tier-meta">{tier.meta}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}

export { TIERS, TONES };
