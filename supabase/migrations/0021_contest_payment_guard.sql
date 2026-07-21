-- Payment bypass: a creator could mark their own contest paid.
--
-- contests_update grants the creator UPDATE on their own row with no column
-- restriction. confirm-launch is what's meant to flip a contest live — it
-- verifies the PaymentIntent with Stripe, then sets paid/status/launched_at —
-- but nothing stopped the browser doing the same thing directly:
--
--   supabase.from('contests')
--     .update({ paid: true, status: 'submission', launched_at: '…' })
--     .eq('id', myContestId)
--
-- and running a contest without paying at all. Same family as the price
-- tampering closed in 0017, and worse: that one bought a discount, this one
-- skips the payment entirely.
--
-- The fix mirrors 0017 — the database refuses the change rather than the app
-- being asked to. Anything a client sends for a payment-controlled column is
-- replaced with the value already stored, so the write silently does nothing
-- instead of erroring, and a legitimate edit in the same statement still
-- lands. Only the service role (edge functions, migrations) can move them.
--
-- Deliberately still writable by the creator, because there's real UI behind
-- each: the brief and settings JSON, winner_submission_id (crowning a
-- winner), and status → 'cancelled' (cancelling a contest).

create or replace function public.guard_contest_payment_columns()
returns trigger
language plpgsql
as $fn$
declare
  actor text;
begin
  -- auth.role() reads the JWT claim, so it's 'authenticated' for a browser
  -- and 'service_role' for an edge function. It's null for a direct database
  -- connection — migrations, the SQL editor, psql — which we treat as trusted:
  -- anyone with that access can rewrite the table regardless of triggers.
  begin
    actor := auth.role();
  exception when others then
    actor := null;
  end;

  if actor is null or actor in ('service_role', 'postgres') then
    return new;
  end if;

  -- Everything below is set by confirm-launch after Stripe confirms, or by
  -- the phase cron. None of it has client-side UI.
  new.paid              := old.paid;
  new.stripe_session_id := old.stripe_session_id;
  new.launched_at       := old.launched_at;
  new.submission_ends_at := old.submission_ends_at;
  new.voting_ends_at    := old.voting_ends_at;
  new.creator_id        := old.creator_id;   -- no silent hand-offs
  new.voter_tier        := old.voter_tier;   -- 0017 derives price from this

  -- Status: 'cancelled' is the creator's to choose, and it's terminal. Every
  -- other transition belongs to payment or to the cron.
  if new.status is distinct from old.status and new.status <> 'cancelled' then
    new.status := old.status;
  end if;

  return new;
end;
$fn$;

drop trigger if exists contests_guard_payment on contests;
-- Fires before the 0017 price trigger (alphabetical by name), so voter_tier is
-- already restored when the price is recomputed from it.
create trigger contests_guard_payment
  before update on contests
  for each row execute function public.guard_contest_payment_columns();
