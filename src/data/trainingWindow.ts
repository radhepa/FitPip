import { rangeStart } from '../lib/muscleVolume'
import type { BegunSession, SetRow } from '../types/db'
import { listSessionsSince } from './sessions'
import { listSetsForSessions } from './sets'

export interface TrainingWindow {
  sessions: BegunSession[]
  sets: SetRow[]
}

/** Every workout that started in the last `days` days (today counts as day one) with its sets. */
export async function loadTrainingWindow(days: number): Promise<TrainingWindow> {
  const sessions = await listSessionsSince(rangeStart(days).toISOString())
  const sets = await listSetsForSessions(sessions.map((s) => s.id))
  return { sessions, sets }
}

/** Every workout that has begun, ever, with its sets (for ranks, badges and XP). */
export async function loadAllTraining(): Promise<TrainingWindow> {
  const sessions = await listSessionsSince('')
  const sets = await listSetsForSessions(sessions.map((s) => s.id))
  return { sessions, sets }
}
