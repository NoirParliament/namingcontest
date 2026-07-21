// Edge Function: stripe-webhook
//
// Closes the one gap in the payment flow. Normally the browser confirms the
// card and then calls confirm-launch, which verifies the PaymentIntent with
// Stripe and flips the contest live. But there is roughly a second between
// those two steps, and if the tab closes, the browser crashes, or the network
// drops in that window, Stripe has taken the money and the contest never goes
// live: customer charged, nothing delivered.
//
// Stripe retries webhooks for up to three days independently of any browser,
// so this completes those payments on its own.
//
// DELIBERATELY ADDITIVE. It does not reimplement going live — it calls
// confirm-launch, the same function the browser calls, with the same payload.
// Nothing in the existing payment or receipt path is modified, so the worst
// this function can do by failing is leave things exactly as they are today.
// confirm-launch is already idempotent (it returns early when contests.paid
// is true), so whichever of the two arrives second does nothing and no
// duplicate receipt is sent.
//
// Auth: Stripe is not a logged-in user. Deploy WITH --no-verify-jwt; the
// signature check below is what authenticates the caller.
// Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL,
//          SUPABASE_SERVICE_ROLE_KEY.
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  // No CORS block: browsers never call this, only Stripe's servers do.
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const signature = req.headers.get('stripe-signature');
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!signature || !secret) {
    console.error('[stripe-webhook] missing signature or STRIPE_WEBHOOK_SECRET');
    return json({ error: 'Not configured.' }, 400);
  }

  // The raw body is required — parsing it first would change the bytes the
  // signature was computed over and every event would be rejected.
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    // Async variant: the sync one uses Node crypto, which Deno lacks.
    event = await stripe.webhooks.constructEventAsync(raw, signature, secret);
  } catch (e) {
    // An unverified caller is either misconfigured or hostile. Either way it
    // gets nothing: no work is done and no detail is returned.
    console.error('[stripe-webhook] signature verification failed:', (e as Error).message);
    return json({ error: 'Invalid signature.' }, 400);
  }

  if (event.type !== 'payment_intent.succeeded') {
    // Acknowledge anything else so Stripe stops retrying it.
    return json({ ok: true, ignored: event.type });
  }

  const pi = event.data.object as Stripe.PaymentIntent;
  const contestId = pi.metadata?.contestId;
  if (!contestId) {
    console.error('[stripe-webhook] payment_intent has no contestId metadata:', pi.id);
    return json({ ok: true, skipped: 'no contestId' });
  }

  // Hand off to the existing, already-verified path rather than duplicating
  // it. confirm-launch re-fetches the PaymentIntent from Stripe and re-checks
  // status, contest and amount, so this call grants nothing on its own — it
  // only triggers the same work the browser would have done.
  try {
    const res = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/confirm-launch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Service role, because confirm-launch verifies its JWT and no user
        // session exists here.
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        contestId,
        paymentIntentId: pi.id,
        origin: Deno.env.get('SITE_URL') || 'https://namingcontest.com',
      }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      // 500 tells Stripe to retry — worth doing for a transient failure.
      console.error('[stripe-webhook] confirm-launch failed', res.status, body);
      return json({ error: 'confirm-launch failed', status: res.status }, 500);
    }

    // `already: true` means the browser got there first. That is the normal,
    // healthy case for most payments.
    console.log('[stripe-webhook] completed', contestId, JSON.stringify(body));
    return json({ ok: true, contestId, ...body });
  } catch (e) {
    console.error('[stripe-webhook] threw:', e);
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
