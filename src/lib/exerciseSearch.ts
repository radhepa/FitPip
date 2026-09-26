import type { Exercise } from '../types/db'
import { CATEGORY_INFO } from './activity'
import { muscleLabel } from './format'

/** Every word typed must appear in the name, a muscle, the equipment or the kind of activity. */
export function matchesQuery(exercise: Exercise, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const category = CATEGORY_INFO[exercise.category]
  const haystack = [
    exercise.name,
    ...exercise.primary_muscles.map(muscleLabel),
    ...exercise.secondary_muscles.map(muscleLabel),
    exercise.equipment.replace(/_/g, ' '),
    category?.label ?? '',
    category?.short ?? '',
  ]
    .join(' ')
    .toLowerCase()
  return words.every((word) => haystack.includes(word))
}

/** "Chest, Front delts · Barbell" for lifts; "Yoga · Hamstrings, Calves" for everything else. */
export function exerciseSubtitle(exercise: Exercise): string {
  const muscles = exercise.primary_muscles.map(muscleLabel).join(', ')
  if (exercise.category && exercise.category !== 'strength') {
    const label = CATEGORY_INFO[exercise.category]?.label ?? ''
    return muscles ? `${label} · ${muscles}` : label
  }
  const equipment = muscleLabel(exercise.equipment)
  return muscles ? `${muscles} · ${equipment}` : equipment
}
