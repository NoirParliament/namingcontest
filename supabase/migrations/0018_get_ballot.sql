-- get_ballot: what a participant is allowed to see while voting.
--
-- TWO LEAKS THIS EXISTS TO CLOSE
--
-- 1. Anonymity was cosmetic. submissions_read hands participants the whole
--    row including user_id, and `credited: false` only hid the name in the
--    UI. One REST call against /submissions de-anonymised every entry in a
--    contest that promises anonymity.
--
-- 2. Live tallies leaked. 0001_initial_schema.sql says as much:
--      "NOTE (Phase 3): vote_count is visible to participants here. Before
--       voting ships, move live tallies behind a status-checked function"
--    Voting shipped; this didn't. Participants could read running counts
--    mid-vote, which the settings promise are hidden — and knowing them
--    invites a bandwagon.
--
-- So this returns a RESOLVED view: a display name only where the rules allow
-- one, never a user_id; a vote count only once the contest is closed. The
-- raw row never leaves the database.
--
-- `is_mine` exists because the page needs to know which entries are the
-- caller's own (to say "you submitted 3 names", and to stop you voting for
-- yourself) — a question we can answer without exposing whose the others are.

create or replace function public.get_ballot(cid uuid)
returns table (
  id            uuid,
  text          text,
  rationale     text,
  created_at    timestamptz,
  credited      boolean,
  submitter_name text,
  is_mine       boolean,
  vote_count    int
)
language plpgsql
security definer
set search_path = public
as $fn$
declare
  c_status   contest_status;
  c_creator  uuid;
  raw_mode   text;
  mode       text;
  is_creator boolean;
  may_see_counts boolean;
begin
  select status, creator_id, coalesce(settings->>'anonymity', '')
    into c_status, c_creator, raw_mode
    from contests where contests.id = cid;

  if c_creator is null then
    raise exception 'Contest not found.';
  end if;

  is_creator := (c_creator = auth.uid());

  -- Gate: participants, the creator, or anyone once the result is public.
  if not is_creator
     and c_status <> 'closed'
     and not exists (
       select 1 from participants p
        where p.contest_id = cid and p.user_id = auth.uid()
     ) then
    raise exception 'You are not part of this contest.';
  end if;

  -- Mirrors anonymityMode() in src/utils/v4Anonymity.js, matching order
  -- included: settings stores either the option id or its label, so both
  -- 'participant' and 'Let participants choose' have to land the same way.
  -- Keep the two in step.
  raw_mode := lower(raw_mode);
  if raw_mode ~ '(choose|participant|each)' then
    mode := 'participant';
  elsif raw_mode ~ '(anon|hide|private)' then
    mode := 'anonymous';
  elsif raw_mode ~ '(public|show|credit)' then
    mode := 'public';
  else
    mode := 'participant';   -- same default as the client
  end if;

  -- The creator watches tallies live on their dashboard; that's the point of
  -- it. Everyone else waits for the close.
  may_see_counts := is_creator or c_status = 'closed';

  return query
  select
    s.id,
    s.text,
    s.rationale,
    s.created_at,
    s.credited,
    case
      when mode = 'anonymous' then null
      when mode = 'public' or s.credited then pr.display_name
      else null
    end as submitter_name,
    (s.user_id = auth.uid()) as is_mine,
    case when may_see_counts then s.vote_count else null end as vote_count
  from submissions s
  left join profiles pr on pr.id = s.user_id
  where s.contest_id = cid
  order by s.created_at asc;
end;
$fn$;

grant execute on function public.get_ballot(uuid) to authenticated;
