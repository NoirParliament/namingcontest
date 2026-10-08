-- ============================================================================
-- Anonymous step counts for the contest setup funnel.
--
-- Everything before checkout (tier, category, every brief question, review,
-- checkout) happens in the visitor's browser; the database only hears about a
-- contest once it is paid for. Google Analytics sees those steps only for
-- visitors who allow cookies, so drop-off per question was a sample. This
-- table counts every step for every visitor instead, without identifying
-- anyone:
--   * one row per step reached: the step, tier, category, question id and
--     position, and the time. No user id, no IP address, no answer text,
--     nothing stored on or read from the visitor's device;
--   * the table has no policies and no grants: browsers can only add a row
--     through count_funnel_step(), which checks every value and refuses to
--     write more than 300 rows a minute, so a script can't flood the stats;
--   * Looker reads it through reporting.funnel (below), with paid contests
--     from public.contests added as the last step.
-- ============================================================================

create table if not exists public.funnel_steps (
  id          bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  step        text not null check (step in (
                'tier_selected', 'category_selected', 'brief_step',
                'brief_completed', 'review_viewed', 'checkout_opened',
                'checkout_submitted')),
  tier        text check (tier in ('personal', 'group', 'business')),
  category_id text check (category_id ~ '^[a-z][0-9]{1,2}$'),
  question_id text check (question_id ~ '^[A-Za-z0-9_]{1,64}$'),
  step_index  smallint check (step_index between 0 and 200)
);

create index if not exists funnel_steps_occurred_at_idx on public.funnel_steps (occurred_at);

alter table public.funnel_steps enable row level security;
revoke all on public.funnel_steps from anon, authenticated;

create or replace function public.count_funnel_step(
  p_step       text,
  p_tier       text default null,
  p_category   text default null,
  p_question   text default null,
  p_step_index int  default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_step is null or p_step not in (
       'tier_selected', 'category_selected', 'brief_step',
       'brief_completed', 'review_viewed', 'checkout_opened',
       'checkout_submitted') then
    return;
  end if;
  -- Anything malformed is dropped rather than failing the whole count.
  if p_tier is not null and p_tier not in ('personal', 'group', 'business') then p_tier := null; end if;
  if p_category is not null and p_category !~ '^[a-z][0-9]{1,2}$' then p_category := null; end if;
  if p_question is not null and p_question !~ '^[A-Za-z0-9_]{1,64}$' then p_question := null; end if;
  if p_step_index is not null and (p_step_index < 0 or p_step_index > 200) then p_step_index := null; end if;

  -- Flood guard: real traffic is nowhere near this.
  if (select count(*) from funnel_steps where occurred_at > now() - interval '1 minute') >= 300 then
    return;
  end if;

  insert into funnel_steps (step, tier, category_id, question_id, step_index)
  values (p_step, p_tier, p_category, p_question, p_step_index);
end;
$$;

revoke all on function public.count_funnel_step(text, text, text, text, int) from public;
grant execute on function public.count_funnel_step(text, text, text, text, int) to anon, authenticated;

-- Looker: every setup step for every visitor, then paid contests from the
-- contests table as the final step, with readable step, tier and category
-- names (same wording as the dashboard's other pages).
create or replace view reporting.funnel as
with steps as (
  select f.occurred_at, f.step, f.tier, f.category_id, f.question_id, f.step_index
    from public.funnel_steps f
  union all
  select c.launched_at, 'paid', c.tier, c.sub_segment_id, null, null
    from public.contests c
   where c.paid and c.launched_at is not null
)
select
  s.occurred_at,
  s.step,
  case s.step
    when 'tier_selected'      then '1. Picked a tier'
    when 'category_selected'  then '2. Picked a category'
    when 'brief_step'         then '3. Answered a question'
    when 'brief_completed'    then '4. Finished the brief'
    when 'review_viewed'      then '5. Reviewed the contest'
    when 'checkout_opened'    then '6. Opened checkout'
    when 'checkout_submitted' then '7. Submitted payment'
    when 'paid'               then '8. Paid and launched'
  end as step_name,
  initcap(s.tier) as tier,
  s.category_id,
  case s.category_id
    when 'p1' then 'Baby'
    when 'p2' then 'Pet'
    when 'p4' then 'Personal: something else'
    when 't1' then 'Team'
    when 't2' then 'Band or club'
    when 't6' then 'Group: something else'
    when 'b1' then 'Company'
    when 'b2' then 'Product'
    when 'b5' then 'Business: something else'
    else s.category_id
  end as category,
  s.question_id,
  s.step_index
from steps s;

comment on view reporting.funnel is 'Looker: every contest setup step reached (anonymous counts) plus paid contests, no personal data.';

grant select on reporting.funnel to looker_readonly;
