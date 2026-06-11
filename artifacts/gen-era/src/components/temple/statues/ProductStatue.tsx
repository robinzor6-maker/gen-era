import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Product } from '@/lib/types';
import { getRarity, getStatueType, RARITY_COLORS } from '@/lib/lore/generateLore';
import type { StatueType, Rarity } from '@/lib/lore/generateLore';

// ── Material factory ─────────────────────────────────────────────────────────

function useBodyMat(color: string, accent: string, hovered: boolean) {
  return useMemo(() => new THREE.MeshStandardMaterial({
    color,
    metalness: 0.72,
    roughness: 0.32,
    emissive: accent,
    emissiveIntensity: hovered ? 0.55 : 0.12,
  }), [color, accent, hovered]);
}

function useGlowMat(accent: string, opacity = 0.85) {
  return useMemo(() => new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity,
  }), [accent, opacity]);
}

function useLineMat(accent: string) {
  return useMemo(() => new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.45,
  }), [accent]);
}

// ── Emissive hieroglyph lines ─────────────────────────────────────────────────

function HieroglyphLines({ accent, height = 0.9, width = 0.55 }: { accent: string; height?: number; width?: number }) {
  const mat = useLineMat(accent);
  const lineY = [-height * 0.28, 0, height * 0.28];
  return (
    <>
      {lineY.map((y, i) => (
        <mesh key={i} position={[0, y, width / 2 + 0.002]} material={mat}>
          <planeGeometry args={[width * 0.85, 0.018]} />
        </mesh>
      ))}
    </>
  );
}

// ── Statue: ANKH (T-Shirt) ───────────────────────────────────────────────────

function AnkhStatue({ accent, bodyMat, glowMat }: { accent: string; bodyMat: THREE.Material; glowMat: THREE.Material }) {
  const ref = useRef<THREE.Group>(null);
  const stemMat = useBodyMat('#0a0a12', accent, false);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y += 0.006;
    ref.current.position.y = Math.sin(t * 0.7) * 0.1;
  });

  return (
    <group ref={ref}>
      {/* Loop at top */}
      <mesh material={glowMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.06, 12, 40]} />
      </mesh>
      {/* Cross bar */}
      <mesh material={stemMat} position={[0, -0.22, 0]}>
        <boxGeometry args={[0.78, 0.1, 0.1]} />
      </mesh>
      {/* Stem */}
      <mesh material={stemMat} position={[0, -0.62, 0]}>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
      </mesh>
      <HieroglyphLines accent={accent} height={0.6} width={0.08} />
    </group>
  );
}

// ── Statue: CROWN (Hoodie) ───────────────────────────────────────────────────

function CrownStatue({ accent, bodyMat, glowMat }: { accent: string; bodyMat: THREE.Material; glowMat: THREE.Material }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y += 0.005;
    ref.current.position.y = Math.sin(t * 0.65) * 0.12;
  });

  return (
    <group ref={ref}>
      {/* Crown base */}
      <mesh material={bodyMat} position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.42, 0.5, 0.22, 8]} />
      </mesh>
      {/* Three crown spires */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} material={bodyMat} position={[x, 0.1 + (i === 1 ? 0.18 : 0), 0]}>
          <cylinderGeometry args={[0.045, 0.09, i === 1 ? 0.72 : 0.52, 6]} />
        </mesh>
      ))}
      {/* Spire tops */}
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} material={glowMat} position={[x, 0.5 + (i === 1 ? 0.18 : 0), 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
        </mesh>
      ))}
      {/* Band ring */}
      <mesh material={glowMat} position={[0, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.025, 8, 40]} />
      </mesh>
      <HieroglyphLines accent={accent} height={0.18} width={0.42} />
    </group>
  );
}

// ── Statue: OBELISK PAIR (Pants) ─────────────────────────────────────────────

