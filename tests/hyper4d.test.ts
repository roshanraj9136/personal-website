import { describe, expect, it } from 'vitest'
import {
  PLANES,
  PLANE_AXES,
  composeRotation,
  distance4,
  dot4,
  doubleRotation,
  edgesByMinDistance,
  fiveCell,
  identity4,
  isoclinic,
  length4,
  multiply4,
  planeRotation,
  project4to3,
  projectStereographic,
  quatSlerp,
  rotationFacingCell,
  sixHundredCell,
  sixteenCell,
  so4Matrix,
  tesseract,
  tesseractCells,
  transform4,
  transpose4,
  triCross4,
  twentyFourCell,
  type Mat4,
  type Polytope,
  type Vec4,
} from '../src/lib/hyper4d'

const CLOSE = 1e-9

function determinant4(m: Mat4): number {
  // Laplace expansion along the first row.
  const minor = (skipRow: number, skipCol: number) => {
    const vals: number[] = []
    for (let r = 0; r < 4; r++) {
      if (r === skipRow) continue
      for (let c = 0; c < 4; c++) {
        if (c === skipCol) continue
        vals.push(m[r * 4 + c])
      }
    }
    const [a, b, c, d, e, f, g, h, i] = vals
    return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)
  }
  let det = 0
  for (let c = 0; c < 4; c++) det += (c % 2 ? -1 : 1) * m[c] * minor(0, c)
  return det
}

function expectOrthogonal(m: Mat4) {
  const product = multiply4(m, transpose4(m))
  const id = identity4()
  for (let i = 0; i < 16; i++) expect(product[i]).toBeCloseTo(id[i], 9)
  // A rotation, not a reflection.
  expect(determinant4(m)).toBeCloseTo(1, 9)
}

function degrees(shape: Polytope): number[] {
  const counts = new Array(shape.vertices.length).fill(0)
  for (const [a, b] of shape.edges) {
    counts[a]++
    counts[b]++
  }
  return counts
}

describe('plane rotations', () => {
  it('spins all 6 coordinate planes of R⁴', () => {
    expect(PLANES).toHaveLength(6)
    expect(new Set(PLANES).size).toBe(6)
  })

  it('is orthogonal with unit determinant for every plane', () => {
    for (const plane of PLANES) expectOrthogonal(planeRotation(plane, 0.7))
  })

  it('preserves length, so geometry never distorts', () => {
    const v: Vec4 = [0.3, -1.4, 2.2, 0.9]
    const before = length4(v)
    for (const plane of PLANES) {
      const out = transform4(planeRotation(plane, 1.1), v)
      expect(length4(out)).toBeCloseTo(before, 9)
    }
  })

  it('leaves the two axes outside the plane untouched', () => {
    const v: Vec4 = [1, 2, 3, 4]
    for (const plane of PLANES) {
      const [i, j] = PLANE_AXES[plane]
      const out = transform4(planeRotation(plane, 0.9), v)
      for (let axis = 0; axis < 4; axis++) {
        if (axis === i || axis === j) continue
        expect(out[axis]).toBeCloseTo(v[axis], 9)
      }
    }
  })

  it('only moves a point through w when the plane includes w', () => {
    const v: Vec4 = [1, 1, 1, 0]
    for (const plane of PLANES) {
      const out = transform4(planeRotation(plane, 0.5), v)
      const touchesW = PLANE_AXES[plane].includes(3)
      if (touchesW) expect(Math.abs(out[3])).toBeGreaterThan(1e-3)
      else expect(out[3]).toBeCloseTo(0, 9)
    }
  })

  it('returns to the identity after a full turn', () => {
    const m = planeRotation('xw', Math.PI * 2)
    const id = identity4()
    for (let i = 0; i < 16; i++) expect(m[i]).toBeCloseTo(id[i], 9)
  })
})

