import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VoidActivation from "./VoidActivation";
import LogoReveal from "./LogoReveal";
import SkipButton from "./SkipButton";

interface IntroSequenceProps {
  onComplete: () => void;
}

export default function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 3000);
    const t3 = setTimeout(() => setPhase(3), 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  function handleEnter() {
    setExiting(true);
    setTimeout(() => {
      sessionStorage.setItem("gen-era-intro-seen", "1");
      onComplete();
    }, 900);
  }

  function handleSkip() {
    setExiting(true);
    setTimeout(() => {
      sessionStorage.setItem("gen-era-intro-seen", "1");
      onComplete();
    }, 500);
  }

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#000005",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <link
            href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=Share+Tech+Mono&display=swap"
            rel="stylesheet"
          />

          <VoidActivation phase={phase} />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,5,0.6) 100%)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />

          <LogoReveal phase={phase} />

          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{
                position: "absolute",
                bottom: "18%",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <motion.button
                onClick={handleEnter}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  boxShadow: [
                    "0 0 18px rgba(255,107,26,0.3), 0 0 40px rgba(255,107,26,0.1)",
                    "0 0 28px rgba(255,107,26,0.6), 0 0 60px rgba(255,107,26,0.2)",
                    "0 0 18px rgba(255,107,26,0.3), 0 0 40px rgba(255,107,26,0.1)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  padding: "16px 48px",
                  background: "linear-gradient(135deg, rgba(200,72,0,0.15), rgba(255,107,26,0.08))",
                  border: "1px solid rgba(255,107,26,0.5)",
                  color: "#ff6b1a",
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: "clamp(0.55rem, 1.2vw, 0.85rem)",
                  letterSpacing: "0.4em",
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, rgba(200,72,0,0.3), rgba(255,107,26,0.15))";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, rgba(200,72,0,0.15), rgba(255,107,26,0.08))";
                }}
              >
                ⚡ ENTER THE TEMPLE
              </motion.button>

              <motion.p
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "clamp(0.35rem, 0.6vw, 0.5rem)",
                  letterSpacing: "0.5em",
                  color: "rgba(212,168,83,0.4)",
                }}
              >
                GEN ERA UNIVERSE — INITIALIZING
              </motion.p>
            </motion.div>
          )}

          <SkipButton onSkip={handleSkip} />

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.3), transparent)",
              zIndex: 20,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: "linear-gradient(90deg, transparent, rgba(255,107,26,0.2), transparent)",
              zIndex: 20,
            }}
          />

          <style>{`
            @keyframes scanline {
              0%  { transform: translateY(-100%); }
              100%{ transform: translateY(100vh); }
            }
          `}</style>

          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 15,
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.015) 3px, rgba(0,0,0,0.015) 4px)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
