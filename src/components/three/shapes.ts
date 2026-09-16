// Procedural point clouds, one per stage of the page. Every shape writes
// (x, y, z, w) for each particle, where w = slot + flow:
//   slot (0-3)  picks one of the stage's four palette colors,
//   flow (0-1)  is the particle's position along a path; the shader sends
//               bright pulses toward increasing flow (signals, requests, merges).
// Each shape is shuffled, so particle i travels between random positions when
// the page morphs from one shape to the next.

export const STAGE_COUNT = 8

type Vec3 = [number, number, number]
type Rng = () => number

const TAU = Math.PI * 2

function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(rnd: Rng) {
  let u = 0
  while (u === 0) u = rnd()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * rnd())
}

function unit(rnd: Rng): Vec3 {
  const z = rnd() * 2 - 1
  const a = rnd() * TAU
  const r = Math.sqrt(1 - z * z)
  return [r * Math.cos(a), r * Math.sin(a), z]
}

function rotateX([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [x, y * c - z * s, y * s + z * c]
}

function rotateZ([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [x * c - y * s, x * s + y * c, z]
}

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function quadratic(a: Vec3, c: Vec3, b: Vec3, t: number): Vec3 {
  return lerp3(lerp3(a, c, t), lerp3(c, b, t), t)
}

function cubic(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  return quadratic(lerp3(p0, p1, t), lerp3(p1, p2, t), lerp3(p2, p3, t), t)
}

/** Split n into integer parts proportional to weights that sum exactly to n. */
function split(n: number, weights: number[]): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0)
  const parts = weights.map((w) => Math.floor((n * w) / total))
  let rest = n - parts.reduce((sum, p) => sum + p, 0)
  for (let i = 0; rest > 0; i = (i + 1) % parts.length, rest--) parts[i]++
  return parts
}

/** Returns a sampler that picks an index with probability proportional to its weight. */
function weighted(weights: number[], rnd: Rng) {
  const cumulative: number[] = []
  let sum = 0
  for (const w of weights) cumulative.push((sum += w))
  return () => {
    const r = rnd() * sum
    let lo = 0
    let hi = cumulative.length - 1
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (cumulative[mid] < r) lo = mid + 1
      else hi = mid
    }
    return lo
  }
}

class Writer {
  count = 0
  constructor(private readonly buf: Float32Array) {}

  emit(p: Vec3, slot: number, flow: number) {
    const o = this.count * 4
    this.buf[o] = p[0]
    this.buf[o + 1] = p[1]
    this.buf[o + 2] = p[2]
    this.buf[o + 3] = slot + (flow - Math.floor(flow)) * 0.998
    this.count++
  }
}

function sphereAt(center: Vec3, radius: number, rnd: Rng): Vec3 {
  const [x, y, z] = unit(rnd)
  const r = radius * (0.82 + rnd() * 0.18)
  return [center[0] + x * r, center[1] + y * r, center[2] + z * r]
}

// 0 and 7: a glowing core with orbital rings (hero and contact).
function core(w: Writer, n: number, rnd: Rng, rings: { tiltX: number; tiltZ: number; radius: number; slot: number }[]) {
  const [shell, inner, ring, dust] = split(n, [0.58, 0.12, 0.25, 0.05])
  const R = 2.2
  const golden = Math.PI * (3 - Math.sqrt(5))

  for (let k = 0; k < shell; k++) {
    const y = 1 - (2 * (k + 0.5)) / shell
    const r = Math.sqrt(1 - y * y)
    const theta = k * golden
    const j = R * (1 + gauss(rnd) * 0.015)
    const band = y > 0.3 ? 0 : y < -0.3 ? 1 : rnd() < 0.5 ? 0 : 1
    w.emit([Math.cos(theta) * r * j, y * j, Math.sin(theta) * r * j], rnd() < 0.1 ? 2 : band, (theta % TAU) / TAU)
  }
  for (let k = 0; k < inner; k++) {
    const [x, y, z] = unit(rnd)
    const r = 0.95 * Math.pow(rnd(), 2)
    w.emit([x * r, y * r, z * r], 2, rnd())
  }
  const perRing = split(ring, rings.map(() => 1))
  rings.forEach((spec, i) => {
    for (let k = 0; k < perRing[i]; k++) {
      const a = rnd() * TAU
      const rr = spec.radius + gauss(rnd) * 0.05
      const p = rotateZ(rotateX([Math.cos(a) * rr, gauss(rnd) * 0.025, Math.sin(a) * rr], spec.tiltX), spec.tiltZ)
      w.emit(p, spec.slot, a / TAU)
    }
  })
  for (let k = 0; k < dust; k++) {
    const [x, y, z] = unit(rnd)
    const r = 3.6 + rnd() * 2.6
    w.emit([x * r, y * r, z * r], 3, rnd())
  }
}

