'use client'

import { motion } from 'framer-motion'
import { SiGithub, SiVercel } from 'react-icons/si'

interface ProjectProps {
  title: string
  desc: string
  tags: string[]
  accent: string
  github: string
  live: string
  category: string
}

export default function ProjectCard({ title, desc, tags, accent, github, live, category }: ProjectProps) {
  return (
    <motion.div 
      whileHover={{ y: -8, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}
      className="relative flex flex-col h-[400px] bg-[#111118] border border-white/5 rounded-2xl overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: accent }}></div>
      
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-700" 
           style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}>
      </div>

      <div className="p-8 flex flex-col h-full z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <div className="text-xs font-mono tracking-wider uppercase" style={{ color: accent }}>
            {category}
          </div>
          <div className="flex gap-4">
            <a href={github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
              <SiGithub size={20} />
            </a>
            {live !== '#' && (
              <a href={live} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                <SiVercel size={20} />
              </a>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-100 mb-4">{title}</h3>
        <p className="text-slate-400 leading-relaxed mb-8 flex-grow">{desc}</p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map(tag => (
            <span key={tag} className="px-3 py-1 text-xs font-mono rounded-full bg-white/5 text-slate-300">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
