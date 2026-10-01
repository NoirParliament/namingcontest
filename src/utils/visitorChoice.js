// The visitor's one choice about analytics: Google Analytics (visits, funnel
// steps; no ads) and Microsoft Clarity (session recordings, heatmaps), both
// loaded through Google Tag Manager by utils/measure.js. One yes or no for
// both, by design (Matt, 2026-10-01): they serve one purpose, understanding
// how the site is used.
//
// Named "visitorChoice", not "consent"/"cookies", for the same reason as
// utils/measure.js: ad and cookie-banner blockers drop module requests by
// name, which would blank the page in dev.
//
// The rules, by where the visitor is:
//   - EEA, UK and Switzerland ("strict"): nothing is loaded until the visitor
//     says yes. The bar asks, with "Reject all" and "Accept all" side by side.
//   - Everywhere else ("open"): on by default, no bar. The footer's
//     "Cookie settings" link opens the same bar to switch it off.
//   - A browser sending Global Privacy Control is treated as "Reject all"
//     everywhere, with no bar.
//   - If the country can't be found (endpoint down, local dev), the visitor
//     is treated as strict.
//
// The choice is kept in localStorage under CHOICE_KEY. Bumping
// CHOICE_VERSION (new tools, new purposes, new wording) asks everyone again.

import { supabase } from '../lib/supabaseClient';

export const CHOICE_VERSION = 1;
const CHOICE_KEY = 'nc_choice';
const REGION_CACHE_KEY = 'nc_region';

// EU 27 + Iceland, Liechtenstein, Norway (EEA) + United Kingdom + Switzerland.
const STRICT_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
  'SE', 'IS', 'LI', 'NO', 'GB', 'CH',
]);

const PROD_HOSTS = new Set(['namingcontest.com', 'www.namingcontest.com']);

const safe = (fn, fallback) => {
  try { return fn(); } catch { return fallback; }
};

// ── Stored choice ──────────────────────────────────────────────────────────

export function readChoice() {
  const raw = safe(() => localStorage.getItem(CHOICE_KEY), null);
  if (!raw) return null;
  const c = safe(() => JSON.parse(raw), null);
  if (!c || c.v !== CHOICE_VERSION || typeof c.analytics !== 'boolean') return null;
  return c;
}

function writeChoice(c) {
  safe(() => localStorage.setItem(CHOICE_KEY, JSON.stringify(c)));
}

// ── Where the visitor is ───────────────────────────────────────────────────

// Off the live site (localhost, Vercel previews) a ?nc_region=US or
// ?nc_region=DE in the address tests either path. Never honoured on the live
// domain, so nobody can talk the live site out of asking.
function regionOverride() {
  if (PROD_HOSTS.has(window.location.hostname)) return null;
  const q = new URLSearchParams(window.location.search).get('nc_region');
  if (!q) return null;
  const code = q.trim().toUpperCase();
  safe(() => sessionStorage.setItem(REGION_CACHE_KEY, code));
  return code;
}

