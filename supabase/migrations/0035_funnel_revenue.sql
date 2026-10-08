-- ============================================================================
-- reporting.funnel: revenue on the paid step.
--
-- Adds revenue_usd (the contest price on "8. Paid and launched", 0 on every
-- other step) so the Conversion page's table by category can show steps,
-- conversion and revenue from one source. New column goes last, so this is a
-- plain create or replace over 0034.
-- ============================================================================

create or replace view reporting.funnel as
with steps as (
  select f.occurred_at, f.step, f.tier, f.category_id, null::text as category_title,
         f.question_id, f.step_index, 0::numeric as revenue_usd
    from public.funnel_steps f
  union all
  select c.launched_at, 'paid', c.tier, c.sub_segment_id, c.sub_segment_title, null, null,
         coalesce(c.price, 0)::numeric
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
  s.step_index,
  s.revenue_usd
from steps s;

comment on view reporting.funnel is 'Looker: every contest setup step reached (anonymous counts, from 2026-10-08 11:13 UTC) plus contests paid since then, no personal data.';

grant select on reporting.funnel to looker_readonly;
