# GEN ERA — Temple Commerce Universe

An Egyptian-futuristic immersive e-commerce universe built in a 3D temple. Users enter a WebGL environment, discover products on sacred pedestals as Egyptian-mythological statues, examine them in the Artifact Chamber, and claim them through a cinematic ceremony.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server (port 3001)
- `pnpm --filter @workspace/gen-era run dev` — Frontend (port 5000, proxies /api → 3001)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 3001)
- Frontend: React 19 + Vite + R3F (Three.js) + Framer Motion
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/gen-era/src/` — frontend
  - `components/temple/` — all 3D temple components
    - `statues/ProductStatue.tsx` — Egyptian mythological product statues by category
    - `effects/ClaimCeremony.tsx` — 4-phase cinematic claim overlay
    - `TempleDistrictManager.tsx` — 3 district gateways inside R3F Canvas
    - `TempleSearchOverlay.tsx` — search/filter UI overlay (HTML, outside Canvas)
    - `TempleScene.tsx` — root scene, wires search + districts + products
    - `products/ProductPedestal.tsx` — pedestal + statue + hover panel
    - `chamber/ProductChamber.tsx` — fullscreen artifact examination view
    - `chamber/ChamberScene.tsx` — district/rarity-aware R3F chamber
  - `lib/lore/generateLore.ts` — SINGLE SOURCE OF TRUTH for district, rarity, lore, colors
  - `hooks/useTempleSearch.ts` — search state
  - `hooks/useTempleFilters.ts` — product filter logic
  - `stores/templeStore.ts` — Zustand store (selectedProduct, ceremony state)
- `artifacts/api-server/src/routes/analytics.ts` — commerce analytics API
- `lib/db/src/schema/analytics.ts` — artifact_views, chamber_visits, claims tables

## Architecture decisions

- **Lore engine is single source of truth** — all district/rarity/color logic lives in `generateLore.ts`. Never duplicate color logic in individual components.
- **Product statues are Egyptian-mythological** — hoodie→Crown, jacket→Breastplate, tshirt→Ankh, pants→Obelisks, cap→Khepresh, pendant→Scarab, bracelet→Cartouche, ring→Ouroboros. Procedural Three.js geometry, no external model files needed.
- **Claim Ceremony is a 2D fullscreen overlay** — not inside the R3F Canvas. Uses canvas 2D particles + Framer Motion. Triggered via Zustand `startCeremony()`.
- **Analytics is fire-and-forget** — `api.post('/analytics/...', ...).catch(()=>{})`. Never block UX on analytics.
- **Search lives outside Canvas** — `useTempleSearch` + `useTempleFilters` hooks run at `TempleScene` level and pass filtered products as props to the R3F scene.

## Product

- 3D Egyptian-futuristic temple with 9 product pedestals displaying category-specific statues
- Three Temple Districts: ANKHRON (cyan, archive), OSYRON (orange, fire), GEN CORE (gold, essential)
- Rarity system: rare (gold), epic (orange), legendary (white-gold) — drives aura intensity and particle count
- Dynamic lore generated per product based on district, rarity, collection, and stock
- Artifact Chamber: fullscreen 3D examination with district/rarity-themed orbit rings and particles
- Claim Ceremony: 4-phase cinematic animation (pulse → particles → beam → portal → claimed)
- Temple Search: keyboard-driven search overlay (`/` to activate) with district filter buttons
- Commerce Analytics: tracks views, chamber visits, and claims — admin dashboard at `/api/v1/analytics/dashboard`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- R3F screenshot tool captures dark — trust browser console logs over screenshots for debugging
- The `TS7016` three.js type errors in typecheck are pre-existing noise from the `objects/` folder — not blocking
- `@types/three` is not installed at the workspace root, so `objects/` files get implicit any for `three` imports — existing pattern, don't fix without workspace-level type setup
- Analytics routes don't require auth (by design) — views/claims are public metrics

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
