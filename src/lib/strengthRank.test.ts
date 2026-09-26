import { describe, expect, it } from 'vitest'
import { findStandard } from '../config/strengthStandards'
import { ex, session, set } from './rankFixtures.test-utils'
import {
  averageValue,
  cappedE1rm,
  compareWith,
  overallRank,
  percentileForRatio,
  rankLadder,
  rankLifts,
  rankMuscles,
  roundLoad,
  setRatio,
  unrankedLifts,
} from './strengthRank'

const bench = ex('bench', 'Barbell Bench Press', { primary: ['chest'], secondary: ['triceps', 'front_delts'] })
const squat = ex('squat', 'Barbell Full Squat', { primary: ['glutes'], secondary: ['quads', 'hamstrings'] })
const pullUp = ex('pull', 'Pull-Up', { equipment: 'bodyweight', primary: ['lats'], secondary: ['biceps'] })
const bands = ex('band', 'Band Pull Apart', { equipment: 'band', primary: ['rear_delts'] })

const benchStd = findStandard(bench)!
const pullStd = findStandard(pullUp)!

describe('one-rep max and ratios', () => {
  it('caps the reps counted in the estimate', () => {
    expect(cappedE1rm(100, 1)).toBe(100)
    expect(cappedE1rm(100, 10)).toBeCloseTo(133.33, 2)
    expect(cappedE1rm(100, 30)).toBe(cappedE1rm(100, 15))
    expect(cappedE1rm(0, 5)).toBe(0)
  })

  it('reads set weights in the app unit', () => {
    expect(setRatio(benchStd, { weight: 176.4, reps: 1 }, 'lb', 80)).toBeCloseTo(1, 2)
    expect(setRatio(benchStd, { weight: 80, reps: 1 }, 'kg', 80)).toBe(1)
  })

  it('turns bodyweight reps (plus any added weight) into the same scale', () => {
    expect(setRatio(pullStd, { weight: 0, reps: 9 }, 'kg', 80)).toBeCloseTo(1.3, 6)
    expect(setRatio(pullStd, { weight: 20, reps: 5 }, 'kg', 80)).toBeGreaterThan(setRatio(pullStd, { weight: 0, reps: 5 }, 'kg', 80))
    expect(setRatio(pullStd, { weight: 0, reps: 0 }, 'kg', 80)).toBe(0)
  })

  it('rounds loads to plates', () => {
    expect(roundLoad(186.7, 'lb')).toBe(185)
    expect(roundLoad(83.9, 'kg')).toBe(85)
    expect(roundLoad(22.4, 'lb')).toBe(22)
  })
})

describe('comparisons', () => {
  it('puts a 1x bodyweight bench near the middle for an 80 kg man', () => {
    const c = compareWith(benchStd, 'male', 80)
    const p = percentileForRatio(c, 1)
    expect(p).toBeGreaterThan(40)
    expect(p).toBeLessThan(50)
    expect(averageValue(c, 'kg')).toBe(85) // 1.05 x 80 = 84, rounded to a plate
  })

  it('expects more per kilo from lighter lifters and less from heavier ones', () => {
    const light = compareWith(benchStd, 'male', 60)
    const heavy = compareWith(benchStd, 'male', 110)
    expect(percentileForRatio(light, 1)).toBeLessThan(percentileForRatio(heavy, 1))
    // ...but heavier lifters still lift more in total at the same percentile.
    expect(averageValue(heavy, 'kg')).toBeGreaterThan(averageValue(light, 'kg'))
  })

  it('uses lower women’s standards', () => {
    expect(percentileForRatio(compareWith(benchStd, 'female', 64), 0.7)).toBeGreaterThan(percentileForRatio(compareWith(benchStd, 'male', 64), 0.7))
  })

  it('gives a ladder that climbs with the ranks, in reps for bodyweight moves', () => {
    const ladder = rankLadder(compareWith(benchStd, 'male', 80), 'lb')
    expect(ladder[0]).toEqual({ rank: 1, value: 0 })
    for (let i = 2; i < ladder.length; i += 1) expect(ladder[i].value).toBeGreaterThan(ladder[i - 1].value)
    const reps = rankLadder(compareWith(pullStd, 'male', 80), 'lb')
    expect(reps[4].value).toBeGreaterThanOrEqual(5)
    expect(reps[4].value).toBeLessThanOrEqual(9)
  })
})

describe('rankLifts', () => {
  const sessions = [session('s1', 1), session('s2', 3)]
  const sets = [
    set('s1', 'bench', { weight: 60, reps: 5 }),
    set('s2', 'bench', { weight: 80, reps: 3 }),
    set('s2', 'squat', { weight: 100, reps: 5 }),
    set('s2', 'pull', { weight: 0, reps: 12 }),
    set('s2', 'band', { weight: 10, reps: 15 }),
    set('draft', 'bench', { weight: 200, reps: 1 }), // a workout that never began doesn't count
  ]
  const lifts = rankLifts({ exercises: [bench, squat, pullUp, bands], sessions, sets, unit: 'kg', sex: 'male', bodyweightKg: 80 })

  it('ranks each lift by its best set, best first', () => {
    expect(lifts.map((l) => l.exercise.id).sort()).toEqual(['bench', 'pull', 'squat'])
    const b = lifts.find((l) => l.exercise.id === 'bench')!
    expect(b.best.weight).toBe(80)
    expect(b.value).toBe(88)
    expect(lifts[0].percentile).toBeGreaterThanOrEqual(lifts[1].percentile)
    expect(lifts.find((l) => l.exercise.id === 'pull')!.value).toBe(12)
  })

  it('ranks the standard’s muscles fully and the rest of its helpers at a discount', () => {
    const s = lifts.find((l) => l.exercise.id === 'squat')!
    expect(s.primary).toEqual(['quads', 'glutes'])
    expect(s.secondary).toEqual(['hamstrings'])
    const muscles = rankMuscles(lifts)
    expect(muscles.quads?.percentile).toBe(s.percentile)
    expect(muscles.hamstrings?.percentile).toBeCloseTo(s.percentile * 0.8, 6)
    expect(muscles.rear_delts).toBeUndefined()
    expect(muscles.chest?.sources[0].badge.exercise.id).toBe('bench')
  })

  it('averages muscle groups into an overall rank, counting missing groups as zero', () => {
    const overall = overallRank(rankMuscles(lifts))!
    expect(overall.groups.find((g) => g.key === 'core')?.percentile).toBeNull()
    const sum = overall.groups.reduce((total, g) => total + (g.percentile ?? 0), 0)
    expect(overall.score).toBeCloseTo(sum / 6, 6)
    expect(overallRank({})).toBeNull()
  })

  it('lists logged lifts with no standard', () => {
    expect(unrankedLifts([bench, bands], sets).map((e) => e.id)).toEqual(['band'])
  })
})
