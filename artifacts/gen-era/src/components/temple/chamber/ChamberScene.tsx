import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { District, Rarity } from '@/lib/lore/generateLore';
import { DISTRICT_COLORS, RARITY_COLORS } from '@/lib/lore/generateLore';
import EntityManager from '@/components/entities/EntityManager';

function ArtifactGem({ accent, rarityColor, rarity }: { accent: string; rarityColor: string; rarity: Rarity }) {
  const gemRef   = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const coreRef  = useRef<THREE.Mesh>(null);

  const outerMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: accent,
    metalness: 0.05,
    roughness: 0.04,
    emissive: accent,
    emissiveIntensity: 0.65,
    transparent: true,
    opacity: 0.78,
  }), [accent]);

  const innerMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: rarityColor,
    metalness: 0.0,
    roughness: 0.0,
    emissive: rarityColor,
    emissiveIntensity: rarity === 'legendary' ? 2.8 : 1.8,
    transparent: true,
    opacity: 0.55,
  }), [rarityColor, rarity]);

  const coreMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: rarityColor,
    transparent: true,
    opacity: rarity === 'legendary' ? 0.7 : 0.4,
  }), [rarityColor, rarity]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (gemRef.current) {
      gemRef.current.rotation.y += 0.008;
      gemRef.current.rotation.x = Math.sin(t * 0.35) * 0.12;
      gemRef.current.position.y = Math.sin(t * 0.6) * 0.18;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= 0.012;
      innerRef.current.rotation.z += 0.005;
      innerRef.current.position.y = Math.sin(t * 0.6) * 0.18;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.02;
      coreRef.current.position.y = Math.sin(t * 0.6) * 0.18;
      const scale = 1 + Math.sin(t * 1.8) * 0.08;
      coreRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      <mesh ref={gemRef} castShadow>
        <octahedronGeometry args={[1.1, 0]} />
        <primitive object={outerMat} attach="material" />
      </mesh>
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.55, 0]} />
        <primitive object={innerMat} attach="material" />
      </mesh>
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.22, 0]} />
        <primitive object={coreMat} attach="material" />
      </mesh>
      <pointLight color={accent}      intensity={4.5} distance={10} decay={2} />
      <pointLight color={rarityColor} intensity={rarity === 'legendary' ? 3.5 : 2.0} distance={8} decay={2} />
    </group>
  );
}

function OrbitRing({ radius, rotX, rotZ, speed, accent, rarityColor }: {
  radius: number; rotX: number; rotZ: number; speed: number; accent: string; rarityColor: string;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const dotsRef = useRef<THREE.Group>(null);

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: accent, transparent: true, opacity: 0.35,
  }), [accent]);

  const dotMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: rarityColor, transparent: true, opacity: 0.9,
  }), [rarityColor]);

  useFrame(() => {
    if (ringRef.current) ringRef.current.rotation.y += speed;
    if (dotsRef.current) dotsRef.current.rotation.y += speed * 0.7;
  });

  const dots = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }), [radius]);

  return (
    <group rotation={[rotX, 0, rotZ]}>
      <mesh ref={ringRef} material={mat}>
        <torusGeometry args={[radius, 0.025, 8, 64]} />
      </mesh>
      <group ref={dotsRef}>
        {dots.map((pos, i) => (
          <mesh key={i} position={pos} material={dotMat}>
            <sphereGeometry args={[0.05, 6, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GlyphParticles({ accent, rarityColor, rarity }: { accent: string; rarityColor: string; rarity: Rarity }) {
  const count = rarity === 'legendary' ? 90 : 60;
  const ref   = useRef<THREE.Points>(null);

  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases    = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r     = 2.5 + Math.random() * 3.5;
      positions[i * 3]     = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      phases[i]             = Math.random() * Math.PI * 2;
    }
    return { positions, phases };
  }, [count]);

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: accent, size: rarity === 'legendary' ? 0.08 : 0.06,
    transparent: true, opacity: 0.6, sizeAttenuation: true,
  }), [accent, rarity]);

  const rarityMat = useMemo(() => new THREE.PointsMaterial({
    color: rarityColor, size: 0.09, transparent: true, opacity: 0.45, sizeAttenuation: true,
  }), [rarityColor]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const rarityPositions = useMemo(() => {
    if (rarity === 'rare') return null;
    const n = rarity === 'legendary' ? 30 : 16;
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r     = 1.2 + Math.random() * 1.8;
      p[i * 3]     = Math.cos(angle) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      p[i * 3 + 2] = Math.sin(angle) * r;
    }
    return p;
  }, [rarity]);

  const rarityGeo = useMemo(() => {
    if (!rarityPositions) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(rarityPositions, 3));
    return g;
  }, [rarityPositions]);

  useFrame((state) => {
    if (!ref.current) return;
    const t   = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(t * 0.4 + phases[i]) * 0.003;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y += 0.001;
  });

  return (
    <>
      <points ref={ref} geometry={geo} material={mat} />
      {rarityGeo && <points geometry={rarityGeo} material={rarityMat} />}
    </>
  );
}

