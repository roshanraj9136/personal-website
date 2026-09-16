'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, Text } from '@react-three/drei'
import * as THREE from 'three'
import { FLOORS, FLOOR_GAP, PLATFORM_RADIUS, SPINE_TOP, SPIRAL_RADIUS, floorHeight, floorRadialRotation, floorRotation, platformCenter } from './layout'
import { flowMaterial, gridMaterial } from './materials'
import { useShaderClock } from './useFloor'

export const MONO = '/fonts/jetbrains-mono-500.woff'
export const DISPLAY = '/fonts/space-grotesk-600.woff'

const SPINE_BOTTOM = -6

function Spine() {
  const core = useMemo(() => flowMaterial('#38bdf8', { axis: 'y', density: 12, speed: 0.35, base: 0.16, strength: 2.2 }), [])
  const glass = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color('#67e8f9') } },
        vertexShader: /* glsl */ `
          varying float vRim;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vec3 n = normalize(normalMatrix * normal);
            vRim = 1.0 - abs(dot(n, normalize(-mv.xyz)));
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying float vRim;
          void main() {
            // pow() is undefined for negative input; float error can push vRim just below 0.
            gl_FragColor = vec4(uColor, pow(clamp(vRim, 0.0, 1.0), 4.0) * 0.18);
          }
        `,
      }),
    [],
  )
  useShaderClock([core])

  const height = SPINE_TOP - SPINE_BOTTOM
  return (
    <group position={[0, SPINE_BOTTOM + height / 2, 0]}>
      <mesh material={core}>
        <cylinderGeometry args={[0.16, 0.16, height, 16, 1, true]} />
      </mesh>
      <mesh material={glass}>
        <cylinderGeometry args={[0.75, 0.75, height, 48, 1, true]} />
      </mesh>
    </group>
  )
}

function Platform({ index }: { index: number }) {
  const floor = FLOORS[index]
  const stage = floor.stage
  const center = useMemo(() => platformCenter(stage), [stage])
  const grid = useMemo(() => gridMaterial(floor.accent), [floor.accent])
  const bridge = useMemo(() => flowMaterial(floor.accent, { density: 5, speed: -0.5, base: 0.2 }), [floor.accent])
  const collar = useRef<THREE.Mesh>(null)
  useShaderClock([grid, bridge])
  useFrame((_, delta) => {
    if (collar.current) collar.current.rotation.z += delta * 0.4
  })

  const bridgeLength = SPIRAL_RADIUS - PLATFORM_RADIUS - 1.2
  return (
    <>
      <group position={center} rotation={[0, floorRadialRotation(stage), 0]}>
        <mesh position={[0, -0.18, 0]} receiveShadow>
          <cylinderGeometry args={[PLATFORM_RADIUS, PLATFORM_RADIUS * 1.04, 0.32, 72]} />
          <meshStandardMaterial color="#0a0e19" metalness={0.7} roughness={0.42} />
        </mesh>
        <mesh position={[0, -0.34, 0]}>
          <cylinderGeometry args={[PLATFORM_RADIUS * 0.8, PLATFORM_RADIUS * 0.2, 0.9, 48, 1, true]} />
          <meshStandardMaterial color="#070a12" metalness={0.8} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} material={grid}>
          <circleGeometry args={[PLATFORM_RADIUS, 96]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <torusGeometry args={[PLATFORM_RADIUS * 1.02, 0.035, 8, 120]} />
          <meshBasicMaterial color={floor.accent} toneMapped={false} />
        </mesh>
        {/* Bridge carrying data to the spine */}
        <mesh position={[0, -0.2, -(PLATFORM_RADIUS + bridgeLength / 2)]} rotation={[Math.PI / 2, 0, 0]} material={bridge}>
          <cylinderGeometry args={[0.07, 0.07, bridgeLength, 12, 1, true]} />
        </mesh>
        <pointLight color={floor.accent} intensity={14} distance={11} decay={1.6} position={[0, 3.2, 1.2]} />
      </group>
      <group position={center} rotation={[0, floorRotation(stage), 0]}>
        <Text font={MONO} fontSize={0.3} letterSpacing={0.1} color={floor.accent} anchorX="center" anchorY="middle" position={[0, 0.04, PLATFORM_RADIUS - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          {floor.label}
        </Text>
      </group>
      {/* Collar where the bridge meets the spine */}
      <mesh ref={collar} position={[0, floorHeight(stage) - 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.035, 8, 64]} />
        <meshBasicMaterial color={floor.accent} toneMapped={false} />
      </mesh>
    </>
  )
}

function Base() {
  const grid = useMemo(() => gridMaterial('#22d3ee', 0.12), [])
  useShaderClock([grid])
  return (
    <group position={[0, -4, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={6.5} material={grid}>
        <circleGeometry args={[PLATFORM_RADIUS, 128]} />
      </mesh>
      <Sparkles count={140} scale={[36, 26, 36]} position={[0, 12, 0]} size={2.4} speed={0.35} opacity={0.6} color="#67e8f9" />
    </group>
  )
}

function Summit() {
  const rings = useRef<THREE.Group>(null)
  const beam = useMemo(() => flowMaterial('#e0f2fe', { axis: 'y', density: 3, speed: 0.6, base: 0.25, strength: 2.2 }), [])
  useShaderClock([beam])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    rings.current?.children.forEach((ring, i) => {
      const phase = (t * 0.35 + i / 3) % 1
      ring.scale.setScalar(1 + phase * 7)
      const material = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial
      material.opacity = (1 - phase) * 0.8
    })
  })
  return (
    <group position={[0, SPINE_TOP, 0]}>
      <mesh>
        <icosahedronGeometry args={[0.9, 3]} />
        <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
      </mesh>
      <group ref={rings}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1, 0.03, 8, 96]} />
            <meshBasicMaterial color="#67e8f9" transparent depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 20, 0]} material={beam}>
        <cylinderGeometry args={[0.12, 0.5, 40, 16, 1, true]} />
      </mesh>
    </group>
  )
}

export default function Tower() {
  return (
    <>
      <Spine />
      <Base />
      {FLOORS.map((floor, i) => (
        <Platform key={floor.stage} index={i} />
      ))}
      <Summit />
    </>
  )
}

export { FLOOR_GAP }
