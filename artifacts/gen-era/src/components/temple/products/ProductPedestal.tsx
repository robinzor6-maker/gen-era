import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Product } from '@/lib/types';
import { useTempleStore } from '@/stores/templeStore';
import ProductStatue from '@/components/temple/statues/ProductStatue';
import { getDistrict, getRarity, RARITY_COLORS, DISTRICT_COLORS, generateShortLore } from '@/lib/lore/generateLore';
import { api } from '@/lib/api';

interface Props {
  product: Product;
  position: [number, number, number];
  index: number;
}

export default function ProductPedestal({ product, position, index }: Props) {
  const groupRef  = useRef<THREE.Group>(null);
  const ringRef   = useRef<THREE.Mesh>(null);
  const glowRef   = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);

  const { openProduct } = useTempleStore();

  const district    = getDistrict(product);
  const rarity      = getRarity(product);
  const rarityColor = RARITY_COLORS[rarity];
  const accent      = DISTRICT_COLORS[district].primary;

  const shortLore = generateShortLore(product);

  const pedestalMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0f0c18',
    metalness: 0.78,
    roughness: 0.38,
    emissive: accent,
    emissiveIntensity: hovered ? 0.18 : 0.05,
  }), [accent, hovered]);

  const slabMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1428',
    metalness: 0.95,
    roughness: 0.1,
    emissive: rarityColor,
    emissiveIntensity: hovered ? 0.65 : 0.2,
  }), [rarityColor, hovered]);

  const runeRingMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: rarityColor,
    transparent: true,
    opacity: hovered ? 0.7 : 0.28,
  }), [rarityColor, hovered]);

  const cornerMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: hovered ? 0.9 : 0.45,
  }), [accent, hovered]);

  useFrame((state) => {
    const t = state.clock.elapsedTime + index * 1.3;
    if (ringRef.current) ringRef.current.rotation.z += hovered ? 0.016 : 0.006;
    if (glowRef.current) {
      glowRef.current.intensity = (hovered ? 1.8 : 0.55) + Math.sin(t * 1.1) * 0.2;
      glowRef.current.color.set(rarityColor);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    openProduct(product, position);
    api.post('/analytics/view', {
      artifactId: product._id,
      artifactName: product.name,
      collection: product.collection ?? '',
      district,
    }).catch(() => {});
  };

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
      onClick={handleClick}
    >
      {/* ─── Pedestal base ──────────────────────────────────────────────────── */}
      <mesh material={pedestalMat} position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.8, 0.84, 8]} />
      </mesh>

      {/* Stepped ring */}
      <mesh material={pedestalMat} position={[0, 0.88, 0]}>
        <cylinderGeometry args={[0.52, 0.62, 0.08, 8]} />
      </mesh>

      {/* Gold-rim top slab */}
      <mesh material={slabMat} position={[0, 0.98, 0]}>
        <boxGeometry args={[1.05, 0.09, 1.05]} />
      </mesh>

      {/* Rune ring on slab */}
      <mesh ref={ringRef} material={runeRingMat} position={[0, 1.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.42, 40]} />
      </mesh>

      {/* Outer accent ring */}
      <mesh material={runeRingMat} position={[0, 1.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.48, 0.52, 40]} />
      </mesh>

      {/* Corner accent dots */}
      {([[-0.46, 0.46], [0.46, 0.46], [-0.46, -0.46], [0.46, -0.46]] as [number,number][]).map(([cx, cz], i) => (
        <mesh key={i} material={cornerMat} position={[cx, 1.035, cz]}>
          <sphereGeometry args={[0.035, 6, 6]} />
        </mesh>
      ))}

      {/* ─── Product statue (elevated above slab) ───────────────────────────── */}
      <group position={[0, 1.1, 0]}>
        <ProductStatue product={product} hovered={hovered} accent={accent} />
      </group>

      {/* Pedestal glow light */}
      <pointLight
        ref={glowRef}
        color={rarityColor}
        intensity={0.55}
        distance={5}
        decay={2}
        position={[0, 1.1, 0]}
      />

      {/* ─── Hover info panel ───────────────────────────────────────────────── */}
      {hovered && (
        <Html
          position={[0, 3.8, 0]}
          center
          distanceFactor={12}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[100, 200]}
        >
          <div style={{
            background: 'rgba(0,0,8,0.96)',
            border: `1px solid ${accent}44`,
            padding: '11px 18px',
            minWidth: 200,
            maxWidth: 240,
            textAlign: 'center',
            boxShadow: `0 0 28px ${accent}33, inset 0 0 14px rgba(0,0,0,0.6)`,
            backdropFilter: 'blur(12px)',
          }}>
            {/* Top accent line */}
            <div style={{
              height: 1,
              background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
              marginBottom: 9,
            }} />

            {/* Rarity badge */}
            {rarity !== 'rare' && (
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '0.34rem',
                letterSpacing: '0.3em',
                color: rarityColor,
                marginBottom: 6,
                textShadow: `0 0 8px ${rarityColor}`,
              }}>
                ◈ {rarity.toUpperCase()} ARTIFACT
              </div>
            )}

            {/* Name */}
            <div style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              color: accent,
              marginBottom: 4,
              textShadow: `0 0 14px ${accent}`,
              lineHeight: 1.3,
            }}>
              {product.name.toUpperCase()}
            </div>

            {product.subtitle && (
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.43rem',
                color: 'rgba(255,255,255,0.38)',
                letterSpacing: '0.08em',
                marginBottom: 7,
              }}>
                {product.subtitle}
              </div>
            )}

            {/* Divider */}
            <div style={{
              height: 1,
              background: `linear-gradient(90deg, transparent, ${accent}33, transparent)`,
              margin: '7px 0',
            }} />

            {/* Lore */}
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.38rem',
              color: `${accent}77`,
              letterSpacing: '0.1em',
              marginBottom: 7,
            }}>
              {shortLore}
            </div>

            {/* Price */}
            <div style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: '0.88rem',
              color: '#ffffff',
              letterSpacing: '0.08em',
              fontWeight: 600,
            }}>
              ${product.price}
            </div>

            {/* CTA hint */}
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '0.37rem',
              color: `${accent}55`,
              marginTop: 8,
              letterSpacing: '0.2em',
            }}>
              [ CLICK TO EXAMINE ]
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
