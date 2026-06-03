# infra/supabase

Supabase project for HOLO Core (Postgres, anonymous-first Auth, Storage).

> Reminder (see root `CLAUDE.md`): the frontend never touches the database.
> Only HOLO Core reads/writes Supabase, and apps reach Core exclusively through `@holo/sdk`.

## Schema (S14)

`migrations/` holds versioned, **idempotent** SQL applied in filename order:

| File | What it does |
|------|--------------|
| `20260603090000_init_schema.sql` | The nine tables + minimal indexes |
| `20260603090100_merge_user.sql` | `merge_user(from, into)` function |
| `20260603090200_seed_soulseed_product.sql` | Seeds the `soulseed` product row |

**Tables:** `users`, `sessions`, `events`, `memories`, `hurls`, `artifacts`, `agent_runs`, `products`, `entitlements`.

**Anonymous-first:** `users.email` is nullable — a user exists from first entry with `email = NULL`; the email is set later at the export chamber, no row migration needed.

**`merge_user(from, into)`** re-points `sessions`, `events`, `memories`, `hurls`, `artifacts`, `entitlements` from the anonymous user onto the canonical user in a single transaction, then deletes the `from` row. `agent_runs` and `products` are global/shared and are intentionally **not** re-pointed (`agent_runs.user_id` is `on delete set null`, so deleting `from` never fails).

**v1 minimal:** no `pgvector`, no graph DB, no RLS policies beyond defaults. (The `memories.embedding` column is deliberately omitted until pgvector is turned on in a later version.)

## Applying the migrations

**With the Supabase CLI** (requires Docker for local; or link to a project):

```bash
# from infra/supabase
supabase db push                 # to a linked remote project
# or, local stack (needs Docker running):
supabase start && supabase migration up
```

**With plain `psql`** (any Postgres 13+):

```bash
for f in infra/supabase/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

Migrations are idempotent, so re-running is safe (you'll see `... already exists, skipping` notices).
