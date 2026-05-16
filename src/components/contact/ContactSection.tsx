'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FaGithub, FaInstagram, FaEnvelope } from 'react-icons/fa'
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
    <SectionWrapper id="contact" className="py-32">
      <div ref={containerRef} className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <h2 className="contact-item text-[12vw] md:text-[8rem] leading-none font-extrabold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
          Let's Talk.
        </h2>
        <p className="contact-item text-slate-400 mb-16 text-xl md:text-2xl leading-relaxed max-w-2xl">
          Currently exploring new opportunities. Whether you have a question or just want to say hi, my inbox is always open.
        </p>

        <div className="contact-item flex flex-wrap justify-center gap-6">
          <a 
            href="https://instagram.com/roshan_9136_" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/30 transition-all text-slate-200 text-lg group"
          >
            <FaInstagram className="text-[#E1306C] group-hover:scale-110 transition-transform" /> Instagram
          </a>

          <a 
            href="https://github.com/roshanraj9136" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/30 transition-all text-slate-200 text-lg group"
          >
            <FaGithub className="text-white group-hover:scale-110 transition-transform" /> GitHub
          </a>

          <a 
            href="mailto:roshanr@iitbhilai.ac.in" 
            className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/30 transition-all text-slate-200 text-lg group"
          >
            <FaEnvelope className="text-[#EA4335] group-hover:scale-110 transition-transform" /> Email
          </a>
        </div>
      </div>
    </SectionWrapper>
  )
}
