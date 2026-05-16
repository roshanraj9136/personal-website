'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedShape() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    meshRef.current.rotation.x = Math.sin(t / 4)
    meshRef.current.rotation.y = Math.sin(t / 2)
    
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, (state.mouse.x * 2), 0.05)
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, (state.mouse.y * 2), 0.05)
  })

  return (
    <Sphere ref={meshRef} args={[1.5, 64, 64]} scale={1.8}>
      <MeshDistortMaterial 
        color="#8b5cf6"
        attach="material"
        distort={0.5}
        speed={1.5}
        roughness={0.2}
        metalness={1}
        wireframe={true}
      />
    </Sphere>
  )
}

export default function Canvas3D() {
  return (
    <div className="absolute inset-0 z-0 opacity-50 mix-blend-screen pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} color="#6366f1" intensity={2} />
        <AnimatedShape />
      </Canvas>
    </div>
  )
}
