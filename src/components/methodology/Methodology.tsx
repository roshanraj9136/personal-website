'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionWrapper from '../shared/SectionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const workflows = [
  {
    step: "01",
    title: "Mathematical Rigor",
    desc: "Every system I build, whether a machine learning pipeline or a full-stack backend, begins with a strong foundation in logic, discrete mathematics, and algorithmic efficiency. No black boxes.",
    accent: "text-indigo-400"
  },
  {
    step: "02",
    title: "Scalable Architecture",
    desc: "I don't just build to make it work; I build to make it last. From database schemas to CI/CD pipelines, I prioritize robust, maintainable patterns over quick hacks.",
    accent: "text-emerald-400"
  },
  {
    step: "03",
    title: "Relentless Iteration",
    desc: "Drawing from my competitive programming background, I approach bugs and bottlenecks as puzzles. I profile, optimize, and iterate until the system hits peak performance.",
    accent: "text-fuchsia-400"
  }
]

export default function Methodology() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".workflow-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
        x: -50,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "power3.out"
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <SectionWrapper id="methodology" className="py-32">
      <div ref={containerRef} className="max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-24 tracking-tighter text-slate-100">
          My Approach.
        </h2>

        <div className="space-y-24">
          {workflows.map((flow, i) => (
            <div key={i} className="workflow-item md:grid md:grid-cols-4 gap-12 items-center">
              <div className={`md:col-span-1 text-[8rem] font-extrabold leading-none opacity-20 font-mono ${flow.accent}`}>
                {flow.step}
              </div>
              <div className="md:col-span-3 mt-8 md:mt-0 border-l border-white/10 pl-8">
                <h3 className="text-3xl font-bold text-slate-100 mb-6">{flow.title}</h3>
                <p className="text-slate-400 text-xl leading-relaxed">{flow.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
