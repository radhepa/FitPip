import { useCallback, useState } from 'react'

const KEY = 'fitpip.rest-seconds'
const DEFAULT_REST = 90

export interface Rest {
  id: number
  endsAt: number
  total: number
}

function restSeconds(): number {
  try {
    const value = Number(localStorage.getItem(KEY))
    return value >= 15 && value <= 600 ? value : DEFAULT_REST
  } catch {
    return DEFAULT_REST
  }
}

/** The rest countdown between lifting sets. Adjusting it remembers the new length for next time. */
export function useRestTimer() {
  const [rest, setRest] = useState<Rest | null>(null)

  const start = useCallback(() => {
    const total = restSeconds() * 1000
    setRest({ id: Date.now(), endsAt: Date.now() + total, total })
  }, [])

  const change = useCallback((endsAt: number, total: number) => {
    setRest((prev) => (prev ? { ...prev, endsAt, total } : prev))
    try {
      localStorage.setItem(KEY, String(Math.round(total / 15000) * 15))
    } catch {
      // not remembered this time
    }
  }, [])

  const stop = useCallback(() => setRest(null), [])
  return { rest, start, change, stop }
}
