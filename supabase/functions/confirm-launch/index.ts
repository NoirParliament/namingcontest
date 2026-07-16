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
    const { contestId, paymentIntentId, origin } = await req.json();
    if (!contestId || !paymentIntentId) return json({ error: 'Missing contestId or paymentIntentId.' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: contest, error } = await admin
      .from('contests')
      .select('id, price, settings, paid, status, working_name, voter_tier, creator_id')
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
    try {
      const { data: u } = await admin.auth.admin.getUserById(contest.creator_id);
      const email = u.user?.email;
      const receiptUrl = (pi.latest_charge as { receipt_url?: string } | null)?.receipt_url || null;
      if (email) {
        await sendLaunchReceipt({
          email,
          workingName: contest.working_name || 'your contest',
          amount: pi.amount,
          voterTier: contest.voter_tier,
          contestId,
          receiptUrl,
          origin: typeof origin === 'string' ? origin : 'https://namingcontest.com',
        });
      }
    } catch (mailErr) {
      console.error('[confirm-launch] receipt email failed:', (mailErr as Error)?.message);
    }

    return json({ ok: true });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});

// Branded "your contest is live" + receipt email, sent via the Resend API.
async function sendLaunchReceipt(opts: {
  email: string; workingName: string; amount: number; voterTier: number | null;
  contestId: string; receiptUrl: string | null; origin: string;
}) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) { console.warn('[confirm-launch] RESEND_API_KEY not set — skipping receipt email'); return; }
  const dollars = (opts.amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const manageUrl = `${opts.origin}/v4/contest/${opts.contestId}`;
  const voterLine = opts.voterTier ? ` · up to ${opts.voterTier} voters` : '';
  const receiptBtn = opts.receiptUrl
    ? `<a href="${opts.receiptUrl}" style="color:#8a5a2b;text-decoration:underline;font-weight:600;">View your receipt →</a>`
    : '';

  const html = `
  <div style="margin:0;padding:32px 16px;background:#fcf9f7;font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#030302;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid rgba(3,3,2,0.06);">
      <div style="height:6px;background:linear-gradient(90deg,#fadecc,#fceebc,#a6dcb3,#c4dffb,#b3c4f0);"></div>
      <div style="padding:32px 32px 28px;">
        <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#9c4818;">NamingContest</div>
        <h1 style="font-size:26px;line-height:1.2;margin:14px 0 6px;font-weight:700;">Your contest is live 🎉</h1>
        <p style="font-size:15px;line-height:1.55;color:rgba(3,3,2,0.7);margin:0 0 22px;">
          “<strong style="color:#030302;">${opts.workingName}</strong>” is now collecting names. Share your invite link and the entries will start rolling in.
        </p>
        <div style="background:#fcf9f7;border:1px solid rgba(3,3,2,0.08);border-radius:14px;padding:16px 18px;margin:0 0 24px;">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:rgba(3,3,2,0.5);">Payment</div>
          <div style="font-size:18px;font-weight:700;margin-top:4px;">${dollars} paid${voterLine}</div>
          ${receiptBtn ? `<div style="margin-top:8px;font-size:14px;">${receiptBtn}</div>` : ''}
        </div>
        <a href="${manageUrl}" style="display:inline-block;background:#030302;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 22px;border-radius:12px;">Go to your contest →</a>
        <p style="font-size:13px;line-height:1.5;color:rgba(3,3,2,0.5);margin:24px 0 0;">
          Questions? Just reply, or reach us at
          <a href="mailto:hello@namingcontest.com" style="color:rgba(3,3,2,0.6);">hello@namingcontest.com</a>.
        </p>
      </div>
    </div>
  </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'NamingContest <hello@namingcontest.com>',
      to: opts.email,
      subject: `Your contest is live 🎉 — ${opts.workingName}`,
      html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
