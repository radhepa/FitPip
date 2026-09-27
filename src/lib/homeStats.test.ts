import { describe, expect, it } from 'vitest'
import { greeting, startOfWeek, weekStatus, weekStreak, weekTotals, workoutStreak } from './homeStats'

// Thursday 24 Sep 2026, 10:00 local.
const now = new Date(2026, 8, 24, 10, 0)
const workout = (month: number, day: number, hour = 18, minutes = 45) => {
  const start = new Date(2026, month, day, hour, 0)
  return { started_at: start.toISOString(), ended_at: new Date(start.getTime() + minutes * 60_000).toISOString() }
}

describe('startOfWeek', () => {
  it('is Monday at local midnight', () => {
    expect(startOfWeek(now)).toEqual(new Date(2026, 8, 21))
    expect(startOfWeek(new Date(2026, 8, 27, 23))).toEqual(new Date(2026, 8, 21)) // Sunday
    expect(startOfWeek(new Date(2026, 8, 21, 0, 5))).toEqual(new Date(2026, 8, 21))
  })
})

describe('workoutStreak', () => {
  it('counts back from today', () => {
    expect(workoutStreak([workout(8, 22), workout(8, 23), { ...workout(8, 24, 7) }], now)).toBe(3)
  })

  it('still counts from yesterday when today has no workout yet', () => {
    expect(workoutStreak([workout(8, 22), workout(8, 23)], now)).toBe(2)
  })

  it('breaks on a missed day and ignores unfinished workouts', () => {
    expect(workoutStreak([workout(8, 21), workout(8, 23)], now)).toBe(1)
    expect(workoutStreak([{ started_at: workout(8, 23).started_at, ended_at: null }], now)).toBe(0)
    expect(workoutStreak([], now)).toBe(0)
  })

  it('counts two workouts on one day once', () => {
    expect(workoutStreak([workout(8, 23, 7), workout(8, 23, 19)], now)).toBe(1)
  })
})

describe('weekStreak', () => {
  // Weeks start Mon 7, 14 and 21 Sep; `now` is Thursday 24 Sep.
  it('counts weeks in a row with two or more workouts, rest days and all', () => {
    const sessions = [workout(8, 7), workout(8, 11), workout(8, 14), workout(8, 19), workout(8, 21), workout(8, 23)]
    expect(weekStreak(sessions, now)).toBe(3)
  })

  it('lets the week in progress count once it qualifies, without breaking the run before then', () => {
    const lastTwoWeeks = [workout(8, 7), workout(8, 9), workout(8, 14), workout(8, 16)]
    expect(weekStreak([...lastTwoWeeks, workout(8, 22)], now)).toBe(2)
    expect(weekStreak([...lastTwoWeeks, workout(8, 22), workout(8, 24, 7)], now)).toBe(3)
  })

  it('breaks on a week with too few workouts and ignores unfinished ones', () => {
    expect(weekStreak([workout(8, 7), workout(8, 8), workout(8, 15), workout(8, 21), workout(8, 22)], now)).toBe(1)
    expect(weekStreak([workout(8, 21), { started_at: workout(8, 22).started_at, ended_at: null }], now)).toBe(0)
    expect(weekStreak([], now)).toBe(0)
  })

  it('takes another minimum', () => {
    expect(weekStreak([workout(8, 15), workout(8, 22)], now, 1)).toBe(2)
  })
})

describe('weekStatus / weekTotals', () => {
  const sessions = [workout(8, 20), workout(8, 21, 7, 30), workout(8, 22, 18, 60), workout(8, 22, 20, 20)]
  const status = weekStatus(sessions, new Set([1, 3, 5]), now)

  it('lists Monday to Sunday with today, past, done and planned', () => {
    expect(status.map((d) => d.weekday)).toEqual([1, 2, 3, 4, 5, 6, 0])
    expect(status.map((d) => d.isToday)).toEqual([false, false, false, true, false, false, false])
    expect(status.map((d) => d.isPast)).toEqual([true, true, true, false, false, false, false])
    expect(status.map((d) => d.done)).toEqual([true, true, false, false, false, false, false])
    expect(status.map((d) => d.planned)).toEqual([true, false, true, false, true, false, false])
  })

  it('totals this week only (not last Sunday)', () => {
    expect(weekTotals(sessions, status, now)).toEqual({ workouts: 3, activeSeconds: (30 + 60 + 20) * 60, plannedDays: 3, plannedDaysDone: 1 })
  })
})

describe('greeting', () => {
  it('follows the clock', () => {
    expect(greeting(new Date(2026, 0, 1, 3))).toBe('Up late')
    expect(greeting(new Date(2026, 0, 1, 9))).toBe('Good morning')
    expect(greeting(new Date(2026, 0, 1, 14))).toBe('Good afternoon')
    expect(greeting(new Date(2026, 0, 1, 21))).toBe('Good evening')
  })
})
