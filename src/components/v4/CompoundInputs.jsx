// Compound inputs for shared settings — these are chat-friendly versions
// of the legacy multi-field components. Each handles its own internal
// state and emits a single object answer when complete.

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, CheckCircle, UploadSimple, Image as ImageIcon } from '@phosphor-icons/react';

// ── toggleTextarea — yes/no, if yes show textarea ───────────────────
// Used for: customRequirements
export function ToggleTextareaInput({ question, onSubmit, currentAnswer }) {
  // Editing an existing note opens straight into the field with the text
  // already there, instead of asking Yes/No again and losing what was written.
  const existing = currentAnswer && typeof currentAnswer === 'object' && currentAnswer.enabled
    ? (currentAnswer.text || '')
    : '';
  const [step, setStep] = useState(existing ? 'detail' : 'toggle');
  const [text, setText] = useState(existing);
  const taRef = useRef(null);

  useEffect(() => {
    if (step === 'detail' && taRef.current) taRef.current.focus();
  }, [step]);

  if (step === 'toggle') {
    return (
      <div className="v4-chips-row">
        <button
          type="button"
          className="v4-chip"
          onClick={() => setStep('detail')}
        >
          Yes, add some
        </button>
        <button
          type="button"
          className="v4-chip"
          onClick={() => onSubmit({ enabled: false, text: '' })}
        >
          No, skip
        </button>
      </div>
    );
  }

  if (step === 'detail') {
    const trimmed = text.trim();
    return (
      <>
        <form
          className="v4-input-row v4-input-row-textarea"
          onSubmit={(e) => {
            e.preventDefault();
            if (!trimmed) return;
            onSubmit({ enabled: true, text: trimmed });
          }}
        >
          <textarea
            ref={taRef}
            className="v4-input v4-textarea"
            placeholder="e.g. Avoid 3-letter acronyms, keep it under 12 chars, no animal names..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={500}
            aria-label="Custom requirements"
          />
          <button
            type="submit"
            className="v4-input-submit"
            disabled={!trimmed}
            aria-label="Continue"
          >
            <ArrowRight weight="bold" size={18} />
          </button>
        </form>
        {/* Escape hatch — the creator opened this field, then changed their
            mind. Without it they're stuck (empty can't submit, no way back). */}
        <button
          type="button"
          className="v4-input-skip-link"
          onClick={() => onSubmit({ enabled: false, text: '' })}
        >
          Skip this question
        </button>
      </>
    );
  }

  return null;
}

// ── toggleNameDesc — yes/no, if yes show name input (desc cut for chat) ─
// Used for: submitterPrize, voterPrize
export function ToggleNameDescInput({ question, onSubmit, currentAnswer }) {
  const existingName = currentAnswer && typeof currentAnswer === 'object' && currentAnswer.enabled
    ? (currentAnswer.name || '')
    : '';
  const [step, setStep] = useState(existingName ? 'detail' : 'toggle');
  const [name, setName] = useState(existingName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (step === 'detail' && inputRef.current) inputRef.current.focus();
  }, [step]);

  if (step === 'toggle') {
    return (
      <div className="v4-chips-row">
        <button
          type="button"
          className="v4-chip"
          onClick={() => setStep('detail')}
        >
          Yes, add a prize
        </button>
        <button
          type="button"
          className="v4-chip"
          onClick={() => onSubmit({ enabled: false, name: '' })}
        >
          No prize
        </button>
      </div>
    );
  }

  const trimmed = name.trim();
  return (
    <>
      <form
        className="v4-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!trimmed) return;
          onSubmit({ enabled: true, name: trimmed });
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className="v4-input"
          placeholder="What’s the prize? e.g. $50 gift card, lifetime bragging rights..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          aria-label="Prize name"
        />
        <button
          type="submit"
          className="v4-input-submit"
          disabled={!trimmed}
          aria-label="Continue"
        >
          <ArrowRight weight="bold" size={18} />
        </button>
      </form>
      {/* Escape hatch — opened "add a prize", then changed their mind. */}
      <button
        type="button"
        className="v4-input-skip-link"
        onClick={() => onSubmit({ enabled: false, name: '' })}
      >
        Skip, no prize
      </button>
    </>
  );
}

