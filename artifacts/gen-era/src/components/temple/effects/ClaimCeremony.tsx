import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClaimCeremonyProps {
  accent: string;
  productName: string;
  onComplete: () => void;
}

type Phase = 0 | 1 | 2 | 3 | 4;

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  angle: number;
  speed: number;
}

export default function ClaimCeremony({ accent, productName, onComplete }: ClaimCeremonyProps) {
  const [phase, setPhase] = useState<Phase>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const startRef  = useRef<number>(0);

  // Phase timings (ms)
  const TIMINGS = [0, 450, 1050, 1750, 2550];
  const TOTAL   = 3500;

  useEffect(() => {
    const t0 = performance.now();
    startRef.current = t0;

    const advance = (now: number) => {
      const elapsed = now - t0;
      const p: Phase = elapsed < TIMINGS[1] ? 0
        : elapsed < TIMINGS[2] ? 1
        : elapsed < TIMINGS[3] ? 2
        : elapsed < TIMINGS[4] ? 3
        : 4;
      setPhase(p);
      if (elapsed < TOTAL) {
        animRef.current = requestAnimationFrame(advance);
      } else {
        onComplete();
      }
    };

    animRef.current = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Particle canvas explosion
  useEffect(() => {
    if (phase !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const particles: Particle[] = Array.from({ length: 70 }, (_, id) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      return {
        id, x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 5, opacity: 1, angle, speed,
      };
    });

    const glyphs = ['𓂀', '𓃀', '𓄿', '𓅂', '◈', '⬡', '◆', '✦'];
    let frame = 0;

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        if (p.opacity <= 0) return;
        alive = true;
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.12;
        p.opacity -= 0.018;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = accent;
        ctx.shadowBlur = 12;
        ctx.shadowColor = accent;

        if (p.id % 5 === 0) {
          ctx.font = `${p.size * 3}px serif`;
          ctx.fillText(glyphs[p.id % glyphs.length], p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      frame++;
      if (alive && frame < 120) requestAnimationFrame(loop);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    loop();
  }, [phase, accent]);

  const pulseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at 50% 50%, ${accent}22 0%, transparent 70%)`,
    pointerEvents: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />

      {/* Phase 0: Initial pulse */}
      <AnimatePresence>
        {phase === 0 && (
          <motion.div key="p0"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0.4, 0.9, 0.5] }}
            transition={{ duration: 0.45, times: [0, 0.2, 0.4, 0.7, 1] }}
            style={pulseStyle}
          />
        )}
      </AnimatePresence>

      {/* Phase 2: Energy beam */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div key="beam"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: [0, 1, 0.8, 1] }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              transformOrigin: 'top center',
              width: 3,
              height: '100%',
              background: `linear-gradient(180deg, transparent 0%, ${accent}ee 40%, ${accent} 50%, ${accent}ee 60%, transparent 100%)`,
              boxShadow: `0 0 24px 8px ${accent}88, 0 0 60px 20px ${accent}44`,
              filter: 'blur(0.5px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 2: Horizontal scanlines */}
      <AnimatePresence>
        {phase === 2 && (
          <motion.div key="scan"
            initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0,
              background: `repeating-linear-gradient(0deg, transparent, transparent 4px, ${accent}18 4px, ${accent}18 5px)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 3: Portal ring */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div key="portal"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1.0], opacity: [0, 1, 0.85] }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 320, height: 320,
              borderRadius: '50%',
              border: `3px solid ${accent}`,
              boxShadow: `0 0 40px ${accent}88, 0 0 80px ${accent}44, inset 0 0 60px ${accent}22`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 3: Inner portal glow */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div key="portal-inner"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 0.9], opacity: [0, 0.35] }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.75, delay: 0.1 }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 280, height: 280,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${accent}44, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Phase 3: Rotating rings */}
      <AnimatePresence>
        {phase >= 3 && (
          <>
            {[400, 480].map((size, i) => (
              <motion.div key={`ring-${i}`}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{ scale: 1, opacity: 0.4, rotate: i === 0 ? 360 : -360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, rotate: { repeat: Infinity, duration: 3, ease: 'linear' }, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: size, height: size,
                  borderRadius: '50%',
                  border: `1px solid ${accent}66`,
                  transformOrigin: 'center center',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Phase 4: Claim complete */}
      <AnimatePresence>
        {phase === 4 && (
          <motion.div key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            {/* Background flash */}
            <motion.div
              initial={{ opacity: 0.6 }} animate={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'fixed', inset: 0,
                background: `radial-gradient(circle at 50% 50%, ${accent}33 0%, transparent 60%)`,
              }}
            />

            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0, 1, 0.9] }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: 'clamp(1.4rem, 4vw, 2.6rem)',
                color: accent,
                letterSpacing: '0.22em',
                textShadow: `0 0 40px ${accent}, 0 0 80px ${accent}66`,
                marginBottom: 16,
                lineHeight: 1.1,
              }}
            >
              𓂀
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: 'clamp(0.9rem, 2.5vw, 1.5rem)',
                color: accent,
                letterSpacing: '0.3em',
                textShadow: `0 0 24px ${accent}88`,
              }}
            >
              ARTIFACT CLAIMED
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              transition={{ delay: 0.25 }}
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.5rem',
                color: accent,
                letterSpacing: '0.45em',
                marginTop: 12,
              }}
            >
              {productName.toUpperCase()}
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              style={{
                marginTop: 20,
                height: 1,
                width: 240,
                background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                transformOrigin: 'center',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
