'use client'

import { Canvas } from '@react-three/fiber'
import ParticleMorph from './ParticleMorph'

type Props = { count: number; reducedMotion: boolean; hover: boolean }

export default function Scene(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], fov: 40, near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
    >
      <color attach="background" args={['#04050a']} />
      <ParticleMorph {...props} />
    </Canvas>
  )
}
