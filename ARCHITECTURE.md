# GEN ERA — Architecture Reference

## Overview

GEN ERA is a pharaonic cyberpunk luxury streetwear e-commerce platform built as a full-stack monorepo.

```
workspace/
├─ artifacts/
│  ├─ gen-era/          # React + Vite SPA (frontend)
│  └─ api-server/       # Express 5 API (backend)
├─ lib/
│  ├─ db/               # PostgreSQL schema (Drizzle ORM)
│  └─ api-zod/          # Shared Zod validation schemas
└─ scripts/             # Build/migration utilities
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, Wouter (routing) |
| State | Zustand (persisted via localStorage) |
| 3D / AR | Three.js, @react-three/fiber, @react-three/drei |
| Styling | Tailwind v4, custom CSS variables |
| Backend | Express 5, TypeScript, pino (logging) |
| Database | PostgreSQL, Drizzle ORM, drizzle-zod |
| Validation | Zod v4 |
| Security | helmet, express-rate-limit |
| Build | esbuild (API), Vite (frontend) |
| Package manager | pnpm workspaces |

## Frontend Architecture

### Routing (`/artifacts/gen-era/src/App.tsx`)
Wouter-based SPA routing, base path from `import.meta.env.BASE_URL`.

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | 3D product showcase |
| `/store` | StorePage | Product catalog with filters |
| `/store/:slug` | ProductDetailPage | Product detail + 3D viewer |
| `/checkout` | CheckoutPage | Order placement |
| `/wishlist` | WishlistPage | Saved products |
| `/account` | AccountPage | Profile, orders, settings |
| `/lore` | LorePage | Universe lore (6 chapters) |
| `/ar` | ARPage | Augmented reality portal |
| `/temple` | TemplePage | 3D temple experience |
| `/community` | CommunityPage | Community hub |
| `/login` | LoginPage | Authentication |
| `/register` | RegisterPage | Registration |

### State Stores (`/artifacts/gen-era/src/lib/store.ts`)

| Store | Persistence | Purpose |
|-------|-------------|---------|
| `useCartStore` | `gen-era-cart` | Cart items, total, drawer state |
| `useWishlistStore` | `gen-era-wishlist` | Saved product IDs |
| `useStore` | `gen-era-auth` | User session, JWT token |

### API Client (`/artifacts/gen-era/src/lib/api.ts`)
- Base URL: `(VITE_API_URL || '') + '/api/v1'`
- Automatic Bearer token injection from `localStorage.genEraToken`
- GET, POST, PUT, DELETE methods

## Backend Architecture

### API Routes

```
/api/v1/
├─ health            GET  — health check
├─ products/         GET  — list (search, category, collection, price, stock filters)
├─ products/featured GET  — featured products
├─ products/:slug    GET  — single product
├─ collections/      GET  — all collections
├─ orders/           POST — create order (guest or registered)
├─ orders/           GET  — list orders (auth required)
├─ orders/:id        GET  — single order
├─ auth/register     POST — register user
├─ auth/login        POST — login user
└─ auth/profile      GET  — get profile (auth required)
```

### Security Middleware (`/artifacts/api-server/src/app.ts`)
- `helmet` — HTTP security headers (CSP disabled for WebGL compatibility)
- `express-rate-limit` — 200 req/15min global; 20 req/15min on auth routes
- CORS — credentials: true, all origins (tighten for production)
- Body limit — 2MB max JSON payload

### Order Flow
```
Client submits order (productId + quantity only)
  → Server resolves product from catalog (price locked server-side)
  → Creates order with: customerType, customer snapshot, orderNumber
  → Returns: Order with all fields
  [Future] → Stripe Checkout Session created
  [Future] → Webhook confirms payment → status: paid
```

## Database Schema (`/lib/db/src/schema/`)

### Tables

```sql
users         — UUID PK, email unique, role enum, soft-delete
products      — UUID PK, slug unique, category/collection indexes
collections   — UUID PK, slug unique
orders        — UUID PK, orderNumber unique, userId FK (nullable for guests)
order_items   — UUID PK, orderId FK (cascade), productId
wishlist_items — UUID PK, (userId, productId) unique constraint
```

### Key Design Decisions
- **UUID primary keys** — no sequential IDs exposed publicly
- **Soft deletes** — `deleted_at` timestamp on user-facing tables
- **Snapshot architecture** — orders capture customer data at time of purchase
- **Server-side price lock** — client never submits prices; resolved from catalog
- **Guest orders** — `userId` is nullable; `customerType` differentiates

## Product Filtering (`GET /api/v1/products`)

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Full-text search (name, subtitle, description, tags) |
| `category` | string | `clothing` or `accessories` |
| `collection` | string | Collection slug (e.g. `void-season-i`) |
| `minPrice` | integer | Minimum price in EGP |
| `maxPrice` | integer | Maximum price in EGP |
| `inStock` | boolean | Only in-stock products |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Per page (max: 50, default: 9) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | Auto-assigned | Server port (Replit assigns per artifact) |
| `VITE_API_URL` | Optional | API base URL (empty = same origin) |

## Data Flow: Add to Cart → Checkout

```
1. User clicks "Add to Cart"
   → CartStore.addToCart(product, qty, size, color)
   → Price snapshot taken from product object

2. User navigates to /checkout
   → CheckoutPage renders cart items
   → User fills shipping form

3. User submits order
   → POST /api/v1/orders
   → Payload: { customer, items: [{productId, quantity}], notes }
   → Server resolves prices from catalog (client prices ignored)
   → Returns complete Order object with orderNumber

4. Success screen shows orderNumber, customer snapshot, total
   → Cart cleared
```
