import { planToRepeat } from '../lib/repeatWorkout'
import type { Exercise, Session, SetRow } from '../types/db'
import { useNewWorkout } from './useNewWorkout'

/**
 * Sets up a new workout that does a past one again (same name, same exercises and targets), ready to
 * begin. Like any new workout, it offers to continue one that is already open instead.
 */
export function useRepeatWorkout() {
  const { create, creating, error } = useNewWorkout()
  const repeat = ({ session, sets }: { session: Pick<Session, 'name' | 'plan'>; sets: SetRow[] }, exerciseById: Map<string, Exercise>) =>
    create({ name: session.name ?? undefined, plan: planToRepeat(session, sets, exerciseById) })
  return { repeat, repeating: creating, error }
}
