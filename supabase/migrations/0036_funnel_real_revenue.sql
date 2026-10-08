-- ============================================================================
-- reporting.funnel: every paid contest again, plus a counting-window flag.
--
-- 0034 left out contests paid before step counting began, so the Funnel
-- page showed $0 revenue while the contests table showed real money. Paid
-- contests and revenue now count in full, everywhere. The new column
-- counted_steps marks rows that fall inside the window where every setup
-- step was counted (all step rows, and contests paid from October 8, 2026,
-- 11:13 UTC); the dashboard's conversion rates divide only those, so a rate
-- never compares payments with visits that were never counted.
-- ============================================================================

create or replace view reporting.funnel as
with steps as (
  select f.occurred_at, f.step, f.tier, f.category_id, null::text as category_title,
         f.question_id, f.step_index, 0::numeric as revenue_usd, true as counted_steps
    from public.funnel_steps f
  union all
  select c.launched_at, 'paid', c.tier, c.sub_segment_id, c.sub_segment_title, null, null,
         coalesce(c.price, 0)::numeric,
         c.launched_at >= timestamptz '2026-10-08 11:13:00+00'
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
    else coalesce(s.category_title, s.category_id)
  end as category,
  s.question_id,
  s.step_index,
  s.revenue_usd,
  s.counted_steps
from steps s;

comment on view reporting.funnel is 'Looker: every contest setup step reached (anonymous counts) plus every paid contest; counted_steps marks rows inside the step-counting window, no personal data.';

grant select on reporting.funnel to looker_readonly;
