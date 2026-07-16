-- ============================================================================
-- NamingContest — initial schema (Phase 0)
-- ============================================================================
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Design notes:
--   • Brief + settings are jsonb — question ids are frozen, so copy can still
--     change without a migration.
--   • Voters must be logged in, so participants ARE auth users. That lets the
--     database enforce "one vote per person", "max 3 names", "max 3 picks",
--     and "no self-vote" instead of trusting the browser.
--   • Row-Level Security (RLS) is on for every table from day one.
-- ============================================================================

-- Contest lifecycle. pg_cron advances these on deadline (Phase 3).
create type contest_status as enum (
  'draft',            -- being built in the brief chat
  'awaiting_payment', -- brief done, Stripe checkout pending (Phase 4)
  'submission',       -- live, collecting names
  'voting',           -- names locked, collecting votes
  'closed'            -- winner crowned / results public
);

-- ----------------------------------------------------------------------------
-- profiles — one row per user, mirrors auth.users. Email stays in auth.users
-- (private); profiles only holds what others may see (a display name).
-- ----------------------------------------------------------------------------
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);

-- Auto-create a profile whenever someone signs up.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- contests — the core row. brief/settings are the same jsonb the chat builds.
-- ----------------------------------------------------------------------------
create table contests (
  id                   uuid primary key default gen_random_uuid(),
  creator_id           uuid not null references profiles (id) on delete cascade,
  working_name         text,
  tier                 text,                       -- personal | group | business
  sub_segment_id       text,                       -- b1, t2, p3, …
  sub_segment_title    text,
  brief                jsonb not null default '{}'::jsonb,
  settings             jsonb not null default '{}'::jsonb,
  voter_tier           int,                        -- 10 | 30 | 90
  price                int,                        -- 9 | 19 | 39 (USD)
  status               contest_status not null default 'draft',
  paid                 boolean not null default false,
  stripe_session_id    text,
  submission_ends_at   timestamptz,
  voting_ends_at       timestamptz,
  winner_submission_id uuid,                        -- FK added after submissions exists
  created_at           timestamptz not null default now(),
  launched_at          timestamptz
);
create index contests_creator_idx on contests (creator_id);
create index contests_status_idx  on contests (status);

