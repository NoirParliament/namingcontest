-- ============================================================================
-- reporting.funnel: one cohort.
--
-- Setup steps are only counted from October 8, 2026, 11:13 UTC (the first
-- row in funnel_steps, migration 0032). The view also added every paid
-- contest since August as the last step, so the funnel showed more people
-- paying than picking a tier (a "400%" conversion). The paid step now starts
-- at the same moment as the counting, so every step in the funnel comes from
-- the same visitors. Contests and revenue for all dates stay on the Overview
-- page (reporting.contests, unchanged).
--
-- Also: paid contests now show their own stored category name when the id
-- isn't one of today's nine (older contests used retired categories p3 and
-- t4, which showed as raw ids).
-- ============================================================================

create or replace view reporting.funnel as
with steps as (
  select f.occurred_at, f.step, f.tier, f.category_id, null::text as category_title,
         f.question_id, f.step_index
    from public.funnel_steps f
  union all
  select c.launched_at, 'paid', c.tier, c.sub_segment_id, c.sub_segment_title, null, null
    from public.contests c
   where c.paid
     and c.launched_at >= timestamptz '2026-10-08 11:13:00+00'
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
    else coalesce(s.category_title, s.category_id)
  end as category,
  s.question_id,
  s.step_index
from steps s;

comment on view reporting.funnel is 'Looker: every contest setup step reached (anonymous counts, from 2026-10-08 11:13 UTC) plus contests paid since then, no personal data.';

grant select on reporting.funnel to looker_readonly;
