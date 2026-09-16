'use client'

import { useEffect, useState } from 'react'
import { onActiveStage } from '@/lib/stage'
import { stages } from '@/content/site'

// Side index of the page's sections; the active one follows the 3D stage.
export default function StageRail() {
  const [active, setActive] = useState(0)
  useEffect(() => onActiveStage(setActive), [])

  return (
    <nav aria-label="Sections" className="stage-rail">
      <ol>
        {stages.map((item) => (
          <li key={item.stage}>
            <a href={item.href} aria-current={active === item.stage ? 'true' : undefined}>
              <span className="rail-index">{String(item.stage).padStart(2, '0')}</span>
              <span className="rail-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