-- ----------------------------------------------------------------------------
-- participants — who joined which contest (unique per person per contest).
-- ----------------------------------------------------------------------------
create table participants (
  id         uuid primary key default gen_random_uuid(),
  contest_id uuid not null references contests (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  joined_at  timestamptz not null default now(),
  unique (contest_id, user_id)
);
create index participants_contest_idx on participants (contest_id);

-- ----------------------------------------------------------------------------
-- submissions — proposed names. vote_count is denormalized (kept in sync by a
-- trigger) so the creator dashboard can subscribe to it in realtime without
-- ever reading raw ballots.
-- ----------------------------------------------------------------------------
create table submissions (
  id         uuid primary key default gen_random_uuid(),
  contest_id uuid not null references contests (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  text       text not null,
  rationale  text,
  credited   boolean not null default true,  -- show submitter's name vs anonymous
  vote_count int not null default 0,
  created_at timestamptz not null default now()
);
create index submissions_contest_idx on submissions (contest_id);

-- Now that submissions exists, point the winner FK at it.
alter table contests
  add constraint contests_winner_fk
  foreign key (winner_submission_id) references submissions (id) on delete set null;

-- ----------------------------------------------------------------------------
-- votes — one row per pick. Unique stops voting the same name twice; the
-- ≤3-picks and no-self-vote rules are enforced by trigger below.
-- ----------------------------------------------------------------------------
create table votes (
  id            uuid primary key default gen_random_uuid(),
  contest_id    uuid not null references contests (id) on delete cascade,
  submission_id uuid not null references submissions (id) on delete cascade,
  user_id       uuid not null references profiles (id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (contest_id, submission_id, user_id)
);
create index votes_contest_idx on votes (contest_id);

-- ============================================================================
-- Enforcement triggers — the rules the browser must not be trusted to keep.
-- ============================================================================

-- Submissions: only during the submission phase, only by a participant,
-- and at most 3 per person per contest.
create function enforce_submission_rules()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (select status from contests where id = new.contest_id) <> 'submission' then
    raise exception 'This contest is not accepting submissions right now.';
  end if;
  if not exists (select 1 from participants where contest_id = new.contest_id and user_id = new.user_id) then
    raise exception 'You must join this contest before submitting.';
  end if;
  if (select count(*) from submissions where contest_id = new.contest_id and user_id = new.user_id) >= 3 then
    raise exception 'You can submit at most 3 names.';
  end if;
  return new;
end;
$$;

create trigger submissions_rules
  before insert on submissions
  for each row execute function enforce_submission_rules();

-- Votes: only during the voting phase, only by a participant, at most 3 picks,
-- and never for your own submission.
create function enforce_vote_rules()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (select status from contests where id = new.contest_id) <> 'voting' then
    raise exception 'This contest is not open for voting right now.';
  end if;
  if not exists (select 1 from participants where contest_id = new.contest_id and user_id = new.user_id) then
    raise exception 'You must join this contest before voting.';
  end if;
  if (select user_id from submissions where id = new.submission_id) = new.user_id then
    raise exception 'You cannot vote for your own name.';
  end if;
  if (select count(*) from votes where contest_id = new.contest_id and user_id = new.user_id) >= 3 then
    raise exception 'You can pick at most 3 favorites.';
  end if;
  return new;
end;
$$;

create trigger votes_rules
  before insert on votes
  for each row execute function enforce_vote_rules();

-- Keep submissions.vote_count in sync as votes come and go.
create function bump_vote_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update submissions set vote_count = vote_count + 1 where id = new.submission_id;
  elsif tg_op = 'DELETE' then
    update submissions set vote_count = greatest(vote_count - 1, 0) where id = old.submission_id;
  end if;
  return null;
end;
$$;

create trigger votes_count_sync
  after insert or delete on votes
  for each row execute function bump_vote_count();

-- ============================================================================
-- Row-Level Security
-- ============================================================================
alter table profiles     enable row level security;
alter table contests     enable row level security;
alter table participants enable row level security;
alter table submissions  enable row level security;
alter table votes        enable row level security;

-- profiles: anyone signed in can read display names (needed for crediting);
-- you can only edit your own. (Inserts happen via the signup trigger.)
create policy profiles_read   on profiles for select to authenticated using (true);
create policy profiles_update on profiles for update to authenticated using (id = auth.uid());

-- contests: creators fully manage their own; participants can read contests
-- they've joined; closed contests are publicly readable (the winner reveal).
create policy contests_read on contests for select to authenticated using (
  creator_id = auth.uid()
  or status = 'closed'
  or exists (select 1 from participants p where p.contest_id = contests.id and p.user_id = auth.uid())
);
create policy contests_insert on contests for insert to authenticated with check (creator_id = auth.uid());
create policy contests_update on contests for update to authenticated using (creator_id = auth.uid());
create policy contests_delete on contests for delete to authenticated using (creator_id = auth.uid() and status = 'draft');

-- participants: you see your own rows; the creator sees everyone in their
-- contest. You can only join yourself, and only while it's open.
create policy participants_read on participants for select to authenticated using (
  user_id = auth.uid()
  or exists (select 1 from contests c where c.id = participants.contest_id and c.creator_id = auth.uid())
);
create policy participants_join on participants for insert to authenticated with check (
  user_id = auth.uid()
  and exists (select 1 from contests c where c.id = contest_id and c.status in ('submission','voting'))
);

-- submissions: readable by the creator, by participants of the contest, and by
-- anyone once it's closed. Inserts are gated by the trigger above.
-- NOTE (Phase 3): vote_count is visible to participants here. Before voting
-- ships, move live tallies behind a status-checked function so participants
-- don't see counts mid-vote — the settings promise hidden counts during voting.
create policy submissions_read on submissions for select to authenticated using (
  exists (select 1 from contests c where c.id = submissions.contest_id and (c.creator_id = auth.uid() or c.status = 'closed'))
  or exists (select 1 from participants p where p.contest_id = submissions.contest_id and p.user_id = auth.uid())
);
create policy submissions_insert on submissions for insert to authenticated with check (user_id = auth.uid());
create policy submissions_update on submissions for update to authenticated using (user_id = auth.uid());
create policy submissions_delete on submissions for delete to authenticated using (user_id = auth.uid());

-- votes: you only ever see your own ballots — nobody, not even the creator,
-- reads who voted for what (aggregate counts live on submissions.vote_count).
create policy votes_read   on votes for select to authenticated using (user_id = auth.uid());
create policy votes_insert on votes for insert to authenticated with check (user_id = auth.uid());
create policy votes_delete on votes for delete to authenticated using (user_id = auth.uid());
