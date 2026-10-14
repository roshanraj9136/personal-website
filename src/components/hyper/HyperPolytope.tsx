'use client'
/* eslint-disable react-hooks/immutability --
   See the note in HyperDust: the instance attribute buffers and uniform values
   are written in place each frame, which is the point of the whole approach. */

// Renders a 4-polytope by projecting its vertices from R⁴ to R³ every frame and
// drawing each edge as an instanced tube.
//
// The whole trick of seeing in 4D is deciding what to do with w after you have
// used x, y and z for position. Throwing it away gives a confusing tangle, so
// here w is spent on three cues at once: tube thickness, hue, and glow. An edge
// that swells, warms and brightens is moving toward you through the fourth
// dimension. Once you have seen it, a tesseract stops looking like a cube in a
// cube and starts looking like a single object turning.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  project4to3,
  projectStereographic,
  seededRandom,
  transform4,
  type Mat4,
  type Polytope,
  type Projected,
  type ProjectionMode,
  type Vec4,
} from '@/lib/hyper4d'
import { currentOrientation, hyperState } from '@/lib/hyperState'

const EDGE_VERTEX = /* glsl */ `
  attribute vec4 aStart;
  attribute vec4 aEnd;
  attribute float aMix;
  attribute float aSeed;

  uniform float uThickness;
  uniform float uWGain;

  varying float vDepth;
  varying float vMix;
  varying float vFresnel;
  varying float vSeed;

  void main() {
    // The base cylinder runs 0..1 along z, so position.z is distance along the
    // edge and position.xy is the unit cross-section.
    float t = position.z;
    vec3 a = aStart.xyz;
    vec3 b = aEnd.xyz;
    vec3 center = mix(a, b, t);

    // w is carried per endpoint and interpolated like any other attribute.
    float w = mix(aStart.w, aEnd.w, t) * uWGain;
    float depth = clamp(w * 0.5 + 0.5, 0.0, 1.0);

    vec3 dir = b - a;
    float len = length(dir);
    dir = len > 1e-5 ? dir / len : vec3(0.0, 0.0, 1.0);

    // Any vector not parallel to the edge gives a stable frame to sweep around.
    vec3 guide = abs(dir.y) > 0.97 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(guide, dir));
    vec3 up = cross(dir, right);

    float radius = uThickness * (0.3 + 1.0 * depth) * (1.0 + 0.6 * aMix);
    vec3 localNormal = normalize(right * position.x + up * position.y);

    vec4 mv = modelViewMatrix * vec4(center + localNormal * radius, 1.0);
    vec3 viewNormal = normalize(normalMatrix * localNormal);

    vFresnel = 1.0 - abs(dot(viewNormal, normalize(-mv.xyz)));
    vDepth = depth;
    vMix = aMix;
    vSeed = aSeed;
    gl_Position = projectionMatrix * mv;
  }
`

const EDGE_FRAGMENT = /* glsl */ `
  uniform vec3 uCool;
  uniform vec3 uWarm;
  uniform vec3 uAccent;
  uniform float uOpacity;
  uniform float uTime;

  varying float vDepth;
  varying float vMix;
  varying float vFresnel;
  varying float vSeed;

  void main() {
    // Cool and dim when far away in w, warm and bright when near.
    vec3 col = mix(uCool, uWarm, vDepth);
    col = mix(col, uAccent, vMix * 0.85);
    // Rim light, so each tube reads as a volume rather than a flat stripe.
    col += pow(vFresnel, 2.5) * (0.18 + 0.4 * vDepth);
    // Only the leading sliver in w burns toward white. A wider, stronger term
    // here saturated the whole shape and threw away the colour gradient that
    // is doing the actual work of showing w.
    col += pow(vDepth, 12.0) * 0.35;

    float shimmer = 0.92 + 0.08 * sin(uTime * 1.7 + vSeed * 24.0);
    float alpha = uOpacity * (0.14 + 0.7 * vDepth) * shimmer;
    alpha = clamp(alpha + vMix * 0.3, 0.0, 1.0);
    gl_FragColor = vec4(col * shimmer, alpha);
  }
`

const NODE_VERTEX = /* glsl */ `
  attribute vec4 aCenter;
  attribute float aMix;

  uniform float uSize;
  uniform float uWGain;

  varying float vDepth;
  varying float vMix;
  varying float vRim;

  void main() {
    float depth = clamp(aCenter.w * uWGain * 0.5 + 0.5, 0.0, 1.0);
    float radius = uSize * (0.35 + 1.1 * depth) * (1.0 + 0.7 * aMix);
    vec3 local = position * radius;
    vec4 mv = modelViewMatrix * vec4(aCenter.xyz + local, 1.0);
    vec3 viewNormal = normalize(normalMatrix * normalize(position));
    vRim = 1.0 - abs(dot(viewNormal, normalize(-mv.xyz)));
    vDepth = depth;
    vMix = aMix;
    gl_Position = projectionMatrix * mv;
  }
`