function ObeliskStatue({ accent, bodyMat, glowMat }: { accent: string; bodyMat: THREE.Material; glowMat: THREE.Material }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y += 0.004;
    ref.current.position.y = Math.sin(t * 0.55) * 0.1;
  });

  return (
    <group ref={ref}>
      {[-0.22, 0.22].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          {/* Column shaft */}
          <mesh material={bodyMat}>
            <cylinderGeometry args={[0.1, 0.14, 1.0, 6]} />
          </mesh>
          {/* Pyramid tip */}
          <mesh material={glowMat} position={[0, 0.6, 0]}>
            <coneGeometry args={[0.1, 0.24, 6]} />
          </mesh>
          {/* Base */}
          <mesh material={bodyMat} position={[0, -0.58, 0]}>
            <boxGeometry args={[0.28, 0.12, 0.28]} />
          </mesh>
          {/* Hieroglyph lines on shaft */}
          {[-0.28, 0, 0.28].map((y, j) => (
            <mesh key={j} material={glowMat} position={[0.101, y, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[0.2, 0.015]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Connecting base */}
      <mesh material={bodyMat} position={[0, -0.58, 0]}>
        <boxGeometry args={[0.66, 0.07, 0.28]} />
      </mesh>
    </group>
  );
}

// ── Statue: KHEPRESH (Cap/Hat) ───────────────────────────────────────────────

function KhepreshStatue({ accent, bodyMat, glowMat }: { accent: string; bodyMat: THREE.Material; glowMat: THREE.Material }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y += 0.007;
    ref.current.position.y = Math.sin(t * 0.8) * 0.11;
  });

  return (
    <group ref={ref}>
      {/* Dome */}
      <mesh material={bodyMat} position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
      </mesh>
      {/* Crown band */}
      <mesh material={glowMat} position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.41, 0.035, 8, 40]} />
      </mesh>
      {/* Brim */}
      <mesh material={bodyMat} position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.52, 0.5, 0.065, 16]} />
      </mesh>
      {/* Uraeus (serpent on front) */}
      <mesh material={glowMat} position={[0.38, 0.28, 0]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.025, 0.035, 0.22, 6]} />
      </mesh>
      <mesh material={glowMat} position={[0.46, 0.38, 0]}>
        <sphereGeometry args={[0.035, 8, 8]} />
      </mesh>
      {/* Button on top */}
      <mesh material={glowMat} position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
      </mesh>
    </group>
  );
}

// ── Statue: SCARAB (Pendant/Necklace) ────────────────────────────────────────

function ScarabStatue({ accent, bodyMat, glowMat }: { accent: string; bodyMat: THREE.Material; glowMat: THREE.Material }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y += 0.008;
    ref.current.rotation.z = Math.sin(t * 0.4) * 0.08;
    ref.current.position.y = Math.sin(t * 0.75) * 0.12;
  });

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh material={bodyMat} scale={[1.1, 0.65, 0.7]}>
        <sphereGeometry args={[0.35, 12, 10]} />
      </mesh>
      {/* Head */}
      <mesh material={bodyMat} position={[0, 0.28, 0]} scale={[0.8, 0.7, 0.7]}>
        <sphereGeometry args={[0.2, 10, 8]} />
      </mesh>
      {/* Wings */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} material={glowMat} position={[side * 0.38, 0.05, 0]}
          rotation={[0, 0, side * 0.55]} scale={[1.2, 0.35, 0.12]}>
          <boxGeometry args={[0.5, 0.3, 0.1]} />
        </mesh>
      ))}
      {/* Eye of Horus on body */}
      <mesh material={glowMat} position={[0, 0.05, 0.26]}>
        <ringGeometry args={[0.1, 0.13, 8]} />
      </mesh>
      {/* Legs */}
      {[-3, -1, 1, 3].map((x, i) => (
        <mesh key={i} material={bodyMat}
          position={[x * 0.1, -0.3, (i < 2 ? -1 : 1) * 0.15]}
          rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.18, 5]} />
        </mesh>
      ))}
    </group>
  );
}

