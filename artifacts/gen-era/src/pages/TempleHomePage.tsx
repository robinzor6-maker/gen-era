import { useState, useCallback, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { AudioProvider, useAudio } from "@/lib/audio/AudioContext";
import TempleScene from "@/components/temple/TempleScene";
import TempleNav from "@/components/temple/TempleNav";
import ProductInfoPanel from "@/components/temple/products/ProductInfoPanel";

function checkWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function WebGLFallback() {
  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#000005",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 24,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <span style={{ fontSize: "3rem", filter: "drop-shadow(0 0 18px rgba(212,168,83,0.6))" }}>𓂀</span>
      <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: "1.8rem", letterSpacing: "0.3em", color: "#d4a853", textShadow: "0 0 20px rgba(212,168,83,0.5)" }}>
        GEN <span style={{ color: "#ff6b1a" }}>ERA</span>
      </div>
      <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.3em", color: "rgba(212,168,83,0.45)", textAlign: "center", maxWidth: 340 }}>
        3D TEMPLE REQUIRES WEBGL — YOUR DEVICE MAY NOT SUPPORT IT
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <Link href="/classic" style={{ textDecoration: "none" }}>
          <button style={{ padding: "10px 28px", background: "linear-gradient(135deg, #c84800, #ff6b1a)", border: "none", color: "#fff", fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.25em", cursor: "pointer" }}>
            CLASSIC VIEW
          </button>
        </Link>
        <Link href="/store" style={{ textDecoration: "none" }}>
          <button style={{ padding: "10px 28px", background: "none", border: "1px solid rgba(212,168,83,0.3)", color: "#d4a853", fontFamily: "'Cinzel', serif", fontSize: "0.5rem", letterSpacing: "0.25em", cursor: "pointer" }}>
            ENTER STORE
          </button>
        </Link>
      </div>
    </div>
  );
}

function TempleContent() {
  const [openHotspotId, setOpenHotspotId] = useState<string | null>(null);
  const webGLSupported = useMemo(() => checkWebGL(), []);
  const { startAmbient, toggleMute, isPlaying } = useAudio();

  const handleHotspotOpen = useCallback((id: string) => {
    setOpenHotspotId(id || null);
  }, []);

  const handleAudioToggle = useCallback(() => {
    if (!isPlaying) {
      startAmbient();
    } else {
      toggleMute();
    }
  }, [isPlaying, startAmbient, toggleMute]);

  if (!webGLSupported) return <WebGLFallback />;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#000005",
      overflow: "hidden",
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        style={{ width: "100%", height: "100%" }}
      >
        <TempleScene
          openHotspotId={openHotspotId}
          onHotspotOpen={handleHotspotOpen}
        />
      </motion.div>

      {/* Temple Commerce Layer — Product Info Panel */}
      <ProductInfoPanel />

      <TempleNav onAudioToggle={handleAudioToggle} />

      {/* CRT scanline overlay */}
      <div style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.012) 3px, rgba(0,0,0,0.012) 4px)",
      }} />

      {/* Vignette */}
      <div style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 51,
        background: "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(0,0,3,0.6) 100%)",
      }} />
    </div>
  );
}

export default function TempleHomePage() {
  return (
    <AudioProvider>
      <TempleContent />
    </AudioProvider>
  );
}
