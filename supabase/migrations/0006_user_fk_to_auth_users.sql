-- ============================================================================
-- Joining failed with participants_user_id_fkey: the new signup had no
-- profiles row (the auto-create trigger didn't cover it). Two fixes:
--   1) Backfill any auth users missing a profile.
--   2) Point participants/submissions/votes at auth.users directly, so a
--      just-authenticated user can act even if their profile mirror lags.
--      profiles stays the display mirror (join with a fallback).
-- ============================================================================

-- 1) Backfill missing profiles.
insert into public.profiles (id, display_name)
select u.id, split_part(u.email, '@', 1)
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- 2) Repoint the user foreign keys at auth.users.
alter table participants
  drop constraint participants_user_id_fkey,
  add constraint participants_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade;

alter table submissions
  drop constraint submissions_user_id_fkey,
  add constraint submissions_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade;

alter table votes
  drop constraint votes_user_id_fkey,
  add constraint votes_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade;
