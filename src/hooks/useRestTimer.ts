import { useCallback, useState } from 'react'
import { useSettings } from './useSettings'

export interface Rest {
  id: number
  endsAt: number
  total: number
}

/**
 * The rest countdown between lifting sets. Its length is the Rest timer setting (0 = off); adding or
 * trimming time on the countdown only affects the rest that is running.
 */
export function useRestTimer() {
  const { restSeconds } = useSettings()
  const [rest, setRest] = useState<Rest | null>(null)

  const start = useCallback(() => {
    if (restSeconds <= 0) return
    const total = restSeconds * 1000
    setRest({ id: Date.now(), endsAt: Date.now() + total, total })
  }, [restSeconds])

  const change = useCallback((endsAt: number, total: number) => {
    setRest((prev) => (prev ? { ...prev, endsAt, total } : prev))
  }, [])

  const stop = useCallback(() => setRest(null), [])
  return { rest, start, change, stop }
}