// 1: NISHAD. Three PPG waveforms, one per LED wavelength, over an oscilloscope grid.
function ppg(w: Writer, n: number, rnd: Rng) {
  const [ribbons, grid] = split(n, [0.86, 0.14])
  const lanes = [
    { slot: 0, y: 1.05, z: -0.55, amp: 0.62, phase: 0 }, // 590 nm
    { slot: 1, y: 0, z: 0, amp: 0.78, phase: 0.07 }, // 610 nm
    { slot: 2, y: -1.05, z: 0.55, amp: 0.95, phase: 0.14 }, // 660 nm
  ]
  const X = 3.3
  const period = 1.55
  // One heartbeat: a sharp systolic peak and a smaller dicrotic wave.
  const beat = (x: number, phase: number) => {
    const ph = (((x / period + phase) % 1) + 1) % 1
    return Math.exp(-(((ph - 0.18) / 0.07) ** 2)) + 0.38 * Math.exp(-(((ph - 0.43) / 0.09) ** 2)) - 0.2
  }
  const perLane = split(ribbons, [1, 1, 1])
  lanes.forEach((lane, i) => {
    for (let k = 0; k < perLane[i]; k++) {
      const x = -X + rnd() * 2 * X
      const y = lane.y + beat(x, lane.phase) * lane.amp + 0.06 * Math.sin(x * 0.9) + gauss(rnd) * 0.018
      w.emit([x, y, lane.z + gauss(rnd) * 0.05], lane.slot, (x + X) / (2 * X))
    }
  })
  for (let k = 0; k < grid; k++) {
    if (rnd() < 0.5) {
      w.emit([-3.2 + Math.round(rnd() * 16) * 0.4, -2 + rnd() * 4, -1.4], 3, rnd())
    } else {
      w.emit([-3.4 + rnd() * 6.8, -2 + Math.round(rnd() * 8) * 0.5, -1.4], 3, rnd())
    }
  }
}

// 2: MiniLang. An abstract syntax tree; pulses run from the root to the leaves.
function tree(w: Writer, n: number, rnd: Rng) {
  const depth = 5
  const width = 6.4
  const nodes: { p: Vec3; level: number }[] = []
  for (let level = 0; level < depth; level++) {
    const count = 2 ** level
    for (let i = 0; i < count; i++) {
      const x = ((i + 0.5) / count - 0.5) * width
      const z = level === 0 ? 0 : Math.sin(i * 1.7 + level * 0.9) * 0.9
      nodes.push({ p: [x, 2.5 - level * 1.25, z], level })
    }
  }
  const index = (level: number, i: number) => 2 ** level - 1 + i
  const edges: [number, number][] = []
  for (let level = 0; level < depth - 1; level++) {
    for (let i = 0; i < 2 ** level; i++) {
      edges.push([index(level, i), index(level + 1, 2 * i)], [index(level, i), index(level + 1, 2 * i + 1)])
    }
  }
  const slotFor = (level: number) => (level <= 1 ? 0 : level <= 3 ? 1 : 2)
  const radius = (level: number) => 0.26 - level * 0.035
  const [nodePoints, edgePoints, dust] = split(n, [0.34, 0.58, 0.08])

  const pickNode = weighted(nodes.map((node) => radius(node.level) ** 2), rnd)
  for (let k = 0; k < nodePoints; k++) {
    const node = nodes[pickNode()]
    w.emit(sphereAt(node.p, radius(node.level), rnd), slotFor(node.level), (node.level + 0.5) / depth)
  }
  const pickEdge = weighted(
    edges.map(([a, b]) => Math.hypot(nodes[b].p[0] - nodes[a].p[0], nodes[b].p[1] - nodes[a].p[1], nodes[b].p[2] - nodes[a].p[2])),
    rnd,
  )
  for (let k = 0; k < edgePoints; k++) {
    const [a, b] = edges[pickEdge()]
    const t = rnd()
    const p = lerp3(nodes[a].p, nodes[b].p, t)
    w.emit([p[0] + gauss(rnd) * 0.012, p[1] + gauss(rnd) * 0.012, p[2] + gauss(rnd) * 0.012], slotFor(nodes[a].level), (nodes[a].level + t) / depth)
  }
  for (let k = 0; k < dust; k++) {
    w.emit([(rnd() - 0.5) * 7.2, (rnd() - 0.5) * 6, (rnd() - 0.5) * 2.5], 3, rnd())
  }
}

