import { motion } from "framer-motion";

interface LogoRevealProps {
  phase: number;
}

export default function LogoReveal({ phase }: LogoRevealProps) {
  const glyphs = ["𓂀", "𓆣", "𓋹", "𓇯", "𓆑", "𓂋", "𓈖", "𓆓", "𓅓", "𓆼"];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=Share+Tech+Mono&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {phase >= 1 && (
          <>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                width: 240,
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.4), transparent)",
                marginBottom: 32,
              }}
            />

            <motion.div
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: "clamp(3rem, 8vw, 6rem)",
                letterSpacing: "0.35em",
                color: "#f0c875",
                textShadow:
                  "0 0 40px rgba(212,168,83,0.9), 0 0 80px rgba(212,168,83,0.4), 0 0 120px rgba(212,168,83,0.15)",
                lineHeight: 1,
                marginBottom: 12,
              }}
            >
              GEN{" "}
              <span
                style={{
                  color: "#ff6b1a",
                  textShadow:
                    "0 0 40px rgba(255,107,26,0.9), 0 0 80px rgba(255,107,26,0.4), 0 0 120px rgba(255,107,26,0.2)",
                }}
              >
                ERA
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "clamp(0.4rem, 1vw, 0.7rem)",
                letterSpacing: "0.7em",
                color: "rgba(212,168,83,0.35)",
                marginBottom: 40,
              }}
            >
              TEMPLE OF COMMERCE
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              style={{
                width: 240,
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.4), transparent)",
                marginBottom: 40,
              }}
            />
          </>
        )}

        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.0 }}
            style={{
              display: "flex",
              gap: "clamp(8px, 2vw, 24px)",
              marginBottom: 48,
            }}
          >
            {glyphs.map((g, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: [0, 0.5, 0.15] }}
                transition={{
                  delay: 0.8 + i * 0.06,
                  duration: 1.2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: Math.random() * 2,
                }}
                style={{
                  fontFamily: "serif",
                  fontSize: "clamp(0.8rem, 1.5vw, 1.1rem)",
                  color: "#d4a853",
                }}
              >
                {g}
              </motion.span>
            ))}
          </motion.div>
        )}

        {phase >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 1, 0.7, 1],
              scale: [0.8, 1.1, 1.0],
              filter: [
                "drop-shadow(0 0 10px rgba(212,168,83,0.5))",
                "drop-shadow(0 0 40px rgba(212,168,83,0.9)) drop-shadow(0 0 80px rgba(255,107,26,0.5))",
                "drop-shadow(0 0 20px rgba(212,168,83,0.7))",
              ],
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              marginBottom: 32,
              lineHeight: 1,
            }}
          >
            𓂀
          </motion.div>
        )}
      </div>
    </>
  );
}
