-- ============================================================================
-- get_join_info: the public join-page basics for a contest, WITHOUT exposing
-- price / stripe_session_id / creator_id / brief. Callable by anyone (even
-- signed out) so the invite/join page can render a real contest before the
-- visitor joins. SECURITY DEFINER bypasses RLS but only returns safe columns.
-- ============================================================================
create or replace function public.get_join_info(cid uuid)
returns table (
  id uuid,
  working_name text,
  sub_segment_id text,
  sub_segment_title text,
  tier text,
  status contest_status,
  settings jsonb,
  project_summary text
)
language sql
security definer
stable
set search_path = public
as $$
  -- project_summary is the one brief field written to be shown publicly on
  -- the join page; the rest of the brief stays private.
  select id, working_name, sub_segment_id, sub_segment_title, tier, status, settings,
         (brief ->> 'projectSummary') as project_summary
  from contests
  where id = cid;
$$;

grant execute on function public.get_join_info(uuid) to anon, authenticated;
