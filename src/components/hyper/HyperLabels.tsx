'use client'

// Works out where each cell's name belongs on screen.
//
// A cell centre is a point in R⁴. Rotate it with everything else, project it
// R⁴ -> R³, then run it through the camera to get R² and hand the result to the
// DOM. The labels are therefore real selectable text that happens to be
// positioned by four-dimensional geometry, rather than glyphs baked into a
// texture: they stay crisp at any zoom, they can be read by a screen reader,
// and they can be clicked.

import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { project4to3, transform4, type Projected, type Vec4 } from '@/lib/hyper4d'
import { CELLS, currentOrientation, hyperState, labelSlots } from '@/lib/hyperState'

type Props = {
  /** Pushes labels out past the hypercube's own edges. */
  spread?: number
  eyeW?: number
}

export default function HyperLabels({ spread = 1.55, eyeW = 2.6 }: Props) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  const scratch = useMemo(
    () => ({
      rotated: [0, 0, 0, 0] as Vec4,
      projected: { x: 0, y: 0, z: 0, depth: 0, scale: 1 } as Projected,
      point: new THREE.Vector3(),
    }),
    [],
  )

  useFrame(() => {
    if (!hyperState.active) return
    const matrix = currentOrientation()

    for (let i = 0; i < CELLS.length; i++) {
      transform4(matrix, CELLS[i].center, scratch.rotated)
      project4to3(scratch.rotated, eyeW, scratch.projected)

      scratch.point.set(
        scratch.projected.x * spread,
        scratch.projected.y * spread,
        scratch.projected.z * spread,
      )
      // R³ -> clip space -> pixels.
      scratch.point.project(camera)

      const slot = labelSlots[i]
      slot.x = (scratch.point.x * 0.5 + 0.5) * size.width
      slot.y = (-scratch.point.y * 0.5 + 0.5) * size.height
      slot.depth = scratch.projected.depth
      // Hide anything behind the camera or far away in w, so labels do not
      // stack up on top of each other at the back of the shape.
      slot.visible = scratch.point.z < 1 && scratch.projected.depth > -0.35
    }
  })

  return null
}
