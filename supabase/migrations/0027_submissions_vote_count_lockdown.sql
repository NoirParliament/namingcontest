-- ============================================================================
-- Hide live vote tallies from direct table reads.
--
-- get_ballot (0018) deliberately withholds vote counts until a contest closes
-- (creators excepted), but the column itself was still selectable: a
-- participant reading their OWN submission row could watch their name's live
-- tally mid-vote. RLS has no per-column policies, so this uses column-level
-- privileges instead: authenticated clients may select every submissions
-- column EXCEPT vote_count. Counts now flow only through get_ballot /
-- get_winner_info (SECURITY DEFINER), which enforce who sees them and when.
--
-- The creator dashboard (ContestManage) was the one direct reader of the
-- column; it now merges counts in from get_ballot, whose creator branch
-- always returns them. Service-role paths (edge functions, triggers) are
-- unaffected by these grants.
-- ============================================================================
revoke select on public.submissions from authenticated;
grant select (id, contest_id, user_id, text, rationale, credited, created_at)
  on public.submissions to authenticated;
