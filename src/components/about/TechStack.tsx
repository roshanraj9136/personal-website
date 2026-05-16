'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { stack } from '@/data/techStack'

export default function TechStack() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {stack.map((item, idx) => {
        const Icon = item.icon
        const isHovered = hoveredIdx === idx

        return (
          <div 
            key={item.name}
            className="relative"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer h-full"
            >
              <Icon className="w-8 h-8 mb-2" style={{ color: item.color }} />
              <span className="text-xs font-medium text-slate-300">{item.name}</span>
            </motion.div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute z-50 w-48 p-3 -mt-2 -translate-x-1/2 left-1/2 bottom-full bg-[#111118] border border-white/10 rounded-lg shadow-xl pointer-events-none"
                >
                  <div className="text-xs font-mono text-indigo-400 mb-1">{item.years} yrs exp</div>
                  <div className="text-xs text-slate-400">Used in: {item.usedIn}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
