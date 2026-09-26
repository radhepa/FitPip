import type { Exercise } from '../types/db'

/** Adds an exercise to a name-sorted list, or replaces it if the id is already there. */
export function withExercise(list: Exercise[], exercise: Exercise): Exercise[] {
  return [...list.filter((e) => e.id !== exercise.id), exercise].sort((a, b) => a.name.localeCompare(b.name))
}
