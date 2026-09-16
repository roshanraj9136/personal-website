'use client'

import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { skillGraph } from '@/content/site'
import { MONO } from '../Tower'
import FloorGroup from './FloorGroup'

// L6 · Skills: every skill links to the projects on this page that use it.

const PROJECT_COLORS = ['#ff8a1f', '#818cf8', '#34d399', '#fb923c', '#a78bfa']

export default function SkillsGraph({ hover }: { hover: boolean }) {
  const [focus, setFocus] = useState<number | null>(null)
  const graph = useRef<THREE.Group>(null)

  const layout = useMemo(() => {
    const projects = skillGraph.projects.map((name, i) => {
      const a = (i / skillGraph.projects.length) * Math.PI * 2 - Math.PI / 2
      return { name, angle: a, position: new THREE.Vector3(Math.cos(a) * 1.7, 1.55, Math.sin(a) * 1.7) }
    })
    const skills = skillGraph.skills.map(([name, uses], i) => {
      const indices = uses.map((p) => skillGraph.projects.indexOf(p))
      // Place each skill near the average direction of the projects that use it.
      let sx = 0
      let sz = 0
      for (const p of indices) {
        sx += Math.cos(projects[p].angle)
        sz += Math.sin(projects[p].angle)
      }
      // Golden-ratio offsets spread skills that share projects so their labels do not collide.
      const spread = ((i * 0.618034) % 1) - 0.5
      const a = Math.atan2(sz, sx) + spread * 1.3
      const r = 3.0 + ((i * 0.381966) % 1) * 1.2
      const y = 0.45 + ((i * 0.7548776) % 1) * 3.0
      return { name, indices, position: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r) }
    })
    return { projects, skills }
  }, [])

  const lines = useMemo(() => {
    const positions: number[] = []
    const owners: number[] = []
    for (const skill of layout.skills) {
      for (const p of skill.indices) {
        positions.push(skill.position.x, skill.position.y, skill.position.z, layout.projects[p].position.x, layout.projects[p].position.y, layout.projects[p].position.z)
        owners.push(p, p)
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(positions.length), 3))
    return { geometry, owners }
  }, [layout])

  const tmp = useMemo(() => new THREE.Color(), [])
  useFrame((state, delta) => {
    if (graph.current) graph.current.rotation.y += delta * 0.06
    const colors = lines.geometry.getAttribute('color') as THREE.BufferAttribute
    const t = state.clock.elapsedTime
    for (let i = 0; i < lines.owners.length; i++) {
      const p = lines.owners[i]
      const lit = focus === null ? 0.35 + 0.25 * Math.max(0, Math.sin(t * 1.3 - p * 1.2)) : focus === p ? 1.6 : 0.06
      tmp.set(PROJECT_COLORS[p]).multiplyScalar(lit)
      colors.setXYZ(i, tmp.r, tmp.g, tmp.b)
    }
    colors.needsUpdate = true
  })

  return (
    <FloorGroup stage={6}>
      <group ref={graph}>
        <lineSegments geometry={lines.geometry}>
          <lineBasicMaterial vertexColors toneMapped={false} transparent opacity={0.9} />
        </lineSegments>
        {layout.projects.map((project, i) => (
          <group key={project.name} position={project.position}>
            <mesh
              onPointerOver={(e) => {
                if (!hover) return
                e.stopPropagation()
                setFocus(i)
                document.body.style.cursor = 'pointer'
              }}
              onPointerOut={() => {
                if (!hover) return
                setFocus(null)
                document.body.style.cursor = ''
              }}
            >
              <icosahedronGeometry args={[0.24, 2]} />
              <meshBasicMaterial color={new THREE.Color(PROJECT_COLORS[i]).multiplyScalar(focus === null || focus === i ? 2.4 : 0.5)} toneMapped={false} />
            </mesh>
            <Billboard>
              <Text font={MONO} fontSize={0.16} color="#ffffff" anchorX="center" position={[0, 0.42, 0]}>
                {project.name}
              </Text>
            </Billboard>
          </group>
        ))}
        {layout.skills.map((skill) => {
          const related = focus === null || skill.indices.includes(focus)
          return (
            <group key={skill.name} position={skill.position}>
              <mesh>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshBasicMaterial color={related ? '#e0f2fe' : '#334155'} toneMapped={false} />
              </mesh>
              <Billboard>
                <Text font={MONO} fontSize={0.11} color={related ? '#cbd5e1' : '#475569'} anchorX="center" position={[0, 0.17, 0]}>
                  {skill.name}
                </Text>
              </Billboard>
            </group>
          )
        })}
      </group>
      <Text font={MONO} fontSize={0.15} letterSpacing={0.1} color="#67e8f9" anchorX="center" position={[0, 0.03, 3.4]} rotation={[-Math.PI / 2, 0, 0]}>
        {hover ? 'HOVER A PROJECT TO SEE ITS STACK' : 'SKILLS LINKED TO PROJECTS'}
      </Text>
    </FloorGroup>
  )
}
