'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaSquareRootAlt, FaCogs, FaCodeBranch, FaRocket } from 'react-icons/fa'
import SectionWrapper from '../shared/SectionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const steps = [
  {
    num: "01",
    title: "Algorithmic Rigor & Math Modeling",
    subtitle: "Discrete Logic & Data Structures",
    desc: "Drawing from my competitive programming background (500+ solved problems across LeetCode & Codeforces), every project starts by evaluating algorithmic complexity, graph structures, and mathematical constraints before writing code.",
    icon: FaSquareRootAlt,
    accent: "#38bdf8",
    badge: "Mathematical Foundation"
  },
  {
    num: "02",
    title: "System Architecture & Schema Design",
    subtitle: "Scalable REST APIs & Data Schemas",
    desc: "Designing production-ready architectures with clean separation of concerns. From PostgreSQL relational schemas with Drizzle ORM to Socket.IO real-time WebSocket state machines, scalability is built in from day one.",
    icon: FaCogs,
    accent: "#c084fc",
    badge: "Architectural Planning"
  },
  {
    num: "03",
    title: "Low-Level Efficiency & WebAssembly",
    subtitle: "Clean C++ & TypeScript Codebase",
    desc: "Building custom execution engines (like MiniLang lexer, AST parser, and bytecode VM) in C++. Compiling performance-critical modules to WebAssembly via Emscripten for zero-latency in-browser execution.",
    icon: FaCodeBranch,
    accent: "#34d399",
    badge: "Low-Level Implementation"
  },
  {
    num: "04",
    title: "Benchmarking & Cloud Deployment",
    subtitle: "Sub-Second Latency & Automated CI/CD",
    desc: "Validating performance with quantitative metrics. Training ML models against clinical reference measurements (S3 Summer Labs) and shipping automated Vercel + Render deployment pipelines for production web apps.",
    icon: FaRocket,
    accent: "#fbbf24",
    badge: "Production Delivery"
  }
]

export default function Methodology() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".methodology-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
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
    <SectionWrapper id="methodology" className="py-28 relative">
      {/* Glow Ambient Highlights */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div ref={containerRef} className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-xs uppercase tracking-widest mb-4">
              <span>Engineering Execution</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white">
              My Approach.
            </h2>
          </div>

          <p className="text-slate-400 text-base md:text-lg max-w-md leading-relaxed">
            A structured 4-stage engineering pipeline designed to transform raw ideas into benchmarked, production-grade applications.
          </p>
        </div>

        {/* 4-Step Interactive Pipeline Cards */}
        <div className="grid md:grid-cols-2 gap-8 relative">
          {steps.map((step, i) => {
            const IconComp = step.icon
            return (
              <div 
                key={step.num}
                className="methodology-card relative p-8 md:p-10 rounded-3xl bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800 hover:border-slate-700 transition-all duration-500 group flex flex-col justify-between overflow-hidden shadow-2xl hover:shadow-[0_0_50px_rgba(129,140,248,0.1)]"
              >
                {/* Big Step Number Watermark */}
                <div 
                  className="absolute -top-6 -right-4 text-[7rem] md:text-[9rem] font-extrabold font-mono opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                  style={{ color: step.accent }}
                >
                  {step.num}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700/60" style={{ color: step.accent }}>
                        <IconComp className="text-xl" />
                      </div>
                      <span className="text-sm font-mono font-bold" style={{ color: step.accent }}>
                        STAGE {step.num}
                      </span>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {step.title}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mb-6 font-medium">
                    {step.subtitle}
                  </div>

                  <p className="text-slate-300 text-base leading-relaxed mb-6">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: step.accent }}></span>
                    Quality Assured
                  </span>
                  <span className="text-slate-500">Pipeline Stage {i + 1}/4</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SectionWrapper>
  )
}
