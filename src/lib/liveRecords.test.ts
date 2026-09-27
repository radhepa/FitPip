import { describe, expect, it } from 'vitest'
import { bestsOf, recordSetIds } from './liveRecords'

const lift = { tracking: 'reps', category: 'strength' } as const
const plank = { tracking: 'time', category: 'stretch' } as const
const set = (id: string, weight: number, reps: number, extra: { duration_seconds?: number; distance_m?: number } = {}) => ({
  id,
  weight,
  reps,
  duration_seconds: extra.duration_seconds ?? null,
  distance_m: extra.distance_m ?? null,
})

describe('live records', () => {
  const earlier = bestsOf([set('a', 100, 5), set('b', 105, 3), set('c', 0, 12)], lift)

  it('takes the best estimated 1RM and bodyweight reps from earlier workouts', () => {
    expect(earlier.get('e1rm')).toBe(116.7)
    expect(earlier.get('reps')).toBe(12)
  })

  it('marks the top set of this workout when it beats the earlier best', () => {
    expect(recordSetIds(earlier, [set('x', 100, 5), set('y', 110, 3), set('z', 110, 3)], lift)).toEqual(new Set(['y']))
    expect(recordSetIds(earlier, [set('x', 100, 5)], lift)).toEqual(new Set())
    expect(recordSetIds(earlier, [set('x', 0, 15)], lift)).toEqual(new Set(['x']))
  })

  it('only sets the bar the first time a measure is logged', () => {
    expect(recordSetIds(new Map(), [set('x', 200, 5)], lift)).toEqual(new Set())
  })

  it('counts holds by time', () => {
    const bests = bestsOf([set('a', 0, 0, { duration_seconds: 60 })], plank)
    expect(recordSetIds(bests, [set('x', 0, 0, { duration_seconds: 75 }), set('y', 0, 0, { duration_seconds: 50 })], plank)).toEqual(new Set(['x']))
  })
})
