-- ============================================================================
-- Winner reveal gains the contest's story: the creator's intro note plus an
-- anonymity-respecting host identity, so the share page can read as
-- "<host> asked for a name → the crowd answered → it's named NAME".
--
-- Additive re-create of get_winner_info (0011). New columns:
--   • intro               — brief->>'intro', the creator's short hello
--   • creator_avatar_url  — host photo (null when the host is anonymous)
--   • creator_anonymous   — settings->>'creatorAnonymous', so the client can
--                           run its usual hostIdentity() resolution
-- creator_name is now also anonymity-guarded (it previously leaked the
-- display name of a host who chose to stay anonymous), falling back to the
-- launch-time settings->>'creatorDisplayName' when the profile has no name.
-- ============================================================================
drop function if exists public.get_winner_info(uuid);

create function public.get_winner_info(cid uuid)
returns table (
  working_name text,
  sub_segment_id text,
  creator_name text,
  creator_avatar_url text,
  creator_anonymous boolean,
  intro text,
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
    case when coalesce((c.settings->>'creatorAnonymous')::boolean, false)
      then null
      else coalesce(cp.display_name, c.settings->>'creatorDisplayName')
    end as creator_name,
    case when coalesce((c.settings->>'creatorAnonymous')::boolean, false)
      then null
      else cp.avatar_url
    end as creator_avatar_url,
    coalesce((c.settings->>'creatorAnonymous')::boolean, false) as creator_anonymous,
    c.brief->>'intro' as intro,
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