// ── brandingBlock — defer to post-launch settings ───────────────────
// Show simple toggle; if yes, save intent. Logo + colors get configured
// from the dashboard after launch.
export function BrandingBlockInput({ question, onSubmit }) {
  return (
    <div className="v4-chips-row">
      <button
        type="button"
        className="v4-chip"
        onClick={() => onSubmit({ enabled: true, configureAfterLaunch: true })}
      >
        Yes, set it up after launch
      </button>
      <button
        type="button"
        className="v4-chip"
        onClick={() => onSubmit({ enabled: false })}
      >
        No, use defaults
      </button>
    </div>
  );
}

// ── brandingFull — yes/no, if yes show logo upload + 2 color pickers ─
// Used for: branding (replaces brandingBlock for in-chat configuration)
export function BrandingFullInput({ question, onSubmit }) {
  const [step, setStep] = useState('toggle');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [logoName, setLogoName] = useState('');
  const [primary, setPrimary] = useState('#030302');
  const [accent, setAccent] = useState('#fceebc');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert('Logo must be under 1MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoDataUrl(ev.target.result);
      setLogoName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    onSubmit({
      enabled: true,
      logo: logoDataUrl ? { name: logoName, dataUrl: logoDataUrl } : null,
      primaryColor: primary,
      accentColor: accent,
    });
  };

  if (step === 'toggle') {
    return (
      <div className="v4-chips-row">
        <button
          type="button"
          className="v4-chip"
          onClick={() => setStep('configure')}
        >
          Yes, set it up now
        </button>
        <button
          type="button"
          className="v4-chip"
          onClick={() => onSubmit({ enabled: false })}
        >
          No, use defaults
        </button>
      </div>
    );
  }

  return (
    <div className="v4-branding-block">
      {/* Logo upload */}
      <div className="v4-branding-row">
        <label className="v4-branding-label">Logo</label>
        <div className="v4-branding-logo-area">
          {logoDataUrl ? (
            <div className="v4-branding-logo-preview">
              <img src={logoDataUrl} alt={logoName} />
              <div className="v4-branding-logo-name">{logoName}</div>
              <button
                type="button"
                className="v4-branding-logo-replace"
                onClick={() => fileRef.current?.click()}
              >
                Replace
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="v4-branding-logo-empty"
              onClick={() => fileRef.current?.click()}
            >
              <UploadSimple weight="duotone" size={18} />
              <span>Upload logo</span>
              <span className="v4-branding-logo-hint">PNG, under 1MB</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Color pickers */}
      <div className="v4-branding-colors">
        <div className="v4-branding-color">
          <label className="v4-branding-label">Primary</label>
          <div className="v4-branding-color-row">
            <input
              type="color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="v4-branding-color-input"
              aria-label="Primary color"
            />
            <span className="v4-branding-color-hex">{primary.toUpperCase()}</span>
          </div>
        </div>
        <div className="v4-branding-color">
          <label className="v4-branding-label">Accent</label>
          <div className="v4-branding-color-row">
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="v4-branding-color-input"
              aria-label="Accent color"
            />
            <span className="v4-branding-color-hex">{accent.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="v4-multichips-submit"
        onClick={handleSubmit}
      >
        Save branding <ArrowRight weight="bold" size={14} />
      </button>
      {/* Escape hatch — opened branding setup, then changed their mind. */}
      <button
        type="button"
        className="v4-input-skip-link"
        onClick={() => onSubmit({ enabled: false })}
      >
        Skip, use defaults
      </button>
    </div>
  );
}

// ── Defer placeholder — for types we haven't built yet ──────────────
// Generic "configure after launch" affordance with auto-submit on click.
export function DeferLaunchInput({ question, onSubmit, label = 'Configure after launch' }) {
  return (
    <div className="v4-defer-row">
      <CheckCircle weight="duotone" size={18} />
      <span>{label}</span>
      <button
        type="button"
        className="v4-chip"
        onClick={() => onSubmit('[configure-later]')}
      >
        Got it
      </button>
    </div>
  );
}
