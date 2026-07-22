'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaGithub, FaExternalLinkAlt, FaCode, FaTerminal, FaMicrochip, FaFolder, FaFileCode } from 'react-icons/fa'
import SectionWrapper from '../shared/SectionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const portfolioProjects = [
  {
    id: 'algorace',
    file: 'algorace_realtime.ts',
    title: 'AlgoRace -- Real-Time Competitive Coding Platform',
    category: 'Full-Stack & Socket.IO Real-Time',
    desc: 'Architected and deployed a full-stack competitive coding platform with protected JWT authentication, practice modes, ELO leaderboards, and live match updates. Engineered the production API with Express.js, PostgreSQL (Drizzle ORM), and Socket.IO for sub-second real-time race state synchronization.',
    codeSnippet: `// Socket.IO Match Synchronization Handler
io.on('connection', (socket) => {
  socket.on('join_race', async ({ matchId, userId }) => {
    const session = await drizzle.query.matches.findFirst({ where: eq(matches.id, matchId) });
    socket.join(\`race:\${matchId}\`);
    io.to(\`race:\${matchId}\`).emit('player_joined', { userId, status: 'READY' });
  });

  socket.on('submit_code', async ({ matchId, testPassRatio }) => {
    if (testPassRatio === 1.0) {
      io.to(\`race:\${matchId}\`).emit('race_winner', { winnerId: socket.userId });
    }
  });
});`,
    tags: ['React', 'TypeScript', 'Express.js', 'PostgreSQL', 'Socket.IO', 'Drizzle ORM', 'JWT', 'Tailwind CSS'],
    accent: '#38bdf8',
    github: 'https://github.com/roshanraj9136/Algorace',
    live: 'https://algorace-omega.vercel.app/',
    icon: FaCode
  },
  {
    id: 'minilang',
    file: 'compiler_vm.cpp',
    title: 'MiniLang -- Custom Compiler & Visual Debugger',
    category: 'Systems, Compilers & WebAssembly',
    desc: 'Designed and built a custom statically-typed programming language from scratch — implementing a lexer, recursive-descent parser, semantic analyzer, and stack-based bytecode generator in C++. Compiled the compiler core and virtual machine (VM) to WebAssembly via Emscripten for native-speed execution in the browser.',
    codeSnippet: `// C++ Bytecode VM Execution Loop
void VirtualMachine::execute() {
  while (ip < bytecode.size()) {
    uint8_t opcode = bytecode[ip++];
    switch (opcode) {
      case OP_PUSH:  stack.push_back(read_constant()); break;
      case OP_ADD:   { auto b = pop(); auto a = pop(); push(a + b); break; }
      case OP_CALL:  execute_function_call(); break;
      case OP_HALT:  return;
    }
  }
}`,
    tags: ['C++', 'Emscripten', 'WebAssembly', 'React', 'Monaco Editor', 'Compiler Theory', 'Bytecode VM'],
    accent: '#c084fc',
    github: 'https://github.com/roshanraj9136/minilang',
    live: 'https://minilang-one.vercel.app/',
    icon: FaTerminal
  },
  {
    id: 'hbmeter',
    file: 'ppg_signal_ml.py',
    title: 'Non-Invasive Hemoglobin (Hb) Estimation System',
    category: 'Signal Processing & Embedded ML',
    desc: 'Engineered a non-invasive hemoglobin estimation framework using fingertip video captured under controlled multi-wavelength LED illumination. Built an end-to-end signal processing pipeline covering ROI extraction, noise reduction, PPG signal normalization, and feature extraction. Validated ML regression models against clinical reference measurements.',
    codeSnippet: `# Optical PPG Signal Extraction & Feature Pipeline
def extract_ppg_features(video_frames, wavelength_channels):
    roi_frames = extract_fingertip_roi(video_frames)
    normalized_ppg = normalize_pulsatile_component(roi_frames)
    filtered_signal = butterworth_bandpass_filter(normalized_ppg, low=0.5, high=4.0)
    
    hb_features = compute_spectral_ratios(filtered_signal, wavelength_channels)
    predicted_hb = rf_regressor.predict(hb_features)
    return predicted_hb`,
    tags: ['Python', 'Scikit-learn', 'OpenCV', 'Signal Processing', 'PPG Analytics', 'Embedded ML', 'NumPy'],
    accent: '#34d399',
    github: 'https://github.com/roshanraj9136/hb-meter',
    live: '#',
    icon: FaMicrochip
  }
]

