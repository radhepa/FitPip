// What Pip knows about how you train: streaks, weeks in a row, gaps, cardio time, favourites.
import { activityBadgeKey } from '../../config/activityBadges'
import type { BegunSession, Exercise, SetRow } from '../../types/db'
import { localDateIso } from '../bodyWeight'
import { sessionTitle } from '../format'
import { startOfWeek, workoutStreak } from '../homeStats'
import { MUSCLE_GROUPS } from '../strengthRank'
import { daysBetween } from './time'

export interface MuscleGap {
  key: string
  label: string
  days: number
}

export interface CardioFacts {
  minutesThisWeek: number
  sessionsThisMonth: number
  distanceMonthM: number
  /** The longest run or jog you have logged (at least 800 m). */
  longestRun: { exercise: Exercise; distanceM: number; ageDays: number } | null
}

export interface HabitFacts {
  /** Finished workouts, ever. */
  workouts: number
  thisWeek: number
  streak: number
  bestStreak: number
  /** Weeks in a row (this one counts once it qualifies) with at least WEEK_MINIMUM workouts. */
  weekStreak: number
  daysSinceLast: number | null
  lastName: string | null
  firstDaysAgo: number | null
  trainedToday: boolean
  todaySets: number
  totalSets: number
  /** Weight x reps over every finished lift, in the app's weight unit. */
  totalVolume: number
  trainedSeconds: number
  mostLogged: { exercise: Exercise; sets: number } | null
  gaps: MuscleGap[]
  singleArmSets: number
  cardio: CardioFacts
}

export const WEEK_MINIMUM = 2
/** A muscle group is "missing you" after this many days without a set. */
export const GAP_DAYS = 8
const SINGLE_ARM = /\b(single|one)[- ]arm\b/i
const CARDIO_CATEGORIES = new Set(['cardio', 'swim', 'combat', 'sport'])

const dayOf = (iso: string) => localDateIso(new Date(iso))

/** Local Monday of the week a date is in, as YYYY-MM-DD. */
const weekKey = (iso: string) => localDateIso(startOfWeek(new Date(iso)))

/** The longest run of consecutive dates in an ascending list of YYYY-MM-DD days. */
function longestRunOfDays(days: string[]): number {
  let best = 0
  let run = 0
  let previous: Date | null = null
  for (const day of days) {
    const current = new Date(`${day}T12:00:00`)
    run = previous && daysBetween(previous, current) === 1 ? run + 1 : 1
    best = Math.max(best, run)
    previous = current
  }
  return best
}

function weeksInARow(sessions: BegunSession[], now: Date): number {
  const counts = new Map<string, number>()
  for (const s of sessions) counts.set(weekKey(s.started_at), (counts.get(weekKey(s.started_at)) ?? 0) + 1)
  const cursor = startOfWeek(now)
  // The week in progress only counts once it qualifies, but it never breaks a run.
  if ((counts.get(localDateIso(cursor)) ?? 0) < WEEK_MINIMUM) cursor.setDate(cursor.getDate() - 7)
  let weeks = 0
  while ((counts.get(localDateIso(cursor)) ?? 0) >= WEEK_MINIMUM) {
    weeks += 1
    cursor.setDate(cursor.getDate() - 7)
  }
  return weeks
}

