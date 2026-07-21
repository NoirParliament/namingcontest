-- Close the anonymity and live-tally leaks by narrowing submissions_read.
--
-- RUN 0018 (get_ballot) FIRST, and deploy the app changes that use it.
-- This migration removes the access those pages used to rely on; applying it
-- against an older frontend leaves the voting page with an empty ballot.
--
-- The old policy let any participant select whole rows for the whole
-- contest — including user_id (so `credited: false` hid a name in the UI but
-- not in the API) and vote_count (so running tallies were readable mid-vote,
-- which the settings promise are hidden).
--
-- Now direct table access is only for the two cases that genuinely need a raw
-- row, and everyone else goes through get_ballot, which resolves names
-- against the contest's anonymity rules and withholds counts until the close:
--
--   • the creator — ContestManage shows live tallies and submitter identity
--     by design; it's their contest and their dashboard.
--   • your own submissions — several pages count or list what YOU entered
--     (ParticipantChat, ParticipantThanks, JoinContest, Settings,
--     ParticipantVoteThanks). Reading your own row reveals nothing about
--     anyone else.
--
-- The dropped `status = 'closed'` clause isn't needed: the public reveal page
-- reads through get_winner_info, which is security definer and granted to
-- anon, so a stranger with the link still sees the result.

drop policy if exists submissions_read on submissions;

create policy submissions_read on submissions for select to authenticated using (
  -- Your own entries, in any contest, at any stage.
  submissions.user_id = auth.uid()
  -- Or every entry in a contest you run.
  or exists (
    select 1 from contests c
     where c.id = submissions.contest_id
       and c.creator_id = auth.uid()
  )
);
