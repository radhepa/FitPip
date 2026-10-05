import { describe, expect, it } from 'vitest'
import { RANKS } from '../config/ranks'
import { ANCHOR_PERCENTILES, STRENGTH_STANDARDS } from '../config/strengthStandards'
import { ex, session, set } from './rankFixtures.test-utils'
import { anchorRatios, cappedE1rm, compareWith, percentileForRatio, rankLadder, rankLifts, rankMuscles, setRatio, toKg } from './strengthRank'

const standard = (key: string) => STRENGTH_STANDARDS.find((s) => s.key === key)!
const score = (key: string, sex: 'male' | 'female', bw: number, weight: number, reps: number) =>
  percentileForRatio(compareWith(standard(key), sex, bw), setRatio(standard(key), { weight, reps }, 'kg', bw, sex))

describe('published strength calibration', () => {
  it('matches the source bench tables at several bodyweights, with independent female anchors', () => {
    // https://strengthlevel.com/strength-standards/bench-press/kg — snapshot 2026-10-05.
    const cases = [
      { sex: 'male' as const, bw: 60, loads: [37, 53, 72, 95, 119] },
      { sex: 'male' as const, bw: 80, loads: [56, 75, 98, 124, 151] },
      { sex: 'female' as const, bw: 60, loads: [19, 31, 47, 66, 88] },
      { sex: 'female' as const, bw: 80, loads: [26, 40, 59, 80, 104] },
    ]
    for (const { sex, bw, loads } of cases) {
      for (const [i, load] of loads.entries()) expect(score('bench', sex, bw, load, 1)).toBeCloseTo(ANCHOR_PERCENTILES[i], 7)
    }
    // Female/male ratios differ across the distribution; one blanket factor cannot fit it.
    expect(19 / 56).not.toBeCloseTo(88 / 151, 1)
  })

  it('interpolates every bodyweight anchor, rather than rescaling one reference lifter', () => {
    const anchors = anchorRatios(standard('bench'), 'male', 82.5).map((v) => v * 82.5)
    for (const [i, expected] of [58, 77.5, 101, 127, 154.5].entries()) expect(anchors[i]).toBeCloseTo(expected, 9)
  })

  it('uses bodyweight-specific observed repetition benchmarks without a 60-rep ceiling', () => {
    expect(score('push_up', 'male', 60, 0, 41)).toBeCloseTo(50)
    expect(score('push_up', 'male', 110, 0, 34)).toBeCloseTo(50)
    expect(score('push_up', 'female', 64, 0, 18)).toBeCloseTo(50)
    expect(score('push_up', 'male', 80, 0, 100)).toBeGreaterThan(97)
    expect(setRatio(standard('push_up'), { weight: 0, reps: 100 }, 'kg', 80))
      .toBeGreaterThan(setRatio(standard('push_up'), { weight: 0, reps: 80 }, 'kg', 80))
  })

  it('uses the separate added-load standards for pull-ups, chin-ups and dips', () => {
    // Published 50th-percentile added 1RM loads, not synthetic bodyweight-rep Epley projections.
    expect(score('pull_up', 'male', 80, 33, 1)).toBeCloseTo(50)
    expect(score('pull_up', 'female', 65, 9, 1)).toBeCloseTo(50)
    expect(score('chin_up', 'male', 80, 34, 1)).toBeCloseTo(50)
    expect(score('dip', 'male', 80, 52, 1)).toBeCloseTo(50)
    expect(setRatio(standard('push_up'), { weight: 20, reps: 20 }, 'kg', 80)).toBe(0)
    expect(setRatio(standard('pull_up'), { weight: 20, reps: 3 }, 'kg', 20)).toBe(0)
  })

  it('handles zero and tied beginner anchors without producing NaN or invented reps', () => {
    const scores = [0, 1, 2, 6, 7, 12, 20].map((reps) => score('pull_up', 'female', 65, 0, reps))
    expect(scores.every(Number.isFinite)).toBe(true)
    expect(scores[0]).toBe(0.1)
    for (let i = 1; i < scores.length; i += 1) expect(scores[i]).toBeGreaterThan(scores[i - 1])
    expect(score('wrist_curl', 'female', 40, 0.5, 1)).toBeGreaterThan(0)
    expect(Number.isFinite(score('wrist_curl', 'female', 40, 0.5, 1))).toBe(true)
  })

  it('uses exact singles and conservative, bounded multiple-repetition estimates', () => {
    expect(cappedE1rm(100, 1)).toBe(100)
    expect(cappedE1rm(100, 5)).toBeCloseTo(112.5)
    expect(cappedE1rm(100, 10)).toBeCloseTo(133.333333)
    expect(cappedE1rm(100, 15)).toBe(cappedE1rm(100, 10))
    expect(cappedE1rm(100, 500)).toBe(cappedE1rm(100, 10))
    for (const reps of [0, -2, 1.5, Infinity, NaN]) expect(cappedE1rm(100, reps)).toBe(0)
    expect(cappedE1rm(Infinity, 5)).toBe(0)
  })

  it('makes every displayed rank target attainable in both units across all supported lifts', () => {
    // Covers discrete rep plateaus, rounded 0 kg anchors, light dumbbells, and the top-rank tail.
    for (const lift of STRENGTH_STANDARDS) {
      for (const sex of ['male', 'female'] as const) {
        for (const bw of [40, 50, 64, 80, 82.5, 120, 160]) {
          for (const unit of ['kg', 'lb'] as const) {
            const comparison = compareWith(lift, sex, bw)
            const ladder = rankLadder(comparison, unit)
            expect(ladder).toHaveLength(10)
            for (const target of ladder.slice(1)) {
              const ratio = lift.kind === 'reps' ? target.value + 1 : toKg(target.value, unit) / bw
              const percentile = percentileForRatio(comparison, ratio)
              expect(Number.isFinite(percentile), lift.key).toBe(true)
              expect(percentile + 1e-7, `${lift.key}/${sex}/${bw}/${unit}/rank ${target.rank}`)
                .toBeGreaterThanOrEqual(RANKS[target.rank - 1].fromPercentile)
            }
          }
        }
      }
    }
  })

  it('keeps pounds/kilograms equivalent and uses the same calibration for muscle ranks', () => {
    const exercises = [ex('bench', 'Bench Press', { primary: ['chest'], secondary: ['triceps'] })]
    const sessions = [session('s1', 1)]
    const sets = [set('s1', 'bench', { weight: 98, reps: 1 })]
    const kg = rankLifts({ exercises, sessions, sets, unit: 'kg', sex: 'male', bodyweightKg: 80 })
    const lb = rankLifts({ exercises, sessions, sets: [{ ...sets[0], weight: 98 / 0.45359237 }], unit: 'lb', sex: 'male', bodyweightKg: 80 })
    expect(kg[0].percentile).toBeCloseTo(50)
    expect(lb[0].percentile).toBeCloseTo(kg[0].percentile)
    expect(lb[0].rank).toBe(kg[0].rank)
    expect(rankMuscles(kg).chest?.percentile).toBeCloseTo(50)
  })

  it('ignores malformed sets and unusable bodyweights instead of awarding spurious ranks', () => {
    const bench = standard('bench')
    for (const bw of [0, -80, NaN, Infinity]) {
      expect(setRatio(bench, { weight: 100, reps: 5 }, 'kg', bw)).toBe(0)
      expect(rankLifts({ exercises: [], sessions: [], sets: [], unit: 'kg', sex: 'male', bodyweightKg: bw })).toEqual([])
    }
    for (const weight of [-10, Infinity, NaN]) expect(setRatio(bench, { weight, reps: 5 }, 'kg', 80)).toBe(0)
  })
})
