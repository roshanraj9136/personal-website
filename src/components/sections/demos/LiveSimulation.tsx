'use client'

import { useEffect, useRef } from 'react'
import { BACKENDS, lbSim, lbStore } from '@/lib/lbSim'
import { useStore } from '@/lib/store'

// Controls for the load balancer model that also runs on the 3D Network floor.
// The model advances here too, so the panel works without WebGL.
export default function LiveSimulation() {
  const snapshot = useStore(lbStore, (s) => s)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    let visible = false
    let frame = 0
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !frame) frame = requestAnimationFrame(tick)
    })
    const tick = (now: number) => {
      frame = 0
      if (!visible) return
      lbSim.advance(now)
      frame = requestAnimationFrame(tick)
    }
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])

  const down = snapshot.killed.filter(Boolean).length

  return (
    <div className="demo" ref={ref}>
      <div className="demo-head">
        <span>Live simulation</span>
        <span className="demo-note">same routing rules as the Go code</span>
      </div>

      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Take backends down or bring them back">
        {Array.from({ length: BACKENDS }, (_, b) => {
          const killed = snapshot.killed[b]
          const state = !killed ? 'healthy' : snapshot.alive[b] ? 'down, not detected' : 'marked down'
          return (
            <button key={b} type="button" className="sim-backend" data-killed={killed} aria-pressed={killed} onClick={() => lbSim.toggleBackend(b)}>
              <span className="sim-name">backend-{b + 1}</span>
              <span className="sim-state">{state}</span>
              <span className="sim-flight">in-flight {snapshot.inFlight[b]}</span>
              <span className="sim-action">{killed ? 'Bring back' : 'Take down'}</span>
            </button>
          )
        })}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="sim-stat">
          <dt>served</dt>
          <dd>{snapshot.served}</dd>
        </div>
        <div className="sim-stat">
          <dt>retried</dt>
          <dd>{snapshot.retries}</dd>
        </div>
        <div className="sim-stat">
          <dt>502 errors</dt>
          <dd className={snapshot.failed ? 'text-rose-300' : undefined}>{snapshot.failed}</dd>
        </div>
      </dl>

      <p className="demo-foot" aria-live="polite">
        {down === 0 && 'Every request goes to the backend with the fewest in-flight requests. Take a server down to see what happens.'}
        {down > 0 && down < BACKENDS && 'Requests sent to a dead server are refused and retried on a backend they have not tried. After 3 failed health probes, the balancer stops preferring it.'}
        {down === BACKENDS && 'With every backend down, retries run out and clients get 502s: the one failure a load balancer cannot hide.'}
      </p>
    </div>
  )
}
