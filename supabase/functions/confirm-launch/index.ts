// Edge Function: confirm-launch
//
// Called by the app right after the card is confirmed. It re-checks the
// PaymentIntent with Stripe (server-side, authoritative) and, only if it truly
// succeeded for the right contest + amount, flips the draft contest LIVE:
// paid = true, status = 'submission', and starts the clock (launched_at +
// submission_ends_at / voting_ends_at from the contest's settings).
//
// This is the source of truth for "paid" — the client can't fake it. (A Stripe
// webhook can be added later as a backstop for closed-tab cases.)
//
// Secrets: STRIPE_SECRET_KEY. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY auto.
import Stripe from 'https://esm.sh/stripe@16.12.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

const DAY = 86400000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { contestId, paymentIntentId } = await req.json();
    if (!contestId || !paymentIntentId) return json({ error: 'Missing contestId or paymentIntentId.' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: contest, error } = await admin
      .from('contests')
      .select('id, price, settings, paid, status')
      .eq('id', contestId)
      .single();
    if (error || !contest) return json({ error: 'Contest not found.' }, 404);
    if (contest.paid) return json({ ok: true, already: true });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      httpClient: Stripe.createFetchHttpClient(),
    });
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') return json({ error: 'Payment not completed.' }, 402);
    if (pi.metadata?.contestId !== contestId) return json({ error: 'Payment does not match this contest.' }, 400);
    if (pi.amount !== Math.round((contest.price || 0) * 100)) return json({ error: 'Paid amount does not match the price.' }, 400);

    const settings = (contest.settings ?? {}) as { submissionDays?: number; votingDays?: number };
    const subDays = settings.submissionDays || 7;
    const voteDays = settings.votingDays || 3;
    const now = Date.now();

    const { error: upErr } = await admin
      .from('contests')
      .update({
        paid: true,
        status: 'submission',
        stripe_session_id: pi.id,
        launched_at: new Date(now).toISOString(),
        submission_ends_at: new Date(now + subDays * DAY).toISOString(),
        voting_ends_at: new Date(now + (subDays + voteDays) * DAY).toISOString(),
      })
      .eq('id', contestId);
    if (upErr) throw upErr;

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