const NODE_FRAGMENT = /* glsl */ `
  uniform vec3 uCool;
  uniform vec3 uWarm;
  uniform vec3 uAccent;
  uniform float uOpacity;

  varying float vDepth;
  varying float vMix;
  varying float vRim;

  void main() {
    vec3 col = mix(uCool, uWarm, vDepth);
    col = mix(col, uAccent, vMix * 0.9);
    col += pow(vRim, 1.6) * 0.3;
    col += pow(vDepth, 9.0) * 0.5;
    float alpha = uOpacity * (0.2 + 0.7 * vDepth);
    gl_FragColor = vec4(col, clamp(alpha + vMix * 0.3, 0.0, 1.0));
  }
`

type Props = {
  shape: Polytope
  /** Edge indices to light in the accent colour, usually the active cell.
   *  A function because it changes every frame as the scroll moves, and a prop
   *  read during render would be a frame behind at best and stale at worst. */
  highlight?: () => readonly number[] | undefined
  accent?: string
  cool?: string
  warm?: string
  opacity?: number
  thickness?: number
  /** Multiplies w before it becomes colour and thickness. Higher is more dramatic. */
  wGain?: number
  /** Distance of the 4D eye along w. Smaller is a stronger 4D perspective. */
  eyeW?: number
  mode?: ProjectionMode
  segments?: number
  showNodes?: boolean
  /** Follow the active project's colour from shared state instead of `accent`. */
  liveAccent?: boolean
  /** Overrides the shared scroll-driven orientation, for decorative shapes. */
  orientation?: () => Mat4
}

