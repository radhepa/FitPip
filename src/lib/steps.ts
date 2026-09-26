import { formatWeight } from './format'
import { parseDuration } from './parse'

/** Steps a number held as text (blank counts as 0), never below `min`. */
export function stepNumber(text: string, delta: number, min = 0): string {
  const current = Number(text.trim().replace(',', '.'))
  const base = Number.isFinite(current) ? current : 0
  return formatWeight(Math.max(min, Math.round((base + delta) * 100) / 100))
}

/** "0:45", "3:00", "1:05:00": seconds as a clock for editing. */
export function clockText(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
}

/** Steps a time held as text by `delta` seconds (never below `min`). */
export function stepClock(text: string, delta: number, bare: 'seconds' | 'minutes' = 'seconds', min = 5): string {
  const current = parseDuration(text, bare) ?? 0
  return clockText(Math.max(min, current + delta))
}

/** The RPE choices offered as chips. */
export const RPE_CHOICES = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10] as const
