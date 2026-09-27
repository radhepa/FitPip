import { useEffect } from 'react'

/**
 * Keeps the screen on while `active` (a rest, stopwatch or countdown is running), so the phone doesn't
 * lock mid-rest. Asked for again after the app comes back to the front, since the browser drops it when
 * hidden. Where the Wake Lock API is missing or refused, nothing happens.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let stopped = false

    const request = async () => {
      if (document.visibilityState !== 'visible' || (lock && !lock.released)) return
      try {
        const next = await navigator.wakeLock.request('screen')
        if (stopped) void next.release()
        else lock = next
      } catch {
        // not allowed right now (battery saver, no user gesture yet): the screen just behaves as usual
      }
    }

    void request()
    document.addEventListener('visibilitychange', request)
    return () => {
      stopped = true
      document.removeEventListener('visibilitychange', request)
      void lock?.release().catch(() => {})
    }
  }, [active])
}
