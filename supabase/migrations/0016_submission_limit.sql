-- Submission cap: honour the creator's setting instead of a hardcoded 3.
--
-- The original rule ignored contests.settings->>'submissionLimit' entirely and
-- rejected anything past 3. So a creator who chose 5, 10 or "Unlimited" got a
-- UI offering that many slots and a database refusing the 4th name — a live
-- error on every contest not set to 1, 2 or 3.
--
-- Now: read the setting, default 3, clamp to 5.
--
--   • The clamp is the real ceiling, enforced server-side so a tampered client
--     can't exceed it. One person submitting 40 names drowns everyone else and
--     skews the vote, which is the opposite of the point.
--   • 'Unlimited' and 10 no longer appear in the brief, but they're already
--     stored on existing rows — they land on 5 here. That's strictly more
--     permissive than the 3 those contests are actually getting today, so no
--     in-flight contest loses a name anyone already submitted.
--   • The message quotes the real number, rather than always saying 3.

create or replace function public.enforce_submission_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  raw_limit text;
  max_names int;
  used int;
begin
  if (select status from contests where id = new.contest_id) <> 'submission' then
    raise exception 'This contest is not accepting submissions right now.';
  end if;

  if not exists (select 1 from participants where contest_id = new.contest_id and user_id = new.user_id) then
    raise exception 'You must join this contest before submitting.';
  end if;

  -- settings->>'submissionLimit' is whatever the brief stored: a number, the
  -- string 'Unlimited', or absent. Anything non-numeric falls back to the
  -- default rather than erroring — a malformed setting shouldn't block a
  -- contest that's otherwise running fine.
  select settings->>'submissionLimit' into raw_limit
    from contests where id = new.contest_id;

  if raw_limit ~ '^\d+$' then
    max_names := least(raw_limit::int, 5);
  elsif raw_limit = 'Unlimited' then
    -- Explicit, not swept into the default: someone who chose Unlimited asked
    -- for the most, so dropping them to 3 would leave them stricter than a
    -- creator who picked 10. They get the ceiling.
    max_names := 5;
  else
    max_names := 3;
  end if;
  max_names := greatest(max_names, 1);

  select count(*) into used
    from submissions
   where contest_id = new.contest_id and user_id = new.user_id;

  if used >= max_names then
    raise exception 'You can submit at most % name%.', max_names,
      case when max_names = 1 then '' else 's' end;
  end if;

  return new;
end;
$fn$;
