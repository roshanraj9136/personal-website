'use client'

// The cell names, floating at the projected positions of the hypercube's eight
// cells. HyperLabels (inside the canvas) works out where they belong; this
// moves the text there and decides which ones are worth showing.
//
// Positions are written straight to style properties in a rAF loop rather than
// through React state, because they change every frame and re-rendering eight
// components sixty times a second to move some text would be absurd.

import { useEffect, useRef } from 'react'
import { CELL_NAMES, activeCell, goTo, labelSlots } from '@/lib/hyperState'
import { cells } from '@/content/site'

export default function FloatingLabels() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0
    // The panel's box, re-measured only on resize: reading layout every frame
    // for eight labels would force a reflow sixty times a second.
    let panel: DOMRect | null = null
    const measure = () => {
      panel = document.querySelector('.panel')?.getBoundingClientRect() ?? null
    }
    measure()
    window.addEventListener('resize', measure)

    const tick = () => {
      frame = requestAnimationFrame(tick)
      const node = host.current
      if (!node) return
      const current = activeCell()
      const nodes = node.children

      for (let i = 0; i < nodes.length && i < labelSlots.length; i++) {
        const el = nodes[i] as HTMLElement
        const slot = labelSlots[i]
        // depth runs about -1..1; map it to opacity and a little scale so a
        // label recedes as its cell turns away through the fourth dimension.
        const near = Math.max(0, Math.min(1, slot.depth * 0.5 + 0.5))

        // Three reasons to hide a label: its cell is behind the shape, the
        // panel already names it, or it would sit on top of the panel text.
        const overPanel =
          panel !== null &&
          slot.x > panel.left - 14 &&
          slot.x < panel.right + 14 &&
          slot.y > panel.top - 14 &&
          slot.y < panel.bottom + 14
        const show = slot.visible && i !== current && !overPanel

        el.style.transform = `translate3d(${slot.x}px, ${slot.y}px, 0) translate(-50%, -50%) scale(${(0.84 + near * 0.26).toFixed(3)})`
        el.style.opacity = show ? (0.12 + near * 0.68).toFixed(3) : '0'
        el.style.pointerEvents = show && near > 0.45 ? 'auto' : 'none'
        el.style.zIndex = String(Math.round(near * 100))
      }
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <div ref={host} className="labels" aria-hidden="true">
      {cells.map((cell, index) => (
        <button key={cell.id} type="button" className="labels__item" tabIndex={-1} onClick={() => goTo(index)}>
          <span className="labels__axis">{CELL_NAMES[index]}</span>
          <span className="labels__name">{cell.label}</span>
        </button>
      ))}
    </div>
  )
}
