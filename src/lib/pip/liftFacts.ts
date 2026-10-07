// What Pip knows about each lift: your best set on every day you did it, and which days set a record.
import type { BegunSession, Exercise, SetRow } from '../../types/db'
import { localDateIso } from '../bodyWeight'
import { estimate1RM } from '../e1rm'
import { daysBetween } from './time'

/** The best set of one exercise on one training day. */
export interface LiftDay {
  day: string
  /** Days before now. */
  ageDays: number
  /** Weight of the top set (0 for bodyweight moves). */
  weight: number
  reps: number
  /** Estimated one-rep max for a weighted move, or the reps for a bodyweight move. */
  score: number
  sets: number
}

export interface LiftHistory {
  exercise: Exercise
  /** 'load' = weight x reps, 'reps' = bodyweight reps. */
  kind: 'load' | 'reps'
  /** Oldest first, one per training day. */
  days: LiftDay[]
  totalSets: number
}

export interface LiftRecord {
  history: LiftHistory
  day: LiftDay
  /** The best day before this one. */
  previous: LiftDay
}

const isLift = (e: Exercise) => e.category === 'strength' && e.tracking === 'reps'

/** Better score wins; the heavier set breaks a tie. */
const better = (a: { score: number; weight: number }, b: { score: number; weight: number }) => a.score > b.score || (a.score === b.score && a.weight > b.weight)

/** Every lifting exercise that has finished sets, with its best set per day. Unfinished workouts are left out. */
export function liftHistories(input: { exercises: Exercise[]; sessions: BegunSession[]; sets: SetRow[]; now: Date }): LiftHistory[] {
  // One local date per finished session, worked out once rather than once per set.
  const dayOfSession = new Map(input.sessions.filter((s) => s.ended_at).map((s) => [s.id, localDateIso(new Date(s.started_at))]))
  const lifts = new Map(input.exercises.filter(isLift).map((e) => [e.id, e]))
  const grouped = new Map<string, Map<string, SetRow[]>>()
  for (const set of input.sets) {
    const day = dayOfSession.get(set.session_id)
    if (!day || !lifts.has(set.exercise_id) || set.reps < 1) continue
    let days = grouped.get(set.exercise_id)
    if (!days) grouped.set(set.exercise_id, (days = new Map()))
    const list = days.get(day)
    if (list) list.push(set)
    else days.set(day, [set])
  }

  const histories: LiftHistory[] = []
  for (const [exerciseId, byDay] of grouped) {
    const exercise = lifts.get(exerciseId)!
    const kind = [...byDay.values()].some((sets) => sets.some((s) => s.weight > 0)) ? 'load' : 'reps'
    const days: LiftDay[] = [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([day, sets]): LiftDay[] => {
        // A weighted lift ignores any set logged without a weight.
        const usable = kind === 'load' ? sets.filter((s) => s.weight > 0) : sets
        if (usable.length === 0) return []
        const scored = (s: SetRow) => ({ set: s, score: kind === 'load' ? estimate1RM(s.weight, s.reps) : s.reps, weight: s.weight })
        const top = usable.map(scored).reduce((a, b) => (better(b, a) ? b : a))
        const [y, m, d] = day.split('-').map(Number)
        return [{ day, ageDays: daysBetween(new Date(y, m - 1, d, 12), input.now), weight: top.set.weight, reps: top.set.reps, score: top.score, sets: usable.length }]
      })
    if (days.length > 0) histories.push({ exercise, kind, days, totalSets: days.reduce((n, d) => n + d.sets, 0) })
  }
  return histories
}

/** The best of these days (by estimated max, then weight). */
export const bestDay = (days: LiftDay[]): LiftDay | null => days.reduce<LiftDay | null>((best, d) => (!best || better(d, best) ? d : best), null)

/** The day closest to `ageDays` before now, within `tolerance` days either way. */
export function dayNear(days: LiftDay[], ageDays: number, tolerance: number): LiftDay | null {
  let found: LiftDay | null = null
  for (const d of days) {
    const off = Math.abs(d.ageDays - ageDays)
    if (off <= tolerance && (!found || off < Math.abs(found.ageDays - ageDays))) found = d
  }
  return found
}

/** Days that beat everything before them (the first time you did a lift is not a record). */
export function recordsOf(history: LiftHistory): LiftRecord[] {
  const out: LiftRecord[] = []
  let best: LiftDay | null = null
  for (const day of history.days) {
    if (best && better(day, best)) out.push({ history, day, previous: best })
    if (!best || better(day, best)) best = day
  }
  return out
}

/** Records set within the last few days, newest first. */
export function recentRecords(histories: LiftHistory[], withinDays: number): LiftRecord[] {
  return histories
    .flatMap(recordsOf)
    .filter((r) => r.day.ageDays <= withinDays)
    .sort((a, b) => a.day.ageDays - b.day.ageDays || b.day.score - a.day.score)
}
