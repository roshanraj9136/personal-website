'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaCode, FaServer, FaBrain, FaTools, FaCheckCircle } from 'react-icons/fa'
import SectionWrapper from '../shared/SectionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const capabilityPillars = [
  {
    id: 'fullstack',
    title: 'Full-Stack & Real-Time Web',
    icon: FaCode,
    badge: 'Production Systems',
    desc: 'Architecting end-to-end web applications with modern frontend frameworks, scalable API servers, relational databases, and WebSocket state synchronization.',
    gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    borderGlow: 'hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(56,189,248,0.15)]',
    accentColor: '#38bdf8',
    skills: [
      { name: 'React.js & Next.js', level: 'Advanced' },
      { name: 'Node.js & Express.js', level: 'Advanced' },
      { name: 'TypeScript & JavaScript', level: 'Advanced' },
      { name: 'PostgreSQL & Drizzle ORM', level: 'Proficient' },
      { name: 'Socket.IO & Real-Time Events', level: 'Proficient' },
      { name: 'Tailwind CSS & Responsive UI', level: 'Advanced' }
    ]
  },
  {
    id: 'systems',
    title: 'Systems, Compilers & WebAssembly',
    icon: FaServer,
    badge: 'Low-Level Engine',
    desc: 'Designing custom programming language pipelines (lexers, parsers, semantic analyzers, bytecode VMs) in C++ and compiling to WebAssembly for native-speed in-browser execution.',
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    borderGlow: 'hover:border-purple-400/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]',
    accentColor: '#c084fc',
    skills: [
      { name: 'C++ & C Memory Mgmt', level: 'Advanced' },
      { name: 'WebAssembly & Emscripten', level: 'Proficient' },
      { name: 'Lexer & AST Parser Design', level: 'Proficient' },
      { name: 'Bytecode VM Execution', level: 'Proficient' },
      { name: 'Monaco Editor Integration', level: 'Proficient' },
      { name: 'Linux System Programming', level: 'Proficient' }
    ]
  },
  {
    id: 'ml',
    title: 'ML & Signal Analytics',
    icon: FaBrain,
    badge: 'Intelligence & Research',
    desc: 'Extracting PPG physiological signals from optical video data and training ML regression models validated against clinical reference measurements for embedded real-time deployment.',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderGlow: 'hover:border-emerald-400/50 hover:shadow-[0_0_40px_rgba(52,211,153,0.15)]',
    accentColor: '#34d399',
    skills: [
      { name: 'Python & Scikit-learn', level: 'Advanced' },
      { name: 'OpenCV Optical Analytics', level: 'Proficient' },
      { name: 'PPG Signal Processing', level: 'Proficient' },
      { name: 'NumPy & Pandas Processing', level: 'Advanced' },
      { name: 'Machine Learning Regression', level: 'Proficient' },
      { name: 'SHAP & Model Interpretability', level: 'Proficient' }
    ]
  },
  {
    id: 'devops',
    title: 'DevOps & Tooling',
    icon: FaTools,
    badge: 'Infrastructure & CP',
    desc: 'Solving 500+ competitive programming challenges with high algorithmic efficiency while maintaining clean CI/CD deployment pipelines on cloud platforms.',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    borderGlow: 'hover:border-amber-400/50 hover:shadow-[0_0_40px_rgba(251,191,36,0.15)]',
    accentColor: '#fbbf24',
    skills: [
      { name: 'Git & GitHub Workflows', level: 'Advanced' },
      { name: 'Docker & Containerization', level: 'Proficient' },
      { name: 'Vercel & Render Cloud', level: 'Advanced' },
      { name: 'Algorithms (DSA & Trees)', level: '500+ Solved' },
      { name: 'LeetCode & Codeforces', level: 'Top Tier' },
      { name: 'REST API Schema Design', level: 'Advanced' }
    ]
  }
]

export default function Capabilities() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activePillar, setActivePillar] = useState('fullstack')

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cap-card', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <SectionWrapper id="capabilities" className="py-28 relative">
      {/* Background Subtle Gradient Highlights */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div ref={containerRef} className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-xs uppercase tracking-widest mb-4">
              <span>Technical Domain Matrix</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white">
              Capabilities & Stack.
            </h2>
          </div>

          <p className="text-slate-400 text-base md:text-lg max-w-md leading-relaxed">
            Bridging core computer science fundamentals with high-performance web systems and machine learning analytics.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {capabilityPillars.map((pillar) => {
            const IconComp = pillar.icon
            return (
              <div 
                key={pillar.id}
                onMouseEnter={() => setActivePillar(pillar.id)}
                className={`cap-card relative p-8 md:p-10 rounded-3xl bg-[#0f172a]/60 backdrop-blur-xl border border-slate-800 transition-all duration-500 flex flex-col justify-between group overflow-hidden ${pillar.borderGlow}`}
              >
                {/* Background Gradient Mesh */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/60" style={{ color: pillar.accentColor }}>
                      <IconComp className="text-2xl" />
                    </div>

                    <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300 font-medium">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4 group-hover:text-cyan-300 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-slate-300 text-base leading-relaxed mb-8">
                    {pillar.desc}
                  </p>
                </div>

                {/* Skills Chips */}
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-4 font-semibold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pillar.accentColor }}></span>
                    <span>Core Technologies</span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {pillar.skills.map((s, j) => (
                      <div key={j} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2">
                          <FaCheckCircle className="text-xs" style={{ color: pillar.accentColor }} />
                          <span className="text-xs font-mono text-slate-200">{s.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/5">{s.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SectionWrapper>
  )
}
