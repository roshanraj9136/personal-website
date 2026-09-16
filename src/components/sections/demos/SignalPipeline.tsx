'use client'

import { useEffect, useMemo, useState, type CSSProperties } from 'react'

const LEDS = [
  { nm: 590, color: '#ffc53d' },
  { nm: 610, color: '#ff8a1f' },
  { nm: 660, color: '#ff3b3b' },
]

// A photoplethysmography (PPG) trace: a sharp systolic peak and a smaller dicrotic wave per beat.
function tracePath(width: number, height: number, beats: number, amplitude: number) {
  const steps = 240
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width
    const phase = ((i / steps) * beats) % 1
    const y = Math.exp(-(((phase - 0.18) / 0.07) ** 2)) + 0.38 * Math.exp(-(((phase - 0.43) / 0.09) ** 2))
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${(height - 10 - y * amplitude * (height - 20)).toFixed(1)} `
  }
  return d
}

const DEVICE = ['GPIO/PWM LED sequencing', '30 fps capture', 'PyTorch 3-branch ResNet', 'Hemoglobin on I2C LCD']
const RESEARCH = ['820 histogram + 240 PPG features', 'RF + LightGBM + XGBoost', '91.4% anemia sensitivity']

export default function SignalPipeline() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setActive((i) => (i + 1) % LEDS.length), 1800)
    return () => window.clearInterval(id)
  }, [auto])

  const paths = useMemo(() => LEDS.map((_, i) => tracePath(320, 90, 3.2, 0.7 + i * 0.12)), [])
  const led = LEDS[active]

  return (
    <div className="demo" style={{ '--led': led.color } as CSSProperties}>
      <div className="demo-head">
        <span>LED sequencing</span>
        <span className="demo-note">one wavelength lights each video segment</span>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose an LED wavelength">
        {LEDS.map((item, i) => (
          <button
            key={item.nm}
            type="button"
            onClick={() => {
              setAuto(false)
              setActive(i)
            }}
            aria-pressed={i === active}
            className="led-chip"
            style={{ '--chip': item.color } as CSSProperties}
          >
            <span className="led-dot" aria-hidden="true" />
            {item.nm} nm
          </button>
        ))}
      </div>

      <svg viewBox="0 0 320 90" className="mt-4 h-24 w-full" role="img" aria-label={`Illustrative PPG pulse trace under the ${led.nm} nm LED`}>
        <defs>
          <linearGradient id="ppg-fade" x1="0" x2="1">
            <stop offset="0" stopColor={led.color} stopOpacity="0.15" />
            <stop offset="1" stopColor={led.color} stopOpacity="1" />
          </linearGradient>
        </defs>
        {[20, 45, 70].map((y) => (
          <line key={y} x1="0" x2="320" y1={y} y2={y} className="scope-grid" />
        ))}
        <path key={active} d={paths[active]} fill="none" stroke="url(#ppg-fade)" strokeWidth="2.2" className="ppg-trace" />
      </svg>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Flow title="On the device" steps={DEVICE} />
        <Flow title="Best research model" steps={RESEARCH} />
      </div>
    </div>
  )
}

function Flow({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="flow">
      <p className="flow-title">{title}</p>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  )
}
