'use client'
/* eslint-disable react-hooks/immutability */

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { buildShapes, STAGE_COUNT } from './shapes'
import { fragmentShader, vertexShader } from './shaders'
import { stageState } from '@/lib/stage'

// Four colors per stage, indexed by the slot stored in each particle.
const PALETTES = [
  ['#22d3ee', '#a78bfa', '#e0f2fe', '#1e3a8a'], // hero core
  ['#ffc53d', '#ff8a1f', '#ff3b3b', '#5b1a1a'], // NISHAD: 590 / 610 / 660 nm LEDs
  ['#38bdf8', '#818cf8', '#c084fc', '#1e1b4b'], // MiniLang AST
  ['#34d399', '#22d3ee', '#a3e635', '#34d399'], // load balancer (slot 3 = backend 2 health)
  ['#22d3ee', '#fb923c', '#f8fafc', '#334155'], // AlgoRace lanes
  ['#a78bfa', '#4ade80', '#f472b6', '#2e1065'], // git graph
  ['#8b5cf6', '#22d3ee', '#f0abfc', '#1e1b4b'], // galaxy
  ['#22d3ee', '#a78bfa', '#e0f2fe', '#1e3a8a'], // contact core
]

// How fast pulses travel along each shape's paths.
const PULSE_SPEEDS = [0.08, 0.32, 0.22, 0.42, 0.2, 0.24, 0.05, 0.08]

const HEALTHY = new THREE.Color('#34d399')
const FAILING = new THREE.Color('#f43f5e')
const HEALTH_SLOT = 3 * 4 + 3
const OFFSCREEN = 9

type Props = { count: number; reducedMotion: boolean; hover: boolean }

