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
    if (contest.paid) return json({ ok: true, already: true });

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      httpClient: Stripe.createFetchHttpClient(),
    });
    // Expand the charge so we can link the buyer to Stripe's official receipt.
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] });
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

    // Send the branded launch receipt (best-effort — never fail the launch if
    // the email hiccups). Links to Stripe's official hosted receipt.
    // Declared out here so the response can tell the client whether the
    // receipt carried a working sign-in link, or whether it needs to send one.
    let signInUrl: string | null = null;
    let signInLinkError: string | null = null;
    try {
      const { data: u } = await admin.auth.admin.getUserById(contest.creator_id);
      const email = u.user?.email;
      const receiptUrl = (pi.latest_charge as { receipt_url?: string } | null)?.receipt_url || null;
      const apiKey = Deno.env.get('RESEND_API_KEY');
      if (email && apiKey) {
        const site = typeof origin === 'string' ? origin : 'https://namingcontest.com';
        const workingName = contest.working_name || 'your contest';
        // A guest has no session yet — they paid before having an account.
        // Rather than emailing a separate sign-in link, make THIS email's
        // button sign them in and land on their contest: one email, one
        // click. The token goes only to the address that just paid, which is
        // the same trust model as any magic-link email.
        //
        // (An old comment claimed server-generated links can't work because
        // they lack the browser's PKCE verifier. That assumed the PKCE flow;
        // supabase-js defaults to implicit, where the verify endpoint returns
        // the session in the URL and no verifier exists.)
        if (isGuest) {
          try {
            const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
              type: 'magiclink',
              email,
              options: { redirectTo: `${site}/v4/contest/${contestId}` },
            });
            // Surfaced rather than swallowed: the usual cause is redirectTo
            // not matching Supabase's Redirect URLs allow-list, which fails
            // silently and looks identical to the feature not working.
            if (linkErr) console.error('[confirm-launch] generateLink error:', linkErr.message);
            signInUrl = link?.properties?.action_link ?? null;
            signInLinkError = linkErr?.message ?? null;
          } catch (e) {
            signInLinkError = (e as Error)?.message ?? String(e);
            console.error('[confirm-launch] generateLink threw:', e);
          }
        }

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
          // Signs a guest in on the way. Falls back to the plain URL, which
          // lands on the sign-in prompt rather than a dead end.
          ctaUrl: signInUrl || `${site}/v4/contest/${contestId}`,
          note: signInUrl
            ? 'This button signs you in as well, so keep the email if you need to get back to your contest.'
            : undefined,
        });
        await sendEmail(apiKey, email, `Your contest is live — ${workingName}`, body);
      }
    } catch (mailErr) {
      console.error('[confirm-launch] receipt email failed:', (mailErr as Error)?.message);
    }

    return json({ ok: true, signInLinkSent: !!signInUrl, signInLinkError });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
