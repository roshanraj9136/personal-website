'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { FaTerminal, FaPlay, FaFileDownload, FaGithub, FaLinkedin, FaCode, FaCheckCircle } from 'react-icons/fa'
import Canvas3D from './Canvas3D'

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalLogs, setTerminalLogs] = useState<Array<{ type: 'cmd' | 'output' | 'system', text: string }>>([
    { type: 'system', text: '⚡ Initializing Roshan Raj Cyber-IDE v2026.07...' },
    { type: 'system', text: '✔ Student CSE @ IIT Bhilai (B.Tech Expected May 2027)' },
    { type: 'system', text: '✔ Solved 500+ CP Problems (LeetCode / Codeforces)' },
    { type: 'system', text: '✔ Summer Research Intern @ S3 Summer Labs (Signal Analytics & ML)' },
    { type: 'system', text: '💡 Type "help" or click quick commands below.' }
  ])

  const runCommand = (cmdStr: string) => {
    const cleanCmd = cmdStr.trim().toLowerCase()
    const newLogs = [...terminalLogs, { type: 'cmd' as const, text: `$ ${cmdStr}` }]

    if (cleanCmd === 'help') {
      newLogs.push({
        type: 'output',
        text: 'Available Commands: "resume" (Open PDF), "algorace" (Live App), "minilang" (Live Compiler), "stats" (CP Score), "clear"'
      })
    } else if (cleanCmd.includes('resume') || cleanCmd.includes('pdf')) {
      newLogs.push({ type: 'output', text: '📄 Opening roshan-resume.pdf in new tab...' })
      if (typeof window !== 'undefined') window.open('/roshan-resume.pdf', '_blank')
    } else if (cleanCmd.includes('algorace')) {
      newLogs.push({ type: 'output', text: '🚀 Launching AlgoRace Live App at https://algorace-omega.vercel.app/ ...' })
      if (typeof window !== 'undefined') window.open('https://algorace-omega.vercel.app/', '_blank')
    } else if (cleanCmd.includes('minilang')) {
      newLogs.push({ type: 'output', text: '🛠 Launching MiniLang WebAssembly IDE at https://minilang-one.vercel.app/ ...' })
      if (typeof window !== 'undefined') window.open('https://minilang-one.vercel.app/', '_blank')
    } else if (cleanCmd.includes('stats') || cleanCmd.includes('cp')) {
      newLogs.push({
        type: 'output',
        text: '📊 CP Metrics: 500+ Medium-Hard Solved | LeetCode: leave_the_past | Codeforces: Dr.doom18967 | Math Olympiad: 2nd Rank Patna'
      })
    } else if (cleanCmd === 'clear') {
      setTerminalLogs([])
      return
    } else {
      newLogs.push({
        type: 'output',
        text: `Command not recognized: "${cmdStr}". Type "help" for a list of commands.`
      })
    }

    setTerminalLogs(newLogs)
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!terminalInput.trim()) return
    runCommand(terminalInput)
    setTerminalInput('')
  }

  return (
    <section ref={containerRef} className="relative min-h-screen flex flex-col justify-center px-4 sm:px-8 lg:px-16 bg-[#040407] pt-28 pb-16 overflow-hidden">
      <Canvas3D />

      {/* Cyber Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-indigo-500/10 blur-[100px] pointer-events-none rounded-full"></div>

      <div className="max-w-6xl mx-auto w-full relative z-10 grid lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Developer Header & CTA */}
        <div className="lg:col-span-6 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-xs font-mono text-cyan-300 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Undergraduate @ IIT Bhilai | CSE 2027</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-white mb-6 leading-tight">
            ROSHAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">RAJ</span>
          </h1>

          <p className="text-slate-300 text-lg md:text-xl font-mono mb-8 leading-relaxed">
            Full-Stack Developer • Systems & Compilers Engineer • ML Researcher
          </p>

          {/* Quick Stat Pill Grid */}
          <div className="grid grid-cols-3 gap-3 w-full mb-8 font-mono">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-xl md:text-2xl font-bold text-cyan-400">500+</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">CP Solved</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-xl md:text-2xl font-bold text-purple-400">2 Live</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Web Apps</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-xl md:text-2xl font-bold text-emerald-400">S3 Labs</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">ML Intern</div>
            </div>
          </div>

          {/* CTA Action Bar */}
          <div className="flex flex-wrap gap-4 w-full">
            <a
              href="/roshan-resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
            >
              <FaFileDownload /> <span>Download Resume PDF</span>
            </a>

            <a
              href="https://github.com/roshanraj9136"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 text-slate-200 font-mono text-sm font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all"
            >
              <FaGithub className="text-lg" /> <span>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/roshan-raj-36a449374"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 text-slate-200 font-mono text-sm font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all"
            >
              <FaLinkedin className="text-lg" /> <span>LinkedIn</span>
            </a>
          </div>
        </div>

        {/* Right Column: Interactive Terminal IDE Window */}
        <div className="lg:col-span-6 w-full">
          <div className="rounded-2xl bg-[#090d16]/95 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden font-mono text-xs">
            
            {/* Terminal Titlebar */}
            <div className="px-4 py-3 bg-[#0c1220] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-slate-400 text-xs ml-2 flex items-center gap-1.5">
                  <FaTerminal className="text-cyan-400 text-xs" /> zsh -- roshan@iitbhilai:~
                </span>
              </div>
              <span className="text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                ACTIVE SESSION
              </span>
            </div>

            {/* Terminal Body */}
            <div className="p-4 sm:p-6 h-[260px] sm:h-[300px] overflow-y-auto space-y-3 bg-[#060911]">
              {terminalLogs.map((log, i) => (
                <div key={i} className={`leading-relaxed ${log.type === 'cmd' ? 'text-cyan-300 font-bold' : log.type === 'system' ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {log.text}
                </div>
              ))}
            </div>

            {/* Quick Command Launcher Buttons */}
            <div className="p-3 bg-[#0c1220]/80 border-t border-b border-white/5 flex flex-wrap gap-2">
              <button 
                onClick={() => runCommand('algorace')}
                className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded text-[11px] flex items-center gap-1 transition-all"
              >
                <FaPlay className="text-[9px]" /> $ run algorace
              </button>

              <button 
                onClick={() => runCommand('minilang')}
                className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded text-[11px] flex items-center gap-1 transition-all"
              >
                <FaPlay className="text-[9px]" /> $ run minilang
              </button>

              <button 
                onClick={() => runCommand('resume')}
                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded text-[11px] flex items-center gap-1 transition-all"
              >
                <FaFileDownload className="text-[9px]" /> $ cat resume.pdf
              </button>

              <button 
                onClick={() => runCommand('stats')}
                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded text-[11px] flex items-center gap-1 transition-all"
              >
                <FaCode className="text-[9px]" /> $ cat stats
              </button>
            </div>

            {/* Terminal Interactive Input Field */}
            <form onSubmit={handleInputSubmit} className="p-3 bg-[#080c16] flex items-center gap-2">
              <span className="text-cyan-400 font-bold">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="type command (e.g. 'help', 'resume', 'algorace')..."
                className="flex-1 bg-transparent text-slate-200 outline-none placeholder:text-slate-600 text-xs font-mono"
              />
              <button type="submit" className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs rounded transition-all">
                Enter
              </button>
            </form>

          </div>
        </div>

      </div>
    </section>
  )
}
