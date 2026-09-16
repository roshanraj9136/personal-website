'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { foldStore, useStore } from '@/lib/store'
import { hologramMaterial } from '../materials'
import { MONO } from '../Tower'
import { useShaderClock } from '../useFloor'
import FloorGroup from './FloorGroup'

// L2 · Compiler: MiniLang compiling `int x = 5 + 10 * 2;`. Token names, AST node
// names, and both bytecode listings are real output from MiniLang's WebAssembly build.

const SOURCE = ['int main() {', '    int x = 5 + 10 * 2;', '    cout << x << endl;', '    return 0;', '}']
const TOKENS = ['KW_INT', 'x', '=', '5', '+', '10', '*', '2', ';']

const UNFOLDED = ['PUSH_INT 5', 'PUSH_INT 10', 'PUSH_INT 2', 'MUL', 'ADD', 'LOAD_LOCAL x', 'WRITE', 'PUSH_STRING', 'WRITE', 'PUSH_INT 0', 'RETURN']
const FOLDED = ['PUSH_INT 25', 'LOAD_LOCAL x', 'WRITE', 'PUSH_STRING', 'WRITE', 'PUSH_INT 0', 'RETURN']

type Node = { id: string; label: string; foldedLabel?: string; pos: THREE.Vector3; parent?: string; folds: boolean }

const NODES: Node[] = [
  { id: 'decl', label: 'VarDeclStmt x : int', pos: new THREE.Vector3(0.55, 3.05, 0), folds: false },
  { id: 'add', label: 'BinaryExpr +', foldedLabel: 'LiteralIntExpr 25', pos: new THREE.Vector3(0.55, 2.3, 0.1), parent: 'decl', folds: false },
  { id: 'five', label: 'LiteralIntExpr 5', pos: new THREE.Vector3(-0.25, 1.55, 0.3), parent: 'add', folds: true },
  { id: 'mul', label: 'BinaryExpr *', pos: new THREE.Vector3(1.35, 1.55, 0.1), parent: 'add', folds: true },
  { id: 'ten', label: 'LiteralIntExpr 10', pos: new THREE.Vector3(0.85, 0.8, 0.35), parent: 'mul', folds: true },
  { id: 'two', label: 'LiteralIntExpr 2', pos: new THREE.Vector3(1.85, 0.8, 0.0), parent: 'mul', folds: true },
]

function CodeScreen() {
  const holo = useMemo(() => hologramMaterial('#818cf8', 0.07), [])
  useShaderClock([holo])
  return (
    <group position={[-2.75, 1.9, -0.9]} rotation={[0, 0.38, 0]}>
      <mesh material={holo}>
        <planeGeometry args={[2.3, 1.45]} />
      </mesh>
      <Text font={MONO} fontSize={0.085} color="#a5b4fc" anchorX="left" anchorY="top" position={[-1.02, 0.62, 0.01]}>
        main.ml
      </Text>
      {SOURCE.map((line, i) => (
        <Text key={i} font={MONO} fontSize={0.11} color={i === 1 ? '#ffffff' : '#94a3b8'} anchorX="left" anchorY="top" position={[-1.02, 0.4 - i * 0.2, 0.01]}>
          {line}
        </Text>
      ))}
    </group>
  )
}

function TokenStream() {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([new THREE.Vector3(-2.1, 1.2, -0.3), new THREE.Vector3(-1.7, 0.55, 0.9), new THREE.Vector3(-0.9, 0.9, 1.3), new THREE.Vector3(-0.35, 2.2, 0.8), new THREE.Vector3(0.35, 3.05, 0.2)]),
    [],
  )
  const tokens = useRef<THREE.Group[]>([])
  const point = useMemo(() => new THREE.Vector3(), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    tokens.current.forEach((group, i) => {
      const u = (t * 0.07 + i / TOKENS.length) % 1
      curve.getPoint(u, point)
      group.position.copy(point)
      const s = Math.min(1, u * 8, (1 - u) * 8)
      group.scale.setScalar(Math.max(0.001, s))
    })
  })

  return (
    <>
      {TOKENS.map((token, i) => (
        <group key={i} ref={(g) => { if (g) tokens.current[i] = g }}>
          <RoundedBox args={[token.length > 2 ? 0.5 : 0.3, 0.2, 0.08]} radius={0.03} smoothness={2}>
            <meshStandardMaterial color="#1e1b4b" emissive="#6366f1" emissiveIntensity={0.9} metalness={0.3} roughness={0.4} />
          </RoundedBox>
          <Text font={MONO} fontSize={0.085} color="#e0e7ff" anchorX="center" anchorY="middle" position={[0, 0, 0.05]}>
            {token}
          </Text>
        </group>
      ))}
    </>
  )
}

