"use client";

import { useState } from "react";
import Viewer from "@/components/store/Viewer";
import { products } from "@/components/store/products";

export default function Home() {
  const [selected, setSelected] = useState(products[0]);
  const [qty, setQty] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleAddToCart() {
    setCartCount((c) => c + qty);
    showToast(`✓ ${selected.name.substring(0, 20)} — ADDED TO CART`);
  }

  return (
    <>
      {/* ── GOOGLE FONTS ── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=Trirong:ital,wght@0,100;0,400;1,100&family=Share+Tech+Mono&display=swap"
        rel="stylesheet"
      />

      <div style={styles.root}>
        {/* ── SCANLINES ── */}
        <div style={styles.scanlines} />
        <div style={styles.vignette} />

        {/* ═══ HEADER ═══ */}
        <header style={styles.header}>
          <div style={styles.headerLogo}>
            <span style={styles.eyeGlyph}>𓂀</span>
            <span>
              GEN <em style={{ color: "var(--fire)", fontStyle: "normal" }}>ERA</em>
            </span>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.onlineDot} />
            <span style={styles.onlineText}>6 ONLINE</span>
            <button style={styles.cartBtn}>
              CART{" "}
              <span style={{ color: "var(--fire)" }}>{cartCount}</span>
            </button>
          </div>
        </header>

        {/* ═══ MAIN LAYOUT ═══ */}
        <div style={styles.main}>
          {/* ─── LEFT PANEL ─── */}
          <aside style={styles.leftPanel}>
            {/* Corner marks */}
            <span style={{ ...styles.corner, top: 8, left: 8, borderWidth: "1px 0 0 1px" }} />
            <span style={{ ...styles.corner, top: 8, right: 8, borderWidth: "1px 1px 0 0" }} />
            <span style={{ ...styles.corner, bottom: 8, left: 8, borderWidth: "0 0 1px 1px" }} />
            <span style={{ ...styles.corner, bottom: 8, right: 8, borderWidth: "0 1px 1px 0" }} />

            {/* Top glow line */}
            <div style={styles.topGlowLine} />

            {/* Logo section */}
            <div style={styles.panelLogoSection}>
              <h1 style={styles.panelTitle}>
                GEN <em style={{ color: "var(--fire)", fontStyle: "normal" }}>ERA</em>
              </h1>
              <p style={styles.panelSubtitle}>TEMPLE OF COMMERCE</p>
              <div style={styles.divider} />
            </div>

            {/* Section label */}
            <p style={styles.sectionLabel}>◈ SELECT ARTEFACT</p>

            {/* Product list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {products.map((p) => {
                const isActive = selected.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => { setSelected(p); setQty(1); }}
                    style={{
                      ...styles.productCard,
                      borderLeftColor: isActive ? "var(--fire)" : "rgba(212,168,83,0.15)",
                      background: isActive
                        ? "linear-gradient(100deg, rgba(255,107,26,0.08), rgba(8,6,18,0.9))"
                        : "linear-gradient(100deg, rgba(5,4,12,0.95), rgba(8,6,18,0.9))",
                      boxShadow: isActive ? "var(--glow-fire)" : "none",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={styles.productName}>{p.name}</div>
                      <div style={styles.productPrice}>{p.price}</div>
                    </div>
                    <span style={{
                      ...styles.productTag,
                      borderColor: isActive ? "rgba(255,107,26,0.4)" : "rgba(212,168,83,0.15)",
                      color: isActive ? "var(--fire)" : "rgba(212,168,83,0.4)",
                    }}>
                      {p.tag}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={styles.divider} />

            {/* ─── QUANTITY ─── */}
            <p style={styles.sectionLabel}>◈ QUANTITY</p>
            <div style={styles.qtyRow}>
              <button style={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <div style={styles.qtyDisplay}>{qty}</div>
              <button style={styles.qtyBtn} onClick={() => setQty(q => Math.min(9, q + 1))}>+</button>
            </div>

            <div style={{ height: 16 }} />

            {/* ─── ADD TO CART ─── */}
            <button style={styles.btnFire} onClick={handleAddToCart}>
              ⚡ ADD TO CART
            </button>
            <button style={styles.btnGold}>
              ♡ ADD TO WISHLIST
            </button>
            <button style={styles.btnCyan}>
              ◈ AR TRY-ON
            </button>
          </aside>

          {/* ─── RIGHT 3D VIEWER ─── */}
          <div style={styles.viewerArea}>
            <Viewer model={selected.model} accentColor={selected.accent} />

            {/* Floating product info */}
            <div style={styles.floatingInfo}>
              <span style={styles.floatingTag}>{selected.tag}</span>
              <h3 style={styles.floatingName}>{selected.name}</h3>
              <p style={styles.floatingPrice}>{selected.price}</p>
            </div>

            {/* Bottom glyph strip */}
            <div style={styles.glyphStrip}>
              𓂀 𓆣 𓋹 𓇯 𓆑 𓂋 𓈖 𓆓 𓅓 𓆼
            </div>
          </div>
        </div>

        {/* ─── TOAST ─── */}
        {toast && (
          <div style={styles.toast}>
            {toast}
          </div>
        )}
      </div>

      <style>{`
        :root {
          --fire: #ff6b1a;
          --ember: #c84800;
          --sand: #d4a853;
          --sand2: #f0c875;
          --void: #000005;
          --border-gold: rgba(212,168,83,0.22);
          --border-thin: rgba(212,168,83,0.09);
          --glow-gold: 0 0 18px rgba(212,168,83,0.5), 0 0 50px rgba(212,168,83,0.18);
          --glow-fire: 0 0 16px rgba(255,107,26,0.6), 0 0 45px rgba(255,107,26,0.2);
          --glow-cyan: 0 0 16px rgba(0,212,255,0.5), 0 0 40px rgba(0,212,255,0.15);
          --cyan: #00d4ff;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000005; }
        button { cursor: pointer; }
        @keyframes eyeGlow {
          0%,100% { filter: drop-shadow(0 0 6px rgba(212,168,83,0.6)); }
          50% { filter: drop-shadow(0 0 18px #d4a853) drop-shadow(0 0 40px rgba(212,168,83,0.3)); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes toastIn {
          from { opacity:0; transform:translateX(-50%) translateY(12px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes glyphScroll {
          0%   { transform: translateX(20px); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:1; }
          100% { transform: translateX(-20px); opacity:0; }
        }
      `}</style>
    </>
  );
}

