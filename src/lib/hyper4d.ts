// Real 4-dimensional geometry. Nothing here fakes depth with a 3D trick: points
// live in R⁴, rotate in R⁴, and are projected R⁴ -> R³ so three.js can finish
// the job with the usual R³ -> R² camera projection.
//
// The one idea worth holding onto: in 4D you do not rotate *about an axis*, you
// rotate *in a plane*. R³ has 3 coordinate planes and each one has a leftover
// axis to name the rotation after, which is why "rotate about Z" works there.
// R⁴ has 6 coordinate planes and no leftover axis, so rotations are named by the
// plane itself: xy, xz, xw, yz, yw, zw.

/** A point or direction in R⁴. */
export type Vec4 = [number, number, number, number]

/** A 4x4 matrix, row-major, so m[row * 4 + col]. */
export type Mat4 = Float64Array

/** A quaternion a + bi + cj + dk, stored [a, b, c, d]. */
export type Quat = [number, number, number, number]

/** The 6 coordinate planes of R⁴, which are the 6 degrees of rotational freedom. */
export const PLANES = ['xy', 'xz', 'xw', 'yz', 'yw', 'zw'] as const

export type Plane = (typeof PLANES)[number]

/** Which two axes each plane spans. 0=x, 1=y, 2=z, 3=w. */
export const PLANE_AXES: Record<Plane, readonly [number, number]> = {
  xy: [0, 1],
  xz: [0, 2],
  xw: [0, 3],
  yz: [1, 2],
  yw: [1, 3],
  zw: [2, 3],
}

/** The three planes that involve w. Rotating in these is what moves geometry
 *  through the fourth dimension; the other three look like ordinary 3D spin. */
export const W_PLANES: readonly Plane[] = ['xw', 'yw', 'zw']

export type Rotation4 = Partial<Record<Plane, number>>

// --- vector algebra ---------------------------------------------------------

export function dot4(a: Vec4, b: Vec4): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
}

export function length4(a: Vec4): number {
  return Math.hypot(a[0], a[1], a[2], a[3])
}

export function distance4(a: Vec4, b: Vec4): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3])
}

export function normalize4(a: Vec4): Vec4 {
  const len = length4(a)
  if (len === 0) return [0, 0, 0, 0]
  return [a[0] / len, a[1] / len, a[2] / len, a[3] / len]
}

/** There is no binary cross product in R⁴. The analogue takes three vectors and
 *  returns the one direction orthogonal to all of them, via the 4x4 determinant
 *  expanded along the first row. Useful for hyperface normals. */
export function triCross4(a: Vec4, b: Vec4, c: Vec4): Vec4 {
  const det3 = (
    a1: number, a2: number, a3: number,
    b1: number, b2: number, b3: number,
    c1: number, c2: number, c3: number,
  ) => a1 * (b2 * c3 - b3 * c2) - a2 * (b1 * c3 - b3 * c1) + a3 * (b1 * c2 - b2 * c1)

  return [
    +det3(a[1], a[2], a[3], b[1], b[2], b[3], c[1], c[2], c[3]),
    -det3(a[0], a[2], a[3], b[0], b[2], b[3], c[0], c[2], c[3]),
    +det3(a[0], a[1], a[3], b[0], b[1], b[3], c[0], c[1], c[3]),
    -det3(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]),
  ]
}

// --- matrices ---------------------------------------------------------------

export function identity4(): Mat4 {
  const m = new Float64Array(16)
  m[0] = m[5] = m[10] = m[15] = 1
  return m
}

/** A Givens rotation: spins the given plane by `angle` and leaves the two
 *  orthogonal axes untouched. This is the only kind of simple rotation in R⁴. */
export function planeRotation(plane: Plane, angle: number): Mat4 {
  const m = identity4()
  const [i, j] = PLANE_AXES[plane]
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  m[i * 4 + i] = c
  m[i * 4 + j] = -s
  m[j * 4 + i] = s
  m[j * 4 + j] = c
  return m
}

