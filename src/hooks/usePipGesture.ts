import { useCallback, useEffect, useRef, useState } from 'react'
import type { PipMood } from '../components/pip/types'

/** How long a gesture lasts before Pip settles back into the page's pose (matches pip/everyday.css). */
export const GESTURE_MS = 2800

/** A gesture Pip makes for a moment, then stops. `nonce` changes each time, to restart the animation. */
export function usePipGesture() {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [reaction, setReaction] = useState<PipMood>()
  const [nonce, setNonce] = useState(0)

  const play = useCallback((mood: PipMood | null) => {
    clearTimeout(timer.current)
    setNonce((n) => n + 1)
    setReaction(mood ?? undefined)
    if (mood) timer.current = setTimeout(() => setReaction(undefined), GESTURE_MS)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])
  return { reaction, nonce, play }
}