export default function ProjectsStack() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeProject, setActiveProject] = useState('algorace')

  const currentProj = portfolioProjects.find(p => p.id === activeProject) || portfolioProjects[0]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.project-widget', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <SectionWrapper id="projects" className="py-24">
      <div ref={containerRef} className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono text-xs uppercase tracking-widest mb-4">
              <span>IDE Workspace</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white">
              Selected Projects.
            </h2>
          </div>
          <p className="text-slate-400 text-sm md:text-base max-w-md font-mono">
            Interactive IDE view with code snippets, architecture highlights, and direct live links.
          </p>
        </div>

        {/* IDE Project Explorer & Editor Container */}
        <div className="project-widget rounded-3xl bg-[#080c14] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,242,254,0.08)] overflow-hidden">
          
          {/* IDE File Explorer Tabs Bar */}
          <div className="bg-[#0b101c] px-4 py-3 border-b border-white/10 flex items-center justify-between overflow-x-auto text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold mr-2 flex items-center gap-1.5">
                <FaFolder className="text-amber-400" /> projects/
              </span>
              {portfolioProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveProject(p.id)}
                  className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
                    activeProject === p.id 
                      ? 'bg-[#121929] text-cyan-300 border border-cyan-500/30 font-semibold shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <FaFileCode style={{ color: p.accent }} />
                  <span>{p.file}</span>
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2 text-slate-500 text-[11px]">
              <span>UTF-8</span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">READY</span>
            </div>
          </div>

          {/* IDE Active Project View Area */}
          <div className="p-6 md:p-10 grid lg:grid-cols-12 gap-8 items-start bg-[#050810]">
            
            {/* Left Column: Project Metadata & Description */}
            <div className="lg:col-span-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span 
                    className="px-3.5 py-1 rounded-full text-xs font-mono font-semibold bg-white/5 border border-white/10"
                    style={{ color: currentProj.accent }}
                  >
                    {currentProj.category}
                  </span>
                </div>

                <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                  {currentProj.title}
                </h3>

                <p className="text-slate-300 text-base leading-relaxed mb-6 font-sans">
                  {currentProj.desc}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {currentProj.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 text-slate-300 text-xs font-mono rounded-lg border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
                {currentProj.live !== '#' && (
                  <a
                    href={currentProj.live}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-sm font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                  >
                    <FaExternalLinkAlt className="text-xs" /> <span>Launch Live Application</span>
                  </a>
                )}

                {currentProj.github !== '#' && (
                  <a
                    href={currentProj.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-white/10 text-slate-200 font-mono text-sm font-semibold rounded-xl border border-white/10 hover:border-white/20 transition-all"
                  >
                    <FaGithub className="text-lg" /> <span>GitHub Repo</span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Code Snippet Visualizer */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#090e1a] border border-slate-800 overflow-hidden font-mono text-xs shadow-2xl">
                <div className="px-4 py-2.5 bg-[#0e1628] border-b border-slate-800 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                    <span>{currentProj.file}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">CODE PREVIEW</span>
                </div>
                <pre className="p-4 sm:p-6 overflow-x-auto text-slate-300 leading-relaxed bg-[#060a12]">
                  <code>{currentProj.codeSnippet}</code>
                </pre>
              </div>
            </div>

          </div>

        </div>
      </div>
    </SectionWrapper>
  )
}
