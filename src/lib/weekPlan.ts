import type { BegunSession, Category, Exercise, SetRow, TemplateWithItems, WeekPlanItem } from '../types/db'
import { CATEGORY_INFO, defaultTarget } from './activity'
import { planItem } from './sessionPlan'
import { planFromTemplate, type PlanItem } from './workoutBlocks'

/** Monday first, as a week is usually read. Values follow Date.getDay(): 0 = Sunday. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** One planned thing, with what it points at. A `category` entry is just a kind of workout ("Cardio"). */
export type PlanEntry =
  | { kind: 'routine'; item: WeekPlanItem; routine: TemplateWithItems }
  | { kind: 'activity'; item: WeekPlanItem; exercise: Exercise }
  | { kind: 'category'; item: WeekPlanItem; category: Category }

export type TodayPlan =
  | { kind: 'planned'; entries: PlanEntry[] }
  | { kind: 'rest' }
  /** Nothing is planned on any day, so there is no plan to speak of. */
  | { kind: 'unplanned' }

export interface Lookup {
  routines: TemplateWithItems[]
  exercises: Exercise[]
}

const byPosition = (a: WeekPlanItem, b: WeekPlanItem) => a.position - b.position || a.created_at.localeCompare(b.created_at)

/** A day's items resolved to their routine, activity or category, in order. Items whose target is gone are dropped. */
export function entriesForDay(items: WeekPlanItem[], weekday: number, lookup: Lookup): PlanEntry[] {
  const routines = new Map(lookup.routines.map((r) => [r.template.id, r]))
  const exercises = new Map(lookup.exercises.map((e) => [e.id, e]))
  return items
    .filter((i) => i.weekday === weekday)
    .sort(byPosition)
    .flatMap((item): PlanEntry[] => {
      if (item.category) return item.category in CATEGORY_INFO ? [{ kind: 'category', item, category: item.category }] : []
      if (item.template_id) {
        const routine = routines.get(item.template_id)
        return routine ? [{ kind: 'routine', item, routine }] : []
      }
      const exercise = item.exercise_id ? exercises.get(item.exercise_id) : undefined
      return exercise ? [{ kind: 'activity', item, exercise }] : []
    })
}

export function planForDay(items: WeekPlanItem[], weekday: number, lookup: Lookup): TodayPlan {
  const hasAny = [0, 1, 2, 3, 4, 5, 6].some((day) => entriesForDay(items, day, lookup).length > 0)
  if (!hasAny) return { kind: 'unplanned' }
  const entries = entriesForDay(items, weekday, lookup)
  return entries.length > 0 ? { kind: 'planned', entries } : { kind: 'rest' }
}

/** What a kind of workout is called on the calendar (the lifting category is "Weightlifting" here). */
export const categoryName = (category: Category): string => (category === 'strength' ? 'Weightlifting' : CATEGORY_INFO[category].label)

export function entryName(entry: PlanEntry): string {
  if (entry.kind === 'routine') return entry.routine.template.name
  return entry.kind === 'activity' ? entry.exercise.name : categoryName(entry.category)
}

/** The categories an entry trains, most common first (a routine can mix lifts and cardio). */
export function entryCategories(entry: PlanEntry, exerciseById: Map<string, Exercise>): Category[] {
  if (entry.kind === 'category') return [entry.category]
  if (entry.kind === 'activity') return [entry.exercise.category]
  const counts = new Map<Category, number>()
  for (const item of entry.routine.items) {
    const category = exerciseById.get(item.exercise_id)?.category
    if (category) counts.set(category, (counts.get(category) ?? 0) + 1)
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c)
  return sorted.length > 0 ? sorted : ['strength']
}

/** What starting this entry sets the workout up with (a bare category starts empty: you pick as you go). */
export function entryPlan(entry: PlanEntry): PlanItem[] {
  if (entry.kind === 'category') return []
  if (entry.kind === 'routine') return planFromTemplate(entry.routine.items)
  return [planItem(entry.exercise.id, defaultTarget(entry.exercise))]
}

/** Several entries as one workout: their plans joined in order, each exercise once. */
export function combinedPlan(entries: PlanEntry[]): PlanItem[] {
  const seen = new Set<string>()
  return entries.flatMap(entryPlan).filter((p) => (seen.has(p.exerciseId) ? false : (seen.add(p.exerciseId), true)))
}

/** A name for several entries done as one workout: "Swim + Heavy Bag", or "Swim + 3 more". */
export function combinedName(entries: PlanEntry[]): string {
  const names = entries.map(entryName)
  const name = names.length <= 2 ? names.join(' + ') : `${names[0]} + ${names.length - 1} more`
  return name.slice(0, 80)
}

