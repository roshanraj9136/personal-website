'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Trail } from '@react-three/drei'
import * as THREE from 'three'
import { raceStore, useStore } from '@/lib/store'
import { flowMaterial, hologramMaterial } from '../materials'
import { MONO } from '../Tower'
import { useShaderClock } from '../useFloor'
import FloorGroup from './FloorGroup'

// L4 · Application: an AlgoRace match. Racer progress follows the race panel on the page
// (tests passed out of 10); each gate is one test case.

const TESTS = 10
const PLAYERS = [
  { name: 'YOU', elo: 1200, color: '#22d3ee', lane: -0.2 },
  { name: 'OPPONENT', elo: 1248, color: '#fb923c', lane: 0.2 },
]
const A = 3.05
const B = 1.8
const CENTER = new THREE.Vector3(0, 0.1, 0.35)

// Same formula as AlgoRace's elo.ts (K-factor 32).
function eloDelta(winner: number, loser: number) {
  const expected = 1 / (1 + 10 ** ((loser - winner) / 400))
  return Math.round(winner + 32 * (1 - expected)) - winner
}

function trackPoint(u: number, offset: number, out: THREE.Vector3) {
  const a = u * Math.PI * 2 - Math.PI / 2
  const x = Math.cos(a) * A
  const z = Math.sin(a) * B
  // Outward normal of the ellipse, used to offset the lanes.
  const nx = Math.cos(a) / A
  const nz = Math.sin(a) / B
  const len = Math.hypot(nx, nz)
  return out.set(CENTER.x + x + (nx / len) * offset, CENTER.y, CENTER.z + z + (nz / len) * offset)
}

function laneCurve(offset: number) {
  const points = Array.from({ length: 96 }, (_, i) => trackPoint(i / 96, offset, new THREE.Vector3()))
  return new THREE.CatmullRomCurve3(points, true)
}

function Racer({ index }: { index: number }) {
  const player = PLAYERS[index]
  const mesh = useRef<THREE.Mesh>(null)
  const progress = useRef(0)
  const point = useMemo(() => new THREE.Vector3(), [])
  const ahead = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const target = raceStore.get().passed[index] / TESTS
    // Races restart from zero: keep moving forward around the lap instead of reversing.
    if (target < progress.current - 0.2) progress.current -= 1
    progress.current = THREE.MathUtils.damp(progress.current, target, 2.2, Math.min(delta, 0.05))
    const u = ((progress.current % 1) + 1) % 1
    trackPoint(u, player.lane, point)
    trackPoint((u + 0.01) % 1, player.lane, ahead)
    if (mesh.current) {
      mesh.current.position.copy(point).setY(CENTER.y + 0.12 + Math.sin(state.clock.elapsedTime * 8 + index) * 0.015)
      mesh.current.lookAt(ahead.setY(mesh.current.position.y))
    }
  })

  return (
    <Trail width={0.5} length={5} color={new THREE.Color(player.color).multiplyScalar(2)} attenuation={(w) => w * w}>
      <mesh ref={mesh}>
        <capsuleGeometry args={[0.07, 0.24, 6, 12]} />
        <meshBasicMaterial color={new THREE.Color(player.color).multiplyScalar(3)} toneMapped={false} />
      </mesh>
    </Trail>
  )
}