export function multiply4(a: Mat4, b: Mat4): Mat4 {
  const out = new Float64Array(16)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      let sum = 0
      for (let k = 0; k < 4; k++) sum += a[r * 4 + k] * b[k * 4 + c]
      out[r * 4 + c] = sum
    }
  }
  return out
}

export function transpose4(a: Mat4): Mat4 {
  const out = new Float64Array(16)
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) out[c * 4 + r] = a[r * 4 + c]
  return out
}

/** Applies a matrix to a vector. Writes into `out` when given one so the render
 *  loop can run allocation-free. */
export function transform4(m: Mat4, v: Vec4, out: Vec4 = [0, 0, 0, 0]): Vec4 {
  const [x, y, z, w] = v
  out[0] = m[0] * x + m[1] * y + m[2] * z + m[3] * w
  out[1] = m[4] * x + m[5] * y + m[6] * z + m[7] * w
  out[2] = m[8] * x + m[9] * y + m[10] * z + m[11] * w
  out[3] = m[12] * x + m[13] * y + m[14] * z + m[15] * w
  return out
}

/** Composes a rotation from per-plane angles, always in PLANES order so the
 *  result is deterministic. Matrix product is not commutative, so the fixed
 *  order matters for reproducibility. */
export function composeRotation(angles: Rotation4): Mat4 {
  let m = identity4()
  for (const plane of PLANES) {
    const angle = angles[plane]
    if (!angle) continue
    m = multiply4(planeRotation(plane, angle), m)
  }
  return m
}

// --- double rotations -------------------------------------------------------

/** A double rotation turns two *completely orthogonal* planes at once, which is
 *  something R³ cannot do: xy shares no axis at all with zw. When both rates are
 *  equal the rotation is isoclinic, every point moves along a great circle at
 *  the same speed, and the result is the hypnotic "inside becomes outside"
 *  motion that has no 3D equivalent. */
export function doubleRotation(angleA: number, angleB: number, planeA: Plane = 'xy', planeB: Plane = 'zw'): Mat4 {
  return multiply4(planeRotation(planeA, angleA), planeRotation(planeB, angleB))
}

export function isoclinic(angle: number): Mat4 {
  return doubleRotation(angle, angle, 'xy', 'zw')
}

// --- quaternion route into SO(4) -------------------------------------------
// Every rotation of R⁴ can be written v -> qL * v * qR with unit quaternions,
// treating v = (x,y,z,w) as x + yi + zj + wk. That makes smooth interpolation
// between two 4D orientations easy: slerp each quaternion separately.

export function quatMul(p: Quat, q: Quat): Quat {
  const [a1, b1, c1, d1] = p
  const [a2, b2, c2, d2] = q
  return [
    a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2,
    a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2,
    a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2,
    a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2,
  ]
}

export function quatNormalize(q: Quat): Quat {
  const len = Math.hypot(q[0], q[1], q[2], q[3])
  if (len === 0) return [1, 0, 0, 0]
  return [q[0] / len, q[1] / len, q[2] / len, q[3] / len]
}

export function quatSlerp(a: Quat, b: Quat, t: number): Quat {
  let [a0, a1, a2, a3] = quatNormalize(a)
  const [b0, b1, b2, b3] = quatNormalize(b)
  let cos = a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3
  // Take the short way around.
  if (cos < 0) {
    a0 = -a0
    a1 = -a1
    a2 = -a2
    a3 = -a3
    cos = -cos
  }
  if (cos > 0.9995) {
    return quatNormalize([a0 + (b0 - a0) * t, a1 + (b1 - a1) * t, a2 + (b2 - a2) * t, a3 + (b3 - a3) * t])
  }
  const theta = Math.acos(cos)
  const sin = Math.sin(theta)
  const wa = Math.sin((1 - t) * theta) / sin
  const wb = Math.sin(t * theta) / sin
  return [a0 * wa + b0 * wb, a1 * wa + b1 * wb, a2 * wa + b2 * wb, a3 * wa + b3 * wb]
}

