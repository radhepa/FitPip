import { useLayoutEffect, useRef } from 'react'
import { formatWhole } from '../lib/format'
import { reduceMotion } from './fx'

interface Props {
  value: number
  /** Formats the number being shown (default: whole number with separators). */
  format?: (n: number) => string
  durationMs?: number
}

/**
 * A number that rolls up to its value when it first appears or changes. Each frame writes the text
 * straight into the page instead of re-rendering through React, so a screen full of these stays smooth
 * on a phone while it opens.
 */
export function CountUp({ value, format = formatWhole, durationMs = 900 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  /** The number on screen right now; null until the first write. */
  const shown = useRef<number | null>(null)
  const formatRef = useRef(format)
  formatRef.current = format

  // A new format with the same value (another unit, say) still has to show at once.
  useLayoutEffect(() => {
    if (ref.current && shown.current !== null) ref.current.textContent = format(shown.current)
  })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const write = (n: number) => {
      shown.current = n
      el.textContent = formatRef.current(n)
    }
    if (reduceMotion()) {
      write(value)
      return
    }
    const begin = shown.current ?? 0
    const start = performance.now()
    let frame = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      write(begin + (value - begin) * (1 - Math.pow(1 - t, 3)))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    write(begin)
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, durationMs])

  return <span ref={ref} className="tabular-nums" />
}
