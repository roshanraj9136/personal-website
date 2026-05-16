'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionWrapper from '../shared/SectionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const experiences = [
  {
    role: "Web Developer",
    company: "Meru Conference, IIT Bhilai",
    date: "2024 – Present",
    points: [
      "Leading end-to-end development of the Meru Conference 2026 website, serving as the primary platform for registrations, schedules, and speaker information.",
      "Collaborating cross-functionally with design and organizing teams to ship features on tight deadlines."
    ]
  },
  {
    role: "Polestar Mentor",
    company: "Openlink Foundation",
    date: "2023 – 2024",
    points: [
      "Mentored 15+ students in academic planning, competitive exam strategy, and structured goal-setting.",
      "Designed personalized learning roadmaps and tracked progress with regular feedback sessions."
    ]
  },
  {
    role: "NSS Volunteer & Web Contributor",
    company: "Indian Institute of Technology Bhilai",
    date: "2023 – 2024",
    points: [
      "Contributed to institute-wide outreach initiatives impacting 200+ participants.",
      "Improved usability and mobile responsiveness of internal NSS web portals."
    ]
  }
]

export default function ExperienceSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".exp-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <SectionWrapper id="experience" className="py-32">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-16 tracking-tighter text-slate-100">
          Experience.
        </h2>
        
        <div className="space-y-16 border-l border-white/10 pl-8 ml-4 md:border-none md:pl-0 md:ml-0">
          {experiences.map((exp, i) => (
            <div key={i} className="exp-item relative group">
              <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[38px] top-2 md:hidden group-hover:scale-150 transition-transform"></div>
              <div className="md:grid md:grid-cols-4 gap-8 items-start hover:bg-white/[0.02] p-6 -mx-6 rounded-2xl transition-colors border border-transparent hover:border-white/5">
                <div className="md:col-span-1 mb-4 md:mb-0 text-slate-400 font-mono text-sm mt-1">
                  {exp.date}
                </div>
                <div className="md:col-span-3">
                  <h3 className="text-2xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{exp.role}</h3>
                  <div className="text-slate-300 text-lg mb-4 font-medium">{exp.company}</div>
                  <ul className="space-y-3 text-slate-400">
                    {exp.points.map((point, j) => (
                      <li key={j} className="flex items-start">
                        <span className="text-indigo-500 mr-3 mt-1">▹</span>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
