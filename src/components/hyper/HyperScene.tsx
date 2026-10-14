'use client'

// The whole visual site. Four things share one R⁴ orientation, so the scene
// turns as a single four-dimensional object rather than as a pile of separate
// 3D animations:
//
//   the tesseract you navigate with, eight cells for eight sections
//   a 600-cell lattice around it, 120 vertices and 720 edges
//   a quaternion Julia set raymarched in the middle
//   a dust field whose particles live in R⁴
//
// Nothing here is a 3D object dressed up to look exotic. Every position starts
// as four numbers.

import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Bloom, ChromaticAberration, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import HyperDust from './HyperDust'
import HyperFractal from './HyperFractal'
import HyperLabels from './HyperLabels'
import HyperPolytope from './HyperPolytope'
import {
  CELL_EDGES,
  HYPERCUBE,
  activeCell,
  composeOuter,
  hyperState,
} from '@/lib/hyperState'
import { sixHundredCell, twentyFourCell } from '@/lib/hyper4d'

export type HyperQuality = 'high' | 'low'

type Props = {
  quality: HyperQuality
  calm: boolean
  /** Hex accent per cell, eased toward as the rotation moves. */
  accents: string[]
}

/** Owns time, easing and colour, so every renderer sees the same orientation
 *  within a frame. */
function HyperClock({ accents }: { accents: string[] }) {
  const scratch = useMemo(() => ({ from: new THREE.Color(), to: new THREE.Color() }), [])
  const frames = useRef({ count: 0, elapsed: 0 })

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20)
    hyperState.clock += dt
    hyperState.current = hyperState.calm
      ? hyperState.target
      : THREE.MathUtils.damp(hyperState.current, hyperState.target, 3.1, dt)

    const hex = accents[activeCell()] ?? accents[0]
    if (hex) {
      scratch.to.set(hex)
      scratch.from.setRGB(hyperState.accent[0], hyperState.accent[1], hyperState.accent[2])
      scratch.from.lerp(scratch.to, 1 - Math.exp(-dt * 3))
      hyperState.accent[0] = scratch.from.r
      hyperState.accent[1] = scratch.from.g
      hyperState.accent[2] = scratch.from.b
    }

    // Drag always decays back to centre so the shape resettles square.
    const decay = Math.exp(-dt * 1.4)
    hyperState.dragX *= decay
    hyperState.dragY *= decay

    const f = frames.current
    f.count++
    f.elapsed += delta
    if (f.elapsed >= 0.5) {
      hyperState.fps = Math.round(f.count / f.elapsed)
      f.count = 0
      f.elapsed = 0
    }
  })

  return null
}

/** A slow 3D camera move on top of the 4D rotation, so the projection is seen
 *  from a shifting angle and never reads as a flat diagram. */
function HyperCamera({ calm }: { calm: boolean }) {
  const camera = useThree((state) => state.camera)

  useFrame(() => {
    if (!hyperState.active) return
    const t = hyperState.clock
    const sway = calm ? 0 : 1
    camera.position.set(
      Math.sin(t * 0.13) * 0.5 * sway + hyperState.dragX * 0.8,
      Math.sin(t * 0.09) * 0.36 * sway - hyperState.dragY * 0.8,
      5.3 + Math.cos(t * 0.11) * 0.28 * sway,
    )
    camera.lookAt(0, 0, 0)
  })

  return null
}

function Contents({ quality, calm }: { quality: HyperQuality; calm: boolean }) {
  const high = quality === 'high'
  const lattice = useMemo(() => (high ? sixHundredCell() : twentyFourCell()), [high])

  // Read inside the frame loop, not during React render, so the lit cell
  // tracks the rotation rather than the last re-render.
  const litEdges = () => CELL_EDGES[activeCell()] ?? CELL_EDGES[0]

  return (
    <>
      <HyperCamera calm={calm} />
      <HyperLabels />
      <HyperDust count={high ? 3000 : 1100} size={high ? 13 : 11} />

      {/* The lattice turns on its own slower path, which keeps it readable as
          a separate object behind the navigator. Perspective rather than
          stereographic: a freely rotating unit polytope would fling vertices
          to infinity through the stereographic pole. */}
      <group scale={2.35}>
        <HyperPolytope
          shape={lattice}
          orientation={composeOuter}
          eyeW={3.2}
          thickness={high ? 0.0075 : 0.012}
          opacity={0.32}
          wGain={1.35}
          segments={3}
          showNodes={false}
          liveAccent={false}
          accent="#3b82f6"
          cool="#0a1a3f"
          warm="#60a5fa"
        />
      </group>

      {high && <HyperFractal bounds={1.25} size={0.78} steps={64} opacity={0.7} />}

      <HyperPolytope
        shape={HYPERCUBE}
        highlight={litEdges}
        thickness={0.028}
        segments={high ? 7 : 4}
        cool="#1b2f7a"
        warm="#7dd3fc"
      />
    </>
  )
}

function Effects({ quality }: { quality: HyperQuality }) {
  const aberration = useMemo(() => new THREE.Vector2(0.0011, 0.0011), [])

  // EffectComposer wants effect elements only, so the list is built explicitly.
  // The bloom threshold sits well above the dust's brightness on purpose: at
  // 0.15 every particle bloomed and the hypercube vanished into the glow.
  const effects = [
    <Bloom
      key="bloom"
      mipmapBlur
      intensity={quality === 'high' ? 0.85 : 0.65}
      luminanceThreshold={0.42}
      luminanceSmoothing={0.25}
      radius={0.7}
    />,
  ]
  if (quality === 'high') {
    effects.push(
      <ChromaticAberration
        key="ca"
        offset={aberration}
        radialModulation
        modulationOffset={0.35}
        blendFunction={BlendFunction.NORMAL}
      />,
    )
  }
  effects.push(<Vignette key="vignette" offset={0.2} darkness={0.8} />)
  effects.push(<ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />)

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {effects}
    </EffectComposer>
  )
}

/** Publishes counters under ?debug so a test can tell "the shaders compiled and
 *  drew" apart from "the canvas is black for some other reason". */
function HyperProbe() {
  const gl = useThree((state) => state.gl)

  useFrame(() => {
    const target = window as unknown as { __hyper?: Record<string, unknown> }
    if (!target.__hyper) return
    target.__hyper.programs = gl.info.programs?.length ?? 0
    target.__hyper.state = {
      target: +hyperState.target.toFixed(3),
      current: +hyperState.current.toFixed(3),
      clock: +hyperState.clock.toFixed(2),
      active: hyperState.active,
      cell: activeCell(),
      fps: hyperState.fps,
      accent: hyperState.accent.map((c) => +c.toFixed(3)),
    }
  })

  return null
}

export default function HyperScene({ quality: initialQuality, calm, accents }: Props) {
  const [quality, setQuality] = useState<HyperQuality>(initialQuality)
  const [dpr, setDpr] = useState(initialQuality === 'high' ? 1.4 : 1)

  // Under ?debug only, keep the drawing buffer so a test can read the canvas
  // back. Postprocessing renders through its own targets, so sampling the
  // framebuffer mid-frame reports black even when the scene is drawing fine.
  const debug = useMemo(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug'),
    [],
  )

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: 42, near: 0.1, far: 60, position: [0, 0, 5.3] }}
      gl={{
        antialias: false,
        alpha: false,
        stencil: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: debug,
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <color attach="background" args={['#02030a']} />
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => {
          setDpr(1)
          setQuality('low')
        }}
      />
      <HyperClock accents={accents} />
      <Contents quality={quality} calm={calm} />
      <Effects quality={quality} />
      <HyperProbe />
    </Canvas>
  )
}
