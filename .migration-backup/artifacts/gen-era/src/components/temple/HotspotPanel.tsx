import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/lib/audio/AudioContext";
import { HotspotData } from "./TempleHotspot";

interface HotspotPanelProps {
  data: HotspotData | null;
  onClose: () => void;
}

export default function HotspotPanel({ data, onClose }: HotspotPanelProps) {
  const { playUISound } = useAudio();

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key={data.id}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 500,
            width: "min(480px, 90vw)",
            background: "rgba(4,3,12,0.97)",
            border: `1px solid ${data.color}44`,
            backdropFilter: "blur(20px)",
            padding: "28px 32px 24px",
          }}
        >
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${data.color}, transparent)`,
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.38rem",
                letterSpacing: "0.5em",
                color: data.color,
                marginBottom: 6,
                opacity: 0.7,
              }}>
                {data.wing}
              </div>
              <div style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "1.2rem",
                letterSpacing: "0.12em",
                color: "#f0c875",
                textShadow: `0 0 18px ${data.color}66`,
              }}>
                {data.label}
              </div>
            </div>
            <button
              onClick={() => { onClose(); playUISound("click"); }}
              style={{
                background: "none",
                border: "1px solid rgba(212,168,83,0.2)",
                color: "rgba(212,168,83,0.4)",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.5rem",
                letterSpacing: "0.2em",
                padding: "4px 12px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </div>

          <div style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.2), transparent)",
            marginBottom: 16,
          }} />

          <p style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "0.55rem",
            letterSpacing: "0.06em",
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.7,
            marginBottom: 20,
          }}>
            {data.description}
          </p>

          <div style={{
            padding: "10px 14px",
            background: `${data.color}0a`,
            border: `1px solid ${data.color}22`,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ color: data.color, fontSize: "0.7rem", flexShrink: 0 }}>◈</span>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.42rem",
              letterSpacing: "0.15em",
              color: data.color,
              opacity: 0.8,
            }}>
              {data.future}
            </span>
          </div>

          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${data.color}44, transparent)`,
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
