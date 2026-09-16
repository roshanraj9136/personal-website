import { ImageResponse } from 'next/og'

export const alt = 'Roshan Raj · Systems, Full-Stack & ML'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const stats = [
  ['0 errors', 'at 2,500 concurrent users'],
  ['60 opcodes', 'in my own bytecode VM'],
  ['91.4%', 'anemia sensitivity'],
]

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          color: '#e8edf5',
          background: 'radial-gradient(900px 600px at 85% 10%, rgba(34,211,238,0.25), transparent 60%), radial-gradient(700px 500px at 0% 100%, rgba(167,139,250,0.22), transparent 60%), #04050a',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: '#9aa6b8' }}>B.TECH CSE · IIT BHILAI · 2027</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 120, fontWeight: 700, letterSpacing: -4, color: '#ffffff' }}>Roshan Raj</div>
          <div style={{ display: 'flex', marginTop: 12, fontSize: 36, color: '#c3ccd9' }}>Compilers · Distributed systems · Real-time apps · ML</div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {stats.map(([value, label]) => (
            <div
              key={value}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '20px 28px',
                borderRadius: 24,
                border: '1px solid rgba(148,163,184,0.25)',
                background: 'rgba(10,14,26,0.7)',
              }}
            >
              <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#22d3ee' }}>{value}</div>
              <div style={{ display: 'flex', fontSize: 22, color: '#9aa6b8' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
