// The whole site is one object in R⁴, and navigating it means rotating that
// object. There is no scrolling page underneath: a tesseract has exactly eight
// cubic cells, there are exactly eight things to say, so each one gets a cell.
// Choosing a section rotates the hypercube until that cell is the one nearest
// the 4D eye.

import {
  PLANES,
  composeRotation,
  identity4,
  multiply4,
  tesseract,
  tesseractCells,
  type HyperCell,
  type Mat4,
  type Plane,
  type Rotation4,
} from './hyper4d'

export const HYPERCUBE = tesseract()
const ALL_CELLS = tesseractCells(HYPERCUBE)

/** tesseractCells() lists opposite cells next to each other, and a half-turn
 *  between neighbours reads as a glitch rather than a rotation. Reordering so
 *  adjacent sections are a quarter-turn apart keeps every move on a short arc. */
const CELL_ORDER: readonly [number, 1 | -1][] = [
  [3, 1], // the home orientation, no rotation at all
  [0, 1],
  [1, 1],
  [2, 1],
  [0, -1],
  [1, -1],
  [2, -1],
  [3, -1],
]

export const CELLS: HyperCell[] = CELL_ORDER.map(
  ([axis, sign]) => ALL_CELLS.find((cell) => cell.axis === axis && cell.sign === sign)!,
)

export const CELL_COUNT = CELLS.length

/** The 12 edges of each cell's cube, so the active section can be lit. */
export const CELL_EDGES: number[][] = CELLS.map((cell) => {
  const inCell = new Set(cell.vertices)
  const list: number[] = []
  HYPERCUBE.edges.forEach(([a, b], index) => {
    if (inCell.has(a) && inCell.has(b)) list.push(index)
  })
  return list
})

/** Axis labels for the readout: which cell of the hypercube you are looking at. */
export const CELL_NAMES = CELLS.map((cell) => `${'xyzw'[cell.axis]}${cell.sign === 1 ? '+' : '\u2212'}`)

const AXIS_W_PLANE: readonly Plane[] = ['xw', 'yw', 'zw']

/** The per-plane angles that swing one cell to the front. Rotating in the
 *  axis' w-plane by sign * 90° sends that cell's centre to maximum w, which is
 *  exactly "nearest the viewer in the fourth dimension".
 *
 *  The w cells are the exception: they already lie on the w axis, so w+ needs
 *  no rotation and w- needs a half turn. That half turn is written as -π rather
 *  than +π deliberately. Both land on the same orientation, but the cell before
 *  w- sits at -90°, so -π is a quarter turn away while +π would be three
 *  quarters: the same destination reached the long way round, and the only
 *  transition on the site that did not match the others. */
function anglesFacing(cell: HyperCell): Rotation4 {
  if (cell.axis === 3) return cell.sign === 1 ? {} : { zw: -Math.PI }
  return { [AXIS_W_PLANE[cell.axis]]: (Math.PI / 2) * cell.sign }
}

const CELL_ANGLES: Rotation4[] = CELLS.map(anglesFacing)

export type HyperState = {
  /** Where we are heading, 0..7. Fractional only mid-gesture. */
  target: number
  /** Eased follower of target; this is what the renderers use. */
  current: number
  /** Seconds of scene time. */
  clock: number
  /** Pointer drag in radians, added to the xw and yw planes. */
  dragX: number
  dragY: number
  /** False when the tab is hidden, which parks the render loop. */
  active: boolean
  /** prefers-reduced-motion: no drift, no idle spin, instant moves. */
  calm: boolean
  lowPower: boolean
  /** Active accent as RGB 0..1, eased by the scene. Plain numbers so this
   *  module stays free of three.js and testable on its own. */
  accent: [number, number, number]
  /** Smoothed frames per second, for the telemetry readout. */
  fps: number
}

export const hyperState: HyperState = {
  target: 0,
  current: 0,
  clock: 0,
  dragX: 0,
  dragY: 0,
  active: true,
  calm: false,
  lowPower: false,
  accent: [0.4, 0.88, 1],
  fps: 0,
}

// --- navigation -------------------------------------------------------------

const listeners = new Set<(cell: number) => void>()
let announced = 0

/** Subscribe to whole-cell changes. Deliberately not per-frame: the HTML panels
 *  change eight times in a visit, and re-rendering them at 60fps to track a
 *  continuous rotation would be waste. */
