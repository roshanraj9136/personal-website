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
    role: "Summer Research Intern",
    company: "S3 Summer Labs, IIT Bhilai",
    date: "Jun 2025 – Aug 2025",
    accent: "#a855f7",
    points: [
      "Developed a non-invasive hemoglobin estimation system using fingertip videos captured under controlled multi-wavelength LED illumination.",
      "Implemented signal processing pipelines covering ROI extraction, noise reduction, PPG signal normalization, and feature extraction from optical video data.",
      "Trained and validated machine learning regression models against clinical reference measurements, optimizing for real-time embedded deployment."
    ],
    tech: ["Python", "Scikit-learn", "OpenCV", "Signal Processing", "PPG Analytics", "Embedded ML"]
  },
  {
    role: "Web Developer",
    company: "Meru Conference, IIT Bhilai",
    date: "May 2024 – Jul 2024",
    accent: "#3b82f6",
    points: [
      "Led end-to-end web development of the Meru Conference 2026 platform, serving as the central hub for attendee registrations, schedules, and speaker profiles.",
      "Collaborated cross-functionally with design and organizing teams to deliver features on tight deadlines."
    ],
    tech: ["React.js", "JavaScript", "HTML5/CSS3", "REST APIs", "Tailwind CSS"]
  },
  {
    role: "Polestar Mentor",
    company: "Openlink Foundation",
    date: "2023 – 2024",
    accent: "#10b981",
    points: [
      "Mentored 15+ students in academic planning, competitive exam strategy, and structured goal-setting.",
      "Designed personalized learning roadmaps and conducted regular feedback sessions to monitor student progress."
    ],
    tech: ["Mentorship", "Roadmap Design", "Academic Strategy", "Leadership"]
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
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <SectionWrapper id="experience" className="py-24">
      <div ref={containerRef} className="max-w-5xl mx-auto">
        <div className="text-indigo-400 font-mono text-sm uppercase tracking-widest mb-3">Work & Research</div>
        <h2 className="text-4xl md:text-6xl font-extrabold mb-16 tracking-tighter text-slate-100">
          Experience.
        </h2>
        
        <div className="relative border-l border-white/10 ml-4 md:ml-6 pl-8 space-y-12">
          {experiences.map((exp, i) => (
            <div key={i} className="exp-item relative group">
              {/* Timeline Dot */}
              <div 
                className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full border-2 border-[#0a0a0f] transition-all duration-300 group-hover:scale-125"
                style={{ backgroundColor: exp.accent }}
              ></div>

              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all duration-300 group-hover:bg-white/[0.03]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                      {exp.role}
                    </h3>
                    <div className="text-lg font-medium text-slate-300">
                      {exp.company}
                    </div>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-400 self-start md:self-auto">
                    {exp.date}
                  </div>
                </div>

                <ul className="space-y-3 text-slate-300 mb-6">
                  {exp.points.map((point, j) => (
                    <li key={j} className="flex items-start text-base leading-relaxed">
                      <span className="text-indigo-400 mr-3 mt-1.5 text-xs">◆</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                  {exp.tech.map(t => (
                    <span key={t} className="px-3 py-1 bg-white/5 text-slate-400 text-xs font-mono rounded-lg border border-white/5">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
