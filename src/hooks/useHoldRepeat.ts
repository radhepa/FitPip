import { useEffect, useLayoutEffect, useRef, type MouseEvent, type PointerEvent } from 'react'

const FIRST_DELAY_MS = 380
const START_INTERVAL_MS = 150
const MIN_INTERVAL_MS = 50

/**
 * Press-and-hold for a − / + button. A tap steps once (on click, so keyboards and screen readers work
 * as before); holding keeps stepping, faster and faster, until the finger lifts. Spread the returned
 * props onto the button.
 */
export function useHoldRepeat(step: () => void) {
  const stepRef = useRef(step)
  const timer = useRef(0)
  const repeated = useRef(false)

  // Callers often step from the value they rendered with, so keep the latest one before the next tick.
  useLayoutEffect(() => {
    stepRef.current = step
  })
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const stop = () => window.clearTimeout(timer.current)
  const run = (interval: number) => {
    repeated.current = true
    stepRef.current()
    timer.current = window.setTimeout(() => run(Math.max(MIN_INTERVAL_MS, interval * 0.9)), interval)
  }

  return {
    onPointerDown(e: PointerEvent<HTMLButtonElement>) {
      if (e.button !== 0) return
      stop()
      repeated.current = false
      timer.current = window.setTimeout(() => run(START_INTERVAL_MS), FIRST_DELAY_MS)
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    // A long press would otherwise open the phone's context menu.
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
    onClick(e: MouseEvent) {
      // The click that ends a hold is not another step (keyboard clicks have detail 0).
      if (repeated.current && e.detail !== 0) {
        repeated.current = false
        return
      }
      stepRef.current()
    },
  }
}
