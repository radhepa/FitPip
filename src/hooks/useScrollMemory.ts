import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/** Where each history entry was scrolled to, so Back returns to the same spot. */
const positions = new Map<string, number>()

/** Keeps trying to restore a position while the page is still too short (data or code loading). */
const RESTORE_TIMEOUT_MS = 1000

/**
 * Page-to-page scrolling like an app: a new page opens at the top and Back / Forward return to
 * where that page was left. (Tapping the tab you are on scrolls up: see TabBar.)
 */
export function useScrollMemory(): void {
  const { key, pathname } = useLocation()
  const type = useNavigationType()
  const keyRef = useRef(key)
  const pathRef = useRef<string | null>(null)

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    const save = () => positions.set(keyRef.current, window.scrollY)
    // Scroll events arrive a frame late, so a tap right after a flick could navigate first: also note
    // the position when a tap (or Back) is about to change the page, while the old page is still up.
    window.addEventListener('scroll', save, { passive: true })
    window.addEventListener('click', save, { capture: true })
    window.addEventListener('popstate', save)
    return () => {
      window.removeEventListener('scroll', save)
      window.removeEventListener('click', save, { capture: true })
      window.removeEventListener('popstate', save)
    }
  }, [])

  useLayoutEffect(() => {
    keyRef.current = key
    const samePage = pathRef.current === pathname
    pathRef.current = pathname
    if (samePage) return // e.g. a replace that only updates the page's state
    const saved = type === 'POP' ? positions.get(key) : undefined
    if (!saved) {
      window.scrollTo(0, 0)
      return
    }
    return restoreWhenTall(saved)
  }, [key, pathname, type])
}

/** Scrolls to `target` as soon as the page is long enough, unless the person starts scrolling first. */
function restoreWhenTall(target: number): () => void {
  let frame = 0
  const started = performance.now()
  const stop = () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('touchstart', stop)
    window.removeEventListener('wheel', stop)
  }
  const attempt = () => {
    const room = document.documentElement.scrollHeight - window.innerHeight
    if (room >= target) {
      window.scrollTo(0, target)
      stop()
    } else if (performance.now() - started > RESTORE_TIMEOUT_MS) {
      stop() // it never got that long: stay where it is rather than jump late
    } else {
      frame = requestAnimationFrame(attempt)
    }
  }
  window.addEventListener('touchstart', stop, { passive: true })
  window.addEventListener('wheel', stop, { passive: true })
  attempt()
  return stop
}
