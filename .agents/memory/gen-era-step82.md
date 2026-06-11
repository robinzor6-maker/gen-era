---
name: GEN ERA STEP 8.2 Commerce Expansion Layer
description: Architecture decisions and patterns for the product statues, claim ceremony, district system, lore engine, analytics, and search system built in STEP 8.2
---

## Key decisions

**Lore engine is single source of truth** (`src/lib/lore/generateLore.ts`):
- Exports: `District`, `Rarity`, `StatueType` types
- Exports: `getDistrict()`, `getRarity()`, `getStatueType()`, `generateLore()`, `generateShortLore()`
- Exports: `RARITY_COLORS`, `DISTRICT_COLORS` constant maps
- All components that need district/rarity/color info must import from here — no local color logic

**Why:** Prevents color inconsistencies across ProductPedestal, ProductChamber, ChamberScene, ProductStatue, TempleDistrictManager.

**Product statue types** (`src/components/temple/statues/ProductStatue.tsx`):
- Egyptian-mythological mapping: hoodie→Crown, jacket→Breastplate, tshirt→Ankh, pants→Obelisk pair, cap→Khepresh, pendant→Scarab, bracelet→Cartouche, ring→Ouroboros
- Each is its own functional R3F component with useFrame animation
- Rendered at position `[0, 1.1, 0]` above the pedestal slab inside ProductPedestal

**Claim Ceremony** (`src/components/temple/effects/ClaimCeremony.tsx`):
- 4-phase fullscreen 2D overlay using Framer Motion + canvas 2D particles
- Triggered via `templeStore.startCeremony(name, accent)` / `endCeremony()`
- Rendered outside the Canvas in ProductChamber, uses `AnimatePresence`
- Auto-completes after 3500ms, calls `onComplete` which calls `endCeremony()`

**Temple Districts** (`src/components/temple/TempleDistrictManager.tsx`):
- Rendered inside the R3F Canvas as sibling to ProductPedestals
- Three gateways: ANKHRON (north-east), OSYRON (south), GEN CORE (west)
- Receives full `allProducts` array (not filtered) for district beacon placement

**Search overlay** (`src/components/temple/TempleSearchOverlay.tsx`):
- HTML overlay outside Canvas, keyboard shortcut `/` to focus, `Escape` to clear
- `useTempleSearch` (state hook) + `useTempleFilters` (memo computation hook)
- Both hooks called at TempleScene level, filtered array passed to TempleProducts

**Analytics tables** (DB schema: `lib/db/src/schema/analytics.ts`):
- `artifact_views`, `artifact_chamber_visits`, `artifact_claims`
- API routes at `/api/v1/analytics/{view,chamber,claim}` — fire-and-forget POST
- Dashboard at `GET /api/v1/analytics/dashboard` — no auth required (public metrics)

**How to apply:**
- When adding new product categories, add to `getStatueType()` and create the corresponding R3F component in `ProductStatue.tsx`
- When changing the district logic, update ONLY `getDistrict()` in generateLore.ts
- Analytics events: import `api` from `@/lib/api` and call `api.post('/analytics/view', {...}).catch(()=>{})` (fire-and-forget)
