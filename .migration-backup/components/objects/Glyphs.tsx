"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Glyphs() {
  const ref = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group ref={ref} position={[0, 2, 0]}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 12) * Math.PI * 2) * 2,
            0,
            Math.sin((i / 12) * Math.PI * 2) * 2,
          ]}
        >
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial
            color="#d4a853"
            emissive="#d4a853"
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  );
}