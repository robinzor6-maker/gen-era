import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import TempleLights from "@/components/lights/TempleLights";
import CameraRig from "@/components/camera/CameraRig";
import Floor from "@/components/objects/Floor";
import Pillar from "@/components/objects/Pillar";
import Portal from "@/components/objects/Portal";
import Particles from "@/components/objects/Particles";

export default function TempleScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 3, 8], fov: 50 }}
      style={{ width: "100%", height: "100vh" }}
    >
      <CameraRig />
      <TempleLights />
      <Floor />
      <Pillar x={-3} z={-3} />
      <Pillar x={3} z={-3} />
      <Pillar x={-3} z={3} />
      <Pillar x={3} z={3} />
      <Portal />
      <Particles />
      <OrbitControls enablePan={false} maxPolarAngle={1.6} />
    </Canvas>
  );
}
