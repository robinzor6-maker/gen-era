"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Portal() {
  const ref = useRef<any>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.6;
      ref.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={[0, 2, 0]}>
      <torusGeometry args={[1.4, 0.25, 32, 200]} />
      <meshStandardMaterial
        color="#000000"
        emissive="#000000"
        metalness={1}
        roughness={0}
      />
    </mesh>
  );
}