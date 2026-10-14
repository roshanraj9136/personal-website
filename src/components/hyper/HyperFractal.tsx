'use client'
/* eslint-disable react-hooks/immutability --
   See the note in HyperDust: uniform values are written in place each frame
   because three.js uniforms are mutable GPU handles. */

// A quaternion Julia set, raymarched. This is a genuinely 4-dimensional object:
// the iteration z -> z² + c runs on quaternions, so the set it traps lives in
// R⁴ and cannot be drawn directly.
//
// What you see is a 3-space slice through it. The same R⁴ rotation that turns
// the hypercube also turns this slice, so scrolling does not spin a fixed 3D
// shape, it cuts the 4D set at a new angle and the surface genuinely changes
// topology: handles open, shells close, pieces appear from nowhere. No 3D
// object can do that.
//
// Cost is contained by marching only inside a small box rather than over the
// whole screen, so it stays a feature of the scene instead of a framerate bill.

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { currentOrientation, hyperState } from '@/lib/hyperState'
import type { Mat4 } from '@/lib/hyper4d'

const VERTEX = /* glsl */ `
  varying vec3 vLocal;

  void main() {
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  precision highp float;

  varying vec3 vLocal;

  uniform vec3 uCamLocal;
  uniform mat4 uRot4;
  uniform vec4 uC;
  uniform float uSlice;
  uniform float uBounds;
  uniform float uOpacity;
  uniform vec3 uAccent;
  uniform vec3 uCool;
  uniform int uSteps;

  // Quaternion square for q = x + yi + zj + wk.
  vec4 qsqr(vec4 q) {
    return vec4(
      q.x * q.x - q.y * q.y - q.z * q.z - q.w * q.w,
      2.0 * q.x * q.y,
      2.0 * q.x * q.z,
      2.0 * q.x * q.w
    );
  }

  // Distance estimate to the Julia set, with the running derivative that makes
  // the estimate safe to step along.
  float de(vec3 p, out float trap) {
    // Lift the 3D sample into R⁴, then rotate it there before iterating.
    vec4 z = uRot4 * vec4(p, uSlice);
    float dz2 = 1.0;
    float r2 = dot(z, z);
    trap = 1.0;

    for (int i = 0; i < 10; i++) {
      dz2 *= 4.0 * r2;
      z = qsqr(z) + uC;
      r2 = dot(z, z);
      trap = min(trap, r2);
      if (r2 > 16.0) break;
    }

    float r = sqrt(r2);
    return 0.5 * r * log(max(r, 1.00001)) / sqrt(max(dz2, 1e-12));
  }

  vec3 estimateNormal(vec3 p) {
    float h = 0.0015;
    float ignored;
    vec2 k = vec2(1.0, -1.0) * h;
    return normalize(vec3(
      de(p + k.xyy, ignored) - de(p + k.yxx, ignored),
      de(p + k.yxy, ignored) - de(p + k.xyx, ignored),
      de(p + k.yyx, ignored) - de(p + k.xxy, ignored)
    ));
  }

  // Slab method: where does this ray enter and leave the box?
  // Named extent because half is a reserved word in GLSL ES.
  vec2 boxSpan(vec3 ro, vec3 rd, float extent) {
    vec3 inv = 1.0 / rd;
    vec3 a = (vec3(-extent) - ro) * inv;
    vec3 b = (vec3(extent) - ro) * inv;
    vec3 lo = min(a, b);
    vec3 hi = max(a, b);
    return vec2(max(max(lo.x, lo.y), lo.z), min(min(hi.x, hi.y), hi.z));
  }

  void main() {
    vec3 ro = uCamLocal;
    vec3 rd = normalize(vLocal - uCamLocal);

    vec2 span = boxSpan(ro, rd, uBounds);
    if (span.y <= max(span.x, 0.0)) discard;

    float t = max(span.x, 0.0);
    float trap = 1.0;
    bool hit = false;

    for (int i = 0; i < 96; i++) {
      if (i >= uSteps) break;
      vec3 p = ro + rd * t;
      float d = de(p, trap);
      if (d < 0.0009) {
        hit = true;
        break;
      }
      t += clamp(d, 0.0015, 0.08);
      if (t > span.y) break;
    }

    if (!hit) discard;

    vec3 p = ro + rd * t;
    vec3 n = estimateNormal(p);
    vec3 view = -rd;

    float diffuse = clamp(dot(n, normalize(vec3(0.6, 0.8, 0.4))), 0.0, 1.0);
    float rim = pow(1.0 - clamp(dot(n, view), 0.0, 1.0), 2.2);
    float orbit = pow(clamp(trap * 3.2, 0.0, 1.0), 0.45);

    vec3 col = mix(uCool, uAccent, orbit);
    col *= 0.25 + 0.95 * diffuse;
    col += rim * uAccent * 1.4;
    col += pow(orbit, 6.0) * 0.5;

    // Fade out near the box wall so the container never shows as a hard edge.
    float edge = smoothstep(uBounds, uBounds * 0.72, length(p));
    gl_FragColor = vec4(col, uOpacity * edge);
  }
`

