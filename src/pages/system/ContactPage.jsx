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
  PaperPlaneTilt, CheckCircle, EnvelopeSimple, ChatCircleDots, Sparkle, Heart, X,
} from '@phosphor-icons/react';
import { Nav, Footer } from '../LandingPage';
import { supabase } from '../../lib/supabaseClient';
import mailboxImg from '../../assets/mailbox.png';
import letterImg from '../../assets/letter.png';
import messageImg from '../../assets/message.png';
import '../../styles/landing-v3.css';
import '../../styles/v4.css';
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
    ask: () => 'Hey there, what should we call you?',
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
  // Past-answer edit popup (BriefChat / ContestManage pattern): user
  // clicks a finished user-bubble → modal opens with the same Q/A
  // shape so they can fix a typo without re-running the whole chat.
  const [editing, setEditing] = useState(null);   // { stepIndex, currentValue } | null
  const [sendError, setSendError] = useState(false);

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
      deliver(next);
    }
  };

  // Actually send. Split out from submit() so a failure can be retried
  // directly — by this point every step is answered, so re-running submit()
  // would find no current step and do nothing.
  //
  // The typing indicator doubles as the pending state, so the wait reads as
  // the bot thinking rather than as a spinner bolted onto a chat.
  const deliver = async (payload) => {
    setSendError(false);
    setBotTyping(true);
    const { error } = await supabase.functions.invoke('contact', { body: payload });
    setBotTyping(false);
    if (error) {
      // Never claim it sent when it didn't — the entire point of this form is
      // that a message reaches a human.
      console.error('[contact] send failed:', error);
      // A 429 needs different words: "try again" is the one thing that won't
      // work, and repeating it just deepens the hole.
      setSendError(error?.context?.status === 429 ? 'limit' : true);
      return;
    }
    setPhase('sent');
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

  // Open the edit modal for an already-answered step. Only past
  // (completed) answers are editable; the row for the CURRENT step
  // (still open via the composer/chips) isn't shown as user-text yet.
  const handleEditMessage = (msg) => {
    if (msg.from !== 'user') return;
    // user ids are stamped `u-<stepIndex>` in submit() below.
    const idx = parseInt(String(msg.id).replace(/^u-/, ''), 10);
    if (!Number.isFinite(idx)) return;
    setEditing({ stepIndex: idx, currentValue: msg.text });
  };

  const handleEditSave = (newValue) => {
    if (!editing) return;
    const { stepIndex: idx } = editing;
    const step = STEPS[idx];
    if (!step) return;
    const v = (newValue ?? '').trim();
    if (step.valid && !step.valid(v)) return;
    // Update both the answers store and the visible bubble text.
    const next = { ...answersRef.current, [step.id]: v };
    answersRef.current = next;
    setAnswers(next);
    setMessages((m) => m.map((msg) => (msg.id === `u-${idx}` ? { ...msg, text: v } : msg)));
    setEditing(null);
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
              <div className="contact-eyebrow">Whatever it is</div>
              <h1 className="contact-title">Tell us everything</h1>
              <p className="contact-lede">
                Question about setting up a contest, something acting up
                mid-vote, or a feature you wish we had? Tell us and a real
                person will read it and reply, usually within a day.
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
                  {/* Scattered shape decoration — matches the sign-in /
                      join-sent / pickwinner modal vocabulary so this
                      success card reads as part of the same family. */}
                  <span className="contact-received-shape contact-received-shape-1" aria-hidden="true" />
                  <span className="contact-received-shape contact-received-shape-2" aria-hidden="true" />
                  <span className="contact-received-shape contact-received-shape-3" aria-hidden="true" />
                  <span className="contact-received-shape contact-received-shape-4" aria-hidden="true" />
                  <span className="contact-received-shape contact-received-shape-5" aria-hidden="true" />

                  <img
                    src={messageImg}
                    alt=""
                    aria-hidden="true"
                    className="contact-received-hero"
                  />
                  <h2 className="contact-received-title">Message received</h2>
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
                        {msg.from === 'user' ? (
                          <button
                            type="button"
                            className="contact-chat-bubble contact-chat-bubble-editable"
                            onClick={() => handleEditMessage(msg)}
                            aria-label="Edit answer"
                            title="Click to edit"
                          >
                            {msg.text}
                          </button>
                        ) : (
                          <div className="contact-chat-bubble">{msg.text}</div>
                        )}
                      </div>
                    ))}
                    {botTyping && (
                      <div className="contact-chat-row bot">
                        <div className="contact-chat-bubble contact-chat-typing" aria-label="Typing">
                          <span /><span /><span />
                        </div>
                      </div>
                    )}
                    {/* Delivery failed. Said in the bot's own voice so it reads
                        as part of the conversation, and it hands over a real
                        address — a contact form that silently eats a message
                        is worse than no form. */}
                    {sendError && !botTyping && (
                      <div className="contact-chat-row bot" role="alert">
                        <div className="contact-chat-bubble">
                          {sendError === 'limit' ? (
                            <>
                              That&rsquo;s a few messages in a short while — give it an
                              hour, or email us straight at{' '}
                              <a href="mailto:hello@namingcontest.com">hello@namingcontest.com</a>{' '}
                              and we&rsquo;ll pick it up there.
                            </>
                          ) : (
                            <>
                              Something went wrong sending that — sorry.{' '}
                              <button
                                type="button"
                                className="contact-retry-link"
                                onClick={() => deliver(answersRef.current)}
                              >
                                Try again
                              </button>
                              , or email us directly at{' '}
                              <a href="mailto:hello@namingcontest.com">hello@namingcontest.com</a>.
                            </>
                          )}
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

      {/* Edit modal — same v4-edit-modal shell as BriefChat / Manage
          (scattered shape decoration, halo, 440px width, ink-pill
          buttons) so the popup reads as part of the same family. */}
      <ContactEditModal
        editing={editing}
        answers={answers}
        onSave={handleEditSave}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}

// ── Edit modal ──────────────────────────────────────────────────────
// Reuses the v4-edit-modal CSS shell (scattered shapes + halo) so the
// look matches BriefChat's edit popup. Renders the input that fits the
// step type — chips for choice, textarea for longtext, plain input
// otherwise — and saves the trimmed value via onSave.
function ContactEditModal({ editing, answers, onSave, onClose }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) return;
    setValue(editing.currentValue || '');
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); };
  }, [editing, onClose]);

  if (!editing) return null;
  const step = STEPS[editing.stepIndex];
  if (!step) return null;

  const valid = !step.valid || step.valid(value.trim());

  const handleSubmit = (rawVal) => {
    const v = (rawVal ?? value).trim();
    if (step.valid && !step.valid(v)) return;
    onSave?.(v);
  };

  return (
    <div className="v4 lp-v3 v4-auth-backdrop" onClick={onClose}>
      <span className="v4-edit-halo" aria-hidden="true" />
      <div
        className="v4-edit-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-edit-title"
      >
        <button
          type="button"
          className="v4-auth-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X weight="regular" size={16} />
        </button>

        {/* Scattered shapes — same five-shape recipe as BriefChat's
            edit popup. Fixed positions (no re-seed jitter here since
            this modal is opened less often than the brief one). */}
        <span className="v4-edit-shape v4-edit-shape-1" aria-hidden="true" />
        <span className="v4-edit-shape v4-edit-shape-2" aria-hidden="true" />
        <span className="v4-edit-shape v4-edit-shape-3" aria-hidden="true" />
        <span className="v4-edit-shape v4-edit-shape-4" aria-hidden="true" />
        <span className="v4-edit-shape v4-edit-shape-5" aria-hidden="true" />

        <div className="v4-edit-modal-label">Edit your answer</div>
        <h2 id="contact-edit-title" className="v4-edit-modal-prompt">
          {step.ask(answers)}
        </h2>

        <div className="v4-edit-modal-input">
          {step.type === 'choice' ? (
            <div className="contact-chat-choices" style={{ marginTop: 0 }}>
              {step.choices.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`contact-chip ${value === c ? 'is-selected' : ''}`}
                  onClick={() => handleSubmit(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          ) : step.type === 'longtext' ? (
            <textarea
              ref={inputRef}
              className="contact-chat-input"
              rows={3}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && valid) { e.preventDefault(); handleSubmit(); } }}
              placeholder={step.placeholder}
              autoComplete={step.autoComplete}
            />
          ) : (
            <input
              ref={inputRef}
              type={step.type === 'email' ? 'email' : 'text'}
              className="contact-chat-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && valid) { e.preventDefault(); handleSubmit(); } }}
              placeholder={step.placeholder}
              autoComplete={step.autoComplete}
            />
          )}
        </div>

        {step.type !== 'choice' && (
          <div className="contact-edit-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSubmit()}
              disabled={!valid}
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
