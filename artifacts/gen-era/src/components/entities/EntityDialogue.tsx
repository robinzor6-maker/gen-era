import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EntityDialogueProps {
  lines: string[];
  accent: string;
  entityName: string;
  visible: boolean;
}

export default function EntityDialogue({ lines, accent, entityName, visible }: EntityDialogueProps) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [lineComplete, setLineComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charRef  = useRef(0);

  useEffect(() => {
    if (!visible) {
      setCurrentLine(0);
      setDisplayText('');
      setLineComplete(false);
      charRef.current = 0;
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || lines.length === 0) return;
    const line = lines[currentLine] ?? '';
    charRef.current = 0;
    setDisplayText('');
    setLineComplete(false);

    const tick = () => {
      charRef.current++;
      setDisplayText(line.slice(0, charRef.current));
      if (charRef.current < line.length) {
        timerRef.current = setTimeout(tick, 44);
      } else {
        setLineComplete(true);
        if (currentLine < lines.length - 1) {
          timerRef.current = setTimeout(() => setCurrentLine(l => l + 1), 1350);
        }
      }
    };

    timerRef.current = setTimeout(tick, 44);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentLine, visible, lines]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.55 }}
          style={{
            position: 'absolute',
            bottom: 22, left: 22,
            maxWidth: 340,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          {/* Entity badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.35rem',
              letterSpacing: '0.5em',
              color: `${accent}55`,
              marginBottom: 7,
              textTransform: 'uppercase',
            }}
          >
            {entityName} SPEAKS
          </motion.div>

          {/* Previously typed lines (faded) */}
          {lines.slice(0, currentLine).map((line, i) => (
            <div key={i} style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.45rem',
              color: `${accent}40`,
              fontStyle: 'italic',
              letterSpacing: '0.04em',
              lineHeight: 1.7,
              marginBottom: 2,
            }}>{line}</div>
          ))}

          {/* Current line — typewriter */}
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.52rem',
            color: `${accent}cc`,
            fontStyle: 'italic',
            letterSpacing: '0.05em',
            lineHeight: 1.65,
            textShadow: `0 0 20px ${accent}44`,
          }}>
            {displayText}
            {!lineComplete && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.82 }}
                style={{ color: accent }}
              >▋</motion.span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
