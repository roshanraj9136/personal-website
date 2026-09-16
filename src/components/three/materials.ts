import * as THREE from 'three'

// Shared shader materials. Each exposes a uTime uniform that its owner advances per frame.

/** Light pulses travelling along a mesh's uv.x (tubes) or uv.y (cylinders). */
export function flowMaterial(color: string, { speed = 0.6, density = 6, axis = 'x', base = 0.18, strength = 2.6 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSpeed: { value: speed },
      uDensity: { value: density },
      uBase: { value: base },
      uStrength: { value: strength },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uSpeed;
      uniform float uDensity;
      uniform float uBase;
      uniform float uStrength;
      varying vec2 vUv;
      void main() {
        float along = ${axis === 'x' ? 'vUv.x' : 'vUv.y'};
        float s = fract(along * uDensity - uTime * uSpeed);
        float pulse = smoothstep(0.0, 0.06, s) * (1.0 - smoothstep(0.06, 0.45, s));
        vec3 color = uColor * (uBase + pulse * uStrength);
        gl_FragColor = vec4(color, uBase + pulse);
      }
    `,
  })
}

/** Glass-like hologram panel with scanlines and a fresnel rim. */
export function hologramMaterial(color: string, opacity = 0.18) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float scan = 0.65 + 0.35 * sin(vUv.y * 180.0 - uTime * 4.0);
        vec2 edge = min(vUv, 1.0 - vUv);
        float border = 1.0 - smoothstep(0.0, 0.025, min(edge.x, edge.y));
        float flicker = 0.92 + 0.08 * sin(uTime * 23.0);
        float a = (uOpacity * scan + border * 0.9) * flicker;
        gl_FragColor = vec4(uColor * (0.6 + border * 2.0), a);
      }
    `,
  })
}

/** Platform top: fine grid, radial fade, and a bright rim. Expects a CircleGeometry. */
export function gridMaterial(color: string, ringStrength = 1) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uRing: { value: ringStrength } },
    vertexShader: /* glsl */ `
      varying vec2 vPos;
      void main() {
        vPos = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uRing;
      varying vec2 vPos;
      float line(float v, float w) {
        // fwidth can be 0 on flat pixels; never divide by it, or bloom spreads the NaN.
        float d = abs(fract(v - 0.5) - 0.5) / max(fwidth(v), 1e-4);
        return 1.0 - min(d / w, 1.0);
      }
      void main() {
        float r = length(vPos);
        float grid = max(line(vPos.x * 1.25, 1.0), line(vPos.y * 1.25, 1.0));
        float fade = 1.0 - smoothstep(1.5, 4.6, r);
        float ring = (smoothstep(0.08, 0.0, abs(r - 4.35)) + smoothstep(0.05, 0.0, abs(r - 3.2)) * 0.4) * uRing;
        float sweep = smoothstep(0.35, 0.0, abs(fract(r * 0.22 - uTime * 0.12) - 0.5) * 2.0 - 0.6);
        float a = grid * 0.16 * fade + ring * 0.9 + sweep * 0.05 * fade;
        gl_FragColor = vec4(uColor * (0.7 + ring * 1.8), a);
      }
    `,
  })
}

/** Soft volumetric light cone (additive), brightest at its base. Expects an open cone. */
export function beamMaterial(color: string, intensity = 1.4) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uIntensity: { value: intensity } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vFacing;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 n = normalize(normalMatrix * normal);
        vFacing = abs(dot(n, normalize(-mv.xyz)));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec2 vUv;
      varying float vFacing;
      void main() {
        float along = 1.0 - vUv.y;
        float fade = pow(clamp(along, 0.0, 1.0), 1.6);
        float soft = pow(clamp(vFacing, 0.0, 1.0), 1.8);
        float shimmer = 0.85 + 0.15 * sin(vUv.y * 40.0 - uTime * 6.0);
        gl_FragColor = vec4(uColor * uIntensity, fade * soft * shimmer * 0.55);
      }
    `,
  })
}
