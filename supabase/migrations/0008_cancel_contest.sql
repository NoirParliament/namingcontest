-- ============================================================================
-- Cancelling a contest. Until now "Cancel contest" only wrote a cosmetic
-- localStorage entry — the real row kept running (participants could still
-- submit and vote, and it stayed in the creator's active list). Add a terminal
-- 'cancelled' status the creator can move a contest into.
--
-- The existing rules already do the right thing once a contest is cancelled:
--   • enforce_submission_rules / enforce_vote_rules require 'submission' /
--     'voting', so no new names or votes can land.
--   • contest_is_joinable checks 'submission'/'voting', so nobody new can join.
--   • contests_update RLS already lets the creator update their own contest,
--     so setting status = 'cancelled' needs no new policy.
-- ============================================================================

alter type contest_status add value if not exists 'cancelled';