export default function ParticleMorph({ count, reducedMotion, hover }: Props) {
  const size = useThree((state) => state.size)
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera
  const gl = useThree((state) => state.gl)

  const pointer = useRef(new THREE.Vector2(OFFSCREEN, OFFSCREEN))
  const parallax = useRef(new THREE.Vector2())

  const geometry = useMemo(() => {
    const { shapes, random } = buildShapes(count)
    const g = new THREE.BufferGeometry()
    const position = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      position[i * 3] = shapes[0][i * 4]
      position[i * 3 + 1] = shapes[0][i * 4 + 1]
      position[i * 3 + 2] = shapes[0][i * 4 + 2]
    }
    g.setAttribute('position', new THREE.BufferAttribute(position, 3))
    shapes.forEach((buf, i) => g.setAttribute(`aS${i}`, new THREE.BufferAttribute(buf, 4)))
    g.setAttribute('aRand', new THREE.BufferAttribute(random, 3))
    return g
  }, [count])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uIntro: { value: 0 },
          uSize: { value: 30 },
          uPixelRatio: { value: 1 },
          uTurbulence: { value: 1 },
          uMouseForce: { value: 0 },
          uAspect: { value: 1 },
          uMouse: { value: new THREE.Vector2(OFFSCREEN, OFFSCREEN) },
          uRot: { value: new THREE.Matrix3() },
          uOffset: { value: Array.from({ length: STAGE_COUNT }, () => new THREE.Vector3()) },
          uScale: { value: new Array<number>(STAGE_COUNT).fill(1) },
          uAlpha: { value: new Array<number>(STAGE_COUNT).fill(1) },
          uSpeed: { value: PULSE_SPEEDS },
          uPalette: { value: PALETTES.flat().map((hex) => new THREE.Color(hex)) },
        },
      }),
    [],
  )

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  useEffect(() => {
    material.uniforms.uTurbulence.value = reducedMotion ? 0.12 : 1
    if (reducedMotion) material.uniforms.uIntro.value = 1
  }, [material, reducedMotion])

  // Place each shape beside its text on wide screens, or behind it on narrow ones.
  useEffect(() => {
    const u = material.uniforms
    const aspect = size.width / size.height
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.position.z
    const viewWidth = viewHeight * aspect
    const wide = size.width >= 1024
    const EXTENT = 6.8

    const offsets = u.uOffset.value as THREE.Vector3[]
    const scales = u.uScale.value as number[]
    const alphas = u.uAlpha.value as number[]

    if (wide) {
      const container = (Math.min(size.width, 1280) / size.width) * viewWidth
      const side = container * 0.25
      const fitSide = Math.min((viewWidth * 0.44) / EXTENT, (viewHeight * 0.84) / EXTENT)
      const fitCenter = Math.min((viewWidth * 0.9) / EXTENT, (viewHeight * 0.95) / EXTENT)
      const xs = [side, -side, side, -side, side, -side, 0, 0]
      for (let i = 0; i < STAGE_COUNT; i++) {
        offsets[i].set(xs[i], 0, i === 6 ? -2 : 0)
        scales[i] = i === 6 ? fitCenter * 1.1 : i === 7 ? fitCenter * 0.78 : fitSide
        alphas[i] = i === 6 ? 0.45 : i === 7 ? 0.85 : 1
      }
      scales[0] *= 1.05
    } else {
      const fit = Math.min((viewWidth * 0.95) / EXTENT, (viewHeight * 0.55) / EXTENT)
      for (let i = 0; i < STAGE_COUNT; i++) {
        offsets[i].set(0, i === 0 ? viewHeight * 0.2 : 0, 0)
        scales[i] = i === 0 ? fit * 0.95 : fit
        alphas[i] = i === 0 ? 0.9 : i === 7 ? 0.55 : 0.34
      }
    }

    u.uAspect.value = aspect
    u.uPixelRatio.value = gl.getPixelRatio()
    u.uSize.value = wide ? 34 : 44
  }, [size, camera, gl, material])

  useEffect(() => {
    if (!hover) return
    const onMove = (e: PointerEvent) => {
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    }
    const onLeave = () => pointer.current.set(OFFSCREEN, OFFSCREEN)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [hover])

  const euler = useMemo(() => new THREE.Euler(), [])
  const matrix = useMemo(() => new THREE.Matrix4(), [])
  const health = useMemo(() => HEALTHY.clone(), [])
  const origin = useMemo(() => new THREE.Vector2(), [])

  useFrame((_, delta) => {
    const u = material.uniforms
    const dt = Math.min(delta, 1 / 20)

    stageState.current = THREE.MathUtils.damp(stageState.current, stageState.target, reducedMotion ? 12 : 3.2, dt)
    u.uProgress.value = THREE.MathUtils.clamp(stageState.current, 0, STAGE_COUNT - 1)
    u.uTime.value += reducedMotion ? dt * 0.35 : dt
    if (u.uIntro.value < 1) u.uIntro.value = Math.min(1, u.uIntro.value + dt / 2.6)

    const p = pointer.current
    const inside = Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1
    parallax.current.lerp(inside ? p : origin, 1 - Math.exp(-dt * 2.5))
    if (inside) (u.uMouse.value as THREE.Vector2).lerp(p, 1 - Math.exp(-dt * 12))
    u.uMouseForce.value = THREE.MathUtils.damp(u.uMouseForce.value, inside && !reducedMotion ? 1 : 0, 4, dt)

    const t = u.uTime.value
    const tilt = reducedMotion ? 0 : 1
    euler.set(-parallax.current.y * 0.18 + Math.sin(t * 0.11) * 0.05 * tilt, Math.sin(t * 0.13) * 0.3 * tilt + parallax.current.x * 0.3, 0)
    ;(u.uRot.value as THREE.Matrix3).setFromMatrix4(matrix.makeRotationFromEuler(euler))

    // Backend 2 fails its health checks for about 1.6 s out of every 8 s.
    const phase = (t % 8) / 8
    health.lerp(phase > 0.7 && phase < 0.9 ? FAILING : HEALTHY, 1 - Math.exp(-dt * 6))
    ;(u.uPalette.value as THREE.Color[])[HEALTH_SLOT].copy(health)
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