// ── Statue: CARTOUCHE (Bracelet) ─────────────────────────────────────────────

function CartoucheStatue({ accent, bodyMat, glowMat }: { accent: string; bodyMat: THREE.Material; glowMat: THREE.Material }) {
  const ringRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((s) => {
    if (!ringRef.current) return;
    const t = s.clock.elapsedTime;
    ringRef.current.rotation.x += 0.007;
    ringRef.current.rotation.z += 0.004;
    ringRef.current.position.y = Math.sin(t * 0.65) * 0.12;
    if (innerRef.current) innerRef.current.rotation.y -= 0.009;
  });

  const linkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#d4a853',
    metalness: 0.95,
    roughness: 0.08,
    emissive: accent,
    emissiveIntensity: 0.3,
  }), [accent]);

  const linkCount = 10;
  const links = useMemo(() => Array.from({ length: linkCount }, (_, i) => {
    const angle = (i / linkCount) * Math.PI * 2;
    return { x: Math.cos(angle) * 0.46, z: Math.sin(angle) * 0.46, rot: angle };
  }), []);

  return (
    <group ref={ringRef}>
      {/* Main bracelet band */}
      <mesh material={bodyMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.1, 12, 40]} />
      </mesh>
      {/* Decorative links */}
      {links.map((l, i) => (
        <mesh key={i} material={linkMat}
          position={[l.x, 0, l.z]}
          rotation={[Math.PI / 2, l.rot, 0]}>
          <boxGeometry args={[0.12, 0.05, 0.05]} />
        </mesh>
      ))}
      {/* Inner glowing core ring */}
      <mesh ref={innerRef} material={glowMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.025, 8, 32]} />
      </mesh>
    </group>
  );
}

// ── Statue: OUROBOROS (Ring) ─────────────────────────────────────────────────

function OuroborosStatue({ accent, bodyMat, glowMat }: { accent: string; bodyMat: THREE.Material; glowMat: THREE.Material }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y += 0.009;
    ref.current.rotation.z = Math.sin(t * 0.5) * 0.15;
    ref.current.position.y = Math.sin(t * 0.8) * 0.1;
  });

  return (
    <group ref={ref}>
      {/* Ring band */}
      <mesh material={bodyMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.11, 16, 64]} />
      </mesh>
      {/* Inner emissive ring */}
      <mesh material={glowMat} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.02, 8, 64]} />
      </mesh>
      {/* Gem on top */}
      <mesh material={glowMat} position={[0, 0.62, 0]}>
        <octahedronGeometry args={[0.14, 0]} />
      </mesh>
      {/* Serpent head */}
      <mesh material={bodyMat} position={[0.5, 0.07, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
      </mesh>
      {/* Eyes */}
      {[-1, 1].map((z, i) => (
        <mesh key={i} material={glowMat} position={[0.56, 0.1, z * 0.055]}>
          <sphereGeometry args={[0.022, 6, 6]} />
        </mesh>
      ))}
    </group>
  );
}

// ── Statue: PHARAOH BREASTPLATE (Jacket) ─────────────────────────────────────

function BreastplateStatue({ accent, bodyMat, glowMat }: { accent: string; bodyMat: THREE.Material; glowMat: THREE.Material }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y += 0.005;
    ref.current.position.y = Math.sin(t * 0.6) * 0.1;
  });

  return (
    <group ref={ref}>
      {/* Main plate */}
      <mesh material={bodyMat} scale={[1.1, 1.2, 0.28]}>
        <boxGeometry args={[0.72, 0.9, 1]} />
      </mesh>
      {/* Shoulder guards */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} material={bodyMat} position={[side * 0.52, 0.3, 0]} rotation={[0, 0, side * 0.3]}>
          <boxGeometry args={[0.22, 0.35, 0.26]} />
        </mesh>
      ))}
      {/* Center sun disc */}
      <mesh material={glowMat} position={[0, 0.12, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.035, 16]} />
      </mesh>
      {/* Collar piece */}
      <mesh material={glowMat} position={[0, 0.52, 0.06]}>
        <cylinderGeometry args={[0.38, 0.34, 0.075, 16]} />
      </mesh>
      <HieroglyphLines accent={accent} height={0.7} width={0.65} />
    </group>
  );
}

