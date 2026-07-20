// Edge Function: notify
//
// Sends participant lifecycle emails. Called by a DB trigger (via pg_net) when
// a contest changes:
//   • status → 'voting'                    → "Your vote is needed" to all
//   • winner_submission_id null → set      → "We have a winner" to all — and the
//     winning submitter gets a personalized "Your name won" instead
//
// Robustness:
//   • Once-only: notified_voting_at / notified_winner_at are checked and
//     stamped BEFORE sending, so status flip-flops can't re-email anyone.
//   • Batch: emails go through Resend's /emails/batch (100 per call), so a
//     90-voter contest is 1 request, not 90.
//
// Design comes from _shared/email.ts — each message wears its contest's own
// segment colour, ships a plain-text alternative, and carries a single CTA.
//
// Auth: the trigger includes an x-notify-secret header matching NOTIFY_SECRET.
// Deploy WITH --no-verify-jwt (the DB calls it, not a logged-in user).
// Secrets: NOTIFY_SECRET, RESEND_API_KEY, SITE_URL (link base for the app).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildEmail, FROM } from '../_shared/email.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-notify-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

const SITE_URL = Deno.env.get('SITE_URL') || 'https://namingcontest.com';

type Message = { from: string; to: string; subject: string; html: string; text: string };

// Resend batch endpoint — up to 100 messages per call.
async function sendBatch(apiKey: string, messages: Message[]) {
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) console.error('[notify] resend batch error', res.status, await res.text());
  }
}

function formatDate(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    if (req.headers.get('x-notify-secret') !== Deno.env.get('NOTIFY_SECRET')) {
      return json({ error: 'unauthorized' }, 401);
    }
    const { contestId, type } = await req.json();
    if (!contestId || !type) return json({ error: 'Missing contestId or type.' }, 400);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: c } = await admin
      .from('contests')
      .select('id, working_name, sub_segment_id, sub_segment_title, winner_submission_id, voting_ends_at, notified_voting_at, notified_winner_at')
      .eq('id', contestId)
      .single();
    if (!c) return json({ error: 'Contest not found.' }, 404);

    // Once-only guard: stamp BEFORE sending so flip-flops can't re-email.
    if (type === 'voting_open') {
      if (c.notified_voting_at) return json({ ok: true, skipped: 'already notified' });
      await admin.from('contests').update({ notified_voting_at: new Date().toISOString() }).eq('id', contestId);
    } else if (type === 'winner') {
      if (c.notified_winner_at) return json({ ok: true, skipped: 'already notified' });
      await admin.from('contests').update({ notified_winner_at: new Date().toISOString() }).eq('id', contestId);
    } else {
      return json({ error: 'Unknown notification type.' }, 400);
    }

    const { data: emailRows } = await admin.rpc('contest_participant_emails', { cid: contestId });
    const emails = (emailRows as { email: string }[] | null || []).map((r) => r.email).filter(Boolean);
    if (!emails.length) return json({ ok: true, sent: 0 });

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'RESEND_API_KEY not set.' }, 500);

    const name = c.working_name || 'your contest';
    const eyebrow = c.sub_segment_title || 'Naming contest';
    const subId = c.sub_segment_id;
    const joinUrl = `${SITE_URL}/v4/join/${contestId}`;
    let messages: Message[] = [];

    if (type === 'voting_open') {
      // Concrete details read transactional (and are genuinely useful).
      const { count } = await admin
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .eq('contest_id', contestId);
      const closes = formatDate(c.voting_ends_at);
      const body = buildEmail({
        subId,
        eyebrow,
        headline: 'Your vote is needed',
        bodyHtml: `The names are in for <strong>${name}</strong>, and yours is one of the votes that picks the winner. It only takes a minute.`,
        bodyText: `The names are in for ${name}, and yours is one of the votes that picks the winner. It only takes a minute.`,
        panel: count ? { label: 'Ready to review', value: `${count} ${count === 1 ? 'name' : 'names'} to choose from` } : undefined,
        ctaLabel: 'Cast your vote',
        ctaUrl: joinUrl,
        note: closes ? `Voting closes ${closes}.` : undefined,
      });
      messages = emails.map((to) => ({ from: FROM, to, subject: `Your vote is needed — ${name}`, ...body }));
    } else {
      // Winner: personalize the winning submitter's email; everyone else gets
      // the announcement.
      let winnerText = 'the winner';
      let winnerEmail: string | null = null;
      if (c.winner_submission_id) {
        const { data: w } = await admin.from('submissions').select('text, user_id').eq('id', c.winner_submission_id).single();
        winnerText = w?.text || winnerText;
        if (w?.user_id) {
          try {
            const { data: wu } = await admin.auth.admin.getUserById(w.user_id);
            winnerEmail = wu.user?.email ?? null;
          } catch { /* fall back to generic for everyone */ }
        }
      }

      const announce = buildEmail({
        subId,
        eyebrow,
        headline: 'We have a winner',
        bodyHtml: `<strong>${name}</strong> has crowned its winning name:`,
        bodyText: `${name} has crowned its winning name:`,
        feature: winnerText,
        ctaLabel: 'See the result',
        ctaUrl: joinUrl,
      });
      messages = emails
        .filter((to) => to !== winnerEmail)
        .map((to) => ({ from: FROM, to, subject: `The winning name — ${name}`, ...announce }));

      if (winnerEmail) {
        const won = buildEmail({
          subId,
          eyebrow,
          headline: 'Your name won',
          bodyHtml: `Your suggestion took the crown in <strong>${name}</strong>:`,
          bodyText: `Your suggestion took the crown in ${name}:`,
          feature: winnerText,
          ctaLabel: 'See your win',
          ctaUrl: joinUrl,
        });
        messages.push({ from: FROM, to: winnerEmail, subject: `Your name won — ${name}`, ...won });
      }
    }

    await sendBatch(apiKey, messages);
    return json({ ok: true, sent: messages.length });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
