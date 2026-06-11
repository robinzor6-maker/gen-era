---
name: GEN ERA DB schema
description: DB schema push required before products API works; seed runs on startup
---

Schema must be pushed before the API seed can run. The seed is triggered on API server startup (`src/index.ts`). Run: `pnpm --filter @workspace/db run push` then restart the API Server workflow. Seed populates 8 products and 3 collections.

**Why:** Drizzle schema isn't auto-migrated in dev — must be explicitly pushed. Products API returns 500 (relation does not exist) until this is done.

**How to apply:** Whenever a fresh DB is connected or schema changes are made, push before restarting API.
