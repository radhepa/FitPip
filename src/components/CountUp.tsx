import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  /** Formats the number being shown (default: whole number with separators). */
  format?: (n: number) => string
  durationMs?: number
}

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** A number that rolls up to its value when it first appears or changes. */
export function CountUp({ value, format = (n) => Math.round(n).toLocaleString(), durationMs = 900 }: Props) {
  const [shown, setShown] = useState(() => (reduceMotion() ? value : 0))
  const from = useRef(shown)

  useEffect(() => {
    if (reduceMotion()) return
    const start = performance.now()
    const begin = from.current
    let frame = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = begin + (value - begin) * eased
      setShown(next)
      from.current = next
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, durationMs])

  return <span className="tabular-nums">{format(reduceMotion() ? value : shown)}</span>
}
