'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaTerminal, FaBriefcase, FaCalendarAlt, FaBuilding } from 'react-icons/fa'
import SectionWrapper from '../shared/SectionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const experiences = [
  {
    role: "Summer Research Intern",
    company: "S3 Summer Labs, IIT Bhilai",
    date: "Jun 2025 – Aug 2025",
    tag: "RESEARCH & EMBEDDED ML",
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
    tag: "FULL-STACK WEB",
    accent: "#38bdf8",
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
    tag: "MENTORSHIP & LEADERSHIP",
    accent: "#34d399",
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
      gsap.from(".exp-log-item", {
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
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-4">
              <FaTerminal className="text-xs" /> <span>experience.log</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white">
              Work Experience.
            </h2>
          </div>
          <p className="text-slate-400 text-sm md:text-base max-w-md font-mono">
            Research internships, full-stack web engineering, and student mentorship track records.
          </p>
        </div>

        {/* Timeline Console Log Cards */}
        <div className="relative border-l-2 border-slate-800 ml-4 md:ml-6 pl-8 space-y-12">
          {experiences.map((exp, i) => (
            <div key={i} className="exp-log-item relative group">
              {/* Terminal Glow Node */}
              <div 
                className="absolute -left-[42px] top-1.5 w-5 h-5 rounded-full border-4 border-[#040407] transition-all duration-300 group-hover:scale-125 shadow-lg"
                style={{ backgroundColor: exp.accent }}
              ></div>

              <div className="p-8 rounded-3xl bg-[#090d16]/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono mb-2" style={{ color: exp.accent }}>
                      <span>[{exp.tag}]</span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                      {exp.role}
                    </h3>
                    <div className="text-base font-medium text-slate-300 flex items-center gap-2 mt-1">
                      <FaBuilding className="text-slate-500 text-xs" /> {exp.company}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300 self-start md:self-auto">
                    <FaCalendarAlt className="text-xs text-slate-400" />
                    <span>{exp.date}</span>
                  </div>
                </div>

                <ul className="space-y-3 text-slate-300 mb-6 font-sans">
                  {exp.points.map((point, j) => (
                    <li key={j} className="flex items-start text-base leading-relaxed">
                      <span className="text-cyan-400 mr-3 mt-1.5 text-xs font-mono">➜</span>
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
