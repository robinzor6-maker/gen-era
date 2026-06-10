import { Link } from "wouter";
import { motion } from "framer-motion";
import { useAudio } from "@/lib/audio/AudioContext";
import { useCartStore } from "@/lib/store";

interface TempleNavProps {
  onAudioToggle: () => void;
}

export default function TempleNav({ onAudioToggle }: TempleNavProps) {
  const { isMuted, isPlaying, volume, setVolume } = useAudio();
  const cartCount = useCartStore(s => s.cartCount);
  const setIsOpen = useCartStore(s => s.setIsOpen);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Share+Tech+Mono&display=swap"
        rel="stylesheet"
      />
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          background: "linear-gradient(180deg, rgba(0,0,5,0.95) 0%, rgba(0,0,5,0.0) 100%)",
          pointerEvents: "none",
        }}
      >
        <div style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "1.05rem",
          letterSpacing: "0.28em",
          color: "#d4a853",
          textShadow: "0 0 18px rgba(212,168,83,0.5)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          pointerEvents: "auto",
        }}>
          <span style={{ animation: "eyeGlow 3.5s ease-in-out infinite" }}>𓂀</span>
          GEN <span style={{ color: "#ff6b1a" }}>ERA</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, pointerEvents: "auto" }}>
          <button
            onClick={onAudioToggle}
            title={isPlaying ? (isMuted ? "Unmute" : "Mute") : "Start Audio"}
            style={{
              background: "none",
              border: "1px solid rgba(212,168,83,0.18)",
              color: isMuted ? "rgba(212,168,83,0.3)" : "rgba(212,168,83,0.7)",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.45rem",
              letterSpacing: "0.2em",
              padding: "4px 10px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {!isPlaying ? "♪ AMBIENT" : isMuted ? "✕ MUTED" : "♪ LIVE"}
          </button>

          {isPlaying && !isMuted && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ width: 60, accentColor: "#d4a853", cursor: "pointer" }}
            />
          )}

          <Link href="/store" style={{ textDecoration: "none" }}>
            <button style={{
              background: "none",
              border: "1px solid rgba(212,168,83,0.18)",
              color: "rgba(212,168,83,0.55)",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.42rem",
              letterSpacing: "0.2em",
              padding: "4px 12px",
              cursor: "pointer",
            }}>
              STORE
            </button>
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            style={{
              background: "none",
              border: "1px solid rgba(212,168,83,0.18)",
              color: "rgba(212,168,83,0.55)",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.42rem",
              letterSpacing: "0.2em",
              padding: "4px 12px",
              cursor: "pointer",
            }}
          >
            CART <span style={{ color: "#ff6b1a" }}>{cartCount}</span>
          </button>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1.0 }}
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 200,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.4rem",
          letterSpacing: "0.5em",
          color: "rgba(212,168,83,0.25)",
          pointerEvents: "none",
          animation: "breathe 4s ease-in-out infinite",
        }}
      >
        DRAG TO EXPLORE · CLICK HOTSPOTS TO DISCOVER
      </motion.div>

      <style>{`
        @keyframes eyeGlow {
          0%,100% { filter: drop-shadow(0 0 6px rgba(212,168,83,0.6)); }
          50% { filter: drop-shadow(0 0 18px #d4a853) drop-shadow(0 0 40px rgba(212,168,83,0.3)); }
        }
        @keyframes breathe {
          0%,100% { opacity: 0.25; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
