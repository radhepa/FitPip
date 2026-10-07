import { useSyncExternalStore } from 'react'
import { localDateIso } from '../lib/bodyWeight'

/**
 * Re-checks the date at midnight and whenever the app comes back to the front. A phone can keep the
 * app open (or asleep in the background) across midnight, and timers don't run while it sleeps.
 */
function subscribe(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  const arm = () => {
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1)
    timer = setTimeout(() => {
      onChange()
      arm()
    }, midnight.getTime() - now.getTime())
  }
  arm()
  document.addEventListener('visibilitychange', onChange)
  window.addEventListener('focus', onChange)
  window.addEventListener('pageshow', onChange)
  return () => {
    clearTimeout(timer)
    document.removeEventListener('visibilitychange', onChange)
    window.removeEventListener('focus', onChange)
    window.removeEventListener('pageshow', onChange)
  }
}

const today = () => localDateIso()

/** Today's local date (YYYY-MM-DD). The component redraws when the day changes. */
export function useToday(): string {
  return useSyncExternalStore(subscribe, today, today)
}
