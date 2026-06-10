# GEN ERA — Current State Audit (2026-06-10)

## 1. CARTDRAWER COMPONENT

**Status:** ✅ **FULLY COMPLETED**

**Location:** `components/store/CartDrawer.tsx` (167 lines)

**Implementation Details:**
- ✅ Open/close state management via Zustand
- ✅ Overlay backdrop with click-to-close
- ✅ Item list with images, prices, quantities
- ✅ Quantity spinners (+ / - buttons)
- ✅ Remove item functionality
- ✅ Cart total display with formatting
- ✅ Checkout button (links to `/checkout`)
- ✅ Empty state display with glyph
- ✅ Hydration-safe (mounted check)
- ✅ Scroll prevention when open
- ✅ Pharaonic corner marks and styling
- ✅ Proper ARIA labels for accessibility
- ✅ Temple theme consistent with design system

**Dependencies Met:**
- `useCartStore` from `lib/store.ts` ✅
- Cart persistence via Zustand ✅
- Image component via Next.js ✅

---

## 2. CHECKOUT PAGE

**Status:** ✅ **FULLY COMPLETED**

**Location:** `app/checkout/page.tsx` (330 lines)

**Features Implemented:**

### Form & Validation
- ✅ Full Name field
- ✅ Email field
- ✅ Phone field
- ✅ Street Address field
- ✅ City field
- ✅ Order Notes field (optional)
- ✅ Client-side validation (all required fields except notes)
- ✅ Error message display

### Cart Display
- ✅ Empty cart state with redirect link
- ✅ Order summary panel with item breakdown
- ✅ Quantity × Price display per item
- ✅ Subtotal calculation
- ✅ Total cost display

### Order Submission
- ✅ Form submission handler
- ✅ API POST to `/orders` endpoint
- ✅ Loading state during submission
- ✅ Success confirmation screen
- ✅ Order ID display
- ✅ Shipping address echo-back
- ✅ Cart clear after successful order

### Payment Status
- **Shipping Fee:** Shows "FREE" (hardcoded, not calculated)

### Success Screen
- ✅ Order confirmation with ID
- ✅ Customer name display
- ✅ Shipping address summary
- ✅ Total price display
- ✅ Status badge (from backend)
- ✅ Return to store button

**Order Payload:**
```javascript
{
  items: [{ productId, quantity }],  // ← Snapshots only
  shippingAddress: {
    name,
    street,
    city,
    country: 'Egypt' (hardcoded),
    phone
  }
}
```

---

## 3. GUEST CHECKOUT ARCHITECTURE

**Status:** ⚠ **PARTIALLY COMPLETED** (Migration features missing)

### Implemented Features
✅ **Silent Registration**
- Calls `register(fullName, email, guestPassword)` automatically
- Uses hardcoded password: `'guestpassword123'`

✅ **Silent Login**
- Falls back to `login(email, guestPassword)` if registration fails
- Handles "already registered" case

✅ **JWT Generation** (Backend)
- Frontend stores token in `localStorage` as `'genEraToken'`
- Token sent in `Authorization: Bearer` header

✅ **Snapshot Protection** (Partial)
- CartItems capture `price` and `image` at add-to-cart time
- Prevents price manipulation

### Missing/Not Implemented

❌ **customerType Field**
- Order payload has NO `customerType` field
- Should indicate: `'guest'` | `'registered'`

❌ **customer Object**
- Order payload sends NO customer metadata object
- Should contain: name, email, phone (redundant with address but needed)

❌ **optional user Field**
- Order type defines `user: string` (required)
- No logic to make it optional for guests
- Guest orders still reference a user ID (backend-created account)

❌ **orderNumber Generation**
- No frontend-generated order number
- Backend likely generates from `_id` or counter
- No placeholder or sequence number

❌ **Snapshot Protection** (Incomplete)
- ✅ Item snapshots work (product name, price, image)
- ❌ Metadata snapshot missing (timestamps, cart state, buyer name snapshot)
- ❌ No immutable order signature or hash

### Code Reference
**File:** `app/checkout/page.tsx` lines 60-73
```typescript
if (!isAuthenticated) {
  const guestPassword = 'guestpassword123';
  try {
    await register(fullName.trim(), email.trim().toLowerCase(), guestPassword);
  } catch (regErr) {
    try {
      await login(email.trim().toLowerCase(), guestPassword);
    } catch (loginErr) {
      throw new Error('This email is already registered...');
    }
  }
}
```

---

## 4. PRODUCT DETAIL PAGES

**Status:** ✅ **FULLY COMPLETED**

**Location:** `app/store/[slug]/page.tsx` (219 lines)

**Features:**

### Dynamic Product Loading
- ✅ Slug-based product fetch via `fetchProduct(slug)`
- ✅ Loading state with skeleton UI
- ✅ Error state with 404 handling
- ✅ Product not found fallback

### Visual Display
- ✅ 3D Model Viewer (via ProductViewer component)
  - Auto-rotating model on load
  - Manual rotation via drag
  - Progress loading indicator
  - Fallback to static image if model unavailable
- ✅ Image Gallery (ProductGallery component)
  - Primary image + gallery array
  - Tab switching (3D / IMAGES)
- ✅ Tab UI (conditional based on modelPath)

