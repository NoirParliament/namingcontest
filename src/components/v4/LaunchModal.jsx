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
import rocketImg from '../../assets/rocket.png';
import { priceForVoters, DEFAULT_VOTER_TIER } from '../../data/v4/voterTiers';
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

// Translate the segment palette (5 NC pastels) into CSS variables the
// scattered shapes read. Falls through to stylesheet defaults when
// nothing is supplied.
function paletteVars(palette) {
  if (!palette || !palette.length) return undefined;
  return {
    '--shape-c1': palette[0],
    '--shape-c2': palette[1],
    '--shape-c3': palette[2],
    '--shape-c4': palette[3],
    '--shape-c5': palette[4],
  };
}

export default function LaunchModal({
  open,
  onClose,
  onCreateIntent,
  onPaid,
  contextLabel = '',
  tier = 'personal',
  palette,
}) {
  if (!open) return null;
  return (
    <Elements stripe={getStripe()} options={{ appearance: STRIPE_APPEARANCE }}>
      <LaunchModalInner
        onClose={onClose}
        onCreateIntent={onCreateIntent}
        onPaid={onPaid}
        contextLabel={contextLabel}
        tier={tier}
        palette={palette}
      />
    </Elements>
  );
}

function LaunchModalInner({ onClose, onCreateIntent, onPaid, contextLabel, tier, palette }) {
  const stripe = useStripe();
  const elements = useElements();
  const emailRef = useRef(null);

  const [email, setEmail] = useState('');
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Price comes from the chosen VOTER tier (how many can vote), not the
  // category — read from the setup blob BriefChat wrote it to.
  const [voterTier] = useState(() => {
    try {
      const cur = JSON.parse(localStorage.getItem('v4_contest_setup') || '{}');
      return cur.voterTier || DEFAULT_VOTER_TIER;
    } catch { return DEFAULT_VOTER_TIER; }
  });
  const price = priceForVoters(voterTier);

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

    try {
      // 1. Create the draft contest + a PaymentIntent for its price (the price
      //    is read server-side from the contest, never trusted from here).
      const { contestId, clientSecret, paymentIntentId } = await onCreateIntent(email.trim());

      // 2. Confirm the card against that intent — the real charge.
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement, billing_details: { email: email.trim() } },
      });
      if (error) {
        setCardError(error.message || 'Payment failed. Please try again.');
        setSubmitting(false);
        return;
      }
      if (paymentIntent?.status !== 'succeeded') {
        setCardError('Payment could not be completed. Please try another card.');
        setSubmitting(false);
        return;
      }

      // 3. Paid — mirror the email to the setup blob, celebrate, then hand off
      //    to onPaid (verifies server-side + flips the contest live + routes).
      try {
        const raw = localStorage.getItem('v4_contest_setup');
        const cur = raw ? JSON.parse(raw) : {};
        localStorage.setItem(
          'v4_contest_setup',
          JSON.stringify({ ...cur, userEmail: email.trim(), paidAmount: price, paidTier: tier, paidVoterTier: voterTier })
        );
      } catch { /* ignore */ }

      setSubmitted(true);
      setTimeout(() => onPaid?.({ contestId, paymentIntentId, email: email.trim() }), 1200);
    } catch (err) {
      setCardError(err?.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="v4 lp-v3 v4-auth-backdrop" onClick={onClose}>
      {/* Soft blush halo behind the modal — same warm glow used by the
          sign-in modal so the two checkout-style cards read as siblings. */}
      <span className="v4-launch-halo" aria-hidden="true" />
      <div
        className="v4-auth-modal v4-launch-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="v4-launch-title"
        style={paletteVars(palette)}
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

        {/* Scattered decorative shapes — same vocabulary as the sign-in
            modal: mint dot, periwinkle pill, blush, butter, purple accent. */}
        <span className="v4-launch-shape v4-launch-shape-1" aria-hidden="true" />
        <span className="v4-launch-shape v4-launch-shape-2" aria-hidden="true" />
        <span className="v4-launch-shape v4-launch-shape-3" aria-hidden="true" />
        <span className="v4-launch-shape v4-launch-shape-4" aria-hidden="true" />
        <span className="v4-launch-shape v4-launch-shape-5" aria-hidden="true" />

        {!submitted && (
          <>
            <img
              className="v4-launch-hero-rocket"
              src={rocketImg}
              alt=""
              aria-hidden="true"
            />
            <h2 id="v4-launch-title" className="v4-auth-title">
              Launch {contextLabel ? `“${contextLabel}”` : 'your contest'}
            </h2>
            <p className="v4-auth-blurb">
              One charge of <strong>${price}</strong> for up to <strong>{voterTier}</strong> voters.
              We’ll email you a magic link to manage results.
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
                  <>Launch contest · ${price}</>
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
            <h2 className="v4-auth-title">You’re live!</h2>
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
