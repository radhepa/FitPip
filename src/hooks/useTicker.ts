import { useEffect, useState } from 'react'

/** The current time, refreshed several times a second while `active`. */
export function useTicker(active: boolean, intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const tick = () => setNow(Date.now())
    tick()
    const timer = setInterval(tick, intervalMs)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [active, intervalMs])
  return now
}
