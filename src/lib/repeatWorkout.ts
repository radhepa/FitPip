import type { Exercise, Session, SetRow } from '../types/db'
import { defaultTarget } from './activity'
import { MAX_TARGET_REPS, MAX_TARGET_SECONDS, MAX_TARGET_SETS, planFromRows } from './sessionPlan'
import { buildBlocks, type PlanItem } from './workoutBlocks'

/** The value that turns up most often (the earliest one on a tie); null when there are none. */
function mostCommon(values: number[]): number | null {
  const counts = new Map<number, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  let best: number | null = null
  for (const [value, count] of counts) if (best === null || count > counts.get(best)!) best = value
  return best
}

const clamp = (value: number, max: number) => Math.min(max, Math.max(1, Math.round(value)))

/**
 * A new plan that does a past workout again: the exercises that got sets, in the order the workout
 * showed them. Each keeps its planned target when it had one, otherwise the target comes from what was
 * logged (how many sets, the usual reps or length). Exercise notes stay with the old workout. Weights are
 * not part of a plan: the new workout prefills them from the last time each exercise was done.
 * A workout with no sets at all repeats its plan instead.
 */
export function planToRepeat(session: Pick<Session, 'plan'>, sets: SetRow[], exerciseById: Map<string, Exercise>): PlanItem[] {
  const planned = planFromRows(session.plan).map(({ note: _note, ...item }) => item)
  if (sets.length === 0) return planned.filter((item) => exerciseById.has(item.exerciseId))

  return buildBlocks({ sets, pendingIds: [], plan: planned }).flatMap((block) => {
    const exercise = exerciseById.get(block.exerciseId)
    // Skipped exercises stay out, and so do ones deleted from the bank since.
    if (!exercise || block.sets.length === 0) return []
    if (block.plan) return [block.plan]
    const fallback = defaultTarget(exercise)
    const reps = mostCommon(block.sets.map((s) => s.reps).filter((r) => r > 0))
    const seconds = mostCommon(block.sets.map((s) => s.duration_seconds ?? 0).filter((d) => d > 0))
    const item: PlanItem = {
      exerciseId: exercise.id,
      targetSets: clamp(block.sets.length, MAX_TARGET_SETS),
      targetReps: exercise.tracking === 'reps' ? clamp(reps ?? fallback.targetReps, MAX_TARGET_REPS) : fallback.targetReps,
    }
    if (exercise.tracking !== 'reps') {
      const length = seconds ?? fallback.targetSeconds
      if (length) item.targetSeconds = clamp(length, MAX_TARGET_SECONDS)
    }
    return [item]
  })
}
