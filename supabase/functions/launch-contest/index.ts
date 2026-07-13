// Edge Function: launch-contest
//
// Called at checkout when the creator is NOT logged in. Using the service_role
// key (server-only), it:
//   1. creates-or-finds the account for the paid email,
//   2. creates the contest under that account (live), and
//   3. emails a magic link ("your contest is live — log in to manage it").
//
// This is also the hook Stripe's webhook will call in Phase 4 (payment
// confirmed → launch the contest). Deploy via the Supabase dashboard and set
// the RESEND_API_KEY secret. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are
// injected automatically.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { email, row, redirectTo } = await req.json();
    if (!email || !row) return json({ error: 'Missing email or contest data.' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Create-or-find the user by email and get a magic link in one call.
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: redirectTo ? { redirectTo } : undefined,
    });
    if (linkErr) throw linkErr;
    const userId = link.user.id;

    // Create the contest under that user (service_role bypasses RLS).
    const { data: created, error: insErr } = await admin
      .from('contests')
      .insert({ creator_id: userId, ...row })
      .select('id')
      .single();
    if (insErr) throw insErr;

    // Email the "your contest is live" magic link via Resend.
    const RESEND = Deno.env.get('RESEND_API_KEY');
    if (RESEND) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'NamingContest <onboarding@resend.dev>',
          to: [email],
          subject: 'Your naming contest is live 🎉',
          html:
            `<p>Your contest <strong>${row.working_name ?? 'is'}</strong> is live and collecting names.</p>` +
            `<p><a href="${link.properties.action_link}">Log in to manage it →</a></p>`,
        }),
      });
    }

    return json({ ok: true, contestId: created.id });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