function ChamberEnvironment({ accent, rarityColor, rarity }: { accent: string; rarityColor: string; rarity: Rarity }) {
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#06040e', metalness: 0.92, roughness: 0.1,
  }), []);

  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#08060f', metalness: 0.5, roughness: 0.7,
    emissive: accent, emissiveIntensity: 0.025,
  }), [accent]);

  const glyphMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: accent, transparent: true, opacity: 0.07,
  }), [accent]);

  const rarityRingMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: rarityColor, transparent: true, opacity: rarity === 'legendary' ? 0.18 : 0.1,
  }), [rarityColor, rarity]);

  void wallMat;

  const rings = [2.5, 4.5, 7];

  return (
    <group>
      <mesh material={floorMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
      </mesh>

      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.98, 0]}>
        {rings.map((r, i) => (
          <mesh key={i} material={glyphMat}>
            <ringGeometry args={[r - 0.03, r + 0.03, 64]} />
          </mesh>
        ))}
        {rarity !== 'rare' && (
          <mesh material={rarityRingMat}>
            <ringGeometry args={[1.8, 1.84, 48]} />
          </mesh>
        )}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={`line-${i}`} material={glyphMat} rotation={[0, 0, angle]}>
              <planeGeometry args={[0.025, 7]} />
            </mesh>
          );
        })}
      </group>

      <ambientLight color="#0d0520" intensity={0.6} />
      <directionalLight color={accent} intensity={0.5} position={[5, 10, 5]} castShadow />
      <pointLight color="#1a0050" intensity={1.5} position={[0, -1, 0]} distance={15} decay={2} />
      <pointLight color={accent}      intensity={0.65} position={[-8, 4, 0]}  distance={12} decay={2} />
      <pointLight color={accent}      intensity={0.65} position={[8, 4, 0]}   distance={12} decay={2} />
      {rarity !== 'rare' && (
        <pointLight color={rarityColor} intensity={0.8} position={[0, 6, 0]} distance={14} decay={2} />
      )}
    </group>
  );
}

interface ChamberSceneProps {
  productTags: string[];
  productName: string;
  district?: District;
  rarity?: Rarity;
  entityVisible?: boolean;
  entityOpacity?: number;
}

export default function ChamberScene({
  productTags: _productTags,
  productName: _productName,
  district    = 'gencore',
  rarity      = 'rare',
  entityVisible = false,
  entityOpacity = 1,
}: ChamberSceneProps) {
  const accent      = DISTRICT_COLORS[district].primary;
  const rarityColor = RARITY_COLORS[rarity];

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 1, 7], fov: 55, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ background: '#000008' }}
    >
      <fog attach="fog" args={['#000008', 12, 28]} />

      <ChamberEnvironment accent={accent} rarityColor={rarityColor} rarity={rarity} />

      <ArtifactGem accent={accent} rarityColor={rarityColor} rarity={rarity} />

      <OrbitRing radius={1.9} rotX={0.3}  rotZ={0}    speed={0.006}  accent={accent} rarityColor={rarityColor} />
      <OrbitRing radius={2.8} rotX={-0.7} rotZ={0.4}  speed={-0.004} accent={accent} rarityColor={rarityColor} />
      <OrbitRing radius={3.6} rotX={1.1}  rotZ={-0.3} speed={0.003}  accent={accent} rarityColor={rarityColor} />
      {rarity !== 'rare' && (
        <OrbitRing radius={1.2} rotX={0.8} rotZ={0.6} speed={-0.01} accent={rarityColor} rarityColor={rarityColor} />
      )}

      <GlyphParticles accent={accent} rarityColor={rarityColor} rarity={rarity} />

      {/* Entity — ANKHRON or OSYRON */}
      <EntityManager district={district} visible={entityVisible} opacity={entityOpacity} />

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={4}
        maxDistance={12}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 1.8}
        rotateSpeed={0.5}
        target={[0, 0.2, 0]}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}
