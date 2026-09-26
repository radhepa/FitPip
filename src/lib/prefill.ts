import type { SetRow } from '../types/db'

export interface Prefill {
  weight: number | null
  reps: number | null
}

/**
 * What to put in the weight/reps boxes for the next set of an exercise.
 * - Once a set is logged this workout, carry it forward (you tend to repeat it, or bump it up).
 * - For the first set, start from the first set of the last time you did the exercise, with the
 *   template's target reps if there is one.
 */
export function suggestNextSet(args: {
  loggedSets: SetRow[]
  lastSessionSets: SetRow[]
  targetReps: number | null
}): Prefill {
  const previous = args.loggedSets.at(-1)
  if (previous) return { weight: previous.weight, reps: previous.reps }
  const first = args.lastSessionSets[0]
  return { weight: first?.weight ?? null, reps: args.targetReps ?? first?.reps ?? null }
}
