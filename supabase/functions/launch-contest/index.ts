// Edge Function: launch-contest
//
// Called at launch when the creator is NOT logged in. Using the service_role
// key (server-only), it:
//   1. creates-or-finds the account for the email, and
//   2. creates the contest under that account as an UNPAID DRAFT.
//
// The contest only goes live after payment: the app creates a PaymentIntent
// (create-payment-intent), confirms the card, and confirm-launch flips the
// draft to live. The APP sends the login magic link (signInWithOtp) so it
// carries the browser's PKCE verifier. SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
// are injected automatically.
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

    // Find-or-create the user WITHOUT minting a magic link. (Generating a link
    // here stamps a "link sent" time on the user, which made the app's real
    // signInWithOtp seconds later trip Supabase's per-email 60s cooldown on a
    // single launch.) Look up the id first; create the account if it's new.
    let userId: string | undefined;
    const { data: existingId } = await admin.rpc('auth_user_id_by_email', { p_email: email });
    if (existingId) {
      userId = existingId as string;
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true, // magic-link account, no password
      });
      if (createErr) throw createErr;
      userId = created.user.id;
    }
    if (!userId) throw new Error('Could not resolve a user for this email.');

    // Create the contest under that user as an UNPAID DRAFT (service_role
    // bypasses RLS). confirm-launch flips it live once payment succeeds — so
    // force draft/unpaid here regardless of what the client sent.
    const { data: created, error: insErr } = await admin
      .from('contests')
      .insert({ creator_id: userId, ...row, status: 'draft', paid: false })
      .select('id')
      .single();
    if (insErr) throw insErr;

    // NOTE: the login email is sent by the APP (supabase.auth.signInWithOtp)
    // right after this returns — not here — because a link generated
    // server-side (admin.generateLink) doesn't carry the browser's PKCE
    // verifier, so clicking it wouldn't actually establish the session.
    // Here we only needed generateLink to create-or-find the user id.
    return json({ ok: true, contestId: created.id, userId });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
