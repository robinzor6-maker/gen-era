import { useRef, useEffect, type RefObject } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTempleStore } from '@/stores/templeStore';

const DEFAULT_CAM_POS = new THREE.Vector3(0, 5, 16);
const DEFAULT_TARGET = new THREE.Vector3(0, 3, 0);

const FOCUS_OFFSET_Y = 4.5;
const FOCUS_DISTANCE = 6;

interface Props {
  controlsRef: RefObject<any>;
}

export default function CameraController({ controlsRef }: Props) {
  const { camera } = useThree();
  const { focusPedestalPos, isPanelOpen } = useTempleStore();

  const targetCamPos = useRef(DEFAULT_CAM_POS.clone());
  const targetLookAt = useRef(DEFAULT_TARGET.clone());
  const lerpFactor = useRef(0.04);

  useEffect(() => {
    if (isPanelOpen && focusPedestalPos) {
      const [px, , pz] = focusPedestalPos;
      // Push camera toward pedestal from the origin direction
      const dir = new THREE.Vector3(px, 0, pz).normalize();
      targetCamPos.current.set(
        px - dir.x * FOCUS_DISTANCE,
        FOCUS_OFFSET_Y,
        pz - dir.z * FOCUS_DISTANCE
      );
      targetLookAt.current.set(px, 1.6, pz);
      lerpFactor.current = 0.045;

      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    } else {
      targetCamPos.current.copy(DEFAULT_CAM_POS);
      targetLookAt.current.copy(DEFAULT_TARGET);
      lerpFactor.current = 0.035;

      if (controlsRef.current) {
        // Re-enable controls after camera settles
        setTimeout(() => {
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
            controlsRef.current.target.copy(DEFAULT_TARGET);
            controlsRef.current.update();
          }
        }, 800);
      }
    }
  }, [isPanelOpen, focusPedestalPos, controlsRef]);

  useFrame(() => {
    camera.position.lerp(targetCamPos.current, lerpFactor.current);

    if (isPanelOpen && focusPedestalPos) {
      camera.lookAt(targetLookAt.current);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, lerpFactor.current);
      }
    }
  });

  return null;
}
