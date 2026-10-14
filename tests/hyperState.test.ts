import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CELLS,
  CELL_COUNT,
  CELL_EDGES,
  CELL_NAMES,
  HYPERCUBE,
  activeCell,
  anglesAt,
  clampCell,
  composeOuter,
  currentOrientation,
  goTo,
  hyperState,
  labelSlots,
  nudge,
  onCellChange,
  orientationAt,
  settle,
  step,
} from '../src/lib/hyperState'
import { PLANES, dot4, identity4, multiply4, transform4, transpose4, type Mat4 } from '../src/lib/hyper4d'

function expectRotation(m: Mat4) {
  const product = multiply4(m, transpose4(m))
  const id = identity4()
  for (let i = 0; i < 16; i++) expect(product[i]).toBeCloseTo(id[i], 9)
}

beforeEach(() => {
  hyperState.target = 0
  hyperState.current = 0
  hyperState.clock = 0
  hyperState.dragX = 0
  hyperState.dragY = 0
  hyperState.calm = false
  // goTo(0) also resets the announcement bookkeeping.
  goTo(0)
})

describe('the eight cells', () => {
  it('covers all 8 cubic cells of the tesseract exactly once', () => {
    expect(CELLS).toHaveLength(8)
    expect(CELL_COUNT).toBe(8)
    const keys = new Set(CELLS.map((cell) => `${cell.axis}${cell.sign}`))
    expect(keys.size).toBe(8)
  })

  it('gives each cell the 12 edges of a cube', () => {
    expect(CELL_EDGES).toHaveLength(8)
    for (const edges of CELL_EDGES) expect(edges).toHaveLength(12)
  })

  it('names cells by the axis they hold fixed', () => {
    expect(CELL_NAMES).toHaveLength(8)
    expect(CELL_NAMES[0]).toBe('w+')
    for (const name of CELL_NAMES) expect(name).toMatch(/^[xyzw][+\u2212]$/)
  })

  it('never puts opposite cells next to each other', () => {
    // Adjacent sections should be a quarter turn apart, not a half turn, or the
    // transition passes through a degenerate edge-on projection.
    for (let i = 0; i < CELLS.length - 1; i++) {
      expect(dot4(CELLS[i].center, CELLS[i + 1].center)).toBeGreaterThan(-0.999)
    }
  })

  it('references only real edges of the hypercube', () => {
    for (const edges of CELL_EDGES) {
      for (const edge of edges) {
        expect(edge).toBeGreaterThanOrEqual(0)
        expect(edge).toBeLessThan(HYPERCUBE.edges.length)
      }
    }
  })
})

describe('navigation', () => {
  it('clamps to the available cells', () => {
    expect(clampCell(-5)).toBe(0)
    expect(clampCell(99)).toBe(7)
    expect(clampCell(3)).toBe(3)
  })

  it('goes to a cell', () => {
    goTo(5)
    expect(hyperState.target).toBe(5)
  })

  it('refuses to walk off either end', () => {
    goTo(0)
    step(-1)
    expect(hyperState.target).toBe(0)
    goTo(7)
    step(1)
    expect(hyperState.target).toBe(7)
  })

  it('steps forward and back', () => {
    goTo(3)
    step(1)
    expect(hyperState.target).toBe(4)
    step(-1)
    expect(hyperState.target).toBe(3)
  })

  it('accumulates a gesture and then settles on a whole cell', () => {
    nudge(0.3)
    nudge(0.3)
    expect(hyperState.target).toBeCloseTo(0.6, 6)
    settle()
    expect(hyperState.target).toBe(1)
    // A gesture that does not get halfway falls back.
    nudge(0.2)
    settle()
    expect(hyperState.target).toBe(1)
  })

  it('jumps instantly when reduced motion is requested', () => {
    hyperState.calm = true
    goTo(6)
    expect(hyperState.current).toBe(6)
  })

  it('reports the cell nearest the 4D eye', () => {
    hyperState.current = 2.4
    expect(activeCell()).toBe(2)
    hyperState.current = 2.6
    expect(activeCell()).toBe(3)
  })
})

