# GEN ERA — Project Status

> **Stack:** React + Vite (frontend) · Express (API) · Wouter routing · Zustand · Three.js / R3F · Tailwind v4
> **Preview path:** `/` · **API:** `/api/v1`
> **Last updated:** 2026-06-10

---

## ✅ Completed

### Core Infrastructure
- ✅ pnpm monorepo: `artifacts/gen-era` (frontend) + `artifacts/api-server` (backend)
- ✅ TypeScript end-to-end — full Product, CartItem, Order, User, Collection types
- ✅ Zustand stores: Cart (persisted), Wishlist (persisted), Auth/App (persisted)
- ✅ API layer (`api.ts`) with Bearer token support and base URL from `VITE_API_URL`
- ✅ Product store (`productStore.ts`) with pagination, search, category filtering

### Product System
- ✅ 8 seed products (prod_001–prod_008) fully detailed:
  - subtitle, collection, comparePrice, colors[], sizes[], material, weight, shippingInfo, rating, reviewCount, longDescription, gallery[]
- ✅ 3 collections: `void-season-i`, `ankh-protocol`, `nile-fire`
- ✅ Arabic locale pricing (`ج.م`)
- ✅ Category filter (CLOTHING / ACCESSORIES / ALL)
- ✅ Search with query params to API
- ✅ Pagination (server-side, 9 per page)
- ✅ Featured products section on store page

### Product Cards & Detail
- ✅ ProductCard: wishlist button, collection badge, discount % badge, star ratings, subtitle, compare price strikethrough
- ✅ ProductDetailPage: color swatch selector, size grid, quantity selector (capped by stock), compare price + SAVE % badge, star ratings + review count, material / weight / shipping specs, wishlist button, stock status, long description

### Cart & Checkout
- ✅ CartDrawer: full UI, quantity controls, remove, running total, checkout link
- ✅ AddToCartButton with out-of-stock guard
- ✅ CheckoutPage: full form (name, email, phone, address, city, notes), guest + auth flow, order summary, success screen
- ✅ Guest checkout: direct order submission, no silent registration required
- ✅ Auth-aware: pre-fills name/email if logged in

### Order System (API)
- ✅ `customerType`: `"guest"` | `"registered"`
- ✅ `customer` snapshot object: name, email, phone, address, city
- ✅ `orderNumber` auto-generated: `ORD-{timestamp}-{seq}`
- ✅ Server-side price validation: client-submitted prices are ignored; server resolves from catalog
- ✅ GET /orders (auth-required, admin sees all), GET /orders/:id

### Wishlist
- ✅ WishlistButton component (heart toggle, gold glow on active)
- ✅ Heart on every ProductCard (top-right corner)
- ✅ Heart on ProductDetailPage
- ✅ `/wishlist` page: product grid, add-to-cart, clear all, persists across sessions

### Experience Pages
- ✅ `/lore` — 6-chapter cinematic universe (Before the First Light, Pharaohs Were Cyborgs, Temple is a Server, Void Season, Ankh Protocol, The Archive Expands): sidebar chapter nav, scroll progress bar, animated glyph watermarks
- ✅ `/ar` — AR Portal: getUserMedia camera access, 3 modes (TRY-ON live · Glyph Scan soon · Void Portal soon), HUD overlays when active (reticle, corner brackets, status), device capability detection (camera / mobile / WebXR), future protocols panel

### 3D Temple
- ✅ Three.js temple scene: Pillars, Portal, Particles, Glyphs, Floor, CameraRig, TempleLights
- ✅ `/temple` and `/community` both render the 3D scene

### Auth System
- ✅ Register + Login pages
- ✅ JWT token auth: Bearer tokens, stored in Zustand + localStorage
- ✅ `/api/v1/auth/register`, `/login`, `/profile`

### API Routes
- ✅ `GET  /api/v1/products` — list, search, category, pagination
- ✅ `GET  /api/v1/products/featured`
- ✅ `GET  /api/v1/products/:slug`
- ✅ `GET  /api/v1/collections`
- ✅ `POST /api/v1/orders`
- ✅ `GET  /api/v1/orders` (auth)
- ✅ `GET  /api/v1/orders/:id`
- ✅ `POST /api/v1/auth/register`
- ✅ `POST /api/v1/auth/login`
- ✅ `GET  /api/v1/auth/profile`

---

## ⚠ Partially Completed

