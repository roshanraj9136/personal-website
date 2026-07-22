'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaGithub, FaEnvelope, FaFileDownload, FaCode } from 'react-icons/fa'
import SectionWrapper from '../shared/SectionWrapper'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function ContactSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".contact-item", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out"
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  return (
    <SectionWrapper id="contact" className="py-24">
      <div ref={containerRef} className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="contact-item text-indigo-400 font-mono text-sm uppercase tracking-widest mb-3">Get In Touch</div>
        <h2 className="contact-item text-5xl md:text-7xl font-extrabold mb-6 tracking-tighter text-slate-100">
          Let's Connect.
        </h2>
        <p className="contact-item text-slate-300 mb-12 text-lg md:text-xl leading-relaxed max-w-xl">
          Interested in full-stack development, compilers, or ML research? Reach out for placement opportunities, project collaborations, or tech discussions.
        </p>

        <div className="contact-item flex flex-wrap justify-center gap-4 mb-12 w-full max-w-2xl">
          <a 
            href="mailto:roshanr@iitbhilai.ac.in" 
            className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all font-medium text-base shadow-lg shadow-indigo-600/20"
          >
            <FaEnvelope className="text-xl" />
            <span>Email Me</span>
          </a>

          <a 
            href="/roshan-resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200 rounded-2xl transition-all font-medium text-base"
          >
            <FaFileDownload className="text-lg text-indigo-400" />
            <span>Download Resume PDF</span>
          </a>
        </div>

        {/* Social / Profiles bar */}
        <div className="contact-item flex flex-wrap justify-center gap-6 pt-8 border-t border-white/5 text-sm font-mono text-slate-400">
          <a href="https://github.com/roshanraj9136" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
            <FaGithub className="text-base" /> GitHub
          </a>
          <span className="text-slate-700">•</span>
          <a href="https://leetcode.com/u/leave_the_past/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
            <FaCode className="text-base" /> LeetCode
          </a>
          <span className="text-slate-700">•</span>
          <a href="https://codeforces.com/profile/Dr.doom18967" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
            <FaCode className="text-base" /> Codeforces
          </a>
        </div>

        <div className="mt-16 text-xs text-slate-600 font-mono">
          Designed & Engineered by Roshan Raj © 2026. IIT Bhilai.
        </div>
      </div>
    </SectionWrapper>
  )
}
