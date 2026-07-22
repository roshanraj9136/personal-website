'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaGraduationCap, FaTrophy, FaCode } from 'react-icons/fa'
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
    <SectionWrapper id="education" className="py-24">
      <div ref={containerRef} className="max-w-5xl mx-auto">
        <div className="text-indigo-400 font-mono text-sm uppercase tracking-widest mb-3">Academic & Honors</div>
        <h2 className="text-4xl md:text-6xl font-extrabold mb-16 tracking-tighter text-slate-100">
          Education & Achievements.
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Education Card */}
          <div className="edu-card p-8 md:p-10 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-indigo-500/30 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <FaGraduationCap className="text-2xl" />
                </div>
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-indigo-300">
                  Expected May 2027
                </div>
              </div>

              <h3 className="text-3xl font-extrabold text-slate-100 mb-2 group-hover:text-indigo-400 transition-colors">
                Indian Institute of Technology (IIT) Bhilai
              </h3>
              <div className="text-xl text-slate-300 font-medium mb-8">
                Bachelor of Technology in Computer Science & Engineering
              </div>

              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4 font-semibold">
                  Relevant Coursework
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Data Structures & Algorithms",
                    "Operating Systems",
                    "Computer Networks",
                    "DBMS",
                    "Machine Learning",
                    "Probability & Statistics",
                    "Linear Algebra",
                    "Discrete Mathematics"
                  ].map(course => (
                    <span key={course} className="px-3.5 py-1.5 bg-white/5 text-slate-300 text-xs font-mono rounded-xl border border-white/10">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Stack */}
          <div className="flex flex-col gap-8">
            {/* Competitive Programming */}
            <div className="edu-card p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-violet-500/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <FaCode className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-violet-400 transition-colors">
                    Competitive Programming
                  </h3>
                  <div className="text-slate-400 text-xs font-mono">LeetCode & Codeforces</div>
                </div>
              </div>
              <p className="text-slate-300 text-base leading-relaxed">
                Solved <span className="text-violet-400 font-mono font-bold">500+ problems</span> across medium--hard difficulty. Strong foundation in arrays, strings, graph algorithms, dynamic programming, and trees.
              </p>
            </div>

            {/* Ramanujan Olympiad */}
            <div className="edu-card p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FaTrophy className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    Ramanujan Mathematics Olympiad 2023
                  </h3>
                  <div className="text-slate-400 text-xs font-mono">Patna District, Bihar</div>
                </div>
              </div>
              <p className="text-slate-300 text-base leading-relaxed">
                Secured <span className="text-emerald-400 font-mono font-bold">2nd Rank</span> in Patna District in the state-level Ramanujan Mathematics Olympiad held across Bihar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
