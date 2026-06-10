import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ReflectiveFloor() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#080510",
    metalness: 0.95,
    roughness: 0.08,
    envMapIntensity: 1.0,
  }), []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[60, 60, 1, 1]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

function Pillar({ position }: { position: [number, number, number] }) {
  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1a1208",
    metalness: 0.7,
    roughness: 0.4,
    emissive: "#c84800",
    emissiveIntensity: 0.08,
  }), []);

  const capMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#d4a853",
    metalness: 0.9,
    roughness: 0.15,
    emissive: "#c84800",
    emissiveIntensity: 0.2,
  }), []);

  const glowRef = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (glowRef.current) {
      glowRef.current.intensity = 0.4 + Math.sin(Date.now() * 0.001 + position[0]) * 0.15;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow receiveShadow material={baseMat} position={[0, 4, 0]}>
        <cylinderGeometry args={[0.45, 0.65, 8, 8]} />
      </mesh>
      <mesh material={capMat} position={[0, 8.2, 0]}>
        <cylinderGeometry args={[0.7, 0.5, 0.4, 8]} />
      </mesh>
      <mesh material={capMat} position={[0, 8.5, 0]}>
        <boxGeometry args={[1.4, 0.2, 1.4]} />
      </mesh>
      <mesh material={baseMat} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.8, 0.9, 0.3, 8]} />
      </mesh>

      <pointLight ref={glowRef} color="#ff6b1a" intensity={0.4} distance={4} decay={2} position={[0, 8.5, 0]} />

      {[-0.35, 0, 0.35].map((dy, i) => (
        <mesh key={i} material={capMat} position={[0.48, 2 + dy * 2, 0]}>
          <boxGeometry args={[0.02, 0.3, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

function LightShaft({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#d4a853",
    transparent: true,
    opacity: 0.022,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), []);

  useFrame(() => {
    if (ref.current) {
      ref.current.material.opacity = 0.015 + Math.sin(Date.now() * 0.0005) * 0.008;
    }
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation} material={mat}>
      <coneGeometry args={[1.8, 14, 6, 1, true]} />
    </mesh>
  );
}

function Ceiling() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#060410",
    metalness: 0.5,
    roughness: 0.7,
    emissive: "#1a0050",
    emissiveIntensity: 0.1,
  }), []);

  const beamMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#d4a853",
    metalness: 0.9,
    roughness: 0.2,
    emissive: "#c84800",
    emissiveIntensity: 0.15,
  }), []);

  return (
    <group>
      <mesh material={mat} position={[0, 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
      </mesh>
      {[-12, -6, 0, 6, 12].map((x, i) => (
        <mesh key={i} material={beamMat} position={[x, 9.85, 0]}>
          <boxGeometry args={[0.2, 0.3, 60]} />
        </mesh>
      ))}
    </group>
  );
}

function WingWalls() {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#0a0815",
    metalness: 0.6,
    roughness: 0.5,
    emissive: "#0d0520",
    emissiveIntensity: 0.3,
  }), []);

  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#d4a853",
    metalness: 0.9,
    roughness: 0.1,
    emissive: "#c84800",
    emissiveIntensity: 0.3,
  }), []);

  const walls = [
    { pos: [0, 5, -22] as [number, number, number], rot: [0, 0, 0] as [number, number, number], label: "NORTH" },
    { pos: [0, 5, 22] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number], label: "SOUTH" },
    { pos: [-22, 5, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], label: "WEST" },
    { pos: [22, 5, 0] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number], label: "EAST" },
  ];

  return (
    <group>
      {walls.map((w, i) => (
        <group key={i} position={w.pos} rotation={w.rot}>
          <mesh material={mat}>
            <planeGeometry args={[44, 10]} />
          </mesh>
          <mesh material={accentMat} position={[0, 4.9, 0.05]}>
            <boxGeometry args={[44, 0.06, 0.02]} />
          </mesh>
          <mesh material={accentMat} position={[0, -4.9, 0.05]}>
            <boxGeometry args={[44, 0.06, 0.02]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function GroundGlyphs() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#d4a853",
    transparent: true,
    opacity: 0.06,
  }), []);

  const rings = [4, 7, 10, 14];
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      {rings.map((r, i) => (
        <mesh key={i} material={mat}>
          <ringGeometry args={[r - 0.02, r + 0.02, 64]} />
        </mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={`line-${i}`} material={mat} rotation={[0, 0, angle]}>
            <planeGeometry args={[0.02, 14]} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function TempleEnvironment() {
  const pillarPositions: [number, number, number][] = [
    [-5, 0, -5], [5, 0, -5],
    [-5, 0, 5],  [5, 0, 5],
    [-9, 0, -9], [9, 0, -9],
    [-9, 0, 9],  [9, 0, 9],
    [-13, 0, -5],[13, 0, -5],
    [-13, 0, 5], [13, 0, 5],
  ];

  const shaftPositions: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [
    { pos: [-8, 10, -8], rot: [0, 0, 0] },
    { pos: [8, 10, -8],  rot: [0, 0, 0] },
    { pos: [-8, 10, 8],  rot: [0, 0, 0] },
    { pos: [8, 10, 8],   rot: [0, 0, 0] },
  ];

  return (
    <group>
      <ReflectiveFloor />
      <Ceiling />
      <WingWalls />
      <GroundGlyphs />

      {pillarPositions.map((pos, i) => (
        <Pillar key={i} position={pos} />
      ))}

      {shaftPositions.map((s, i) => (
        <LightShaft key={i} position={s.pos} rotation={s.rot} />
      ))}
    </group>
  );
}
