'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Line2 } from 'three-stdlib'
import { ledStore, useStore } from '@/lib/store'
import { beamMaterial, flowMaterial, hologramMaterial } from '../materials'
import { MONO } from '../Tower'
import { useShaderClock } from '../useFloor'
import FloorGroup from './FloorGroup'

// L1 · Hardware: the NISHAD device. A Raspberry Pi, a fingertip sensor lit by
// three LED wavelengths, the 3-branch network that runs on the Pi, and the PPG signal.

const LEDS = [
  { nm: 590, color: new THREE.Color('#ffc53d') },
  { nm: 610, color: new THREE.Color('#ff8a1f') },
  { nm: 660, color: new THREE.Color('#ff3b3b') },
]

const WAVE_POINTS = 160
const WAVE_WIDTH = 3.1

// One heartbeat: systolic peak plus a smaller dicrotic wave.
function ppg(phase: number) {
  const p = ((phase % 1) + 1) % 1
  return Math.exp(-(((p - 0.18) / 0.07) ** 2)) + 0.38 * Math.exp(-(((p - 0.43) / 0.09) ** 2))
}

function PiBoard() {
  const pins = useRef<THREE.InstancedMesh>(null)
  const traces = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    let i = 0
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 20; col++) {
        m.makeTranslation(-1.2 + col * 0.126, 0.15, -0.8 + row * 0.1)
        pins.current?.setMatrixAt(i++, m)
      }
    }
    if (pins.current) pins.current.instanceMatrix.needsUpdate = true

    // Manhattan-style copper traces from the SoC outward.
    const rnd = mulberry(7)
    for (let t = 0; t < 34; t++) {
      const horizontal = rnd() < 0.5
      const length = 0.3 + rnd() * 0.9
      const x = -1.3 + rnd() * 2.4
      const z = -0.6 + rnd() * 1.3
      m.compose(new THREE.Vector3(x, 0.056, z), new THREE.Quaternion(), new THREE.Vector3(horizontal ? length : 0.018, 0.004, horizontal ? 0.018 : length))
      traces.current?.setMatrixAt(t, m)
    }
    if (traces.current) traces.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group position={[-1.25, 0.2, 0.55]} rotation={[0, 0.18, 0]}>
      <RoundedBox args={[3.0, 0.1, 2.0]} radius={0.035} smoothness={3}>
        <meshStandardMaterial color="#0e4d35" roughness={0.55} metalness={0.25} emissive="#05301f" emissiveIntensity={0.5} />
      </RoundedBox>
      <instancedMesh ref={traces} args={[undefined, undefined, 34]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#f5b93c" toneMapped={false} transparent opacity={0.75} />
      </instancedMesh>
      {/* SoC with heat spreader */}
      <mesh position={[-0.35, 0.1, 0.1]}>
        <boxGeometry args={[0.56, 0.07, 0.56]} />
        <meshStandardMaterial color="#1c1f26" metalness={0.9} roughness={0.28} />
      </mesh>
      <mesh position={[0.45, 0.085, -0.25]}>
        <boxGeometry args={[0.7, 0.05, 0.3]} />
        <meshStandardMaterial color="#111318" metalness={0.6} roughness={0.4} />
      </mesh>
      <instancedMesh ref={pins} args={[undefined, undefined, 40]}>
        <boxGeometry args={[0.035, 0.2, 0.035]} />
        <meshStandardMaterial color="#e9b949" metalness={1} roughness={0.25} emissive="#7a5410" emissiveIntensity={0.6} />
      </instancedMesh>
      {[-0.55, 0.05].map((z) => (
        <mesh key={z} position={[1.35, 0.2, z]}>
          <boxGeometry args={[0.42, 0.28, 0.4]} />
          <meshStandardMaterial color="#b8c0cc" metalness={1} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[1.35, 0.21, 0.62]}>
        <boxGeometry args={[0.42, 0.3, 0.5]} />
        <meshStandardMaterial color="#aab2be" metalness={1} roughness={0.25} />
      </mesh>
      <Text font={MONO} fontSize={0.1} color="#9fe7c4" anchorX="left" position={[-1.38, 0.056, 0.86]} rotation={[-Math.PI / 2, 0, 0]}>
        RASPBERRY PI · PYTHON
      </Text>
    </group>
  )
}

/** Three branches (one per wavelength) fused into a single output: the on-device network. */
function BranchNet({ active }: { active: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null)
  const blocks = useRef<THREE.Mesh[]>([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (group.current) group.current.position.y = 1.55 + Math.sin(t * 1.2) * 0.05
    blocks.current.forEach((mesh, i) => {
      const branch = Math.floor(i / 3)
      const layer = i % 3
      const material = mesh.material as THREE.MeshBasicMaterial
      const lit = branch === active.current ? 0.55 + 0.45 * Math.max(0, Math.sin(t * 5 - layer * 1.2)) : 0.18
      material.color.copy(LEDS[branch].color).multiplyScalar(lit * 2.2)
    })
  })
  return (
    <group ref={group} position={[-1.25, 1.55, 0.35]}>
      {LEDS.map((led, b) =>
        [0, 1, 2].map((layer) => (
          <mesh key={`${b}-${layer}`} ref={(m) => { if (m) blocks.current[b * 3 + layer] = m }} position={[-0.55 + b * 0.55, 0, -0.45 + layer * 0.3]}>
            <boxGeometry args={[0.34, 0.1, 0.16]} />
            <meshBasicMaterial color={led.color} toneMapped={false} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0, 0.62]}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshBasicMaterial color="#fde68a" toneMapped={false} />
      </mesh>
      <Text font={MONO} fontSize={0.1} color="#fde68a" anchorX="center" position={[0, 0.3, 0.1]}>
        PYTORCH · 3 BRANCHES
      </Text>
    </group>
  )
}

function Sensor({ active }: { active: React.MutableRefObject<number> }) {
  const beams = useMemo(() => LEDS.map((led) => beamMaterial(`#${led.color.getHexString()}`, 2.2)), [])
  const cable = useMemo(() => flowMaterial('#fbbf24', { density: 4, speed: 0.9, base: 0.15, strength: 2.4 }), [])
  useShaderClock([...beams, cable])
  const ledMeshes = useRef<THREE.Mesh[]>([])
  const beamMeshes = useRef<THREE.Mesh[]>([])
  const finger = useRef<THREE.MeshStandardMaterial>(null)
  const lens = useRef<THREE.MeshBasicMaterial>(null)

  const cableGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(1.3, 0.25, 0.4), new THREE.Vector3(0.6, 0.9, 0.9), new THREE.Vector3(-0.4, 0.55, 0.2), new THREE.Vector3(-1.3, 0.38, -0.2)])
    return new THREE.TubeGeometry(curve, 64, 0.025, 8, false)
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulse = ppg(t * 1.15)
    ledMeshes.current.forEach((mesh, i) => {
      const material = mesh.material as THREE.MeshBasicMaterial
      material.color.copy(LEDS[i].color).multiplyScalar(i === active.current ? 4 : 0.35)
    })
    beamMeshes.current.forEach((mesh, i) => {
      mesh.visible = i === active.current
    })
    if (finger.current) {
      finger.current.emissive.copy(LEDS[active.current].color)
      finger.current.emissiveIntensity = 0.35 + pulse * 0.65
    }
    if (lens.current) lens.current.color.setScalar(1.5 + pulse)
  })

  return (
    <group position={[1.9, 0.2, 0.75]}>
      <mesh geometry={cableGeometry} material={cable} position={[-1.9, 0, -0.75]} />
      <RoundedBox args={[1.25, 0.32, 0.9]} radius={0.06} smoothness={3} position={[0, 0.16, 0]}>
        <meshStandardMaterial color="#12151c" metalness={0.5} roughness={0.35} />
      </RoundedBox>
      {LEDS.map((led, i) => (
        <group key={led.nm} position={[-0.32 + i * 0.32, 0.36, 0]}>
          <mesh ref={(m) => { if (m) ledMeshes.current[i] = m }}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color={led.color} toneMapped={false} />
          </mesh>
          <mesh ref={(m) => { if (m) beamMeshes.current[i] = m }} position={[(1 - i) * 0.16, 0.27, 0]} rotation={[0, 0, (i - 1) * 0.5]} material={beams[i]}>
            <cylinderGeometry args={[0.26, 0.03, 0.5, 24, 1, true]} />
          </mesh>
          <Text font={MONO} fontSize={0.075} color={`#${led.color.getHexString()}`} anchorX="center" position={[0, -0.03, 0.47]} rotation={[-Math.PI / 2, 0, 0]}>
            {`${led.nm}nm`}
          </Text>
        </group>
      ))}
      {/* Fingertip resting over the LEDs */}
      <mesh position={[0, 0.78, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.22, 0.85, 8, 24]} />
        <meshStandardMaterial ref={finger} color="#e8b58f" roughness={0.6} metalness={0} emissive="#ff8a1f" emissiveIntensity={0.5} transparent opacity={0.94} />
      </mesh>
      {/* Camera looking down at the fingertip */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.85, -0.25]}>
          <boxGeometry args={[0.05, 1.1, 0.05]} />
          <meshStandardMaterial color="#2a2f3a" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 1.42, -0.25]}>
        <boxGeometry args={[1.15, 0.06, 0.08]} />
        <meshStandardMaterial color="#2a2f3a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.3, -0.05]}>
        <boxGeometry args={[0.32, 0.1, 0.28]} />
        <meshStandardMaterial color="#0b0d12" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.24, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.018, 8, 24]} />
        <meshBasicMaterial ref={lens} color="#67e8f9" toneMapped={false} />
      </mesh>
      <Text font={MONO} fontSize={0.09} color="#cbd5e1" anchorX="center" position={[0, 1.58, -0.25]}>
        CAMERA · 30 FPS
      </Text>
    </group>
  )
}

