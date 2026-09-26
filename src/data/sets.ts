import { supabase } from '../lib/supabase'
import type { ExerciseSetRow } from '../lib/sessionStats'
import type { SetRow } from '../types/db'
import { assertOk, unwrap } from './unwrap'
import { GUEST_USER_ID, isGuestMode, readGuestData, writeGuestData } from './guest'

export interface NewSet {
  sessionId: string
  exerciseId: string
  setOrder: number
  reps: number
  weight: number
  rpe: number | null
  durationSeconds?: number | null
  distanceM?: number | null
}

/** The fields of a set that can be edited after it was logged. */
export type SetPatch = Pick<SetRow, 'reps' | 'weight' | 'rpe' | 'duration_seconds' | 'distance_m'>

export async function listSetsForSession(sessionId: string): Promise<SetRow[]> {
  if (isGuestMode()) return readGuestData().sets.filter((set) => set.session_id === sessionId).sort((a, b) => a.set_order - b.set_order)
  return unwrap<SetRow[]>(
    await supabase
      .from('sets')
      .select('*')
      .eq('session_id', sessionId)
      .order('set_order')
      .order('created_at'),
  )
}

const SESSIONS_PER_QUERY = 10

/** Sets for many sessions at once (history summaries, the muscle heatmap). */
export async function listSetsForSessions(sessionIds: string[]): Promise<SetRow[]> {
  if (sessionIds.length === 0) return []
  if (isGuestMode()) return readGuestData().sets.filter((set) => sessionIds.includes(set.session_id))
  // Small batches: Supabase caps one response at 1000 rows, which a busy month can exceed.
  const batches: string[][] = []
  for (let i = 0; i < sessionIds.length; i += SESSIONS_PER_QUERY) batches.push(sessionIds.slice(i, i + SESSIONS_PER_QUERY))
  const results = await Promise.all(batches.map((ids) => supabase.from('sets').select('*').in('session_id', ids)))
  return results.flatMap((result) => unwrap<SetRow[]>(result))
}

export async function logSet(input: NewSet): Promise<SetRow> {
  const row = {
    id: crypto.randomUUID(),
    session_id: input.sessionId,
    exercise_id: input.exerciseId,
    set_order: input.setOrder,
    reps: input.reps,
    weight: input.weight,
    rpe: input.rpe,
    duration_seconds: input.durationSeconds ?? null,
    distance_m: input.distanceM ?? null,
  }
  if (isGuestMode()) {
    const data = readGuestData()
    const now = new Date().toISOString()
    const set: SetRow = { ...row, user_id: GUEST_USER_ID, created_at: now, updated_at: now }
    data.sets.push(set)
    writeGuestData(data)
    return set
  }
  return unwrap<SetRow>(await supabase.from('sets').insert(row).select().single())
}

export async function updateSet(id: string, patch: Partial<SetPatch>): Promise<SetRow> {
  if (isGuestMode()) {
    const data = readGuestData()
    const index = data.sets.findIndex((set) => set.id === id)
    if (index < 0) throw new Error('Set not found.')
    data.sets[index] = { ...data.sets[index], ...patch, updated_at: new Date().toISOString() }
    writeGuestData(data)
    return data.sets[index]
  }
  return unwrap<SetRow>(await supabase.from('sets').update(patch).eq('id', id).select().single())
}

export async function deleteSet(id: string): Promise<void> {
  if (isGuestMode()) {
    const data = readGuestData()
    data.sets = data.sets.filter((set) => set.id !== id)
    writeGuestData(data)
    return
  }
  assertOk(await supabase.from('sets').delete().eq('id', id))
}

/** Every logged set of one exercise, with its session date. Supabase returns at most 1000 rows. */
export async function listSetsForExercise(exerciseId: string): Promise<ExerciseSetRow[]> {
  if (isGuestMode()) {
    const data = readGuestData()
    return data.sets
      .filter((set) => set.exercise_id === exerciseId)
      .map((set) => ({ ...set, session: { id: set.session_id, started_at: data.sessions.find((session) => session.id === set.session_id)?.started_at ?? set.created_at } }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  }
  return unwrap<ExerciseSetRow[]>(
    await supabase
      .from('sets')
      .select('*, session:sessions!inner(id, started_at)')
      .eq('exercise_id', exerciseId)
      .order('created_at', { ascending: false })
      .limit(1000),
  )
}

/**
 * The sets from the most recent earlier workout that included this exercise, in set order
 * (used to prefill weights and show "last time"). Empty when it has never been done.
 */
export async function lastSessionSetsForExercise(exerciseId: string, excludeSessionId: string): Promise<SetRow[]> {
  let recent: SetRow[]
  if (isGuestMode()) {
    recent = [...readGuestData().sets]
      .filter((set) => set.exercise_id === exerciseId && set.session_id !== excludeSessionId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  } else {
    recent = unwrap<SetRow[]>(
      await supabase
        .from('sets')
        .select('*')
        .eq('exercise_id', exerciseId)
        .neq('session_id', excludeSessionId)
        .order('created_at', { ascending: false })
        .limit(40),
    )
  }
  if (recent.length === 0) return []
  return recent.filter((set) => set.session_id === recent[0].session_id).sort((a, b) => a.set_order - b.set_order)
}
