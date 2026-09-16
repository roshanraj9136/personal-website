'use client'

import { useState } from 'react'

const STEPS = [
  {
    label: 'Symptom',
    text: 'About 18% of requests failed under graded load. Errors clustered in the first seconds of each load stage, with zero timeouts.',
  },
  {
    label: 'Root cause',
    text: 'cgroup memory.events showed 121 OOM kills on the load balancer container. Each restart left a 1-second gap with nothing listening, so clients were refused instantly.',
  },
  {
    label: 'Fix',
    text: 'Reused buffers with sync.Pool, cached feed snapshots on the backends, set GOMEMLIMIT with a lower GOGC on every node, and cut the restart delay from 1 s to 50 ms.',
  },
  {
    label: 'Result',
    text: '0 errors over 60,000 requests at up to 2,500 users, no new OOM kills, and all three backends served the same 57,490-message feed.',
  },
]

const STATS = {
  before: [
    { label: 'Error rate', value: '≈18%', fill: 18, bad: true },
    { label: 'OOM kills', value: '121', fill: 100, bad: true },
    { label: 'LB memory', value: 'at the 512 MiB cap', fill: 100, bad: true },
  ],
  after: [
    { label: 'Error rate', value: '0%', fill: 0, bad: false },
    { label: 'OOM kills', value: '0 new', fill: 0, bad: false },
    { label: 'LB memory', value: '364 MB peak', fill: 71, bad: false },
  ],
}

export default function IncidentReport() {
  const [view, setView] = useState<'before' | 'after'>('after')

  return (
    <div className="demo">
      <div className="demo-head">
        <span>Incident report</span>
        <div className="segmented" role="group" aria-label="Before or after the fix">
          {(['before', 'after'] as const).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
              {v === 'before' ? 'Before' : 'After'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {STATS[view].map((s) => (
          <div key={s.label} className="meter">
            <div className="meter-row">
              <span>{s.label}</span>
              <span className={s.bad ? 'text-rose-300' : 'text-emerald-300'}>{s.value}</span>
            </div>
            <div className="meter-track">
              <div className="meter-fill" data-bad={s.bad} style={{ width: `${Math.max(s.fill, 1.5)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <ol className="timeline mt-5">
        {STEPS.map((step, i) => (
          <li key={step.label}>
            <span className="timeline-dot" aria-hidden="true">{i + 1}</span>
            <div>
              <p className="timeline-label">{step.label}</p>
              <p className="timeline-text">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
