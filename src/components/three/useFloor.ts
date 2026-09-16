import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { stageState } from '@/lib/stage'

/**
 * Shows a group only while the camera is near its stage, and reports how close it is (0..1).
 * Keeps far-away dioramas from costing anything.
 */
export function useFloorVisibility(stage: number, range = 1.6) {
  const ref = useRef<THREE.Group>(null)
  const nearness = useRef(0)
  useFrame(() => {
    const d = Math.abs(stageState.current - stage)
    nearness.current = Math.max(0, 1 - d / range)
    if (ref.current) ref.current.visible = d < range
  })
  return { ref, nearness }
}

/** Advances the uTime uniform of the given materials every frame. */
export function useShaderClock(materials: THREE.ShaderMaterial[]) {
  useFrame((_, delta) => {
    for (const m of materials) m.uniforms.uTime.value += delta
  })
}
