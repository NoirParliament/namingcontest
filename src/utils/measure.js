// Product measurement: loads Google Tag Manager and pushes funnel events to
// the dataLayer. GTM then forwards them to GA4 / Clarity (configured in the
// GTM UI, not here).
//
// The FILE is named "measure", not "analytics"/"tracking", so ad blockers
// don't block the module request by name in dev (see the LegalCrumbs note).
//
// Nothing loads unless VITE_GTM_ID is set (prod only), so local dev and
// preview deploys stay silent. In dev, every event is echoed to the console.
//
// Nothing loads without the visitor's yes either (utils/visitorChoice): in
// the EEA, UK and Switzerland GTM stays off until "Accept all"; elsewhere it
// is on unless the visitor turned it off or their browser sends Global
// Privacy Control. Until then track() only fills the dataLayer array in the
// page, which never leaves the browser.

import { clearAnalyticsCookies, decide, onChoice, readChoice } from './visitorChoice';

const GTM_ID = import.meta.env.VITE_GTM_ID;
const DEV = import.meta.env.DEV;

// Every parameter any event may carry. Each push resets ALL of them (to
// undefined) before setting its own, because GTM's data model remembers the
// last value of a key across pushes — without the reset, a `vote_cast`
// would still carry the `step_index` from an earlier `brief_step`.
const PARAM_KEYS = [
  'tier',        // personal | group | business
  'category',    // sub-segment id: p1, p2, p4, t1, t2, t6, b1, b2, b5
  'step_index',  // question position in the brief chat (0 = category card)
  'question_id', // brief question id (projectSummary, dueDate, …)
  'contest_id',
  'value',       // USD amount for checkout / payment events
  'currency',
  'count',       // joins (always 1) / names submitted / votes cast in one action
];

let loaded = false;

// Told to the tools before GTM starts: analytics yes, every advertising use
// no (Google Consent Mode v2), and Clarity's own consent call (it reads
// consentv2, queued here and replayed when its script arrives).
function signalConsent() {
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.clarity = window.clarity || function clarity() { (window.clarity.q = window.clarity.q || []).push(arguments); };
  window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
}

function loadGtm() {
  if (loaded) return;
  loaded = true;
  signalConsent();
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  document.head.appendChild(s);
}

// GTM (and through it GA4 + Clarity) is started OFF the critical path: on the
// visitor's first interaction, or shortly after the page has loaded,
// whichever comes first. Keeps ~300 ms of third-party script work out of
// first paint on phones. Nothing is lost: track() pushes into the
// dataLayer array right away and GTM replays the queue when it starts.
const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
const IDLE_DELAY_MS = 1500;

let scheduled = false;

export function initMeasure() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];

  // No yes (yet): remove analytics cookies left from visits before the
  // cookie bar existed, or from a yes since withdrawn on another tab.
  decide().then((d) => { if (!d.analytics) clearAnalyticsCookies(); });

  if (!GTM_ID || loaded) return;

  // Start once the visitor's choice allows it: now (stored yes, or a region
  // where it's on by default) or the moment they press "Accept all".
  decide().then((d) => { if (d.analytics) scheduleGtm(); });
  onChoice((c) => { if (c.analytics) scheduleGtm(); });
}

function scheduleGtm() {
  if (scheduled || loaded) return;
  // A fresh yes from the bar starts right away: the visitor has just
  // interacted, and the delay below only exists to protect first paint.
  if (readChoice()?.analytics && document.readyState === 'complete') { scheduled = true; loadGtm(); return; }
  scheduled = true;

  const start = () => {
    INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, start, true));
    loadGtm();
  };
  INTERACTION_EVENTS.forEach((e) => window.addEventListener(e, start, { capture: true, once: true, passive: true }));

  const afterLoad = () => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
    setTimeout(() => idle(start, { timeout: 1000 }), IDLE_DELAY_MS);
  };
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, { once: true });
}

export function track(event, params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  const payload = { event };
  for (const k of PARAM_KEYS) payload[k] = undefined;
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') payload[k] = v;
  }
  window.dataLayer.push(payload);
  if (DEV) console.debug('[measure]', event, params);
}

// Fire an event at most once per browser session for a given key — used for
// payment_completed so a refresh or a retried confirm never double counts.
export function trackOnce(key, event, params) {
  const storageKey = `nc_measured_${key}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, '1');
  } catch { /* storage unavailable — fire anyway */ }
  track(event, params);
}
