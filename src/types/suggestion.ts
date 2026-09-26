import type { WeightUnit } from './db'

// Shapes exchanged with the suggest-workout Edge Function.
// The function validates the request with zod (supabase/functions/suggest-workout/index.ts);
// a contract test keeps this file and that schema in step.

export interface SuggestionContext {
  focus?: string
  /** Local date, YYYY-MM-DD. */
  date: string
  weekday: string
  unit: WeightUnit
  today:
    | { kind: 'workout'; name: string; exercises: { name: string; sets: number; reps: number }[] }
    | { kind: 'rest' }
    | { kind: 'unplanned' }
  /** Weighted sets per muscle (primary 1, secondary 0.5). Muscles with no work are left out. */
  volume: { muscle: string; last7Days: number; weeklyAvg30Days: number }[]
  /** Finished workouts, newest first. */
  recent: { daysAgo: number; name: string | null; exercises: { name: string; sets: number; top: string }[] }[]
}

export interface SuggestedExercise {
  exercise_id: string
  name: string
  target_sets: number
  target_reps: number
  note: string | null
}

export interface Suggestion {
  name: string
  rationale: string
  exercises: SuggestedExercise[]
}

export interface SuggestionResult {
  suggestion: Suggestion
  /** The model that produced it, as configured on the function. */
  model: string
}
