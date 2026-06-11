import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Product } from '@/lib/types';
import { useTempleStore } from '@/stores/templeStore';

function getColor(product: Product): string {
  const text = [
    ...(product.tags ?? []),
    product.name,
    product.collection ?? '',
  ]
    .join(' ')
    .toLowerCase();
  if (/fire|osyron|flame|inferno|blaze/.test(text)) return '#ff6b1a';
  return '#d4a853';
}

function getLore(product: Product): string {
  const text = [...(product.tags ?? []), product.name].join(' ').toLowerCase();
  if (/fire|osyron|flame/.test(text)) {
    return 'FORGED WITHIN THE FLAME PROTOCOL OF OSYRON';
  }
  return 'THIS ARTIFACT BELONGS TO THE ARCHIVE OF ANKHRON';
}

interface Props {
  product: Product;
  position: [number, number, number];
  index: number;
}

export default function ProductPedestal({ product, position, index }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const gemRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  const { openProduct } = useTempleStore();

  const accent = getColor(product);
  const lore = getLore(product);

  const pedestalMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#14100a',
        metalness: 0.75,
        roughness: 0.45,
        emissive: accent,
        emissiveIntensity: 0.04,
      }),
    [accent]
  );

  const slabMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c8982a',
        metalness: 0.92,
        roughness: 0.12,
        emissive: accent,
        emissiveIntensity: hovered ? 0.5 : 0.18,
      }),
    [accent, hovered]
  );

  const gemMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: accent,
        metalness: 0.1,
        roughness: 0.05,
        emissive: accent,
        emissiveIntensity: hovered ? 1.4 : 0.65,
        transparent: true,
        opacity: 0.82,
        transmission: 0.15,
      }),
    [accent, hovered]
  );

  const orbitMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: accent,
        transparent: true,
        opacity: hovered ? 0.55 : 0.22,
        wireframe: false,
      }),
    [accent, hovered]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime + index * 1.3;

    if (gemRef.current) {
      gemRef.current.rotation.y += hovered ? 0.012 : 0.005;
      gemRef.current.rotation.x = Math.sin(t * 0.45) * 0.1;
      gemRef.current.position.y = 1.62 + Math.sin(t * 0.72) * 0.14;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.008;
    }

    if (glowRef.current) {
      glowRef.current.intensity =
        (hovered ? 2.5 : 0.9) + Math.sin(t * 1.4) * 0.35;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
      onClick={(e) => {
        e.stopPropagation();
        openProduct(product, position);
      }}
    >
      {/* Pedestal base */}
      <mesh material={pedestalMat} position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.82, 0.9, 8]} />
      </mesh>

      {/* Stepped middle */}
      <mesh material={pedestalMat} position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 0.1, 8]} />
      </mesh>

      {/* Gold top slab */}
      <mesh material={slabMat} position={[0, 1.06, 0]}>
        <boxGeometry args={[1.0, 0.1, 1.0]} />
      </mesh>

      {/* Glyph ring on slab */}
      <mesh material={orbitMat} position={[0, 1.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.36, 0.42, 32]} />
      </mesh>

      {/* Floating artifact gem */}
      <mesh ref={gemRef} position={[0, 1.62, 0]} castShadow>
        <octahedronGeometry args={[0.52, 0]} />
        <primitive object={gemMat} attach="material" />
      </mesh>

      {/* Orbit ring around gem */}
      <mesh ref={ringRef} position={[0, 1.62, 0]} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[0.72, 0.018, 8, 36]} />
        <primitive object={orbitMat} attach="material" />
      </mesh>

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        color={accent}
        intensity={0.9}
        distance={5}
        decay={2}
        position={[0, 1.6, 0]}
      />

      {/* Hover info label */}
      {hovered && (
        <Html
          position={[0, 3.4, 0]}
          center
          distanceFactor={12}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[100, 200]}
        >
          <div
            style={{
              background: 'rgba(0,0,5,0.94)',
              border: `1px solid ${accent}55`,
              padding: '10px 16px',
              minWidth: 190,
              maxWidth: 220,
              textAlign: 'center',
              boxShadow: `0 0 22px ${accent}44, inset 0 0 12px rgba(0,0,0,0.5)`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                color: accent,
                marginBottom: 5,
                textShadow: `0 0 12px ${accent}`,
              }}
            >
              𓂀 {product.name.toUpperCase()}
            </div>
            {product.subtitle && (
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.45rem',
                  color: 'rgba(255,255,255,0.45)',
                  letterSpacing: '0.08em',
                  marginBottom: 6,
                }}
              >
                {product.subtitle}
              </div>
            )}
            <div
              style={{
                height: 1,
                background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`,
                margin: '6px 0',
              }}
            />
            <div
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.42rem',
                color: `${accent}88`,
                letterSpacing: '0.12em',
                marginBottom: 6,
              }}
            >
              {lore}
            </div>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.78rem',
                color: '#ffffff',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}
            >
              ${product.price}
            </div>
            <div
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.4rem',
                color: `${accent}66`,
                marginTop: 7,
                letterSpacing: '0.18em',
              }}
            >
              [ CLICK TO EXAMINE ]
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
