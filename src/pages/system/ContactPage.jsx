// Contact page — "Say hello."
//
// URL: /contact
//
// Same chrome + design tokens as the homepage (warm off-white, dark ink,
// pill nav, dark footer). A warm split layout: human pitch on the left, a
// CONVERSATIONAL brief on the right — click to start, then bot-style prompts
// appear one at a time (chat bubbles) inside the panel and you answer via
// text / choice chips. Fake-send (no backend) → "message received".

import { useState, useEffect, useRef } from 'react';
import {
  PaperPlaneTilt, CheckCircle, EnvelopeSimple, ChatCircleDots, Sparkle, Heart,
} from '@phosphor-icons/react';
import { Nav, Footer } from '../LandingPage';
import mailboxImg from '../../assets/mailbox.png';
import letterImg from '../../assets/letter.png';
import '../../styles/landing-v3.css';
import '../../styles/contact.css';

const SUPPORT_EMAIL = 'hello@namingcontest.com';

const firstName = (s = '') => (s.trim().split(/\s+/)[0] || '').trim();

// Scattered floating icons — EXACT positions copied from the segment chat
// backdrop (SegmentThemeBackdrop.iconPositions).
const DECO_ICONS = [
  { Icon: EnvelopeSimple,  style: { top: '14%', left: '7%' },    size: 46, rot: '-10deg' },
  { Icon: ChatCircleDots,  style: { top: '36%', right: '6%' },   size: 32, rot: '14deg'  },
  { Icon: PaperPlaneTilt,  style: { top: '58%', left: '4%' },    size: 36, rot: '8deg'   },
  { Icon: Sparkle,         style: { top: '72%', right: '10%' },  size: 40, rot: '-12deg' },
  { Icon: Heart,           style: { bottom: '8%', left: '20%' }, size: 32, rot: '20deg'  },
];

// The conversational brief, step by step. Each step renders as a bot bubble
// (the `ask`) followed by either a text composer or choice chips.
const STEPS = [
  {
    id: 'name', type: 'text', placeholder: 'Jane Doe', autoComplete: 'name',
    ask: () => 'Hey there — what should we call you?',
    valid: (v) => v.trim().length > 0,
  },
  {
    id: 'company', type: 'text', placeholder: 'Company (or “just me”)', autoComplete: 'organization',
    ask: (a) => `Nice to meet you, ${firstName(a.name)}. Where do you work?`,
    valid: (v) => v.trim().length > 0,
  },
  {
    id: 'topic', type: 'choice',
    ask: () => 'What can we help you with?',
    choices: ['Naming a brand', 'A specific contest', 'Pricing & plans', 'Something else'],
  },
  {
    id: 'message', type: 'longtext', placeholder: 'The more detail, the faster we can help.',
    ask: () => 'Got it. Tell us a little more —',
    valid: (v) => v.trim().length > 0,
  },
  {
    id: 'email', type: 'email', placeholder: 'you@example.com', autoComplete: 'email',
    ask: (a) => `Last thing, ${firstName(a.name)} — where should we reply?`,
    valid: (v) => /^\S+@\S+\.\S+$/.test(v.trim()),
  },
];

