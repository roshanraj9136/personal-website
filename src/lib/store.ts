import { useSyncExternalStore } from 'react'

// Minimal external stores shared by the HTML panels and the 3D world, so a
// click in either place is reflected in both.

export type Store<T> = {
  get: () => T
  set: (next: T | ((prev: T) => T)) => void
  subscribe: (listener: () => void) => () => void
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    get: () => state,
    set: (next) => {
      const value = typeof next === 'function' ? (next as (prev: T) => T)(state) : next
      if (Object.is(value, state)) return
      state = value
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

/** Subscribe to a store. The selector must return a primitive or a stable reference. */
export function useStore<T, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(store.get()),
  )
}

// NISHAD: which LED is lit, and whether the sequence is cycling on its own.
export const ledStore = createStore({ active: 0, auto: true })

// MiniLang: constant folding toggle.
export const foldStore = createStore({ on: true })

// AlgoRace: tests passed per player and the winner (null while racing).
export const raceStore = createStore<{ passed: [number, number]; winner: number | null }>({ passed: [0, 0], winner: null })
