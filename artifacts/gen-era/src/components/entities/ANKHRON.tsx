import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CYAN = '#00d4ff';
const GOLD = '#d4a853';

function ArmorFragment({
  position, rotation, size, speed, color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  speed: number;
  color: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0a0a1a',
    metalness: 0.95,
    roughness: 0.08,
    emissive: color,
    emissiveIntensity: 0.28,
  }), [color]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y += speed * 0.007;
    ref.current.position.y = position[1] + Math.sin(t * 0.55 + position[0]) * 0.09;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <mesh material={mat}>
        <boxGeometry args={size} />
      </mesh>
      <mesh material={mat} rotation={[0, 0, Math.PI / 4]} scale={0.68}>
        <boxGeometry args={size} />
      </mesh>
    </group>
  );
}

function GoldCrack({ from, to }: { from: [number,number,number]; to: [number,number,number] }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: GOLD, transparent: true, opacity: 0.62,
  }), []);

  const mid: [number,number,number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    (from[2] + to[2]) / 2,
  ];
  const len = Math.sqrt(
    (to[0]-from[0])**2 + (to[1]-from[1])**2 + (to[2]-from[2])**2,
  );
  const dir = new THREE.Vector3(to[0]-from[0], to[1]-from[1], to[2]-from[2]).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return (
    <mesh position={mid} quaternion={q} material={mat}>
      <boxGeometry args={[0.017, len, 0.017]} />
    </mesh>
  );
}

interface ANKHRONProps {
  visible?: boolean;
  opacity?: number;
}

export default function ANKHRON({ visible = true, opacity = 1 }: ANKHRONProps) {
  const bodyRef     = useRef<THREE.Group>(null);
  const eyeLeftRef  = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const cloakRef    = useRef<THREE.Mesh>(null);

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#060810',
    metalness: 0.95,
    roughness: 0.05,
    emissive: '#00090e',
    emissiveIntensity: 0.12,
    transparent: true,
    opacity: 0.92 * opacity,
  }), [opacity]);

  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: CYAN, transparent: true, opacity: 0.95 * opacity,
  }), [opacity]);

  const eyeGlowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: CYAN, transparent: true, opacity: 0.22 * opacity,
  }), [opacity]);

  const goldMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: GOLD, transparent: true, opacity: 0.72 * opacity,
  }), [opacity]);

  const cloakMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#03020a',
    metalness: 0.3,
    roughness: 0.88,
    emissive: CYAN,
    emissiveIntensity: 0.04,
    transparent: true,
    opacity: 0.88 * opacity,
    side: THREE.DoubleSide,
  }), [opacity]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 0.38) * 0.13;
      bodyRef.current.rotation.y = Math.sin(t * 0.18) * 0.05;
    }
    const pulse = 0.94 + Math.sin(t * 1.55) * 0.06;
    if (eyeLeftRef.current)  eyeLeftRef.current.scale.setScalar(pulse);
    if (eyeRightRef.current) eyeRightRef.current.scale.setScalar(pulse + 0.02);
    if (cloakRef.current)    cloakRef.current.rotation.y += 0.002;
  });

  if (!visible) return null;

  return (
    <group>
      <group ref={bodyRef} position={[2.4, 0.55, 0]}>
        {/* Flowing cloak */}
        <mesh ref={cloakRef} material={cloakMat} position={[0, -0.5, 0]}>
          <coneGeometry args={[0.56, 2.25, 8, 1, true]} />
        </mesh>

        {/* Torso */}
        <mesh material={bodyMat} position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.28, 0.38, 1.1, 8]} />
        </mesh>

        {/* Head */}
        <mesh material={bodyMat} position={[0, 1.2, 0]}>
          <boxGeometry args={[0.42, 0.52, 0.38]} />
        </mesh>

        {/* Nemes headdress — left drape */}
        <mesh material={goldMat} position={[-0.26, 1.15, 0]} rotation={[0, 0, -0.15]}>
          <planeGeometry args={[0.15, 0.45]} />
        </mesh>
        {/* Nemes headdress — right drape */}
        <mesh material={goldMat} position={[0.26, 1.15, 0]} rotation={[0, 0, 0.15]}>
          <planeGeometry args={[0.15, 0.45]} />
        </mesh>
        {/* Crown cylinder */}
        <mesh material={goldMat} position={[0, 1.52, 0]}>
          <cylinderGeometry args={[0.08, 0.16, 0.22, 6]} />
        </mesh>

        {/* Eyes */}
        <mesh ref={eyeLeftRef} material={eyeMat} position={[-0.13, 1.22, 0.2]}>
          <sphereGeometry args={[0.052, 8, 8]} />
        </mesh>
        <mesh material={eyeGlowMat} position={[-0.13, 1.22, 0.2]}>
          <sphereGeometry args={[0.1, 8, 8]} />
        </mesh>
        <mesh ref={eyeRightRef} material={eyeMat} position={[0.13, 1.22, 0.2]}>
          <sphereGeometry args={[0.052, 8, 8]} />
        </mesh>
        <mesh material={eyeGlowMat} position={[0.13, 1.22, 0.2]}>
          <sphereGeometry args={[0.1, 8, 8]} />
        </mesh>
        <pointLight color={CYAN} intensity={1.8} distance={3} decay={2} position={[0, 1.22, 0.25]} />

        {/* Gold energy cracks */}
        <GoldCrack from={[0, 0.9, 0.2]} to={[-0.28, 0.4, 0.2]} />
        <GoldCrack from={[0, 0.9, 0.2]} to={[0.28, 0.4, 0.2]} />
        <GoldCrack from={[-0.1, 0.55, 0.2]} to={[0.1, 0.22, 0.2]} />
        <GoldCrack from={[0, 1.0, 0.2]} to={[0, 0.88, 0.2]} />

        {/* Floating armor fragments */}
        <ArmorFragment position={[-0.88, 0.62, 0.2]}  rotation={[0.2, 0, 0.3]}   size={[0.22, 0.04, 0.16]} speed={1}    color={CYAN} />
        <ArmorFragment position={[0.92, 0.82, -0.1]}  rotation={[-0.1, 0.4, -0.2]} size={[0.18, 0.04, 0.22]} speed={-0.8} color={CYAN} />
        <ArmorFragment position={[0.12, 1.52, -0.55]} rotation={[0.5, 0.2, 0.1]} size={[0.25, 0.04, 0.14]} speed={0.6}  color={GOLD} />
        <ArmorFragment position={[-0.5, -0.2, 0.52]}  rotation={[0.1, -0.3, 0.4]} size={[0.14, 0.04, 0.18]} speed={-1.2} color={CYAN} />

        <pointLight color={CYAN} intensity={0.65} distance={4.5} decay={2} position={[0, 0, 0]} />
      </group>
    </group>
  );
}
