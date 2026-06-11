import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Product } from '@/lib/types';
import { getDistrict, DISTRICT_COLORS } from '@/lib/lore/generateLore';

// ── District gateway / portal arch ───────────────────────────────────────────

interface GatewayProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  label: string;
}

function DistrictGateway({ position, rotation = [0, 0, 0], color, label }: GatewayProps) {
  const glowRef = useRef<THREE.Mesh>(null);
  const archRef = useRef<THREE.Group>(null);

  const archMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#09080f',
    metalness: 0.85,
    roughness: 0.25,
    emissive: color,
    emissiveIntensity: 0.22,
  }), [color]);

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.55,
  }), [color]);

  const portalMat = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.07,
    side: THREE.DoubleSide,
  }), [color]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.05 + Math.abs(Math.sin(t * 0.8)) * 0.12;
    }
    if (archRef.current) {
      archRef.current.children.forEach((c: THREE.Object3D, i: number) => {
        if ((c as THREE.Mesh).isMesh) {
          const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (m && m.emissiveIntensity !== undefined) {
            m.emissiveIntensity = 0.18 + Math.sin(t * 0.9 + i) * 0.1;
          }
        }
      });
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <group ref={archRef}>
        {/* Left pillar */}
        <mesh material={archMat} position={[-1.2, 2, 0]} castShadow>
          <boxGeometry args={[0.2, 4, 0.2]} />
        </mesh>
        {/* Right pillar */}
        <mesh material={archMat} position={[1.2, 2, 0]} castShadow>
          <boxGeometry args={[0.2, 4, 0.2]} />
        </mesh>
        {/* Top lintel */}
        <mesh material={archMat} position={[0, 4.1, 0]}>
          <boxGeometry args={[2.8, 0.22, 0.22]} />
        </mesh>
        {/* Capstone */}
        <mesh material={archMat} position={[0, 4.38, 0]}>
          <coneGeometry args={[0.28, 0.38, 6]} />
        </mesh>

        {/* Glow lines on pillars */}
        {[-1.2, 1.2].map((x, i) => (
          <mesh key={i} material={glowMat} position={[x, 2, 0.101]}>
            <planeGeometry args={[0.08, 3.2]} />
          </mesh>
        ))}

        {/* Top glow line */}
        <mesh material={glowMat} position={[0, 4.1, 0.112]}>
          <planeGeometry args={[2.5, 0.06]} />
        </mesh>

        {/* Glyph orbs on pillar tops */}
        {[-1.2, 1.2].map((x, i) => (
          <mesh key={i} material={glowMat} position={[x, 4.0, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
          </mesh>
        ))}
      </group>

      {/* Portal fill */}
      <mesh ref={glowRef} material={portalMat} position={[0, 2.1, 0]}>
        <planeGeometry args={[2.2, 3.8]} />
      </mesh>

      {/* Point light inside gateway */}
      <pointLight color={color} intensity={1.8} distance={8} decay={2} position={[0, 2.5, 0]} />
    </group>
  );
}

// ── District floor zone ───────────────────────────────────────────────────────

function DistrictZone({ position, color, radius = 3.5 }: {
  position: [number, number, number];
  color: string;
  radius?: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.09,
  }), [color]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (ringRef.current) ringRef.current.rotation.z += 0.003;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= 0.002;
    if (ringMat) ringMat.opacity = 0.06 + Math.sin(t * 0.6) * 0.04;
  });

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ringRef} material={ringMat}>
        <ringGeometry args={[radius - 0.04, radius + 0.04, 48]} />
      </mesh>
      <mesh ref={ring2Ref} material={ringMat}>
        <ringGeometry args={[radius * 0.6 - 0.03, radius * 0.6 + 0.03, 40]} />
      </mesh>
    </group>
  );
}

// ── District legend label ─────────────────────────────────────────────────────

function DistrictBeacon({ position, color }: { position: [number, number, number]; color: string }) {
  const beamRef = useRef<THREE.Mesh>(null);

  const beamMat = useMemo(() => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.18,
  }), [color]);

  useFrame((s) => {
    if (beamRef.current) {
      beamMat.opacity = 0.12 + Math.abs(Math.sin(s.clock.elapsedTime * 0.7)) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={beamRef} material={beamMat}>
        <cylinderGeometry args={[0.04, 0.12, 6, 8, 1, true]} />
      </mesh>
      <pointLight color={color} intensity={0.6} distance={5} decay={2} position={[0, 3, 0]} />
    </group>
  );
}

// ── Main TempleDistrictManager ────────────────────────────────────────────────

interface Props {
  products: Product[];
}

export default function TempleDistrictManager({ products }: Props) {
  const districtStats = useMemo(() => {
    const counts: Record<string, number> = { ankhron: 0, osyron: 0, gencore: 0 };
    products.forEach(p => { counts[getDistrict(p)] += 1; });
    return counts;
  }, [products]);

  const hasAnkhron = districtStats.ankhron > 0;
  const hasOsyron  = districtStats.osyron  > 0;
  const hasGencore = districtStats.gencore  > 0;

  return (
    <group>
      {/* ─── ANKHRON DISTRICT — North-East zone ─────────────────────────────── */}
      {hasAnkhron && (
        <>
          <DistrictGateway
            position={[9, 0, -8]}
            rotation={[0, -Math.PI * 0.35, 0]}
            color={DISTRICT_COLORS.ankhron.primary}
            label="ANKHRON"
          />
          <DistrictZone
            position={[7, 0.05, -5]}
            color={DISTRICT_COLORS.ankhron.primary}
            radius={3.8}
          />
          <DistrictBeacon
            position={[7, 0, -5]}
            color={DISTRICT_COLORS.ankhron.primary}
          />
        </>
      )}

      {/* ─── OSYRON DISTRICT — South zone ────────────────────────────────────── */}
      {hasOsyron && (
        <>
          <DistrictGateway
            position={[0, 0, 12]}
            rotation={[0, Math.PI, 0]}
            color={DISTRICT_COLORS.osyron.primary}
            label="OSYRON"
          />
          <DistrictZone
            position={[0, 0.05, 8]}
            color={DISTRICT_COLORS.osyron.primary}
            radius={4.2}
          />
          <DistrictBeacon
            position={[0, 0, 8]}
            color={DISTRICT_COLORS.osyron.primary}
          />
        </>
      )}

      {/* ─── GEN CORE — West-Center zone ─────────────────────────────────────── */}
      {hasGencore && (
        <>
          <DistrictGateway
            position={[-9, 0, -2]}
            rotation={[0, Math.PI * 0.5, 0]}
            color={DISTRICT_COLORS.gencore.primary}
            label="GEN CORE"
          />
          <DistrictZone
            position={[-6, 0.05, -2]}
            color={DISTRICT_COLORS.gencore.primary}
            radius={3.5}
          />
          <DistrictBeacon
            position={[-6, 0, -2]}
            color={DISTRICT_COLORS.gencore.primary}
          />
        </>
      )}
    </group>
  );
}
