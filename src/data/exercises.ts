import type { MappedExercise } from '../config/exerciseDbMap'
import { supabase } from '../lib/supabase'
import type { Exercise } from '../types/db'
import { assertOk, unwrap } from './unwrap'
import { GUEST_USER_ID, isGuestMode, readGuestData, writeGuestData } from './guest'

export type ExerciseInput = Pick<Exercise, 'name' | 'primary_muscles' | 'secondary_muscles' | 'equipment' | 'category' | 'tracking'>

export async function listExercises(): Promise<Exercise[]> {
  if (isGuestMode()) return [...readGuestData().exercises].sort((a, b) => a.name.localeCompare(b.name))
  return unwrap<Exercise[]>(await supabase.from('exercises').select('*').order('name'))
}

export async function createExercise(input: ExerciseInput): Promise<Exercise> {
  const row = { id: crypto.randomUUID(), ...input, name: input.name.trim() }
  if (isGuestMode()) {
    const data = readGuestData()
    const now = new Date().toISOString()
    const exercise: Exercise = { ...row, user_id: GUEST_USER_ID, external_id: null, image_url: null, instructions: [], created_at: now, updated_at: now }
    data.exercises.push(exercise)
    writeGuestData(data)
    return exercise
  }
  return unwrap<Exercise>(await supabase.from('exercises').insert(row).select().single())
}

/** Saves an ExerciseDB exercise (already mapped to our vocabulary) into the user's bank. */
export async function importExercise(mapped: MappedExercise): Promise<Exercise> {
  if (isGuestMode()) {
    const data = readGuestData()
    const now = new Date().toISOString()
    const exercise: Exercise = { id: crypto.randomUUID(), user_id: GUEST_USER_ID, category: 'strength', tracking: 'reps', ...mapped, created_at: now, updated_at: now }
    data.exercises.push(exercise)
    writeGuestData(data)
    return exercise
  }
  return unwrap<Exercise>(await supabase.from('exercises').insert({ id: crypto.randomUUID(), ...mapped }).select().single())
}

export async function updateExercise(id: string, input: ExerciseInput): Promise<Exercise> {
  const patch = { ...input, name: input.name.trim() }
  if (isGuestMode()) {
    const data = readGuestData()
    const index = data.exercises.findIndex((exercise) => exercise.id === id)
    if (index < 0) throw new Error('Exercise not found.')
    data.exercises[index] = { ...data.exercises[index], ...patch, updated_at: new Date().toISOString() }
    writeGuestData(data)
    return data.exercises[index]
  }
  return unwrap<Exercise>(await supabase.from('exercises').update(patch).eq('id', id).select().single())
}

export async function deleteExercise(id: string): Promise<void> {
  if (isGuestMode()) {
    const data = readGuestData()
    if (data.sets.some((set) => set.exercise_id === id)) throw new Error("It's still in use, so it can't be deleted.")
    data.exercises = data.exercises.filter((exercise) => exercise.id !== id)
    writeGuestData(data)
    return
  }
  assertOk(await supabase.from('exercises').delete().eq('id', id))
}

/** Adds any missing starter exercises for the signed-in user. Returns how many were added. */
export async function loadStarterExercises(): Promise<number> {
  if (isGuestMode()) return 0
  return unwrap<number>(await supabase.rpc('load_starter_exercises'))
}

export async function getExercise(id: string): Promise<Exercise | null> {
  if (isGuestMode()) return readGuestData().exercises.find((exercise) => exercise.id === id) ?? null
  return unwrap<Exercise | null>(await supabase.from('exercises').select('*').eq('id', id).maybeSingle())
}