export function habitFacts(input: { exercises: Exercise[]; sessions: BegunSession[]; sets: SetRow[]; now: Date }): HabitFacts {
  const { now } = input
  const finished = input.sessions.filter((s) => s.ended_at).sort((a, b) => a.started_at.localeCompare(b.started_at))
  const byId = new Map(finished.map((s) => [s.id, { session: s, day: dayOf(s.started_at), ms: new Date(s.started_at).getTime() }]))
  const exerciseById = new Map(input.exercises.map((e) => [e.id, e]))
  const sets = input.sets.filter((s) => byId.has(s.session_id))
  const today = localDateIso(now)
  const weekStart = startOfWeek(now).getTime()
  const monthAgo = now.getTime() - 30 * 86_400_000

  const days = [...new Set(finished.map((s) => dayOf(s.started_at)))]
  const last = finished.at(-1)
  const first = finished[0]

  let totalVolume = 0
  let todaySets = 0
  let singleArmSets = 0
  const perLift = new Map<string, number>()
  const lastByGroup = new Map<string, string>()
  const cardio: CardioFacts = { minutesThisWeek: 0, sessionsThisMonth: 0, distanceMonthM: 0, longestRun: null }
  const cardioSessions = new Set<string>()

  for (const set of sets) {
    const { session, day, ms: startedMs } = byId.get(set.session_id)!
    const exercise = exerciseById.get(set.exercise_id)
    if (!exercise) continue
    if (day === today) todaySets += 1

    if (exercise.category === 'strength' && exercise.tracking === 'reps' && set.reps > 0) {
      totalVolume += set.weight * set.reps
      perLift.set(exercise.id, (perLift.get(exercise.id) ?? 0) + 1)
      if (SINGLE_ARM.test(exercise.name)) singleArmSets += 1
      for (const group of MUSCLE_GROUPS) {
        if (exercise.primary_muscles.some((m) => group.muscles.includes(m)) && (lastByGroup.get(group.key) ?? '') < day) lastByGroup.set(group.key, day)
      }
    }

    if (CARDIO_CATEGORIES.has(exercise.category)) {
      if (startedMs >= weekStart) cardio.minutesThisWeek += (set.duration_seconds ?? 0) / 60
      if (startedMs >= monthAgo) {
        cardioSessions.add(session.id)
        if (exercise.category === 'cardio') cardio.distanceMonthM += Number(set.distance_m ?? 0)
      }
      const metres = Number(set.distance_m ?? 0)
      if (activityBadgeKey(exercise) === 'running' && metres >= 800 && (!cardio.longestRun || metres > cardio.longestRun.distanceM)) {
        cardio.longestRun = { exercise, distanceM: metres, ageDays: daysBetween(session.started_at, now) }
      }
    }
  }
  cardio.sessionsThisMonth = cardioSessions.size
  cardio.minutesThisWeek = Math.round(cardio.minutesThisWeek)

  let mostLogged: HabitFacts['mostLogged'] = null
  for (const [id, count] of perLift) {
    const exercise = exerciseById.get(id)
    if (exercise && (!mostLogged || count > mostLogged.sets)) mostLogged = { exercise, sets: count }
  }

  const sinceGroup = [...lastByGroup.entries()].map(([key, day]) => ({ key, days: daysBetween(new Date(`${day}T12:00:00`), now) }))
  const active = sinceGroup.some((g) => g.days <= 4)
  const gaps: MuscleGap[] =
    finished.length >= 4 && active
      ? sinceGroup
          .filter((g) => g.days >= GAP_DAYS)
          .map((g) => ({ key: g.key, label: MUSCLE_GROUPS.find((m) => m.key === g.key)?.label ?? g.key, days: g.days }))
          .sort((a, b) => b.days - a.days)
      : []

  return {
    workouts: finished.length,
    thisWeek: finished.filter((s) => new Date(s.started_at).getTime() >= weekStart).length,
    streak: workoutStreak(finished, now),
    bestStreak: longestRunOfDays(days),
    weekStreak: weeksInARow(finished, now),
    daysSinceLast: last ? daysBetween(last.started_at, now) : null,
    lastName: last ? sessionTitle(last) : null,
    firstDaysAgo: first ? daysBetween(first.started_at, now) : null,
    trainedToday: finished.some((s) => dayOf(s.started_at) === today),
    todaySets,
    totalSets: sets.length,
    totalVolume: Math.round(totalVolume),
    trainedSeconds: finished.reduce((sum, s) => sum + Math.max(0, (new Date(s.ended_at!).getTime() - new Date(s.started_at).getTime()) / 1000), 0),
    mostLogged,
    gaps,
    singleArmSets,
    cardio,
  }
}