export default function ContactPage() {
  const [phase, setPhase] = useState('chat');     // chat | sent (opens straight in chat)
  const [messages, setMessages] = useState([]);   // { id, from: 'bot'|'user', text }
  const [stepIndex, setStepIndex] = useState(-1);
  const [active, setActive] = useState(false);     // input enabled (not while bot "types")
  const [botTyping, setBotTyping] = useState(true); // first question is "typing" on load
  const [draft, setDraft] = useState('');
  const [answers, setAnswers] = useState({});

  const answersRef = useRef({});
  const timers = useRef([]);
  const threadEndRef = useRef(null);

  const after = (ms, fn) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };

  // Always start at the top (e.g. when arriving from a scrolled page).
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Clear any pending typing timers on unmount.
  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current = []; }, []);

  // Auto-scroll the thread to the newest message / typing indicator.
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, botTyping]);

  // ── Conversation engine ────────────────────────────────────────────
  const askStep = (i) => {
    setActive(false);
    setBotTyping(true);
    after(820, () => {
      setBotTyping(false);
      setStepIndex(i);
      setMessages((m) =>
        m.some((x) => x.id === `bot-${i}`)
          ? m
          : [...m, { id: `bot-${i}`, from: 'bot', text: STEPS[i].ask(answersRef.current) }]
      );
      setActive(true);
    });
  };

  // Open already in chat mode — ask the first question as soon as we mount.
  useEffect(() => {
    askStep(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (rawVal) => {
    const step = STEPS[stepIndex];
    if (!step) return;
    const val = (rawVal ?? draft).trim();
    if (step.valid && !step.valid(val)) return;

    const next = { ...answersRef.current, [step.id]: val };
    answersRef.current = next;
    setAnswers(next);
    setMessages((m) => [...m, { id: `u-${stepIndex}`, from: 'user', text: val }]);
    setDraft('');
    setActive(false);

    const ni = stepIndex + 1;
    if (ni < STEPS.length) {
      askStep(ni);
    } else {
      // Done — fake the send like the magic-link flow.
      setBotTyping(true);
      after(1150, () => { setBotTyping(false); setPhase('sent'); });
    }
  };

  const handleReset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    answersRef.current = {};
    setAnswers({});
    setMessages([]);
    setStepIndex(-1);
    setDraft('');
    setActive(false);
    setPhase('chat');
    askStep(0);
  };

  const onComposerKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const step = stepIndex >= 0 ? STEPS[stepIndex] : null;
  const showChoices = phase === 'chat' && active && step && step.type === 'choice';
  const showComposer = phase === 'chat' && active && step && step.type !== 'choice';
  const draftValid = step?.valid ? step.valid(draft.trim()) : draft.trim().length > 0;

  return (
    <div className="lp-v3 contact-page">
      <div className="frame">
        <div className="wrap">
          {/* Background decoration — anchored to the content area (not the
              footer) so it scrolls with the hero. Halo blobs + floating icons
              + two illustrations sitting on top of the blobs (like the chat
              pages). */}
          <div className="contact-decor" aria-hidden="true">
            <span className="contact-blob contact-blob-1" />
            <span className="contact-blob contact-blob-2" />
            <span className="contact-blob contact-blob-3" />
            <span className="contact-blob contact-blob-4" />
            <span className="contact-blob contact-blob-5" />

            {DECO_ICONS.map(({ Icon, style, size, rot }, i) => (
              <span
                key={i}
                className="contact-deco-icon"
                style={{ ...style, '--rot': rot, animationDelay: `${i * 0.18}s, ${i * -2.5}s` }}
              >
                <Icon weight="duotone" size={size} />
              </span>
            ))}

            {/* Illustrations in the chat backdrop's anchor (top-right) +
                accent (bottom-left) slots. */}
            <img className="contact-deco contact-deco-mailbox" src={mailboxImg} alt="" />
            <img className="contact-deco contact-deco-letter" src={letterImg} alt="" />
          </div>

          <Nav />

          <main className="contact-main" role="main">
            {/* ── Left rail — the human pitch ─────────────────────── */}
            <section className="contact-intro">
              <div className="contact-eyebrow">Contact</div>
              <h1 className="contact-title">Say hello.</h1>
              <p className="contact-lede">
                Got a question or an issue — or want professional naming help?
                We’re Catchword, and a real human reads every message.
              </p>

              <div className="contact-promise">
                <EnvelopeSimple weight="duotone" size={17} />
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </div>
            </section>

            {/* ── Right rail — conversational brief (in-panel) ────── */}
            <section className="contact-panel contact-chat-panel">
              {phase === 'sent' ? (
                <div className="contact-received">
                  <span className="contact-received-icon" aria-hidden="true">
                    <CheckCircle weight="duotone" size={30} />
                  </span>
                  <div className="contact-received-title">Message received.</div>
                  <p className="contact-received-sub">
                    Thanks{answers.name ? `, ${firstName(answers.name)}` : ''} —
                    we’ll reply to <strong>{answers.email}</strong> within a
                    business day. Keep an eye on your inbox.
                  </p>
                  <button type="button" className="contact-received-again" onClick={handleReset}>
                    Start over →
                  </button>
                </div>
              ) : (
                <div className="contact-chat">
                  <div className="contact-chat-head">
                    <span className="contact-chat-head-dot" aria-hidden="true" />
                    <div className="contact-chat-head-text">
                      <span className="contact-chat-head-title">NamingContest</span>
                      <span className="contact-chat-head-sub">Typically replies within a day</span>
                    </div>
                  </div>
                  <div className="contact-chat-thread" role="log" aria-live="polite">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`contact-chat-row ${msg.from}`}>
                        <div className="contact-chat-bubble">{msg.text}</div>
                      </div>
                    ))}
                    {botTyping && (
                      <div className="contact-chat-row bot">
                        <div className="contact-chat-bubble contact-chat-typing" aria-label="Typing">
                          <span /><span /><span />
                        </div>
                      </div>
                    )}
                    <div ref={threadEndRef} />
                  </div>

                  {showChoices && (
                    <div className="contact-chat-choices">
                      {step.choices.map((c) => (
                        <button key={c} type="button" className="contact-chip" onClick={() => submit(c)}>
                          {c}
                        </button>
                      ))}
                    </div>
                  )}

                  {showComposer && (
                    <div className="contact-chat-composer">
                      {step.type === 'longtext' ? (
                        <textarea
                          className="contact-chat-input"
                          rows={2}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={onComposerKey}
                          placeholder={step.placeholder}
                          autoFocus
                        />
                      ) : (
                        <input
                          type={step.type === 'email' ? 'email' : 'text'}
                          className="contact-chat-input"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={onComposerKey}
                          placeholder={step.placeholder}
                          autoComplete={step.autoComplete}
                          autoFocus
                        />
                      )}
                      <button
                        type="button"
                        className="contact-chat-send"
                        onClick={() => submit()}
                        disabled={!draftValid}
                        aria-label="Send"
                      >
                        <PaperPlaneTilt weight="fill" size={17} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </main>
        </div>

        <Footer />
      </div>
    </div>
  );
}
