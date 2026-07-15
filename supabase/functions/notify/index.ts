// Edge Function: notify
//
// Sends participant lifecycle emails. Called by a DB trigger (via pg_net) when
// a contest changes:
//   • status → 'voting'                    → "Voting's open" to all participants
//   • winner_submission_id null → set      → "We have a winner" to all
//
// Auth: the trigger includes an x-notify-secret header matching NOTIFY_SECRET.
// Deploy WITH --no-verify-jwt (the DB calls it, not a logged-in user).
//
// Secrets: NOTIFY_SECRET (shared with the DB), RESEND_API_KEY. Optional:
// SITE_URL (link base for the emails, defaults to the marketing domain).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-notify-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

const SITE_URL = Deno.env.get('SITE_URL') || 'https://namingcontest.com';
const GRADIENT = 'linear-gradient(90deg,#fadecc,#fceebc,#a6dcb3,#c4dffb,#b3c4f0)';

function shell(inner: string) {
  return `<div style="margin:0;padding:32px 16px;background:#fcf9f7;font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#030302;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid rgba(3,3,2,0.06);">
      <div style="height:6px;background:${GRADIENT};"></div>
      <div style="padding:32px;">${inner}</div>
    </div></div>`;
}
function footer() {
  return `<p style="font-size:13px;line-height:1.5;color:rgba(3,3,2,0.5);margin:24px 0 0;">Questions? Reach us at <a href="mailto:hello@namingcontest.com" style="color:rgba(3,3,2,0.6);">hello@namingcontest.com</a>.</p>`;
}
function cta(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;background:#030302;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 22px;border-radius:12px;">${label}</a>`;
}
function votingOpenHtml(name: string, url: string) {
  return shell(`
    <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#1f5430;">NamingContest</div>
    <h1 style="font-size:26px;line-height:1.2;margin:14px 0 6px;font-weight:700;">Voting&rsquo;s open 🗳️</h1>
    <p style="font-size:15px;line-height:1.55;color:rgba(3,3,2,0.7);margin:0 0 22px;">The names are in for &ldquo;<strong style="color:#030302;">${name}</strong>&rdquo;. Come pick your favorites &mdash; your votes help crown the winner.</p>
    ${cta(url, 'Vote now →')}
    ${footer()}`);
}
function winnerHtml(name: string, winnerText: string, url: string) {
  return shell(`
    <div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8a6a14;">NamingContest</div>
    <h1 style="font-size:26px;line-height:1.2;margin:14px 0 6px;font-weight:700;">We have a winner 🏆</h1>
    <p style="font-size:15px;line-height:1.55;color:rgba(3,3,2,0.7);margin:0 0 6px;">&ldquo;<strong style="color:#030302;">${name}</strong>&rdquo; has crowned its winning name:</p>
    <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:26px;font-weight:700;margin:6px 0 22px;">${winnerText}</div>
    ${cta(url, 'See the result →')}
    ${footer()}`);
}

async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'NamingContest <hello@namingcontest.com>', to, subject, html }),
  });
  if (!res.ok) console.error('[notify] resend error', res.status, await res.text());
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
      .select('id, working_name, winner_submission_id')
      .eq('id', contestId)
      .single();
    if (!c) return json({ error: 'Contest not found.' }, 404);

    const { data: emailRows } = await admin.rpc('contest_participant_emails', { cid: contestId });
    const emails = (emailRows as { email: string }[] | null || []).map((r) => r.email).filter(Boolean);
    if (!emails.length) return json({ ok: true, sent: 0 });

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ error: 'RESEND_API_KEY not set.' }, 500);

    const name = c.working_name || 'your contest';
    const joinUrl = `${SITE_URL}/v4/join/${contestId}`;
    let subject: string, html: string;

    if (type === 'voting_open') {
      subject = `Voting's open — ${name}`;
      html = votingOpenHtml(name, joinUrl);
    } else if (type === 'winner') {
      let winnerText = 'the winner';
      if (c.winner_submission_id) {
        const { data: w } = await admin.from('submissions').select('text').eq('id', c.winner_submission_id).single();
        winnerText = w?.text || winnerText;
      }
      subject = `We have a winner — ${name}`;
      html = winnerHtml(name, winnerText, joinUrl);
    } else {
      return json({ error: 'Unknown notification type.' }, 400);
    }

    // Small participant lists — send sequentially (best-effort per recipient).
    for (const to of emails) { await sendEmail(apiKey, to, subject, html); }
    return json({ ok: true, sent: emails.length });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
