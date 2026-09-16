import * as THREE from 'three'

// "The Stack": floating floors spiral up around a glowing spine. Each floor is
// one layer of the computing stack and holds one project.

export const STAGES = 8
export const FLOOR_GAP = 9
export const SPIRAL_RADIUS = 11
export const ANGLE_STEP = 0.95
export const PLATFORM_RADIUS = 4.6
export const SPINE_TOP = 66

export const FLOORS = [
  { stage: 1, label: 'L1 · HARDWARE', project: 'NISHAD', accent: '#ff8a1f' },
  { stage: 2, label: 'L2 · COMPILER', project: 'MINILANG', accent: '#818cf8' },
  { stage: 3, label: 'L3 · NETWORK', project: 'LOAD BALANCER', accent: '#34d399' },
  { stage: 4, label: 'L4 · APPLICATION', project: 'ALGORACE', accent: '#fb923c' },
  { stage: 5, label: 'L5 · OPEN SOURCE', project: 'RATEMYCOURSE', accent: '#a78bfa' },
  { stage: 6, label: 'L6 · SKILLS', project: 'TOOLBOX', accent: '#22d3ee' },
] as const

export const floorAngle = (stage: number) => stage * ANGLE_STEP
export const floorHeight = (stage: number) => stage * FLOOR_GAP

export function platformCenter(stage: number, out = new THREE.Vector3()) {
  const a = floorAngle(stage)
  return out.set(Math.cos(a) * SPIRAL_RADIUS, floorHeight(stage), Math.sin(a) * SPIRAL_RADIUS)
}

/** Rotation that points a floor's local +z straight out from the spine (used for its bridge). */
export const floorRadialRotation = (stage: number) => Math.PI / 2 - floorAngle(stage)

type Cylindrical = { a: number; r: number; y: number }
type Shot = { position: Cylindrical; target: Cylindrical; side: number }

// Screen side of the HTML panel per stage on wide screens: +1 panel left (3D right), -1 panel right.
const PANEL_SIDE = [1, -1, 1, -1, 1, -1, 1, 0]

function floorShot(stage: number): Shot {
  const a = floorAngle(stage)
  const y = floorHeight(stage)
  return {
    position: { a: a + 0.42, r: SPIRAL_RADIUS + 12.5, y: y + 5.8 },
    target: { a: a + 0.02, r: SPIRAL_RADIUS - 0.3, y: y + 1.1 },
    side: PANEL_SIDE[stage],
  }
}

export const SHOTS: Shot[] = [
  { position: { a: -0.55, r: 52, y: 60 }, target: { a: 0, r: 0, y: 25 }, side: PANEL_SIDE[0] },
  ...[1, 2, 3, 4, 5, 6].map(floorShot),
  { position: { a: floorAngle(6) + 1.3, r: 62, y: 98 }, target: { a: 0, r: 0, y: 46 }, side: 0 },
]

/**
 * Rotation that turns a floor's diorama to face its camera shot: local +z points at the
 * camera and local +x to the camera's right.
 */
export function floorRotation(stage: number) {
  const center = platformCenter(stage)
  const { a, r } = SHOTS[stage].position
  return Math.PI / 2 - Math.atan2(Math.sin(a) * r - center.z, Math.cos(a) * r - center.x)
}

const smooth = (t: number) => t * t * (3 - 2 * t)

function cylToVec(c: Cylindrical, out: THREE.Vector3) {
  return out.set(Math.cos(c.a) * c.r, c.y, Math.sin(c.a) * c.r)
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Camera position, look target and panel side for a continuous stage value. */
export function shotAt(progress: number, position: THREE.Vector3, target: THREE.Vector3) {
  const p = THREE.MathUtils.clamp(progress, 0, STAGES - 1)
  const i = Math.min(Math.floor(p), STAGES - 2)
  const t = smooth(p - i)
  const A = SHOTS[i]
  const B = SHOTS[i + 1]
  // Interpolating in cylindrical coordinates makes the camera orbit the spine instead of cutting through it.
  cylToVec({ a: lerp(A.position.a, B.position.a, t), r: lerp(A.position.r, B.position.r, t), y: lerp(A.position.y, B.position.y, t) }, position)
  cylToVec({ a: lerp(A.target.a, B.target.a, t), r: lerp(A.target.r, B.target.r, t), y: lerp(A.target.y, B.target.y, t) }, target)
  return lerp(A.side, B.side, t)
}
