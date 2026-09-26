import type { PlanRow } from '../types/db'
import type { Target } from './activity'
import type { PlanItem } from './workoutBlocks'

/**
 * The exercises set up for a workout before it begins (with target sets and reps). It is stored on the
 * workout itself as JSON, so it can be edited until the workout begins and follows you between devices.
 * These helpers are pure: each returns a new plan.
 */

export const DEFAULT_TARGET = { targetSets: 3, targetReps: 10 } as const
export const MAX_TARGET_SETS = 20
export const MAX_TARGET_REPS = 100
export const MAX_TARGET_SECONDS = 86400

const isPositiveInt = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value > 0

const isPlanRow = (value: unknown): value is PlanRow => {
  if (typeof value !== 'object' || value === null) return false
  const row = value as Record<string, unknown>
  return (
    typeof row.exercise_id === 'string' &&
    isPositiveInt(row.target_sets) &&
    isPositiveInt(row.target_reps) &&
    (row.target_seconds == null || isPositiveInt(row.target_seconds))
  )
}

/** Reads a stored plan; anything malformed or repeated is dropped rather than trusted. */
export function planFromRows(value: unknown): PlanItem[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const plan: PlanItem[] = []
  for (const row of value) {
    if (!isPlanRow(row) || seen.has(row.exercise_id)) continue
    seen.add(row.exercise_id)
    plan.push({
      exerciseId: row.exercise_id,
      targetSets: row.target_sets,
      targetReps: row.target_reps,
      ...(row.target_seconds ? { targetSeconds: row.target_seconds } : {}),
    })
  }
  return plan
}

/** The stored form of a plan; an empty plan is stored as null. */
export const planToRows = (plan: PlanItem[]): PlanRow[] | null =>
  plan.length === 0
    ? null
    : plan.map((p) => ({
        exercise_id: p.exerciseId,
        target_sets: p.targetSets,
        target_reps: p.targetReps,
        ...(p.targetSeconds ? { target_seconds: p.targetSeconds } : {}),
      }))

/** A plan item for an exercise with this target (seconds only when there are some). */
export function planItem(exerciseId: string, target: Target | typeof DEFAULT_TARGET = DEFAULT_TARGET): PlanItem {
  const seconds = 'targetSeconds' in target ? target.targetSeconds : null
  return { exerciseId, targetSets: target.targetSets, targetReps: target.targetReps, ...(seconds ? { targetSeconds: seconds } : {}) }
}

export const addToPlan = (plan: PlanItem[], exerciseId: string, target?: Target): PlanItem[] =>
  plan.some((p) => p.exerciseId === exerciseId) ? plan : [...plan, planItem(exerciseId, target)]

/** Adds several at once (in order), skipping any already planned. */
export const addManyToPlan = (plan: PlanItem[], items: { exerciseId: string; target?: Target }[]): PlanItem[] =>
  items.reduce((next, item) => addToPlan(next, item.exerciseId, item.target), plan)

export const removeFromPlan = (plan: PlanItem[], exerciseId: string): PlanItem[] => plan.filter((p) => p.exerciseId !== exerciseId)

export function moveInPlan(plan: PlanItem[], exerciseId: string, direction: -1 | 1): PlanItem[] {
  const from = plan.findIndex((p) => p.exerciseId === exerciseId)
  const to = from + direction
  if (from < 0 || to < 0 || to >= plan.length) return plan
  const next = [...plan]
  ;[next[from], next[to]] = [next[to], next[from]]
  return next
}

export const setPlanTargets = (
  plan: PlanItem[],
  exerciseId: string,
  patch: Partial<Pick<PlanItem, 'targetSets' | 'targetReps' | 'targetSeconds'>>,
): PlanItem[] =>
  plan.map((p) =>
    p.exerciseId === exerciseId
      ? {
          ...p,
          targetSets: patch.targetSets ?? p.targetSets,
          targetReps: patch.targetReps ?? p.targetReps,
          ...(patch.targetSeconds ? { targetSeconds: patch.targetSeconds } : {}),
        }
      : p,
  )

/**
 * Swaps an exercise with the nearest one before/after it that is in the same group (a workout shows
 * its exercises grouped into sections, so "up" means up within the section).
 */
export function moveWithinGroup(plan: PlanItem[], exerciseId: string, direction: -1 | 1, groupOf: (item: PlanItem) => string): PlanItem[] {
  const from = plan.findIndex((p) => p.exerciseId === exerciseId)
  if (from < 0) return plan
  const group = groupOf(plan[from])
  let to = from + direction
  while (to >= 0 && to < plan.length && groupOf(plan[to]) !== group) to += direction
  if (to < 0 || to >= plan.length) return plan
  const next = [...plan]
  ;[next[from], next[to]] = [next[to], next[from]]
  return next
}