// 3: Load balancer. Clients -> load balancer -> 3 backends -> PostgreSQL.
// Slot 3 is backend 2; its color is animated so it periodically fails health checks.
function network(w: Writer, n: number, rnd: Rng) {
  const clients: Vec3[] = Array.from({ length: 7 }, (_, i) => [-3.5, -2.1 + i * 0.7, i % 2 ? 0.25 : -0.25])
  const lb: Vec3 = [-1.35, 0, 0]
  const backends: Vec3[] = [
    [1.05, 1.75, -0.2],
    [1.05, 0, 0.25],
    [1.05, -1.75, -0.2],
  ]
  const db: Vec3 = [3.35, 0, 0]
  const backendSlot = (i: number) => (i === 1 ? 3 : 0)
  const [clientPts, lbPts, backendPts, dbPts, inEdges, lbEdges, dbEdges, dust] = split(n, [0.05, 0.1, 0.21, 0.09, 0.12, 0.2, 0.17, 0.06])

  for (let k = 0; k < clientPts; k++) {
    w.emit(sphereAt(clients[Math.floor(rnd() * clients.length)], 0.1, rnd), 1, 0)
  }
  for (let k = 0; k < lbPts; k++) {
    // Octahedron surface: random face, uniform barycentric point.
    let u = rnd()
    let v = rnd()
    if (u + v > 1) {
      u = 1 - u
      v = 1 - v
    }
    const s = 0.5
    const sx = rnd() < 0.5 ? -1 : 1
    const sy = rnd() < 0.5 ? -1 : 1
    const sz = rnd() < 0.5 ? -1 : 1
    w.emit([lb[0] + sx * u * s, lb[1] + sy * v * s, lb[2] + sz * (1 - u - v) * s], 0, 0.33)
  }
  const half: Vec3 = [0.34, 0.23, 0.23]
  for (let k = 0; k < backendPts; k++) {
    const b = Math.floor(rnd() * 3)
    const c = backends[b]
    let p: Vec3
    if (rnd() < 0.62) {
      // Box edges, so each server reads as a wireframe rack.
      const axis = Math.floor(rnd() * 3)
      const t = rnd() * 2 - 1
      const s1 = rnd() < 0.5 ? -1 : 1
      const s2 = rnd() < 0.5 ? -1 : 1
      p = axis === 0 ? [t * half[0], s1 * half[1], s2 * half[2]] : axis === 1 ? [s1 * half[0], t * half[1], s2 * half[2]] : [s1 * half[0], s2 * half[1], t * half[2]]
    } else {
      // Front face with three horizontal drive-bay lines.
      p = [(rnd() * 2 - 1) * half[0], (Math.floor(rnd() * 3) - 1) * 0.1, half[2]]
    }
    w.emit([c[0] + p[0], c[1] + p[1], c[2] + p[2]], backendSlot(b), 0.66)
  }
  for (let k = 0; k < dbPts; k++) {
    const a = rnd() * TAU
    const r = 0.42
    const ring = rnd() < 0.55
    const y = ring ? (Math.floor(rnd() * 3) - 1) * 0.45 : (rnd() - 0.5) * 0.9
    w.emit([db[0] + Math.cos(a) * r, db[1] + y, db[2] + Math.sin(a) * r], 2, 0.99)
  }
  for (let k = 0; k < inEdges; k++) {
    const from = clients[Math.floor(rnd() * clients.length)]
    const t = rnd()
    const control: Vec3 = [(from[0] + lb[0]) / 2, from[1] * 0.6, 0]
    w.emit(quadratic(from, control, lb, t), 1, t * 0.33)
  }
  for (let k = 0; k < lbEdges; k++) {
    const b = Math.floor(rnd() * 3)
    const t = rnd()
    const control: Vec3 = [(lb[0] + backends[b][0]) / 2, backends[b][1], 0]
    w.emit(quadratic(lb, control, backends[b], t), backendSlot(b), 0.34 + t * 0.32)
  }
  for (let k = 0; k < dbEdges; k++) {
    const b = Math.floor(rnd() * 3)
    const t = rnd()
    const control: Vec3 = [(backends[b][0] + db[0]) / 2, backends[b][1] * 0.4, 0]
    w.emit(quadratic(backends[b], control, db, t), backendSlot(b), 0.67 + t * 0.32)
  }
  for (let k = 0; k < dust; k++) {
    w.emit([(rnd() - 0.5) * 8, (rnd() - 0.5) * 6, (rnd() - 0.5) * 3], 1, rnd())
  }
}

