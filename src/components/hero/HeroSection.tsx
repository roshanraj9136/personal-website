'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Canvas3D from './Canvas3D'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.2
      })

      gsap.from(subtitleRef.current?.children || [], {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.6
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative flex flex-col justify-center min-h-screen px-6 overflow-hidden sm:px-12 lg:px-24 bg-[#0a0a0f]">
      <Canvas3D />
      
      <div className="relative z-10 w-full flex flex-col items-center text-center pointer-events-none mt-[-10vh]">
        <h1 
          ref={titleRef} 
          className="text-[12vw] leading-none font-extrabold tracking-tighter text-transparent mix-blend-difference"
          style={{ WebkitTextStroke: '2px rgba(255,255,255,0.9)' }}
        >
          ROSHAN RAJ
        </h1>
        
        <div ref={subtitleRef} className="flex flex-wrap justify-center gap-4 text-xl sm:text-2xl md:text-3xl font-medium text-slate-300 mt-8 font-mono">
          <span>Full-Stack.</span>
          <span>Machine Learning.</span>
          <span>Algorithms.</span>
        </div>
      </div>
    </section>
  )
}
