-- ============================================================================
-- Fix 42P17 "infinite recursion detected in policy for relation contests".
-- contests_read referenced participants, and participants_read referenced
-- contests, so each policy triggered the other endlessly. Move the two
-- cross-table checks into SECURITY DEFINER helpers that bypass RLS, breaking
-- the loop.
-- ============================================================================

create or replace function public.is_contest_participant(cid uuid, uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from participants where contest_id = cid and user_id = uid);
$$;

create or replace function public.is_contest_creator(cid uuid, uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from contests where id = cid and creator_id = uid);
$$;

drop policy if exists contests_read on contests;
create policy contests_read on contests for select to authenticated using (
  creator_id = auth.uid()
  or status = 'closed'
  or public.is_contest_participant(id, auth.uid())
);

drop policy if exists participants_read on participants;
create policy participants_read on participants for select to authenticated using (
  user_id = auth.uid()
  or public.is_contest_creator(contest_id, auth.uid())
);