/* ══════════════════════════════════════
   STYLES
══════════════════════════════════════ */
const styles: Record<string, React.CSSProperties> = {
  root: {
    position: "relative",
    width: "100vw",
    height: "100vh",
    background: "#000005",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Cinzel', serif",
  },

  /* ── Overlays ── */
  scanlines: {
    position: "fixed", inset: 0, zIndex: 8,
    pointerEvents: "none",
    background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.012) 3px, rgba(0,0,0,0.012) 4px)",
  },
  vignette: {
    position: "fixed", inset: 0, zIndex: 8,
    pointerEvents: "none",
    background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,3,0.92) 100%)",
  },

  /* ── Header ── */
  header: {
    position: "relative", zIndex: 100,
    height: 56,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px",
    background: "linear-gradient(180deg, rgba(0,0,5,0.98), rgba(0,0,5,0.6))",
    borderBottom: "1px solid rgba(212,168,83,0.09)",
    flexShrink: 0,
  },
  headerLogo: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "1.1rem",
    letterSpacing: "0.28em",
    color: "#d4a853",
    display: "flex", alignItems: "center", gap: 8,
    textShadow: "0 0 18px rgba(212,168,83,0.5), 0 0 50px rgba(212,168,83,0.18)",
  },
  eyeGlyph: {
    animation: "eyeGlow 3.5s ease-in-out infinite",
    display: "inline-block",
  },
  headerRight: {
    display: "flex", alignItems: "center", gap: 16,
  },
  onlineDot: {
    width: 6, height: 6,
    borderRadius: "50%",
    background: "#00ff88",
    boxShadow: "0 0 6px #00ff88",
    animation: "blink 2s ease-in-out infinite",
  },
  onlineText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "0.38rem",
    letterSpacing: "0.2em",
    color: "rgba(0,255,136,0.6)",
  },
  cartBtn: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "0.4rem",
    letterSpacing: "0.2em",
    padding: "4px 14px",
    background: "none",
    border: "1px solid rgba(212,168,83,0.15)",
    color: "rgba(212,168,83,0.5)",
    transition: "all 0.2s",
  },

  /* ── Main layout ── */
  main: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    position: "relative",
    zIndex: 10,
  },

  /* ── Left panel ── */
  leftPanel: {
    width: 300,
    flexShrink: 0,
    padding: "24px 20px",
    background: "linear-gradient(160deg, rgba(8,6,18,0.98), rgba(4,3,10,0.99))",
    borderRight: "1px solid rgba(212,168,83,0.09)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  topGlowLine: {
    position: "absolute", top: 0, left: 0, right: 0, height: 2,
    background: "linear-gradient(90deg, transparent, #c84800, #ff6b1a, #f0c875, #ff6b1a, #c84800, transparent)",
  },
  corner: {
    position: "absolute", width: 16, height: 16,
    borderColor: "rgba(212,168,83,0.3)", borderStyle: "solid",
  },

  panelLogoSection: { marginBottom: 20, paddingTop: 8 },
  panelTitle: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "1.5rem",
    letterSpacing: "0.28em",
    color: "#f0c875",
    textShadow: "0 0 18px rgba(212,168,83,0.5), 0 0 50px rgba(212,168,83,0.18)",
    marginBottom: 4,
  },
  panelSubtitle: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "0.38rem",
    letterSpacing: "0.5em",
    color: "rgba(212,168,83,0.3)",
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.22), transparent)",
    margin: "12px 0",
  },
  sectionLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "0.38rem",
    letterSpacing: "0.4em",
    color: "rgba(212,168,83,0.3)",
    marginBottom: 10,
  },

  /* Product card */
  productCard: {
    padding: "12px 14px",
    border: "1px solid rgba(212,168,83,0.09)",
    borderLeft: "2px solid",
    cursor: "pointer",
    display: "flex", alignItems: "center", gap: 10,
    transition: "all 0.2s",
    position: "relative", overflow: "hidden",
  },
  productName: {
    fontFamily: "'Cinzel', serif",
    fontSize: "0.52rem",
    letterSpacing: "0.05em",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 3,
  },
  productPrice: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "0.55rem",
    color: "#f0c875",
    textShadow: "0 0 12px rgba(212,168,83,0.4)",
  },
  productTag: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "0.32rem",
    letterSpacing: "0.18em",
    padding: "2px 8px",
    border: "1px solid",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  /* Qty */
  qtyRow: { display: "flex", alignItems: "center", gap: 0, marginBottom: 4 },
  qtyBtn: {
    width: 36, height: 36,
    background: "none",
    border: "1px solid rgba(212,168,83,0.15)",
    color: "#d4a853",
    fontSize: "1rem",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.15s",
  },
  qtyDisplay: {
    width: 52, height: 36,
    borderTop: "1px solid rgba(212,168,83,0.15)",
    borderBottom: "1px solid rgba(212,168,83,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "0.8rem",
    color: "#fff",
  },

  /* Buttons */
  btnFire: {
    width: "100%", padding: "12px",
    background: "linear-gradient(135deg, #c84800, #ff6b1a)",
    color: "#fff", border: "none",
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "0.5rem",
    letterSpacing: "0.28em",
    marginBottom: 8,
    transition: "all 0.28s",
    position: "relative", overflow: "hidden",
  },
  btnGold: {
    width: "100%", padding: "10px",
    background: "none",
    border: "1px solid rgba(212,168,83,0.22)",
    color: "#d4a853",
    fontFamily: "'Cinzel', serif",
    fontSize: "0.44rem",
    letterSpacing: "0.18em",
    marginBottom: 8,
    transition: "all 0.22s",
  },
  btnCyan: {
    width: "100%", padding: "9px",
    background: "none",
    border: "1px solid rgba(0,212,255,0.22)",
    color: "#00d4ff",
    fontFamily: "'Cinzel', serif",
    fontSize: "0.4rem",
    letterSpacing: "0.18em",
    transition: "all 0.22s",
  },

  /* ── Viewer area ── */
  viewerArea: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    background: "radial-gradient(ellipse at 50% 40%, rgba(212,168,83,0.03) 0%, #000005 70%)",
  },

  /* Floating product info */
  floatingInfo: {
    position: "absolute",
    bottom: 48, left: 36,
    zIndex: 20,
    padding: "16px 20px",
    background: "rgba(0,0,5,0.92)",
    border: "1px solid rgba(212,168,83,0.22)",
    backdropFilter: "blur(16px)",
    maxWidth: 280,
  },
  floatingTag: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: "0.36rem",
    letterSpacing: "0.3em",
    padding: "2px 10px",
    background: "rgba(255,107,26,0.1)",
    border: "1px solid rgba(255,107,26,0.3)",
    color: "#ff6b1a",
    display: "inline-block",
    marginBottom: 8,
  },
  floatingName: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "1.15rem",
    letterSpacing: "0.06em",
    color: "#fff",
    lineHeight: 1.2,
    marginBottom: 6,
  },
  floatingPrice: {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "1.2rem",
    color: "#f0c875",
    textShadow: "0 0 18px rgba(212,168,83,0.5), 0 0 50px rgba(212,168,83,0.18)",
  },

  /* Glyph strip */
  glyphStrip: {
    position: "absolute",
    bottom: 10, left: "50%",
    transform: "translateX(-50%)",
    fontFamily: "serif",
    fontSize: "0.9rem",
    letterSpacing: "0.5em",
    color: "rgba(212,168,83,0.08)",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    animation: "glyphScroll 10s linear infinite",
  },

  /* Toast */
  toast: {
    position: "fixed",
    bottom: 48, left: "50%",
    transform: "translateX(-50%)",
    zIndex: 999,
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "0.45rem",
    letterSpacing: "0.18em",
    padding: "10px 28px",
    background: "rgba(0,0,5,0.98)",
    border: "1px solid #d4a853",
    color: "#f0c875",
    boxShadow: "0 0 18px rgba(212,168,83,0.5), 0 0 50px rgba(212,168,83,0.18)",
    whiteSpace: "nowrap",
    animation: "toastIn 0.3s ease forwards",
  },
};