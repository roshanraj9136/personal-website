'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { pullRequests } from '@/content/site'
import { flowMaterial } from '../materials'
import { MONO } from '../Tower'
import { useShaderClock } from '../useFloor'
import FloorGroup from './FloorGroup'

// L5 · Open source: five pull-request branches merging into main, one per merged PR.

const MAIN_Y = 0.55
const MAIN_Z = 0.9

function shieldGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, 0.62)
  s.bezierCurveTo(0.26, 0.5, 0.42, 0.52, 0.52, 0.5)
  s.bezierCurveTo(0.52, 0.02, 0.4, -0.38, 0, -0.62)
  s.bezierCurveTo(-0.4, -0.38, -0.52, 0.02, -0.52, 0.5)
  s.bezierCurveTo(-0.42, 0.52, -0.26, 0.5, 0, 0.62)
  return new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 })
}

export default function Community() {
  const prs = useMemo(() => [...pullRequests].sort((a, b) => a.number - b.number), [])
  const branches = useMemo(
    () =>
      prs.map((pr, k) => {
        const xs = -3.2 + k * 1.3
        const xe = xs + 1.05
        const top = [1.35, 2.05, 1.6, 2.3, 1.8][k]
        const curve = new THREE.CubicBezierCurve3(new THREE.Vector3(xs, MAIN_Y, MAIN_Z), new THREE.Vector3(xs, top, MAIN_Z - 0.9), new THREE.Vector3(xe, top, MAIN_Z - 0.9), new THREE.Vector3(xe, MAIN_Y, MAIN_Z))
        return { pr, curve, merge: new THREE.Vector3(xe, MAIN_Y, MAIN_Z), geometry: new THREE.TubeGeometry(curve, 48, 0.028, 8, false) }
      }),
    [prs],
  )
  const main = useMemo(() => new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(-3.7, MAIN_Y, MAIN_Z), new THREE.Vector3(3.7, MAIN_Y, MAIN_Z)), 64, 0.045, 10, false), [])
  const mainFlow = useMemo(() => flowMaterial('#4ade80', { density: 8, speed: 0.35, base: 0.3, strength: 2.2 }), [])
  const branchFlow = useMemo(() => flowMaterial('#a78bfa', { density: 2, speed: 0.5, base: 0.25, strength: 2.6 }), [])
  useShaderClock([mainFlow, branchFlow])

  const shield = useMemo(() => shieldGeometry(), [])
  const shieldGroup = useRef<THREE.Group>(null)
  const mergeNodes = useRef<THREE.Mesh[]>([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (shieldGroup.current) {
      shieldGroup.current.rotation.y = Math.sin(t * 0.5) * 0.45
      shieldGroup.current.position.y = 2.95 + Math.sin(t * 1.1) * 0.06
    }
    mergeNodes.current.forEach((mesh, i) => {
      const beat = Math.max(0, Math.sin(t * 1.6 - i * 0.9))
      mesh.scale.setScalar(1 + beat * 0.35)
    })
  })

  return (
    <FloorGroup stage={5}>
      <mesh geometry={main} material={mainFlow} />
      <Text font={MONO} fontSize={0.11} color="#86efac" anchorX="left" position={[-3.7, MAIN_Y - 0.28, MAIN_Z + 0.1]}>
        main
      </Text>
      {branches.map(({ pr, curve, merge, geometry }, k) => (
        <group key={pr.number}>
          <mesh geometry={geometry} material={branchFlow} />
          {[0.3, 0.7].map((u) => (
            <mesh key={u} position={curve.getPoint(u)}>
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshBasicMaterial color={new THREE.Color('#f472b6').multiplyScalar(2.2)} toneMapped={false} />
            </mesh>
          ))}
          <mesh ref={(m) => { if (m) mergeNodes.current[k] = m }} position={merge}>
            <sphereGeometry args={[0.12, 20, 20]} />
            <meshBasicMaterial color={new THREE.Color('#4ade80').multiplyScalar(2.4)} toneMapped={false} />
          </mesh>
          <Text font={MONO} fontSize={0.16} color={pr.type === 'security' ? '#c4b5fd' : '#f9a8d4'} anchorX="center" position={[curve.getPoint(0.5).x, curve.getPoint(0.5).y + 0.25, curve.getPoint(0.5).z]}>
            {`#${pr.number}`}
          </Text>
          <Text font={MONO} fontSize={0.075} color="#94a3b8" anchorX="center" position={[curve.getPoint(0.5).x, curve.getPoint(0.5).y + 0.08, curve.getPoint(0.5).z]}>
            {pr.type.toUpperCase()}
          </Text>
        </group>
      ))}

      <group ref={shieldGroup} position={[0, 2.95, -1.6]}>
        <mesh geometry={shield} position={[0, 0, -0.06]}>
          <meshStandardMaterial color="#1e1b4b" metalness={0.8} roughness={0.25} emissive="#7c3aed" emissiveIntensity={0.9} />
        </mesh>
        <mesh geometry={shield} scale={1.06} position={[0, 0, -0.08]}>
          <meshBasicMaterial color={new THREE.Color('#c4b5fd').multiplyScalar(1.6)} toneMapped={false} wireframe />
        </mesh>
        <Text font={MONO} fontSize={0.1} color="#ede9fe" anchorX="center" position={[0, -0.05, 0.16]}>
          SECURE
        </Text>
      </group>

      <Text font={MONO} fontSize={0.15} letterSpacing={0.1} color="#c4b5fd" anchorX="center" position={[0, 0.03, 3.05]} rotation={[-Math.PI / 2, 0, 0]}>
        OPENLAKE / RATEMYCOURSE · 5 MERGED PRS
      </Text>
    </FloorGroup>
  )
}