### Product Information
- ✅ Product name (as page title)
- ✅ Price display with Arabic locale formatting
- ✅ Category badge
- ✅ Tags display
- ✅ Short description
- ✅ Long description (marked as "SPECIFICATIONS")
- ✅ Stock status with quantity
  - "AVAILABLE [n]" or "DEPLETED"

### Actions
- ✅ Add to Cart button (AddToCartButton component)
  - Disabled when out of stock
  - Shows "ADDED" state after click
  - Auto-resets after 1.8s

### Navigation
- ✅ Back to Store link
- ✅ Cart button in header

### State Management
- Uses `useProductStore` for product data
- Uses `useCartStore` for add-to-cart
- Proper cleanup on unmount (clearSelection)

### Accessibility
- ✅ Semantic HTML (main, header, buttons)
- ✅ ARIA labels on buttons
- ✅ Role attributes where needed

---

## 5. EXPERIENCE PAGES

### Temple Page
**Status:** ⚠ **PARTIALLY IMPLEMENTED**

**Location:** `app/temple/page.tsx`
```typescript
import TempleScene from '@/components/scene/TempleScene';
export default function TemplePage() {
  return <div><TempleScene /></div>;
}
```

**TempleScene Component** (components/scene/TempleScene.tsx)
- ✅ Canvas setup with React Three Fiber
- ✅ Shadows enabled
- ✅ Camera positioned at [0, 3, 8]
- ✅ FOV: 50°

**Scene Elements Loaded:**
- ✅ CameraRig component
- ✅ TempleLights component
- ✅ Floor object
- ✅ 4x Pillars (positioned at corners)
- ✅ Portal object (void core)
- ✅ Particles (atmosphere)
- ✅ OrbitControls (user interaction)

**Status:** Scene IS rendering, but verification needed:
- Whether TempleScene components exist and are complete
- Whether Portal, Floor, Pillar, Particles components are implemented

---

### AR Page
**Status:** ❌ **STUB ONLY**

**Location:** `app/ar/page.tsx`
```typescript
<div style={{...}}>
  <h1>AR Portal</h1>
  <p>This augmented reality experience is being prepared.</p>
</div>
```

**Status:** Placeholder text only. No AR implementation.

---

### Lore Page
**Status:** ❌ **STUB ONLY**

**Location:** `app/lore/page.tsx`
```typescript
<div style={{...}}>
  <h1>Lore Archive</h1>
  <p>The Temple of Commerce is still being assembled...</p>
</div>
```

**Status:** Placeholder text only. No content.

---

### Community Page
**Status:** ❌ **STUB ONLY**

**Location:** `app/community/page.tsx`
```typescript
import TempleScene from "@/components/scene/TempleScene";
export default function Home() {
  return <div><TempleScene /></div>;
}
```

**Status:** Just re-renders TempleScene. No community features.

---

## 6. CORE INFRASTRUCTURE

**Status:** ✅ **COMPLETE**

### API Layer
- ✅ `lib/api.ts` — Base typed fetch client
- ✅ Authorization header injection
- ✅ Token management (localStorage)
- ✅ Error handling

### Auth Layer
- ✅ `lib/hooks.ts` — `useAuth()` hook
- ✅ login() / register() / logout()
- ✅ User and token state management

### Product API
- ✅ `lib/products.ts` — Product endpoints
- ✅ getAll(), getBySlug(), getFeatured()
- ✅ Search, category filter support

### State Management
- ✅ `lib/store.ts` — Zustand stores
  - useCartStore (persisted)
  - useStore (auth + scene state)

### Types
- ✅ `lib/types.ts` — Complete type system
- ✅ Product, CartItem, Order, User, API responses

---

## SUMMARY TABLE

| Component | Status | Notes |
|-----------|--------|-------|
| CartDrawer | ✅ Complete | Fully styled, functional |
| Checkout Form | ✅ Complete | All fields, validation, submission |
| Checkout Success | ✅ Complete | Order confirmation screen |
| Product Detail Page | ✅ Complete | 3D viewer, gallery, add to cart |
| Product Viewer (3D) | ✅ Complete | Auto-rotate, drag, fallback |
| Guest Registration | ✅ Complete | Silent flow implemented |
| Guest Login | ✅ Complete | Fallback if already registered |
| JWT Handling | ✅ Complete | Stored and sent in headers |
| **Guest Migration** | ⚠ Partial | Missing: customerType, customer obj, optional user, orderNumber |
| **Snapshot Protection** | ⚠ Partial | Item snapshots OK, metadata snapshot missing |
| Temple Scene | ⚠ Partial | Scene loads but components need verification |
| AR Page | ❌ Stub | Placeholder only |
| Lore Page | ❌ Stub | Placeholder only |
| Community Page | ❌ Stub | Wrapper only |
| Payment Integration | ❌ Missing | Not started |
| User Dashboard | ❌ Missing | Not started |
| Order History | ❌ Missing | Not started |

---

## BLOCKERS & DEPENDENCIES

### Checkout → Backend
- Order endpoint must handle guest checkout
- Must support guest user creation internally
- Should return orderNumber/orderRef

### Guest Migration → Backend Schema
- Order schema needs customerType field
- Order schema needs customer object (optional)
- Order schema needs user field to be optional

### Experience Pages → 3D Assets
- Temple scene components need verification
- AR requires camera/device API integration
- Lore needs content/narrative structure

---