async function fetchCountry() {
  const cached = safe(() => sessionStorage.getItem(REGION_CACHE_KEY), null);
  if (cached) return cached;
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => ctrl?.abort(), 2500);
  try {
    const res = await fetch('/api/region', { cache: 'no-store', signal: ctrl?.signal });
    if (!res.ok) return null;
    const data = await res.json();
    const code = typeof data?.country === 'string' ? data.country.toUpperCase() : null;
    if (code) safe(() => sessionStorage.setItem(REGION_CACHE_KEY, code));
    return code;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

let countryPromise = null;
export function visitorCountry() {
  if (!countryPromise) {
    const forced = typeof window !== 'undefined' ? regionOverride() : null;
    countryPromise = forced ? Promise.resolve(forced) : fetchCountry();
  }
  return countryPromise;
}

export const isStrictCountry = (code) => !code || STRICT_COUNTRIES.has(code);

export function sendsGpc() {
  return typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true;
}

// ── The decision ───────────────────────────────────────────────────────────

// Resolves to { analytics, ask, country, source }:
//   analytics: may Google Analytics + Clarity load now
//   ask:       should the bar show
let decisionPromise = null;
export function decide() {
  if (!decisionPromise) {
    decisionPromise = (async () => {
      const stored = readChoice();
      if (stored) return { analytics: stored.analytics, ask: false, country: stored.country || null, source: 'stored' };
      if (sendsGpc()) return { analytics: false, ask: false, country: null, source: 'gpc' };
      const country = await visitorCountry();
      if (isStrictCountry(country)) return { analytics: false, ask: true, country, source: 'strict' };
      return { analytics: true, ask: false, country, source: 'open' };
    })();
  }
  return decisionPromise;
}

// ── Listeners (measure.js starts tracking, the bar opens on request) ───────

const listeners = new Set();
export function onChoice(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const openers = new Set();
export function onOpenSettings(fn) {
  openers.add(fn);
  return () => openers.delete(fn);
}
// The footer's "Cookie settings" link (and anything else) calls this.
export function openChoiceSettings() {
  openers.forEach((fn) => fn());
}

// ── Making a choice ────────────────────────────────────────────────────────

// Analytics cookies on our domain, removed when someone says no after
// saying yes. Google Analytics: _ga, _ga_<id>, _gid, _gat*. Clarity: _clck,
// _clsk. Cleared on the bare host and on the registrable domain, since GA
// sets them on the latter.
const ANALYTICS_COOKIE = /^(_ga|_gid|_gat|_clck|_clsk)/;
export function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const parts = host.split('.');
  const domains = [host, parts.length > 1 ? `.${parts.slice(-2).join('.')}` : null, `.${host}`].filter(Boolean);
  document.cookie.split(';').map((c) => c.split('=')[0].trim()).filter((n) => ANALYTICS_COOKIE.test(n)).forEach((name) => {
    const gone = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = gone;
    domains.forEach((d) => { document.cookie = `${gone}; domain=${d}`; });
  });
}

// Anonymous record of the choice, so consent can be shown to have been
// given (GDPR art. 7(1)). No IP, no account: a random id that lives only in
// this browser's stored choice, the answer, the bar version and the country.
// Fails silently: the choice itself never depends on it.
function recordChoice(c) {
  safe(() => {
    supabase.from('choice_records').insert({
      choice_id: c.id,
      analytics: c.analytics,
      version: c.v,
      country: c.country || null,
      source: c.source,
    }).then(() => {}, () => {});
  });
}

const newId = () => safe(() => crypto.randomUUID(), null) || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// The choice in force right now (stored, or the default for this visitor).
export async function currentChoice() {
  const stored = readChoice();
  if (stored) return stored;
  const d = await decide();
  return { analytics: d.analytics, country: d.country };
}

export async function saveChoice(analytics, source = 'bar') {
  const before = readChoice();
  const decision = await decide();
  const c = {
    v: CHOICE_VERSION,
    id: before?.id || newId(),
    analytics: !!analytics,
    at: new Date().toISOString(),
    country: decision.country || null,
    source,
  };
  writeChoice(c);
  recordChoice(c);

  const wasOn = before ? before.analytics : decision.analytics;
  if (wasOn && !c.analytics) {
    // Switching off after tracking may have started on this page. Google
    // Analytics would otherwise send one last hit as the page unloads (and
    // write its cookie again), so first flip Google's own off switch,
    // window['ga-disable-<measurement id>'], for every GA4 id on the page;
    // then mark storage denied, end Clarity, clear the cookies and reload
    // so no tag stays in memory.
    safe(() => Object.keys(window.google_tag_manager || {})
      .filter((k) => /^G-[A-Z0-9]+$/.test(k))
      .forEach((id) => { window[`ga-disable-${id}`] = true; }));
    safe(() => window.gtag?.('consent', 'update', { analytics_storage: 'denied' }));
    safe(() => window.clarity?.('consent', false));
    clearAnalyticsCookies();
    window.location.reload();
    return c;
  }
  listeners.forEach((fn) => fn(c));
  return c;
}
