// Edge Function: launch-contest
//
// Called at launch when the creator is NOT logged in. Using the service_role
// key (server-only), it:
//   1. creates-or-finds the account for the email, and
//   2. creates the contest under that account as an UNPAID DRAFT.
//
// The contest only goes live after payment: the app creates a PaymentIntent
// (create-payment-intent), confirms the card, and confirm-launch flips the
// draft to live. confirm-launch now puts a sign-in link in the receipt itself
// for guests, so the app only sends a separate magic link if that failed.
// (An earlier comment here claimed server-generated links can't work without
// the browser's PKCE verifier. That assumed the PKCE flow; supabase-js
// defaults to implicit, where no verifier exists. It was wrong.)
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { rateLimitOk } from '../_shared/rateLimit.ts';

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
    const { email, row, redirectTo, identity } = await req.json();
    if (!email || !row) return json({ error: 'Missing email or contest data.' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Unauthenticated and it creates an auth user, so a loop here fills
    // auth.users with addresses nobody asked to sign up — and each one can
    // trigger a magic-link email from our domain.
    //
    // Two checks. The IP one is what actually stops a loop: keying on email
    // as well would hand a fresh allowance to anyone who simply varies the
    // address, which is the whole attack. The per-email one is narrower — it
    // stops one address being hammered with sign-up mail from several
    // sources.
    //
    // Limits are deliberately loose. They exist to stop a script making
    // thousands of accounts, and anything in that league blows past these
    // instantly. Set tight they punish the honest instead: a whole office
    // shares one IP, a retried card counts as another attempt, and testing a
    // contest end to end burns several. The first version used 5 and 3, which
    // locked our own client out mid-test.
    if (!await rateLimitOk(admin, req, 'launch-ip', 30, '1 hour')) {
      return json({ error: 'Too many launch attempts from here. Please try again in an hour.' }, 429);
    }
    if (!await rateLimitOk(admin, req, 'launch-email', 15, '1 hour', email)) {
      return json({ error: 'Too many launch attempts for this email. Please try again in an hour.' }, 429);
    }

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

    // Apply the creator's chosen identity to their brand-new profile. Only for
    // freshly created accounts (never overwrite a returning user who is just
    // launching another contest). The guest had no session during the brief,
    // so their name rode in `identity.displayName` and their photo as a
    // compact base64 avatar in `identity.avatarData` — uploaded here with the
    // service role, since only now does the account (and its storage folder)
    // exist.
    if (!existingId && identity && typeof identity === 'object') {
      const patch: Record<string, unknown> = {};
      if (identity.displayName) patch.display_name = String(identity.displayName).slice(0, 80);
      if (typeof identity.avatarData === 'string' && identity.avatarData.startsWith('data:image/')) {
        try {
          const comma = identity.avatarData.indexOf(',');
          const meta = identity.avatarData.slice(5, comma); // e.g. "image/jpeg;base64"
          const contentType = meta.split(';')[0] || 'image/jpeg';
          const ext = contentType.includes('png') ? 'png' : 'jpg';
          const b64 = identity.avatarData.slice(comma + 1);
          const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          // Cap at ~1.5 MB decoded so a hostile payload can't be abused.
          if (bytes.length <= 1_500_000) {
            const path = `${userId}/avatar/${Date.now()}.${ext}`;
            const { error: upErr } = await admin.storage.from('uploads').upload(path, bytes, {
              contentType, upsert: true,
            });
            if (!upErr) {
              const { data: pub } = admin.storage.from('uploads').getPublicUrl(path);
              if (pub?.publicUrl) patch.avatar_url = pub.publicUrl;
            }
          }
        } catch (_e) {
          // A bad image must never block the launch — the name still applies.
        }
      }
      if (Object.keys(patch).length) {
        // The signup trigger has already created the profiles row.
        await admin.from('profiles').update(patch).eq('id', userId);
      }
    }

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
