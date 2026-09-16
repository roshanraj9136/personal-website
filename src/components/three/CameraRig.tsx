'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { shotAt } from './layout'
import { stageState } from '@/lib/stage'

type Props = { reducedMotion: boolean; wide: boolean; hover: boolean }

// Scroll position picks a point on the camera path; the camera eases toward it,
// sliding sideways so each floor sits beside its text panel on wide screens.
export default function CameraRig({ reducedMotion, wide, hover }: Props) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera
  const size = useThree((state) => state.size)

  const pointer = useRef(new THREE.Vector2())
  const parallax = useRef(new THREE.Vector2())
  const ready = useRef(false)
  // 0 -> 1 over the opening seconds: the camera descends onto the tower from far above.
  const intro = useRef(reducedMotion ? 1 : 0)

  const tmp = useMemo(
    () => ({
      position: new THREE.Vector3(),
      target: new THREE.Vector3(),
      look: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      introPosition: new THREE.Vector3(150, 190, -120),
      introTarget: new THREE.Vector3(0, 30, 0),
    }),
    [],
  )

  useEffect(() => {
    camera.fov = wide ? 40 : 56
    camera.updateProjectionMatrix()
  }, [camera, wide])

  useEffect(() => {
    if (!hover) return
    const onMove = (e: PointerEvent) => pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [hover])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20)
    stageState.current = reducedMotion ? stageState.target : THREE.MathUtils.damp(stageState.current, stageState.target, 2.4, dt)

    const { position, target, look, forward, right, up, introPosition, introTarget } = tmp
    const side = shotAt(stageState.current, position, target)

    forward.subVectors(target, position).normalize()
    right.crossVectors(forward, up).normalize()

    if (wide) {
      // Slide the camera so the subject lands in the half of the screen without text.
      const distance = position.distanceTo(target)
      const halfWidth = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance * (size.width / size.height)
      right.multiplyScalar(-side * halfWidth * 0.4)
      position.add(right)
      target.add(right)
      right.normalize()
    } else {
      target.y -= 1.6
    }

    if (intro.current < 1) {
      intro.current = Math.min(1, intro.current + dt / 2.8)
      const e = 1 - Math.pow(1 - intro.current, 3)
      position.lerpVectors(introPosition, position, e)
      target.lerpVectors(introTarget, target, e)
    }

    parallax.current.lerp(pointer.current, 1 - Math.exp(-dt * 2))
    position.addScaledVector(right, parallax.current.x * 0.9).addScaledVector(up, parallax.current.y * 0.6)

    if (!ready.current || reducedMotion || stageState.snap) {
      stageState.snap = false
      camera.position.copy(position)
      look.copy(target)
      ready.current = true
    } else {
      const k = 1 - Math.exp(-dt * 4.5)
      camera.position.lerp(position, k)
      look.lerp(target, k)
    }
    camera.lookAt(look)
    const debug = (window as unknown as { __stack?: Record<string, unknown> }).__stack
    if (debug) debug.camera = { position: camera.position.toArray().map((v) => +v.toFixed(2)), look: look.toArray().map((v) => +v.toFixed(2)), stage: +stageState.current.toFixed(3), side: +side.toFixed(2) }
  })

  return null
}
