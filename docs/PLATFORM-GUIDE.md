# NamingContest.com — Platform Guide

*The plain-English guide. No technical knowledge needed. There is a separate
Developer Handbook for whoever maintains the code.*

---

## What the platform does

NamingContest lets anyone run a naming contest end to end:

1. **Create** — pick a category (Personal, Group, or Business), answer a short
   guided brief, and set the rules: how names are credited, how many names
   each person can submit (1 to 5), and how long each phase runs.
2. **Pay** — a one-time fee based on how many voters you invite:
   $9 for up to 10, $19 for up to 30, $39 for up to 90. No subscription.
3. **Collect names** — share one invitation link. Participants join with just
   their email (a sign-in link, no passwords anywhere on the platform).
4. **Vote** — when the submission window closes, voting opens automatically.
   Everyone picks up to three favourites. Vote counts stay hidden until the end.
5. **Crown a winner** — the creator picks from the leaderboard, everyone gets
   the announcement email, and there is a public result page to share.

Everything moves on its own timers. Nobody has to flip switches.

## The five services behind it

All five use the same login (credentials shared privately, never in documents).

| Service | What it does | When you'd log in |
|---|---|---|
| **Vercel** | Hosts the website | To see visitor analytics |
| **Supabase** | Database, accounts, server logic | Rarely; mostly a developer tool |
| **Stripe** | Takes the payments | To see sales and issue refunds |
| **Resend** | Sends the emails | To check an email was delivered |
| **GitHub** | Stores the code | Developer only |

## Trying the platform (beta)

1. Go to **namingcontest.com** and enter the beta password.
2. Create a contest as a real user would. At checkout use Stripe's test card:
   **4242 4242 4242 4242**, any future expiry, any 3-digit code, any ZIP.
   It behaves exactly like a real charge, but no money moves.
3. When setting the timeline, pick the **shortest windows: 3 days for
   submissions and 2 days for voting**. The contest then completes on its own
   in 5 days. (Phases switch automatically on those timers. Moving a contest
   between phases by hand requires database access and can break it, so short
   timers are the safe way to experience the full flow.)
4. To experience the participant side, open your own invitation link in a
   **private browser window** and join with a second email address. That
   second address will receive everything a real participant gets.

## The emails the platform sends

All custom-designed to match the site, each in the contest's own colour theme.

| Email | Who gets it | When |
|---|---|---|
| Sign-in link | Anyone logging in | Every sign-in (no passwords) |
| "Your contest is live" + Stripe receipt | The creator | Right after payment |
| "Your vote is needed" | All participants | The moment voting opens |
| "The winning name" | All participants | When a winner is crowned |
| "Your name won" | The winner personally | Same moment |
| Contact form receipt | Whoever wrote in | Right after sending |

Gmail sometimes places one in the Promotions tab. This improves on its own as
the domain builds sending reputation over the first weeks of real use.

## Checking payments in Stripe

1. Log in to **dashboard.stripe.com**.
2. Make sure the **Test mode** toggle (top right) is ON while we're in beta.
3. Open **Payments** — every test checkout appears there like a real sale,
   with the amount, the card, and the contest it belongs to.

When we go live, a developer switches the test keys for live keys (about ten
minutes of work). Everything is already connected; real charging is simply
disabled until then.

## Visitor statistics

Vercel Analytics is installed on the site. In **Vercel → the project →
Analytics** you can see visitors, page views, top pages, countries, and
devices. It's privacy-friendly (no cookies), so no consent banner is needed.

## Before public launch — your checklist

1. **Set up the hello@namingcontest.com mailbox.** The contact form currently
   sends the visitor a receipt, but the message itself has nowhere to land
   because no mailbox exists yet. Five minutes in eNom — see the steps below.
2. **Create the real social media profiles** (X, LinkedIn, Instagram). The
   icons in the email footers currently point at placeholder handles.
3. **Replace the landing page testimonials** with real ones.
4. **Senior developer review** — one error-and-safety pass before launch.
5. **Switch Stripe to live keys** (developer task, last thing before launch).

### Setting up the mailbox in eNom

1. Log in to eNom and open **Domains → My Domains → namingcontest.com**.
2. Open **Email Settings** (sometimes called **Email Forwarding**).
3. Add a forward: **hello@** → the inbox where you want messages to arrive
   (your Catchword address works fine).
4. Save. eNom adds the necessary mail records automatically.
5. Send a test email to hello@namingcontest.com and confirm it arrives.

**Two things not to touch while you're in there:**
- Never change the **nameservers**. That would take the website offline.
- Don't edit or delete any existing records mentioning **resend** or
  **send.namingcontest.com** — those run the platform's outgoing email.

## What's safe to do yourself vs. what needs a developer

**Safe:** browsing every dashboard, viewing payments in Stripe, viewing email
deliveries in Resend, viewing analytics in Vercel, running contests on the
site itself.

**Needs a developer:** anything in Supabase's SQL editor, changing environment
variables or keys, editing code, changing DNS beyond the mailbox steps above.
The platform protects itself against most mistakes, but database changes can't
always be undone.

## Getting help

Bugs and questions during the beta go to Matt. After handoff, the Developer
Handbook (separate document) gives a maintainer everything needed to run,
fix, and extend the platform.