/** Rough minutes for an entry: 2.5 min per lifting set, else its target time. */
export function entryMinutes(entry: PlanEntry, exerciseById: Map<string, Exercise>): number {
  const plan = entryPlan(entry)
  if (plan.length === 0) return 0
  const seconds = plan.reduce((total, p) => {
    const exercise = entry.kind === 'activity' ? entry.exercise : exerciseById.get(p.exerciseId)
    if (!exercise || exercise.tracking === 'reps') return total + p.targetSets * 150
    return total + p.targetSets * (p.targetSeconds ?? 60) + (p.targetSets - 1) * 30
  }, 0)
  return Math.max(5, Math.round(seconds / 300) * 5)
}

/**
 * Which of today's entries are done: a routine when a workout started from it has finished today
 * (or, when several things were done as one workout, when any of its exercises was logged), an
 * activity when a finished workout today logged it, and a kind of workout when a finished workout
 * today logged anything of that kind.
 */
export function completedEntryIds(
  entries: PlanEntry[],
  todays: { session: BegunSession; sets: SetRow[] }[],
  exerciseById: Map<string, Exercise> = new Map(),
): Set<string> {
  const finished = todays.filter((t) => t.session.ended_at)
  const templates = new Set(finished.map((t) => t.session.template_id).filter(Boolean))
  const exercises = new Set(finished.flatMap((t) => t.sets.map((s) => s.exercise_id)))
  const categories = new Set([...exercises].map((id) => exerciseById.get(id)?.category))
  const done = new Set<string>()
  for (const entry of entries) {
    const isDone =
      entry.kind === 'category'
        ? categories.has(entry.category)
        : entry.kind === 'routine'
          ? templates.has(entry.routine.template.id) || entry.routine.items.some((i) => exercises.has(i.exercise_id))
          : exercises.has(entry.exercise.id)
    if (isDone) done.add(entry.item.id)
  }
  return done
}

// ---------------------------------------------------------------------------------------------
// Editing (pure, for optimistic updates)

export function nextPosition(items: WeekPlanItem[], weekday: number): number {
  return items.filter((i) => i.weekday === weekday).reduce((max, i) => Math.max(max, i.position + 1), 0)
}

export interface NewPlanTarget {
  templateId?: string
  exerciseId?: string
  category?: Category
}

const sameTarget = (item: Pick<WeekPlanItem, 'template_id' | 'exercise_id' | 'category'>, target: NewPlanTarget) =>
  (target.templateId !== undefined && item.template_id === target.templateId) ||
  (target.exerciseId !== undefined && item.exercise_id === target.exerciseId) ||
  (target.category !== undefined && item.category === target.category)

/** New rows for a day, skipping anything already on it (and repeats within the request). */
export function rowsToAdd(items: WeekPlanItem[], weekday: number, targets: NewPlanTarget[]): Omit<WeekPlanItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] {
  const day = items.filter((i) => i.weekday === weekday)
  const rows: Omit<WeekPlanItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = []
  let position = nextPosition(items, weekday)
  for (const target of targets) {
    if (day.some((i) => sameTarget(i, target)) || rows.some((r) => sameTarget(r, target))) continue
    rows.push({ weekday, position: position++, template_id: target.templateId ?? null, exercise_id: target.exerciseId ?? null, category: target.category ?? null })
  }
  return rows
}

/** Swaps an item with its neighbour in the same day; returns the position writes needed. */
export function moveWithinDay(items: WeekPlanItem[], id: string, direction: -1 | 1): { id: string; position: number }[] {
  const item = items.find((i) => i.id === id)
  if (!item) return []
  const day = items.filter((i) => i.weekday === item.weekday).sort(byPosition)
  const from = day.findIndex((i) => i.id === id)
  const to = from + direction
  if (to < 0 || to >= day.length) return []
  const order = [...day]
  ;[order[from], order[to]] = [order[to], order[from]]
  return order.map((i, position) => ({ id: i.id, position })).filter((u) => day.find((d) => d.id === u.id)?.position !== u.position)
}

/** Applies position writes to a list (for an optimistic reorder). */
export const withPositions = (items: WeekPlanItem[], updates: { id: string; position: number }[]): WeekPlanItem[] => {
  const map = new Map(updates.map((u) => [u.id, u.position]))
  return items.map((i) => (map.has(i.id) ? { ...i, position: map.get(i.id)! } : i))
}

/** The targets on one day, to copy onto others. */
export const dayTargets = (items: WeekPlanItem[], weekday: number): NewPlanTarget[] =>
  items
    .filter((i) => i.weekday === weekday)
    .sort(byPosition)
    .map((i): NewPlanTarget => (i.category ? { category: i.category } : i.template_id ? { templateId: i.template_id } : { exerciseId: i.exercise_id ?? undefined }))
