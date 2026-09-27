import { describe, expect, it } from 'vitest'
import { countOf, formatClock, formatDuration, formatSet, formatSetCount, formatSetList, sessionDurationMs } from './format'

describe('formatSet', () => {
  it('shows bodyweight sets as BW and adds the unit when given', () => {
    expect(formatSet({ weight: 135, reps: 8 })).toBe('135 × 8')
    expect(formatSet({ weight: 147.5, reps: 5 }, 'lb')).toBe('147.5 lb × 5')
    expect(formatSet({ weight: 0, reps: 12 }, 'lb')).toBe('BW × 12')
  })

  it('adds the RPE when one was recorded', () => {
    expect(formatSet({ weight: 135, reps: 8, rpe: 8 }, 'lb')).toBe('135 lb × 8 @8')
    expect(formatSet({ weight: 135, reps: 8, rpe: 8.5 })).toBe('135 × 8 @8.5')
    expect(formatSet({ weight: 0, reps: 12, rpe: 10 })).toBe('BW × 12 @10')
    expect(formatSet({ weight: 135, reps: 8, rpe: null })).toBe('135 × 8')
  })
})

describe('formatClock', () => {
  it('counts seconds, then minutes, then hours', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(7_000)).toBe('0:07')
    expect(formatClock(59_999)).toBe('0:59')
    expect(formatClock(725_000)).toBe('12:05')
    expect(formatClock(3_600_000)).toBe('1:00:00')
    expect(formatClock(3_807_000)).toBe('1:03:27')
    expect(formatClock(11 * 3_600_000 + 5_000)).toBe('11:00:05')
  })

  it('never goes negative (a clock a little ahead of the server)', () => {
    expect(formatClock(-4_000)).toBe('0:00')
  })
})

describe('formatDuration', () => {
  it('spells out the finished time to the second', () => {
    expect(formatDuration(45_000)).toBe('45s')
    expect(formatDuration(2_892_000)).toBe('48m 12s')
    expect(formatDuration(60_000)).toBe('1m 00s')
    expect(formatDuration(3_807_000)).toBe('1h 03m 27s')
    expect(formatDuration(0)).toBe('0s')
  })

  it('drops sub-second time the same way the running clock does', () => {
    expect(formatDuration(725_999)).toBe('12m 05s')
    expect(formatClock(725_999)).toBe('12:05')
  })
})

describe('sessionDurationMs', () => {
  const at = (iso: string) => `2026-09-21T${iso}Z`

  it('is the time between beginning and finishing', () => {
    expect(sessionDurationMs({ started_at: at('10:00:00'), ended_at: at('10:48:12') })).toBe(2_892_000)
  })

  it('is null while going, and for a workout that was never begun', () => {
    expect(sessionDurationMs({ started_at: at('10:00:00'), ended_at: null })).toBeNull()
    expect(sessionDurationMs({ started_at: null, ended_at: null })).toBeNull()
  })
})

describe('formatSetList', () => {
  const sets = [1, 2, 3, 4, 5, 6].map((i) => ({ weight: 100 + i, reps: 5 }))

  it('lists every set when there are few', () => {
    expect(formatSetList(sets.slice(0, 2))).toBe('101 × 5 · 102 × 5')
  })

  it('truncates long lists with a count of the rest', () => {
    expect(formatSetList(sets)).toBe('101 × 5 · 102 × 5 · 103 × 5 · 104 × 5 · +2 more')
  })

  it('is empty for no sets', () => {
    expect(formatSetList([])).toBe('')
  })
})

describe('formatSetCount', () => {
  it('drops the decimal for whole numbers and keeps one otherwise', () => {
    expect(formatSetCount(12)).toBe('12')
    expect(formatSetCount(6.5)).toBe('6.5')
    expect(formatSetCount(2.8571)).toBe('2.9')
    expect(formatSetCount(0)).toBe('0')
  })
})

describe('countOf', () => {
  it('is singular only for exactly one', () => {
    expect(countOf(1, 'set')).toBe('1 set')
    expect(countOf(0, 'set')).toBe('0 sets')
    expect(countOf(2.5, 'set')).toBe('2.5 sets')
    expect(countOf(3, 'more workout')).toBe('3 more workouts')
    expect(countOf(2, 'day', 'days in a row')).toBe('2 days in a row')
  })
})
