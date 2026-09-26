import type { IExerciseData } from 'react-body-highlighter'
import { LEVEL_STARTS, MUSCLE_TO_BODY, type BodyMuscle } from '../config/muscleMap'
import { MUSCLES, type Exercise, type BegunSession, type Muscle, type SetRow, type TemplateExercise } from '../types/db'
import { countsTowardMuscles } from './activity'

/** Only lifting (weight x reps) counts: a stretch or a run is not training volume for the map. */
export type WorkExercise = Pick<Exercise, 'id' | 'name' | 'primary_muscles' | 'secondary_muscles'> & Partial<Pick<Exercise, 'tracking'>>
export type Level = 0 | 1 | 2 | 3 | 4
export type Role = 'primary' | 'secondary'

/** A set counts fully for a primary muscle and half for a secondary one. */
export const PRIMARY_WEIGHT = 1
export const SECONDARY_WEIGHT = 0.5

export const RANGES = [7, 30] as const
export type RangeDays = (typeof RANGES)[number]

/** One exercise's share of a period: how many sets, and the sets themselves when they are known. */
export interface ExerciseWork {
  exercise: WorkExercise
  setCount: number
  /** Logged sets (absent for a planned template, which only has a target count). */
  sets?: SetRow[]
}

export interface MuscleContribution {
  exercise: WorkExercise
  role: Role
  /** Sets of this exercise in the period. */
  setCount: number
  /** setCount x weight (1 primary, 0.5 secondary). */
  weighted: number
  sets?: SetRow[]
}

export interface MuscleVolume {
  /** Weighted sets over the whole period. */
  weighted: number
  /** Weighted sets per week: weighted divided by the number of weeks in the period. */
  perWeek: number
  /** Which exercises produced it, biggest first. */
  contributions: MuscleContribution[]
}

export type VolumeByMuscle = Record<Muscle, MuscleVolume>

/** Level 0-4 from weekly sets: 1-4 -> 1, 5-9 -> 2, 10-14 -> 3, 15+ -> 4. Under one set is 0. */
export function levelFor(weeklySets: number): Level {
  let level = 0
  LEVEL_STARTS.forEach((start, index) => {
    if (weeklySets >= start) level = index + 1
  })
  return level as Level
}

/** First moment of a range: local midnight, `days - 1` days ago (so "7 days" = today + the 6 before). */
export function rangeStart(days: number, now: Date = new Date()): Date {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - (days - 1))
  return start
}

/** The sets that belong to sessions started inside the range. */
export function setsInRange(
  sets: SetRow[],
  sessions: Pick<BegunSession, 'id' | 'started_at'>[],
  days: number,
  now: Date = new Date(),
): SetRow[] {
  const from = rangeStart(days, now).getTime()
  const inRange = new Set(sessions.filter((s) => new Date(s.started_at).getTime() >= from).map((s) => s.id))
  return sets.filter((s) => inRange.has(s.session_id))
}

/** Groups logged sets by exercise. Sets of exercises we have no record of are skipped. */
export function workFromSets(sets: SetRow[], exerciseById: Map<string, WorkExercise>): ExerciseWork[] {
  const grouped = new Map<string, SetRow[]>()
  for (const set of sets) grouped.set(set.exercise_id, [...(grouped.get(set.exercise_id) ?? []), set])
  return [...grouped.entries()].flatMap(([exerciseId, group]) => {
    const exercise = exerciseById.get(exerciseId)
    return exercise && countsTowardMuscles(exercise) ? [{ exercise, setCount: group.length, sets: group }] : []
  })
}

/** A template's plan as work: each exercise's target number of sets. */
export function workFromTemplate(items: TemplateExercise[], exerciseById: Map<string, WorkExercise>): ExerciseWork[] {
  return items.flatMap((item) => {
    const exercise = exerciseById.get(item.exercise_id)
    return exercise && countsTowardMuscles(exercise) ? [{ exercise, setCount: item.target_sets }] : []
  })
}

const emptyVolume = (): VolumeByMuscle =>
  Object.fromEntries(MUSCLES.map((m) => [m, { weighted: 0, perWeek: 0, contributions: [] }])) as unknown as VolumeByMuscle

