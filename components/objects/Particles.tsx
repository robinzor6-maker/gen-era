"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Particles() {
  const ref = useRef<any>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={ref}>
      {Array.from({ length: 80 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 6,
            (Math.random() - 0.5) * 20,
          ]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#ff6b1a" />
        </mesh>
      ))}
    </group>
  );
}