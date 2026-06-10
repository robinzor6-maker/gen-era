---
name: API server in-memory backend
description: API server uses in-memory stores; order prices must be resolved server-side from catalog.
---

# API Server In-Memory Backend

**Rule:** Order prices must always be resolved server-side from the authoritative product catalog. Never trust client-submitted prices.

**How:** `orders.ts` calls `getProducts()` to fetch catalog prices, then builds `resolvedItems` from those values. The `totalPrice` is computed from server prices, not the client payload.

**Port:** API server listens on port 8080 (set by workflow env `PORT`).
**Routes:** All at `/api/v1/products`, `/api/v1/auth`, `/api/v1/orders`.
**No DB yet:** All data is in-memory arrays; data is lost on server restart.
