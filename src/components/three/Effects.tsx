'use client'

import { useMemo } from 'react'
import { Bloom, ChromaticAberration, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'

export type Quality = 'high' | 'low' | 'off'

export default function Effects({ quality }: { quality: Quality }) {
  const aberration = useMemo(() => new THREE.Vector2(0.0007, 0.0007), [])
  if (quality === 'off') return null

  // EffectComposer expects effect elements only, so build the list explicitly.
  const effects = [
    <Bloom key="bloom" mipmapBlur intensity={quality === 'high' ? 1.35 : 1} luminanceThreshold={0.2} luminanceSmoothing={0.3} radius={0.75} />,
  ]
  if (quality === 'high') {
    effects.push(<ChromaticAberration key="ca" offset={aberration} radialModulation modulationOffset={0.4} blendFunction={BlendFunction.NORMAL} />)
    effects.push(<Noise key="noise" opacity={0.035} premultiply blendFunction={BlendFunction.SCREEN} />)
  }
  effects.push(<Vignette key="vignette" offset={0.28} darkness={0.72} />)
  effects.push(<ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />)

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {effects}
    </EffectComposer>
  )
}