- ⚠ **StorePage filter** — category filter works (Clothing / Accessories); no collection filter (Void Season I / Ankh Protocol / Nile Fire) yet
- ⚠ **Product images / 3D models** — all product `image` fields are `""`, `gallery: []`, `modelPath: ""`; cards/detail show glyph placeholder (𓂀). ProductViewer and ProductGallery components exist but have no real assets to render
- ⚠ **Auth persistence** — in-memory only; users/tokens reset on API server restart. PostgreSQL + Drizzle is in the stack but not yet wired up
- ⚠ **CommunityPage** — renders the 3D temple scene only; no actual community content (feed, member leaderboard, comments, recent orders)

---

## ❌ Missing / Not Started

- ❌ **Payment gateway** — no Stripe / payment integration; orders are placed but no actual payment is collected
- ❌ **Database persistence** — all data (products, orders, users) is in-memory and resets on server restart. DB schema exists (`packages/db`) but migration not run
- ❌ **Real product images** — product catalog needs image assets and 3D `.glb` model files
- ❌ **Collection filter in StorePage** — `/api/v1/collections` exists; UI filter chip row not yet added to StorePage
- ❌ **User dashboard** — no `/dashboard` page; no order history view for logged-in users
- ❌ **Admin CMS** — no admin panel for managing products, orders, inventory
- ❌ **Email notifications** — no order confirmation emails
- ❌ **SEO / meta tags** — no `<head>` meta management (title, description, OG tags per page)
- ❌ **Product reviews** — `rating` / `reviewCount` are static seed data; no real review submission system

---

## Priority Roadmap

### 🔴 P0 — Critical (Core e-commerce loop)
| # | Task | Why |
|---|------|-----|
| P0.1 | Add collection filter chips to StorePage | `/api/v1/collections` is ready; this is the last store UX gap |
| P0.2 | Stripe payment integration | No revenue without payment; orders are currently unpaid COD-style |
| P0.3 | Database persistence (Drizzle migrations) | All data resets on server restart; blocks production viability |

### 🟡 P1 — Important (Complete the vision)
| # | Task | Why |
|---|------|-----|
| P1.1 | Real product images + thumbnails | Store shows placeholder glyphs; critical for credibility |
| P1.2 | User dashboard + order history | Logged-in users can't see their past orders |
| P1.3 | Community Page content | Currently just renders the 3D scene; needs social layer |
| P1.4 | 3D GLB model files | ProductViewer is ready; need `.glb` assets |

### 🟢 P2 — Enhancement (Polish & scale)
| # | Task | Why |
|---|------|-----|
| P2.1 | Product reviews system | Currently static seed ratings |
| P2.2 | Admin CMS panel | Managing products without touching code |
| P2.3 | SEO meta tags per page | Discoverability |
| P2.4 | Email order confirmations | Professional post-purchase UX |
| P2.5 | Snap / Instagram AR filters | Extend the AR Portal protocol |

---

## Next Logical Task

**P0.1 — Collection filter in StorePage**

The API is already live. Add a second filter row of collection chips (VOID SEASON I · ANKH PROTOCOL · NILE FIRE · ALL) below the category filter. Wire to `?collection=` query param in the products API. Estimated: ~1 hour.

Then immediately after: **P0.2 — Stripe payment**.

---

## File Map

```
artifacts/
├─ gen-era/src/
│  ├─ pages/         HomePage, StorePage, ProductDetailPage, CheckoutPage,
│  │                 WishlistPage, LorePage, ARPage, TemplePage, CommunityPage,
│  │                 LoginPage, RegisterPage
│  ├─ components/
│  │  ├─ store/      ProductCard, ProductDetailPage, CartDrawer, AddToCartButton,
│  │  │              WishlistButton, ProductViewer, ProductGallery, SearchBar,
│  │  │              CategoryFilter, Pagination
│  │  └─ scene/      TempleScene, Pillars, Portal, Particles, Glyphs, Floor,
│  │                 CameraRig, TempleLights, Viewer
│  ├─ lib/           types.ts, store.ts, api.ts, hooks.ts
│  └─ stores/        productStore.ts
│
└─ api-server/src/routes/
   ├─ products.ts    GET list/featured/:slug — source of truth for product catalog
   ├─ orders.ts      POST/GET — imports from products.ts, server-side price lock
   ├─ collections.ts GET /collections
   └─ auth.ts        register/login/profile — in-memory, JWT tokens
```