/** Builds the matrix for v -> qL * v * qR. */
export function so4Matrix(qL: Quat, qR: Quat): Mat4 {
  const left = quatNormalize(qL)
  const right = quatNormalize(qR)
  const m = new Float64Array(16)
  // Read the matrix off by sending each basis quaternion through the sandwich.
  const basis: Quat[] = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]
  for (let col = 0; col < 4; col++) {
    const image = quatMul(quatMul(left, basis[col]), right)
    for (let row = 0; row < 4; row++) m[row * 4 + col] = image[row]
  }
  return m
}

// --- projection R⁴ -> R³ ----------------------------------------------------

/** A projected point, plus the w information we would otherwise throw away.
 *  `depth` is the raw w; `scale` is how much the projection shrank the point.
 *  Feeding those into colour and line width is what makes the fourth dimension
 *  legible instead of invisible. */
export type Projected = { x: number; y: number; z: number; depth: number; scale: number }

/** Perspective projection from a 4D eye sitting at w = eyeW, looking down the w
 *  axis at our 3-space. Points nearer the eye in w swell; points far away in w
 *  shrink. Exactly analogous to how a 3D perspective camera divides by z. */
export function project4to3(v: Vec4, eyeW = 2.6, out: Projected = { x: 0, y: 0, z: 0, depth: 0, scale: 1 }): Projected {
  // Clamp so a vertex passing through the eye plane cannot divide by zero.
  const denom = Math.max(eyeW - v[3], 1e-3)
  const scale = eyeW / denom
  out.x = v[0] * scale
  out.y = v[1] * scale
  out.z = v[2] * scale
  out.depth = v[3]
  out.scale = scale
  return out
}

/** Stereographic projection from a pole on the w axis. Points on the 3-sphere
 *  map to all of R³ conformally, so the curved cells of a 600-cell come through
 *  as recognisably round shells. The classic way to look at a polytope.
 *
 *  Note the pole is a genuine singularity: a vertex whose w approaches `pole`
 *  is sent toward infinity. With the default pole of 1.0001 a unit-radius
 *  polytope will fling any vertex that rotates near w = 1 off the screen. Use
 *  a pole comfortably outside the circumradius, or use project4to3, whenever
 *  the shape is going to rotate freely. */
export function projectStereographic(v: Vec4, pole = 1.0001, out: Projected = { x: 0, y: 0, z: 0, depth: 0, scale: 1 }): Projected {
  const denom = pole - v[3]
  const scale = 1 / (Math.abs(denom) < 1e-3 ? (denom < 0 ? -1e-3 : 1e-3) : denom)
  out.x = v[0] * scale
  out.y = v[1] * scale
  out.z = v[2] * scale
  out.depth = v[3]
  out.scale = scale
  return out
}

export type ProjectionMode = 'perspective' | 'stereographic'

// --- deterministic randomness ----------------------------------------------

/** A small, fast PRNG (mulberry32). Scene data like per-edge jitter is built
 *  during render, so it has to be reproducible: drawing from Math.random would
 *  hand back different geometry on every re-render and make the shape flicker.
 *  Same seed, same scene, every time. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A point drawn uniformly from the 3-sphere, via a normalised 4D Gaussian.
 *  Normalising a uniform cube instead would bunch points toward the corners. */
export function sampleThreeSphere(random: () => number): Vec4 {
  const gauss = () => {
    const u = Math.max(random(), 1e-9)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random())
  }
  const v: Vec4 = [gauss(), gauss(), gauss(), gauss()]
  const len = length4(v) || 1
  return [v[0] / len, v[1] / len, v[2] / len, v[3] / len]
}

// --- polytopes --------------------------------------------------------------

export type Polytope = {
  name: string
  /** Vertices in R⁴. */
  vertices: Vec4[]
  /** Index pairs, each listed once with a < b. */
  edges: [number, number][]
  /** Circumradius, so different polytopes can be shown at a comparable size. */
  radius: number
}

/** Connects every pair of vertices separated by the shortest distance present
 *  in the set. For a regular polytope that is exactly its edge set, so one
 *  routine builds edges correctly for all of them. */
export function edgesByMinDistance(vertices: Vec4[], tolerance = 1e-6): [number, number][] {
  let min = Infinity
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const d = distance4(vertices[i], vertices[j])
      if (d > tolerance && d < min) min = d
    }
  }
  const edges: [number, number][] = []
  const limit = min * (1 + 1e-6) + tolerance
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      if (distance4(vertices[i], vertices[j]) <= limit) edges.push([i, j])
    }
  }
  return edges
}

