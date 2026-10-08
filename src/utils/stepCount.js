// Anonymous step counts for the contest setup funnel (migration 0032).
//
// Google Analytics only sees visitors who allow cookies, so drop-off per
// brief question was a sample. This counts every step for every visitor, in
// our own database, without identifying anyone: the step, tier, category,
// question id and position. No id, no cookie, nothing stored in or read from
// the browser, so it runs whatever the cookie choice (see the privacy
// policy, "Anonymous setup step counts").
//
// Called from measure.track() for the steps below; payments and launches
// aren't counted here because the contests table already holds them exactly.
// Only the live site sends: local dev logs to the console, and preview
// deploys (which share the database) stay silent.

import { supabase } from '../lib/supabaseClient';

const COUNTED = new Set([
  'tier_selected',
  'category_selected',
  'brief_step',
  'brief_completed',
  'review_viewed',
  'checkout_opened',
  'checkout_submitted',
]);

const LIVE_HOSTS = ['namingcontest.com', 'www.namingcontest.com'];

// Once per step per page load: editing an answer, or a component mounting
// twice, doesn't count the same step again. Kept in memory only.
const seen = new Set();

export function countStep(event, params = {}) {
  if (!COUNTED.has(event) || typeof window === 'undefined') return;
  const key = [event, params.tier, params.category, params.question_id].join('|');
  if (seen.has(key)) return;
  seen.add(key);

  if (import.meta.env.DEV) {
    console.debug('[count]', event, params);
    return;
  }
  if (!LIVE_HOSTS.includes(window.location.hostname)) return;

  supabase
    .rpc('count_funnel_step', {
      p_step: event,
      p_tier: params.tier ?? null,
      p_category: params.category ?? null,
      p_question: params.question_id ?? null,
      p_step_index: Number.isInteger(params.step_index) ? params.step_index : null,
    })
    .then(() => {}, () => {}); // a lost count never bothers the visitor
}
