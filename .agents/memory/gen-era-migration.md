---
name: GEN ERA Next.js → Vite migration patterns
description: Covers all conversion patterns used when porting the pharaonic cyberpunk shop from Next.js to react-vite.
---

# GEN ERA Migration Patterns

**Rule:** All Next.js APIs must be replaced with Vite/wouter equivalents.

**Conversions:**
- `next/link` → `<Link>` from wouter
- `next/image` → `<img>`
- `useRouter()` → `useLocation()` from wouter
- `useSearchParams()` / `useParams()` → `useParams()` from wouter
- `process.env.NEXT_PUBLIC_*` → `import.meta.env.VITE_*`
- API base: `(import.meta.env.VITE_API_URL || '') + '/api/v1'`
- Routing base: `WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}`

**Why:** Vite uses ES module conventions; wouter replaces Next.js file-based router.
