import { describe, expect, it } from 'vitest'
import { XP_RULES } from '../config/xp'
import { ex, session, set } from './rankFixtures.test-utils'
import { levelFor, setXp, xpHistory, xpToReach } from './xp'

describe('setXp', () => {
  it('scores lifts per set and activities per minute', () => {
    expect(setXp({ reps: 8, duration_seconds: null, distance_m: null }, { tracking: 'reps', category: 'strength' })).toBe(XP_RULES.liftSet)
    expect(setXp({ reps: 0, duration_seconds: null, distance_m: null }, { tracking: 'reps', category: 'strength' })).toBe(0)
    expect(setXp({ reps: 0, duration_seconds: 60, distance_m: null }, { tracking: 'time', category: 'yoga' })).toBe(6)
    expect(setXp({ reps: 0, duration_seconds: 1800, distance_m: 5000 }, { tracking: 'distance', category: 'cardio' })).toBe(90)
    expect(setXp({ reps: 0, duration_seconds: null, distance_m: 1000 }, { tracking: 'distance', category: 'swim' })).toBe(40)
    expect(setXp({ reps: 0, duration_seconds: 86_400, distance_m: null }, { tracking: 'distance', category: 'cardio' })).toBe(XP_RULES.maxPerSet)
  })
})

describe('xpHistory', () => {
  const bench = ex('bench', 'Bench Press')
  const pull = ex('pull', 'Pull-Up', { equipment: 'bodyweight' })
  const plank = ex('plank', 'Plank', { tracking: 'time' })
  const sessions = [session('b', 3), session('a', 1), session('c', 5, false)]
  const sets = [
    set('a', 'bench', { weight: 100, reps: 5 }),
    set('a', 'pull', { weight: 0, reps: 8 }),
    set('b', 'bench', { weight: 105, reps: 5 }),
    set('b', 'bench', { weight: 110, reps: 1 }),
    set('b', 'pull', { weight: 0, reps: 7 }),
    set('b', 'plank', { duration_seconds: 60 }),
    set('c', 'bench', { weight: 90, reps: 5 }),
  ]
  const history = xpHistory({ exercises: [bench, pull, plank], sessions, sets })

  it('goes oldest first and gives first-timers a bonus, not a record', () => {
    expect(history.map((h) => h.sessionId)).toEqual(['a', 'b', 'c'])
    expect(history[0].firstTimes.sort()).toEqual(['bench', 'pull'])
    expect(history[0].records).toEqual([])
    expect(history[0].total).toBe(2 * XP_RULES.liftSet + XP_RULES.finishedWorkout + 2 * XP_RULES.firstTime)
  })

  it('records beating a best once per exercise', () => {
    expect(history[1].records).toEqual([{ exerciseId: 'bench', kind: 'e1rm', value: 122.5, previous: 116.7 }])
    expect(history[1].firstTimes).toEqual(['plank'])
    expect(history[1].total).toBe(3 * XP_RULES.liftSet + 6 + XP_RULES.finishedWorkout + XP_RULES.personalRecord + XP_RULES.firstTime)
  })

  it('gives no finishing bonus to a workout still going', () => {
    expect(history[2]).toMatchObject({ finished: 0, records: [], total: XP_RULES.liftSet })
  })
})

describe('levels', () => {
  it('follows 50 x level x (level - 1)', () => {
    expect(xpToReach(1)).toBe(0)
    expect(xpToReach(2)).toBe(100)
    expect(xpToReach(10)).toBe(4500)
    expect(levelFor(0)).toEqual({ level: 1, into: 0, span: 100, progress: 0 })
    expect(levelFor(99).level).toBe(1)
    expect(levelFor(100).level).toBe(2)
    expect(levelFor(4499).level).toBe(9)
    expect(levelFor(4500)).toMatchObject({ level: 10, into: 0, span: 1000 })
  })
})
