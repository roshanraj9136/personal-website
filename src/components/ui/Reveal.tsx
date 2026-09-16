'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' }

export default function Reveal({ children, delay = 0, className, as = 'div' }: Props) {
  const Tag = as === 'li' ? motion.li : motion.div
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}
