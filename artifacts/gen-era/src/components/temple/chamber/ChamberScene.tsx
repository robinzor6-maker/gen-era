import { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function getColor(tags: string[], name: string): string {
  const text = [...tags, name].join(' ').toLowerCase();
  if (/fire|osyron|flame|inferno|blaze/.test(text)) return '#ff6b1a';
  return '#d4a853';
}

function ArtifactGem({ accent }: { accent: string }) {
  const gemRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  const outerMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: accent,
        metalness: 0.05,
        roughness: 0.04,
        emissive: accent,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.78,
      }),
    [accent]
  );

  const innerMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: accent,
        metalness: 0.0,
        roughness: 0.0,
        emissive: accent,
        emissiveIntensity: 1.8,
        transparent: true,
        opacity: 0.5,
      }),
    [accent]
  );

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
  });

  return (
    <group>
      {/* Outer artifact gem */}
      <mesh ref={gemRef} castShadow>
        <octahedronGeometry args={[1.1, 0]} />
        <primitive object={outerMat} attach="material" />
      </mesh>
      {/* Inner glowing core */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.55, 0]} />
        <primitive object={innerMat} attach="material" />
      </mesh>
      {/* Core glow light */}
      <pointLight color={accent} intensity={4.5} distance={10} decay={2} />
    </group>
  );
}

function OrbitRing({ radius, rotX, rotZ, speed, accent }: {
  radius: number; rotX: number; rotZ: number; speed: number; accent: string;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.35,
      }),
    [accent]
  );

  const dotMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.9,
      }),
    [accent]
  );

  useFrame(() => {
    if (ringRef.current) ringRef.current.rotation.y += speed;
    if (ringRef2.current) ringRef2.current.rotation.y += speed * 0.7;
  });

  // Create orbit dot positions
  const dotCount = 8;
  const dots = Array.from({ length: dotCount }, (_, i) => {
    const angle = (i / dotCount) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );
  });

  return (
    <group rotation={[rotX, 0, rotZ]}>
      <mesh ref={ringRef} material={mat}>
        <torusGeometry args={[radius, 0.025, 8, 64]} />
      </mesh>
      {/* Decorative dots on ring */}
      <group ref={ringRef2}>
        {dots.map((pos, i) => (
          <mesh key={i} position={pos} material={dotMat}>
            <sphereGeometry args={[0.05, 6, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GlyphParticles({ accent }: { accent: string }) {
  const count = 60;
  const ref = useRef<THREE.Points>(null);

  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 2.5 + Math.random() * 3.5;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, phases };
  }, []);

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: accent,
        size: 0.06,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
      }),
    [accent]
  );

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(t * 0.4 + phases[i]) * 0.003;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y += 0.001;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return <points ref={ref} geometry={geometry} material={mat} />;
}

function ChamberEnvironment({ accent }: { accent: string }) {
  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#06040e',
        metalness: 0.92,
        roughness: 0.1,
      }),
    []
  );

  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#08060f',
        metalness: 0.5,
        roughness: 0.7,
        emissive: accent,
        emissiveIntensity: 0.025,
      }),
    [accent]
  );

  const glyphMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.07,
      }),
    [accent]
  );

  const rings = [2.5, 4.5, 7];

  return (
    <group>
      {/* Reflective floor */}
      <mesh material={floorMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
      </mesh>

      {/* Chamber walls */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((rot, i) => (
        <mesh key={i} material={wallMat} position={[0, 0, 0]} rotation={[0, rot, 0]}>
          <mesh position={[0, 0, -12]}>
            <planeGeometry args={[24, 14]} />
            <primitive object={wallMat} attach="material" />
          </mesh>
        </mesh>
      ))}

      {/* Ground glyph rings */}
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.98, 0]}>
        {rings.map((r, i) => (
          <mesh key={i} material={glyphMat}>
            <ringGeometry args={[r - 0.03, r + 0.03, 64]} />
          </mesh>
        ))}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh key={`line-${i}`} material={glyphMat} rotation={[0, 0, angle]}>
              <planeGeometry args={[0.025, 7]} />
            </mesh>
          );
        })}
      </group>

      {/* Ambient lights */}
      <ambientLight color="#0d0520" intensity={0.6} />
      <directionalLight color={accent} intensity={0.5} position={[5, 10, 5]} castShadow />
      <pointLight color="#1a0050" intensity={1.5} position={[0, -1, 0]} distance={15} decay={2} />
      <pointLight color={accent} intensity={0.6} position={[-8, 4, 0]} distance={12} decay={2} />
      <pointLight color={accent} intensity={0.6} position={[8, 4, 0]} distance={12} decay={2} />
    </group>
  );
}

interface ChamberSceneProps {
  productTags: string[];
  productName: string;
}

export default function ChamberScene({ productTags, productName }: ChamberSceneProps) {
  const accent = getColor(productTags, productName);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 1, 7], fov: 55, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ background: '#000008' }}
    >
      <fog attach="fog" args={['#000008', 12, 28]} />

      <ChamberEnvironment accent={accent} />

      <ArtifactGem accent={accent} />

      <OrbitRing radius={1.9} rotX={0.3} rotZ={0} speed={0.006} accent={accent} />
      <OrbitRing radius={2.8} rotX={-0.7} rotZ={0.4} speed={-0.004} accent={accent} />
      <OrbitRing radius={3.6} rotX={1.1} rotZ={-0.3} speed={0.003} accent={accent} />

      <GlyphParticles accent={accent} />

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
