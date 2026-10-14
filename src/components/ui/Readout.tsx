'use client'

// Live telemetry for the rotation. The point of showing it is that it is not
// decoration: these are the six real degrees of rotational freedom in R⁴, and
// the three that include w are the ones doing something a 3D scene cannot.
// Watching xw and zw carry the motion is the proof that this is 4D.

import { useEffect, useRef } from 'react'
import { PLANES } from '@/lib/hyper4d'
import { HYPERCUBE, anglesAt, hyperState } from '@/lib/hyperState'

export default function Readout() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      const node = host.current
      if (!node) return

      const angles = anglesAt(hyperState.current)
      node.querySelectorAll<HTMLElement>('[data-plane]').forEach((cell) => {
        const plane = cell.dataset.plane as (typeof PLANES)[number]
        const deg = ((angles[plane] ?? 0) * 180) / Math.PI
        cell.textContent = `${deg >= 0 ? '+' : '\u2212'}${Math.abs(deg).toFixed(1)}\u00b0`
        cell.dataset.live = Math.abs(deg) > 0.5 ? 'on' : 'off'
      })

      const fps = node.querySelector<HTMLElement>('[data-fps]')
      if (fps) fps.textContent = hyperState.fps ? `${hyperState.fps} fps` : '—'
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div ref={host} className="readout">
      <p className="readout__label">rotation · degrees per plane</p>
      <ul className="readout__planes">
        {PLANES.map((plane) => (
          <li key={plane} className="readout__plane">
            <span className="readout__plane-name">{plane}</span>
            <span className="readout__plane-value" data-plane={plane} data-live="off">
              +0.0°
            </span>
          </li>
        ))}
      </ul>
      <p className="readout__foot">
        <span>
          {HYPERCUBE.vertices.length} vertices · {HYPERCUBE.edges.length} edges
        </span>
        <span data-fps>—</span>
      </p>
    </div>
  )
}
