-- ============================================================================
-- Raise the submission-cap ceiling from 5 to 10.
--
-- Client decision 2026-08-18: the brief now offers 1 / 2 / 3 / 5 / 10 names
-- per person ("we can see folks wanting to submit a lot, like 10"). The DB
-- clamp in 0016 topped out at 5, which would have silently rejected the 6th
-- name on a contest set to 10 — the exact live-error class 0016 fixed.
--
-- Same function as 0016 with one changed ceiling: least(raw, 10), and legacy
-- 'Unlimited' rows land on 10 instead of 5.
-- ============================================================================

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

  select settings->>'submissionLimit' into raw_limit
    from contests where id = new.contest_id;

  if raw_limit ~ '^\d+$' then
    max_names := least(raw_limit::int, 10);
  elsif raw_limit = 'Unlimited' then
    max_names := 10;
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
