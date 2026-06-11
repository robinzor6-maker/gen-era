import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
  index: number;
}

export default function EmptyPedestal({ position, index }: Props) {
  const glowRef = useRef<THREE.PointLight>(null);

  const pedestalMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0d0a06',
        metalness: 0.6,
        roughness: 0.6,
        emissive: '#1a1208',
        emissiveIntensity: 0.1,
      }),
    []
  );

  const slabMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2a2010',
        metalness: 0.8,
        roughness: 0.3,
        emissive: '#d4a853',
        emissiveIntensity: 0.04,
      }),
    []
  );

  const glyphMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#d4a853',
        transparent: true,
        opacity: 0.08,
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime + index * 1.1;
    if (glowRef.current) {
      glowRef.current.intensity = 0.08 + Math.sin(t * 0.6) * 0.04;
    }
  });

  return (
    <group position={position}>
      <mesh material={pedestalMat} position={[0, 0.45, 0]} receiveShadow>
        <cylinderGeometry args={[0.65, 0.82, 0.9, 8]} />
      </mesh>
      <mesh material={pedestalMat} position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.1, 8]} />
      </mesh>
      <mesh material={slabMat} position={[0, 1.06, 0]}>
        <boxGeometry args={[1.0, 0.1, 1.0]} />
      </mesh>
      <mesh material={glyphMat} position={[0, 1.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.36, 32]} />
      </mesh>
      <pointLight
        ref={glowRef}
        color="#d4a853"
        intensity={0.08}
        distance={2.5}
        decay={2}
        position={[0, 1.2, 0]}
      />
    </group>
  );
}
