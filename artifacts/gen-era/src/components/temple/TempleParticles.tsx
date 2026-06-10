import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function TempleParticles({ count = 320 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const velRef = useRef<Float32Array | null>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);

    const goldColor = new THREE.Color("#d4a853");
    const fireColor = new THREE.Color("#ff6b1a");
    const whiteColor = new THREE.Color("#fff8e0");

    for (let i = 0; i < count; i++) {
      const r = 1.5 + Math.random() * 14;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3]     = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.random() * 9;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      vels[i * 3]     = (Math.random() - 0.5) * 0.003;
      vels[i * 3 + 1] = 0.002 + Math.random() * 0.006;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.003;

      const pick = Math.random();
      const c = pick < 0.5 ? goldColor : pick < 0.8 ? fireColor : whiteColor;
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    velRef.current = vels;
    return { positions, colors };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    depthWrite: false,
  }), []);

  useFrame(() => {
    if (!ref.current || !velRef.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const vel = velRef.current;

    for (let i = 0; i < count; i++) {
      pos[i * 3]     += vel[i * 3];
      pos[i * 3 + 1] += vel[i * 3 + 1];
      pos[i * 3 + 2] += vel[i * 3 + 2];

      if (pos[i * 3 + 1] > 9.5) {
        pos[i * 3 + 1] = 0.1;
        const r = 1.5 + Math.random() * 14;
        const angle = Math.random() * Math.PI * 2;
        pos[i * 3]     = Math.cos(angle) * r;
        pos[i * 3 + 2] = Math.sin(angle) * r;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return <primitive object={new THREE.Points(geometry, material)} ref={ref} />;
}