function PpgScreen({ active }: { active: React.MutableRefObject<number> }) {
  const holo = useMemo(() => hologramMaterial('#ff8a1f', 0.08), [])
  useShaderClock([holo])
  const line = useRef<Line2>(null)
  const nm = useStore(ledStore, (s) => LEDS[s.active].nm)
  const positions = useMemo(() => new Float32Array(WAVE_POINTS * 3), [])
  const initial = useMemo(() => Array.from({ length: WAVE_POINTS }, (_, i) => [(i / (WAVE_POINTS - 1) - 0.5) * WAVE_WIDTH, 0, 0] as [number, number, number]), [])
  const color = useMemo(() => new THREE.Color(), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const amplitude = 0.42 + active.current * 0.12
    for (let i = 0; i < WAVE_POINTS; i++) {
      const u = i / (WAVE_POINTS - 1)
      positions[i * 3] = (u - 0.5) * WAVE_WIDTH
      positions[i * 3 + 1] = -0.28 + ppg(u * 3.2 - t * 1.15) * amplitude
      positions[i * 3 + 2] = 0.01
    }
    line.current?.geometry.setPositions(positions)
    color.copy(LEDS[active.current].color)
    ;(holo.uniforms.uColor.value as THREE.Color).copy(color)
    const material = line.current?.material as unknown as { color: THREE.Color } | undefined
    material?.color.copy(color).multiplyScalar(2.2)
  })

  return (
    <group position={[0.2, 2.45, -1.55]}>
      <mesh material={holo}>
        <planeGeometry args={[3.5, 1.35]} />
      </mesh>
      <Line ref={line} points={initial} color="#ff8a1f" lineWidth={2.4} toneMapped={false} />
      <Text font={MONO} fontSize={0.12} color="#fde68a" anchorX="left" anchorY="top" position={[-1.6, 0.55, 0.02]}>
        {`PPG SIGNAL · ${nm} NM`}
      </Text>
      <Text font={MONO} fontSize={0.1} color="#fcd34d" anchorX="right" anchorY="bottom" position={[1.6, -0.56, 0.02]}>
        481 PATIENTS · 91.4% SENSITIVITY
      </Text>
    </group>
  )
}

function mulberry(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function Hardware() {
  const active = useRef(ledStore.get().active)
  useFrame(() => {
    active.current = ledStore.get().active
  })
  return (
    <FloorGroup stage={1}>
      <PiBoard />
      <BranchNet active={active} />
      <Sensor active={active} />
      <PpgScreen active={active} />
    </FloorGroup>
  )
}
