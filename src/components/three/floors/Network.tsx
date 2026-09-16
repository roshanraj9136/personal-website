'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { BACKENDS, CLIENTS, lbSim, lbStore, type Request } from '@/lib/lbSim'
import { useStore } from '@/lib/store'
import { stageState } from '@/lib/stage'
import { flowMaterial } from '../materials'
import { MONO } from '../Tower'
import { useShaderClock } from '../useFloor'
import FloorGroup from './FloorGroup'

// L3 · Network: a live model of the load balancer (see src/lib/lbSim.ts).
// Click a server to take it down and watch requests retry elsewhere.

const STAGE = 3
const MAX_PACKETS = 90
const LB = new THREE.Vector3(-1.55, 1.35, 0.35)
const DB = new THREE.Vector3(3.45, 0.62, 0.85)
const RACKS = [new THREE.Vector3(0.2, 0, -0.75), new THREE.Vector3(1.2, 0, -0.35), new THREE.Vector3(2.2, 0, 0.05)]
const CLIENT_POS = Array.from({ length: CLIENTS }, (_, i) => {
  const a = -0.95 + (i / (CLIENTS - 1)) * 1.9
  return new THREE.Vector3(-3.55 + Math.abs(a) * 0.5, 0.35, LB.z + Math.sin(a) * 2.1)
})

const COLORS = {
  inbound: new THREE.Color('#67e8f9'),
  dispatch: new THREE.Color('#34d399'),
  refused: new THREE.Color('#fb923c'),
  processing: new THREE.Color('#bef264'),
  response: new THREE.Color('#e0f2fe'),
  outbound: new THREE.Color('#4ade80'),
  error: new THREE.Color('#f43f5e'),
}

function arc(from: THREE.Vector3, to: THREE.Vector3, lift: number) {
  const mid = from.clone().lerp(to, 0.5)
  mid.y = Math.max(from.y, to.y) + lift
  return new THREE.QuadraticBezierCurve3(from.clone(), mid, to.clone())
}

function rackTop(b: number) {
  return RACKS[b].clone().add(new THREE.Vector3(0, 1.55, 0.33))
}

