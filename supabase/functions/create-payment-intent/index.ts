// Edge Function: create-payment-intent
//
// Given a draft contest id, creates a Stripe PaymentIntent for that contest's
// price (read from the DB — never trusted from the client) and returns the
// client secret. The app confirms the card against this intent in the launch
// modal; confirm-launch then verifies + flips the contest live.
//
// Secrets (Supabase → Edge Functions → Secrets): STRIPE_SECRET_KEY.
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.
// Deploy WITHOUT --no-verify-jwt is fine (the app calls it with its anon key).
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { contestId } = await req.json();
    if (!contestId) return json({ error: 'Missing contestId.' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: contest, error } = await admin
      .from('contests')
      .select('id, price, paid, working_name, creator_id')
      .eq('id', contestId)
      .single();
    if (error || !contest) return json({ error: 'Contest not found.' }, 404);
    if (contest.paid) return json({ error: 'This contest is already paid.' }, 400);

    const amount = Math.round((contest.price || 0) * 100);
    if (amount < 50) return json({ error: 'Invalid contest price.' }, 400);

    // Creator email → Stripe receipt.
    let email: string | undefined;
    try {
      const { data: u } = await admin.auth.admin.getUserById(contest.creator_id);
      email = u.user?.email ?? undefined;
    } catch { /* receipt email is optional */ }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      httpClient: Stripe.createFetchHttpClient(),
    });
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { contestId },
      receipt_email: email,
      description: `NamingContest — ${contest.working_name || 'contest'} launch`,
    });

    return json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
