'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaGraduationCap, FaTrophy, FaCode, FaBookOpen } from 'react-icons/fa'
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 font-mono text-xs uppercase tracking-widest mb-4">
              <span>academics.cpp</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white">
              Education & Honors.
            </h2>
          </div>
          <p className="text-slate-400 text-sm md:text-base max-w-md font-mono">
            IIT Bhilai CSE undergraduate coursework & verified competitive programming honors.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* IIT Bhilai Education Card */}
          <div className="edu-card p-8 md:p-10 rounded-3xl bg-[#090d16]/80 backdrop-blur-xl border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <FaGraduationCap className="text-2xl" />
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-indigo-300">
                  Expected May 2027
                </div>
              </div>

              <h3 className="text-3xl font-extrabold text-white mb-2">
                IIT Bhilai
              </h3>
              <div className="text-lg text-slate-300 font-medium mb-6">
                Bachelor of Technology in Computer Science & Engineering
              </div>

              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 font-semibold flex items-center gap-2">
                  <FaBookOpen className="text-indigo-400" />
                  <span>CS Core Coursework</span>
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
                    <span key={course} className="px-3.5 py-1.5 bg-white/5 text-slate-200 text-xs font-mono rounded-xl border border-white/10">
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Honors & CP Achievements */}
          <div className="flex flex-col gap-8">
            {/* Competitive Programming */}
            <div className="edu-card p-8 rounded-3xl bg-[#090d16]/80 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.1)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <FaCode className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Competitive Programming
                  </h3>
                  <div className="text-purple-300 text-xs font-mono">LeetCode & Codeforces</div>
                </div>
              </div>
              <p className="text-slate-300 text-base leading-relaxed font-sans">
                Solved <span className="text-purple-400 font-mono font-bold">500+ problems</span> across medium--hard difficulty. Strong foundation in arrays, strings, graph algorithms, dynamic programming, and trees.
              </p>
            </div>

            {/* Ramanujan Math Olympiad */}
            <div className="edu-card p-8 rounded-3xl bg-[#090d16]/80 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_40px_rgba(52,211,153,0.1)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FaTrophy className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Ramanujan Mathematics Olympiad 2023
                  </h3>
                  <div className="text-emerald-300 text-xs font-mono">Patna District, Bihar</div>
                </div>
              </div>
              <p className="text-slate-300 text-base leading-relaxed font-sans">
                Secured <span className="text-emerald-400 font-mono font-bold">2nd Rank</span> in Patna District in the state-level Ramanujan Mathematics Olympiad held across Bihar.
              </p>
            </div>
          </div>

        </div>
      </div>
    </SectionWrapper>
  )
}
