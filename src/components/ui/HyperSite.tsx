'use client'
/* eslint-disable react-hooks/set-state-in-effect */

// The site root. Owns capability detection, every input that can turn the
// hypercube, and the HTML laid over the canvas.
//
// There is no page scroll here. The site is a single object in R⁴ and the only
// way through it is rotation, so the wheel, the arrow keys, a drag, a swipe and
// the rail all do the same thing: pick a cell and turn it to face you.

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import CellRail from './CellRail'
import FloatingLabels from './FloatingLabels'
import Readout from './Readout'
import {
  CELL_COUNT,
  CELL_NAMES,
  goTo,
  hyperState,
  nudge,
  onCellChange,
  settle,
  step,
} from '@/lib/hyperState'
import { cells, profile } from '@/content/site'

const HyperScene = dynamic(() => import('@/components/hyper/HyperScene'), { ssr: false })

const ACCENTS = cells.map((cell) => cell.accent)

type Capability = { quality: 'high' | 'low'; calm: boolean } | null

export default function HyperSite() {
  const [capability, setCapability] = useState<Capability>(null)
  const [webglFailed, setWebglFailed] = useState(false)
  const [active, setActive] = useState(0)
  const [reading, setReading] = useState(false)
  const stage = useRef<HTMLDivElement>(null)

  // --- capability detection -------------------------------------------
  useEffect(() => {
    let gl: WebGL2RenderingContext | null = null
    try {
      gl = document.createElement('canvas').getContext('webgl2')
    } catch {
      gl = null
    }
    if (!gl) {
      // No WebGL2 means no 4D scene, so fall straight back to the text.
      setWebglFailed(true)
      setReading(true)
      return
    }
    gl.getExtension('WEBGL_lose_context')?.loseContext()

    const cores = navigator.hardwareConcurrency || 4
    const narrow = window.innerWidth < 768
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    hyperState.calm = calm
    hyperState.lowPower = narrow || cores <= 4
    setCapability({ quality: narrow || cores <= 4 ? 'low' : 'high', calm })

    if (new URLSearchParams(window.location.search).has('debug')) {
      Object.assign(window, { __hyper: { goTo, step } })
    }
  }, [])

  // --- keep the React panel in step with the rotation -----------------
  useEffect(() => onCellChange(setActive), [])

  // --- park the render loop when the tab is hidden --------------------
  useEffect(() => {
    const onVisibility = () => {
      hyperState.active = document.visibilityState === 'visible'
    }
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // --- the wheel turns the hypercube ----------------------------------
  useEffect(() => {
    if (!capability) return
    let settleTimer = 0

    const onWheel = (event: WheelEvent) => {
      if (reading) return
      event.preventDefault()
      // Trackpads fire many small deltas and mice fire few large ones, so clamp
      // per event and let the accumulation do the work.
      const delta = Math.max(-1, Math.min(1, event.deltaY / 240))
      nudge(delta * 0.5)
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(settle, 140)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.clearTimeout(settleTimer)
      window.removeEventListener('wheel', onWheel)
    }
  }, [capability, reading])

  // --- keyboard -------------------------------------------------------
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (event.key === 'Escape') {
        setReading(false)
        return
      }
      if (event.key.toLowerCase() === 'r') {
        setReading((value) => !value)
        return
      }
      if (reading) return

      const forward = ['ArrowRight', 'ArrowDown', 'PageDown', ' ']
      const back = ['ArrowLeft', 'ArrowUp', 'PageUp']
      if (forward.includes(event.key)) {
        event.preventDefault()
        step(1)
      } else if (back.includes(event.key)) {
        event.preventDefault()
        step(-1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        goTo(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        goTo(CELL_COUNT - 1)
      } else if (/^[1-8]$/.test(event.key)) {
        event.preventDefault()
        goTo(Number(event.key) - 1)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reading])

  // --- drag pushes the geometry through w, swipe changes cell ---------
  useEffect(() => {
    const el = stage.current
    if (!el || !capability) return

    let dragging = false
    let last = { x: 0, y: 0 }
    let touchStart = { x: 0, y: 0, time: 0 }

    const down = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        touchStart = { x: event.clientX, y: event.clientY, time: Date.now() }
        return
      }
      dragging = true
      last = { x: event.clientX, y: event.clientY }
    }
    const move = (event: PointerEvent) => {
      if (!dragging || hyperState.calm) return
      hyperState.dragX = Math.max(
        -0.9,
        Math.min(0.9, hyperState.dragX + ((event.clientX - last.x) / window.innerWidth) * 2.4),
      )
      hyperState.dragY = Math.max(
        -0.9,
        Math.min(0.9, hyperState.dragY + ((event.clientY - last.y) / window.innerHeight) * 2.4),
      )
      last = { x: event.clientX, y: event.clientY }
    }
    const up = (event: PointerEvent) => {
      dragging = false
      if (event.pointerType !== 'touch' || reading) return
      const dx = event.clientX - touchStart.x
      const dy = event.clientY - touchStart.y
      const quick = Date.now() - touchStart.time < 700
      if (!quick) return
      // Whichever axis dominates decides the direction of travel.
      if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx)) step(dy < 0 ? 1 : -1)
      else if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1)
    }

    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [capability, reading])

  // Reading mode is a document, so the page needs to scroll again.
  useEffect(() => {
    document.documentElement.dataset.reading = reading ? 'on' : 'off'
  }, [reading])

  const toggleReading = useCallback(() => setReading((value) => !value), [])

  const cell = cells[active]

  return (
    <>
      <div ref={stage} className="stage">
        <div className="stage__canvas">
          {capability && <HyperScene quality={capability.quality} calm={capability.calm} accents={ACCENTS} />}
        </div>

        {capability && <FloatingLabels />}
        <div className="stage__fade" aria-hidden="true" />

        <header className="masthead">
          <a className="masthead__name" href="#document">
            {profile.name}
          </a>
          <p className="masthead__meta">R⁴ · projected 4D → 3D → 2D</p>
        </header>

        <div className="hud">
          {/* aria-live so the panel is announced when the hypercube turns,
              since the visual cue is a rotation a screen reader cannot see. */}
          <section className="panel" aria-live="polite" style={{ '--accent': cell.accent } as React.CSSProperties}>
            <p className="panel__cell">
              cell {active + 1} of {CELL_COUNT} · <span className="panel__axis">{CELL_NAMES[active]}</span>
            </p>
            <p className="panel__kicker">{cell.kicker}</p>
            <h1 className="panel__title">{cell.title}</h1>
            <p className="panel__tagline">{cell.tagline}</p>
            <p className="panel__body">{cell.body}</p>

            {cell.stats.length > 0 && (
              <dl className="panel__stats">
                {cell.stats.slice(0, 4).map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.value}</dt>
                    <dd>{stat.label}</dd>
                  </div>
                ))}
              </dl>
            )}

            {cell.links.length > 0 && (
              <p className="panel__links">
                {cell.links.map((link) => (
                  <a key={link.href} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {link.label}
                  </a>
                ))}
              </p>
            )}
          </section>

          <Readout />
        </div>

        <CellRail active={active} onSelect={goTo} />

        <footer className="hint">
          <span>scroll, arrows or 1–8 to turn the hypercube</span>
          <span className="hint__sep" aria-hidden="true">
            ·
          </span>
          <span>drag to push through w</span>
          <button type="button" className="hint__read" onClick={toggleReading} aria-expanded={reading}>
            {reading ? 'Back to 4D' : 'Read as text'}
          </button>
        </footer>
      </div>

      {webglFailed && (
        <p className="nowebgl" role="status">
          This browser has no WebGL2, so the 4D scene cannot run. Everything it would have shown is written out below.
        </p>
      )}
    </>
  )
}
