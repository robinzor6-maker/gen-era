import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EntityEntranceProps {
  district: 'ankhron' | 'osyron';
  accent: string;
  entityName: string;
  active: boolean;
  onEntityShow: () => void;
  onComplete: () => void;
}

export default function EntityEntrance({
  district, accent, entityName, active, onEntityShow, onComplete,
}: EntityEntranceProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);

  const stableOnEntityShow = useCallback(onEntityShow, []);
  const stableOnComplete   = useCallback(onComplete, []);

  useEffect(() => {
    if (!active) {
      setPhase(0);
      return;
    }

    setPhase(0);

    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => { setPhase(3); stableOnEntityShow(); }, 3100);
    const t4 = setTimeout(() => { setPhase(4); stableOnComplete(); }, 5600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [active, stableOnEntityShow, stableOnComplete]);

  const isAnkhron = district === 'ankhron';

  return (
    <AnimatePresence>
      {active && phase < 4 && (
        <motion.div
          key="entrance"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 3 ? [1, 1, 0] : 1 }}
          exit={{ opacity: 0 }}
          transition={phase === 3 ? { duration: 2.4, delay: 0 } : { duration: 0.4 }}
          style={{
            position: 'absolute', inset: 0,
            background: '#000004',
            zIndex: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {/* Phase 1+: Eyes */}
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.15 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: '44%', left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex', gap: 36,
                zIndex: 2,
              }}
            >
              {[0, 1].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.14, 1] }}
                  transition={{ repeat: Infinity, duration: 1.7, delay: i * 0.22 }}
                  style={{
                    width: 18, height: 18,
                    borderRadius: '50%',
                    background: accent,
                    boxShadow: `0 0 20px 8px ${accent}88, 0 0 55px 20px ${accent}33`,
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Phase 2+: Stream particles gathering */}
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45 }}
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
            >
              {Array.from({ length: 22 }, (_, i) => {
                const angle = (i / 22) * Math.PI * 2;
                const r     = 110 + (i % 4) * 55;
                return (
                  <motion.div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: '50%', left: '50%',
                      width: 5, height: 5,
                      borderRadius: '50%',
                      background: accent,
                      boxShadow: `0 0 8px ${accent}`,
                    }}
                    initial={{
                      x: Math.cos(angle) * r,
                      y: Math.sin(angle) * r,
                      opacity: 0, scale: 0.4,
                    }}
                    animate={{
                      x: [Math.cos(angle) * r, Math.cos(angle) * r * 0.28, 0],
                      y: [Math.sin(angle) * r, Math.sin(angle) * r * 0.28, 0],
                      opacity: [0, 0.9, 0],
                      scale: [0.4, 1.2, 0.15],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.055,
                      ease: 'easeIn',
                    }}
                  />
                );
              })}
            </motion.div>
          )}

          {/* Phase 3+: Entity name + aura */}
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.35, y: 35 }}
              animate={{ opacity: [0, 1, 1], scale: [0.35, 1.12, 1], y: [35, -8, 0] }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, position: 'relative' }}
            >
              {/* Rotating aura rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  width: 200, height: 200,
                  borderRadius: '50%',
                  border: `1px solid ${accent}30`,
                  boxShadow: `inset 0 0 50px ${accent}18, 0 0 70px ${accent}22`,
                  top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 7, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  width: 145, height: 145,
                  borderRadius: '50%',
                  border: `1px solid ${accent}1a`,
                  top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                }}
              />

              {/* Entity name */}
              <div style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: 'clamp(1.5rem, 3.2vw, 2.4rem)',
                letterSpacing: '0.35em',
                color: accent,
                textShadow: `0 0 45px ${accent}cc, 0 0 90px ${accent}55`,
                position: 'relative', zIndex: 1,
                textAlign: 'center',
              }}>{entityName}</div>

              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.4rem',
                letterSpacing: '0.55em',
                color: `${accent}55`,
                position: 'relative', zIndex: 1,
                textAlign: 'center',
              }}>
                {isAnkhron ? 'GUARDIAN OF THE ARCHIVE' : 'HERALD OF THE FLAME'}
              </div>
            </motion.div>
          )}

          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 30%, #000004 80%)',
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
