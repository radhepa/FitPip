import { ASSESSMENT_EXERCISES, type AssessmentExerciseKey } from '../config/assessment'
import type { Sex, WeightUnit } from '../types/db'
import { fromKg, toKg } from './strengthRank'
import { validateAssessment, type Assessment } from './assessment'

export interface AssessmentAnswerDraft { done: boolean | null; weight: string; reps: string }
export interface AssessmentDraft {
  age: string
  bodyweight: string
  unit: WeightUnit
  sex: Sex | null
  answers: Record<AssessmentExerciseKey, AssessmentAnswerDraft>
}

export function newAssessmentDraft(unit: WeightUnit, sex: Sex | null, weight?: number): AssessmentDraft {
  return { age: '', bodyweight: weight ? String(weight) : '', unit, sex,
    answers: Object.fromEntries(ASSESSMENT_EXERCISES.map((e) => [e.key, { done: null, weight: '', reps: '' }])) as AssessmentDraft['answers'] }
}

/** Preserve the physical weights if someone goes back and changes units. */
export function changeAssessmentUnit(draft: AssessmentDraft, unit: WeightUnit): AssessmentDraft {
  if (unit === draft.unit) return draft
  const convert = (text: string) => text.trim() && Number.isFinite(Number(text))
    ? String(Math.round(fromKg(toKg(Number(text), draft.unit), unit) * 100) / 100) : text
  return { ...draft, unit, bodyweight: convert(draft.bodyweight),
    answers: Object.fromEntries(Object.entries(draft.answers).map(([key, answer]) => [key, { ...answer, weight: convert(answer.weight) }])) as AssessmentDraft['answers'] }
}

export function assessmentFromDraft(draft: AssessmentDraft): Assessment {
  const assessment: Assessment = { version: 1, age: Number(draft.age), bodyweight: Number(draft.bodyweight), unit: draft.unit, sex: draft.sex as Sex,
    answers: Object.fromEntries(ASSESSMENT_EXERCISES.map((e) => {
      const answer = draft.answers[e.key]
      if (answer.done === false) return [e.key, null]
      if (answer.done !== true || !answer.reps.trim() || (e.kind === 'load' && !answer.weight.trim())) throw new Error(`Complete ${e.name} or select “Haven’t done this”.`)
      return [e.key, { weight: e.kind === 'load' ? Number(answer.weight) : 0, reps: Number(answer.reps) }]
    })) as Assessment['answers'] }
  validateAssessment(assessment)
  return assessment
}
