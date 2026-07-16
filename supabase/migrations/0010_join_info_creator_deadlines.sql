-- ============================================================================
-- Extend get_join_info with the pieces the join page needs to render a real
-- contest truthfully: who invited you (the creator's display name) and the
-- real phase deadlines (submission_ends_at / voting_ends_at) so the countdown
-- and the footer flow match the contest's actual stage. Still no price /
-- stripe / brief exposure. Return column set changes, so drop first.
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
         p.display_name as creator_name,
         c.submission_ends_at,
         c.voting_ends_at
  from contests c
  left join profiles p on p.id = c.creator_id
  where c.id = cid;
$$;

grant execute on function public.get_join_info(uuid) to anon, authenticated;
