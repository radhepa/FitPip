// Remembers what screens last read from the on-device database, so coming back to a screen can show
// it at once instead of an empty page while the same data is read again. A remembered read is only
// handed out while it is still exact: nothing on the device has changed since (see
// `getDataGeneration`), the same person is signed in and it is still the same day (some reads are
// "since midnight" or "the last 90 days").

import { getUserId, hasDb } from './context'
import { getDataGeneration } from './events'

interface Entry {
  value: unknown
  generation: number
  owner: string | null
  day: string
  at: number
}

export interface CachedRead<T> {
  value: T
  /** Milliseconds since it was read. */
  age: number
}

/** Enough for every screen's reads plus a handful of workouts and exercises opened recently. */
const MAX_ENTRIES = 48

const entries = new Map<string, Entry>()

const owner = () => (hasDb() ? getUserId() : null)

const localDay = (now: Date) => `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`

/** The remembered result for `key`, if nothing has changed since it was read; otherwise undefined. */
export function peekRead<T>(key: string, now: Date = new Date()): CachedRead<T> | undefined {
  const entry = entries.get(key)
  if (!entry) return undefined
  if (entry.generation !== getDataGeneration() || entry.owner !== owner() || entry.day !== localDay(now)) {
    entries.delete(key)
    return undefined
  }
  return { value: entry.value as T, age: now.getTime() - entry.at }
}

/**
 * Remembers a result. `generation` is the one the read STARTED at: if anything changed while it ran,
 * the result may already be out of date, so it is not kept.
 */
export function rememberRead(key: string, value: unknown, generation: number, now: Date = new Date()): void {
  entries.delete(key)
  if (generation !== getDataGeneration()) return
  entries.set(key, { value, generation, owner: owner(), day: localDay(now), at: now.getTime() })
  // Oldest first in a Map, so this drops the least recently stored.
  if (entries.size > MAX_ENTRIES) entries.delete(entries.keys().next().value as string)
}

/** Tests only. */
export function clearReadCache(): void {
  entries.clear()
}
