import { motion } from "framer-motion";

interface SkipButtonProps {
  onSkip: () => void;
}

export default function SkipButton({ onSkip }: SkipButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      onClick={onSkip}
      style={{
        position: "absolute",
        top: 28,
        right: 32,
        zIndex: 200,
        background: "none",
        border: "1px solid rgba(212,168,83,0.2)",
        color: "rgba(212,168,83,0.4)",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "0.55rem",
        letterSpacing: "0.3em",
        padding: "6px 18px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(212,168,83,0.9)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,168,83,0.5)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(212,168,83,0.4)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,168,83,0.2)";
      }}
    >
      SKIP ›
    </motion.button>
  );
}
