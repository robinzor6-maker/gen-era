/**
 * Dev wrapper: opens port immediately (for workflow health checks),
 * then starts Expo Metro bundler on port+1 and proxies all traffic.
 */
"use strict";
const http = require("http");
const net = require("net");
const { spawn } = require("child_process");
const path = require("path");

const PORT = parseInt(process.env.PORT || "20856", 10);
const METRO_PORT = PORT + 1;
const PROJECT_ROOT = path.resolve(__dirname, "..");

let metroReady = false;

// ── Tiny placeholder / proxy server ──────────────────────────────────────────
const server = http.createServer(handleRequest);
server.on("upgrade", handleUpgrade);

server.listen(PORT, "0.0.0.0", () => {
  process.stdout.write(`[dev] server up on :${PORT}\n`);
  spawnMetro();
  waitForMetro();
});

function handleRequest(req, res) {
  if (!metroReady) {
    const body = `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta http-equiv="refresh" content="2">
<title>GEN ERA</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000005;color:#d4a853;font:1rem sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:.75rem}h1{letter-spacing:.4em;font-size:2rem}p{color:#555;font-size:.8rem}</style>
</head><body><h1>GEN ERA</h1><p>Starting Metro…</p></body></html>`;
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "content-length": Buffer.byteLength(body),
    });
    res.end(body);
    return;
  }
  proxyHttp(req, res);
}

function proxyHttp(req, res) {
  // Strip origin so Metro's CorsMiddleware doesn't reject requests
  // from the Expo worf.replit.dev domain going through our localhost proxy.
  const headers = { ...req.headers };
  delete headers["origin"];
  delete headers["referer"];
  headers["host"] = `127.0.0.1:${METRO_PORT}`;

  const opts = {
    hostname: "127.0.0.1",
    port: METRO_PORT,
    path: req.url,
    method: req.method,
    headers,
  };
  const pr = http.request(opts, (upstream) => {
    // Add CORS headers so the browser can load Metro assets
    const outHeaders = { ...upstream.headers };
    outHeaders["access-control-allow-origin"] = "*";
    outHeaders["access-control-allow-headers"] = "*";
    res.writeHead(upstream.statusCode, outHeaders);
    upstream.pipe(res, { end: true });
  });
  pr.on("error", () => {
    if (!res.headersSent) { res.writeHead(502); }
    res.end("Metro not ready");
  });
  req.pipe(pr, { end: true });
}

function handleUpgrade(req, clientSocket, head) {
  if (!metroReady) { clientSocket.destroy(); return; }
  const upstream = net.connect(METRO_PORT, "127.0.0.1", () => {
    upstream.write(
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join("\r\n") +
      "\r\n\r\n"
    );
    upstream.write(head);
    upstream.pipe(clientSocket);
    clientSocket.pipe(upstream);
  });
  upstream.on("error", () => clientSocket.destroy());
  clientSocket.on("error", () => upstream.destroy());
}

// ── Metro spawner ─────────────────────────────────────────────────────────────
function spawnMetro() {
  const env = Object.assign({}, process.env, {
    PORT: String(METRO_PORT),
    EXPO_PACKAGER_PROXY_URL: process.env.REPLIT_EXPO_DEV_DOMAIN
      ? `https://${process.env.REPLIT_EXPO_DEV_DOMAIN}`
      : undefined,
    EXPO_PUBLIC_DOMAIN: process.env.REPLIT_DEV_DOMAIN,
    EXPO_PUBLIC_REPL_ID: process.env.REPL_ID,
    REACT_NATIVE_PACKAGER_HOSTNAME: process.env.REPLIT_DEV_DOMAIN,
  });

  const metro = spawn("pnpm", ["exec", "expo", "start", "--localhost", "--port", String(METRO_PORT)], {
    cwd: PROJECT_ROOT,
    env,
    stdio: "inherit",
    shell: false,
  });

  metro.on("error", (err) => process.stderr.write(`[metro] error: ${err.message}\n`));
  metro.on("exit", (code) => {
    process.stderr.write(`[metro] exited ${code}\n`);
    process.exit(code ?? 1);
  });
}

// ── Poll until Metro is accepting connections ─────────────────────────────────
function waitForMetro(attempt = 0) {
  if (metroReady) return;
  setTimeout(() => {
    const sock = net.connect(METRO_PORT, "127.0.0.1");
    sock.once("connect", () => {
      sock.destroy();
      metroReady = true;
      process.stdout.write(`[dev] Metro ready on :${METRO_PORT}, proxying from :${PORT}\n`);
    });
    sock.once("error", () => {
      sock.destroy();
      waitForMetro(attempt + 1);
    });
  }, Math.min(500 + attempt * 500, 3000));
}

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
