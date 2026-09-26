import type { Category, Exercise, Tracking } from '../types/db'

/** Where an activity goes in a workout. Cardio is its own section, as is yoga and stretching. */
export type Section = 'strength' | 'cardio' | 'mobility'

export interface CategoryInfo {
  label: string
  /** Short name for chips and filters. */
  short: string
  section: Section
  /** CSS custom property holding the category colour (defined in index.css for both themes). */
  color: string
}

export const CATEGORY_INFO: Record<Category, CategoryInfo> = {
  strength: { label: 'Strength', short: 'Lift', section: 'strength', color: 'var(--cat-strength)' },
  cardio: { label: 'Cardio', short: 'Cardio', section: 'cardio', color: 'var(--cat-cardio)' },
  swim: { label: 'Swimming', short: 'Swim', section: 'cardio', color: 'var(--cat-swim)' },
  combat: { label: 'Boxing & combat', short: 'Boxing', section: 'cardio', color: 'var(--cat-combat)' },
  sport: { label: 'Sports', short: 'Sport', section: 'cardio', color: 'var(--cat-sport)' },
  yoga: { label: 'Yoga', short: 'Yoga', section: 'mobility', color: 'var(--cat-yoga)' },
  stretch: { label: 'Stretching', short: 'Stretch', section: 'mobility', color: 'var(--cat-stretch)' },
}

/** Filter order in pickers. */
export const CATEGORY_ORDER: Category[] = ['strength', 'cardio', 'swim', 'combat', 'yoga', 'stretch', 'sport']

export const SECTION_INFO: Record<Section, { title: string; hint: string; categories: Category[] }> = {
  strength: { title: 'Strength', hint: 'Weights and bodyweight', categories: ['strength'] },
  cardio: { title: 'Cardio', hint: 'Runs, rides, swims and rounds', categories: ['cardio', 'swim', 'combat', 'sport'] },
  mobility: { title: 'Yoga & stretching', hint: 'Poses, holds and mobility', categories: ['yoga', 'stretch'] },
}

export const SECTION_ORDER: Section[] = ['strength', 'cardio', 'mobility']

/** How each tracking style is described when making an exercise. */
export const TRACKING_LABEL: Record<Tracking, string> = {
  reps: 'Weight × reps',
  time: 'Timed holds or rounds',
  distance: 'Time and distance',
}

/** The tracking a new exercise of this category usually wants. */
export const DEFAULT_TRACKING: Record<Category, Tracking> = {
  strength: 'reps',
  cardio: 'distance',
  swim: 'distance',
  sport: 'distance',
  combat: 'time',
  yoga: 'time',
  stretch: 'time',
}

type Kind = Pick<Exercise, 'category' | 'tracking'>

export const sectionOf = (exercise: Pick<Exercise, 'category'>): Section => CATEGORY_INFO[exercise.category]?.section ?? 'strength'

/** Only weight x reps work counts towards the muscle map (a stretch is not training volume). */
export const countsTowardMuscles = (exercise: Partial<Kind>): boolean => (exercise.tracking ?? 'reps') === 'reps'

export interface Target {
  targetSets: number
  targetReps: number
  /** Seconds per hold / round / session; null for weight x reps. */
  targetSeconds: number | null
}

/** A sensible starting target when an exercise is added to a workout or routine. */
export function defaultTarget(exercise: Kind): Target {
  if (exercise.tracking === 'reps') return { targetSets: 3, targetReps: 10, targetSeconds: null }
  if (exercise.tracking === 'distance') {
    return { targetSets: 1, targetReps: 1, targetSeconds: exercise.category === 'sport' ? 3600 : 1800 }
  }
  switch (exercise.category) {
    case 'combat':
      return { targetSets: 3, targetReps: 1, targetSeconds: 180 }
    case 'cardio':
      return { targetSets: 5, targetReps: 1, targetSeconds: 60 }
    case 'swim':
      return { targetSets: 1, targetReps: 1, targetSeconds: 300 }
    case 'stretch':
      return { targetSets: 2, targetReps: 1, targetSeconds: 30 }
    default:
      return { targetSets: 2, targetReps: 1, targetSeconds: 45 }
  }
}

/** "3 × 10", "3 × 3:00", "30 min". */
export function describeTarget(exercise: Pick<Exercise, 'tracking'>, target: Target): string {
  if (exercise.tracking === 'reps') return `${target.targetSets} × ${target.targetReps}`
  const seconds = target.targetSeconds ?? 0
  const length = seconds >= 600 && seconds % 60 === 0 ? `${seconds / 60} min` : clock(seconds)
  if (exercise.tracking === 'distance' && target.targetSets === 1) return length
  return `${target.targetSets} × ${length}`
}

function clock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}