type Props = {
  accent?: string
  cool?: string
  opacity?: number
  /** Half-extent of the march box, in local units. */
  bounds?: number
  steps?: number
  size?: number
  /** Follow the active project's colour from shared state instead of `accent`. */
  liveAccent?: boolean
  orientation?: () => Mat4
}

/** Copies a row-major Mat4 into a three.js Matrix4, whose element array is
 *  column-major. Writing e[col * 4 + row] = m[row * 4 + col] is that transpose,
 *  and it is what makes `uRot4 * vec4(...)` in GLSL mean the same rotation the
 *  CPU-side code applies. */
function toThreeMatrix(source: Mat4, target: THREE.Matrix4) {
  const e = target.elements
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) e[col * 4 + row] = source[row * 4 + col]
  }
  return target
}

export default function HyperFractal({
  accent = '#a78bfa',
  cool = '#0b1d4d',
  opacity = 0.92,
  bounds = 1.25,
  steps = 72,
  size = 1,
  liveAccent = true,
  orientation,
}: Props) {
  const mesh = useRef<THREE.Mesh>(null)
  const camera = useThree((state) => state.camera)

  const uniforms = useMemo(
    () => ({
      uCamLocal: { value: new THREE.Vector3() },
      uRot4: { value: new THREE.Matrix4() },
      uC: { value: new THREE.Vector4(-0.45, 0.28, 0.12, -0.08) },
      uSlice: { value: 0 },
      uBounds: { value: bounds },
      uOpacity: { value: opacity },
      uAccent: { value: new THREE.Color(accent) },
      uCool: { value: new THREE.Color(cool) },
      uSteps: { value: steps },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        depthWrite: false,
        // Back faces only. Drawing the front too would shade every pixel twice,
        // and the slab test already finds the real entry point, so the far face
        // is all the ray needs. It also keeps working if the camera moves inside.
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  )

  const scratch = useMemo(() => ({ inverse: new THREE.Matrix4(), local: new THREE.Vector3() }), [])

  useFrame(() => {
    if (!hyperState.active || !mesh.current) return

    // The march runs in the mesh's local space, so the camera has to come along.
    scratch.inverse.copy(mesh.current.matrixWorld).invert()
    scratch.local.copy(camera.position).applyMatrix4(scratch.inverse)
    uniforms.uCamLocal.value.copy(scratch.local)

    toThreeMatrix(orientation ? orientation() : currentOrientation(), uniforms.uRot4.value)

    const time = hyperState.clock
    // Drift the Julia constant so the set is never quite the same shape twice.
    uniforms.uC.value.set(
      -0.45 + Math.sin(time * 0.11) * 0.08,
      0.28 + Math.cos(time * 0.09) * 0.07,
      0.12 + Math.sin(time * 0.07) * 0.05,
      -0.08 + Math.cos(time * 0.13) * 0.05,
    )
    // Where our 3-space cuts the 4D set. Scroll moves the knife.
    uniforms.uSlice.value = Math.sin(hyperState.current * 0.42) * 0.55
    uniforms.uOpacity.value = opacity
    uniforms.uSteps.value = steps
    if (liveAccent) {
      const [r, g, b] = hyperState.accent
      uniforms.uAccent.value.setRGB(r, g, b)
    } else {
      uniforms.uAccent.value.set(accent)
    }
    uniforms.uCool.value.set(cool)
  })

  return (
    // The geometry is sized so its local coordinates span exactly ±bounds,
    // which is the range the distance estimator is tuned for. Outer scale is
    // left to the `size` prop so the maths and the staging stay independent.
    <mesh ref={mesh} material={material} frustumCulled={false} scale={size}>
      <boxGeometry args={[bounds * 2, bounds * 2, bounds * 2]} />
    </mesh>
  )
}
