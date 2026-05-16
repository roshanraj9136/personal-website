'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa'
import SectionWrapper from '../shared/SectionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const portfolioProjects = [
  {
    title: 'High-Entropy Thermoelectric Discovery',
    desc: 'Screened 96,498 high-entropy candidate compositions using an active learning pipeline and Random Forest surrogate models. Evaluated only 0.08% of the design space to discover a top candidate with a predicted peak zT of 1.586. Validated models with cross-validation (R² > 0.9) and SHAP interpretability.',
    tags: ['Python', 'Scikit-learn', 'NumPy', 'Bayesian Opt', 'SHAP'],
    accent: '#f59e0b',
    github: 'https://github.com/roshanraj9136/thermoelectric-materials-screening',
    live: '#',
    category: 'ML Research'
  },
  {
    title: 'Second Brain Knowledge Manager',
    desc: 'Developed a full-stack knowledge management app to create, organize, tag, and retrieve notes with instant search. Implemented RESTful backend APIs with authentication and persistent cloud storage. Designed a minimal UI focused on fast capture.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB'],
    accent: '#06b6d4',
    github: 'https://github.com/roshanraj9136/Second-Brain',
    live: '#',
    category: 'Full Stack'
  },
  {
    title: 'Live Cryptocurrency Dashboard',
    desc: 'Engineered a real-time crypto analytics platform tracking live prices, market cap, and 24h volume for 100+ coins with auto-refreshing data via asynchronous REST API calls. Deployed on Vercel with CI/CD pipeline.',
    tags: ['React', 'Tailwind CSS', 'REST APIs', 'Vercel'],
    accent: '#10b981',
    github: 'https://github.com/roshanraj9136/Personal_Crypto_Dashborad',
    live: '#',
    category: 'Frontend'
  }
]

export default function ProjectsStack() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.project-card').forEach((card: any) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
          y: 100,
          opacity: 0,
          duration: 1,
          ease: "power3.out"
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <SectionWrapper id="projects" className="py-32">
      <div ref={containerRef} className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-32 tracking-tighter text-slate-100">
          Selected Works.
        </h2>

        <div className="space-y-48">
          {portfolioProjects.map((project, i) => (
            <div key={i} className="project-card relative group">
              <div className="absolute top-0 left-0 w-1 h-full rounded-full" style={{ backgroundColor: project.accent }}></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none rounded-3xl" 
                   style={{ background: `linear-gradient(90deg, ${project.accent}, transparent)` }}></div>
              
              <div className="pl-8 md:pl-16 py-8">
                <div className="md:grid md:grid-cols-2 gap-16 items-center">
                  
                  <div className={`flex flex-col justify-center ${i % 2 !== 0 ? 'md:order-2' : ''}`}>
                    <div className="text-sm font-mono uppercase tracking-wider mb-4" style={{ color: project.accent }}>
                      0{i + 1} — {project.category}
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold text-slate-100 mb-6 leading-tight">{project.title}</h3>
                    <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8">{project.desc}</p>
                    
                    <div className="flex flex-wrap gap-3 mb-12">
                      {project.tags.map(tag => (
                        <span key={tag} className="px-4 py-2 bg-white/5 text-slate-200 text-sm font-mono rounded-full border border-white/10 group-hover:border-white/20 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-8">
                      <a href={project.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-lg">
                        <FaGithub size={28} /> <span className="font-semibold">Repository</span>
                      </a>
                      {project.live !== '#' && (
                        <a href={project.live} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-lg">
                          <FaExternalLinkAlt size={24} /> <span className="font-semibold">Live Demo</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className={`w-full aspect-square md:aspect-[4/3] rounded-3xl bg-[#050508] border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-white/20 transition-all duration-500 shadow-2xl mt-12 md:mt-0 ${i % 2 !== 0 ? 'md:order-1' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/[0.02]"></div>
                    <div className="text-[12rem] font-extrabold opacity-5 transform group-hover:scale-110 transition-transform duration-700" style={{ color: project.accent }}>
                      0{i + 1}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
