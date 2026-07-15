-- ============================================================================
-- Realtime for the creator dashboard. The Manage page subscribes to changes
-- on a contest's submissions so new entries and live vote counts appear
-- without a refresh (submissions.vote_count is bumped by a trigger on every
-- vote, producing an UPDATE the creator can see — creators can read their
-- contest's submissions, whereas raw votes stay private per voter).
--
--   1) Add the tables to the supabase_realtime publication.
--   2) REPLICA IDENTITY FULL so row-level filters (contest_id=eq.…) resolve
--      on UPDATE/DELETE, not just INSERT.
-- Realtime still enforces RLS, so subscribers only receive rows they may read.
-- ============================================================================

alter table submissions replica identity full;
alter table votes       replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'submissions'
  ) then
    alter publication supabase_realtime add table submissions;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'votes'
  ) then
    alter publication supabase_realtime add table votes;
  end if;
end $$;
