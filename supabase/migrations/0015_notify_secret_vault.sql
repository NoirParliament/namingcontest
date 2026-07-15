-- ============================================================================
-- Store the notify shared secret in Supabase Vault instead of a database GUC
-- (`alter database ... set` is not permitted to the dashboard role — 42501).
-- The trigger (SECURITY DEFINER, owner postgres) reads the decrypted secret
-- from vault. Also hardened: the whole body is wrapped so ANY notification
-- failure (vault missing, pg_net error) can never block the contest update
-- itself — worst case we just log and skip the email.
--
-- Operator setup (SQL editor, run once):
--   select vault.create_secret('<random string>', 'notify_secret');
-- ...and set the SAME string as the notify function's NOTIFY_SECRET secret.
-- ============================================================================
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
