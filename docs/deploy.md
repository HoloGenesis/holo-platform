# deploy.md — SoulSeed Compass + HOLO Core (S28)

How to take the monorepo live. **Code, CI, and env wiring are done** (this repo);
the steps below run against **Brooks's accounts** (Vercel, Supabase, domain, API
keys) and must be executed by someone with those credentials.

For v1, HOLO Core runs as Next.js API routes *inside* the SoulSeed Compass app,
so there is **one deployment** (one Vercel project) serving both the UI and `/v1/*`.

---

## 0. Prerequisites

- The repo is pushed to GitHub (CI runs on PR — see `.github/workflows/ci.yml`).
- A Supabase project (prod) and, ideally, a second (staging).
- A Vercel account with access to the GitHub repo.
- Optional for v1: Anthropic key (live agent), Stripe keys (live payments). Both
  default OFF — the app ships fully functional in **mock agent + free-beta** mode.

---

## 1. Supabase (database)

1. Create the project(s). Note the **Connection string (URI)** under
   *Project Settings → Database* — this is `DATABASE_URL`. Use the **pooled**
   connection (port 6543, `?pgbouncer=true`) for Vercel serverless.
2. Run the migrations against the project, in order:
   ```bash
   for f in infra/supabase/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
   # or, with the Supabase CLI linked to the project:
   #   supabase link --project-ref <ref> && supabase db push
   ```
   This creates the 9 tables + `merge_user()` + the `soulseed` product seed
   (all idempotent — safe to re-run). **Run staging first if available.**
3. Verify: `psql "$DATABASE_URL" -c "\dt"` shows the 9 tables; `select * from products;`
   shows the `soulseed` row.

> Note: `SUPABASE_SERVICE_ROLE_KEY` is **server-side only**. v1 Core connects via
> `DATABASE_URL` (direct Postgres); the service-role key is reserved for future
> Supabase JS / Storage use. Never expose it to the client.

---

## 2. Vercel (app + Core routes)

1. **New Project** → import the GitHub repo.
2. **Root Directory:** `apps/soulseed-compass`. Enable "Include files outside the
   root directory" so the workspace packages resolve.
3. **Framework:** Next.js (auto-detected). Vercel detects pnpm + `pnpm-workspace.yaml`.
   - Install command: `pnpm install` (run at repo root by Vercel's monorepo detection)
   - Build command: `pnpm build` (i.e. `next build`)
4. **Environment variables** (Project Settings → Environment Variables). Set these
   for **Production** (and Preview/staging). See `.env.example` for the full list:

   | Var | Scope | Notes |
   |-----|-------|-------|
   | `HOLO_ENV` | server | `production` / `staging` |
   | `DATABASE_URL` | server | Supabase pooled Postgres URI |
   | `SUPABASE_URL` | server | project URL (future use) |
   | `SUPABASE_SERVICE_ROLE_KEY` | **server only** | never `NEXT_PUBLIC_` |
   | `AGENT_MODE` | server | `mock` (default) or `live` |
   | `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | server | only if `AGENT_MODE=live` |
   | `PAYMENTS_ENABLED` | server | `false` (free beta) or `true` |
   | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | server | only if payments live |
   | `APP_URL` | server | the production URL (Stripe redirects) |
   | `NEXT_PUBLIC_HOLO_CORE_URL` | client | leave empty (Core is same-origin in v1) |

5. **Deploy.** Vercel builds on every push; PRs get Preview URLs.

---

## 3. Domain

- Vercel → Project → Domains → add Brooks's domain; follow the DNS records.
- Set `APP_URL` to the final URL and redeploy (so Stripe redirects resolve).

---

## 4. Stripe (only if `PAYMENTS_ENABLED=true`)

1. Create the Webhook endpoint → `https://<domain>/v1/stripe/webhook`,
   event `checkout.session.completed`. Copy the signing secret → `STRIPE_WEBHOOK_SECRET`.
2. Set `STRIPE_SECRET_KEY` (test keys for staging, live keys for prod).
3. With both unset, payments stay in free-beta/mock — no Stripe required to ship.

---

## 5. Production validation (the walking-skeleton chain)

On the production URL:
1. Open `/` → REZZIE greets at the threshold (session minted in prod Supabase).
2. Walk all six chambers → SoulSeed Snapshot + HURL render at the Living Invitation.
3. Copy the HURL, open it in a fresh browser via `/?hurl=<encoded>` →
   "Last time you were …" return loop restores prior state.
4. Spot-check in Supabase: rows in `users` (email null), `sessions`, `events`,
   `memories`, `agent_runs`, `hurls`, `artifacts`.

If steps 1–4 work, the foundation is live.

---

## Rollback

Vercel keeps every deployment — use *Promote to Production* on a previous green
deployment to roll back instantly. DB migrations are additive/idempotent; a bad
release is a frontend/route rollback, not a data migration.

---

## What Code does with this next

S28 ships the code, CI, and env wiring. The live cutover above is a credentialed,
manual step on Brooks's infra. After it's live, Sprint 6 (S29 HOLOBOOK stub, S30
"how to add a HOLOSCROLLY") proves the foundation is reusable.