describe('cell change subscription', () => {
  it('reports the current cell on subscribe and on every whole-cell change', () => {
    const seen: number[] = []
    const stop = onCellChange((cell) => seen.push(cell))
    goTo(2)
    goTo(3)
    stop()
    goTo(4)
    expect(seen).toEqual([0, 2, 3])
  })

  it('does not fire while a gesture stays inside one cell', () => {
    const fn = vi.fn()
    const stop = onCellChange(fn)
    fn.mockClear()
    nudge(0.1)
    nudge(0.1)
    expect(fn).not.toHaveBeenCalled()
    stop()
  })

  it('stops delivering after unsubscribe', () => {
    const fn = vi.fn()
    onCellChange(fn)()
    fn.mockClear()
    goTo(5)
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('orientation', () => {
  it('is the identity at the home cell', () => {
    const m = orientationAt(0, 0, { ...hyperState, calm: true })
    const id = identity4()
    for (let i = 0; i < 16; i++) expect(m[i]).toBeCloseTo(id[i], 9)
  })

  it('is a genuine rotation at every cell and halfway between them', () => {
    for (let i = 0; i <= (CELL_COUNT - 1) * 2; i++) {
      expectRotation(orientationAt(i / 2, 3.1))
    }
  })

  it('brings the chosen cell nearest the 4D eye', () => {
    for (let i = 0; i < CELL_COUNT; i++) {
      const m = orientationAt(i, 0, { ...hyperState, calm: true })
      const depths = CELLS.map((cell) => transform4(m, cell.center)[3])
      expect(depths[i]).toBeCloseTo(Math.max(...depths), 6)
    }
  })

  it('only uses w-planes to navigate, so motion is always through the 4th dimension', () => {
    for (let i = 0; i < CELL_COUNT; i++) {
      const angles = anglesAt(i)
      for (const plane of PLANES) {
        if (plane.includes('w')) continue
        expect(angles[plane] ?? 0).toBe(0)
      }
    }
  })

  it('interpolates continuously, with no jump between neighbours', () => {
    let previous = anglesAt(0)
    for (let t = 0.05; t <= CELL_COUNT - 1; t += 0.05) {
      const next = anglesAt(t)
      for (const plane of PLANES) {
        const delta = Math.abs((next[plane] ?? 0) - (previous[plane] ?? 0))
        // A 20th of a cell can never swing more than a 20th of a quarter turn.
        expect(delta).toBeLessThanOrEqual((Math.PI / 2) * 0.05 + 1e-9)
      }
      previous = next
    }
  })

  it('never takes the long way round to reach a cell', () => {
    // Path length is the magnitude of the combined rotation, so the per-plane
    // deltas combine in quadrature rather than adding up. A move within one
    // plane sweeps π/2; a move that hands off between two w-planes turns both
    // at once and sweeps π/√2. Anything beyond that means an angle was written
    // with a sign that reaches the right orientation the long way, which is the
    // bug this guards: w- as +π instead of -π swept 3π/2, three times the rest.
    const longest = (Math.PI / 2) * Math.SQRT2
    const swept: number[] = []
    for (let i = 0; i < CELL_COUNT - 1; i++) {
      const from = anglesAt(i)
      const to = anglesAt(i + 1)
      let sum = 0
      for (const plane of PLANES) sum += ((to[plane] ?? 0) - (from[plane] ?? 0)) ** 2
      swept.push(Math.sqrt(sum))
    }
    for (const distance of swept) {
      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThanOrEqual(longest + 1e-9)
    }
    // And they are all within a factor of √2 of each other, so no section
    // feels further away than the others.
    expect(Math.max(...swept) / Math.min(...swept)).toBeLessThanOrEqual(Math.SQRT2 + 1e-9)
  })

  it('memoises within a frame but refreshes when state moves', () => {
    hyperState.current = 1
    const a = currentOrientation()
    expect(currentOrientation()).toBe(a)
    hyperState.current = 2
    expect(currentOrientation()).not.toBe(a)
  })

  it('gives the outer lattice its own valid rotation', () => {
    expectRotation(composeOuter({ ...hyperState, clock: 12.5 }))
    expectRotation(composeOuter({ ...hyperState, calm: true }))
  })

  it('drops drift and drag under reduced motion, so nothing moves on its own', () => {
    const calm = { ...hyperState, calm: true, clock: 50, dragX: 0.5, dragY: -0.5 }
    const a = orientationAt(3, 10, calm)
    const b = orientationAt(3, 99, calm)
    for (let i = 0; i < 16; i++) expect(a[i]).toBeCloseTo(b[i], 9)
  })
})

describe('label slots', () => {
  it('provides one slot per cell, hidden until the scene places it', () => {
    expect(labelSlots).toHaveLength(CELL_COUNT)
    for (const slot of labelSlots) {
      expect(Number.isFinite(slot.x)).toBe(true)
      expect(Number.isFinite(slot.y)).toBe(true)
    }
  })
})
