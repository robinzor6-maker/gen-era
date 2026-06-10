import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function VoidCore() {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const midRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const glyphRingRef = useRef<THREE.Group>(null);
  const energyRef = useRef<THREE.Mesh>(null);

  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#d4a853",
    emissive: "#c84800",
    emissiveIntensity: 1.2,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  }), []);

  const fireMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ff6b1a",
    emissive: "#ff4400",
    emissiveIntensity: 2.0,
    metalness: 0.0,
    roughness: 1.0,
    transparent: true,
    opacity: 0.7,
  }), []);

  const voidMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#000010",
    emissive: "#1a0050",
    emissiveIntensity: 0.8,
    metalness: 1.0,
    roughness: 0.0,
    transparent: true,
    opacity: 0.95,
  }), []);

  const energyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#d4a853",
    emissive: "#d4a853",
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
  }), []);

  const glyphBoxes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const r = 2.1;
      return { x: Math.cos(angle) * r, z: Math.sin(angle) * r, angle };
    });
  }, []);

  useFrame((_, delta) => {
    const t = Date.now() * 0.001;
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.18;
      outerRingRef.current.rotation.x = Math.sin(t * 0.3) * 0.05;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * 0.35;
      innerRingRef.current.rotation.y += delta * 0.12;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.y += delta * 0.22;
      midRingRef.current.rotation.x -= delta * 0.08;
    }
    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 1.5) * 0.06;
      coreRef.current.scale.setScalar(pulse);
      (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.8 + Math.sin(t * 2.0) * 0.4;
    }
    if (glyphRingRef.current) {
      glyphRingRef.current.rotation.y += delta * 0.14;
    }
    if (energyRef.current) {
      energyRef.current.rotation.y += delta * 0.06;
      energyRef.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.03);
    }
  });

  return (
    <group position={[0, 2.5, 0]}>
      <pointLight color="#d4a853" intensity={4} distance={12} decay={2} />
      <pointLight color="#ff6b1a" intensity={2} distance={8} decay={2} position={[0, -1, 0]} />

      <mesh ref={outerRingRef} material={goldMat}>
        <torusGeometry args={[2.8, 0.06, 16, 80]} />
      </mesh>

      <mesh ref={midRingRef} material={fireMat}>
        <torusGeometry args={[2.0, 0.04, 12, 60]} />
      </mesh>

      <mesh ref={innerRingRef} material={goldMat}>
        <torusGeometry args={[1.3, 0.05, 12, 50]} />
      </mesh>

      <mesh ref={coreRef} material={voidMat}>
        <sphereGeometry args={[0.7, 32, 32]} />
      </mesh>

      <mesh ref={energyRef} material={energyMat}>
        <sphereGeometry args={[3.2, 24, 24]} />
      </mesh>

      <group ref={glyphRingRef}>
        {glyphBoxes.map((g, i) => (
          <mesh key={i} position={[g.x, 0, g.z]} material={goldMat}>
            <boxGeometry args={[0.08, 0.22, 0.04]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
