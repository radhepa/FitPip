import { useCallback } from 'react'
import { useSettings } from './useSettings'
import { useStoredState } from './useStoredState'

export interface Rest {
  id: number
  endsAt: number
  total: number
}

/** A rest worth bringing back: still running (one that ended while you were away is just over). */
const isRest = (value: unknown): value is Rest | null => {
  if (value === null) return true
  if (typeof value !== 'object') return false
  const r = value as Record<string, unknown>
  return typeof r.id === 'number' && typeof r.total === 'number' && typeof r.endsAt === 'number' && r.endsAt > Date.now()
}

/**
 * The rest countdown between lifting sets. Its length is the Rest timer setting (0 = off); adding or
 * trimming time on the countdown only affects the rest that is running. With a `key` (the workout),
 * a running rest carries on after leaving the workout screen and coming back.
 */
export function useRestTimer(key?: string) {
  const { restSeconds } = useSettings()
  const [rest, setRest] = useStoredState<Rest | null>(key && `rest:${key}`, null, isRest)

  const start = useCallback(() => {
    if (restSeconds <= 0) return
    const total = restSeconds * 1000
    setRest({ id: Date.now(), endsAt: Date.now() + total, total })
  }, [restSeconds, setRest])

  const change = useCallback(
    (endsAt: number, total: number) => {
      if (rest) setRest({ ...rest, endsAt, total })
    },
    [rest, setRest],
  )

  const stop = useCallback(() => setRest(null), [setRest])
  return { rest, start, change, stop }
}
