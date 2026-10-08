-- ============================================================================
-- One start date for the whole dashboard (replaces 0036).
--
-- Every reporting view now starts at the same moment: October 8, 2026,
-- 11:13 UTC, when anonymous setup step counting began (0032). Before that
-- only test contests existed and setup steps weren't counted, so mixing them
-- in made pages disagree (more contests paid than visitors who picked a
-- tier). From this moment every page, chart and card counts the same thing:
--   * reporting.funnel: setup steps, plus contests paid since the start;
--   * reporting.contests: contests created since the start;
--   * reporting.activity: events of those same contests only;
--   * reporting.brief_questions reads funnel_steps, which start there too.
-- Nothing is deleted; the views only stop showing older rows.
-- counted_steps stays on reporting.funnel (always true) so the dashboard's
-- fields keep working.
-- ============================================================================

create or replace view reporting.funnel as
with steps as (
  select f.occurred_at, f.step, f.tier, f.category_id, null::text as category_title,
         f.question_id, f.step_index, 0::numeric as revenue_usd, true as counted_steps
    from public.funnel_steps f
  union all
  select c.launched_at, 'paid', c.tier, c.sub_segment_id, c.sub_segment_title, null, null,
         coalesce(c.price, 0)::numeric, true
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
  s.revenue_usd,
  s.counted_steps
from steps s;

comment on view reporting.funnel is 'Looker: every contest setup step reached (anonymous counts, from 2026-10-08 11:13 UTC) plus contests paid since then, no personal data.';

grant select on reporting.funnel to looker_readonly;

create or replace view reporting.contests as
select
  c.id                                   as contest_id,
  c.tier,                                -- personal | group | business
  c.sub_segment_id                       as category_id,
  c.sub_segment_title                    as category,
  c.voter_tier                           as participant_cap,
  c.price                                as price_usd,
  c.status::text                         as status,
  c.paid,
  case when c.paid then c.price else 0 end as revenue_usd,
  c.created_at,
  c.launched_at,
  c.submission_ends_at,
  c.voting_ends_at,
  (c.winner_submission_id is not null)   as has_winner,
  (select count(*)                  from public.participants p where p.contest_id = c.id) as participants,
  (select count(*)                  from public.submissions  s where s.contest_id = c.id) as names_submitted,
  (select count(distinct s.user_id) from public.submissions  s where s.contest_id = c.id) as name_submitters,
  (select count(*)                  from public.votes        v where v.contest_id = c.id) as votes_cast,
  (select count(distinct v.user_id) from public.votes        v where v.contest_id = c.id) as voters
from public.contests c
where c.created_at >= timestamptz '2026-10-08 11:13:00+00';

create or replace view reporting.activity as
with tracked as (
  select * from public.contests c where c.created_at >= timestamptz '2026-10-08 11:13:00+00'
)
  select c.created_at as occurred_at, 'contest_created'::text as activity,
         c.id as contest_id, c.tier, c.sub_segment_title as category, 0 as amount_usd
    from tracked c
  union all
  select c.launched_at, 'contest_launched', c.id, c.tier, c.sub_segment_title,
         case when c.paid then coalesce(c.price, 0) else 0 end
    from tracked c where c.launched_at is not null
  union all
  select p.joined_at, 'participant_joined', c.id, c.tier, c.sub_segment_title, 0
    from public.participants p join tracked c on c.id = p.contest_id
  union all
  select s.created_at, 'name_submitted', c.id, c.tier, c.sub_segment_title, 0
    from public.submissions s join tracked c on c.id = s.contest_id
  union all
  select v.created_at, 'vote_cast', c.id, c.tier, c.sub_segment_title, 0
    from public.votes v join tracked c on c.id = v.contest_id;

comment on view reporting.contests is 'Looker: one row per contest created since 2026-10-08 11:13 UTC, no personal data.';
comment on view reporting.activity is 'Looker: one row per event (created, launched, joined, name, vote) of contests created since 2026-10-08 11:13 UTC, no personal data.';

grant select on reporting.contests to looker_readonly;
grant select on reporting.activity to looker_readonly;

