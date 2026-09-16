'use client'

import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, Stars } from '@react-three/drei'
import CameraRig from './CameraRig'
import Effects, { type Quality } from './Effects'
import Tower from './Tower'
import Floors from './floors'

export type WorldConfig = {
  reducedMotion: boolean
  hover: boolean
  wide: boolean
  quality: Quality
  forcedQuality: boolean
}

export default function World({ reducedMotion, hover, wide, quality: initialQuality, forcedQuality }: WorldConfig) {
  const [quality, setQuality] = useState<Quality>(initialQuality)
  const [dpr, setDpr] = useState(initialQuality === 'high' ? 1.5 : 1)

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: 40, near: 0.1, far: 700, position: [34, 8, -28] }}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, pointerEvents: hover ? 'auto' : 'none' }}
    >
      <color attach="background" args={['#03040a']} />
      <fogExp2 attach="fog" args={['#04050c', 0.0095]} />
      {!forcedQuality && (
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => {
            setDpr(1)
            setQuality((q) => (q === 'high' ? 'low' : q))
          }}
        />
      )}
      <CameraRig reducedMotion={reducedMotion} wide={wide} hover={hover} />
      <ambientLight intensity={0.3} />
      <hemisphereLight args={['#7dd3fc', '#1e1b4b', 0.5]} />
      <directionalLight position={[20, 40, 10]} intensity={0.6} color="#c7d2fe" />
      <Stars radius={180} depth={80} count={wide ? 5000 : 2200} factor={4} saturation={0} fade speed={0.35} />
      <Suspense fallback={null}>
        <Tower />
        <Floors hover={hover} reducedMotion={reducedMotion} />
      </Suspense>
      <Effects quality={quality} />
    </Canvas>
  )
}
