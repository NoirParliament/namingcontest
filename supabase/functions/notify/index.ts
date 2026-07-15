// Edge Function: notify
//
// Sends participant lifecycle emails. Called by a DB trigger (via pg_net) when
// a contest changes:
//   • status → 'voting'                    → "Voting's open" to all participants
//   • winner_submission_id null → set      → "We have a winner" to all — and the
//     winning submitter gets a personalized "Your name won 🏆" instead
//
// Robustness:
//   • Once-only: notified_voting_at / notified_winner_at are checked and
//     stamped BEFORE sending, so status flip-flops can't re-email anyone.
//   • Batch: emails go through Resend's /emails/batch (100 per call), so a
//     90-voter contest is 1 request, not 90.
//
// Auth: the trigger includes an x-notify-secret header matching NOTIFY_SECRET.
// Deploy WITH --no-verify-jwt (the DB calls it, not a logged-in user).
//
// Secrets: NOTIFY_SECRET (shared with the DB), RESEND_API_KEY. SITE_URL is the
// link base — set it to where the app actually runs (e.g. the Vercel URL, or
// http://localhost:5173 during development); namingcontest.com is email-only
// DNS until handoff.
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
const FROM = 'NamingContest <hello@namingcontest.com>';
const GRADIENT = 'linear-gradient(90deg,#fadecc,#fceebc,#a6dcb3,#c4dffb,#b3c4f0)';

function shell(inner: string) {
  return `<div style="margin:0;padding:32px 16px;background:#fcf9f7;font-family:Inter,-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#030302;">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid rgba(3,3,2,0.06);">
      <div style="height:6px;background:${GRADIENT};"></div>
      <div style="padding:32px;">${inner}</div>
    </div></div>`;
}
function footer() {
  return `<p style="font-size:13px;line-height:1.5;color:rgba(3,3,2,0.5);margin:24px 0 0;">
    You&rsquo;re getting this because you joined this contest.
    Questions? <a href="mailto:hello@namingcontest.com" style="color:rgba(3,3,2,0.6);">hello@namingcontest.com</a>.</p>`;
}
function cta(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;background:#030302;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 22px;border-radius:12px;">${label}</a>`;
}
function eyebrow(color: string) {
  return `<div style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${color};">NamingContest</div>`;
}
function votingOpenHtml(name: string, url: string) {
  return shell(`${eyebrow('#1f5430')}
    <h1 style="font-size:26px;line-height:1.2;margin:14px 0 6px;font-weight:700;">Voting&rsquo;s open 🗳️</h1>
    <p style="font-size:15px;line-height:1.55;color:rgba(3,3,2,0.7);margin:0 0 22px;">The names are in for &ldquo;<strong style="color:#030302;">${name}</strong>&rdquo;. Come pick your favorites &mdash; your votes help crown the winner.</p>
    ${cta(url, 'Vote now →')}${footer()}`);
}
function winnerHtml(name: string, winnerText: string, url: string) {
  return shell(`${eyebrow('#8a6a14')}
    <h1 style="font-size:26px;line-height:1.2;margin:14px 0 6px;font-weight:700;">We have a winner 🏆</h1>
    <p style="font-size:15px;line-height:1.55;color:rgba(3,3,2,0.7);margin:0 0 6px;">&ldquo;<strong style="color:#030302;">${name}</strong>&rdquo; has crowned its winning name:</p>
    <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:26px;font-weight:700;margin:6px 0 22px;">${winnerText}</div>
    ${cta(url, 'See the result →')}${footer()}`);
}
function youWonHtml(name: string, winnerText: string, url: string) {
  return shell(`${eyebrow('#8a6a14')}
    <h1 style="font-size:26px;line-height:1.2;margin:14px 0 6px;font-weight:700;">Your name won 🏆</h1>
    <p style="font-size:15px;line-height:1.55;color:rgba(3,3,2,0.7);margin:0 0 6px;">Your suggestion took the crown in &ldquo;<strong style="color:#030302;">${name}</strong>&rdquo;:</p>
    <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:26px;font-weight:700;margin:6px 0 22px;">${winnerText}</div>
    ${cta(url, 'See your win →')}${footer()}`);
}

// Resend batch endpoint — up to 100 messages per call.
async function sendBatch(apiKey: string, messages: { from: string; to: string; subject: string; html: string }[]) {
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
      .select('id, working_name, winner_submission_id, notified_voting_at, notified_winner_at')
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
    const joinUrl = `${SITE_URL}/v4/join/${contestId}`;
    let messages: { from: string; to: string; subject: string; html: string }[] = [];

    if (type === 'voting_open') {
      messages = emails.map((to) => ({
        from: FROM, to,
        subject: `Voting's open — ${name}`,
        html: votingOpenHtml(name, joinUrl),
      }));
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
      messages = emails
        .filter((to) => to !== winnerEmail)
        .map((to) => ({
          from: FROM, to,
          subject: `We have a winner — ${name}`,
          html: winnerHtml(name, winnerText, joinUrl),
        }));
      if (winnerEmail) {
        messages.push({
          from: FROM, to: winnerEmail,
          subject: `Your name won 🏆 — ${name}`,
          html: youWonHtml(name, winnerText, joinUrl),
        });
      }
    }

    await sendBatch(apiKey, messages);
    return json({ ok: true, sent: messages.length });
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500);
  }
});
