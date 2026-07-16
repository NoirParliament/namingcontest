-- ============================================================================
-- auth_user_id_by_email: look up an existing auth user's id by email WITHOUT
-- generating a magic link. The guest-launch Edge Function previously used
-- admin.generateLink just to find-or-create the account, but that stamps a
-- "link sent" time on the user — so the app's real signInWithOtp seconds later
-- tripped Supabase's per-email "you can only request this after 60s" cooldown
-- on a single launch. Now the function looks the id up directly (or the Edge
-- Function creates the user via admin.createUser), leaving signInWithOtp as the
-- only magic-link request. Callable only with the service role.
-- ============================================================================
create or replace function public.auth_user_id_by_email(p_email text)
returns uuid
language sql
security definer
stable
set search_path = auth, public
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

revoke all on function public.auth_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.auth_user_id_by_email(text) to service_role;
