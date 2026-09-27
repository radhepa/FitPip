/**
 * Motion maths for things you drag and flick (the weigh-in ruler). Units are whatever the caller
 * moves in (kg, lb...) and time is in milliseconds.
 */

/** Friction for a flick: the speed left after each millisecond (a touch firmer than page scrolling). */
export const FLING_DECAY = 0.996

export interface MotionSample {
  t: number
  pos: number
}

/** How fast the finger was moving when it let go, from the last `windowMs` of samples. */
export function releaseVelocity(samples: MotionSample[], windowMs = 100): number {
  const last = samples.at(-1)
  if (!last) return 0
  const recent = samples.filter((s) => last.t - s.t <= windowMs)
  const first = recent[0]
  const dt = last.t - first.t
  return dt > 0 ? (last.pos - first.pos) / dt : 0
}

/** Where a flick that starts at `pos` with `velocity` (units per ms) comes to rest. */
export function flingRest(pos: number, velocity: number, decay = FLING_DECAY): number {
  return pos + (velocity * decay) / (1 - decay)
}

/**
 * Time constant (ms) of an ease-out that leaves at `velocity` and settles `distance` away, so a
 * flick glides on at the speed it was thrown instead of lurching. Falls back when they disagree.
 */
export function easeTau(distance: number, velocity: number, fallback: number, lo = 80, hi = 700): number {
  if (Math.abs(velocity) < 1e-6 || Math.sign(distance) !== Math.sign(velocity)) return fallback
  return Math.min(hi, Math.max(lo, distance / velocity))
}

/** One frame of an exponential ease towards `target` (never overshoots). */
export function easeStep(pos: number, target: number, dt: number, tau: number): number {
  return target + (pos - target) * Math.exp(-dt / Math.max(1, tau))
}
