-- ============================================================================
-- Expose the creator's intro (brief->>'intro') on the public join page.
--
-- The intro is the creator's personal note to participants, written on the
-- review screen before launch ("Please help us name our new band! …"). The
-- join page is anon and reads the contest only through get_join_info, so the
-- field has to travel through this function — participants-side pages read
-- the contest row directly and need nothing.
--
-- Additive only: same fields as 0010 plus `intro`. The front end falls back
-- to project_summary when intro is null, so deploy order doesn't matter.
-- Return column set changes, so drop first (same pattern as 0010).
-- ============================================================================
drop function if exists public.get_join_info(uuid);

create function public.get_join_info(cid uuid)
returns table (
  id uuid,
  working_name text,
  sub_segment_id text,
  sub_segment_title text,
  tier text,
  status contest_status,
  settings jsonb,
  project_summary text,
  intro text,
  creator_name text,
  submission_ends_at timestamptz,
  voting_ends_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select c.id, c.working_name, c.sub_segment_id, c.sub_segment_title, c.tier,
         c.status, c.settings,
         (c.brief ->> 'projectSummary') as project_summary,
         (c.brief ->> 'intro') as intro,
         p.display_name as creator_name,
         c.submission_ends_at,
         c.voting_ends_at
  from contests c
  left join profiles p on p.id = c.creator_id
  where c.id = cid;
$$;

grant execute on function public.get_join_info(uuid) to anon, authenticated;
