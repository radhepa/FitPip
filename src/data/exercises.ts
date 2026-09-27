import type { MappedExercise } from '../config/exerciseDbMap'
import { compareText } from '../lib/compareText'
import type { Exercise } from '../types/db'
import { isGuestUser } from './local/context'
import { invalidError, duplicateError, inUseError, newId, nowIso, ownerId, putRow, removeCascaded, removeRow, rowsOf, writeTx } from './local/store'
import { loadStarterExercisesOnline } from './sync/actions'

export type ExerciseInput = Pick<Exercise, 'name' | 'primary_muscles' | 'secondary_muscles' | 'equipment' | 'category' | 'tracking'>

const cleanName = (name: string): string => {
  const trimmed = name.trim()
  if (trimmed.length < 1 || trimmed.length > 80) throw invalidError('Give it a name (up to 80 characters).')
  return trimmed
}

/** The server keeps one exercise per name (ignoring case) and one per ExerciseDB id. */
async function assertUnique(name: string, externalId: string | null, exceptId?: string): Promise<void> {
  const lowered = name.toLowerCase()
  const clash = (await rowsOf('exercises').toArray()).some(
    (e) => e.id !== exceptId && (e.name.toLowerCase() === lowered || (externalId !== null && e.external_id === externalId)),
  )
  if (clash) throw duplicateError('exercise name')
}

export async function listExercises(): Promise<Exercise[]> {
  return (await rowsOf('exercises').toArray()).sort((a, b) => compareText(a.name, b.name))
}

export async function createExercise(input: ExerciseInput): Promise<Exercise> {
  const name = cleanName(input.name)
  const now = nowIso()
  const exercise: Exercise = { id: newId(), user_id: ownerId(), ...input, name, external_id: null, image_url: null, instructions: [], created_at: now, updated_at: now }
  await writeTx(async () => {
    await assertUnique(name, null)
    await putRow('exercises', exercise, { isNew: true })
  })
  return exercise
}

/** Saves an ExerciseDB exercise (already mapped to our vocabulary) into the user's bank. */
export async function importExercise(mapped: MappedExercise): Promise<Exercise> {
  const now = nowIso()
  const exercise: Exercise = { id: newId(), user_id: ownerId(), category: 'strength', tracking: 'reps', ...mapped, created_at: now, updated_at: now }
  await writeTx(async () => {
    await assertUnique(cleanName(exercise.name), exercise.external_id)
    await putRow('exercises', exercise, { isNew: true })
  })
  return exercise
}

export async function updateExercise(id: string, input: ExerciseInput): Promise<Exercise> {
  const name = cleanName(input.name)
  return writeTx(async () => {
    const existing = await rowsOf('exercises').get(id)
    if (!existing) throw new Error('Exercise not found.')
    await assertUnique(name, existing.external_id, id)
    const updated: Exercise = { ...existing, ...input, name, updated_at: nowIso() }
    await putRow('exercises', updated, { isNew: false })
    return updated
  })
}

export async function deleteExercise(id: string): Promise<void> {
  await writeTx(async () => {
    // An exercise with logged sets can't be deleted (it would break history), same as on the server.
    if ((await rowsOf('sets').where('exercise_id').equals(id).count()) > 0) throw inUseError()
    await removeCascaded('template_exercises', (await rowsOf('template_exercises').where('exercise_id').equals(id).primaryKeys()) as string[])
    await removeCascaded('week_plan_items', (await rowsOf('week_plan_items').where('exercise_id').equals(id).primaryKeys()) as string[])
    await removeRow('exercises', id)
  })
}

/** Adds any missing starter exercises for the signed-in user. Needs a connection. Returns how many were added. */
export async function loadStarterExercises(): Promise<number> {
  if (isGuestUser()) return 0
  return loadStarterExercisesOnline()
}

export async function getExercise(id: string): Promise<Exercise | null> {
  return (await rowsOf('exercises').get(id)) ?? null
}
