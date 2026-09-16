'use client'

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'

type Props = { children: ReactNode; className?: string; max?: number; style?: CSSProperties }

// Tilts toward the cursor in 3D with a moving highlight. Mouse only.
export default function TiltCard({ children, className = '', max = 8, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    ref.current.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`)
    ref.current.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`)
    ref.current.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`)
    ref.current.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`)
  }

  const onLeave = () => {
    ref.current?.style.setProperty('--rx', '0deg')
    ref.current?.style.setProperty('--ry', '0deg')
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`tilt ${className}`} style={style}>
      {children}
    </div>
  )
}