describe('double and isoclinic rotations', () => {
  it('turns two completely orthogonal planes at once', () => {
    const m = doubleRotation(0.4, 1.3, 'xy', 'zw')
    expectOrthogonal(m)
    // xy and zw share no axis, so each pair transforms independently.
    const onXY = transform4(m, [1, 0, 0, 0])
    expect(onXY[2]).toBeCloseTo(0, 9)
    expect(onXY[3]).toBeCloseTo(0, 9)
    const onZW = transform4(m, [0, 0, 1, 0])
    expect(onZW[0]).toBeCloseTo(0, 9)
    expect(onZW[1]).toBeCloseTo(0, 9)
  })

  it('moves every point at the same rate when isoclinic', () => {
    const m = isoclinic(0.6)
    expectOrthogonal(m)
    // Two points in different planes rotate through an equal angle.
    const a: Vec4 = [1, 0, 0, 0]
    const b: Vec4 = [0, 0, 1, 0]
    const angleA = Math.acos(dot4(a, transform4(m, a)))
    const angleB = Math.acos(dot4(b, transform4(m, b)))
    expect(angleA).toBeCloseTo(angleB, 9)
    expect(angleA).toBeCloseTo(0.6, 9)
  })
})

describe('composeRotation', () => {
  it('is deterministic and orthogonal', () => {
    const angles = { xy: 0.3, xw: -0.8, zw: 1.2, yz: 0.5 }
    const first = composeRotation(angles)
    const second = composeRotation(angles)
    expect(Array.from(first)).toEqual(Array.from(second))
    expectOrthogonal(first)
  })

  it('ignores zero and missing angles', () => {
    const m = composeRotation({ xy: 0, xw: undefined })
    const id = identity4()
    for (let i = 0; i < 16; i++) expect(m[i]).toBeCloseTo(id[i], 9)
  })
})

describe('triCross4', () => {
  it('returns a direction orthogonal to all three inputs', () => {
    const a: Vec4 = [1, 0, 0, 0]
    const b: Vec4 = [0, 1, 0, 0]
    const c: Vec4 = [0, 0, 1, 0]
    const n = triCross4(a, b, c)
    expect(dot4(n, a)).toBeCloseTo(0, 9)
    expect(dot4(n, b)).toBeCloseTo(0, 9)
    expect(dot4(n, c)).toBeCloseTo(0, 9)
    expect(Math.abs(n[3])).toBeCloseTo(1, 9)
  })

  it('works on a skewed basis too', () => {
    const a: Vec4 = [1, 2, 0, 1]
    const b: Vec4 = [0, 1, 3, -1]
    const c: Vec4 = [2, 0, 1, 1]
    const n = triCross4(a, b, c)
    expect(dot4(n, a)).toBeCloseTo(0, 6)
    expect(dot4(n, b)).toBeCloseTo(0, 6)
    expect(dot4(n, c)).toBeCloseTo(0, 6)
    expect(length4(n)).toBeGreaterThan(CLOSE)
  })
})

describe('SO(4) via quaternion pairs', () => {
  it('gives the identity for unit quaternions', () => {
    const m = so4Matrix([1, 0, 0, 0], [1, 0, 0, 0])
    const id = identity4()
    for (let i = 0; i < 16; i++) expect(m[i]).toBeCloseTo(id[i], 9)
  })

  it('produces a genuine rotation for arbitrary quaternion pairs', () => {
    expectOrthogonal(so4Matrix([0.5, 0.5, 0.5, 0.5], [Math.SQRT1_2, 0, Math.SQRT1_2, 0]))
    expectOrthogonal(so4Matrix([1, 2, 3, 4], [-2, 1, 0.5, 3]))
  })

  it('slerps between orientations and hits both endpoints', () => {
    const a = quatSlerp([1, 0, 0, 0], [0, 1, 0, 0], 0)
    const b = quatSlerp([1, 0, 0, 0], [0, 1, 0, 0], 1)
    expect(a[0]).toBeCloseTo(1, 9)
    expect(b[1]).toBeCloseTo(1, 9)
    // Halfway stays on the unit sphere.
    const mid = quatSlerp([1, 0, 0, 0], [0, 1, 0, 0], 0.5)
    expect(Math.hypot(...mid)).toBeCloseTo(1, 9)
  })
})