function Gates() {
  const lamps = useRef<THREE.MeshBasicMaterial[]>([])
  const cyan = useMemo(() => new THREE.Color(PLAYERS[0].color), [])
  const orange = useMemo(() => new THREE.Color(PLAYERS[1].color), [])
  const gates = useMemo(
    () =>
      Array.from({ length: TESTS }, (_, k) => {
        const u = (k + 0.5) / TESTS
        const position = trackPoint(u, 0, new THREE.Vector3())
        const next = trackPoint((u + 0.01) % 1, 0, new THREE.Vector3())
        const angle = Math.atan2(next.x - position.x, next.z - position.z)
        return { position, angle }
      }),
    [],
  )

  useFrame(() => {
    const { passed } = raceStore.get()
    lamps.current.forEach((material, i) => {
      if (!material) return
      const gate = Math.floor(i / 2)
      const player = i % 2
      const lit = passed[player] > gate
      material.color.copy(player === 0 ? cyan : orange).multiplyScalar(lit ? 3 : 0.12)
    })
  })

  return (
    <>
      {gates.map((gate, k) => (
        <group key={k} position={gate.position} rotation={[0, gate.angle + Math.PI / 2, 0]}>
          <mesh position={[0, 0.02, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.42, 0.018, 6, 32, Math.PI]} />
            <meshStandardMaterial color="#1f2937" metalness={0.8} roughness={0.3} emissive="#334155" emissiveIntensity={0.6} />
          </mesh>
          {[0, 1].map((p) => (
            <mesh key={p} position={[(p === 0 ? -1 : 1) * 0.12, 0.44, 0]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshBasicMaterial ref={(m) => { if (m) lamps.current[k * 2 + p] = m }} color={PLAYERS[p].color} toneMapped={false} />
            </mesh>
          ))}
          <Text font={MONO} fontSize={0.075} color="#94a3b8" anchorX="center" position={[0, 0.6, 0]}>
            {`T${k + 1}`}
          </Text>
        </group>
      ))}
    </>
  )
}

function Scoreboard() {
  const holo = useMemo(() => hologramMaterial('#fb923c', 0.06), [])
  useShaderClock([holo])
  const passed = useStore(raceStore, (s) => s.passed)
  const winner = useStore(raceStore, (s) => s.winner)
  const deltas =
    winner === null ? null : winner === 0 ? [eloDelta(PLAYERS[0].elo, PLAYERS[1].elo), -eloDelta(PLAYERS[0].elo, PLAYERS[1].elo)] : [-eloDelta(PLAYERS[1].elo, PLAYERS[0].elo), eloDelta(PLAYERS[1].elo, PLAYERS[0].elo)]

  return (
    <group position={[0, 2.35, -1.75]}>
      <mesh material={holo}>
        <planeGeometry args={[3.4, 1.25]} />
      </mesh>
      <Text font={MONO} fontSize={0.1} color="#fed7aa" anchorX="center" position={[0, 0.46, 0.02]}>
        ALGORACE · SAME PROBLEM · 10 TEST CASES
      </Text>
      {PLAYERS.map((player, i) => (
        <group key={player.name} position={[i === 0 ? -0.85 : 0.85, 0.02, 0.02]}>
          <Text font={MONO} fontSize={0.1} color={player.color} anchorX="center" position={[0, 0.22, 0]}>
            {`${player.name} · ELO ${player.elo}`}
          </Text>
          <Text font={MONO} fontSize={0.3} color="#ffffff" anchorX="center" position={[0, -0.05, 0]}>
            {`${passed[i]}/${TESTS}`}
          </Text>
          <Text font={MONO} fontSize={0.11} color={deltas ? (deltas[i] >= 0 ? '#86efac' : '#fca5a5') : '#64748b'} anchorX="center" position={[0, -0.37, 0]}>
            {deltas ? `${deltas[i] >= 0 ? '+' : ''}${deltas[i]} ELO` : 'racing'}
          </Text>
        </group>
      ))}
    </group>
  )
}

export default function Application() {
  const inner = useMemo(() => new THREE.TubeGeometry(laneCurve(-0.42), 240, 0.02, 6, true), [])
  const outer = useMemo(() => new THREE.TubeGeometry(laneCurve(0.42), 240, 0.02, 6, true), [])
  const divider = useMemo(() => new THREE.TubeGeometry(laneCurve(0), 240, 0.01, 6, true), [])
  const cyanFlow = useMemo(() => flowMaterial('#22d3ee', { density: 10, speed: 0.5, base: 0.35, strength: 2 }), [])
  const orangeFlow = useMemo(() => flowMaterial('#fb923c', { density: 10, speed: 0.45, base: 0.35, strength: 2 }), [])
  const dividerFlow = useMemo(() => flowMaterial('#e2e8f0', { density: 24, speed: 0.3, base: 0.12, strength: 1 }), [])
  useShaderClock([cyanFlow, orangeFlow, dividerFlow])

  const asphalt = useMemo(() => {
    const shape = new THREE.Shape()
    const hole = new THREE.Path()
    const steps = 96
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2
      const x = Math.cos(a) * (A + 0.45)
      const z = Math.sin(a) * (B + 0.45)
      if (i === 0) shape.moveTo(x, z)
      else shape.lineTo(x, z)
      const hx = Math.cos(a) * (A - 0.45)
      const hz = Math.sin(a) * (B - 0.45)
      if (i === 0) hole.moveTo(hx, hz)
      else hole.lineTo(hx, hz)
    }
    shape.holes.push(hole)
    return new THREE.ShapeGeometry(shape, 1)
  }, [])

  return (
    <FloorGroup stage={4}>
      <mesh geometry={asphalt} position={[CENTER.x, 0.05, CENTER.z]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#0b0f17" metalness={0.3} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={inner} material={cyanFlow} />
      <mesh geometry={outer} material={orangeFlow} />
      <mesh geometry={divider} material={dividerFlow} />
      {/* Finish line */}
      <group position={trackPoint(0, 0, new THREE.Vector3()).setY(0.07)}>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[0.03, 0, -0.42 + i * 0.12 + 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.12, 0.12]} />
            <meshBasicMaterial color={i % 2 ? '#0f172a' : '#f8fafc'} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <Gates />
      <Racer index={0} />
      <Racer index={1} />
      <Scoreboard />
      <Text font={MONO} fontSize={0.16} letterSpacing={0.1} color="#fdba74" anchorX="center" position={[0, 0.03, 3.1]} rotation={[-Math.PI / 2, 0, 0]}>
        SOCKET.IO ROOMS · ONE WINNER PER TRANSACTION
      </Text>
    </FloorGroup>
  )
}
