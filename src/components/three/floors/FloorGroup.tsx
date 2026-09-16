'use client'

import { useMemo, type ReactNode } from 'react'
import { floorRotation, platformCenter } from '../layout'
import { useFloorVisibility } from '../useFloor'

/** Places a diorama on its floor (local +z faces the camera) and hides it when the camera is far away. */
export default function FloorGroup({ stage, children }: { stage: number; children: ReactNode }) {
  const center = useMemo(() => platformCenter(stage), [stage])
  const { ref } = useFloorVisibility(stage, 1.8)
  return (
    <group ref={ref} position={center} rotation={[0, floorRotation(stage), 0]}>
      {children}
    </group>
  )
}
