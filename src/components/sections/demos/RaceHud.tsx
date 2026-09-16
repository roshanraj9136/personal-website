'use client'

import { useEffect, useReducer, useRef } from 'react'
import { raceStore } from '@/lib/store'

// Same formula as AlgoRace's elo.ts (K-factor 32).
function computeElo(winner: number, loser: number) {
  const expectedWinner = 1 / (1 + 10 ** ((loser - winner) / 400))
  return {
    winner: Math.round(winner + 32 * (1 - expectedWinner)),
    loser: Math.max(0, Math.round(loser + 32 * (0 - (1 - expectedWinner)))),
  }
}

const TESTS = 10
const HOLD_TICKS = 7
const PLAYERS = [
  { name: 'You', elo: 1200, color: '#22d3ee' },
  { name: 'Opponent', elo: 1248, color: '#fb923c' },
]

type Race = { passed: [number, number]; winner: number | null; hold: number }
type Action = { type: 'tick'; rolls: [number, number] } | { type: 'finish' }

const START: Race = { passed: [0, 0], winner: null, hold: 0 }

function reducer(state: Race, action: Action): Race {
  if (action.type === 'finish') return { passed: [TESTS, 7], winner: 0, hold: 0 }
  if (state.winner !== null) {
    return state.hold >= HOLD_TICKS ? START : { ...state, hold: state.hold + 1 }
  }
  const passed: [number, number] = [
    Math.min(TESTS, state.passed[0] + (action.rolls[0] < 0.55 ? 1 : 0)),
    Math.min(TESTS, state.passed[1] + (action.rolls[1] < 0.45 ? 1 : 0)),
  ]
  const winner = passed[0] >= TESTS ? 0 : passed[1] >= TESTS ? 1 : null
  return { passed, winner, hold: 0 }
}

export default function RaceHud() {
  const [race, dispatch] = useReducer(reducer, START)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dispatch({ type: 'finish' })
      return
    }
    let visible = false
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0.2 })
    observer.observe(node)
    const id = window.setInterval(() => {
      if (visible) dispatch({ type: 'tick', rolls: [Math.random(), Math.random()] })
    }, 450)
    return () => {
      window.clearInterval(id)
      observer.disconnect()
    }
  }, [])

  // Mirror the race into the 3D track on the AlgoRace floor.
  useEffect(() => {
    raceStore.set({ passed: race.passed, winner: race.winner })
  }, [race])

  const { passed, winner } = race
  const result =
    winner === null ? null : winner === 0 ? computeElo(PLAYERS[0].elo, PLAYERS[1].elo) : computeElo(PLAYERS[1].elo, PLAYERS[0].elo)

  return (
    <div className="demo" ref={ref}>
      <div className="demo-head">
        <span>How a race plays out</span>
        <span className="demo-note">illustration · {TESTS} test cases · K = 32</span>
      </div>

      <div className="grid gap-4">
        {PLAYERS.map((player, i) => {
          const eloAfter = result ? (winner === i ? result.winner : result.loser) : null
          const delta = eloAfter === null ? null : eloAfter - player.elo
          return (
            <div key={player.name}>
              <div className="meter-row">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: player.color }} aria-hidden="true" />
                  {player.name}
                  <span className="text-[var(--faint)]">ELO {player.elo}</span>
                </span>
                <span className="font-mono">
                  {passed[i]}/{TESTS}
                  {delta !== null && (
                    <span className={delta >= 0 ? 'ml-3 text-emerald-300' : 'ml-3 text-rose-300'}>
                      {delta >= 0 ? '+' : ''}
                      {delta}
                    </span>
                  )}
                </span>
              </div>
              <div className="race-track" aria-hidden="true">
                {Array.from({ length: TESTS }, (_, t) => (
                  <span key={t} className="race-cell" style={{ background: t < passed[i] ? player.color : undefined }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="demo-foot" aria-live="polite">
        {winner === null
          ? 'Every submission runs against all test cases, and progress is pushed to both players over Socket.IO.'
          : `${winner === 0 ? 'You pass' : 'Your opponent passes'} all ${TESTS} tests first. One database transaction records the single winner and both ELO changes.`}
      </p>
    </div>
  )
}
