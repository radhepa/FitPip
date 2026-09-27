// Personal records while a workout is being logged, by the same rules as XP (lib/xp.ts): estimated 1RM
// for weighted sets, reps at bodyweight, longest hold or effort, farthest distance. The first time a
// measure is logged only sets the bar, and a workout has at most one record per measure.
import type { Exercise, SetRow } from '../types/db'
import { measures, type RecordKind } from './xp'

type Kind = Pick<Exercise, 'tracking' | 'category'>
type Measured = Pick<SetRow, 'weight' | 'reps' | 'duration_seconds' | 'distance_m'>

/** The best value in each measure across earlier workouts of one exercise. */
export function bestsOf(sets: Measured[], exercise: Kind): Map<RecordKind, number> {
  const bests = new Map<RecordKind, number>()
  for (const set of sets) {
    for (const [kind, value] of measures(set, exercise)) bests.set(kind, Math.max(bests.get(kind) ?? 0, value))
  }
  return bests
}

/**
 * The sets of this workout that are records: for each measure, the first set with the workout's top
 * value, if that beats the best from earlier workouts.
 */
export function recordSetIds(earlierBests: Map<RecordKind, number>, sets: (Measured & Pick<SetRow, 'id'>)[], exercise: Kind): Set<string> {
  const top = new Map<RecordKind, { id: string; value: number }>()
  for (const set of sets) {
    for (const [kind, value] of measures(set, exercise)) {
      const current = top.get(kind)
      if (!current || value > current.value) top.set(kind, { id: set.id, value })
    }
  }
  const ids = new Set<string>()
  for (const [kind, { id, value }] of top) {
    const before = earlierBests.get(kind)
    if (before !== undefined && value > before) ids.add(id)
  }
  return ids
}
