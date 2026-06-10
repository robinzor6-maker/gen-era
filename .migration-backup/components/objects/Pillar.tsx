"use client";

export default function Pillar({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 1.5, z]} castShadow>
      <cylinderGeometry args={[0.5, 0.7, 3, 32]} />
      <meshStandardMaterial
        color="#b87333"
        metalness={0.8}
        roughness={0.25}
      />
    </mesh>
  );
}