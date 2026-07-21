-- Enforce the voter tier that was paid for.
--
-- voter_tier priced the contest (0017 derives price from it) but nothing
-- checked it: a $9 contest sold as "up to 10 voters" would happily take 90.
-- The cap was a promise on the pricing page that the database didn't keep,
-- and the cheapest tier bought the largest contest.
--
-- A TRIGGER rather than extending contest_is_joinable, because RLS refusal
-- surfaces as 42501 "new row violates row-level security policy" — accurate
-- and useless to someone who just clicked an invitation. A trigger raises a
-- sentence the interface can show as-is.
--
-- Counting participants rather than actual voters: the tier is sold as how
-- many people can take part, the seat is what's reserved, and someone who
-- joins and doesn't vote has still taken one. Counting ballots instead would
-- mean a contest could fill with people and only discover it was over
-- capacity once they started voting — far too late to do anything about.

create or replace function public.enforce_voter_tier()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  cap  int;
  used int;
begin
  select voter_tier into cap from contests where id = new.contest_id;

  -- No tier recorded: contests from before tiering, or drafts. Let them
  -- through — refusing joins on a live contest because of a missing field
  -- would break something that currently works, to enforce a limit nobody
  -- was told about.
  if cap is null then
    return new;
  end if;

  select count(*) into used from participants where contest_id = new.contest_id;

  -- Existing over-capacity contests are grandfathered: this blocks the NEXT
  -- join, it doesn't remove anyone who is already in.
  if used >= cap then
    raise exception
      'This contest is full — it has room for % %.', cap,
      case when cap = 1 then 'voter' else 'voters' end
      using errcode = 'check_violation';
  end if;

  return new;
end;
$fn$;

drop trigger if exists participants_tier_cap on participants;
create trigger participants_tier_cap
  before insert on participants
  for each row execute function public.enforce_voter_tier();
