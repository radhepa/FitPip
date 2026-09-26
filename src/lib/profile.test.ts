import { describe, expect, it } from 'vitest'
import type { BodyWeight } from '../types/db'
import { bodyweightKg, buildProfile, workoutRewards, type ProfileInput } from './profile'
import { ex, session, set } from './rankFixtures.test-utils'

const bench = ex('bench', 'Barbell Bench Press', { primary: ['chest'], secondary: ['triceps'] })
const run = ex('run', 'Outdoor Run', { category: 'cardio', tracking: 'distance' })

const input: ProfileInput = {
  exercises: [bench, run],
  sessions: [session('s1', 1), session('s2', 8)],
  sets: [
    set('s1', 'bench', { weight: 135, reps: 5 }),
    set('s1', 'run', { duration_seconds: 2100, distance_m: 5000 }),
    set('s2', 'bench', { weight: 225, reps: 3 }),
  ],
  unit: 'lb',
  sex: 'male',
  bodyweightKg: 80,
  now: new Date(Date.UTC(2026, 0, 9)),
}

describe('buildProfile', () => {
  const profile = buildProfile(input)

  it('adds up XP, this week’s XP and totals', () => {
    expect(profile.xp.total).toBe(profile.history.reduce((sum, h) => sum + h.total, 0))
    expect(profile.xp.thisWeek).toBe(profile.history[1].total)
    expect(profile.totals).toMatchObject({ workouts: 2, sets: 3, volume: 135 * 5 + 225 * 3, trainedSeconds: 7200, records: 1, badges: 2 })
  })

  it('ranks lifts, muscles and cardio', () => {
    expect(profile.lifts[0].exercise.id).toBe('bench')
    expect(profile.muscles.chest?.rank).toBe(profile.lifts[0].rank)
    expect(profile.activities[0].def.key).toBe('running')
    expect(profile.overall).not.toBeNull()
    expect(profile.missing).toEqual({ sex: false, bodyweight: false })
  })

  it('keeps XP and practice badges but no lift ranks until sex and bodyweight are known', () => {
    const blank = buildProfile({ ...input, sex: null, bodyweightKg: null })
    expect(blank.lifts).toEqual([])
    expect(blank.overall).toBeNull()
    expect(blank.xp.total).toBe(profile.xp.total)
    expect(blank.activities[0].basis).toBe('hours')
    expect(blank.missing).toEqual({ sex: true, bodyweight: true })
  })
})

describe('workoutRewards', () => {
  it('lists what a workout ranked up, compared with just before it', () => {
    const rewards = workoutRewards(input, 's2')!
    expect(rewards.xp?.records).toHaveLength(1)
    const benchUp = rewards.rankUps.find((r) => r.kind === 'lift')!
    expect(benchUp.label).toBe('Barbell Bench Press')
    expect(benchUp.to).toBeGreaterThan(benchUp.from!)
    expect(rewards.rankUps.some((r) => r.kind === 'muscle' && r.label === 'Chest')).toBe(true)
    expect(rewards.rankUps.some((r) => r.kind === 'activity')).toBe(false)
  })

  it('calls everything in the first workout new', () => {
    const rewards = workoutRewards(input, 's1')!
    expect(rewards.rankUps.every((r) => r.from === null)).toBe(true)
    expect(rewards.rankUps.map((r) => r.label)).toContain('Running')
    expect(workoutRewards(input, 'nope')).toBeNull()
  })
})

describe('bodyweightKg', () => {
  it('averages the last week of weigh-ins in kg', () => {
    const row = (day: string, weight: number, unit: 'kg' | 'lb'): BodyWeight => ({ id: day, user_id: 'u', measured_on: day, weight, unit, note: null, created_at: '', updated_at: '' })
    expect(bodyweightKg([])).toBeNull()
    expect(bodyweightKg([row('2026-01-01', 100, 'kg'), row('2026-01-10', 176.4, 'lb'), row('2026-01-12', 82, 'kg')])).toBeCloseTo(81, 1)
  })
})
