import type { ExerciseSetRow } from '../lib/sessionStats'
import type { SetRow } from '../types/db'
import { invalidError, newId, nowIso, ownerId, putRow, removeRow, rowsOf, writeTx } from './local/store'

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

const round2 = (n: number) => Math.round(n * 100) / 100

/** The server's column limits, checked here so a bad value fails now rather than later at sync time. */
function checked(values: SetPatch): SetPatch {
  const { reps, weight, rpe, duration_seconds: duration, distance_m: distance } = values
  if (!Number.isInteger(reps) || reps < 0 || reps > 1_000_000) throw invalidError('Reps must be a whole number, 0 or more.')
  if (!(weight >= 0 && weight <= 99_999)) throw invalidError('Weight must be between 0 and 99,999.')
  if (rpe !== null && !(rpe >= 1 && rpe <= 10 && rpe * 2 === Math.round(rpe * 2))) throw invalidError('RPE must be 1 to 10, in half steps.')
  if (duration !== null && !(Number.isInteger(duration) && duration >= 1 && duration <= 86_400)) throw invalidError('Time must be between 1 second and 24 hours.')
  if (distance !== null && !(distance > 0 && distance <= 1_000_000)) throw invalidError('Distance must be more than 0.')
  return { reps, weight: round2(weight), rpe, duration_seconds: duration, distance_m: distance === null ? null : round2(distance) }
}

const bySetOrder = (a: SetRow, b: SetRow) => a.set_order - b.set_order || a.created_at.localeCompare(b.created_at)

export async function listSetsForSession(sessionId: string): Promise<SetRow[]> {
  return (await rowsOf('sets').where('session_id').equals(sessionId).toArray()).sort(bySetOrder)
}

const binary = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)
/** The order the session_id index gives (workout, then set id), whichever way the sets were read. */
const bySessionThenId = (a: SetRow, b: SetRow) => binary(a.session_id, b.session_id) || binary(a.id, b.id)

/** Above this many workouts, reading every set once beats looking each workout up. */
const WHOLE_TABLE_FROM = 24

/** Sets for many sessions at once (history summaries, the muscle heatmap, the whole history). */
export async function listSetsForSessions(sessionIds: string[]): Promise<SetRow[]> {
  if (sessionIds.length === 0) return []
  const wanted = new Set(sessionIds)
  const sets = rowsOf('sets')
  // Not Dexie's anyOf(): it steps a cursor through the rows one by one, which gets slow on a phone
  // once the history is long. A handful of indexed reads, or one read of the whole table, is quicker.
  const rows =
    wanted.size < WHOLE_TABLE_FROM
      ? (await Promise.all([...wanted].map((id) => sets.where('session_id').equals(id).toArray()))).flat()
      : (await sets.toArray()).filter((set) => wanted.has(set.session_id))
  return rows.sort(bySessionThenId)
}

export async function logSet(input: NewSet): Promise<SetRow> {
  const values = checked({
    reps: input.reps,
    weight: input.weight,
    rpe: input.rpe,
    duration_seconds: input.durationSeconds ?? null,
    distance_m: input.distanceM ?? null,
  })
  if (!Number.isInteger(input.setOrder) || input.setOrder < 0) throw invalidError('That set is out of order.')
  const now = nowIso()
  const set: SetRow = { id: newId(), user_id: ownerId(), session_id: input.sessionId, exercise_id: input.exerciseId, set_order: input.setOrder, ...values, created_at: now, updated_at: now }
  await writeTx(() => putRow('sets', set, { isNew: true }))
  return set
}

export async function updateSet(id: string, patch: Partial<SetPatch>): Promise<SetRow> {
  return writeTx(async () => {
    const existing = await rowsOf('sets').get(id)
    if (!existing) throw new Error('Set not found.')
    const values = checked({
      reps: existing.reps,
      weight: existing.weight,
      rpe: existing.rpe,
      duration_seconds: existing.duration_seconds,
      distance_m: existing.distance_m,
      ...patch,
    })
    const updated: SetRow = { ...existing, ...values, updated_at: nowIso() }
    await putRow('sets', updated, { isNew: false })
    return updated
  })
}

/** Puts back a set that was just deleted (the Undo button), with its original id, order and time. */
export async function restoreSet(set: SetRow): Promise<SetRow> {
  return writeTx(async () => {
    if (!(await rowsOf('sessions').get(set.session_id))) throw new Error('That workout no longer exists.')
    const restored: SetRow = { ...set, updated_at: nowIso() }
    await putRow('sets', restored, { isNew: true })
    return restored
  })
}

export async function deleteSet(id: string): Promise<void> {
  await writeTx(() => removeRow('sets', id))
}

/** Every logged set of one exercise, newest first, with its session's date. */
export async function listSetsForExercise(exerciseId: string): Promise<ExerciseSetRow[]> {
  const sets = await rowsOf('sets').where('exercise_id').equals(exerciseId).toArray()
  // bulkGet reads by key; anyOf would step a cursor through the index.
  const ids = [...new Set(sets.map((set) => set.session_id))]
  const sessions = new Map((await rowsOf('sessions').bulkGet(ids)).flatMap((s) => (s ? [[s.id, s] as const] : [])))
  return sets
    .flatMap((set) => {
      const session = sessions.get(set.session_id)
      // A workout still being set up has no start time; its sets aren't history yet.
      return session?.started_at ? [{ ...set, session: { id: session.id, started_at: session.started_at } }] : []
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

/**
 * The sets from the most recent earlier workout that included this exercise, in set order
 * (used to prefill weights and show "last time"). Empty when it has never been done.
 *
 * "Most recent" goes by when the workouts began, not when sets were typed: a set added later to an
 * old workout doesn't make it the last time, and editing an old workout shows the one before it.
 */
export async function lastSessionSetsForExercise(exerciseId: string, excludeSessionId: string): Promise<SetRow[]> {
  const sets = (await rowsOf('sets').where('exercise_id').equals(exerciseId).toArray()).filter((set) => set.session_id !== excludeSessionId)
  if (sets.length === 0) return []
  const ids = [...new Set(sets.map((set) => set.session_id))]
  const [current, ...sessions] = await rowsOf('sessions').bulkGet([excludeSessionId, ...ids])
  // A workout still being set up hasn't begun: anything already done is earlier.
  const before = current?.started_at ? Date.parse(current.started_at) : Infinity
  let last: { id: string; at: number } | null = null
  for (const session of sessions) {
    // Workouts still being set up (no start time) don't count.
    const at = session?.started_at ? Date.parse(session.started_at) : NaN
    if (!session || !(at < before)) continue
    if (!last || at > last.at) last = { id: session.id, at }
  }
  const lastId = last?.id
  return lastId ? sets.filter((set) => set.session_id === lastId).sort(bySetOrder) : []
}
