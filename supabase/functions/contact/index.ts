// Edge Function: contact
//
// Delivers the /contact form to the team inbox, and sends the visitor a
// receipt so they know it landed.
//
// Two things worth knowing about how mail works here:
//
//   • We CANNOT send "from" the visitor's address — SPF/DKIM are published for
//     namingcontest.com, so mail claiming to be from their domain would fail
//     authentication and land in spam (or be rejected). Instead we send from
//     our own noreply@ and set reply_to to their address, which is what makes
//     "Reply" in the team inbox go straight back to them.
//
//   • This is the one surface where a reply is the whole point, so the team
//     copy carries a mailto CTA rather than the app links every other email
//     uses.
//
// Auth: public — visitors aren't signed in. Deploy WITH --no-verify-jwt.
// Secrets: RESEND_API_KEY, CONTACT_TO (defaults to hello@namingcontest.com).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildEmail, esc, FROM } from '../_shared/email.ts';
import { rateLimitOk } from '../_shared/rateLimit.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

const TO = Deno.env.get('CONTACT_TO') || 'hello@namingcontest.com';

// Field caps. A public endpoint that sends mail is abusable, so nothing
// unbounded reaches Resend — and an oversized body is a bot, not a customer.
const LIMITS: Record<string, number> = {
  name: 120, company: 160, topic: 60, email: 254, message: 5000,
};


async function send(apiKey: string, payload: Record<string, unknown>) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json().catch(() => null);
    if (!body) return json({ error: 'Invalid request.' }, 400);

    const field = (k: string) => String(body[k] ?? '').trim();
    const name = field('name');
    const company = field('company');
    const topic = field('topic');
    const message = field('message');
    const email = field('email');

    if (!name || !message || !email) return json({ error: 'Missing required fields.' }, 400);
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Invalid email address.' }, 400);
    for (const [k, max] of Object.entries(LIMITS)) {
      if (field(k).length > max) return json({ error: `${k} is too long.` }, 400);
    }

    // Throttle before sending anything. Public, unauthenticated, and two
    // emails per call — a loop here burns the Resend quota and risks the
    // sending domain's reputation, which costs far more than the messages.
    // Ten an hour is well clear of anyone with a genuine follow-up, and a
    // whole office behind one IP still fits.
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    if (!await rateLimitOk(admin, req, 'contact', 10, '1 hour')) {
      return json({ error: 'You have sent several messages already — please give it an hour, or email us directly at hello@namingcontest.com.' }, 429);
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'RESEND_API_KEY not set.' }, 500);

    const firstName = name.split(/\s+/)[0];
    const mailto = `mailto:${email}?subject=${encodeURIComponent(`Re: your message to NamingContest`)}`;
    // Preserve the visitor's line breaks — a pasted brief loses its shape
    // otherwise, and this is the one email a human reads closely.
    const messageHtml = esc(message).replace(/\n/g, '<br />');

    // ── 1. The team's copy ────────────────────────────────────────────────
    const forTeam = buildEmail({
      eyebrow: topic || 'Contact form',
      headline: `${name} got in touch`,
      bodyHtml: messageHtml,
      bodyText: message,
      panel: {
        label: company || 'Sender',
        value: name,
        link: { label: email, url: mailto },
      },
      ctaLabel: `Reply to ${firstName}`,
      ctaUrl: mailto,
    });
    await send(apiKey, {
      from: FROM,
      to: TO,
      reply_to: email,
      subject: `Contact form — ${topic || 'General'} — ${name}`,
      html: forTeam.html,
      text: forTeam.text,
    });

    // ── 2. The visitor's receipt ──────────────────────────────────────────
    // Sent second and deliberately not awaited into the failure path: if the
    // team copy landed, the form succeeded from the user's point of view, and
    // a bounced receipt shouldn't tell them their message was lost.
    try {
      const forVisitor = buildEmail({
        eyebrow: 'Contact',
        headline: 'We got your message',
        bodyHtml: `Thanks for reaching out, ${esc(firstName)} — a real person reads every one of these and we'll get back to you shortly. Here's what you sent:`,
        bodyText: `Thanks for reaching out, ${firstName} — a real person reads every one of these and we'll get back to you shortly. Here's what you sent:`,
        panel: { label: topic || 'Your message', value: message.length > 180 ? `${message.slice(0, 180)}…` : message },
        ctaLabel: 'Back to NamingContest',
        ctaUrl: 'https://namingcontest.com',
      });
      await send(apiKey, {
        from: FROM,
        to: email,
        reply_to: TO,
        subject: 'We got your message — NamingContest',
        html: forVisitor.html,
        text: forVisitor.text,
      });
    } catch (e) {
      console.error('[contact] receipt failed (team copy already sent):', e);
    }

    return json({ ok: true });
  } catch (e) {
    console.error('[contact] failed:', e);
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
