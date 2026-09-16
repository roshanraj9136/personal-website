'use client'

import { useEffect, useState } from 'react'
import { FaBars, FaFileAlt, FaTimes } from 'react-icons/fa'
import { onActiveStage } from '@/lib/stage'
import { profile } from '@/content/site'

const LINKS = [
  { label: 'Work', href: '#nishad', stages: [1, 2, 3, 4, 5] },
  { label: 'Skills', href: '#skills', stages: [6] },
  { label: 'Contact', href: '#contact', stages: [7] },
]

export default function Nav() {
  const [active, setActive] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => onActiveStage(setActive), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="container-x flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-3" aria-label="Roshan Raj, back to top">
          <span className="monogram" aria-hidden="true">
            RR
          </span>
          <span className="hidden font-display text-sm font-semibold tracking-tight sm:inline">Roshan Raj</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link" aria-current={link.stages.includes(active) ? 'true' : undefined}>
              {link.label}
            </a>
          ))}
          <a href={profile.resume} target="_blank" rel="noreferrer" className="btn-ghost ml-3 !px-4 !py-2 text-sm">
            <FaFileAlt aria-hidden="true" /> Resume
          </a>
        </nav>

        <button type="button" className="icon-link md:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="container-x grid gap-1 pb-4 md:hidden">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link" onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href={profile.resume} target="_blank" rel="noreferrer" className="nav-link" onClick={() => setOpen(false)}>
            Resume (PDF)
          </a>
        </nav>
      )}
    </header>
  )
}
