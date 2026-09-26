/** The rest countdown after a lifting set. 0 seconds means the timer is off. */
export const REST_MIN = 15
export const REST_MAX = 600
export const REST_DEFAULT = 90
/** Quick picks shown in Settings. */
export const REST_PRESETS = [60, 90, 120, 180] as const

/** Whole seconds within the allowed range; 0 (off) stays 0. */
export function clampRest(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0
  return Math.min(REST_MAX, Math.max(REST_MIN, Math.round(seconds)))
}

/** One tap of + or −: 15 s steps up to two minutes, then 30 s steps, so 3:00 isn't six taps away. */
export function stepRest(seconds: number, direction: -1 | 1): number {
  const coarse = direction === 1 ? seconds >= 120 : seconds > 120
  // Never steps down into "off": that is its own switch.
  return Math.min(REST_MAX, Math.max(REST_MIN, seconds + direction * (coarse ? 30 : 15)))
}

/** "1:30", "2:00": a rest length for display. */
export function restText(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
