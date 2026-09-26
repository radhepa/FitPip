import { useEffect, useRef, useState, type PointerEvent } from 'react'

/** Keep idle animation off the battery when Pip is offscreen or the tab is hidden. */
export function usePipMotion() {
  const ref = useRef<HTMLElement>(null)
  const frame = useRef(0)
  const reducedMotion = useRef(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    let inView = true
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      reducedMotion.current = preference.matches
      setPaused(!inView || document.hidden || preference.matches)
      if (preference.matches) {
        cancelAnimationFrame(frame.current)
        element.style.removeProperty('--pip-look-x')
        element.style.removeProperty('--pip-look-y')
        element.style.removeProperty('--pip-look-tilt')
      }
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      update()
    }, { threshold: 0.05 })
    observer?.observe(element)
    document.addEventListener('visibilitychange', update)
    preference.addEventListener('change', update)
    update()
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', update)
      preference.removeEventListener('change', update)
      cancelAnimationFrame(frame.current)
    }
  }, [])

  const resetGaze = () => {
    cancelAnimationFrame(frame.current)
    ref.current?.style.removeProperty('--pip-look-x')
    ref.current?.style.removeProperty('--pip-look-y')
    ref.current?.style.removeProperty('--pip-look-tilt')
  }

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch' || reducedMotion.current || paused) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1))
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1))
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      ref.current?.style.setProperty('--pip-look-x', `${x * 3.5}px`)
      ref.current?.style.setProperty('--pip-look-y', `${y * 2.5}px`)
      ref.current?.style.setProperty('--pip-look-tilt', `${x * 4}deg`)
    })
  }

  return { ref, paused, onPointerMove, resetGaze }
}
