---
name: API Server DB Migration
description: Details of Step 1 DB migration — what changed, what is still in-memory, key shape decisions
---

# API Server DB Migration (Step 1)

## What changed
- All 4 route files (auth, products, orders, collections) now query Drizzle ORM + Replit PostgreSQL
- `@workspace/db` was already a dependency of `@workspace/api-server` — no new wiring needed
- `drizzle-kit push --force` run against live DB to create all tables
- Seed runs on server startup via `seedDatabase()` in `src/seed/index.ts` — idempotent (skips if records exist)

## What is still in-memory (Step 2 will fix)
- Auth tokens: `Map<string, string>` (token → userId). Lost on restart. Step 2 = JWT access tokens + DB refresh tokens.
- Passwords: SHA-256 + hardcoded salt "gen-era-salt". Step 2 = bcrypt cost 12.

## Key shape decisions
- `colors` field: stored as TEXT (JSON string) in `productsTable.colors`. Always JSON.parse on read, JSON.stringify on write.
- `_id` compatibility: all routes return `_id: record.id` so frontend code expecting `_id` continues to work.
- Order lookup: GET /orders/:id checks UUID regex → queries by `id`; otherwise queries by `orderNumber`.
- Product lookup in orders: accepts UUID (new) OR slug (backward compat with old carts that stored slug-like IDs).

## Files created
- `artifacts/api-server/src/lib/db.ts` — re-exports db + tables from @workspace/db
- `artifacts/api-server/src/seed/products.ts` — SEED_PRODUCTS + SEED_COLLECTIONS arrays
- `artifacts/api-server/src/seed/index.ts` — seedDatabase() function

**Why:** DB UUID IDs replace the old `prod_001`-style IDs. Frontend cart will get new UUIDs from the API naturally on next load.