/** The 5-cell, the 4D simplex: the simplest closed shape in R⁴, the way a
 *  tetrahedron is in R³. 5 vertices, 10 edges, 5 tetrahedral cells. */
export function fiveCell(): Polytope {
  // Five mutually equidistant points, built from the standard simplex trick.
  const raw: Vec4[] = [
    [1, 1, 1, -1 / Math.sqrt(5)],
    [1, -1, -1, -1 / Math.sqrt(5)],
    [-1, 1, -1, -1 / Math.sqrt(5)],
    [-1, -1, 1, -1 / Math.sqrt(5)],
    [0, 0, 0, Math.sqrt(5) - 1 / Math.sqrt(5)],
  ]
  const vertices = raw.map((v) => normalize4(v))
  return { name: '5-cell', vertices, edges: edgesByMinDistance(vertices), radius: 1 }
}

/** The tesseract, or 8-cell: the 4D cube. 16 vertices at every (±1,±1,±1,±1),
 *  32 edges, 24 square faces, and 8 cubic cells. */
export function tesseract(): Polytope {
  const vertices: Vec4[] = []
  for (let i = 0; i < 16; i++) {
    vertices.push([i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1])
  }
  // Two corners of a hypercube are joined exactly when they differ in one
  // coordinate, which is Hamming distance 1 on the bit pattern above.
  const edges: [number, number][] = []
  for (let i = 0; i < 16; i++) {
    for (let bit = 0; bit < 4; bit++) {
      const j = i ^ (1 << bit)
      if (j > i) edges.push([i, j])
    }
  }
  return { name: 'tesseract', vertices, edges, radius: 2 }
}

/** The 16-cell, dual of the tesseract: 8 vertices at ±1 on each axis, joined to
 *  everything except their own antipode. 24 edges, 16 tetrahedral cells. */
export function sixteenCell(): Polytope {
  const vertices: Vec4[] = []
  for (let axis = 0; axis < 4; axis++) {
    for (const sign of [1, -1]) {
      const v: Vec4 = [0, 0, 0, 0]
      v[axis] = sign
      vertices.push(v)
    }
  }
  return { name: '16-cell', vertices, edges: edgesByMinDistance(vertices), radius: 1 }
}

/** The 24-cell: all permutations of (±1,±1,0,0). It is self-dual and has no
 *  analogue in any other dimension, 3D or above. 24 vertices, 96 edges. */
export function twentyFourCell(): Polytope {
  const vertices: Vec4[] = []
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      for (const si of [1, -1]) {
        for (const sj of [1, -1]) {
          const v: Vec4 = [0, 0, 0, 0]
          v[i] = si
          v[j] = sj
          vertices.push(v)
        }
      }
    }
  }
  return { name: '24-cell', vertices, edges: edgesByMinDistance(vertices), radius: Math.SQRT2 }
}

const PHI = (1 + Math.sqrt(5)) / 2

/** Every permutation of [0,1,2,3] that is even, i.e. reachable by an even
 *  number of swaps. These 12 are the alternating group A₄. */
function evenPermutations(): number[][] {
  const out: number[][] = []
  const items = [0, 1, 2, 3]
  const permute = (arr: number[], k: number) => {
    if (k === arr.length) {
      // Count inversions to get the parity of this permutation.
      let inversions = 0
      for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) if (arr[i] > arr[j]) inversions++
      if (inversions % 2 === 0) out.push([...arr])
      return
    }
    for (let i = k; i < arr.length; i++) {
      const next = [...arr]
      ;[next[k], next[i]] = [next[i], next[k]]
      permute(next, k + 1)
    }
  }
  permute(items, 0)
  return out
}

/** The 600-cell: 120 vertices, 720 edges, 600 tetrahedral cells. Its vertices
 *  are the unit icosians, the binary icosahedral group of unit quaternions, so
 *  this shape literally *is* a group. The most intricate 4D object that still
 *  renders at 60fps, and the reason this scene exists. */
