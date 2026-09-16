// GPU side of the particle field. All eight shapes live in vertex attributes;
// uProgress (0-7) blends between neighbouring shapes, so a morph costs nothing
// on the CPU.

export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uIntro;
uniform float uSize;
uniform float uPixelRatio;
uniform float uTurbulence;
uniform float uMouseForce;
uniform float uAspect;
uniform vec2 uMouse;
uniform mat3 uRot;
uniform vec3 uOffset[8];
uniform float uScale[8];
uniform float uAlpha[8];
uniform float uSpeed[8];
uniform vec3 uPalette[32];

attribute vec4 aS0;
attribute vec4 aS1;
attribute vec4 aS2;
attribute vec4 aS3;
attribute vec4 aS4;
attribute vec4 aS5;
attribute vec4 aS6;
attribute vec4 aS7;
attribute vec3 aRand;

varying vec3 vColor;
varying float vAlpha;

float weightFor(float stage) {
  return clamp(1.0 - abs(uProgress - stage), 0.0, 1.0);
}

mat3 rotY(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

mat3 rotX(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

vec3 colorFor(int stage, float w) {
  int slot = int(clamp(floor(w), 0.0, 3.0));
  return uPalette[stage * 4 + slot];
}

// A bright head that travels toward increasing flow, with a fading tail.
float pulseFor(float w, float speed) {
  return pow(fract(fract(w) - uTime * speed), 16.0);
}

void main() {
  float w[8];
  for (int i = 0; i < 8; i++) {
    w[i] = weightFor(float(i));
  }

  vec3 s0 = rotY(uTime * 0.12) * aS0.xyz;
  vec3 s6 = rotX(0.95) * (rotY(uTime * 0.05) * aS6.xyz);
  vec3 s7 = rotY(-uTime * 0.1) * aS7.xyz;

  vec3 local = s0 * w[0] + aS1.xyz * w[1] + aS2.xyz * w[2] + aS3.xyz * w[3]
             + aS4.xyz * w[4] + aS5.xyz * w[5] + s6 * w[6] + s7 * w[7];

  vec3 color = colorFor(0, aS0.w) * w[0] + colorFor(1, aS1.w) * w[1]
             + colorFor(2, aS2.w) * w[2] + colorFor(3, aS3.w) * w[3]
             + colorFor(4, aS4.w) * w[4] + colorFor(5, aS5.w) * w[5]
             + colorFor(6, aS6.w) * w[6] + colorFor(7, aS7.w) * w[7];

  float glow = pulseFor(aS0.w, uSpeed[0]) * w[0] + pulseFor(aS1.w, uSpeed[1]) * w[1]
             + pulseFor(aS2.w, uSpeed[2]) * w[2] + pulseFor(aS3.w, uSpeed[3]) * w[3]
             + pulseFor(aS4.w, uSpeed[4]) * w[4] + pulseFor(aS5.w, uSpeed[5]) * w[5]
             + pulseFor(aS6.w, uSpeed[6]) * w[6] + pulseFor(aS7.w, uSpeed[7]) * w[7];

  float scale = 0.0;
  float alpha = 0.0;
  vec3 offset = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    scale += uScale[i] * w[i];
    alpha += uAlpha[i] * w[i];
    offset += uOffset[i] * w[i];
  }

  // Particles drift a little at rest and swirl apart mid-morph.
  float between = smoothstep(0.0, 1.0, 1.0 - abs(fract(uProgress) - 0.5) * 2.0);
  vec3 swirl = vec3(
    sin(local.y * 1.4 + uTime * 0.7 + aRand.x * 6.2831),
    sin(local.z * 1.2 + uTime * 0.6 + aRand.y * 6.2831),
    sin(local.x * 1.3 + uTime * 0.8 + aRand.z * 6.2831)
  );
  local += swirl * (0.025 + between * 0.85) * uTurbulence;

  vec3 placed = uRot * (local * scale) + offset;

  // Intro: every particle flies in from a wide shell, slightly staggered.
  vec3 dir = normalize(aRand - 0.5 + vec3(0.0001));
  vec3 scattered = dir * (10.0 + aRand.z * 10.0);
  float arrive = clamp(uIntro * 1.6 - aRand.x * 0.6, 0.0, 1.0);
  arrive = 1.0 - pow(1.0 - arrive, 3.0);
  vec3 pos = mix(scattered, placed, arrive);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  // Push particles away from the cursor.
  vec4 clip = projectionMatrix * mv;
  vec2 d = clip.xy / max(clip.w, 0.001) - uMouse;
  d.x *= uAspect;
  float dist = length(d);
  float push = (1.0 - smoothstep(0.0, 0.3, dist)) * uMouseForce;
  mv.xy += (d / max(dist, 0.001)) * push * 0.6;

  gl_Position = projectionMatrix * mv;

  float size = uSize * (0.55 + aRand.y * 0.9) * (1.0 + glow * 1.6);
  gl_PointSize = size * uPixelRatio / max(-mv.z, 0.5);

  float twinkle = 0.78 + 0.22 * sin(uTime * (0.7 + aRand.z * 1.8) + aRand.x * 40.0);
  vColor = color * (0.6 + glow * 1.8);
  vAlpha = alpha * twinkle * arrive;
}
`

export const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float soft = pow(1.0 - d * 2.0, 1.6);
  gl_FragColor = vec4(vColor, soft * vAlpha);
  #include <colorspace_fragment>
}
`