export default function Network({ hover }: { hover: boolean }) {
  const clientPaths = useMemo(() => CLIENT_POS.map((c) => arc(c, LB, 0.6)), [])
  const rackPaths = useMemo(() => RACKS.map((_, b) => arc(LB.clone().add(new THREE.Vector3(0.35, 0, 0)), rackTop(b), 0.9)), [])
  const dbPaths = useMemo(() => RACKS.map((r) => arc(r.clone().add(new THREE.Vector3(0.36, 0.7, 0.2)), DB.clone().add(new THREE.Vector3(0, 0.3, 0)), 0.55)), [])

  const wires = useMemo(() => {
    const make = (curve: THREE.Curve<THREE.Vector3>) => new THREE.TubeGeometry(curve, 40, 0.012, 6, false)
    return [...clientPaths.map(make), ...rackPaths.map(make), ...dbPaths.map(make)]
  }, [clientPaths, rackPaths, dbPaths])
  const wireMaterial = useMemo(() => flowMaterial('#34d399', { density: 3, speed: 0.4, base: 0.1, strength: 0.9 }), [])
  useShaderClock([wireMaterial])

  const packets = useRef<THREE.InstancedMesh>(null)
  const probes = useRef<THREE.InstancedMesh>(null)
  const hub = useRef<THREE.Mesh>(null)
  const leds = useRef<THREE.InstancedMesh>(null)
  const rackBodies = useRef<THREE.MeshStandardMaterial[]>([])
  const lamps = useRef<THREE.MeshBasicMaterial[]>([])

  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), s: new THREE.Vector3(), q: new THREE.Quaternion(), c: new THREE.Color() }), [])
  const snapshot = useStore(lbStore, (s) => s)

  useLayoutEffect(() => {
    if (!packets.current || !leds.current) return
    tmp.m.makeScale(0, 0, 0)
    for (let i = 0; i < MAX_PACKETS; i++) {
      packets.current.setMatrixAt(i, tmp.m)
      packets.current.setColorAt(i, COLORS.inbound)
    }
    let i = 0
    for (let b = 0; b < BACKENDS; b++) {
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 3; col++) {
          tmp.m.makeTranslation(RACKS[b].x - 0.18 + col * 0.18, 0.35 + row * 0.18, RACKS[b].z + 0.312)
          leds.current.setMatrixAt(i, tmp.m)
          leds.current.setColorAt(i, COLORS.dispatch)
          i++
        }
      }
    }
    leds.current.instanceMatrix.needsUpdate = true
  }, [tmp])

  const packetPosition = (r: Request, out: THREE.Vector3) => {
    const t = THREE.MathUtils.clamp(r.t, 0, 1)
    switch (r.phase) {
      case 'inbound':
        return clientPaths[r.client].getPoint(t, out)
      case 'dispatch':
        return rackPaths[r.backend].getPoint(t, out)
      case 'refused':
      case 'response':
        return rackPaths[r.backend].getPoint(1 - t, out)
      case 'processing':
        return t < 0.5 ? dbPaths[r.backend].getPoint(t * 2, out) : dbPaths[r.backend].getPoint((1 - t) * 2, out)
      case 'outbound':
      case 'error':
        return clientPaths[r.client].getPoint(1 - t, out)
    }
  }

  useFrame((state) => {
    const near = Math.abs(stageState.current - STAGE) < 1.8
    if (!near) return
    lbSim.advance(performance.now())
    const t = state.clock.elapsedTime
    const { m, p, s, q, c } = tmp

    if (packets.current) {
      const list = lbSim.requests
      for (let i = 0; i < MAX_PACKETS; i++) {
        const r = list[i]
        if (!r) {
          m.makeScale(0, 0, 0)
          packets.current.setMatrixAt(i, m)
          continue
        }
        packetPosition(r, p)
        const size = r.phase === 'error' ? 0.11 : 0.075
        m.compose(p, q, s.setScalar(size))
        packets.current.setMatrixAt(i, m)
        c.copy(r.retried && r.phase !== 'outbound' && r.phase !== 'refused' ? COLORS.refused : COLORS[r.phase]).multiplyScalar(2.6)
        packets.current.setColorAt(i, c)
      }
      packets.current.instanceMatrix.needsUpdate = true
      if (packets.current.instanceColor) packets.current.instanceColor.needsUpdate = true
    }

    if (probes.current) {
      for (let i = 0; i < BACKENDS * 2; i++) {
        const probe = lbSim.probes[i]
        if (!probe) {
          m.makeScale(0, 0, 0)
        } else {
          rackPaths[probe.backend].getPoint(probe.t, p)
          m.compose(p, q, s.setScalar(1))
        }
        probes.current.setMatrixAt(i, m)
      }
      probes.current.instanceMatrix.needsUpdate = true
    }

    if (hub.current) {
      hub.current.rotation.y = t * 0.8
      hub.current.rotation.x = Math.sin(t * 0.6) * 0.3
    }

    if (leds.current) {
      let i = 0
      for (let b = 0; b < BACKENDS; b++) {
        const killed = lbSim.killed[b]
        const activity = Math.min(1, lbSim.inFlight[b] / 3)
        for (let k = 0; k < 21; k++) {
          const blink = Math.sin(t * (6 + k * 1.7) + k * 13.1 + b * 5) > 0.2 - activity
          if (killed) c.setRGB(0.25 + 0.25 * Math.max(0, Math.sin(t * 6)), 0.02, 0.02)
          else c.copy(COLORS.dispatch).multiplyScalar(blink ? 2.4 : 0.25)
          leds.current.setColorAt(i++, c)
        }
      }
      if (leds.current.instanceColor) leds.current.instanceColor.needsUpdate = true
    }

    for (let b = 0; b < BACKENDS; b++) {
      const body = rackBodies.current[b]
      if (body) {
        body.emissive.set(lbSim.killed[b] ? '#7f1d1d' : '#062e24')
        body.emissiveIntensity = lbSim.killed[b] ? 0.6 + 0.4 * Math.sin(t * 6) : 0.5
      }
      const lamp = lamps.current[b]
      if (lamp) {
        // Green: healthy. Amber: down, but the balancer has not noticed yet. Red: marked down after 3 failed probes.
        lamp.color.set(!lbSim.killed[b] ? '#22c55e' : lbSim.alive[b] ? '#f59e0b' : '#ef4444').multiplyScalar(2.5)
      }
    }
  })

  const setCursor = (value: string) => {
    if (hover) document.body.style.cursor = value
  }

  return (
    <FloorGroup stage={STAGE}>
      {wires.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={wireMaterial} />
      ))}

      {CLIENT_POS.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <boxGeometry args={[0.26, 0.17, 0.02]} />
            <meshBasicMaterial color="#67e8f9" toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.12, 0.07]} rotation={[-1.2, 0, 0]}>
            <boxGeometry args={[0.28, 0.16, 0.01]} />
            <meshStandardMaterial color="#1f2937" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <Text font={MONO} fontSize={0.12} color="#67e8f9" anchorX="center" position={[-3.35, 1.25, LB.z]}>
        CLIENTS
      </Text>

      {/* Load balancer */}
      <mesh position={[LB.x, 0.45, LB.z]}>
        <cylinderGeometry args={[0.3, 0.42, 0.9, 24]} />
        <meshStandardMaterial color="#0b1f1a" metalness={0.7} roughness={0.35} emissive="#064e3b" emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={hub} position={LB}>
        <octahedronGeometry args={[0.36, 0]} />
        <meshBasicMaterial color="#34d399" toneMapped={false} wireframe />
      </mesh>
      <mesh position={LB}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial color={new THREE.Color('#6ee7b7').multiplyScalar(2)} toneMapped={false} />
      </mesh>
      <Text font={MONO} fontSize={0.12} color="#6ee7b7" anchorX="center" position={[LB.x, LB.y + 0.62, LB.z]}>
        LOAD BALANCER
      </Text>
      <Text font={MONO} fontSize={0.1} color="#a7f3d0" anchorX="center" position={[LB.x, LB.y + 0.45, LB.z]}>
        {`served ${snapshot.served}   retries ${snapshot.retries}   502s ${snapshot.failed}`}
      </Text>

      {/* Backends */}
      {RACKS.map((pos, b) => (
        <group key={b}>
          <group
            position={[pos.x, 0.9, pos.z]}
            onClick={(e) => {
              e.stopPropagation()
              lbSim.toggleBackend(b)
            }}
            onPointerOver={() => setCursor('pointer')}
            onPointerOut={() => setCursor('')}
          >
            <RoundedBox args={[0.72, 1.8, 0.6]} radius={0.04} smoothness={3}>
              <meshStandardMaterial ref={(m) => { if (m) rackBodies.current[b] = m }} color="#0d1117" metalness={0.75} roughness={0.35} emissive="#062e24" emissiveIntensity={0.5} />
            </RoundedBox>
          </group>
          <mesh position={[pos.x, 1.9, pos.z]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshBasicMaterial ref={(m) => { if (m) lamps.current[b] = m }} color="#22c55e" toneMapped={false} />
          </mesh>
          <Text font={MONO} fontSize={0.1} color={snapshot.killed[b] ? '#fca5a5' : '#d1fae5'} anchorX="center" position={[pos.x, 2.25, pos.z]}>
            {`backend-${b + 1}`}
          </Text>
          <Text font={MONO} fontSize={0.085} color={snapshot.killed[b] ? '#fca5a5' : '#a7f3d0'} anchorX="center" position={[pos.x, 2.1, pos.z]}>
            {snapshot.killed[b] ? (snapshot.alive[b] ? 'down · not detected yet' : 'marked down') : `in-flight ${snapshot.inFlight[b]}`}
          </Text>
        </group>
      ))}
      <instancedMesh ref={leds} args={[undefined, undefined, BACKENDS * 21]}>
        <boxGeometry args={[0.1, 0.05, 0.01]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* PostgreSQL */}
      <group position={DB}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, -0.35 + i * 0.32, 0]}>
            <mesh>
              <cylinderGeometry args={[0.52, 0.52, 0.26, 40]} />
              <meshStandardMaterial color="#0f1a0a" metalness={0.6} roughness={0.4} emissive="#365314" emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[0, 0.131, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.52, 0.018, 8, 64]} />
              <meshBasicMaterial color={new THREE.Color('#a3e635').multiplyScalar(2)} toneMapped={false} />
            </mesh>
          </group>
        ))}
        <Text font={MONO} fontSize={0.11} color="#d9f99d" anchorX="center" position={[0, 0.72, 0]}>
          POSTGRESQL
        </Text>
      </group>

      <instancedMesh ref={packets} args={[undefined, undefined, MAX_PACKETS]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={probes} args={[undefined, undefined, BACKENDS * 2]}>
        <torusGeometry args={[0.1, 0.012, 6, 24]} />
        <meshBasicMaterial color={new THREE.Color('#e0f2fe').multiplyScalar(2)} toneMapped={false} />
      </instancedMesh>

      <Text font={MONO} fontSize={0.15} letterSpacing={0.1} color="#6ee7b7" anchorX="center" position={[0, 0.03, 3.05]} rotation={[-Math.PI / 2, 0, 0]}>
        {hover ? 'CLICK A SERVER TO TAKE IT DOWN' : 'LEAST-CONNECTIONS · RETRY · HEALTH CHECKS'}
      </Text>
    </FloorGroup>
  )
}