export function onCellChange(fn: (cell: number) => void) {
  listeners.add(fn)
  fn(announced)
  return () => {
    listeners.delete(fn)
  }
}

function announce(cell: number) {
  if (cell === announced) return
  announced = cell
  listeners.forEach((fn) => fn(cell))
}

export function clampCell(value: number) {
  return Math.max(0, Math.min(CELL_COUNT - 1, value))
}

/** The cell currently nearest the 4D eye. */
export function activeCell() {
  return clampCell(Math.round(hyperState.current))
}

export function goTo(cell: number) {
  hyperState.target = clampCell(cell)
  announce(clampCell(Math.round(hyperState.target)))
  if (hyperState.calm) hyperState.current = hyperState.target
}

export function step(delta: number) {
  goTo(Math.round(hyperState.target) + delta)
}

/** Nudge the target by a fraction of a cell, for wheel and swipe gestures.
 *  Leaves the target fractional; settle() is what lands it on a cell. */
export function nudge(amount: number) {
  hyperState.target = clampCell(hyperState.target + amount)
  announce(clampCell(Math.round(hyperState.target)))
}

/** Snap to the nearest cell. Called when a gesture stops, so the hypercube
 *  always comes to rest with one cell square to the viewer rather than frozen
 *  at some arbitrary angle. */
export function settle() {
  goTo(Math.round(hyperState.target))
}

// --- orientation ------------------------------------------------------------

/** Interpolates the per-plane angles between two cells. Angles interpolate
 *  cleanly where matrices do not: every intermediate value is still a genuine
 *  rotation, so the shape never shears or collapses mid-move. */
export function anglesAt(position: number): Rotation4 {
  const clamped = clampCell(position)
  const low = Math.floor(clamped)
  const high = Math.min(CELL_COUNT - 1, low + 1)
  const t = clamped - low
  const from = CELL_ANGLES[low]
  const to = CELL_ANGLES[high]
  const out: Rotation4 = {}
  for (const plane of PLANES) {
    const a = from[plane] ?? 0
    const b = to[plane] ?? 0
    const value = a + (b - a) * t
    if (value !== 0) out[plane] = value
  }
  return out
}

/** The full 4D orientation for a position and a moment in time. Three
 *  rotations stack: the navigation swing, a slow isoclinic drift in xy and zw
 *  (the one motion with no 3D analogue, and what makes the shape look
 *  impossible), and pointer drag in xw and yw. */
export function orientationAt(position: number, time: number, state: HyperState = hyperState): Mat4 {
  const nav = composeRotation(anglesAt(position))
  if (state.calm) return nav
  const drift = composeRotation({
    xy: time * 0.045,
    zw: time * 0.045,
    xz: Math.sin(time * 0.17) * 0.11,
  })
  const drag = composeRotation({ xw: state.dragX, yw: state.dragY })
  return multiply4(multiply4(drag, drift), nav)
}

// One orientation per frame, shared by every renderer that asks for it.
let cacheKey = ''
let cached: Mat4 = identity4()

export function currentOrientation(state: HyperState = hyperState): Mat4 {
  const key = `${state.current}|${state.clock}|${state.dragX}|${state.dragY}|${state.calm}`
  if (key !== cacheKey) {
    cacheKey = key
    cached = orientationAt(state.current, state.clock, state)
  }
  return cached
}

/** A slower, independent path for the decorative outer lattice. Sharing the
 *  navigator's orientation made the two shapes look welded together. */
export function composeOuter(state: HyperState = hyperState): Mat4 {
  if (state.calm) return composeRotation({ xw: 0.3, yz: 0.2 })
  const t = state.clock
  return composeRotation({
    xy: t * 0.021,
    zw: -t * 0.027,
    xw: Math.sin(t * 0.05) * 0.5 + state.current * 0.12,
    yz: t * 0.014,
  })
}

// --- label placement --------------------------------------------------------

/** Where each cell's name should sit on screen. Written by the scene, which is
 *  the only place that knows the camera, and read by the DOM overlay so the
 *  labels are real selectable text rather than pixels in a texture. */
export type LabelSlot = { x: number; y: number; depth: number; visible: boolean }

export const labelSlots: LabelSlot[] = CELLS.map(() => ({ x: 0, y: 0, depth: 0, visible: false }))