export function sixHundredCell(): Polytope {
  const seen = new Set<string>()
  const vertices: Vec4[] = []
  const push = (v: Vec4) => {
    // De-duplicate on rounded coordinates, since the three families overlap.
    const key = v.map((n) => (Math.abs(n) < 1e-9 ? 0 : +n.toFixed(6))).join(',')
    if (seen.has(key)) return
    seen.add(key)
    vertices.push(v)
  }

  // 8 vertices: the 16-cell, (±1,0,0,0) and friends.
  for (let axis = 0; axis < 4; axis++) {
    for (const sign of [1, -1]) {
      const v: Vec4 = [0, 0, 0, 0]
      v[axis] = sign
      push(v)
    }
  }
  // 16 vertices: the tesseract corners at (±½,±½,±½,±½).
  for (let i = 0; i < 16; i++) {
    push([i & 1 ? 0.5 : -0.5, i & 2 ? 0.5 : -0.5, i & 4 ? 0.5 : -0.5, i & 8 ? 0.5 : -0.5])
  }
  // 96 vertices: even permutations of (±φ/2, ±½, ±1/(2φ), 0).
  const magnitudes = [PHI / 2, 0.5, 1 / (2 * PHI), 0]
  for (const perm of evenPermutations()) {
    for (let signs = 0; signs < 8; signs++) {
      const v: Vec4 = [0, 0, 0, 0]
      let signIndex = 0
      for (let slot = 0; slot < 4; slot++) {
        const magnitude = magnitudes[perm[slot]]
        if (magnitude === 0) {
          v[slot] = 0
        } else {
          v[slot] = signs & (1 << signIndex) ? magnitude : -magnitude
          signIndex++
        }
      }
      push(v)
    }
  }

  return { name: '600-cell', vertices, edges: edgesByMinDistance(vertices, 1e-9), radius: 1 }
}

/** Every polytope, cheapest first, keyed by the name used in the UI. */
export const POLYTOPES = {
  '5-cell': fiveCell,
  tesseract,
  '16-cell': sixteenCell,
  '24-cell': twentyFourCell,
  '600-cell': sixHundredCell,
} as const

export type PolytopeName = keyof typeof POLYTOPES

// --- the tesseract's 8 cells ------------------------------------------------

export type HyperCell = {
  /** Which axis is held constant, 0=x 1=y 2=z 3=w. */
  axis: number
  sign: 1 | -1
  /** The 8 vertex indices of this cubic cell. */
  vertices: number[]
  /** The cell's centre in R⁴, which is the unit vector along its fixed axis. */
  center: Vec4
}

/** A tesseract is bounded by 8 cubes, one for each choice of "hold one of the 4
 *  coordinates at +1 or -1". The site has exactly 8 sections, so each section
 *  gets a cell, and scrolling rotates that cell into our 3-space. */
export function tesseractCells(shape: Polytope = tesseract()): HyperCell[] {
  const cells: HyperCell[] = []
  for (let axis = 0; axis < 4; axis++) {
    for (const sign of [1, -1] as const) {
      const vertices: number[] = []
      shape.vertices.forEach((v, index) => {
        if (v[axis] === sign) vertices.push(index)
      })
      const center: Vec4 = [0, 0, 0, 0]
      center[axis] = sign
      cells.push({ axis, sign, vertices, center })
    }
  }
  return cells
}

/** The rotation that swings `cell` toward the viewer, used to turn a scroll
 *  position into a 4D orientation. Rotating the cell's fixed axis onto -w puts
 *  that cube nearest the 4D eye, so it reads as the front-most cell. */
export function rotationFacingCell(cell: HyperCell, amount = 1): Mat4 {
  // The w cells already sit along w; they only need a half turn when negative.
  if (cell.axis === 3) {
    return cell.sign === 1 ? identity4() : planeRotation('zw', Math.PI * amount)
  }
  const plane = (['xw', 'yw', 'zw'] as const)[cell.axis]
  const quarter = (Math.PI / 2) * cell.sign * amount
  return planeRotation(plane, quarter)
}
