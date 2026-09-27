import type { Session } from '../types/db'
import { localDateIso } from './bodyWeight'
import { WEEK_ORDER } from './weekPlan'

const DAY_MS = 24 * 60 * 60 * 1000

type Finished = Pick<Session, 'started_at' | 'ended_at'>

const finishedOnly = (sessions: Finished[]) => sessions.filter((s): s is { started_at: string; ended_at: string } => !!s.started_at && !!s.ended_at)

/** Local midnight on the Monday of this week. */
export function startOfWeek(now: Date = new Date()): Date {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sinceMonday = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - sinceMonday)
  return start
}

/** Days with a finished workout, as local YYYY-MM-DD. */
const trainedDays = (sessions: Finished[]) => new Set(finishedOnly(sessions).map((s) => localDateIso(new Date(s.started_at))))

/**
 * Days in a row with a finished workout, counting back from today. If today has none yet the
 * streak still stands from yesterday (it only breaks once a whole day is missed).
 */
export function workoutStreak(sessions: Finished[], now: Date = new Date()): number {
  const days = trainedDays(sessions)
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  if (!days.has(localDateIso(cursor))) cursor.setTime(cursor.getTime() - DAY_MS)
  let streak = 0
  while (days.has(localDateIso(cursor))) {
    streak += 1
    cursor.setTime(cursor.getTime() - DAY_MS)
  }
  return streak
}

/** Workouts a week needs for the week streak. Rest days never break it, a week without enough does. */
export const WEEK_MINIMUM = 2

/**
 * Weeks in a row (Monday to Sunday) with at least `minimum` finished workouts. The week in progress
 * counts once it has enough, but never breaks the run while it is still going.
 */
export function weekStreak(sessions: Finished[], now: Date = new Date(), minimum: number = WEEK_MINIMUM): number {
  const counts = new Map<string, number>()
  for (const s of finishedOnly(sessions)) {
    const week = localDateIso(startOfWeek(new Date(s.started_at)))
    counts.set(week, (counts.get(week) ?? 0) + 1)
  }
  const cursor = startOfWeek(now)
  if ((counts.get(localDateIso(cursor)) ?? 0) < minimum) cursor.setDate(cursor.getDate() - 7)
  let weeks = 0
  while ((counts.get(localDateIso(cursor)) ?? 0) >= minimum) {
    weeks += 1
    cursor.setDate(cursor.getDate() - 7)
  }
  return weeks
}

export interface DayStatus {
  weekday: number
  date: Date
  isToday: boolean
  isPast: boolean
  /** A workout was finished that day. */
  done: boolean
  /** Something is planned that day. */
  planned: boolean
}

/** Monday..Sunday of this week, with what was planned and done on each day. */
export function weekStatus(sessions: Finished[], plannedWeekdays: Set<number>, now: Date = new Date()): DayStatus[] {
  const days = trainedDays(sessions)
  const monday = startOfWeek(now)
  const today = localDateIso(now)
  return WEEK_ORDER.map((weekday, i) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i, 12)
    const iso = localDateIso(date)
    return { weekday, date, isToday: iso === today, isPast: iso < today, done: days.has(iso), planned: plannedWeekdays.has(weekday) }
  })
}

export interface WeekTotals {
  workouts: number
  activeSeconds: number
  /** Days with something planned this week. */
  plannedDays: number
  /** Planned days (this week) that have a finished workout. */
  plannedDaysDone: number
}

export function weekTotals(sessions: Finished[], status: DayStatus[], now: Date = new Date()): WeekTotals {
  const from = startOfWeek(now).getTime()
  const thisWeek = finishedOnly(sessions).filter((s) => new Date(s.started_at).getTime() >= from)
  const activeSeconds = thisWeek.reduce((total, s) => total + Math.max(0, (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000), 0)
  return {
    workouts: thisWeek.length,
    activeSeconds: Math.round(activeSeconds),
    plannedDays: status.filter((d) => d.planned).length,
    plannedDaysDone: status.filter((d) => d.planned && d.done).length,
  }
}

/** "Good morning" / "Good afternoon" / "Good evening" / "Up late". */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours()
  if (h < 5) return 'Up late'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