// 4: AlgoRace. Two racing lanes, a checkered finish, and each player's passed tests.
function race(w: Writer, n: number, rnd: Rng) {
  const centre = (s: number): Vec3 => [-3.4 + s * 6.8, -0.95 + 0.3 * Math.sin(s * TAU + 0.6), 1.05 * Math.sin(s * Math.PI * 1.3 + 0.2)]
  const at = (s: number, offset: number): Vec3 => {
    const a = centre(Math.max(0, s - 0.002))
    const b = centre(Math.min(1, s + 0.002))
    const tx = b[0] - a[0]
    const tz = b[2] - a[2]
    const len = Math.hypot(tx, tz) || 1
    const c = centre(s)
    return [c[0] - (tz / len) * offset, c[1], c[2] + (tx / len) * offset]
  }
  const [laneA, laneB, borders, finish, tests, dust] = split(n, [0.3, 0.3, 0.13, 0.06, 0.17, 0.04])

  for (let k = 0; k < laneA; k++) {
    const s = rnd()
    w.emit(at(s, 0.3 + (rnd() - 0.5) * 0.26), 0, s)
  }
  for (let k = 0; k < laneB; k++) {
    const s = rnd()
    // Player two's pulse trails a little behind player one's.
    w.emit(at(s, -0.3 + (rnd() - 0.5) * 0.26), 1, s + 0.08)
  }
  const borderOffsets = [0.5, 0, -0.5]
  for (let k = 0; k < borders; k++) {
    w.emit(at(rnd(), borderOffsets[Math.floor(rnd() * 3)] + gauss(rnd) * 0.008), 3, rnd())
  }
  for (let k = 0; k < finish; k++) {
    const u = rnd()
    const v = rnd()
    const cell = Math.floor(u * 8) + Math.floor(v * 2)
    w.emit(at(0.9 + (v - 0.5) * 0.03, (u - 0.5) * 1.0), cell % 2 === 0 ? 2 : 3, rnd())
  }
  const rows = [
    { y: 1.95, slot: 0, passed: 7 },
    { y: 1.35, slot: 1, passed: 5 },
  ]
  const perRow = split(tests, [1, 1])
  rows.forEach((row, r) => {
    for (let k = 0; k < perRow[r]; k++) {
      const i = Math.floor(rnd() * 10)
      const lit = i < row.passed
      w.emit(sphereAt([-2.7 + i * 0.6, row.y, 0], 0.1, rnd), lit ? row.slot : 3, lit ? i / 10 : rnd())
    }
  })
  for (let k = 0; k < dust; k++) {
    w.emit([(rnd() - 0.5) * 8, (rnd() - 0.5) * 5, (rnd() - 0.5) * 3], 3, rnd())
  }
}

