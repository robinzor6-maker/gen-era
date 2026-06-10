# GEN ERA — PRIORITY ROADMAP

**Last Updated:** 2026-06-10  
**Current Branch:** develop  
**Foundation Commit:** 19ae6d4

---

## PRIORITY FRAMEWORK

| Level | Definition | Timeline | Impact |
|-------|-----------|----------|--------|
| **P0** | Blocks payment flow / breaks production | Days | Revenue/UX blocking |
| **P1** | Completes core feature / required for launch | Weeks | Feature completeness |
| **P2** | Enhancement / optimization / polish | Months | User experience |

---

## P0 — CRITICAL (BLOCKS PAYMENT FLOW)

### P0.1 - Backend Order Schema Migration
**Reason:** Frontend cannot scale without backend support for guest checkout  
**Blocker For:** Payment integration, order tracking, analytics

**Required Backend Changes:**
1. Add `customerType: 'guest' | 'registered'` to Order schema
2. Add `customer: { name, email, phone, address }` object (SNAPSHOT)
3. Make `user: ObjectId` field optional or accept null for guests
4. Generate `orderNumber: string` (e.g., "ORD-2026-001234")
5. Add `paymentRef: string` field (for payment gateway integration)
6. Add `notes: string` field (from checkout form)

**Frontend Impact:** Will pass these fields in order payload once backend accepts

**Estimate:** 4-6 hours (backend)

---

### P0.2 - Stripe/Payment Gateway Integration
**Reason:** Currently no payment collection — essential for revenue  
**Blocker For:** Order completion, revenue tracking

**Frontend Work:**
1. Install `@stripe/react-stripe-js` / `@stripe/stripe-js`
2. Add Stripe Elements form to checkout (card input)
3. Create payment intent on backend
4. Handle 3D Secure / SCA flow
5. Store `paymentRef` on success
6. Error handling & retry logic

**Estimate:** 12-16 hours (frontend + backend)

---

### P0.3 - Verify Guest Checkout Flow End-to-End
**Reason:** Unknown if silent registration works with backend  
**Blocker For:** Testing, UAT, production release

**Test Cases:**
1. New guest → register → order (success path)
2. Returning guest → login → order (retry path)
3. Already registered with different password → error handling
4. Network failures during auth/order submission
5. Concurrent checkout from multiple tabs

**Estimate:** 6-8 hours (QA + bug fixes)

---

## P1 — IMPORTANT (COMPLETES CORE FEATURES)

### P1.1 - Complete Temple Scene Rendering
**Reason:** Temple page exists but unverified; core to brand experience  
**Blocker For:** AR page (depends on Temple as baseline), Community page

**Checklist:**
- [ ] Verify TempleScene renders without errors
- [ ] Verify all 4 pillars load correctly
- [ ] Verify Portal animation works
- [ ] Verify Particles render
- [ ] Verify Camera controls are smooth
- [ ] Performance: FPS target 60 on desktop, 30+ on mobile
- [ ] Add loading indicator while scene initializes

**Estimate:** 8-12 hours (integration + performance tuning)

---

### P1.2 - Implement AR Page (WebAR Foundation)
**Reason:** Part of brand differentiation; currently stub  
**Blocker For:** Mobile features, product demos

**Phase 1 (MVP):**
1. Add Three.js AR.js library
2. Marker detection (QR or image target)
3. Render 3D model from product catalog on marker
4. Tap to add to cart

**Estimate:** 20-24 hours (AR library integration + 3D model streaming)

---

### P1.3 - Implement Lore Page (Content Hub)
**Reason:** Worldbuilding essential to brand; currently stub  
**Blocker For:** Community engagement, differentiation

**Content Structure:**
1. Hero section with introduction
2. Timeline of temple mythology (3-5 key events)
3. Character profiles (with images/3D models)
4. Artifact catalog (linked to store products)
5. Lore Easter eggs / hidden sections
6. Mobile-responsive layout

**Estimate:** 16-20 hours (content creation + component building)

---

### P1.4 - Implement Community Page
**Reason:** Social feature for engagement; currently just redirects to temple  
**Blocker For:** User retention, UGC

**MVP Features:**
1. Recent orders display (anonymized: "Warrior acquired [product]")
2. Leaderboard (top buyers this month)
3. User profiles (avatar, bio, collection)
4. Comment threads on products
5. Social sharing buttons

