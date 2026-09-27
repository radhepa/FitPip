// What Pip knows about today: what is planned, what is done, and how the week is going.
import type { BegunSession, Category, Exercise, SetRow } from '../../types/db'
import { localDateIso } from '../bodyWeight'
import { completedEntryIds, entryCategories, entryMinutes, entryName, entryPlan, type TodayPlan } from '../weekPlan'
import type { LiftHistory } from './liftFacts'

export interface PlanFacts {
  kind: TodayPlan['kind']
  /** What is left to do today (everything, if nothing is done yet). */
  names: string[]
  total: number
  doneCount: number
  /** Rough minutes for what is left. */
  minutes: number
  weekPlanned: number
  weekDone: number
  categories: Category[]
  /** The first planned lift you have done before, and the last time you did it. */
  firstLift: { name: string; weight: number; reps: number; ageDays: number } | null
}

export interface PlanInput {
  plan: TodayPlan
  week?: { planned: number; done: number }
}

export function planFacts(input: PlanInput & { exercises: Exercise[]; sessions: BegunSession[]; sets: SetRow[]; histories: LiftHistory[]; now: Date }): PlanFacts {
  const { plan, now } = input
  const exerciseById = new Map(input.exercises.map((e) => [e.id, e]))
  const week = input.week ?? { planned: 0, done: 0 }
  if (plan.kind !== 'planned') {
    return { kind: plan.kind, names: [], total: 0, doneCount: 0, minutes: 0, weekPlanned: week.planned, weekDone: week.done, categories: [], firstLift: null }
  }

  const today = localDateIso(now)
  const todays = input.sessions
    .filter((s) => localDateIso(new Date(s.started_at)) === today)
    .map((session) => ({ session, sets: input.sets.filter((set) => set.session_id === session.id) }))
  const done = completedEntryIds(plan.entries, todays, exerciseById)
  const left = plan.entries.filter((e) => !done.has(e.item.id))
  const shown = left.length > 0 ? left : plan.entries

  const historyById = new Map(input.histories.map((h) => [h.exercise.id, h]))
  let firstLift: PlanFacts['firstLift'] = null
  for (const entry of shown) {
    for (const item of entryPlan(entry)) {
      const history = historyById.get(item.exerciseId)
      const last = history?.days.at(-1)
      if (history && last && !firstLift) firstLift = { name: history.exercise.name, weight: last.weight, reps: last.reps, ageDays: last.ageDays }
    }
  }

  return {
    kind: 'planned',
    names: shown.map(entryName),
    total: plan.entries.length,
    doneCount: done.size,
    minutes: left.reduce((sum, entry) => sum + entryMinutes(entry, exerciseById), 0),
    weekPlanned: week.planned,
    weekDone: week.done,
    categories: [...new Set(shown.flatMap((entry) => entryCategories(entry, exerciseById)))],
    firstLift,
  }
}
