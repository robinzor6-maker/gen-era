import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Portal() {
  // @ts-ignore
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.6;
      ref.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={[0, 2, 0]}>
      <torusGeometry args={[1.4, 0.25, 32, 200]} />
      <meshStandardMaterial color="#000000" emissive="#000000" metalness={1} roughness={0} />
    </mesh>
  );
}
