// Contact page — "Say hello."
//
// URL: /contact
//
// Same chrome + design tokens as the homepage (warm off-white, dark ink,
// pill nav, dark footer) — NO colored wash. A warm split layout: human
// pitch on the left, a clean mail-led form on the right. Fake-send (no
// backend) → a friendly "message received" confirmation.

import { useState, useEffect } from 'react';
import {
  EnvelopeSimple, PaperPlaneTilt, CheckCircle, Clock,
} from '@phosphor-icons/react';
import { Nav, Footer } from '../LandingPage';
import '../../styles/landing-v3.css';
import '../../styles/contact.css';

const SUPPORT_EMAIL = 'hello@namingcontest.com';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent

  // Always start at the top (e.g. when arriving from a scrolled page).
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const canSend =
    name.trim().length > 0 &&
    /^\S+@\S+\.\S+$/.test(email.trim()) &&
    message.trim().length > 0;

  const handleSend = (e) => {
    e?.preventDefault();
    if (!canSend) return;
    setStatus('sending');
    // No backend in the prototype — fake the send like the magic-link flow.
    setTimeout(() => setStatus('sent'), 750);
  };

  const handleReset = () => {
    setName('');
    setMessage('');
    setStatus('idle');
  };

  return (
    <div className="lp-v3 contact-page">
      <div className="frame">
        {/* Background decoration — soft pastel orbs + floating dots. */}
        <div className="contact-decor" aria-hidden="true">
          <span className="contact-orb contact-orb-1" />
          <span className="contact-orb contact-orb-2" />
          <span className="contact-orb contact-orb-3" />
          <span className="contact-orb contact-orb-4" />
          <span className="contact-dot contact-dot-1" />
          <span className="contact-dot contact-dot-2" />
          <span className="contact-dot contact-dot-3" />
          <span className="contact-dot contact-dot-4" />
          <span className="contact-dot contact-dot-5" />
        </div>

        <div className="wrap">
          <Nav />

          <main className="contact-main" role="main">
            {/* ── Left rail — the human pitch ─────────────────────── */}
            <section className="contact-intro">
              <div className="contact-eyebrow">Contact</div>
              <h1 className="contact-title">Say hello.</h1>
              <p className="contact-lede">
                Real humans — the naming nerds behind your contests — read
                every message. No bots, no ticket queue.
              </p>

              <div className="contact-promise">
                <Clock weight="duotone" size={16} />
                <span>
                  We reply within <strong>one business day</strong> — usually
                  faster.
                </span>
              </div>

              <p className="contact-alt">
                Prefer plain email? Write us at{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
              </p>

              <p className="contact-ps">
                <strong>P.S.</strong> Stuck on a name? That’s literally our job
                — we’re Catchword, 25+ years and a few thousand brands in.
              </p>
            </section>

            {/* ── Right rail — mail-led form ──────────────────────── */}
            <section className="contact-panel">
              {status === 'sent' ? (
                <div className="contact-received">
                  <span className="contact-received-icon" aria-hidden="true">
                    <CheckCircle weight="duotone" size={30} />
                  </span>
                  <div className="contact-received-title">Message received.</div>
                  <p className="contact-received-sub">
                    Thanks{name.trim() ? `, ${name.trim().split(' ')[0]}` : ''} —
                    we’ll reply to <strong>{email.trim()}</strong> within a
                    business day. Keep an eye on your inbox.
                  </p>
                  <button
                    type="button"
                    className="contact-received-again"
                    onClick={handleReset}
                  >
                    Send another →
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSend}>
                  <span className="contact-form-icon" aria-hidden="true">
                    <EnvelopeSimple weight="duotone" size={26} />
                  </span>
                  <h2 className="contact-form-head">Send us a message</h2>
                  <p className="contact-form-sub">We’ll get back to you by email.</p>

                  <label className="contact-field">
                    <span className="contact-field-label">Your name</span>
                    <input
                      type="text"
                      className="contact-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </label>

                  <label className="contact-field">
                    <span className="contact-field-label">Email</span>
                    <span className="contact-input-icon-wrap">
                      <EnvelopeSimple weight="bold" size={15} className="contact-input-icon" />
                      <input
                        type="email"
                        className="contact-input contact-input-padded"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </span>
                  </label>

                  <label className="contact-field">
                    <span className="contact-field-label">Message</span>
                    <textarea
                      className="contact-input contact-textarea"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What’s on your mind? The more detail, the faster we can help."
                    />
                  </label>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg contact-send"
                    disabled={!canSend || status === 'sending'}
                  >
                    {status === 'sending' ? (
                      <>Sending&hellip;</>
                    ) : (
                      <>
                        <PaperPlaneTilt weight="bold" size={15} />
                        Send it our way <span className="arrow">→</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </section>
          </main>
        </div>

        <Footer />
      </div>
    </div>
  );
}