describe('projection R⁴ -> R³', () => {
  it('is the identity on our own 3-space slice', () => {
    const p = project4to3([1, -2, 3, 0], 2.6)
    expect(p.x).toBeCloseTo(1, 9)
    expect(p.y).toBeCloseTo(-2, 9)
    expect(p.z).toBeCloseTo(3, 9)
    expect(p.scale).toBeCloseTo(1, 9)
  })

  it('swells points nearer the 4D eye and shrinks far ones', () => {
    const near = project4to3([1, 0, 0, 1], 2.6)
    const far = project4to3([1, 0, 0, -1], 2.6)
    expect(near.scale).toBeGreaterThan(1)
    expect(far.scale).toBeLessThan(1)
    expect(near.x).toBeGreaterThan(far.x)
  })

  it('never divides by zero when a vertex crosses the eye plane', () => {
    const p = project4to3([1, 1, 1, 2.6], 2.6)
    expect(Number.isFinite(p.x)).toBe(true)
    expect(Number.isFinite(p.scale)).toBe(true)
  })

  it('keeps w available for shading', () => {
    expect(project4to3([0, 0, 0, 0.42], 2.6).depth).toBeCloseTo(0.42, 9)
  })

  it('projects the 3-sphere stereographically without blowing up at the pole', () => {
    const p = projectStereographic([0, 0, 0, 1], 1.0001)
    expect(Number.isFinite(p.x)).toBe(true)
    const equator = projectStereographic([1, 0, 0, 0], 1.0001)
    expect(equator.x).toBeCloseTo(1, 3)
  })
})

