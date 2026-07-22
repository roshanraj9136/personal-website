'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { FaFileDownload, FaGithub, FaExternalLinkAlt, FaCodeBranch } from 'react-icons/fa'
import Canvas3D from './Canvas3D'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        delay: 0.2
      })

      gsap.from(subtitleRef.current?.children || [], {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.6
      })

      gsap.from(ctaRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.9
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative flex flex-col justify-center min-h-screen px-6 overflow-hidden sm:px-12 lg:px-24 bg-[#040407] pt-24">
      <Canvas3D />
      
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-indigo-300 mb-8 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span>Undergraduate @ IIT Bhilai | CSE 2027</span>
        </div>

        <h1 
          ref={titleRef} 
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-slate-100 mb-6 leading-none"
        >
          ROSHAN <span className="text-indigo-500">RAJ</span>
        </h1>
        
        <div ref={subtitleRef} className="flex flex-wrap justify-center gap-3 text-lg sm:text-xl md:text-2xl font-medium text-slate-300 mb-10 max-w-3xl leading-relaxed">
          <span className="px-3 py-1 bg-white/5 rounded-xl border border-white/10 text-indigo-300">Full-Stack Development</span>
          <span className="px-3 py-1 bg-white/5 rounded-xl border border-white/10 text-violet-300">Systems & Compilers</span>
          <span className="px-3 py-1 bg-white/5 rounded-xl border border-white/10 text-emerald-300">Machine Learning</span>
        </div>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed">
          Building high-performance web systems, custom WebAssembly compilers, and embedded signal-processing ML models.
        </p>

        {/* Action Buttons */}
        <div ref={ctaRef} className="flex flex-wrap justify-center items-center gap-4 w-full max-w-xl">
          <a
            href="/roshan-resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all duration-300 hover:scale-[1.02]"
          >
            <FaFileDownload className="text-lg" />
            <span>Download Resume PDF</span>
          </a>

          <a
            href="https://github.com/roshanraj9136"
            target="_blank"
            rel="noreferrer"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-200 font-semibold rounded-2xl border border-white/10 hover:border-white/25 transition-all duration-300"
          >
            <FaGithub className="text-xl" />
            <span>GitHub</span>
          </a>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-6 md:gap-12 mt-16 pt-12 border-t border-white/5 w-full max-w-3xl">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-indigo-400 font-mono">500+</div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-1">CP Problems Solved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-violet-400 font-mono">2+</div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-1">Live Web Apps</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 font-mono">1</div>
            <div className="text-xs text-slate-400 font-mono uppercase tracking-wider mt-1">S3 Summer Labs Intern</div>
          </div>
        </div>
      </div>
    </section>
  )
}
