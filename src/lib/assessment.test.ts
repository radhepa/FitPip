import { describe, expect, it } from 'vitest'
import { assessStrength, type Assessment } from './assessment'
import { assessmentFromDraft, changeAssessmentUnit, newAssessmentDraft } from './assessmentDraft'
import { buildProfile } from './profile'

const base = (): Assessment => ({ version: 1, age: 28, bodyweight: 80, unit: 'kg', sex: 'male',
  answers: { push_up: null, bench: null, squat: null, deadlift: null, pull_up: null } })

describe('fitness assessment', () => {
  it('excludes skipped exercises from the estimate, instead of treating them as zero', () => {
    const assessment = base()
    assessment.answers.push_up = { weight: 0, reps: 38 }
    const result = assessStrength(assessment)
    expect(result.answered).toBe(1)
    expect(result.score).toBeCloseTo(50)
    expect(result.rank).toBe(5)
  })
  it('averages answered lift scores and gives a Wood starting point when all are skipped', () => {
    const assessment = base()
    expect(assessStrength(assessment)).toMatchObject({ rank: 1, answered: 0, score: 0 })
    assessment.answers.push_up = { weight: 0, reps: 38 }
    assessment.answers.bench = { weight: 124, reps: 1 }
    expect(assessStrength(assessment).score).toBeCloseTo(65)
  })
  it('uses the same known one-rep max and estimated set score', () => {
    const assessment = base()
    assessment.answers.bench = { weight: 98, reps: 1 }
    const max = assessStrength(assessment).score
    assessment.answers.bench = { weight: 98 * 31 / 36, reps: 6 }
    expect(assessStrength(assessment).score).toBeCloseTo(max)
    expect(max).toBeCloseTo(50)
  })
  it('gives equivalent ranks in pounds and kilograms', () => {
    const kg = base()
    kg.answers.bench = { weight: 80, reps: 5 }
    const lb: Assessment = { ...kg, bodyweight: 80 / .45359237, unit: 'lb', answers: { ...kg.answers, bench: { weight: 80 / .45359237, reps: 5 } } }
    expect(assessStrength(lb).score).toBeCloseTo(assessStrength(kg).score)
  })
  it('counts a tried zero-rep exercise, but never invents an age multiplier', () => {
    const assessment = base()
    assessment.answers.pull_up = { weight: 0, reps: 0 }
    expect(assessStrength(assessment)).toMatchObject({ rank: 1, answered: 1 })
    expect(assessStrength({ ...assessment, age: 65 })).toEqual(assessStrength(assessment))
  })
  it('uses the explicitly selected comparison standards', () => {
    const assessment = base()
    assessment.answers.push_up = { weight: 0, reps: 16 }
    expect(assessStrength({ ...assessment, sex: 'female' }).score).toBeCloseTo(50)
    expect(assessStrength(assessment).score).toBeLessThan(50)
  })
  it('rejects incomplete, non-finite and out-of-range answers', () => {
    expect(() => assessmentFromDraft(newAssessmentDraft('kg', null))).toThrow()
    expect(() => assessStrength({ ...base(), age: 2.5 })).toThrow(/age/)
    expect(() => assessStrength({ ...base(), bodyweight: Infinity })).toThrow(/bodyweight/)
    const assessment = base()
    assessment.answers.bench = { weight: 100, reps: 16 }
    expect(() => assessStrength(assessment)).toThrow(/1–15/)
    assessment.answers.bench = { weight: NaN, reps: 1 }
    expect(() => assessStrength(assessment)).toThrow(/weight/)
  })
  it('preserves physical loads when switching draft units and refuses blank bodyweight reps', () => {
    const draft = newAssessmentDraft('kg', 'male', 80)
    draft.age = '28'
    draft.answers.bench = { done: true, weight: '100', reps: '5' }
    const pounds = changeAssessmentUnit(draft, 'lb')
    expect(Number(pounds.bodyweight)).toBeCloseTo(176.37, 2)
    expect(Number(pounds.answers.bench.weight)).toBeCloseTo(220.46, 2)
    for (const answer of Object.values(draft.answers)) answer.done = false
    draft.answers.push_up = { done: true, weight: '', reps: '' }
    expect(() => assessmentFromDraft(draft)).toThrow(/Push-ups/)
    draft.answers.push_up.reps = '0'
    expect(assessmentFromDraft(draft).answers.push_up?.reps).toBe(0)
  })
  it('shows a starting rank without inventing workouts, XP or earned overall ranks', () => {
    const assessment = base()
    assessment.answers.push_up = { weight: 0, reps: 38 }
    const profile = buildProfile({ assessment, exercises: [], sessions: [], sets: [], unit: 'kg', sex: 'male', bodyweightKg: 80 })
    expect(profile.startingRank?.rank).toBe(5)
    expect(profile.overall).toBeNull()
    expect(profile.xp.total).toBe(0)
    expect(profile.totals.workouts).toBe(0)
    expect(profile.totals.sets).toBe(0)
  })
})
