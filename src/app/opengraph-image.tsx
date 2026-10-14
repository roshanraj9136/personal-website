import { ImageResponse } from 'next/og'
import { composeRotation, project4to3, tesseract, transform4 } from '@/lib/hyper4d'

export const alt = 'Roshan Raj · A portfolio in four dimensions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const stats = [
  ['0 errors', 'at 2,500 concurrent users'],
  ['60 opcodes', 'in my own bytecode VM'],
  ['91.4%', 'anemia sensitivity'],
]

/** Projects the real tesseract for the preview image, using the same maths the
 *  site runs on, so the card shows the actual object rather than a drawing of
 *  one. Satori has no canvas, so the edges are rotated divs. */
function edges() {
  const shape = tesseract()
  const rotation = composeRotation({ xw: 0.72, yw: 0.34, xy: 0.22, zw: 0.5 })
  const points = shape.vertices.map((v) => {
    const p = project4to3(transform4(rotation, v), 3.4)
    // R³ -> R² with a plain isometric-ish flatten; depth drives opacity.
    return {
      x: 300 + (p.x + p.z * 0.34) * 78,
      y: 315 - (p.y + p.z * 0.2) * 78,
      depth: p.depth,
    }
  })

  return shape.edges.map(([a, b]) => {
    const p = points[a]
    const q = points[b]
    const dx = q.x - p.x
    const dy = q.y - p.y
    const length = Math.hypot(dx, dy)
    const near = Math.max(0, Math.min(1, ((p.depth + q.depth) / 2) * 0.5 + 0.5))
    return {
      left: p.x,
      top: p.y,
      length,
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
      thickness: 1.5 + near * 4,
      opacity: 0.2 + near * 0.8,
    }
  })
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          padding: '64px',
          color: '#e8edf5',
          background:
            'radial-gradient(900px 600px at 78% 12%, rgba(34,211,238,0.22), transparent 60%), radial-gradient(700px 500px at 5% 100%, rgba(167,139,250,0.2), transparent 60%), #02030a',
        }}
      >
        {/* The projected hypercube. */}
        {edges().map((edge, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: edge.left,
              top: edge.top,
              width: edge.length,
              height: edge.thickness,
              borderRadius: edge.thickness,
              background: '#7dd3fc',
              opacity: edge.opacity,
              transform: `rotate(${edge.angle}deg)`,
              transformOrigin: '0 50%',
            }}
          />
        ))}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', fontSize: 24, letterSpacing: 6, color: '#9aa6b8' }}>
            B.TECH CSE · IIT BHILAI · 2027
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 620 }}>
            <div style={{ display: 'flex', fontSize: 104, fontWeight: 700, letterSpacing: -4, color: '#fff' }}>
              Roshan Raj
            </div>
            <div style={{ display: 'flex', marginTop: 10, fontSize: 34, color: '#67e8f9' }}>
              A portfolio in four dimensions
            </div>
            <div style={{ display: 'flex', marginTop: 8, fontSize: 23, color: '#9aa6b8' }}>
              Compilers · Distributed systems · Real-time apps · ML
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            {stats.map(([value, label]) => (
              <div
                key={value}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px 24px',
                  borderRadius: 20,
                  border: '1px solid rgba(148,163,184,0.25)',
                  background: 'rgba(6,10,22,0.78)',
                }}
              >
                <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#22d3ee' }}>{value}</div>
                <div style={{ display: 'flex', fontSize: 19, color: '#9aa6b8' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
