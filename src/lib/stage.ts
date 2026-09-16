// Scroll position -> "stage" (which 3D shape the particle field should show).
// Sections mark themselves with data-stage. While the middle of the viewport is
// inside the middle part of a section the stage holds steady; in the gaps
// between sections it blends smoothly to the next one.

export const stageState = { target: 0, current: 0 }

type Anchor = { start: number; end: number; stage: number }

let anchors: Anchor[] = []
let active = -1
const listeners = new Set<(stage: number) => void>()

export function onActiveStage(fn: (stage: number) => void) {
  listeners.add(fn)
  if (active >= 0) fn(active)
  return () => {
    listeners.delete(fn)
  }
}

export function measureStages() {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-stage]'))
  anchors = els
    .map((el) => {
      const rect = el.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const hold = Math.min(rect.height * 0.3, window.innerHeight * 0.35)
      return { start: top + hold, end: top + rect.height - hold, stage: Number(el.dataset.stage) }
    })
    .sort((a, b) => a.start - b.start)
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

export function updateStage() {
  if (!anchors.length) return
  const probe = window.scrollY + window.innerHeight * 0.5
  let value = anchors[anchors.length - 1].stage

  if (probe <= anchors[0].end) {
    value = anchors[0].stage
  } else {
    for (let i = 0; i < anchors.length; i++) {
      const a = anchors[i]
      const b = anchors[i + 1]
      if (probe <= a.end) {
        value = a.stage
        break
      }
      if (b && probe < b.start) {
        const t = (probe - a.end) / Math.max(1, b.start - a.end)
        value = a.stage + (b.stage - a.stage) * smoothstep(t)
        break
      }
    }
  }

  stageState.target = value
  const rounded = Math.round(value)
  if (rounded !== active) {
    active = rounded
    listeners.forEach((fn) => fn(rounded))
  }
}
