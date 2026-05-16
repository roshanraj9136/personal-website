'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionWrapper from '../shared/SectionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const capabilities = [
  {
    title: "Machine Learning & Data Science",
    items: ["Gaussian Process Regression", "Bayesian Optimization", "SHAP", "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Jupyter"],
    desc: "Experience building robust active learning pipelines for material discovery and predictive modeling.",
    accent: "hover:border-fuchsia-500/50 hover:shadow-[0_0_30px_rgba(217,70,239,0.1)]"
  },
  {
    title: "Full-Stack Web Development",
    items: ["React.js", "Next.js", "Node.js", "Express.js", "Tailwind CSS", "REST APIs"],
    desc: "Architecting responsive, high-performance web applications from database schemas to client interfaces.",
    accent: "hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
  },
  {
    title: "Algorithms & Systems",
    items: ["C++", "C", "Python", "JavaScript", "SQL", "Linux", "Docker", "Git"],
    desc: "Strong algorithmic foundation with 500+ competitive programming challenges solved. Proficient in lower-level logic and CI/CD tools.",
    accent: "hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
  }
]

export default function Capabilities() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".cap-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
        scale: 0.95,
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <SectionWrapper id="capabilities" className="py-32">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tighter text-slate-100">
          Capabilities.
        </h2>
        <p className="text-xl text-slate-400 mb-16 max-w-2xl">
          Bridging the gap between mathematical rigor in machine learning and robust architectural patterns in web systems.
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {capabilities.map((cap, i) => (
            <div key={i} className={`cap-item p-8 rounded-3xl bg-white/[0.02] border border-white/5 transition-all duration-300 group flex flex-col h-full ${cap.accent}`}>
              <h3 className="text-2xl font-bold text-slate-100 mb-4">{cap.title}</h3>
              <p className="text-slate-400 mb-8 flex-grow leading-relaxed">{cap.desc}</p>
              
              <div className="flex flex-wrap gap-2">
                {cap.items.map(item => (
                  <span key={item} className="px-3 py-1 bg-white/5 text-slate-300 text-xs font-mono rounded-full border border-white/10 group-hover:border-white/20 transition-colors">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
