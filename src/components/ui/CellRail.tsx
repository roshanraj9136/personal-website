'use client'

// The eight cells, as real buttons. Clicking one rotates the hypercube until
// that cell faces you.
//
// This is also the keyboard and screen-reader route through the site: the
// rotation is the navigation, so the navigation has to exist as something other
// than a gesture.

import { CELL_NAMES } from '@/lib/hyperState'
import { cells } from '@/content/site'

type Props = {
  active: number
  onSelect: (cell: number) => void
}

export default function CellRail({ active, onSelect }: Props) {
  return (
    <nav className="rail" aria-label="Sections">
      <ol className="rail__list">
        {cells.map((cell, index) => (
          <li key={cell.id}>
            <button
              type="button"
              className="rail__item"
              aria-current={index === active ? 'true' : undefined}
              style={{ '--accent': cell.accent } as React.CSSProperties}
              onClick={() => onSelect(index)}
            >
              <span className="rail__axis">{CELL_NAMES[index]}</span>
              <span className="rail__label">{cell.label}</span>
              <span className="rail__tick" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
