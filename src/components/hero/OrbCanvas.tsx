'use client'

import { useEffect, useRef } from 'react'

export default function OrbCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    
    window.addEventListener('resize', resize)
    resize()

    const colors = ['#6366f1', '#8b5cf6', '#06b6d4']
    const orbs = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 200 + Math.random() * 200,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)]
    }))

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      orbs.forEach(orb => {
        orb.x += orb.vx
        orb.y += orb.vy

        if (orb.x < -orb.r) orb.x = width + orb.r
        if (orb.x > width + orb.r) orb.x = -orb.r
        if (orb.y < -orb.r) orb.y = height + orb.r
        if (orb.y > height + orb.r) orb.y = -orb.r

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r)
        
        const r = parseInt(orb.color.slice(1, 3), 16)
        const g = parseInt(orb.color.slice(3, 5), 16)
        const b = parseInt(orb.color.slice(5, 7), 16)
        
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`)
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen"
    />
  )
}
