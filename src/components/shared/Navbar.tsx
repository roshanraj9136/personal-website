'use client'

import { useState, useEffect } from 'react'
import { FaFileCode, FaTerminal, FaBriefcase, FaGraduationCap, FaDownload, FaEnvelope, FaCode } from 'react-icons/fa'

export default function Navbar() {
  const [activeTab, setActiveTab] = useState('hero')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string, tabName: string) => {
    e.preventDefault()
    setActiveTab(tabName)
    if (typeof window !== 'undefined' && (window as any).lenis) {
      if (target === 'top') {
        (window as any).lenis.scrollTo(0)
      } else {
        (window as any).lenis.scrollTo(target)
      }
    } else {
      if (target === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className="fixed top-0 w-full z-50 p-3 sm:p-4">
      <div className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 ${scrolled ? 'bg-[#090d16]/90 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_30px_rgba(0,242,254,0.1)] py-3 px-6' : 'bg-[#0b0f19]/70 backdrop-blur-md border border-white/10 py-4 px-6'}`}>
        <div className="flex justify-between items-center">
          
          {/* macOS Traffic Lights & Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            <a 
              href="#" 
              onClick={(e) => handleNavClick(e, 'top', 'hero')}
              className="text-sm font-mono font-bold tracking-tight text-slate-200 ml-2 hidden sm:inline-flex items-center gap-2"
            >
              <span className="text-cyan-400">roshan-raj</span>
              <span className="text-slate-500">::</span>
              <span className="text-purple-400">cyber-ide</span>
            </a>
          </div>

          {/* IDE Tabs Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-mono">
            <a 
              href="#capabilities" 
              onClick={(e) => handleNavClick(e, '#capabilities', 'capabilities')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'capabilities' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <FaFileCode className="text-xs text-cyan-400" />
              <span>stack.ts</span>
            </a>

            <a 
              href="#methodology" 
              onClick={(e) => handleNavClick(e, '#methodology', 'methodology')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'methodology' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <FaTerminal className="text-xs text-purple-400" />
              <span>pipeline.sh</span>
            </a>

            <a 
              href="#experience" 
              onClick={(e) => handleNavClick(e, '#experience', 'experience')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'experience' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <FaBriefcase className="text-xs text-emerald-400" />
              <span>experience.log</span>
            </a>

            <a 
              href="#projects" 
              onClick={(e) => handleNavClick(e, '#projects', 'projects')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'projects' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <FaCode className="text-xs text-amber-400" />
              <span>projects.json</span>
            </a>

            <a 
              href="#education" 
              onClick={(e) => handleNavClick(e, '#education', 'education')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'education' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <FaGraduationCap className="text-xs text-indigo-400" />
              <span>academics.cpp</span>
            </a>
          </nav>

          {/* Direct Resume Action */}
          <div className="flex items-center gap-3">
            <a 
              href="/roshan-resume.pdf" 
              target="_blank" 
              rel="noreferrer"
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-lg text-xs font-mono font-semibold shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
            >
              <FaDownload className="text-xs" />
              <span>Resume PDF</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  )
}
