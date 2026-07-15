-- ============================================================================
-- Participant lifecycle notifications. When a contest flips to 'voting' (by the
-- cron) or gets a winner crowned (creator picks one), a DB trigger calls the
-- `notify` Edge Function over HTTP (pg_net), which emails every participant.
--
-- Setup the operator must do once (see handoff notes):
--   1. alter database postgres set app.notify_secret = '<a random string>';
--   2. set the same value as the notify function's NOTIFY_SECRET secret;
--   3. deploy the `notify` function (with --no-verify-jwt).
-- The trigger passes app.notify_secret as an x-notify-secret header; the
-- function checks it, so nothing but our DB can trigger sends.
-- ============================================================================
create extension if not exists pg_net;

-- Emails of everyone who joined a contest (participants → auth.users).
create or replace function public.contest_participant_emails(cid uuid)
returns table (email text)
language sql
security definer
stable
set search_path = auth, public
as $emails$
  select u.email
  from participants p
  join auth.users u on u.id = p.user_id
  where p.contest_id = cid and u.email is not null;
$emails$;
revoke all on function public.contest_participant_emails(uuid) from public, anon, authenticated;
grant execute on function public.contest_participant_emails(uuid) to service_role;

-- Fire the notify function on the two lifecycle transitions.
create or replace function public.notify_contest_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_secret text := current_setting('app.notify_secret', true);
  v_url text := 'https://kgcggyuoezaygyawnlcs.supabase.co/functions/v1/notify';
  v_headers jsonb;
begin
  if v_secret is null or v_secret = '' then
    return new; -- not configured yet; do nothing
  end if;
  v_headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', v_secret);

  if new.status = 'voting' and (old.status is distinct from 'voting') then
    perform net.http_post(
      url := v_url,
      body := jsonb_build_object('contestId', new.id, 'type', 'voting_open'),
      headers := v_headers
    );
  end if;

  if new.winner_submission_id is not null and old.winner_submission_id is null then
    perform net.http_post(
      url := v_url,
      body := jsonb_build_object('contestId', new.id, 'type', 'winner'),
      headers := v_headers
    );
  end if;

  return new;
end;
$fn$;

drop trigger if exists contest_change_notify on contests;
create trigger contest_change_notify
  after update on contests
  for each row execute function public.notify_contest_change();
