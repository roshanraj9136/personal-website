'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionWrapper from '../shared/SectionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function EducationSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".edu-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <SectionWrapper id="education" className="pb-32">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-16 tracking-tighter text-slate-100">
          Education & Honors.
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Education Card */}
          <div className="edu-card p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-colors group h-full">
            <div className="text-indigo-400 font-mono text-sm mb-4">Expected May 2027</div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">
              IIT Bhilai
            </h3>
            <div className="text-lg text-slate-300 font-medium mb-6">
              B.Tech in Computer Science & Engineering
            </div>
            <div>
              <div className="text-sm text-slate-500 font-mono uppercase tracking-wider mb-3">Key Coursework</div>
              <div className="flex flex-wrap gap-2">
                {["DSA", "Operating Systems", "Computer Networks", "DBMS", "Machine Learning", "Probability & Statistics"].map(course => (
                  <span key={course} className="px-3 py-1 bg-white/5 text-slate-300 text-xs rounded-full border border-white/10">
                    {course}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements Card */}
          <div className="flex flex-col gap-8">
            <div className="edu-card p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-colors group flex-1">
              <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-violet-400 transition-colors">
                Competitive Programming
              </h3>
              <div className="text-slate-500 text-sm mb-4 font-mono">LeetCode, Codeforces</div>
              <p className="text-slate-300 leading-relaxed">
                Solved <span className="text-violet-400 font-mono">500+ problems</span> across medium–hard difficulty. 
                Strong algorithmic foundations in graph theory, dynamic programming, and advanced data structures.
              </p>
            </div>

            <div className="edu-card p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-colors group flex-1">
              <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">
                JEE Advanced 2023
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Cleared one of the most competitive engineering exams globally. Secured admission to IIT Bhilai, placing in the <span className="text-cyan-400 font-mono">top 2% of 1M+ candidates</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
