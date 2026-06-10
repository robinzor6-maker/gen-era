---
name: Expo dev proxy wrapper
description: How to make Expo Metro start reliably in Replit workflows (port health check fix + CORS fix)
---

## The problem
Metro bundler takes 15-30s to open its port. The Replit workflow health checker times out before Metro is ready, marking the workflow FAILED even though Metro eventually starts fine.

## The fix
Use `scripts/dev.js` as the `dev` npm script instead of calling `expo start` directly.
The wrapper:
1. Opens the target port (PORT env var) immediately with a plain `http.createServer`, so the workflow health check passes in < 1 second.
2. Spawns Metro on PORT+1.
3. Polls PORT+1 with `net.connect` until Metro is ready, then flips `metroReady = true`.
4. Proxies all HTTP requests (and WebSocket upgrades) through to Metro once ready.
5. While Metro isn't ready, serves a "Starting…" HTML page with `<meta http-equiv="refresh" content="2">`.

**Why:** `ensurePreviewReachable` (or the plain port check) in artifact.toml fires very soon after the process starts. Node opens the TCP port in < 100ms; pnpm + Metro takes 20-30s.

## CORS fix
Metro's `CorsMiddleware` rejects requests from the `*.expo.worf.replit.dev` Origin. The proxy strips `origin` and `referer` headers before forwarding to Metro, and adds `access-control-allow-origin: *` on responses.

## Key files
- `artifacts/gen-era-mobile/scripts/dev.js` — the proxy wrapper
- `artifacts/gen-era-mobile/package.json` — `"dev": "node scripts/dev.js"`
- `artifacts/gen-era-mobile/.replit-artifact/artifact.toml` — `ensurePreviewReachable` can be omitted; the plain port check is sufficient

**Why:** `EXPO_PACKAGER_PROXY_URL` tells Metro about the external URL for QR codes but does NOT whitelist that domain in CorsMiddleware. Stripping origin at the proxy layer is the only reliable fix without patching Metro.
