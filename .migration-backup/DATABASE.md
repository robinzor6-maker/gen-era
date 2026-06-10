# GEN ERA — Database Reference

## Technology

- **Database:** PostgreSQL (Replit managed)
- **ORM:** Drizzle ORM v0.45+
- **Validation:** drizzle-zod + Zod v4
- **Package:** `@workspace/db` at `lib/db/`

## Setup

```bash
# Push schema to development database
pnpm --filter @workspace/db run push

# Force push (drops conflicting tables)
pnpm --filter @workspace/db run push-force
```

## Required Environment Variable

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

## Schema Overview

```
users
  └─ orders (userId FK, nullable for guests)
       └─ order_items (orderId FK, cascade delete)
  └─ wishlist_items (userId FK, cascade delete)

collections   (standalone — no FK to products yet)
products      (standalone — collection referenced by slug string)
```

## Tables

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | SHA-256 + salt |
| role | TEXT | enum: user, admin |
| avatar | TEXT | URL or empty string |
| is_verified | BOOLEAN | Default false |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |
| deleted_at | TIMESTAMPTZ | Soft delete |

### `collections`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| slug | TEXT | UNIQUE (e.g. `void-season-i`) |
| name | TEXT | Display name |
| description | TEXT | |
| season | TEXT | e.g. `SS2025` |
| year | INTEGER | |
| cover_glyph | TEXT | Egyptian hieroglyph character |
| cover_image | TEXT | URL |
| active | BOOLEAN | Default true |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | Soft delete |

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| slug | TEXT | UNIQUE (URL identifier) |
| name | TEXT | |
| subtitle | TEXT | |
| collection | TEXT | Collection slug (string FK) |
| short_description | TEXT | |
| description | TEXT | |
| long_description | TEXT | Nullable |
| price | INTEGER | EGP, in whole pounds |
| compare_price | INTEGER | Original price (nullable) |
| category | TEXT | enum: clothing, accessories |
| tags | TEXT[] | Array |
| colors | TEXT | JSON string of `{name,hex}[]` |
| sizes | TEXT[] | Array |
| image | TEXT | Primary image URL |
| gallery | TEXT[] | Additional images |
| model_path | TEXT | GLB file path |
| texture_path | TEXT | Texture file path |
| material | TEXT | |
| weight | TEXT | |
| shipping_info | TEXT | |
| stock | INTEGER | Current inventory |
| featured | BOOLEAN | |
| active | BOOLEAN | Soft visibility toggle |
| rating | NUMERIC(3,1) | 0.0–5.0 |
| review_count | INTEGER | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | Soft delete |

**Indexes:** category, collection, featured, active, price

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| order_number | TEXT | UNIQUE, auto-generated (`ORD-{ts}-{seq}`) |
| user_id | UUID | FK → users.id, nullable (guest orders) |
| customer_type | TEXT | enum: guest, registered |
| customer_name | TEXT | Snapshot at order time |
| customer_email | TEXT | Snapshot |
| customer_phone | TEXT | Snapshot |
| customer_address | TEXT | Snapshot |
| customer_city | TEXT | Snapshot |
| total_price | INTEGER | Server-computed, in EGP |
| notes | TEXT | Delivery instructions |
| order_status | TEXT | enum: pending, paid, processing, shipped, delivered, cancelled |
| payment_status | TEXT | enum: unpaid, paid, refunded, failed |
| payment_ref | TEXT | Nullable, payment gateway reference |
| stripe_session_id | TEXT | Nullable, Stripe Checkout session |
| stripe_payment_intent_id | TEXT | Nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |
| deleted_at | TIMESTAMPTZ | Soft delete |

**Indexes:** user_id, customer_email, order_status, payment_status, created_at

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| order_id | UUID | FK → orders.id (cascade delete) |
| product_id | TEXT | Snapshot of product ID |
| name | TEXT | Snapshot of product name |
| price | INTEGER | Snapshot of price at purchase time |
| image | TEXT | Snapshot of image URL |
| sku | TEXT | Product slug at time of purchase |
| quantity | INTEGER | |
| selected_size | TEXT | Nullable |
| selected_color | TEXT | Nullable |
| created_at | TIMESTAMPTZ | |

### `wishlist_items`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| user_id | UUID | FK → users.id (cascade delete) |
| product_id | TEXT | Product ID string |
| created_at | TIMESTAMPTZ | |

**Constraints:** (user_id, product_id) UNIQUE — prevents duplicates

## Architecture Decisions

### Why integer prices (not DECIMAL)?
Egyptian Pound prices are always whole numbers in our catalog. Storing as integer avoids floating-point precision issues and simplifies arithmetic. Display layer formats with `toLocaleString('ar-EG')`.

### Why snapshot customer data in orders?
Customers may change their email/address after ordering. The order record must permanently reflect the state at the time of purchase. The `customer_name`, `customer_email` etc. columns are snapshots, not references.

### Why soft deletes?
Legal requirements and order history integrity. An admin deleting a user must not orphan their order history. Soft deletes allow recovery and maintain audit trails.

### Why UUID primary keys?
No sequential IDs are exposed publicly. UUIDs prevent enumeration attacks (e.g., `/orders/1`, `/orders/2`).

### Why store colors as JSON string?
Drizzle doesn't support JSONB with typed Zod schemas cleanly in the current version. The `colors` field is a JSON string of `{name: string, hex: string}[]`. Parse with `JSON.parse()` when reading from DB.