// 5: Open source. A git graph: five pull-request branches merging into main.
function gitGraph(w: Writer, n: number, rnd: Rng) {
  const mainY = -1.35
  const tops = [0.35, 1.45, 0.75, 1.75, 1.05]
  const branches = tops.map((top, k) => {
    const xs = -3.1 + k * 1.3
    const xe = xs + 1.15
    const z = k % 2 ? 0.55 : -0.55
    return { p0: [xs, mainY, 0] as Vec3, p1: [xs, top, z] as Vec3, p2: [xe, top, z] as Vec3, p3: [xe, mainY, 0] as Vec3, xe }
  })
  const [mainPts, branchPts, commitPts, mergePts, dust] = split(n, [0.18, 0.4, 0.18, 0.12, 0.12])

  for (let k = 0; k < mainPts; k++) {
    const x = -3.5 + rnd() * 7
    w.emit([x, mainY + gauss(rnd) * 0.015, gauss(rnd) * 0.015], 1, (x + 3.5) / 7)
  }
  for (let k = 0; k < branchPts; k++) {
    const b = branches[Math.floor(rnd() * branches.length)]
    const t = rnd()
    const p = cubic(b.p0, b.p1, b.p2, b.p3, t)
    w.emit([p[0], p[1] + gauss(rnd) * 0.012, p[2] + gauss(rnd) * 0.012], 0, t)
  }
  const commitTs = [0.28, 0.5, 0.72]
  for (let k = 0; k < commitPts; k++) {
    const b = branches[Math.floor(rnd() * branches.length)]
    const t = commitTs[Math.floor(rnd() * commitTs.length)]
    w.emit(sphereAt(cubic(b.p0, b.p1, b.p2, b.p3, t), 0.085, rnd), 2, t)
  }
  for (let k = 0; k < mergePts; k++) {
    if (rnd() < 0.6) {
      const b = branches[Math.floor(rnd() * branches.length)]
      w.emit(sphereAt([b.xe, mainY, 0], 0.16, rnd), 1, (b.xe + 3.5) / 7)
    } else {
      const x = -3.5 + Math.floor(rnd() * 11) * 0.7
      w.emit(sphereAt([x, mainY, 0], 0.07, rnd), 1, (x + 3.5) / 7)
    }
  }
  for (let k = 0; k < dust; k++) {
    w.emit([(rnd() - 0.5) * 8, (rnd() - 0.5) * 5.5, (rnd() - 0.5) * 3], 3, rnd())
  }
}

// 6: Skills and background. A three-armed spiral galaxy (tilted in the shader).
function galaxy(w: Writer, n: number, rnd: Rng) {
  const arms = 3
  const rMax = 4.3
  const [bulge, disk, halo] = split(n, [0.14, 0.78, 0.08])
  for (let k = 0; k < bulge; k++) {
    const [x, y, z] = unit(rnd)
    const r = 0.75 * Math.pow(rnd(), 1.5)
    w.emit([x * r, y * r * 0.5, z * r], 2, rnd())
  }
  for (let k = 0; k < disk; k++) {
    const r = rMax * Math.pow(rnd(), 0.65)
    const arm = Math.floor(rnd() * arms)
    const theta = (arm * TAU) / arms + r * 1.15 + (gauss(rnd) * 0.32) / (0.6 + r * 0.35)
    const slot = r < 1.6 ? 1 : r < 3.1 ? 0 : rnd() < 0.5 ? 0 : 3
    w.emit([Math.cos(theta) * r, gauss(rnd) * 0.09 * (1.2 - r / rMax), Math.sin(theta) * r], slot, theta / TAU)
  }
  for (let k = 0; k < halo; k++) {
    const [x, y, z] = unit(rnd)
    const r = 2 + rnd() * 3
    w.emit([x * r, y * r * 0.6, z * r], 3, rnd())
  }
}

function shuffle(buf: Float32Array, n: number, rnd: Rng) {
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    for (let c = 0; c < 4; c++) {
      const t = buf[i * 4 + c]
      buf[i * 4 + c] = buf[j * 4 + c]
      buf[j * 4 + c] = t
    }
  }
}

export function buildShapes(n: number) {
  const builders: ((w: Writer, n: number, rnd: Rng) => void)[] = [
    (w, count, rnd) => core(w, count, rnd, [{ tiltX: 1.2, tiltZ: 0.35, radius: 3.05, slot: 1 }]),
    ppg,
    tree,
    network,
    race,
    gitGraph,
    galaxy,
    (w, count, rnd) =>
      core(w, count, rnd, [
        { tiltX: 1.2, tiltZ: 0.35, radius: 2.95, slot: 1 },
        { tiltX: -0.5, tiltZ: -0.9, radius: 3.25, slot: 0 },
      ]),
  ]

  const shapes = builders.map((build, i) => {
    const buf = new Float32Array(n * 4)
    const writer = new Writer(buf)
    const rnd = mulberry32(1013 + i * 7919)
    build(writer, n, rnd)
    if (writer.count !== n) throw new Error(`shape ${i} produced ${writer.count} of ${n} particles`)
    shuffle(buf, n, rnd)
    return buf
  })

  const rnd = mulberry32(42)
  const random = new Float32Array(n * 3)
  for (let i = 0; i < random.length; i++) random[i] = rnd()

  return { shapes, random }
}
