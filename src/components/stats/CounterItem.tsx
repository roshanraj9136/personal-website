'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

export default function CounterItem({ title, value, suffix = '' }: { title: string, value: number, suffix?: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    if (inView) {
      animate(count, value, { duration: 2, ease: 'easeOut' })
    }
  }, [inView, count, value])

  return (
    <div ref={ref} className="flex flex-col items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
      <div className="flex items-baseline gap-1 mb-2">
        <motion.span className="text-4xl md:text-5xl font-bold text-indigo-400 font-mono">
          {rounded}
        </motion.span>
        {suffix && <span className="text-3xl font-bold text-indigo-400">{suffix}</span>}
      </div>
      <span className="text-slate-400 font-medium text-center">{title}</span>
    </div>
  )
}
