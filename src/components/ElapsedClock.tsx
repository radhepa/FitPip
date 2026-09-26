import { useEffect, useState } from 'react'
import { formatClock } from '../lib/format'

/** Time since a workout began, to the second ("12:05", "1:03:27"). */
export function ElapsedClock({ startedAt }: { startedAt: string }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const timer = setInterval(tick, 1000)
    // A phone stops timers while the app is in the background: catch up as soon as it is back.
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  return (
    <span role="timer" aria-label="Time elapsed" className="tabular-nums">
      {formatClock(now - new Date(startedAt).getTime())}
    </span>
  )
}
