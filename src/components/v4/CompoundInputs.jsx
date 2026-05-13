// Compound inputs for shared settings — these are chat-friendly versions
// of the legacy multi-field components. Each handles its own internal
// state and emits a single object answer when complete.

import { useState, useRef, useEffect } from 'react';
import { ArrowRight, CheckCircle } from '@phosphor-icons/react';

// ── toggleTextarea — yes/no, if yes show textarea ───────────────────
// Used for: customRequirements
export function ToggleTextareaInput({ question, onSubmit }) {
  const [step, setStep] = useState('toggle'); // 'toggle' | 'detail' | 'done'
  const [text, setText] = useState('');
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
    );
  }

  return null;
}

// ── toggleNameDesc — yes/no, if yes show name input (desc cut for chat) ─
// Used for: submitterPrize, voterPrize
export function ToggleNameDescInput({ question, onSubmit }) {
  const [step, setStep] = useState('toggle');
  const [name, setName] = useState('');
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
        placeholder="What's the prize? e.g. $50 gift card, lifetime bragging rights..."
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
