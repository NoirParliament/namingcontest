-- ============================================================================
-- Cookie choice records (the cookie bar, components/ChoiceBar.jsx).
--
-- GDPR art. 7(1): the site must be able to show that a visitor agreed before
-- analytics loaded. Each "Accept all" / "Reject all" adds one anonymous row:
-- a random id kept only in that visitor's browser (localStorage nc_choice),
-- the answer, the bar version, the country the site saw, and when.
-- No IP address, no account id, no email.
--
-- Anyone may INSERT (the bar runs before sign-in); nobody can read, change or
-- delete through the API. Reading is for the dashboard owner via SQL only.
-- ============================================================================

create table if not exists choice_records (
  id         bigserial primary key,
  choice_id  text        not null check (char_length(choice_id) between 8 and 64),
  analytics  boolean     not null,
  version    int         not null check (version between 1 and 1000),
  country    text        check (country is null or country ~ '^[A-Z]{2}$'),
  source     text        not null check (source in ('bar', 'settings')),
  created_at timestamptz not null default now()
);

create index if not exists choice_records_choice_idx on choice_records (choice_id, created_at desc);

alter table choice_records enable row level security;

drop policy if exists choice_records_insert on choice_records;
create policy choice_records_insert on choice_records
  for insert to anon, authenticated
  with check (true);

grant insert on choice_records to anon, authenticated;
grant usage on sequence choice_records_id_seq to anon, authenticated;
