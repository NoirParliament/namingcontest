-- ============================================================================
-- Reporting views for the Looker Studio (Data Studio) dashboard.
--
-- Looker reads ground-truth business numbers (contests, payments,
-- participation) straight from the database, independent of ad blockers or
-- cookie consent. It connects as a dedicated read-only role that can see
-- ONLY the views in the `reporting` schema:
--   * no emails, names, profiles, brief answers, submitted name texts,
--     rationales or Stripe ids ever leave the database;
--   * the base tables in `public` stay invisible to this role;
--   * `reporting` is not exposed through the Supabase API (only `public` is),
--     so anon/authenticated clients can't reach these views either.
--
-- The views run with their owner's rights (Postgres default), which is what
-- lets them aggregate across RLS-protected tables while the Looker role
-- itself holds no table privileges.
--
-- After applying, set the role's password ONCE in the SQL editor (never
-- commit it):   alter role looker_readonly with password '<choose one>';
-- Looker connects through the Supabase connection pooler as user
-- `looker_readonly.<project-ref>`.
-- ============================================================================

create schema if not exists reporting;
revoke all on schema reporting from public;
revoke all on schema reporting from anon, authenticated;

-- One row per contest: what was bought, how it went. No creator identity.
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
from public.contests c;

-- Event-style activity feed (one row per thing that happened), so Looker can
-- chart any of them over time and slice by tier / category.
create or replace view reporting.activity as
  select c.created_at as occurred_at, 'contest_created'::text as activity,
         c.id as contest_id, c.tier, c.sub_segment_title as category, 0 as amount_usd
    from public.contests c
  union all
  select c.launched_at, 'contest_launched', c.id, c.tier, c.sub_segment_title,
         case when c.paid then coalesce(c.price, 0) else 0 end
    from public.contests c where c.launched_at is not null
  union all
  select p.joined_at, 'participant_joined', c.id, c.tier, c.sub_segment_title, 0
    from public.participants p join public.contests c on c.id = p.contest_id
  union all
  select s.created_at, 'name_submitted', c.id, c.tier, c.sub_segment_title, 0
    from public.submissions s join public.contests c on c.id = s.contest_id
  union all
  select v.created_at, 'vote_cast', c.id, c.tier, c.sub_segment_title, 0
    from public.votes v join public.contests c on c.id = v.contest_id;

comment on view reporting.contests is 'Looker: one row per contest, no personal data.';
comment on view reporting.activity is 'Looker: one row per contest event (created, launched, joined, name, vote), no personal data.';

-- Read-only login for Looker. Created without a password (cannot log in until
-- one is set by hand, see header).
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'looker_readonly') then
    create role looker_readonly login noinherit;
  end if;
end
$$;

alter role looker_readonly set statement_timeout = '30s';
alter role looker_readonly set search_path = reporting;

grant usage on schema reporting to looker_readonly;
grant select on all tables in schema reporting to looker_readonly;
alter default privileges in schema reporting grant select on tables to looker_readonly;
