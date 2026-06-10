# GEN ERA — Security Reference

## Current Security Posture

### Implemented ✅

#### HTTP Security Headers (helmet)
Applied to all responses via `helmet` middleware:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 0` (deprecated in favour of CSP)
- `Strict-Transport-Security` (HTTPS enforcement)
- `Referrer-Policy: no-referrer`
- `Permissions-Policy` (restricts camera/mic/geolocation access)

Note: CSP is disabled (`contentSecurityPolicy: false`) to allow Three.js / WebGL / camera assets to load. Re-enable with a proper policy before production deployment.

#### Rate Limiting
- **Global:** 200 requests / 15 minutes per IP
- **Auth endpoints:** 20 requests / 15 minutes per IP (`/api/v1/auth/*`)
- Returns `429 Too Many Requests` with JSON error on breach

#### Authentication
- Stateless token auth (random 32-byte hex tokens, not JWT)
- Tokens stored in server-side Map (in-memory; migrate to DB for production)
- No token expiry currently — add TTL when migrating to DB
- Passwords hashed with SHA-256 + static salt (upgrade to bcrypt for production)

#### Input Validation
- Body size limited to 2MB
- Required field checks on all POST endpoints
- Email normalised (lowercase, trimmed) before storage/lookup
- Server-side price resolution — clients never submit prices

#### Price Snapshot Protection
Orders resolve product prices from the authoritative server-side catalog. Client-submitted prices are completely ignored. This prevents price manipulation attacks.

#### Order Integrity
- `orderNumber` is auto-generated server-side
- `customerType` is determined by token presence, not client claim
- Order total is computed server-side

---

## Known Gaps / Future Work

### 🔴 Critical (Before Production)

**1. Password Hashing**
Current: `SHA-256 + static salt`  
Required: `bcrypt` (cost factor 12) or `argon2`  
Risk: If database is compromised, passwords are more easily cracked.

**2. Token Storage**
Current: In-memory Map (resets on restart)  
Required: Persistent token table in PostgreSQL with TTL  
Risk: All sessions lost on server restart.

**3. JWT Expiry**
Current: Tokens never expire  
Required: Short-lived access tokens (15min) + refresh tokens (7 days)  
Risk: Stolen tokens are permanently valid.

**4. Content Security Policy**
Current: Disabled (for WebGL/camera)  
Required: Targeted CSP allowing Three.js sources, camera API, and blocking inline scripts  
Risk: XSS attacks have no mitigation.

**5. HTTPS / TLS**
Current: Handled by Replit proxy (development)  
Required: Verify TLS termination in production deployment  
Risk: Man-in-the-middle attacks on non-TLS connections.

### 🟡 Important

**6. CSRF Protection**
Current: None  
Required: SameSite=Strict cookies + CSRF tokens for state-changing mutations  
Note: CORS currently allows all origins — tighten to specific production domain.

**7. SQL Injection**
Current: In-memory arrays (no SQL)  
Future: Drizzle ORM parameterises all queries — no raw SQL should be used.  
Action: Enforce in code review — never use `db.execute(sql\`...\`)` with user input.

**8. Admin Authorization**
Current: Role check in GET /orders (admin sees all)  
Required: Middleware guard for all admin routes, not ad-hoc checks per handler.

**9. Input Sanitization**
Current: Type checking only  
Required: Strip HTML/script tags from text inputs (DOMPurify server-side equivalent)

**10. Stripe Webhook Verification**
Future: All Stripe webhooks must verify `stripe-signature` header against `STRIPE_WEBHOOK_SECRET`  
Risk: Without verification, anyone can fake a "payment succeeded" webhook.

### 🟢 Enhancement

**11. Audit Logging**
Log all order state changes, admin actions, and auth events with IP + timestamp.

**12. Account Lockout**
Lock accounts after N failed login attempts within a time window.

**13. Email Verification**
Require email verification before order placement for registered users.

---

## Security Checklist for Production Deployment

- [ ] Replace SHA-256 password hashing with bcrypt/argon2
- [ ] Migrate tokens to PostgreSQL with TTL
- [ ] Enable Content Security Policy
- [ ] Restrict CORS to production domain
- [ ] Enable HTTPS everywhere (no HTTP fallback)
- [ ] Add CSRF tokens to all state-changing forms
- [ ] Verify Stripe webhook signatures
- [ ] Set up rate limiting behind a reverse proxy (not trusting X-Forwarded-For blindly)
- [ ] Enable audit logging
- [ ] Run `pnpm audit` and resolve all critical/high vulnerabilities
- [ ] Set `NODE_ENV=production` to disable development-only error details
