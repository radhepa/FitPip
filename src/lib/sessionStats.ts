import type { SetRow } from '../types/db'
import { estimate1RM } from './e1rm'

export interface ExerciseBlockData {
  exerciseId: string
  sets: SetRow[]
}

/** A set fetched together with the session it belongs to (for exercise history). */
export type ExerciseSetRow = SetRow & { session: { id: string; started_at: string } }

export interface HistoryEntry {
  sessionId: string
  startedAt: string
  sets: SetRow[]
  bestE1rm: number
  bestWeight: number
  volume: number
  /** Longest single hold / round / effort, in seconds. */
  bestSeconds: number
  /** Total distance covered, in metres. */
  distance: number
}

const byOrder = (a: SetRow, b: SetRow) =>
  a.set_order - b.set_order || a.created_at.localeCompare(b.created_at)

/** Groups a session's sets per exercise, in the order each exercise was first used. */
export function groupByExercise(sets: SetRow[]): ExerciseBlockData[] {
  const blocks = new Map<string, ExerciseBlockData>()
  for (const set of [...sets].sort(byOrder)) {
    const block = blocks.get(set.exercise_id) ?? { exerciseId: set.exercise_id, sets: [] }
    block.sets.push(set)
    blocks.set(set.exercise_id, block)
  }
  return [...blocks.values()]
}

/** Total weight moved: sum of weight x reps. */
export function totalVolume(sets: SetRow[]): number {
  return sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
}

/** The set with the highest estimated 1RM (ties go to the heavier set). */
export function bestSet(sets: SetRow[]): SetRow | null {
  let best: SetRow | null = null
  for (const s of sets) {
    if (
      !best ||
      estimate1RM(s.weight, s.reps) > estimate1RM(best.weight, best.reps) ||
      (estimate1RM(s.weight, s.reps) === estimate1RM(best.weight, best.reps) && s.weight > best.weight)
    ) {
      best = s
    }
  }
  return best
}

/** Groups one exercise's sets by session, newest session first. */
export function buildHistory(rows: ExerciseSetRow[]): HistoryEntry[] {
  const bySession = new Map<string, HistoryEntry>()
  for (const row of [...rows].sort(byOrder)) {
    const entry = bySession.get(row.session.id) ?? {
      sessionId: row.session.id,
      startedAt: row.session.started_at,
      sets: [],
      bestE1rm: 0,
      bestWeight: 0,
      volume: 0,
      bestSeconds: 0,
      distance: 0,
    }
    entry.sets.push(row)
    entry.bestE1rm = Math.max(entry.bestE1rm, estimate1RM(row.weight, row.reps))
    entry.bestWeight = Math.max(entry.bestWeight, row.weight)
    entry.volume += row.weight * row.reps
    entry.bestSeconds = Math.max(entry.bestSeconds, row.duration_seconds ?? 0)
    entry.distance += Number(row.distance_m ?? 0)
    bySession.set(row.session.id, entry)
  }
  return [...bySession.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}
