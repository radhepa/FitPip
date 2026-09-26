// Hand-written row types. Keep in sync with supabase/migrations/.

export const MUSCLES = [
  'chest',
  'front_delts',
  'side_delts',
  'rear_delts',
  'biceps',
  'triceps',
  'forearms',
  'traps',
  'lats',
  'upper_back',
  'lower_back',
  'abs',
  'obliques',
  'quads',
  'hamstrings',
  'glutes',
  'adductors',
  'abductors',
  'calves',
] as const
export type Muscle = (typeof MUSCLES)[number]

export const EQUIPMENT = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
  'band',
  'smith_machine',
  'other',
] as const
export type Equipment = (typeof EQUIPMENT)[number]

export type WeightUnit = 'kg' | 'lb'
/** Which strength standards lifts are compared with. */
export type Sex = 'male' | 'female'
export type DistanceUnit = 'km' | 'mi'

/** What kind of activity an exercise is: drives its colour, icon and workout section. */
export const CATEGORIES = ['strength', 'cardio', 'swim', 'yoga', 'stretch', 'combat', 'sport'] as const
export type Category = (typeof CATEGORIES)[number]

/**
 * How an exercise is logged. 'reps' = weight x reps; 'time' = timed holds or rounds
 * (duration_seconds per set); 'distance' = one continuous effort (duration and/or distance).
 */
export const TRACKINGS = ['reps', 'time', 'distance'] as const
export type Tracking = (typeof TRACKINGS)[number]

export interface Exercise {
  id: string
  user_id: string
  name: string
  primary_muscles: Muscle[]
  secondary_muscles: Muscle[]
  equipment: Equipment
  category: Category
  tracking: Tracking
  /** ExerciseDB id when the exercise came from there (null for custom exercises). */
  external_id: string | null
  /** Demo GIF hosted by ExerciseDB. */
  image_url: string | null
  instructions: string[]
  created_at: string
  updated_at: string
}

/** One exercise set up for a workout (the stored form of a plan item). */
export interface PlanRow {
  exercise_id: string
  target_sets: number
  target_reps: number
  /** Target length of each hold / round / session, for timed and distance activities. */
  target_seconds?: number | null
  /** A note about this exercise in this workout ("seat at 4", "left shoulder tight"). */
  note?: string | null
}

export interface Session {
  id: string
  user_id: string
  name: string | null
  /** Null while the workout is still being set up: the clock starts when it is begun. */
  started_at: string | null
  ended_at: string | null
  notes: string | null
  /** The template this workout was set up from, if any. */
  template_id: string | null
  /** The exercises set up for this workout, with target sets and reps. */
  plan: PlanRow[] | null
  created_at: string
  updated_at: string
}

/** A workout that has begun (finished or still going). */
export type BegunSession = Session & { started_at: string }

export interface SetRow {
  id: string
  user_id: string
  session_id: string
  exercise_id: string
  set_order: number
  reps: number
  weight: number
  /** Rate of perceived exertion, 1-10 in half steps; null when not recorded. */
  rpe: number | null
  /** Length of a timed hold / round, or of a cardio effort. Null for lifting sets. */
  duration_seconds: number | null
  /** Distance covered, always in metres. Null when not recorded. */
  distance_m: number | null
  created_at: string
  updated_at: string
}

export interface UserSettings {
  weight_unit: WeightUnit
  distance_unit: DistanceUnit
  goal_weight: number | null
  goal_weight_unit: WeightUnit | null
  /** Seconds of rest after a lifting set; 0 turns the rest timer off. */
  rest_seconds: number
  /** Which strength standards lifts are ranked against; null until chosen. */
  compare_sex: Sex | null
  /** Name shown on the profile. */
  display_name: string | null
}

/** One weigh-in. Kept in the unit it was entered in. */
export interface BodyWeight {
  id: string
  user_id: string
  /** Local calendar date, YYYY-MM-DD. */
  measured_on: string
  weight: number
  unit: WeightUnit
  note: string | null
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface TemplateExercise {
  id: string
  user_id: string
  template_id: string
  exercise_id: string
  /** Order within the template (0-based; gaps are fine). */
  position: number
  target_sets: number
  target_reps: number
  target_seconds: number | null
  created_at: string
  updated_at: string
}

export interface TemplateWithItems {
  template: Template
  /** Ordered by position. */
  items: TemplateExercise[]
}

/**
 * One thing planned on a weekday: a routine (template), a single activity (exercise) OR just a
 * kind of workout (category, like "Cardio"). Exactly one of the three is set.
 * A weekday with no items is a rest day.
 */
export interface WeekPlanItem {
  id: string
  user_id: string
  /** 0 = Sunday ... 6 = Saturday, same as Date.getDay(). */
  weekday: number
  /** Order within the day. */
  position: number
  template_id: string | null
  exercise_id: string | null
  category: Category | null
  created_at: string
  updated_at: string
}
