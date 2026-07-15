-- ============================================================================
-- Automatic phase transitions. Contests already carry submission_ends_at and
-- voting_ends_at (set at launch). A scheduled job flips their status when those
-- windows elapse, so the lifecycle runs on its own — no manual status updates,
-- and the countdowns (which read the same timestamps) can't disagree.
--
--   submission → voting   once submission_ends_at has passed
--   voting     → closed    once voting_ends_at has passed
--
-- 'cancelled' contests are terminal and never touched. A contest whose whole
-- window has already elapsed jumps submission→voting→closed in one run (the
-- second UPDATE sees the row already moved to 'voting').
-- ============================================================================

create extension if not exists pg_cron;

create or replace function public.advance_contest_phases()
returns void
language sql
security definer
set search_path = public
as $$
  update contests set status = 'voting'
    where status = 'submission'
      and submission_ends_at is not null
      and submission_ends_at <= now();

  update contests set status = 'closed'
    where status = 'voting'
      and voting_ends_at is not null
      and voting_ends_at <= now();
$$;

-- (Re)schedule the job to run every minute. Unschedule first so re-running this
-- migration doesn't create duplicates.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'advance-contest-phases') then
    perform cron.unschedule('advance-contest-phases');
  end if;
end $$;

select cron.schedule(
  'advance-contest-phases',
  '* * * * *',
  $$ select public.advance_contest_phases(); $$
);

-- Let an open creator dashboard see the phase flip live: add contests to the
-- realtime publication (RLS still gates what each subscriber receives).
alter table contests replica identity full;
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'contests'
  ) then
    alter publication supabase_realtime add table contests;
  end if;
end $$;
