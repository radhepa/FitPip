/** Weight from a text field. Blank means 0 (bodyweight). Returns null when invalid. */
export function parseWeight(text: string): number | null {
  const trimmed = text.trim().replace(',', '.')
  if (trimmed === '') return 0
  if (!/^\d*\.?\d+$|^\d+\.$/.test(trimmed)) return null
  const value = Number(trimmed)
  return Number.isFinite(value) && value >= 0 && value < 100000 ? Math.round(value * 100) / 100 : null
}

export type RpeInput = { ok: true; value: number | null } | { ok: false }

/** RPE from a text field. Blank means "not recorded"; otherwise 1 to 10 in half steps. */
export function parseRpe(text: string): RpeInput {
  const trimmed = text.trim().replace(',', '.')
  if (trimmed === '') return { ok: true, value: null }
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return { ok: false }
  const value = Number(trimmed)
  return value >= 1 && value <= 10 && Number.isInteger(value * 2) ? { ok: true, value } : { ok: false }
}

/** Whole number of reps, at least 1. Returns null when invalid. */
export function parseReps(text: string): number | null {
  const trimmed = text.trim()
  if (!/^\d+$/.test(trimmed)) return null
  const value = Number(trimmed)
  return value >= 1 && value <= 1000 ? value : null
}

/**
 * A length of time from a text field: "1:30" (m:ss), "1:02:03" (h:mm:ss), or a bare number in
 * `bare` units ("45" = 45 seconds for a hold, "30" = 30 minutes for a run). Returns whole seconds,
 * or null when blank or invalid.
 */
export function parseDuration(text: string, bare: 'seconds' | 'minutes' = 'seconds'): number | null {
  const trimmed = text.trim().replace(',', '.')
  if (trimmed === '') return null
  let seconds: number
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    seconds = Number(trimmed) * (bare === 'minutes' ? 60 : 1)
  } else if (/^\d+:\d{1,2}(:\d{1,2})?$/.test(trimmed)) {
    const parts = trimmed.split(':').map(Number)
    if (parts.slice(1).some((p) => p >= 60)) return null
    seconds = parts.reduce((total, part) => total * 60 + part, 0)
  } else {
    return null
  }
  seconds = Math.round(seconds)
  return seconds >= 1 && seconds <= 86400 ? seconds : null
}

/** A positive distance ("5", "3.1", "1500"). Blank means not recorded (null); invalid is undefined. */
export function parseDistance(text: string): number | null | undefined {
  const trimmed = text.trim().replace(',', '.')
  if (trimmed === '') return null
  if (!/^\d*\.?\d+$/.test(trimmed)) return undefined
  const value = Number(trimmed)
  return value > 0 && value < 100000 ? value : undefined
}