function SyntaxTree({ folding }: { folding: React.MutableRefObject<number> }) {
  const nodes = useRef<Record<string, THREE.Group>>({})
  const edges = useRef<Record<string, THREE.Mesh>>({})
  const addMaterial = useRef<THREE.MeshBasicMaterial>(null)
  const current = useMemo(() => Object.fromEntries(NODES.map((n) => [n.id, n.pos.clone()])), [])
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const dir = useMemo(() => new THREE.Vector3(), [])
  const gold = useMemo(() => new THREE.Color('#fbbf24').multiplyScalar(2.2), [])
  const indigo = useMemo(() => new THREE.Color('#818cf8').multiplyScalar(2.2), [])
  const on = useStore(foldStore, (s) => s.on)

  useFrame((state) => {
    const f = folding.current
    const addPos = NODES[1].pos
    for (const node of NODES) {
      const group = nodes.current[node.id]
      if (!group) continue
      const pos = current[node.id]
      if (node.folds) pos.lerpVectors(node.pos, addPos, f)
      else pos.copy(node.pos)
      group.position.copy(pos)
      const scale = node.folds ? Math.max(0.001, 1 - f) : node.id === 'add' ? 1 + f * 0.35 + Math.sin(state.clock.elapsedTime * 4) * 0.03 * f : 1
      group.scale.setScalar(scale)
    }
    for (const node of NODES) {
      if (!node.parent) continue
      const edge = edges.current[node.id]
      if (!edge) continue
      const a = current[node.parent]
      const b = current[node.id]
      dir.subVectors(b, a)
      const length = dir.length()
      edge.visible = length > 0.05
      edge.position.copy(a).addScaledVector(dir, 0.5)
      edge.scale.set(1, Math.max(length, 0.001), 1)
      edge.quaternion.setFromUnitVectors(up, dir.normalize())
    }
    addMaterial.current?.color.copy(indigo).lerp(gold, f)
  })

  return (
    <group>
      {NODES.map((node) => (
        <group key={node.id} ref={(g) => { if (g) nodes.current[node.id] = g }}>
          <mesh>
            <icosahedronGeometry args={[node.id === 'decl' ? 0.16 : 0.13, 1]} />
            {node.id === 'add' ? <meshBasicMaterial ref={addMaterial} color="#818cf8" toneMapped={false} /> : <meshBasicMaterial color={node.id === 'decl' ? '#c4b5fd' : '#818cf8'} toneMapped={false} />}
          </mesh>
          <Text font={MONO} fontSize={0.1} color={node.id === 'add' && on ? '#fde68a' : '#e0e7ff'} anchorX="left" anchorY="middle" position={[0.2, 0.02, 0]}>
            {node.id === 'add' && on ? node.foldedLabel : node.label}
          </Text>
        </group>
      ))}
      {NODES.filter((n) => n.parent).map((node) => (
        <mesh key={node.id} ref={(m) => { if (m) edges.current[node.id] = m }}>
          <cylinderGeometry args={[0.018, 0.018, 1, 6]} />
          <meshBasicMaterial color="#a5b4fc" toneMapped={false} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Bytecode() {
  const on = useStore(foldStore, (s) => s.on)
  const program = on ? FOLDED : UNFOLDED
  const slabs = useRef<THREE.MeshStandardMaterial[]>([])
  const rings = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const ip = Math.floor(t / 0.5) % program.length
    slabs.current.forEach((material, i) => {
      if (!material) return
      material.emissiveIntensity = i === ip ? 2.4 : 0.35
    })
    if (rings.current) {
      rings.current.children.forEach((ring, i) => {
        ring.rotation.x += delta * (0.6 + i * 0.35)
        ring.rotation.y += delta * (0.4 - i * 0.2)
      })
    }
  })

  return (
    <group position={[3.0, 0, -0.35]}>
      {program.map((instruction, i) => (
        <group key={`${on}-${i}`} position={[0, 2.95 - i * 0.235, 0]}>
          <RoundedBox args={[1.55, 0.19, 0.55]} radius={0.03} smoothness={2}>
            <meshStandardMaterial ref={(m) => { if (m) slabs.current[i] = m }} color="#111827" emissive={on && i === 0 ? '#f59e0b' : '#6366f1'} emissiveIntensity={0.35} metalness={0.5} roughness={0.35} />
          </RoundedBox>
          <Text font={MONO} fontSize={0.085} color={on && i === 0 ? '#fde68a' : '#e0e7ff'} anchorX="left" anchorY="middle" position={[-0.68, 0, 0.29]}>
            {`${String(i).padStart(2, '0')}  ${instruction}`}
          </Text>
        </group>
      ))}
      <Text font={MONO} fontSize={0.1} color="#c4b5fd" anchorX="center" position={[0, 3.3, 0]}>
        {`BYTECODE · ${program.length} INSTRUCTIONS`}
      </Text>
      <group position={[0, 3.95, -0.6]}>
        <mesh>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshBasicMaterial color="#c4b5fd" toneMapped={false} />
        </mesh>
        <group ref={rings}>
          {[0.36, 0.48, 0.6].map((r) => (
            <mesh key={r}>
              <torusGeometry args={[r, 0.012, 8, 64]} />
              <meshBasicMaterial color="#a78bfa" toneMapped={false} />
            </mesh>
          ))}
        </group>
        <Text font={MONO} fontSize={0.09} color="#ddd6fe" anchorX="center" position={[0, -0.82, 0]}>
          STACK VM · 60 OPCODES
        </Text>
      </group>
    </group>
  )
}

export default function Compiler() {
  const folding = useRef(foldStore.get().on ? 1 : 0)
  useFrame((_, delta) => {
    const target = foldStore.get().on ? 1 : 0
    folding.current = THREE.MathUtils.damp(folding.current, target, 3, Math.min(delta, 0.05))
  })
  return (
    <FloorGroup stage={2}>
      <CodeScreen />
      <TokenStream />
      <SyntaxTree folding={folding} />
      <Bytecode />
      <Text font={MONO} fontSize={0.16} letterSpacing={0.12} color="#a5b4fc" anchorX="center" position={[0, 0.03, 2.9]} rotation={[-Math.PI / 2, 0, 0]}>
        LEXER · PARSER · OPTIMIZER · CODEGEN · VM
      </Text>
    </FloorGroup>
  )
}
