'use client'

import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault()
    if (typeof window !== 'undefined' && (window as any).lenis) {
      if (target === 'top') {
        (window as any).lenis.scrollTo(0)
      } else {
        (window as any).lenis.scrollTo(target)
      }
    } else {
      if (target === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#040407]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 flex justify-between items-center">
        <a 
          href="#" 
          onClick={(e) => handleNavClick(e, 'top')}
          className="text-xl font-bold tracking-tighter text-slate-100"
        >
          Roshan<span className="text-indigo-500">.</span>
        </a>
        <nav className="hidden sm:flex gap-8 text-sm font-medium text-slate-300">
          <a href="#capabilities" onClick={(e) => handleNavClick(e, '#capabilities')} className="hover:text-indigo-400 transition-colors">Capabilities</a>
          <a href="#methodology" onClick={(e) => handleNavClick(e, '#methodology')} className="hover:text-indigo-400 transition-colors">Methodology</a>
          <a href="#experience" onClick={(e) => handleNavClick(e, '#experience')} className="hover:text-indigo-400 transition-colors">Experience</a>
          <a href="#education" onClick={(e) => handleNavClick(e, '#education')} className="hover:text-indigo-400 transition-colors">Education</a>
          <a href="#projects" onClick={(e) => handleNavClick(e, '#projects')} className="hover:text-indigo-400 transition-colors">Projects</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="hover:text-indigo-400 transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  )
}
