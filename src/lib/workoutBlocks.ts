import type { Exercise, SetRow, TemplateExercise } from '../types/db'
import { SECTION_ORDER, type Section } from './activity'
import { groupByExercise } from './sessionStats'

export interface PlanItem {
  exerciseId: string
  targetSets: number
  targetReps: number
  /** Seconds per hold / round / session for timed and distance activities (absent for lifts). */
  targetSeconds?: number
}

export interface WorkoutBlock {
  exerciseId: string
  sets: SetRow[]
  /** Set when the exercise is part of the plan this workout was set up with. */
  plan: PlanItem | null
}

export const planFromTemplate = (items: TemplateExercise[]): PlanItem[] =>
  [...items]
    .sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at))
    .map((i) => ({
      exerciseId: i.exercise_id,
      targetSets: i.target_sets,
      targetReps: i.target_reps,
      ...(i.target_seconds ? { targetSeconds: i.target_seconds } : {}),
    }))

/**
 * The exercises shown in a workout, in order: the planned exercises first (even before any set is
 * logged), then anything else that has sets, then exercises picked but not yet started.
 */
export function buildBlocks(args: { sets: SetRow[]; pendingIds: string[]; plan: PlanItem[] }): WorkoutBlock[] {
  const logged = new Map(groupByExercise(args.sets).map((b) => [b.exerciseId, b.sets]))
  const planned = new Map(args.plan.map((p) => [p.exerciseId, p]))
  const blocks: WorkoutBlock[] = []
  const seen = new Set<string>()

  const add = (exerciseId: string) => {
    if (seen.has(exerciseId)) return
    seen.add(exerciseId)
    blocks.push({ exerciseId, sets: logged.get(exerciseId) ?? [], plan: planned.get(exerciseId) ?? null })
  }

  args.plan.forEach((p) => add(p.exerciseId))
  logged.forEach((_sets, exerciseId) => add(exerciseId))
  args.pendingIds.forEach(add)
  return blocks
}

/** A suggested workout as a plan (the same shape a template's plan has). */
export const planFromSuggestion = (suggestion: { exercises: { exercise_id: string; target_sets: number; target_reps: number }[] }): PlanItem[] =>
  suggestion.exercises.map((e) => ({ exerciseId: e.exercise_id, targetSets: e.target_sets, targetReps: e.target_reps }))

/** Items grouped into workout sections (strength, cardio, yoga & stretching), in section order. */
export function bySection<T>(items: T[], sectionFor: (item: T) => Section): { section: Section; items: T[] }[] {
  return SECTION_ORDER.map((section) => ({ section, items: items.filter((item) => sectionFor(item) === section) }))
}

/** Popular cardio activities, in the order offered as one-tap adds in the cardio section. */
export const QUICK_CARDIO = ['Outdoor Run', 'Treadmill Run', 'Stationary Bike', 'Rowing Machine', 'Freestyle Swim', 'Jump Rope', 'Walk', 'Elliptical']

/** The quick cardio adds that exist in the bank and are not in the workout yet. */
export function quickCardio(exercises: Exercise[], present: Set<string>): Exercise[] {
  const byName = new Map(exercises.map((e) => [e.name.toLowerCase(), e]))
  return QUICK_CARDIO.flatMap((name) => {
    const exercise = byName.get(name.toLowerCase())
    return exercise && !present.has(exercise.id) ? [exercise] : []
  })
}
