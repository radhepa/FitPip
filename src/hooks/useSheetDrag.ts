import { useRef, type PointerEvent, type RefObject } from 'react'
import { capture } from '../components/fx'
import { releaseVelocity, type MotionSample } from '../lib/fling'

const SLOP_PX = 5
/** Downward speed (px per ms) that closes the sheet even on a short pull. */
const FLICK_SPEED = 0.5

interface Drag {
  id: number
  y: number
  dy: number
  captured: boolean
  samples: MotionSample[]
}

/**
 * Pull a bottom sheet down by its handle to close it. Spread the returned props on the grab area;
 * the panel follows the finger, and a long enough pull (or a flick) calls `onClose`.
 */
export function useSheetDrag(panelRef: RefObject<HTMLDivElement | null>, onClose: () => void) {
  const drag = useRef<Drag | null>(null)

  const place = (dy: number, springBack: boolean) => {
    const panel = panelRef.current
    if (!panel) return
    panel.style.animation = 'none'
    panel.style.transition = springBack ? 'transform 300ms var(--ease-spring)' : 'none'
    panel.style.transform = dy > 0 ? `translateY(${dy}px)` : ''
  }

  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.button !== 0) return
      drag.current = { id: e.pointerId, y: e.clientY, dy: 0, captured: false, samples: [{ t: e.timeStamp, pos: 0 }] }
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const d = drag.current
      if (!d || e.pointerId !== d.id) return
      const raw = e.clientY - d.y
      if (!d.captured) {
        if (Math.abs(raw) < SLOP_PX) return
        // Capture only once it's a drag, so a tap on the close button still clicks it.
        d.captured = true
        capture(e)
      }
      d.dy = Math.max(0, raw)
      d.samples.push({ t: e.timeStamp, pos: d.dy })
      if (d.samples.length > 10) d.samples.shift()
      place(d.dy, false)
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      const d = drag.current
      drag.current = null
      if (!d?.captured) return
      d.samples.push({ t: e.timeStamp, pos: d.dy })
      const panel = panelRef.current
      const far = Math.min(140, (panel?.offsetHeight ?? 400) * 0.3)
      if (d.dy > far || (d.dy > 24 && releaseVelocity(d.samples) > FLICK_SPEED)) {
        onClose()
        // If the owner kept it open after all, settle it back into place.
        window.setTimeout(() => panel?.isConnected && place(0, true), 60)
      } else place(0, true)
    },
    onPointerCancel() {
      const d = drag.current
      drag.current = null
      if (d?.captured) place(0, true)
    },
  }
}
