'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const portfolioProjects = [
  {
    title: 'High-Entropy Thermoelectric Discovery',
    desc: 'Built a Bayesian active learning pipeline to discover optimal thermoelectric compositions in a 9-element, 14,651-candidate design space. Achieved >99% discovery efficiency by sampling only 0.56% of the search space, replicating state-of-the-art materials discovery methodology.',
    tags: ['Python', 'Scikit-learn', 'NumPy', 'Bayesian Opt', 'SHAP'],
    accent: '#f59e0b',
    github: 'https://github.com/roshanraj9136/thermoelectric-materials-screening',
    live: '#',
    category: 'ML Research'
  },
  {
    title: 'Live Cryptocurrency Dashboard',
    desc: 'Engineered a real-time crypto analytics platform tracking live prices, market cap, and 24h volume for 100+ coins with auto-refreshing data via asynchronous REST API calls. Deployed on Vercel with CI/CD pipeline.',
    tags: ['React', 'Tailwind CSS', 'REST APIs', 'Vercel'],
    accent: '#10b981',
    github: 'https://github.com/roshanraj9136/Personal_Crypto_Dashborad',
    live: '#',
    category: 'Frontend'
  },
  {
    title: 'Second Brain Knowledge Manager',
    desc: 'Developed a full-stack knowledge management app to create, organize, tag, and retrieve notes with instant search. Implemented RESTful backend APIs with authentication and persistent cloud storage. Designed a minimal UI focused on fast capture.',
    tags: ['React', 'Node.js', 'Express', 'MongoDB'],
    accent: '#06b6d4',
    github: 'https://github.com/roshanraj9136/Second-Brain',
    live: '#',
    category: 'Full Stack'
  }
]

export default function ProjectsGSAP() {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return

    const sections = gsap.utils.toArray('.project-panel')

    const ctx = gsap.context(() => {
      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (sections.length - 1),
          end: () => "+=" + wrapperRef.current?.offsetWidth
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section id="projects" ref={containerRef} className="h-screen w-full overflow-hidden bg-[#0a0a0f] relative flex items-center">
      <div className="absolute top-24 left-6 sm:left-12 lg:left-24 z-10">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-100 mix-blend-difference">
          Selected Works.
        </h2>
      </div>

      <div ref={wrapperRef} className="flex w-[300vw] h-full items-center">
        {portfolioProjects.map((project, i) => (
          <div key={i} className="project-panel w-screen h-full flex items-center justify-center px-6 sm:px-12 lg:px-24">
            <div className="w-full max-w-6xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: project.accent }}></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" 
                   style={{ background: `radial-gradient(circle at center, ${project.accent}, transparent)` }}></div>
              
              <div className="md:grid md:grid-cols-5 gap-12 relative z-10">
                <div className="md:col-span-3 mb-8 md:mb-0">
                  <div className="text-sm font-mono uppercase tracking-wider mb-4" style={{ color: project.accent }}>
                    {project.category}
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold text-slate-100 mb-6">{project.title}</h3>
                  <p className="text-slate-300 text-lg leading-relaxed mb-8">{project.desc}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/5 text-slate-300 text-xs font-mono rounded-full border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-6">
                    <a href={project.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                      <FaGithub size={24} /> <span className="font-medium">Repository</span>
                    </a>
                    {project.live !== '#' && (
                      <a href={project.live} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <FaExternalLinkAlt size={20} /> <span className="font-medium">Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-center">
                  <div className="w-full aspect-square rounded-2xl bg-[#050508] border border-white/10 flex items-center justify-center relative overflow-hidden group-hover:border-white/20 transition-colors shadow-2xl">
                    <div className="text-9xl font-extrabold opacity-10" style={{ color: project.accent }}>
                      0{i + 1}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
