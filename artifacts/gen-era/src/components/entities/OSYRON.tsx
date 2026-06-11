import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ORANGE = '#ff6b1a';
const RED    = '#ff2200';
const YELLOW = '#ffaa33';

function FlameShard({
  position, speed, size,
}: {
  position: [number, number, number];
  speed: number;
  size: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: ORANGE, transparent: true, opacity: 0.72,
  }), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x += speed * 0.011;
    ref.current.rotation.z += speed * 0.007;
    ref.current.position.y = position[1] + Math.sin(t * 1.25 + position[0]) * 0.14;
    const pulse = 0.82 + Math.sin(t * 2.6 + position[2]) * 0.2;
    ref.current.scale.setScalar(pulse * size);
  });

  return (
    <group ref={ref} position={position}>
      <mesh material={mat}>
        <tetrahedronGeometry args={[0.14, 0]} />
      </mesh>
    </group>
  );
}

function FlameParticles({ opacity }: { opacity: number }) {
  const ref   = useRef<THREE.Points>(null);
  const count = 55;

  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases    = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r     = 0.4 + Math.random() * 0.8;
      positions[i * 3]     = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.3) * 1.8;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      phases[i]             = Math.random() * Math.PI * 2;
    }
    return { positions, phases };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: ORANGE, size: 0.065, transparent: true, opacity: 0.8 * opacity, sizeAttenuation: true,
  }), [opacity]);

  useFrame((state) => {
    if (!ref.current) return;
    const t   = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += 0.006 + Math.sin(t + phases[i]) * 0.003;
      if (pos[i * 3 + 1] > 1.8) pos[i * 3 + 1] = -0.4;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y += 0.004;
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

interface OSYRONProps {
  visible?: boolean;
  opacity?: number;
}

export default function OSYRON({ visible = true, opacity = 1 }: OSYRONProps) {
  const bodyRef      = useRef<THREE.Group>(null);
  const coreRef      = useRef<THREE.Mesh>(null);
  const shoulderLRef = useRef<THREE.Mesh>(null);
  const shoulderRRef = useRef<THREE.Mesh>(null);

  const bodyMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a0500',
    metalness: 0.2,
    roughness: 0.6,
    emissive: ORANGE,
    emissiveIntensity: 0.55,
    transparent: true,
    opacity: 0.88 * opacity,
  }), [opacity]);

  const coreMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: YELLOW, transparent: true, opacity: 0.85 * opacity,
  }), [opacity]);

  const veinMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: ORANGE, transparent: true, opacity: 0.75 * opacity,
  }), [opacity]);

  const spikeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2a0800',
    metalness: 0.9,
    roughness: 0.1,
    emissive: RED,
    emissiveIntensity: 0.85,
    transparent: true,
    opacity: opacity,
  }), [opacity]);

  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#ffffff', transparent: true, opacity: 0.95 * opacity,
  }), [opacity]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(t * 0.85) * 0.14 + Math.sin(t * 2.1) * 0.03;
      bodyRef.current.rotation.y = Math.sin(t * 0.55) * 0.12;
    }
    if (coreRef.current) {
      const scale = 1 + Math.sin(t * 3.5) * 0.13;
      coreRef.current.scale.setScalar(scale);
    }
    if (shoulderLRef.current) shoulderLRef.current.rotation.z = -0.3 + Math.sin(t * 1.4) * 0.14;
    if (shoulderRRef.current) shoulderRRef.current.rotation.z =  0.3 + Math.sin(t * 1.4 + 0.5) * 0.14;
  });

  if (!visible) return null;

  return (
    <group>
      <group ref={bodyRef} position={[-2.4, 0.55, 0]}>
        <FlameParticles opacity={opacity} />

        {/* Torso */}
        <mesh material={bodyMat} position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.3, 0.42, 1.0, 8]} />
        </mesh>

        {/* Chest core pulse */}
        <mesh ref={coreRef} material={coreMat} position={[0, 0.62, 0.22]}>
          <sphereGeometry args={[0.14, 8, 8]} />
        </mesh>

        {/* Head */}
        <mesh material={bodyMat} position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.3, 10, 10]} />
        </mesh>

        {/* Eyes — white-hot */}
        <mesh material={eyeMat} position={[-0.11, 1.15, 0.25]}>
          <sphereGeometry args={[0.048, 6, 6]} />
        </mesh>
        <mesh material={eyeMat} position={[0.11, 1.15, 0.25]}>
          <sphereGeometry args={[0.048, 6, 6]} />
        </mesh>
        <pointLight color="#ffffff" intensity={2.5} distance={2.5} decay={2} position={[0, 1.15, 0.25]} />

        {/* Shoulder spikes */}
        <mesh ref={shoulderLRef} material={spikeMat} position={[-0.48, 0.88, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.1, 0.45, 5]} />
        </mesh>
        <mesh material={spikeMat} position={[-0.62, 0.72, 0]} rotation={[0, 0, -0.55]}>
          <coneGeometry args={[0.07, 0.35, 5]} />
        </mesh>
        <mesh ref={shoulderRRef} material={spikeMat} position={[0.48, 0.88, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.1, 0.45, 5]} />
        </mesh>
        <mesh material={spikeMat} position={[0.62, 0.72, 0]} rotation={[0, 0, 0.55]}>
          <coneGeometry args={[0.07, 0.35, 5]} />
        </mesh>

        {/* Emissive veins */}
        <mesh material={veinMat} position={[0, 0.65, 0.3]}>
          <boxGeometry args={[0.018, 0.55, 0.016]} />
        </mesh>
        <mesh material={veinMat} position={[-0.15, 0.6, 0.28]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.015, 0.38, 0.015]} />
        </mesh>
        <mesh material={veinMat} position={[0.15, 0.6, 0.28]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.015, 0.38, 0.015]} />
        </mesh>

        {/* Flame shards */}
        <FlameShard position={[-0.75, 0.8, 0.2]}  speed={1.2}  size={1.0} />
        <FlameShard position={[0.8, 0.65, -0.1]}  speed={-0.9} size={1.1} />
        <FlameShard position={[0.15, 1.65, 0]}    speed={0.7}  size={0.8} />
        <FlameShard position={[-0.25, -0.1, 0.55]} speed={-1.4} size={0.9} />
        <FlameShard position={[0.5, 0.3, -0.45]}  speed={1.0}  size={0.7} />
        <FlameShard position={[-0.6, 1.3, -0.3]}  speed={-0.6} size={0.85} />

        <pointLight color={ORANGE} intensity={2.2} distance={5}   decay={2} position={[0, 0.5, 0]} />
        <pointLight color={RED}    intensity={0.9} distance={3}   decay={2} position={[0, -0.5, 0]} />
      </group>
    </group>
  );
}
