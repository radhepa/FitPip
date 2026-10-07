/** Small bits of physical feedback: a buzz on phones that support it, and a confetti burst. */

// One query object for the whole app: matchMedia() parses the query again on every call, and this is
// asked on every render of an animated number and on every tab tap.
let reducedMotionQuery: MediaQueryList | null | undefined

/** True when the phone asks for less motion. Reads the live setting, so a change applies at once. */
export function reduceMotion(): boolean {
  if (reducedMotionQuery === undefined) reducedMotionQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null
  return reducedMotionQuery?.matches ?? false
}

/** A short vibration (Android; iOS Safari ignores it). */
export function buzz(pattern: number | number[] = 12): void {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // not supported: nothing to do
  }
}

/**
 * Selects a field's whole value when it is tapped, so typing replaces the number instead of adding to
 * it. iOS Safari ignores select() while a tap is still focusing the field, so it is repeated just after.
 */
export function selectAll(e: { currentTarget: HTMLInputElement }): void {
  const field = e.currentTarget
  field.select()
  setTimeout(() => {
    try {
      if (document.activeElement === field) field.setSelectionRange(0, field.value.length)
    } catch {
      // some input types have no selection: nothing to do
    }
  }, 0)
}

/** Keeps a drag's pointer events coming to this element even when the finger strays off it. */
export function capture(e: { currentTarget: Element; pointerId: number }): void {
  try {
    e.currentTarget.setPointerCapture(e.pointerId)
  } catch {
    // the pointer already lifted: the drag just ends normally
  }
}

const COLORS = ['#5b8cff', '#8b5cf6', '#22d3ee', '#ff7a59', '#ffb547', '#34d399', '#f472b6']

/** Fires confetti from the top of the screen for about two seconds. Safe to call repeatedly. */
export function confetti(pieces = 140): void {
  if (typeof document === 'undefined' || reduceMotion()) return
  const canvas = document.createElement('canvas')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  Object.assign(canvas.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '80' })
  canvas.setAttribute('aria-hidden', 'true')
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.remove()
  ctx.scale(dpr, dpr)

  const w = window.innerWidth
  const h = window.innerHeight
  const bits = Array.from({ length: pieces }, () => ({
    x: w / 2 + (Math.random() - 0.5) * w * 0.3,
    y: h * 0.25,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 14 - 4,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.4,
    s: 5 + Math.random() * 6,
    c: COLORS[Math.floor(Math.random() * COLORS.length)],
    round: Math.random() < 0.3,
  }))
  const started = performance.now()
  const frame = (now: number) => {
    const t = now - started
    ctx.clearRect(0, 0, w, h)
    for (const b of bits) {
      b.vy += 0.35
      b.vx *= 0.99
      b.x += b.vx
      b.y += b.vy
      b.r += b.vr
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - t / 2400)
      ctx.translate(b.x, b.y)
      ctx.rotate(b.r)
      ctx.fillStyle = b.c
      if (b.round) {
        ctx.beginPath()
        ctx.arc(0, 0, b.s / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2)
      }
      ctx.restore()
    }
    if (t < 2400) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
