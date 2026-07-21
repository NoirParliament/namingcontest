-- Rate limiting for the two public endpoints that do expensive things.
--
-- /contact sends two emails per call and needs no account. launch-contest
-- creates an auth user and needs no account either. Both were unthrottled, so
-- a loop could burn the Resend quota, get the sending domain flagged, or fill
-- auth.users with addresses nobody asked to sign up.
--
-- Callers are edge functions using the service role, so this table is not
-- reachable from the browser and needs no RLS policy of its own — RLS is
-- enabled anyway, which denies everything by default and makes that explicit
-- rather than accidental.
--
-- PRIVACY: the bucket key holds a HASH of the client IP, never the address.
-- The hash is salted with the current date (see hashBucket in the functions),
-- so it can't be used to follow someone across days, and the raw address is
-- never written down. That keeps this out of scope for the privacy policy,
-- which makes no claim about collecting IPs.

create table if not exists rate_limit_hits (
  id         bigserial primary key,
  bucket     text        not null,
  created_at timestamptz not null default now()
);

-- The lookup is always "how many hits in this bucket since T", so the index
-- leads with bucket and orders by time.
create index if not exists rate_limit_hits_bucket_idx
  on rate_limit_hits (bucket, created_at desc);

alter table rate_limit_hits enable row level security;

-- Check and record in one call. Returns true when the caller may proceed.
--
-- Counting and inserting together matters: doing it as two round trips from
-- the edge function leaves a window where several concurrent requests all
-- read a count under the limit and all proceed.
create or replace function public.rate_limit_take(
  p_bucket text,
  p_limit  int,
  p_window interval
)
returns boolean
language plpgsql
security definer
set search_path = public
as $fn$
declare
  used int;
begin
  select count(*) into used
    from rate_limit_hits
   where bucket = p_bucket
     and created_at > now() - p_window;

  if used >= p_limit then
    return false;
  end if;

  insert into rate_limit_hits (bucket) values (p_bucket);
  return true;
end;
$fn$;

-- Housekeeping: nothing older than a day can affect any window we use, and
-- without this the table grows forever.
create or replace function public.prune_rate_limit_hits()
returns void
language sql
security definer
set search_path = public
as $fn$
  delete from rate_limit_hits where created_at < now() - interval '1 day';
$fn$;

do $do$
begin
  if exists (select 1 from cron.job where jobname = 'prune-rate-limits') then
    perform cron.unschedule('prune-rate-limits');
  end if;
end;
$do$;

select cron.schedule(
  'prune-rate-limits',
  '17 * * * *',   -- hourly, off the hour so it doesn't pile onto other jobs
  $cron$ select public.prune_rate_limit_hits(); $cron$
);
