import type { BodyWeight, WeightUnit } from '../types/db'
import { convertWeight } from './units'

/** A weigh-in in the unit being shown. */
export interface WeighIn {
  id: string
  /** YYYY-MM-DD */
  date: string
  weight: number
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Today's local date as YYYY-MM-DD (not UTC: a late-evening weigh-in belongs to today). */
export function localDateIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/** Noon on a YYYY-MM-DD date, as ms (noon keeps daylight-saving shifts from changing the day). */
export const dateMs = (iso: string): number => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12).getTime()
}

/** Oldest first, converted into `unit`. */
export function toWeighIns(rows: BodyWeight[], unit: WeightUnit): WeighIn[] {
  return rows
    .map((r) => ({ id: r.id, date: r.measured_on, weight: convertWeight(Number(r.weight), r.unit, unit) }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

const round1 = (n: number) => Math.round(n * 10) / 10

/**
 * Change from the weigh-in closest to `days` before the latest one (only earlier weigh-ins count).
 * Null when there is nothing old enough to compare with.
 */
export function changeOver(weighIns: WeighIn[], days: number): number | null {
  if (weighIns.length < 2) return null
  const latest = weighIns[weighIns.length - 1]
  const target = dateMs(latest.date) - days * DAY_MS
  let best: WeighIn | null = null
  for (const w of weighIns.slice(0, -1)) {
    if (!best || Math.abs(dateMs(w.date) - target) < Math.abs(dateMs(best.date) - target)) best = w
  }
  return best ? round1(latest.weight - best.weight) : null
}

/** Average of the weigh-ins in the last 7 days up to the latest one (smooths out daily swings). */
export function weekAverage(weighIns: WeighIn[]): number | null {
  if (weighIns.length === 0) return null
  const end = dateMs(weighIns[weighIns.length - 1].date)
  const recent = weighIns.filter((w) => end - dateMs(w.date) < 7 * DAY_MS)
  return round1(recent.reduce((sum, w) => sum + w.weight, 0) / recent.length)
}

export interface GoalProgress {
  start: number
  current: number
  goal: number
  /** 0..1 of the way from the first weigh-in to the goal. */
  fraction: number
  /** What is left to lose (negative) or gain (positive). */
  remaining: number
  reached: boolean
}

/** Progress from the first weigh-in towards the goal, in either direction. */
export function goalProgress(weighIns: WeighIn[], goal: number | null): GoalProgress | null {
  if (goal === null || weighIns.length === 0) return null
  const start = weighIns[0].weight
  const current = weighIns[weighIns.length - 1].weight
  const total = goal - start
  const reached = total === 0 ? true : total < 0 ? current <= goal : current >= goal
  const fraction = total === 0 ? 1 : Math.min(1, Math.max(0, (current - start) / total))
  return { start, current, goal, fraction: reached ? 1 : fraction, remaining: round1(goal - current), reached }
}

/** Consecutive days, up to today, with a weigh-in. */
export function weighInStreak(weighIns: WeighIn[], today: string): number {
  const dates = new Set(weighIns.map((w) => w.date))
  let streak = 0
  let cursor = dateMs(today)
  while (dates.has(localDateIso(new Date(cursor)))) {
    streak += 1
    cursor -= DAY_MS
  }
  return streak
}
