import { useRef, useState } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useAudio } from "@/lib/audio/AudioContext";

export interface HotspotData {
  id: string;
  position: [number, number, number];
  label: string;
  wing: string;
  description: string;
  future: string;
  color: string;
}

interface TempleHotspotProps {
  data: HotspotData;
  onOpen: (id: string) => void;
  isOpen: boolean;
}

export default function TempleHotspot({ data, onOpen, isOpen }: TempleHotspotProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { playUISound } = useAudio();

  const mat = new THREE.MeshBasicMaterial({
    color: data.color,
    transparent: true,
    opacity: hovered || isOpen ? 0.9 : 0.5,
  });

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.015;
      ringRef.current.rotation.z += 0.008;
      const pulse = hovered || isOpen ? 1 + Math.sin(Date.now() * 0.004) * 0.2 : 1;
      ringRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={data.position}>
      <mesh
        ref={ringRef}
        material={mat}
        onPointerEnter={() => { setHovered(true); playUISound("hover"); document.body.style.cursor = "pointer"; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={() => { onOpen(data.id); playUISound("open"); }}
      >
        <torusGeometry args={[0.35, 0.04, 8, 32]} />
      </mesh>

      <pointLight color={data.color} intensity={hovered || isOpen ? 2 : 0.8} distance={3} decay={2} />

      <Html center distanceFactor={8} style={{ pointerEvents: "none" }}>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.42rem",
          letterSpacing: "0.3em",
          color: data.color,
          whiteSpace: "nowrap",
          textShadow: `0 0 8px ${data.color}`,
          opacity: hovered || isOpen ? 1 : 0.6,
          transition: "opacity 0.3s",
          transform: "translateY(-36px)",
          userSelect: "none",
        }}>
          {data.wing}
        </div>
      </Html>
    </group>
  );
}