export default function HyperPolytope({
  shape,
  highlight,
  accent = '#8b5cf6',
  cool = '#1e3a8a',
  warm = '#67e8f9',
  opacity = 1,
  thickness = 0.035,
  wGain = 1,
  eyeW = 2.6,
  mode = 'perspective',
  segments = 6,
  showNodes = true,
  liveAccent = true,
  orientation,
}: Props) {
  const edgeCount = shape.edges.length
  const nodeCount = shape.vertices.length

  // Normalise every polytope to roughly the same on-screen size.
  const unit = 1 / shape.radius

  const buffers = useMemo(
    () => ({
      // Projected vertices, reused each frame so the loop never allocates.
      projected: shape.vertices.map<Projected>(() => ({ x: 0, y: 0, z: 0, depth: 0, scale: 1 })),
      rotated: [0, 0, 0, 0] as Vec4,
      starts: new Float32Array(edgeCount * 4),
      ends: new Float32Array(edgeCount * 4),
      edgeMix: new Float32Array(edgeCount),
      edgeMixTarget: new Float32Array(edgeCount),
      centers: new Float32Array(nodeCount * 4),
      nodeMix: new Float32Array(nodeCount),
      nodeMixTarget: new Float32Array(nodeCount),
    }),
    [shape, edgeCount, nodeCount],
  )

  const edgeGeometry = useMemo(() => {
    const base = new THREE.CylinderGeometry(1, 1, 1, segments, 1, true)
    base.rotateX(Math.PI / 2)
    base.translate(0, 0, 0.5)

    const geo = new THREE.InstancedBufferGeometry()
    geo.index = base.index
    geo.setAttribute('position', base.getAttribute('position'))
    geo.setAttribute('normal', base.getAttribute('normal'))
    geo.instanceCount = edgeCount

    const seeds = new Float32Array(edgeCount)
    const random = seededRandom(0x9e37 + edgeCount)
    for (let i = 0; i < edgeCount; i++) seeds[i] = random()

    geo.setAttribute('aStart', new THREE.InstancedBufferAttribute(buffers.starts, 4))
    geo.setAttribute('aEnd', new THREE.InstancedBufferAttribute(buffers.ends, 4))
    geo.setAttribute('aMix', new THREE.InstancedBufferAttribute(buffers.edgeMix, 1))
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1))
    return geo
  }, [buffers, edgeCount, segments])

  const nodeGeometry = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(1, 1)
    const geo = new THREE.InstancedBufferGeometry()
    geo.index = base.index
    geo.setAttribute('position', base.getAttribute('position'))
    geo.instanceCount = nodeCount
    geo.setAttribute('aCenter', new THREE.InstancedBufferAttribute(buffers.centers, 4))
    geo.setAttribute('aMix', new THREE.InstancedBufferAttribute(buffers.nodeMix, 1))
    return geo
  }, [buffers, nodeCount])

  const uniforms = useMemo(
    () => ({
      uThickness: { value: thickness },
      uSize: { value: thickness * 1.9 },
      uWGain: { value: wGain },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
      uCool: { value: new THREE.Color(cool) },
      uWarm: { value: new THREE.Color(warm) },
      uAccent: { value: new THREE.Color(accent) },
    }),
    // Colours and scalars are pushed in useFrame, so this only builds once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const edgeMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: EDGE_VERTEX,
        fragmentShader: EDGE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  )

  const nodeMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: NODE_VERTEX,
        fragmentShader: NODE_FRAGMENT,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  )

  const edgeRef = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (!hyperState.active) return
    const dt = Math.min(delta, 1 / 20)
    const matrix = orientation ? orientation() : currentOrientation()
    const { projected, rotated, starts, ends, centers, edgeMix, edgeMixTarget, nodeMix, nodeMixTarget } = buffers

    // 1. R⁴ rotation, then R⁴ -> R³ projection, once per vertex.
    for (let i = 0; i < nodeCount; i++) {
      transform4(matrix, shape.vertices[i], rotated)
      const out = projected[i]
      if (mode === 'stereographic') projectStereographic(rotated, 1.0001, out)
      else project4to3(rotated, eyeW, out)
      centers[i * 4 + 0] = out.x * unit
      centers[i * 4 + 1] = out.y * unit
      centers[i * 4 + 2] = out.z * unit
      centers[i * 4 + 3] = out.depth / shape.radius
    }

    // 2. Hand each edge its two projected endpoints, w included.
    for (let e = 0; e < edgeCount; e++) {
      const [a, b] = shape.edges[e]
      const pa = projected[a]
      const pb = projected[b]
      const i4 = e * 4
      starts[i4 + 0] = pa.x * unit
      starts[i4 + 1] = pa.y * unit
      starts[i4 + 2] = pa.z * unit
      starts[i4 + 3] = pa.depth / shape.radius
      ends[i4 + 0] = pb.x * unit
      ends[i4 + 1] = pb.y * unit
      ends[i4 + 2] = pb.z * unit
      ends[i4 + 3] = pb.depth / shape.radius
    }

    // 3. Ease the accent highlight so switching sections fades rather than snaps.
    edgeMixTarget.fill(0)
    nodeMixTarget.fill(0)
    const lit = highlight?.()
    if (lit) {
      for (const e of lit) {
        if (e < 0 || e >= edgeCount) continue
        edgeMixTarget[e] = 1
        const [a, b] = shape.edges[e]
        nodeMixTarget[a] = 1
        nodeMixTarget[b] = 1
      }
    }
    const k = 1 - Math.exp(-dt * 5)
    for (let i = 0; i < edgeCount; i++) edgeMix[i] += (edgeMixTarget[i] - edgeMix[i]) * k
    for (let i = 0; i < nodeCount; i++) nodeMix[i] += (nodeMixTarget[i] - nodeMix[i]) * k

    edgeGeometry.getAttribute('aStart').needsUpdate = true
    edgeGeometry.getAttribute('aEnd').needsUpdate = true
    edgeGeometry.getAttribute('aMix').needsUpdate = true
    nodeGeometry.getAttribute('aCenter').needsUpdate = true
    nodeGeometry.getAttribute('aMix').needsUpdate = true

    uniforms.uTime.value += dt
    uniforms.uOpacity.value = opacity
    uniforms.uThickness.value = thickness
    uniforms.uSize.value = thickness * 1.9
    uniforms.uWGain.value = wGain
    // The navigator shape follows the active project's colour, which the scene
    // eases frame by frame. Decorative shapes pass a fixed accent instead.
    if (liveAccent) {
      const [r, g, b] = hyperState.accent
      uniforms.uAccent.value.setRGB(r, g, b)
    } else {
      uniforms.uAccent.value.set(accent)
    }
    uniforms.uCool.value.set(cool)
    uniforms.uWarm.value.set(warm)
  })

  return (
    <group>
      {/* Culling is off because the instance positions live in attributes, so
          the geometry's own bounding box says nothing useful. */}
      <mesh ref={edgeRef} geometry={edgeGeometry} material={edgeMaterial} frustumCulled={false} />
      {showNodes && <mesh geometry={nodeGeometry} material={nodeMaterial} frustumCulled={false} />}
    </group>
  )
}
