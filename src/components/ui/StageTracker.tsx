'use client'

import { useEffect } from 'react'
import { measureStages, updateStage } from '@/lib/stage'

export default function StageTracker() {
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        updateStage()
      })
    }
    const remeasure = () => {
      measureStages()
      updateStage()
    }

    remeasure()
    const observer = new ResizeObserver(remeasure)
    observer.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.fonts?.ready.then(remeasure)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return null
}