**Estimate:** 24-32 hours (backend + frontend)

---

### P1.5 - Order History / User Dashboard
**Reason:** Guests can't track orders; customers can't see history  
**Blocker For:** Customer service, retention

**MVP:**
1. `/dashboard` route (protected or guest session)
2. List past orders with status
3. Order detail modal
4. Download invoice (PDF)
5. Reorder quick button
6. Contact support form

**Estimate:** 16-20 hours

---

### P1.6 - Email Notifications
**Reason:** Order confirmation + shipping updates expected  
**Blocker For:** Customer trust, order tracking

**Emails:**
1. Order confirmation (immediately after submit)
2. Payment confirmation (after successful payment)
3. Dispatch notification (when shipped)
4. Delivery confirmation (when delivered)

**Backend:** SendGrid / Mailgun integration  
**Estimate:** 12-16 hours (backend email service + templates)

---

### P1.7 - Product Admin Interface
**Reason:** Can't update inventory, prices, or images without DB access  
**Blocker For:** Operations, scaling

**MVP:**
1. Protected `/admin/products` page
2. Product grid with edit/delete
3. Edit form (name, price, stock, image upload, 3D model)
4. Bulk actions (stock update, featured toggle)
5. Analytics (views, sales)

**Estimate:** 20-24 hours

---

## P2 — ENHANCEMENTS (POLISH & OPTIMIZATION)

### P2.1 - Product Reviews & Ratings
**Reason:** Social proof drives conversions  
**Estimate:** 12-16 hours

---

### P2.2 - Wishlist Feature
**Reason:** Engagement + abandoned cart recovery  
**Estimate:** 8-12 hours

---

### P2.3 - Search Autocomplete
**Reason:** Better UX for product discovery  
**Estimate:** 6-8 hours

---

### P2.4 - Image Optimization
**Reason:** Faster load times, better mobile experience  
**Estimate:** 4-6 hours (image CDN + Next.js Image optimization)

---

### P2.5 - Accessibility Audit & WCAG AA Compliance
**Reason:** Legal requirement + inclusive UX  
**Estimate:** 10-12 hours

---

### P2.6 - Analytics & Tracking
**Reason:** Measure conversion funnel, user behavior  
**Estimate:** 8-10 hours (Google Analytics 4 + custom events)

---

### P2.7 - SEO Optimization
**Reason:** Organic search visibility  
**Estimate:** 6-8 hours (metadata, structured data, sitemap)

---

## LAUNCH REQUIREMENTS (GO/NO-GO)

**Must have for launch:**
- ✅ CartDrawer (done)
- ✅ Checkout form (done)
- ⚠ Guest checkout flow (needs P0.3 testing)
- ❌ Payment gateway (P0.2)
- ⚠ Temple scene (P1.1)
- ✅ Product detail pages (done)
- ✅ Store listing (done)

**Minimum Launch Scope:**
- P0.1 (backend schema)
- P0.2 (payment)
- P0.3 (testing)
- P1.1 (temple verification)

**Estimated Launch Timeline:** 4-6 weeks (with team)

---

## MAINTENANCE & DEBT

### Known Issues
1. Hardcoded guest password (`'guestpassword123'`)
   - Security risk if credentials leaked
   - Should use environment variable or session tokens
   
2. No rate limiting on auth endpoints
   - Vulnerable to brute force / credential stuffing
   
3. No CSRF protection on forms
   - Add CSRF tokens to checkout form
   
4. No input sanitization
   - Customer names/addresses could contain SQL/XSS payloads
   
5. Temple scene may not optimize for mobile
   - Three.js rendering expensive on 4G

### Tech Debt
- Replace hardcoded colors with CSS variables throughout
- Consolidate styling (currently mixed inline + CSS)
- Create shared component library for buttons, cards, inputs
- Add unit tests for store actions
- Add e2e tests for checkout flow

---

## RECOMMENDED NEXT SPRINT (WEEK 1)

1. **P0.1** - Backend order schema migration (parallel work)
2. **P0.3** - Guest checkout end-to-end testing
3. **P1.1** - Temple scene verification & performance
4. **P2.2** - Wishlist (quick win for engagement)

**Target:** By end of week: Payment gateway integration started + all P0 cleared

---

