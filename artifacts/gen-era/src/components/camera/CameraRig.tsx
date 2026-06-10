import { useFrame, useThree } from "@react-three/fiber";

export default function CameraRig() {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.y = 3;
  });

  return null;
}