describe('edgesByMinDistance', () => {
  it('connects only the closest pairs', () => {
    // A unit square plus one far point: 4 short edges, nothing to the outlier.
    const square: Vec4[] = [
      [0, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [9, 9, 0, 0],
    ]
    expect(edgesByMinDistance(square)).toHaveLength(4)
  })

  it('lists each edge once with a < b', () => {
    for (const [a, b] of tesseract().edges) expect(a).toBeLessThan(b)
  })
})

// The defining counts of the six regular 4-polytopes. If a generator drifts,
// these numbers are what catch it.
const EXPECTED = [
  { shape: fiveCell(), vertices: 5, edges: 10, degree: 4 },
  { shape: tesseract(), vertices: 16, edges: 32, degree: 4 },
  { shape: sixteenCell(), vertices: 8, edges: 24, degree: 6 },
  { shape: twentyFourCell(), vertices: 24, edges: 96, degree: 8 },
  { shape: sixHundredCell(), vertices: 120, edges: 720, degree: 12 },
]

describe.each(EXPECTED)('$shape.name', ({ shape, vertices, edges, degree }) => {
  it(`has ${vertices} vertices and ${edges} edges`, () => {
    expect(shape.vertices).toHaveLength(vertices)
    expect(shape.edges).toHaveLength(edges)
  })

  it('has no duplicate vertices', () => {
    const keys = new Set(shape.vertices.map((v) => v.map((n) => n.toFixed(6)).join(',')))
    expect(keys.size).toBe(vertices)
  })

  it('is vertex-transitive, every vertex has the same degree', () => {
    for (const d of degrees(shape)) expect(d).toBe(degree)
  })

  it('inscribes in a 3-sphere, all vertices equidistant from the origin', () => {
    const r = length4(shape.vertices[0])
    for (const v of shape.vertices) expect(length4(v)).toBeCloseTo(r, 6)
    expect(r).toBeCloseTo(shape.radius, 6)
  })

  it('is regular, every edge the same length', () => {
    const first = distance4(shape.vertices[shape.edges[0][0]], shape.vertices[shape.edges[0][1]])
    for (const [a, b] of shape.edges) {
      expect(distance4(shape.vertices[a], shape.vertices[b])).toBeCloseTo(first, 6)
    }
  })

  it('is connected', () => {
    const adjacency = new Map<number, number[]>()
    for (const [a, b] of shape.edges) {
      if (!adjacency.has(a)) adjacency.set(a, [])
      if (!adjacency.has(b)) adjacency.set(b, [])
      adjacency.get(a)!.push(b)
      adjacency.get(b)!.push(a)
    }
    const seen = new Set<number>([0])
    const queue = [0]
    while (queue.length) {
      for (const next of adjacency.get(queue.pop()!) ?? []) {
        if (seen.has(next)) continue
        seen.add(next)
        queue.push(next)
      }
    }
    expect(seen.size).toBe(vertices)
  })

  it('survives a 4D rotation with its edge lengths intact', () => {
    const m = composeRotation({ xw: 0.6, yw: -0.3, zw: 1.1, xy: 0.2 })
    const moved = shape.vertices.map((v) => transform4(m, v))
    const first = distance4(moved[shape.edges[0][0]], moved[shape.edges[0][1]])
    for (const [a, b] of shape.edges) expect(distance4(moved[a], moved[b])).toBeCloseTo(first, 6)
  })
})

describe('the 600-cell is the icosian group', () => {
  it('has the golden ratio in its coordinates', () => {
    const phi = (1 + Math.sqrt(5)) / 2
    const coords = sixHundredCell().vertices.flat().map(Math.abs)
    expect(coords.some((c) => Math.abs(c - phi / 2) < 1e-9)).toBe(true)
    expect(coords.some((c) => Math.abs(c - 1 / (2 * phi)) < 1e-9)).toBe(true)
  })

  it('is closed under negation, as a group of unit quaternions must be', () => {
    const shape = sixHundredCell()
    const keys = new Set(shape.vertices.map((v) => v.map((n) => (Math.abs(n) < 1e-9 ? 0 : +n.toFixed(6))).join(',')))
    for (const v of shape.vertices) {
      const negated = v.map((n) => (Math.abs(n) < 1e-9 ? 0 : +(-n).toFixed(6))).join(',')
      expect(keys.has(negated)).toBe(true)
    }
  })
})

describe('the tesseract 8 cells, one per site section', () => {
  const cells = tesseractCells()

  it('finds exactly 8 cubic cells', () => {
    expect(cells).toHaveLength(8)
  })

  it('gives every cell 8 corners, since each cell is a cube', () => {
    for (const cell of cells) expect(cell.vertices).toHaveLength(8)
  })

  it('covers all 16 vertices twice over, 4 cells meeting at each corner', () => {
    const hits = new Array(16).fill(0)
    for (const cell of cells) for (const v of cell.vertices) hits[v]++
    for (const count of hits) expect(count).toBe(4)
  })

  it('places opposite cells antipodally', () => {
    for (let axis = 0; axis < 4; axis++) {
      const positive = cells.find((c) => c.axis === axis && c.sign === 1)!
      const negative = cells.find((c) => c.axis === axis && c.sign === -1)!
      expect(positive.vertices.some((v) => negative.vertices.includes(v))).toBe(false)
      expect(dot4(positive.center, negative.center)).toBeCloseTo(-1, 9)
    }
  })

  it('rotates each cell toward the viewer without distortion', () => {
    for (const cell of cells) expectOrthogonal(rotationFacingCell(cell))
  })

  it('actually brings the chosen cell nearest the 4D eye', () => {
    const shape = tesseract()
    for (const cell of cells) {
      const m = rotationFacingCell(cell)
      // The cell centre should end up with the largest w of all 8 centres.
      const movedW = cells.map((c) => transform4(m, c.center)[3])
      const own = transform4(m, cell.center)[3]
      expect(own).toBeCloseTo(Math.max(...movedW), 6)
      // And the cell's own corners should average a higher w than the rest.
      const all = shape.vertices.map((v) => transform4(m, v))
      const inside = cell.vertices.reduce((sum, i) => sum + all[i][3], 0) / 8
      const outside = all.reduce((sum, v) => sum + v[3], 0) / 16
      expect(inside).toBeGreaterThan(outside)
    }
  })
})
