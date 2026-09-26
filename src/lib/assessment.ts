import { ASSESSMENT_EXERCISES, type AssessmentExerciseKey } from '../config/assessment'
import { STRENGTH_STANDARDS } from '../config/strengthStandards'
import type { Sex, WeightUnit } from '../types/db'
import { rankForPercentile } from './percentile'
import { compareWith, percentileForRatio, setRatio, toKg } from './strengthRank'

export interface Assessment {
  version: 1
  age: number
  bodyweight: number
  unit: WeightUnit
  sex: Sex
  answers: Record<AssessmentExerciseKey, { weight: number; reps: number } | null>
}

export function validateAssessment(value: Assessment): void {
  if (value.version !== 1 || !Number.isInteger(value.age) || value.age < 1 || value.age > 120) throw new Error('Enter your age in whole years, from 1 to 120.')
  if (value.unit !== 'lb' && value.unit !== 'kg') throw new Error('Choose pounds or kilograms.')
  if (!Number.isFinite(value.bodyweight) || value.bodyweight <= 0 || value.bodyweight >= 2000) throw new Error('Enter a bodyweight above 0 and below 2,000.')
  if (value.sex !== 'male' && value.sex !== 'female') throw new Error('Choose which strength standards to use.')
  for (const exercise of ASSESSMENT_EXERCISES) {
    const answer = value.answers?.[exercise.key]
    if (answer === null) continue
    if (!answer) throw new Error(`Answer ${exercise.name} or select “Haven’t done this”.`)
    const min = exercise.kind === 'reps' ? 0 : 1
    const max = exercise.kind === 'reps' ? 200 : 15
    if (!Number.isInteger(answer.reps) || answer.reps < min || answer.reps > max) throw new Error(`Enter ${min}–${max} reps for ${exercise.name}.`)
    if (!Number.isFinite(answer.weight) || (exercise.kind === 'reps' ? answer.weight !== 0 : answer.weight <= 0 || answer.weight >= 2000)) throw new Error(`Enter a valid weight for ${exercise.name}.`)
  }
}

/** Self-reported starting estimate, using the same per-lift standards as logged workouts.
 * Skipped exercises are excluded. Age is recorded, but the existing standards are not age-adjusted.
 * This average is not a population percentile or the six-group logged-history overall score.
 */
export function assessStrength(value: Assessment) {
  validateAssessment(value)
  const bodyweightKg = toKg(value.bodyweight, value.unit)
  const lifts = ASSESSMENT_EXERCISES.flatMap((exercise) => {
    const answer = value.answers[exercise.key]
    if (!answer) return []
    const standard = STRENGTH_STANDARDS.find((s) => s.key === exercise.key)!
    const ratio = setRatio(standard, answer, value.unit, bodyweightKg)
    const score = percentileForRatio(compareWith(standard, value.sex, bodyweightKg), ratio)
    return [{ ...exercise, ...answer, score, ...rankForPercentile(score) }]
  })
  const score = lifts.length ? lifts.reduce((sum, lift) => sum + lift.score, 0) / lifts.length : 0
  return { score, ...rankForPercentile(score), lifts, answered: lifts.length }
}

export type AssessmentResult = ReturnType<typeof assessStrength>
