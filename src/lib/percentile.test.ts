import { describe, expect, it } from 'vitest'
import { RANKS } from '../config/ranks'
import { MAX_PERCENTILE, MIN_PERCENTILE, percentileOf, rankForHours, rankForPercentile, topShare, valueAtPercentile } from './percentile'

const P = [5, 20, 50, 80, 95]
const A = [0.55, 0.8, 1.05, 1.4, 1.75]

describe('percentileOf', () => {
  it('hits the anchors exactly', () => {
    A.forEach((a, i) => expect(percentileOf(a, A, P)).toBeCloseTo(P[i], 6))
  })

  it('rises between anchors and past both ends, within 0.1..99.9', () => {
    expect(percentileOf(0.9, A, P)).toBeGreaterThan(20)
    expect(percentileOf(0.9, A, P)).toBeLessThan(50)
    expect(percentileOf(0.3, A, P)).toBeLessThan(5)
    expect(percentileOf(2.2, A, P)).toBeGreaterThan(95)
    expect(percentileOf(50, A, P)).toBe(MAX_PERCENTILE)
    expect(percentileOf(0, A, P)).toBe(MIN_PERCENTILE)
  })

  it('is the inverse of valueAtPercentile', () => {
    for (const p of [3, 12, 37, 50, 64, 88, 97]) expect(percentileOf(valueAtPercentile(p, A, P), A, P)).toBeCloseTo(p, 6)
  })
})

describe('rankForPercentile', () => {
  it('starts each rank at its percentile and tracks progress to the next', () => {
    RANKS.forEach((r) => expect(rankForPercentile(r.fromPercentile).rank).toBe(r.rank))
    expect(rankForPercentile(0.1)).toEqual({ rank: 1, progress: 0.01 })
    expect(rankForPercentile(51.5)).toEqual({ rank: 5, progress: 0.5 })
    expect(rankForPercentile(99.9)).toEqual({ rank: 10, progress: 1 })
  })
})

describe('rankForHours', () => {
  it('ranks practice time by the hour steps', () => {
    expect(rankForHours(0.2).rank).toBe(1)
    expect(rankForHours(2)).toEqual({ rank: 2, progress: 0.5 })
    expect(rankForHours(250)).toEqual({ rank: 10, progress: 1 })
  })
})

describe('topShare', () => {
  it('rounds but never says top 0%', () => {
    expect(topShare(71.6)).toBe(28)
    expect(topShare(99.9)).toBe(0.1)
  })
})
