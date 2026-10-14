'use client'
/* eslint-disable react-hooks/immutability --
   three.js uniforms are mutable GPU handles and the render loop writes their
   `.value` in place every frame, which is how React Three Fiber is designed to
   work. React's immutability rule does not model that: it sees an object that
   passed through useMemo being mutated later. Honouring the rule here would
   mean rebuilding a ShaderMaterial per frame, which is the exact cost the
   pattern exists to avoid. */

// A dust field whose particles are 4-dimensional. Each one has a home position
// on the 3-sphere around the hypercube, drifts through a swirling field in R⁴,
// is rotated by the same R⁴ orientation as everything else, and only then gets
// projected down to R³.
//
// All of that happens in the vertex shader, so the 4D maths costs one pass over
// the points and the CPU stays out of it. The visible payoff is that particles
// do not merely move: they fade in and out of our 3-space as their w carries
// them past the projection, which is what being in a 4D field actually looks
// like from inside a 3D slice of it.

import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { currentOrientation, hyperState } from '@/lib/hyperState'
import { sampleThreeSphere, seededRandom, type Mat4 } from '@/lib/hyper4d'

const VERTEX = /* glsl */ `
  attribute vec4 aHome;
  attribute float aSeed;

  uniform mat4 uRot4;
  uniform float uTime;
  uniform float uEyeW;
  uniform float uAmp;
  uniform float uSize;
  uniform float uScale;
  uniform float uPixelRatio;

  varying float vDepth;
  varying float vSeed;

  // A swirling field in R⁴. Every component is driven by axes other than its
  // own, so the flow curls instead of pushing everything one way.
  vec4 flow(vec4 p, float t) {
    return vec4(
      sin(p.y * 1.3 + t) + cos(p.w * 0.9 - t * 0.7),
      sin(p.z * 1.1 - t * 0.8) + cos(p.x * 1.4 + t * 0.5),
      sin(p.w * 1.2 + t * 0.6) + cos(p.y * 1.0 - t * 0.9),
      sin(p.x * 0.8 - t * 0.5) + cos(p.z * 1.3 + t * 0.4)
    );
  }

  void main() {
    float t = uTime * 0.25 + aSeed * 6.2831;

    // Offsetting from a fixed home keeps the field stable: particles orbit
    // rather than wander off to infinity.
    vec4 p4 = aHome + flow(aHome * 1.7, t) * uAmp;
    p4 = uRot4 * p4;

    // The same R⁴ -> R³ perspective divide the polytope uses.
    float denom = max(uEyeW - p4.w, 0.05);
    float scale = uEyeW / denom;
    vec3 p3 = p4.xyz * scale * uScale;

    vec4 mv = modelViewMatrix * vec4(p3, 1.0);
    gl_Position = projectionMatrix * mv;

    vDepth = clamp(p4.w * 0.5 + 0.5, 0.0, 1.0);
    vSeed = aSeed;

    // Size from both 4D depth and ordinary 3D distance. The clamp ceiling is
    // deliberately low: additive blending plus bloom turns large points into
    // bokeh blobs that swallow the geometry behind them.
    float size = uSize * (0.35 + 1.5 * vDepth) * (0.5 + 0.5 * scale);
    gl_PointSize = clamp(size * uPixelRatio / max(-mv.z, 0.1), 0.6, 9.0);
  }
`

const FRAGMENT = /* glsl */ `
  precision mediump float;

  uniform vec3 uCool;
  uniform vec3 uWarm;
  uniform float uOpacity;

  varying float vDepth;
  varying float vSeed;

  void main() {
    // Round, soft points.
    vec2 d = gl_PointCoord - 0.5;
    float r = dot(d, d);
    if (r > 0.25) discard;
    float falloff = 1.0 - smoothstep(0.0, 0.25, r);

    vec3 col = mix(uCool, uWarm, vDepth);
    col += pow(vDepth, 6.0) * 0.9;

    // Particles far away in w thin out, so the field reads as a 4D volume.
    float alpha = uOpacity * falloff * (0.05 + 0.95 * pow(vDepth, 1.6));
    gl_FragColor = vec4(col, alpha);
  }
`

type Props = {
  count?: number
  cool?: string
  warm?: string
  opacity?: number
  amp?: number
  size?: number
  /** Multiplies the projected radius, to sit the shell around the polytope. */
  scale?: number
  eyeW?: number
  /** Fixed seed keeps the field reproducible across renders. */
  seed?: number
  orientation?: () => Mat4
}

/** A point drawn uniformly from the 3-sphere, by normalising a 4D Gaussian.
 *  Normalising a uniform cube instead would bunch points toward the corners. */
export default function HyperDust({
  count = 3000,
  cool = '#1d4ed8',
  warm = '#a5f3fc',
  opacity = 0.3,
  amp = 0.085,
  size = 13,
  scale = 1.75,
  eyeW = 2.6,
  seed = 0x4d1e,
  orientation,
}: Props) {
  const geometry = useMemo(() => {
    // Seeded, so the field is identical on every render of the same props.
    const random = seededRandom(seed)
    const homes = new Float32Array(count * 4)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const unit = sampleThreeSphere(random)
      // Spread across a shell rather than a shrink-wrapped surface, so the
      // field has thickness in all four directions.
      const radius = 0.72 + Math.pow(random(), 0.65) * 0.5
      homes[i * 4 + 0] = unit[0] * radius
      homes[i * 4 + 1] = unit[1] * radius
      homes[i * 4 + 2] = unit[2] * radius
      homes[i * 4 + 3] = unit[3] * radius
      seeds[i] = random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('aHome', new THREE.BufferAttribute(homes, 4))
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    // `position` is unused by the shader but three.js wants it for draw range.
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    return geo
  }, [count, seed])

  const uniforms = useMemo(
    () => ({
      uRot4: { value: new THREE.Matrix4() },
      uTime: { value: 0 },
      uEyeW: { value: eyeW },
      uAmp: { value: amp },
      uSize: { value: size },
      uScale: { value: scale },
      uPixelRatio: { value: 1 },
      uCool: { value: new THREE.Color(cool) },
      uWarm: { value: new THREE.Color(warm) },
      uOpacity: { value: opacity },
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
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  )

  useFrame(({ gl }) => {
    if (!hyperState.active) return
    const source = orientation ? orientation() : currentOrientation()
    const e = uniforms.uRot4.value.elements
    // Row-major source into column-major elements, i.e. a transpose on copy.
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) e[col * 4 + row] = source[row * 4 + col]
    }
    uniforms.uTime.value = hyperState.clock
    uniforms.uPixelRatio.value = gl.getPixelRatio()
    uniforms.uOpacity.value = opacity
    uniforms.uAmp.value = hyperState.calm ? amp * 0.3 : amp
    uniforms.uCool.value.set(cool)
    uniforms.uWarm.value.set(warm)
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
