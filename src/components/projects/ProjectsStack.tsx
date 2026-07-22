'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaGithub, FaExternalLinkAlt, FaCode, FaMicrochip, FaTerminal } from 'react-icons/fa'
import SectionWrapper from '../shared/SectionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const portfolioProjects = [
  {
    id: 'algorace',
    title: 'AlgoRace -- Real-Time Competitive Coding Platform',
    category: 'Full-Stack & Real-Time',
    desc: 'Architected and deployed a full-stack competitive coding platform with JWT-based authentication, practice mode, leaderboards, and live match updates. Engineered the production API with Express.js, PostgreSQL (Drizzle ORM), and Socket.IO for real-time race state synchronization.',
    highlights: [
      'Socket.IO live match state synchronization',
      'PostgreSQL database with Drizzle ORM schema',
      'JWT Auth & session state security',
      'Production deployment on Vercel + Render'
    ],
    tags: ['React', 'TypeScript', 'Express.js', 'PostgreSQL', 'Socket.IO', 'Drizzle ORM', 'JWT', 'Tailwind CSS'],
    accent: '#3b82f6',
    github: 'https://github.com/roshanraj9136/Algorace',
    live: 'https://algorace-omega.vercel.app/',
    icon: FaCode
  },
  {
    id: 'minilang',
    title: 'MiniLang -- Custom Compiler & Visual Debugger',
    category: 'Systems & WebAssembly',
    desc: 'Designed and built a custom statically-typed programming language from scratch — including a lexer, recursive-descent parser, semantic analyzer, and stack-based bytecode generator in C++. Compiled the compiler core and virtual machine to WebAssembly via Emscripten for native-speed execution in the browser.',
    highlights: [
      'Lexer, recursive-descent parser & AST construction in C++',
      'Stack-based virtual machine (VM) bytecode execution engine',
      'WebAssembly compilation via Emscripten for zero-latency browser runs',
      'Interactive web IDE with Monaco editor & instruction-level visual debugger'
    ],
    tags: ['C++', 'Emscripten', 'WebAssembly', 'React', 'Monaco Editor', 'Compiler Theory', 'Bytecode VM'],
    accent: '#a855f7',
    github: 'https://github.com/roshanraj9136/minilang',
    live: 'https://minilang-one.vercel.app/',
    icon: FaTerminal
  },
  {
    id: 'hbmeter',
    title: 'Non-Invasive Hemoglobin (Hb) Estimation System',
    category: 'Signal Processing & Embedded ML',
    desc: 'Engineered a non-invasive hemoglobin estimation framework using fingertip video captured under controlled multi-wavelength LED illumination. Built an end-to-end signal processing pipeline covering ROI extraction, noise reduction, PPG signal normalization, and feature extraction. Validated ML regression models against clinical reference measurements.',
    highlights: [
      'Optical PPG signal extraction from fingertip video streams',
      'Multi-wavelength LED illumination ROI selection & noise reduction',
      'Machine learning regression validated against clinical Hb measurements',
      'Optimized for embedded real-time execution on resource-constrained hardware'
    ],
    tags: ['Python', 'Scikit-learn', 'OpenCV', 'Signal Processing', 'PPG Analytics', 'Embedded ML', 'NumPy'],
    accent: '#10b981',
    github: 'https://github.com/roshanraj9136/hb-meter',
    live: '#',
    icon: FaMicrochip
  }
]

export default function ProjectsStack() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState('ALL')

  const filteredProjects = filter === 'ALL' 
    ? portfolioProjects 
    : portfolioProjects.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()))

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.project-card').forEach((card: any) => {
        gsap.fromTo(card, 
          { y: 50, opacity: 0 },
          {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out'
          }
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [filteredProjects])

  return (
    <SectionWrapper id="projects" className="py-24">
      <div ref={containerRef} className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="text-indigo-400 font-mono text-sm uppercase tracking-widest mb-3">Featured Engineering</div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-100">
              Selected Projects.
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 self-start">
            {['ALL', 'Full-Stack', 'Systems', 'ML'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 text-xs font-mono rounded-xl transition-all ${
                  filter === cat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {filteredProjects.map((project, i) => {
            const IconComponent = project.icon
            return (
              <div 
                key={project.id} 
                className="project-card relative group rounded-3xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1" 
                  style={{ background: `linear-gradient(90deg, ${project.accent}, transparent)` }}
                ></div>

                <div className="p-8 md:p-12">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <span 
                      className="px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-semibold bg-white/5 border border-white/10"
                      style={{ color: project.accent }}
                    >
                      {project.category}
                    </span>

                    <div className="flex items-center gap-4">
                      {project.github !== '#' && (
                        <a 
                          href={project.github} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-mono"
                        >
                          <FaGithub className="text-lg" /> <span>GitHub</span>
                        </a>
                      )}
                      {project.live !== '#' && (
                        <a 
                          href={project.live} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-500/30 transition-all text-sm font-semibold shadow-lg shadow-indigo-500/10"
                        >
                          <FaExternalLinkAlt className="text-xs" /> <span>Live Playground / App</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10" style={{ color: project.accent }}>
                          <IconComponent className="text-xl" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                          {project.title}
                        </h3>
                      </div>

                      <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6 font-normal">
                        {project.desc}
                      </p>

                      <div className="space-y-2 mb-6">
                        <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">Key Engineering Highlights</div>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {project.highlights.map((h, j) => (
                            <div key={j} className="flex items-start text-sm text-slate-300">
                              <span className="text-indigo-400 mr-2">✓</span>
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {project.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white/5 text-slate-300 text-xs font-mono rounded-lg border border-white/10">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-1 bg-black/40 rounded-2xl p-6 border border-white/5 flex flex-col justify-between h-full">
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Project Status</div>
                        <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-semibold mb-4">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span> Production Ready / Deployed
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                          Fully documented with modular source code on GitHub and live browser demo link.
                        </p>
                      </div>

                      {project.live !== '#' ? (
                        <a 
                          href={project.live} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full py-3 bg-white/10 hover:bg-indigo-600 text-white font-medium text-sm rounded-xl text-center transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                          Launch Live Application <FaExternalLinkAlt className="text-xs" />
                        </a>
                      ) : (
                        <a 
                          href={project.github} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl text-center transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                          View GitHub Repository <FaGithub className="text-base" />
                        </a>
                      )}
                    </div>
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
