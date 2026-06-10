# GEN ERA — API Reference

**Base URL:** `/api/v1`  
**Auth:** Bearer token in `Authorization` header  
**Content-Type:** `application/json`  
**Rate Limits:** 200 req/15min (global) · 20 req/15min (auth endpoints)

---

## Products

### `GET /products`
List products with filters and pagination.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 9 | Items per page (max 50) |
| `q` | string | — | Search query |
| `category` | string | — | `clothing` or `accessories` |
| `collection` | string | — | Collection slug |
| `minPrice` | int | — | Minimum price (EGP) |
| `maxPrice` | int | — | Maximum price (EGP) |
| `inStock` | bool | — | `true` for in-stock only |

**Response:**
```json
{
  "success": true,
  "data": [ ...Product[] ],
  "pagination": { "page": 1, "limit": 9, "total": 8, "pages": 1 }
}
```

---

### `GET /products/featured`
Returns featured products only.

**Response:** Same shape as `/products`, `featured: true` products only.

---

### `GET /products/:slug`
Single product by URL slug.

**Response:**
```json
{
  "success": true,
  "data": { ...Product }
}
```

**Errors:** `404` if not found or inactive.

---

## Collections

### `GET /collections`
All active collections with product counts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "void-season-i",
      "slug": "void-season-i",
      "name": "VOID SEASON I",
      "description": "...",
      "season": "SS2025",
      "year": 2025,
      "coverGlyph": "𓆑",
      "productCount": 3
    }
  ]
}
```

---

## Orders

### `POST /orders`
Place a new order (guest or registered).

**Request Body:**
```json
{
  "customer": {
    "name": "Ahmed Hassan",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "address": "15 Tahrir St, Apt 4",
    "city": "Cairo"
  },
  "items": [
    { "productId": "prod_001", "quantity": 1 }
  ],
  "notes": "Optional delivery instructions"
}
```

**Notes:**
- Do **not** send prices — server resolves from catalog
- `Authorization` header optional; if provided, order links to account
- `orderNumber` is auto-generated server-side

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "_id": "order_...",
    "orderNumber": "ORD-1749600000000-001",
    "customerType": "guest",
    "customer": { "name": "...", "email": "...", "address": "...", "city": "..." },
    "items": [ { "name": "...", "price": 2800, "quantity": 1, ... } ],
    "totalPrice": 2800,
    "status": "pending",
    "paymentStatus": "unpaid",
    "createdAt": "..."
  }
}
```

**Errors:**  
`400` — missing customer fields, empty items, invalid productId  
`400` — product not found in catalog

---

### `GET /orders`
List orders for authenticated user.

**Auth:** Required  
**Admin:** Receives all orders; users see only their own.

**Response:**
```json
{
  "success": true,
  "data": [ ...Order[] ],
  "pagination": { ... }
}
```

---

### `GET /orders/:id`
Single order by ID or orderNumber.

**Response:** `{ "success": true, "data": Order }`  
**Errors:** `404`

---

## Auth

### `POST /auth/register`
Create a new user account.

**Request Body:**
```json
{ "name": "Ahmed Hassan", "email": "ahmed@example.com", "password": "min6chars" }
```

**Response `201`:**
```json
{ "success": true, "token": "...", "user": { "_id": "...", "name": "...", "email": "...", "role": "user" } }
```

**Errors:** `400` (validation), `409` (email exists)

---

### `POST /auth/login`
Authenticate an existing user.

**Request Body:**
```json
{ "email": "ahmed@example.com", "password": "..." }
```

**Response:**
```json
{ "success": true, "token": "...", "user": { ... } }
```

**Errors:** `401` (invalid credentials)

---

### `GET /auth/profile`
Get current user profile.

**Auth:** Required

**Response:** `{ "success": true, "data": User }`

---

## Error Responses

All errors follow:
```json
{ "success": false, "message": "Human-readable error." }
```

| Code | Meaning |
|------|---------|
| 400 | Bad request / validation failure |
| 401 | Authentication required or invalid |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already registered) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Product Object Shape

```typescript
{
  _id: string;             // "prod_001"
  slug: string;            // "pharaoh-cyber-hoodie"
  name: string;            // "PHARAOH CYBER HOODIE"
  subtitle: string;
  collection: string;      // "void-season-i"
  shortDescription: string;
  description: string;
  longDescription?: string;
  price: number;           // EGP (integer)
  comparePrice?: number;   // EGP original price (for discount display)
  category: "clothing" | "accessories";
  tags: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  image: string;           // URL (empty = placeholder)
  gallery: string[];
  modelPath: string;       // GLB file path (empty = no 3D)
  material?: string;
  weight?: string;
  shippingInfo?: string;
  stock: number;
  featured: boolean;
  active: boolean;
  rating: number;          // 0–5
  reviewCount: number;
  createdAt: string;       // ISO 8601
  updatedAt: string;
}
```

## Order Status Flow

```
pending → paid → processing → shipped → delivered
              ↘ cancelled
              ↘ failed (payment)
```

| Status | paymentStatus | Trigger |
|--------|---------------|---------|
| pending | unpaid | Order created |
| paid | paid | [Stripe webhook — Phase 2] |
| processing | paid | Admin marks as processing |
| shipped | paid | Admin marks as shipped |
| delivered | paid | Admin marks as delivered |
| cancelled | unpaid / refunded | Cancellation |
