import { describe, expect, it } from 'vitest'
import { fromTimeParts, MAX_WORKOUT_MS, toTimeParts, workoutTimeProblem } from './workoutTime'

// Built from local parts, so the tests pass in any time zone.
const local = (y: number, mo: number, d: number, h: number, mi: number, s = 0) => new Date(y, mo - 1, d, h, mi, s).toISOString()

describe('toTimeParts / fromTimeParts', () => {
  it('splits a moment into the local date and time fields and back', () => {
    const at = local(2026, 9, 29, 17, 5)
    expect(toTimeParts(at)).toEqual({ date: '2026-09-29', time: '17:05' })
    expect(fromTimeParts({ date: '2026-09-29', time: '17:05' })).toBe(at)
  })

  it('keeps the original (with its seconds) when the fields were not changed', () => {
    const original = local(2026, 9, 29, 17, 5, 42)
    expect(fromTimeParts(toTimeParts(original), original)).toBe(original)
    expect(fromTimeParts({ date: '2026-09-29', time: '17:06' }, original)).toBe(local(2026, 9, 29, 17, 6))
  })

  it('accepts a time with seconds', () => {
    expect(fromTimeParts({ date: '2026-09-29', time: '07:08:09' })).toBe(local(2026, 9, 29, 7, 8, 9))
  })

  it('is null for blank or impossible fields', () => {
    expect(fromTimeParts({ date: '', time: '17:05' })).toBeNull()
    expect(fromTimeParts({ date: '2026-09-29', time: '' })).toBeNull()
    expect(fromTimeParts({ date: '2026-02-31', time: '10:00' })).toBeNull()
    expect(fromTimeParts({ date: '2026-09-29', time: '24:00' })).toBeNull()
    expect(fromTimeParts({ date: '29/09/2026', time: '10:00' })).toBeNull()
  })
})

describe('workoutTimeProblem', () => {
  const now = new Date(2026, 8, 30, 12, 0)
  const start = local(2026, 9, 29, 17, 0)

  it('accepts a normal finished workout, and a running one with only a start', () => {
    expect(workoutTimeProblem(start, local(2026, 9, 29, 18, 10), now)).toBeNull()
    expect(workoutTimeProblem(start, undefined, now)).toBeNull()
  })

  it('accepts a workout that goes past midnight', () => {
    expect(workoutTimeProblem(local(2026, 9, 29, 23, 30), local(2026, 9, 30, 0, 45), now)).toBeNull()
  })

  it('needs both times filled in', () => {
    expect(workoutTimeProblem(null, local(2026, 9, 29, 18, 0), now)).toMatch(/started/)
    expect(workoutTimeProblem(start, null, now)).toMatch(/finished/)
  })

  it('refuses a finish before the start', () => {
    expect(workoutTimeProblem(start, local(2026, 9, 29, 16, 59), now)).toMatch(/before it starts/)
  })

  it('refuses times in the future, but not right now', () => {
    expect(workoutTimeProblem(local(2026, 9, 30, 12, 30), undefined, now)).toMatch(/future/)
    expect(workoutTimeProblem(start, local(2026, 9, 30, 12, 30), now)).toMatch(/future/)
    expect(workoutTimeProblem(start, now.toISOString(), now)).toBeNull()
  })

  it('refuses a workout longer than a day (a wrong date, most likely)', () => {
    const end = new Date(Date.parse(start) + MAX_WORKOUT_MS + 60_000).toISOString()
    expect(workoutTimeProblem(start, end, new Date(2026, 9, 5))).toMatch(/24 hours/)
  })
})
