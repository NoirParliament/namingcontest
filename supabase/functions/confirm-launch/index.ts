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
import { buildEmail, sendEmail } from '../_shared/email.ts';

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
    const { contestId, paymentIntentId, origin, isGuest } = await req.json();
    if (!contestId || !paymentIntentId) return json({ error: 'Missing contestId or paymentIntentId.' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: contest, error } = await admin
      .from('contests')
      .select('id, price, settings, paid, status, working_name, voter_tier, creator_id, sub_segment_id, sub_segment_title')
      .eq('id', contestId)
      .single();
    if (error || !contest) return json({ error: 'Contest not found.' }, 404);
    // NOT an early return: the Stripe webhook also drives confirm-launch and
    // usually wins the race against the paying browser (which holds a
    // celebration beat before calling). The second, already-paid call must
    // still reach the sign-in token minting below — bailing here left the
    // paying guest with no session. Only the live-flip + receipt email are
    // first-call-only; the Stripe verification below runs for every caller.
    const alreadyPaid = !!contest.paid;

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      httpClient: Stripe.createFetchHttpClient(),
    });
    // Expand the charge so we can link the buyer to Stripe's official receipt.
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] });
    if (pi.status !== 'succeeded') return json({ error: 'Payment not completed.' }, 402);
    if (pi.metadata?.contestId !== contestId) return json({ error: 'Payment does not match this contest.' }, 400);
    if (pi.amount !== Math.round((contest.price || 0) * 100)) return json({ error: 'Paid amount does not match the price.' }, 400);

    if (!alreadyPaid) {
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
    }

    // Resolve the payer's email once — used by the instant sign-in below and
    // by the receipt email.
    const { data: payer } = await admin.auth.admin.getUserById(contest.creator_id);
    const email = payer.user?.email ?? null;

    // Instant sign-in for guests: their account was created server-side at
    // launch, so this browser has no session. Mint a one-time token and hand
    // it back over this same HTTPS response — the app redeems it with
    // supabase.auth.verifyOtp({ token_hash }), which needs no emailed link,
    // no redirect allow-list, and no PKCE verifier. Single-use, short-lived,
    // and returned only to the caller that just completed this contest's
    // payment. If minting fails, the app falls back to sign-in on demand.
    let authTokenHash: string | null = null;
    if (isGuest && email) {
      try {
        const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
          type: 'magiclink',
          email,
        });
        if (linkErr) console.error('[confirm-launch] generateLink error:', linkErr.message);
        authTokenHash = link?.properties?.hashed_token ?? null;
      } catch (e) {
        console.error('[confirm-launch] generateLink threw:', e);
      }
    }

    // Send the branded launch receipt (best-effort — never fail the launch if
    // the email hiccups). Links to Stripe's official hosted receipt. This is
    // the ONLY email a launch sends: sign-in happens in-browser via the token
    // above, so there is no separate login email. First-call-only, so the
    // webhook/browser race can't send it twice.
    try {
      const receiptUrl = (pi.latest_charge as { receipt_url?: string } | null)?.receipt_url || null;
      const apiKey = Deno.env.get('RESEND_API_KEY');
      if (!alreadyPaid && email && apiKey) {
        const site = typeof origin === 'string' ? origin : 'https://namingcontest.com';
        const workingName = contest.working_name || 'your contest';
        const dollars = (pi.amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const voterLine = contest.voter_tier ? ` · up to ${contest.voter_tier} voters` : '';
        const body = buildEmail({
          subId: contest.sub_segment_id,
          eyebrow: contest.sub_segment_title || 'Naming contest',
          headline: `${workingName} is live`,
          bodyHtml: 'Your contest is now collecting names. Share the invite link and the entries will start rolling in.',
          bodyText: 'Your contest is now collecting names. Share the invite link and the entries will start rolling in.',
          panel: {
            label: 'Payment',
            value: `${dollars} paid${voterLine}`,
            link: receiptUrl ? { label: 'View your receipt', url: receiptUrl } : undefined,
          },
          ctaLabel: 'Go to your contest',
          // Opens the contest. In the launch browser the creator is already
          // signed in; on any other device this prompts a sign-in with the
          // same email, which the note explains.
          ctaUrl: `${site}/v4/contest/${contestId}`,
          note: isGuest
            ? 'Opening this on another device? Sign in there with this same email address.'
            : undefined,
        });
        await sendEmail(apiKey, email, `Your contest is live — ${workingName}`, body);
      }
    } catch (mailErr) {
      console.error('[confirm-launch] receipt email failed:', (mailErr as Error)?.message);
    }

    return json({ ok: true, already: alreadyPaid, authTokenHash, authEmail: authTokenHash ? email : null });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
