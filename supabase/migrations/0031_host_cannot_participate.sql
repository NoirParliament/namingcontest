-- ============================================================================
-- Hosts can't take part in their own contest.
--
-- Until now nothing stopped a contest's creator from joining it through their
-- own invite link, suggesting names and voting (found in testing, 2026-10-07).
-- The pages now send a host to their dashboard instead; this makes the rule
-- hold no matter what a browser sends. Joining is the gate: submissions and
-- votes already require a participant row (0001), and the same check is
-- repeated on both so a row created before this migration can't be used.
-- ============================================================================

create or replace function public.block_host_participation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from contests
     where id = new.contest_id
       and creator_id = new.user_id
  ) then
    raise exception 'Hosts can''t join, suggest names or vote in their own contest.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists participants_block_host on participants;
create trigger participants_block_host
  before insert on participants
  for each row execute function public.block_host_participation();

drop trigger if exists submissions_block_host on submissions;
create trigger submissions_block_host
  before insert on submissions
  for each row execute function public.block_host_participation();

drop trigger if exists votes_block_host on votes;
create trigger votes_block_host
  before insert on votes
  for each row execute function public.block_host_participation();
