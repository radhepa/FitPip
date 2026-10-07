import type { Session, SetRow, WeightUnit } from '../types/db'
import { formatDistance, formatPace, type LengthUnit } from './units'

export function formatWeight(weight: number): string {
  return Number.isInteger(weight) ? String(weight) : String(Math.round(weight * 100) / 100)
}

interface SetLike {
  weight: number
  reps: number
  rpe?: number | null
}

/** "135 lb × 8", or "135 lb × 8 @8" when an RPE was recorded. */
export function formatSet(set: SetLike, unit?: WeightUnit): string {
  const weight = set.weight === 0 ? 'BW' : formatWeight(set.weight)
  const rpe = set.rpe == null ? '' : ` @${formatWeight(set.rpe)}`
  return `${weight}${unit && set.weight !== 0 ? ` ${unit}` : ''} × ${set.reps}${rpe}`
}

/** "135 × 8 · 135 × 8 · 145 × 6 · +2 more" */
export function formatSetList(sets: SetLike[], unit?: WeightUnit, max = 4): string {
  const shown = sets.slice(0, max).map((s) => formatSet(s, unit))
  const rest = sets.length - shown.length
  return rest > 0 ? `${shown.join(' · ')} · +${rest} more` : shown.join(' · ')
}

// Formatters are built once: toLocaleString() and friends build a new one on every call, which is
// slow enough to show on long lists and in number animations on phones.
const wholeNumbers = new Intl.NumberFormat()
const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
const shortDateFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

/** "12,450": rounded, with the device's thousands separators. */
export function formatWhole(n: number): string {
  return wholeNumbers.format(Math.round(n))
}

export function formatVolume(volume: number, unit: WeightUnit): string {
  return `${formatWhole(volume)} ${unit}`
}

/** "Tue, Oct 7" */
export function formatDate(iso: string | number | Date): string {
  return dateFormat.format(new Date(iso))
}

export function formatShortDate(ms: number): string {
  return shortDateFormat.format(new Date(ms))
}

export function formatTime(iso: string | Date): string {
  return timeFormat.format(new Date(iso))
}

const pad2 = (n: number) => String(n).padStart(2, '0')

function splitSeconds(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return { hours: Math.floor(total / 3600), minutes: Math.floor((total % 3600) / 60), seconds: total % 60 }
}

/** A running clock: "0:07", "12:05", "1:03:27". */
export function formatClock(ms: number): string {
  const { hours, minutes, seconds } = splitSeconds(ms)
  return hours > 0 ? `${hours}:${pad2(minutes)}:${pad2(seconds)}` : `${minutes}:${pad2(seconds)}`
}

/** A finished length of time, to the second: "45s", "48m 12s", "1h 03m 27s". */
export function formatDuration(ms: number): string {
  const { hours, minutes, seconds } = splitSeconds(ms)
  if (hours > 0) return `${hours}h ${pad2(minutes)}m ${pad2(seconds)}s`
  return minutes > 0 ? `${minutes}m ${pad2(seconds)}s` : `${seconds}s`
}

export function sessionDurationMs(session: Pick<Session, 'started_at' | 'ended_at'>): number | null {
  if (!session.started_at || !session.ended_at) return null
  return new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()
}

export function sessionTitle(session: Pick<Session, 'name'>): string {
  return session.name?.trim() || 'Workout'
}

/** "front_delts" -> "Front delts" */
export function muscleLabel(muscle: string): string {
  const spaced = muscle.replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** "1 set", "3 sets", "0.5 sets": a count with its noun, singular only for exactly one. */
export function countOf(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

/** Set counts can be halves (secondary muscles) or averages: "12", "6.5", "2.8". */
export function formatSetCount(count: number): string {
  return Number.isInteger(count) ? String(count) : count.toFixed(1)
}

/** A hold, round or effort length: "45s", "3:00", "32:10", "1:05:00". */
export function formatSeconds(seconds: number): string {
  return seconds < 60 ? `${seconds}s` : formatClock(seconds * 1000)
}

/** Total active time: "45 min", "1 h 20 min". */
export function formatMinutes(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

type EntrySet = Pick<SetRow, 'weight' | 'reps' | 'rpe' | 'duration_seconds' | 'distance_m'>

/**
 * One logged set in words, whatever it tracks: "135 lb × 8 @8", "3:00", "5.02 km in 26:10 · 5:13 /km".
 * `lengthUnit` is only needed for distances.
 */
export function formatEntry(set: EntrySet, unit: WeightUnit, lengthUnit?: LengthUnit): string {
  if (set.duration_seconds === null && set.distance_m === null) return formatSet(set, unit)
  const parts: string[] = []
  if (set.distance_m !== null && lengthUnit) parts.push(formatDistance(set.distance_m, lengthUnit))
  if (set.duration_seconds !== null) parts.push(parts.length ? `in ${formatSeconds(set.duration_seconds)}` : formatSeconds(set.duration_seconds))
  const pace = lengthUnit ? formatPace(set.duration_seconds, set.distance_m, lengthUnit) : null
  return pace ? `${parts.join(' ')} · ${pace}` : parts.join(' ')
}
