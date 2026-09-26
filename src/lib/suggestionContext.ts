import type { SuggestionContext } from '../types/suggestion'
import { MUSCLES, type Exercise, type BegunSession, type SetRow, type TemplateWithItems, type WeekPlanItem, type WeightUnit } from '../types/db'
import { formatWeight } from './format'
import { weeklyVolume, workFromSets } from './muscleVolume'
import { combinedName, combinedPlan, planForDay, WEEKDAY_NAMES } from './weekPlan'
import { bestSet } from './sessionStats'

const MAX_RECENT = 5
const MAX_EXERCISES_PER_SESSION = 25
const DAY_MS = 24 * 60 * 60 * 1000

const round1 = (n: number) => Math.round(n * 10) / 10
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export interface SuggestionInputs {
  exercises: Exercise[]
  /** Workouts from (at least) the last 30 days, and their sets. */
  sessions: BegunSession[]
  sets: SetRow[]
  weekPlan: WeekPlanItem[]
  templates: TemplateWithItems[]
}

/**
 * The compact picture of the lifter sent to the suggestion function: the last 7 days and the 30 day
 * weekly average of weighted sets per muscle, today's scheduled workout, and the last few workouts.
 * (The exercise bank is not included: the function reads it itself, so the model can only pick
 * exercises that really exist for this user.)
 */
export function buildSuggestionContext(args: SuggestionInputs & { unit: WeightUnit; focus?: string; now?: Date }): SuggestionContext {
  const now = args.now ?? new Date()
  const byId = new Map(args.exercises.map((e) => [e.id, e]))
  const window = { sessions: args.sessions, sets: args.sets, exercises: args.exercises, now }
  const week = weeklyVolume({ ...window, days: 7 })
  const month = weeklyVolume({ ...window, days: 30 })

  const volume = MUSCLES.filter((m) => week[m].weighted > 0 || month[m].weighted > 0)
    .map((muscle) => ({ muscle, last7Days: round1(week[muscle].weighted), weeklyAvg30Days: round1(month[muscle].perWeek) }))
    .sort((a, b) => b.last7Days - a.last7Days || b.weeklyAvg30Days - a.weeklyAvg30Days)

  // Today's plan can hold several routines and activities; they are described as one workout.
  const plan = planForDay(args.weekPlan, now.getDay(), { routines: args.templates, exercises: args.exercises })
  const today: SuggestionContext['today'] =
    plan.kind === 'planned'
      ? {
          kind: 'workout',
          name: combinedName(plan.entries),
          exercises: combinedPlan(plan.entries)
            .slice(0, MAX_EXERCISES_PER_SESSION)
            .flatMap((item) => {
              const exercise = byId.get(item.exerciseId)
              return exercise ? [{ name: exercise.name.slice(0, 80), sets: item.targetSets, reps: item.targetReps }] : []
            }),
        }
      : { kind: plan.kind === 'rest' ? 'rest' : 'unplanned' }

  const today0 = startOfDay(now).getTime()
  const recent = args.sessions
    .filter((s) => s.ended_at)
    .sort((a, b) => b.started_at.localeCompare(a.started_at))
    .slice(0, MAX_RECENT)
    .flatMap((session) => {
      const work = workFromSets(
        args.sets.filter((s) => s.session_id === session.id),
        byId,
      ).slice(0, MAX_EXERCISES_PER_SESSION)
      if (work.length === 0) return []
      return [
        {
          daysAgo: Math.max(0, Math.round((today0 - startOfDay(new Date(session.started_at)).getTime()) / DAY_MS)),
          name: session.name?.trim() ? session.name.trim().slice(0, 80) : null,
          exercises: work.map((w) => {
            const top = bestSet(w.sets ?? [])
            return {
              name: w.exercise.name.slice(0, 80),
              sets: w.setCount,
              top: top ? `${top.weight === 0 ? 'BW' : formatWeight(top.weight)} x ${top.reps}` : '-',
            }
          }),
        },
      ]
    })

  const focus = args.focus?.trim().slice(0, 200)
  return {
    ...(focus ? { focus } : {}),
    date: localDate(now),
    weekday: WEEKDAY_NAMES[now.getDay()],
    unit: args.unit,
    today,
    volume,
    recent,
  }
}
