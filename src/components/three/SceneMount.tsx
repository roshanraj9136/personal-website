'use client'
/* eslint-disable react-hooks/set-state-in-effect */

import dynamic from 'next/dynamic'
import { Component, useEffect, useState, type ReactNode } from 'react'

const Scene = dynamic(() => import('./Scene'), { ssr: false })

type Config = { count: number; reducedMotion: boolean; hover: boolean }

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

function hasWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(gl)
  } catch {
    return false
  }
}

export default function SceneMount() {
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    if (!hasWebGL()) return
    const width = window.innerWidth
    const cores = navigator.hardwareConcurrency || 4
    const count = width < 640 ? 9000 : width < 1024 ? 15000 : cores <= 4 ? 18000 : 26000
    setConfig({
      count,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      hover: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    })
  }, [])

  if (!config) return null

  return (
    <div aria-hidden="true" className="scene-layer">
      <SceneBoundary>
        <Scene {...config} />
      </SceneBoundary>
    </div>
  )
}
