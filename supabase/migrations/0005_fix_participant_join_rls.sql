-- ============================================================================
-- Fix 42501 on joining: participants_join checked contest status via a
-- subquery on contests, which is subject to contests RLS — but a not-yet-
-- participant can't read a live (non-closed) contest, so the check always
-- failed and nobody could join. Move the status check into a SECURITY DEFINER
-- helper that bypasses RLS.
-- ============================================================================
create or replace function public.contest_is_joinable(cid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from contests where id = cid and status in ('submission','voting')
  );
$$;

drop policy if exists participants_join on participants;
create policy participants_join on participants for insert to authenticated with check (
  user_id = auth.uid()
  and public.contest_is_joinable(contest_id)
);