/**
 * Weighted sets per muscle: 1 per set for each primary muscle, 0.5 for each secondary.
 * `weeks` is how long the work covers (1 for a single workout or a 7 day range, 30/7 for 30 days),
 * so `perWeek` is comparable across ranges.
 */
export function computeVolume(work: ExerciseWork[], weeks = 1): VolumeByMuscle {
  const volume = emptyVolume()
  for (const item of work) {
    if (item.setCount <= 0) continue
    const primary = new Set(item.exercise.primary_muscles)
    const roles: [Muscle, Role, number][] = [
      ...[...primary].map((m): [Muscle, Role, number] => [m, 'primary', PRIMARY_WEIGHT]),
      ...[...new Set(item.exercise.secondary_muscles)]
        .filter((m) => !primary.has(m))
        .map((m): [Muscle, Role, number] => [m, 'secondary', SECONDARY_WEIGHT]),
    ]
    for (const [muscle, role, weight] of roles) {
      const entry = volume[muscle]
      const weighted = item.setCount * weight
      entry.weighted += weighted
      entry.contributions.push({ exercise: item.exercise, role, setCount: item.setCount, weighted, sets: item.sets })
    }
  }
  for (const muscle of MUSCLES) {
    const entry = volume[muscle]
    entry.perWeek = entry.weighted / weeks
    entry.contributions.sort((a, b) => b.weighted - a.weighted)
  }
  return volume
}

/**
 * Weekly sets per muscle over the last 7 or 30 days, from finished or in-progress sessions and
 * their sets. A 30 day range is averaged to a week so the level thresholds mean the same thing.
 */
export function weeklyVolume(args: {
  sessions: Pick<BegunSession, 'id' | 'started_at'>[]
  sets: SetRow[]
  exercises: WorkExercise[]
  days: RangeDays
  now?: Date
}): VolumeByMuscle {
  const byId = new Map(args.exercises.map((e) => [e.id, e]))
  const inRange = setsInRange(args.sets, args.sessions, args.days, args.now)
  return computeVolume(workFromSets(inRange, byId), args.days / 7)
}

/** The level for each drawn region: the highest level among the muscles that feed it. */
export function regionLevels(volume: VolumeByMuscle): Partial<Record<BodyMuscle, Level>> {
  const levels: Partial<Record<BodyMuscle, Level>> = {}
  for (const muscle of MUSCLES) {
    const level = levelFor(volume[muscle].perWeek)
    if (level === 0) continue
    for (const region of MUSCLE_TO_BODY[muscle]) levels[region] = Math.max(levels[region] ?? 0, level) as Level
  }
  return levels
}

/** Input for the library's Model: one entry per lit region, with its level as the frequency. */
export function toModelData(levels: Partial<Record<BodyMuscle, Level>>): IExerciseData[] {
  return (Object.entries(levels) as [BodyMuscle, Level][]).map(([region, level]) => ({
    name: region,
    muscles: [region],
    frequency: level,
  }))
}

/** Muscles with any work, biggest first (for the list under the figures). */
export function musclesWithWork(volume: VolumeByMuscle): Muscle[] {
  return MUSCLES.filter((m) => volume[m].weighted > 0).sort((a, b) => volume[b].perWeek - volume[a].perWeek)
}

export interface SetsOnDay {
  sessionId: string
  startedAt: string
  sets: SetRow[]
}

/**
 * One exercise's sets split by workout, newest workout first. Sets whose workout date is not
 * known are kept together at the end so nothing is dropped.
 */
export function groupSetsByWorkout(sets: SetRow[], startedAt: Map<string, string>): SetsOnDay[] {
  const groups = new Map<string, SetRow[]>()
  for (const set of sets) groups.set(set.session_id, [...(groups.get(set.session_id) ?? []), set])
  return [...groups.entries()]
    .map(([sessionId, group]) => ({ sessionId, startedAt: startedAt.get(sessionId) ?? '', sets: group }))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

/** A plan that is not a saved template (for example a suggestion) as work: each exercise's target sets. */
export function workFromPlan(plan: { exerciseId: string; targetSets: number }[], exerciseById: Map<string, WorkExercise>): ExerciseWork[] {
  return plan.flatMap((item) => {
    const exercise = exerciseById.get(item.exerciseId)
    return exercise && countsTowardMuscles(exercise) ? [{ exercise, setCount: item.targetSets }] : []
  })
}
