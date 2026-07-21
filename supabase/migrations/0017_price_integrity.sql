-- Price integrity: the server decides what a contest costs.
--
-- THE HOLE THIS CLOSES
-- The browser computed `price` (priceForVoters in src/data/v4/voterTiers.js)
-- and every write path took it on trust:
--   • the signed-in insert — RLS only checks creator_id = auth.uid()
--   • launch-contest — spreads ...row straight into the insert
--   • contests_update — no column restriction, so a draft's price could be
--     PATCHed down after the fact
-- create-payment-intent then charged contests.price, and confirm-launch
-- "verified" it with `pi.amount === contest.price * 100` — a circular check
-- that compares the payment against the tampered number and passes. A
-- 90-voter contest ($39) could be launched for $0.50.
--
-- WHY A TRIGGER RATHER THAN APP FIXES
-- A trigger closes every route at once — client insert, edge function, a raw
-- PATCH against the REST API — and needs no client change. The browser may
-- keep sending whatever price it likes; the database overwrites it.
--
-- Keep VOTER_TIERS in src/data/v4/voterTiers.js in step with the case below.
-- They are the same table in two places; that's the cost of the client
-- needing to show a price before a row exists.

create or replace function public.set_contest_price()
returns trigger
language plpgsql
as $fn$
begin
  -- A paid contest's price is the record of a completed transaction. Never
  -- rewrite it — a later edit (renaming the contest, say) must not restate
  -- history, and re-pricing something already charged would misrepresent
  -- what the customer actually paid.
  if TG_OP = 'UPDATE' and old.paid then
    new.price := old.price;
    return new;
  end if;

  new.price := case new.voter_tier
    when 10 then 9
    when 30 then 19
    when 90 then 39
    -- No tier, or one we don't sell: no price. create-payment-intent rejects
    -- anything under 50 cents, so an unpriced contest cannot be paid for.
    -- Leaving the client's number here instead would reopen the hole for
    -- rows that simply omit voter_tier.
    else null
  end;

  return new;
end;
$fn$;

drop trigger if exists contests_set_price on contests;
create trigger contests_set_price
  before insert or update on contests
  for each row execute function public.set_contest_price();

-- Correct any row already carrying a tampered or stale price. Unpaid only,
-- for the reason above. This is a no-op on a healthy database — it rewrites
-- exactly the rows whose price disagrees with their tier.
update contests
   set voter_tier = voter_tier   -- touch the row so the trigger recomputes
 where not paid
   and price is distinct from (case voter_tier
         when 10 then 9 when 30 then 19 when 90 then 39 else null end);
