# NamingContest.com

Paid naming-contest platform. React 18 + Vite SPA, Supabase (Postgres/RLS,
Deno edge functions, pg_cron), Stripe Payment Intents + webhook, Resend
email, Vercel hosting.

**Start here → [`docs/`](docs/)** — in reading order:

1. [`DEVELOPER-HANDBOOK.md`](docs/DEVELOPER-HANDBOOK.md) — how the system works and why
2. [`GOING-LIVE.md`](docs/GOING-LIVE.md) — day-one setup, every config value's origin, fresh environments, launch checklist
3. [`TESTING-EMAILS.md`](docs/TESTING-EMAILS.md) — exercising the email lifecycle in minutes
4. [`PLATFORM-GUIDE.md`](docs/PLATFORM-GUIDE.md) — the plain-English client guide
5. [`REVIEW-BRIEF.md`](docs/REVIEW-BRIEF.md) — scope for the pre-launch security reviewer

Quick start:

```bash
npm install
cp .env.example .env   # fill in — see GOING-LIVE.md §3
npm run dev            # http://localhost:5173
```

Work on `backend`; merging to `master` and pushing deploys production via
Vercel. `npm run build` must pass first — there is no CI.
