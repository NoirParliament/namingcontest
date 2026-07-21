-- Tell the creator when voting closes and a winner is waiting to be picked.
--
-- THE GAP THIS FILLS
-- The lifecycle emailed participants at both ends — "your vote is needed" when
-- voting opened, "the winning name" when one was crowned — but nobody was told
-- about the moment in between. The cron closes voting on its deadline and the
-- contest then sits there until the creator happens to visit the site. Every
-- participant is waiting on a result that will not arrive, and their last
-- email asked them to vote, so from their side the contest simply goes quiet.
--
-- Creator only. Emailing participants "voting has closed, please wait" would
-- be worse than silence: it asks for nothing and answers nothing.
--
-- Mirrors the two existing notifications exactly: a third branch in the same
-- trigger, its own dedupe stamp, the same wrapped-in-exception body so a
-- notification failure can never block the contest update itself.

alter table contests
  add column if not exists notified_closed_at timestamptz;

-- Creator's email, for the service role only. contest_participant_emails
-- (0013) deliberately excludes the creator, who is not a participant, so this
-- is the counterpart to it rather than a variation.
create or replace function public.contest_creator_email(cid uuid)
returns text
language sql
security definer
stable
set search_path = auth, public
as $email$
  select u.email
  from contests c
  join auth.users u on u.id = c.creator_id
  where c.id = cid;
$email$;
revoke all on function public.contest_creator_email(uuid) from public, anon, authenticated;
grant execute on function public.contest_creator_email(uuid) to service_role;

create or replace function public.notify_contest_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_secret text;
  v_url text := 'https://kgcggyuoezaygyawnlcs.supabase.co/functions/v1/notify';
  v_headers jsonb;
begin
  begin
    select decrypted_secret into v_secret
    from vault.decrypted_secrets
    where name = 'notify_secret'
    limit 1;

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

    -- Voting finished with nobody crowned yet. The winner_submission_id check
    -- matters: a creator who picks the winner manually before the deadline
    -- closes the contest too, and they plainly do not need telling to do the
    -- thing they have just done.
    if new.status = 'closed'
       and (old.status is distinct from 'closed')
       and new.winner_submission_id is null then
      perform net.http_post(
        url := v_url,
        body := jsonb_build_object('contestId', new.id, 'type', 'voting_closed'),
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
  exception when others then
    -- Never let a notification problem break the contest update itself.
    raise warning 'notify_contest_change failed: %', sqlerrm;
  end;
  return new;
end;
$fn$;

drop trigger if exists contest_change_notify on contests;
create trigger contest_change_notify
  after update on contests
  for each row execute function public.notify_contest_change();
