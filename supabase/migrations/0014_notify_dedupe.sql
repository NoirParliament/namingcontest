-- ============================================================================
-- Once-only guard for participant notifications. Status can legitimately be
-- flipped back and forth (testing, manual fixes) and the trigger fires each
-- time — without a marker, participants would get the same "voting's open" /
-- "winner" email again. The notify function checks these and stamps them
-- before sending, so each notification goes out at most once per contest.
-- ============================================================================
alter table contests
  add column if not exists notified_voting_at timestamptz,
  add column if not exists notified_winner_at timestamptz;
