'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import dynamic from 'next/dynamic'
import { Component, useEffect, useState, type ReactNode } from 'react'
import type { WorldConfig } from './World'
import type { Quality } from './Effects'

const World = dynamic(() => import('./World'), { ssr: false })

// If WebGL is missing or the scene throws, the page keeps its CSS background.
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function hasWebGL2() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(gl)
  } catch {
    return false
  }
}

function pickQuality(): { quality: Quality; forced: boolean } {
  const requested = new URLSearchParams(window.location.search).get('quality')
  if (requested === 'high' || requested === 'low' || requested === 'off') return { quality: requested, forced: true }
  const cores = navigator.hardwareConcurrency || 4
  const narrow = window.innerWidth < 768
  return { quality: narrow || cores <= 4 ? 'low' : 'high', forced: false }
}

export default function SceneMount() {
  const [config, setConfig] = useState<WorldConfig | null>(null)

  useEffect(() => {
    if (!hasWebGL2()) return
    const { quality, forced } = pickQuality()
    setConfig({
      quality,
      forcedQuality: forced,
      wide: window.innerWidth >= 1024,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      hover: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    })
  }, [])

  if (!config) return null

  return (
    <div aria-hidden="true" className="scene-layer">
      <SceneBoundary>
        <World {...config} />
      </SceneBoundary>
    </div>
  )
}
