'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export default function SectionWrapper({ children, id, className = "" }: { children: ReactNode, id?: string, className?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-80px' }}
      className={`py-24 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto w-full relative z-10 ${className}`}
    >
      {children}
    </motion.section>
  )
}
