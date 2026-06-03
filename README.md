# holo-platform

A monorepo for the **HOLO Core** foundation and its products.

- **Product One — SoulSeed Compass** (`apps/soulseed-compass`): a thin "HOLOSCROLLY" front-end.
- **HOLO Core** (`services/holo-core-api`): the reusable foundation that owns data, memory, agents, orchestration, and HURL minting.

> Foundation-led, product-proven. Apps are thin shells; Core owns everything that matters.

## Layout

```
holo-platform/
├── apps/
│   └── soulseed-compass/        # Next.js App Router front-end (Product One)
├── services/
│   └── holo-core-api/           # HOLO Core (placeholder package for v1)
├── packages/
│   ├── contracts/               # @holo/contracts — Zod schemas + inferred types
│   ├── holo-sdk/                # @holo/sdk — the only way apps talk to Core
│   ├── hdom/                    # @holo/hdom — HOLO document object model
│   ├── product-manifests/       # @holo/product-manifests — chamber flow as data
│   ├── agent-prompts/           # @holo/agent-prompts — all agent prompts
│   └── ui/                      # @holo/ui — shared UI primitives
├── infra/
│   └── supabase/                # Supabase project config (placeholder)
└── docs/                        # Architecture & contract docs (placeholder)
```

## Prerequisites

- Node.js >= 18.18
- pnpm 10.x (`corepack enable` then `corepack use pnpm@10.16.1`)

## Commands

| Command              | What it does                                  |
| -------------------- | --------------------------------------------- |
| `pnpm install`       | Install all workspace dependencies            |
| `pnpm -w build`      | Build every package + app via Turborepo       |
| `pnpm -w lint`       | Lint the whole repo (ESLint flat config)      |
| `pnpm -w typecheck`  | Type-check every workspace                    |
| `pnpm -w dev`        | Run dev tasks (Next dev server for the app)   |
| `pnpm --filter soulseed-compass dev` | Run only the SoulSeed Compass dev server |

## Status

**S0 — Monorepo scaffold.** Everything compiles end-to-end; no business logic yet.
