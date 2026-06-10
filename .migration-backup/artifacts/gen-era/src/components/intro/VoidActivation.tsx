import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export default function VoidActivation({ phase }: { phase: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const spawnParticle = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.3 + Math.random() * (phase >= 2 ? 2.5 : 0.8);
      const colors = ["#d4a853", "#ff6b1a", "#f0c875", "#c84800", "#fff8e0"];
      particlesRef.current.push({
        x: cx + (Math.random() - 0.5) * (phase >= 2 ? 300 : 100),
        y: cy + (Math.random() - 0.5) * (phase >= 2 ? 300 : 100),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 80 + Math.random() * 120,
        size: 0.5 + Math.random() * (phase >= 2 ? 2.5 : 1.2),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const render = () => {
      ctx.fillStyle = "rgba(0,0,5,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const spawnRate = phase >= 2 ? 6 : 2;
      for (let i = 0; i < spawnRate; i++) spawnParticle();

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.7;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        return p.life < p.maxLife;
      });

      if (phase >= 2) {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
        grad.addColorStop(0, "rgba(255,107,26,0.06)");
        grad.addColorStop(0.5, "rgba(212,168,83,0.02)");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, [phase]);

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
