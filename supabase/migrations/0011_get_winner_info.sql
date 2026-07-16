-- ============================================================================
-- get_winner_info: the public post-contest reveal for a CLOSED contest, safe
-- to call signed-out (the /reveal share page). Returns the winning name + who
-- suggested it (only if credited) + headline tallies — nothing private, and
-- only once the contest is closed. Mirrors get_join_info's SECURITY DEFINER
-- pattern so RLS (authenticated-only reads) doesn't block anonymous visitors.
-- ============================================================================
drop function if exists public.get_winner_info(uuid);

create function public.get_winner_info(cid uuid)
returns table (
  working_name text,
  sub_segment_id text,
  creator_name text,
  winner_text text,
  winner_rationale text,
  winner_credited boolean,
  winner_submitter_name text,
  winner_votes int,
  total_votes bigint,
  total_names bigint,
  total_participants bigint
)
language sql
security definer
stable
set search_path = public
as $$
  with c as (
    select * from contests where id = cid and status = 'closed'
  ),
  win as (
    -- The crowned winner if one is set, else the top-voted name.
    select s.*
    from submissions s, c
    where s.contest_id = c.id
    order by (s.id = c.winner_submission_id) desc, s.vote_count desc
    limit 1
  )
  select
    c.working_name,
    c.sub_segment_id,
    cp.display_name as creator_name,
    win.text as winner_text,
    win.rationale as winner_rationale,
    win.credited as winner_credited,
    case when win.credited then wp.display_name else null end as winner_submitter_name,
    win.vote_count as winner_votes,
    (select coalesce(sum(vote_count), 0) from submissions where contest_id = c.id) as total_votes,
    (select count(*) from submissions where contest_id = c.id) as total_names,
    (select count(*) from participants where contest_id = c.id) as total_participants
  from c
  left join win on true
  left join profiles cp on cp.id = c.creator_id
  left join profiles wp on wp.id = win.user_id;
$$;

grant execute on function public.get_winner_info(uuid) to anon, authenticated;
