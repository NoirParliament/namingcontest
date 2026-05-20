// V4 combined Launch modal — email (magic-link auth) + Stripe Elements
// payment form. Replaces the standalone AuthModal at /v4/setup/review.
//
// Architecture:
//   - Stripe.js loads lazily on mount (only when modal opens)
//   - CardElement renders inside <Elements> provider, themed via the
//     `appearance` API to match our Inter / Fraunces / beige palette
//   - For prototype: we collect card details via Stripe but don't
//     actually charge — the real charge needs a backend Payment Intent
//     endpoint. When backend is wired, only the submit handler changes.
//   - On success: stash userEmail + paymentReceiptId in localStorage,
//     generate a contestId, navigate to /v4/contest/[id].

import { useState, useRef, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  X, CheckCircle, EnvelopeSimple, LockKey,
} from '@phosphor-icons/react';
import '../../styles/landing-v3.css';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Lazy-load Stripe.js — only requested when this modal mounts
let stripePromise = null;
function getStripe() {
  if (!stripePromise && STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

// Tier-specific pricing (mirrors what the homepage offering cards show)
const TIER_PRICING = {
  personal: { price: 9,  label: 'Personal' },
  group:    { price: 29, label: 'Group' },
  business: { price: 89, label: 'Business' },
};

// Stripe Elements appearance — themed to match V4 design tokens
const STRIPE_APPEARANCE = {
  theme: 'stripe',
  variables: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '15px',
    fontWeightNormal: '500',
    colorPrimary: '#030302',
    colorBackground: '#ffffff',
    colorText: '#030302',
    colorDanger: '#bb433a',
    spacingUnit: '4px',
    borderRadius: '10px',
  },
  rules: {
    '.Input': {
      border: '1.5px solid rgba(3, 3, 2, 0.1)',
      boxShadow: 'none',
      padding: '12px 14px',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    },
    '.Input:focus': {
      border: '1.5px solid rgba(3, 3, 2, 0.45)',
      boxShadow: '0 0 0 3px rgba(3, 3, 2, 0.12)',
    },
    '.Label': {
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: 'rgba(3, 3, 2, 0.6)',
    },
  },
};

export default function LaunchModal({
  open,
  onClose,
  onSuccess,
  contextLabel = '',
  tier = 'personal',
}) {
  if (!open) return null;
  return (
    <Elements stripe={getStripe()} options={{ appearance: STRIPE_APPEARANCE }}>
      <LaunchModalInner
        onClose={onClose}
        onSuccess={onSuccess}
        contextLabel={contextLabel}
        tier={tier}
      />
    </Elements>
  );
}

function LaunchModalInner({ onClose, onSuccess, contextLabel, tier }) {
  const stripe = useStripe();
  const elements = useElements();
  const emailRef = useRef(null);

  const [email, setEmail] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const pricing = TIER_PRICING[tier] || TIER_PRICING.personal;

  useEffect(() => {
    // Pre-fill email if already saved
    try {
      const raw = localStorage.getItem('v4_contest_setup');
      const cur = raw ? JSON.parse(raw) : {};
      if (cur.userEmail) setEmail(cur.userEmail);
    } catch {}
    setTimeout(() => emailRef.current?.focus(), 100);
  }, []);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = isValidEmail && cardComplete && !submitting && stripe && elements;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setCardError('');

    // PROTOTYPE: validate card via Stripe (creates a payment method but
    // doesn't charge — that requires a backend Payment Intent endpoint).
    // When backend is ready, swap this for stripe.confirmPayment().
    const cardElement = elements.getElement(CardElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { email: email.trim() },
    });

    if (error) {
      setCardError(error.message || 'Payment failed. Please try again.');
      setSubmitting(false);
      return;
    }

    // Stub successful payment + auth — stash receipt + email
    try {
      const raw = localStorage.getItem('v4_contest_setup');
      const cur = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        'v4_contest_setup',
        JSON.stringify({
          ...cur,
          userEmail: email.trim(),
          paymentMethodId: paymentMethod.id, // Stripe payment method ID
          paidAmount: pricing.price,
          paidTier: tier,
        })
      );
    } catch {}

    setSubmitted(true);
    // Brief celebration pause before proceeding
    setTimeout(() => {
      onSuccess?.(email.trim(), paymentMethod.id);
    }, 1200);
  };

  return (
    <div className="v4 lp-v3 v4-auth-backdrop" onClick={onClose}>
      <div
        className="v4-auth-modal v4-launch-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="v4-launch-title"
      >
        <button
          type="button"
          className="v4-auth-close"
          onClick={onClose}
          aria-label="Close"
          disabled={submitting}
        >
          <X weight="regular" size={16} />
        </button>

        {!submitted && (
          <>
            <h2 id="v4-launch-title" className="v4-auth-title">
              Launch {contextLabel ? `"${contextLabel}"` : 'your contest'}
            </h2>
            <p className="v4-auth-blurb">
              One charge of <strong>${pricing.price}</strong> for your {pricing.label} contest.
              We'll email you a magic link to manage results.
            </p>

            <form onSubmit={handleSubmit} className="v4-launch-form">
              {/* Email */}
              <div className="v4-launch-field">
                <label className="v4-launch-label" htmlFor="launch-email">
                  Your email
                </label>
                <div className="v4-launch-email-row">
                  <span className="v4-launch-email-icon" aria-hidden="true">
                    <EnvelopeSimple weight="duotone" size={18} />
                  </span>
                  <input
                    ref={emailRef}
                    id="launch-email"
                    type="email"
                    className="v4-launch-email-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Card (Stripe Elements) */}
              <div className="v4-launch-field">
                <label className="v4-launch-label">Card details</label>
                <div className="v4-launch-card-wrapper">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          fontFamily: 'Inter, system-ui, sans-serif',
                          color: '#030302',
                          fontSmoothing: 'antialiased',
                          '::placeholder': { color: 'rgba(3, 3, 2, 0.35)' },
                        },
                        invalid: { color: '#bb433a' },
                      },
                      hidePostalCode: false,
                    }}
                    onChange={(event) => {
                      setCardComplete(event.complete);
                      setCardError(event.error?.message || '');
                    }}
                  />
                </div>
                {cardError && (
                  <div className="v4-launch-card-error">{cardError}</div>
                )}
              </div>

              <button
                type="submit"
                className={`btn btn-primary btn-lg v4-launch-btn-modal ${submitting ? 'is-loading' : ''}`}
                disabled={!canSubmit}
              >
                {submitting ? (
                  <>Processing…</>
                ) : (
                  <>Launch contest · ${pricing.price}</>
                )}
              </button>

              <p className="v4-launch-secure">
                <LockKey weight="duotone" size={12} />
                <span>Secured by Stripe · No subscription · Charged once</span>
              </p>
            </form>
          </>
        )}

        {submitted && (
          <div className="v4-auth-success">
            <span className="v4-auth-icon v4-auth-icon-success" aria-hidden="true">
              <CheckCircle weight="duotone" size={28} />
            </span>
            <h2 className="v4-auth-title">You're live!</h2>
            <p className="v4-auth-blurb">
              Magic link on its way to <strong>{email.trim()}</strong>.
              Taking you to your contest&hellip;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