// ── Rarity aura component ────────────────────────────────────────────────────

function RarityAura({ rarity, accent }: { rarity: Rarity; accent: string }) {
  const auraRef = useRef<THREE.Mesh>(null);

  const auraMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: rarity === 'legendary' ? 0.18 : rarity === 'epic' ? 0.12 : 0.07,
    side: THREE.FrontSide,
  }), [accent, rarity]);

  useFrame((s) => {
    if (!auraRef.current) return;
    const pulse = 1 + Math.sin(s.clock.elapsedTime * 1.5) * 0.06;
    auraRef.current.scale.setScalar(pulse);
    (auraRef.current.material as THREE.MeshBasicMaterial).opacity =
      (rarity === 'legendary' ? 0.18 : rarity === 'epic' ? 0.12 : 0.07) *
      (0.8 + Math.sin(s.clock.elapsedTime * 1.5) * 0.2);
  });

  const ringCount = rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : 1;

  return (
    <>
      {Array.from({ length: ringCount }, (_, i) => (
        <mesh key={i} ref={i === 0 ? auraRef : undefined}
          material={auraMat} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7 + i * 0.25, 0.72 + i * 0.25, 40]} />
        </mesh>
      ))}
    </>
  );
}

// ── Main ProductStatue ────────────────────────────────────────────────────────

interface ProductStatueProps {
  product: Product;
  hovered: boolean;
  accent: string;
}

export default function ProductStatue({ product, hovered, accent }: ProductStatueProps) {
  const rarity    = getRarity(product);
  const statueType = getStatueType(product);
  const rarityColor = RARITY_COLORS[rarity];

  const bodyMat = useBodyMat('#0a0814', accent, hovered);
  const glowMat = useGlowMat(rarityColor, hovered ? 0.95 : 0.75);

  const glowLight = useRef<THREE.PointLight>(null);
  const aurasRef  = useRef<THREE.Group>(null);

  useFrame((s) => {
    if (glowLight.current) {
      const base = rarity === 'legendary' ? 3.2 : rarity === 'epic' ? 2.2 : 1.4;
      glowLight.current.intensity = (hovered ? base * 1.6 : base) + Math.sin(s.clock.elapsedTime * 1.4) * 0.4;
    }
    if (aurasRef.current) {
      aurasRef.current.rotation.y += 0.008;
    }
  });

  const props = { accent, bodyMat, glowMat };

  return (
    <group>
      {/* The statue shape */}
      {statueType === 'tshirt'   && <AnkhStatue        {...props} />}
      {statueType === 'hoodie'   && <CrownStatue        {...props} />}
      {statueType === 'jacket'   && <BreastplateStatue  {...props} />}
      {statueType === 'pants'    && <ObeliskStatue       {...props} />}
      {statueType === 'cap'      && <KhepreshStatue      {...props} />}
      {statueType === 'pendant'  && <ScarabStatue        {...props} />}
      {statueType === 'bracelet' && <CartoucheStatue     {...props} />}
      {statueType === 'ring'     && <OuroborosStatue     {...props} />}

      {/* Rarity aura rings on ground plane */}
      <group ref={aurasRef} position={[0, -1.55, 0]}>
        <RarityAura rarity={rarity} accent={rarityColor} />
      </group>

      {/* Glow light */}
      <pointLight
        ref={glowLight}
        color={rarityColor}
        intensity={rarity === 'legendary' ? 3.2 : rarity === 'epic' ? 2.2 : 1.4}
        distance={6}
        decay={2}
      />
    </group>
  );
}
