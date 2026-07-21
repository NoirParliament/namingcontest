# NamingContest.com

A paid naming-contest platform. A creator answers a guided brief, pays a
one-time fee ($9/$19/$39 keyed to voter capacity 10/30/90), and shares one
invitation link. Participants join by email magic link, submit names, then
vote; phases advance automatically on timers; the creator crowns a winner
and every step sends a designed transactional email.

**Production:** https://namingcontest.com — live, behind a soft beta gate
(the password ships in the bundle; unset the env var and the gate is off).

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18.3, Vite 5.4, react-router 6 — SPA, no SSR |
| Database | Supabase Postgres, RLS on every table, logic in SQL triggers/functions |
| Server | 6 Supabase Edge Functions (Deno) |
| Auth | Supabase magic links only — no passwords anywhere |
| Payments | Stripe Payment Intents + a `payment_intent.succeeded` webhook backstop |
| Email | Resend (API for lifecycle mail, SMTP for auth mail) |
| Scheduling | pg_cron — phase transitions every minute, rate-limit pruning hourly |
| Hosting | Vercel — pushing `master` deploys production |

Supabase project ref: `kgcggyuoezaygyawnlcs`.

## Repo map

```
├── src/
│   ├── pages/v4/         # the real product (everything a user touches)
│   ├── pages/legal/      # /privacy /terms (live pages)
│   ├── pages/system/     # 404, /link-expired, /error, /contact
│   ├── pages/*.jsx       # LEGACY v1 prototype — unrouted, kept for reference
│   ├── components/v4/    # product components
│   ├── data/v4/          # brief questions, segment themes, voter tiers, mock data
│   ├── lib/              # supabaseClient, AuthContext
│   └── utils/            # guest-blob helpers, anonymity rules, exports
├── supabase/
│   ├── migrations/       # 0001–0023 — the ENTIRE database, applied by hand in order
│   ├── functions/        # edge functions + _shared/ (email design system, rate limiting)
│   └── templates/        # repo copies of the 2 Supabase-dashboard email templates
├── docs/                 # the five handoff documents (+ docs/pdf/ for sharing)
└── public/               # favicons, email logo/icon PNGs (served at domain root)
```

## Quick start

Prereqs: Node 18+ (built on 24), npm, git.

```bash
npm install
cp .env.example .env      # 4 values — each one's origin: docs/GOING-LIVE.md §3
npm run dev               # http://localhost:5173
```

- Leave `VITE_BETA_PASSWORD` unset locally — unset means no gate.
- Test payments: card `4242 4242 4242 4242`, any future expiry/CVC/ZIP.
- To see all the emails without waiting out a real contest:
  `docs/TESTING-EMAILS.md`.

## How changes ship

- Work on **`backend`**. **`master` is production** — pushing it deploys via
  Vercel. Promote with
  `git checkout master && git merge --no-ff backend && git push`.
- Any branch push gets a Vercel preview URL (that's staging).
- `npm run build` must pass before every promote. **There is no CI** — the
  build is the only gate and the discipline is manual.
- Verifying a deploy landed: the SPA rewrite (`vercel.json`) answers
  HTTP 200 + `index.html` for *every* path, so status codes prove nothing —
  fetch the hashed `/assets/index-*.js` and grep it for your change.

## Database

All schema and server-side rules live in `supabase/migrations/0001–0023`.
**There is no migration runner** — files are applied by pasting into the
Supabase SQL editor, in order, and the repo copies are the source of truth.
New schema work = a new `NNNN_slug.sql`, applied the same way, committed.

Security is enforced in Postgres, not the UI: price derives from voter tier
(0017), payment/status columns are service-role-only (0021), voter capacity
is capped (0022), submissions are capped (0016), and anonymity plus hidden
vote tallies are resolved server-side (0018/0019). The full invariant list:
`docs/DEVELOPER-HANDBOOK.md` §6.

## Edge functions

```bash
npx supabase functions deploy <name> [--no-verify-jwt] --project-ref kgcggyuoezaygyawnlcs
```

| Function | JWT | Does |
|---|---|---|
| `launch-contest` | no¹ | guest launch: find-or-create account, insert draft (rate-limited) |
| `create-payment-intent` | yes | PaymentIntent from the server-side price |
| `confirm-launch` | yes | verifies payment with Stripe, flips contest live, sends receipt |
| `stripe-webhook` | no¹ | signature-verified backstop; delegates to confirm-launch |
| `notify` | no¹ | lifecycle emails, called by a DB trigger with a shared secret |
| `contact` | no¹ | contact form → inbox + visitor receipt (rate-limited, escaped) |

¹ deploy with `--no-verify-jwt` — each authenticates its own way (rate
limits + validation, the Stripe signature, or the notify secret).

Configuration lives in **three places**: Vercel env (`VITE_*`, build-time
inlined — changing one requires a redeploy), Supabase function secrets
(runtime, immediate), and Supabase Auth settings (SMTP, redirect allow-list,
the two email templates). The value-by-value map: `docs/GOING-LIVE.md` §3.

## The documentation set

Read in this order. PDFs of all five are in `docs/pdf/` for sharing.

1. **[`DEVELOPER-HANDBOOK.md`](docs/DEVELOPER-HANDBOOK.md)** — how the
   system works and why: architecture, migration catalog, security model,
   auth history, payment and email flows, known gaps.
2. **[`GOING-LIVE.md`](docs/GOING-LIVE.md)** — what to type: day-one setup,
   where every config value comes from, building a fresh environment, and
   the launch-day checklist for switching to live payments.
3. **[`TESTING-EMAILS.md`](docs/TESTING-EMAILS.md)** — driving a contest
   through its whole lifecycle in minutes.
4. **[`REVIEW-BRIEF.md`](docs/REVIEW-BRIEF.md)** — scope and priorities for
   the pre-launch security review, plus the builder's own hardening list.
5. **[`PLATFORM-GUIDE.md`](docs/PLATFORM-GUIDE.md)** — the plain-English
   client guide.

## Sharp edges — read before assuming

- **Auth-state races were the biggest historical bug source**, in two
  shapes: a localStorage "guest blob" (`v4_contest_setup`) standing in for
  a real session, and effects fetching RLS-protected data before auth
  resolved. Fixed where found. Any new `readSetup()` fallback must be
  gated on the absence of a session, and data effects need `authLoading` /
  `user?.id` in their deps.
- **Mock/demo scaffolding is woven through real pages** (~150
  `mockContest` branches across 14 files). Unrouted and documented
  (handbook §12) — read around it; removing it is a scoped refactor, not a
  cleanup.
- **The notify trigger hardcodes this project's ref in its URL** — a fresh
  environment must edit it or lifecycle emails route to production
  (GOING-LIVE §5).
- **Stripe webhook endpoints are per mode** — going live requires creating
  a NEW endpoint in live mode with its own signing secret (GOING-LIVE §4).
- **Some files are deliberately oddly named** (`PartnerSimulator`,
  `LegalCrumbs`) to dodge ad-blockers. Don't rename them back.
- **No automated tests.** The smoke test in GOING-LIVE §1 is the
  definition of "it works" — run it after anything significant.

No credentials live in this repo or its docs; access is shared privately.
