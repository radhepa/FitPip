import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { buzz, capture, reduceMotion } from '../components/fx'
import { easeStep, easeTau, flingRest, releaseVelocity, type MotionSample } from '../lib/fling'

interface Options {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  /** Drawing units (viewBox px) per 1 unit of value. */
  pxPerUnit: number
  /** viewBox width of the ruler. */
  width: number
}

interface Drag {
  x: number
  start: number
  scale: number
  left: number
  moved: boolean
  /** The press stopped a glide that was still moving. */
  caught: boolean
  samples: MotionSample[]
}

const round1 = (n: number) => Math.round(n * 10) / 10
const REBASE_AT = 1.2
const TAP_SLOP = 4
const SNAP_MS = 70
const GLIDE_MS = 110
const TAP_MS = 140

/**
 * The feel of the weigh-in ruler: it follows the finger 1:1 (not in 0.1 jumps), coasts after a flick
 * and settles exactly on a tenth, and glides when the value changes from outside (buttons, typing).
 * The motion writes the tick group's transform straight to the DOM each frame; React only re-renders
 * when the shown tenth changes or the tick window needs to move along (`base`).
 */
export function useRulerMotion({ value, onChange, min, max, pxPerUnit, width }: Options) {
  const [base, setBase] = useState(() => Math.round(value))
  const groupRef = useRef<SVGGElement>(null)
  const onChangeRef = useRef(onChange)
  const m = useRef({ pos: value, base: Math.round(value), emitted: value, target: value, tau: GLIDE_MS, emitting: false, animating: false, raf: 0, last: 0, drag: null as Drag | null })
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  useEffect(() => {
    onChangeRef.current = onChange
  })

  function paint() {
    const s = m.current
    if (Math.abs(s.pos - s.base) > REBASE_AT) setBase(Math.round(s.pos))
    groupRef.current?.setAttribute('transform', `translate(${((s.base - s.pos) * pxPerUnit).toFixed(2)} 0)`)
  }

  function emit(pos: number) {
    const s = m.current
    const next = clamp(round1(pos))
    if (next === s.emitted) return
    if (Math.floor(next) !== Math.floor(s.emitted)) buzz(4)
    s.emitted = next
    onChangeRef.current(next)
  }

  function tick(now: number) {
    const s = m.current
    const dt = Math.min(48, now - s.last)
    s.last = now
    s.pos = easeStep(s.pos, s.target, dt, s.tau)
    const done = Math.abs(s.pos - s.target) < 0.003
    if (done) s.pos = s.target
    paint()
    if (s.emitting) emit(s.pos)
    if (done) s.animating = false
    else s.raf = requestAnimationFrame(tick)
  }

  /** Eases to `target`; `emitting` reports each tenth passed on the way (a flick), not for outside changes. */
  function animateTo(target: number, tau: number, emitting: boolean) {
    const s = m.current
    Object.assign(s, { target, tau, emitting })
    if (reduceMotion()) {
      s.pos = target
      paint()
      if (emitting) emit(target)
      return
    }
    if (s.animating) return
    s.animating = true
    s.last = performance.now()
    s.raf = requestAnimationFrame(tick)
  }

  function stop(): boolean {
    const s = m.current
    cancelAnimationFrame(s.raf)
    const wasMoving = s.animating
    s.animating = false
    return wasMoving
  }

  // The tick window moved: re-apply the offset in the same frame so nothing jumps.
  useLayoutEffect(() => {
    m.current.base = base
    paint()
  })

  // A change from outside (buttons, typing, arrow keys): glide there.
  useEffect(() => {
    const s = m.current
    if (value === s.emitted) return
    s.emitted = value
    if (!s.drag) animateTo(value, GLIDE_MS, false)
  })

  useEffect(() => () => cancelAnimationFrame(m.current.raf), [])

  const handlers = {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.button !== 0) return
      const caught = stop()
      const rect = e.currentTarget.getBoundingClientRect()
      const s = m.current
      s.drag = { x: e.clientX, start: s.pos, scale: width / rect.width, left: rect.left, moved: false, caught, samples: [{ t: e.timeStamp, pos: s.pos }] }
      capture(e)
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const s = m.current
      const d = s.drag
      if (!d) return
      const dx = e.clientX - d.x
      if (!d.moved && Math.abs(dx) < TAP_SLOP) return
      d.moved = true
      s.pos = clamp(d.start - (dx * d.scale) / pxPerUnit)
      d.samples.push({ t: e.timeStamp, pos: s.pos })
      if (d.samples.length > 12) d.samples.shift()
      paint()
      emit(s.pos)
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      const s = m.current
      const d = s.drag
      if (!d) return
      s.drag = null
      if (!d.moved) {
        // A tap: catch a moving ruler where it is, otherwise glide to the tick that was tapped.
        if (d.caught) return animateTo(clamp(round1(s.pos)), SNAP_MS, true)
        const x = (e.clientX - d.left) * d.scale
        return animateTo(clamp(round1(s.pos + (x - width / 2) / pxPerUnit)), TAP_MS, true)
      }
      d.samples.push({ t: e.timeStamp, pos: s.pos })
      const velocity = releaseVelocity(d.samples)
      const rest = clamp(round1(flingRest(s.pos, velocity)))
      animateTo(rest, Math.abs(velocity) < 0.0004 ? SNAP_MS : easeTau(rest - s.pos, velocity, 240), true)
    },
    onPointerCancel() {
      const s = m.current
      if (!s.drag) return
      s.drag = null
      animateTo(clamp(round1(s.pos)), SNAP_MS, true)
    },
  }

  return { base, groupRef, handlers }
}
