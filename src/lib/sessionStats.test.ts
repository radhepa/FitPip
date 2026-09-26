import { describe, expect, it } from 'vitest'
import type { SetRow } from '../types/db'
import { bestSet, buildHistory, groupByExercise, totalVolume, type ExerciseSetRow } from './sessionStats'

let n = 0
function makeSet(over: Partial<SetRow>): SetRow {
  n += 1
  return {
    id: `set-${n}`,
    user_id: 'u',
    session_id: 's1',
    exercise_id: 'bench',
    set_order: n,
    reps: 5,
    weight: 100,
    rpe: null,
    duration_seconds: null,
    distance_m: null,
    created_at: `2026-01-01T00:00:${String(n).padStart(2, '0')}Z`,
    updated_at: '',
    ...over,
  }
}

describe('groupByExercise', () => {
  it('groups by exercise in order of first use, keeping set order', () => {
    const sets = [
      makeSet({ exercise_id: 'squat', set_order: 0 }),
      makeSet({ exercise_id: 'bench', set_order: 1 }),
      makeSet({ exercise_id: 'squat', set_order: 2 }),
    ]
    const blocks = groupByExercise(sets)
    expect(blocks.map((b) => b.exerciseId)).toEqual(['squat', 'bench'])
    expect(blocks[0].sets.map((s) => s.set_order)).toEqual([0, 2])
  })

  it('sorts unordered input', () => {
    const a = makeSet({ exercise_id: 'a', set_order: 5 })
    const b = makeSet({ exercise_id: 'b', set_order: 1 })
    expect(groupByExercise([a, b]).map((x) => x.exerciseId)).toEqual(['b', 'a'])
  })
})

describe('totalVolume', () => {
  it('sums weight x reps', () => {
    expect(totalVolume([makeSet({ weight: 100, reps: 5 }), makeSet({ weight: 50, reps: 10 })])).toBe(1000)
    expect(totalVolume([])).toBe(0)
  })
})

describe('bestSet', () => {
  it('picks the highest estimated 1RM', () => {
    const light = makeSet({ weight: 100, reps: 12 }) // 140
    const heavy = makeSet({ weight: 130, reps: 3 }) // 143
    expect(bestSet([light, heavy])).toBe(heavy)
  })

  it('returns null for no sets', () => {
    expect(bestSet([])).toBeNull()
  })
})

describe('buildHistory', () => {
  const row = (session: string, date: string, over: Partial<SetRow>): ExerciseSetRow => ({
    ...makeSet({ session_id: session, ...over }),
    session: { id: session, started_at: date },
  })

  it('groups by session, newest first, with per-session bests', () => {
    const history = buildHistory([
      row('old', '2026-01-01T10:00:00Z', { weight: 100, reps: 5 }),
      row('old', '2026-01-01T10:00:00Z', { weight: 110, reps: 3 }),
      row('new', '2026-02-01T10:00:00Z', { weight: 120, reps: 1 }),
    ])
    expect(history.map((h) => h.sessionId)).toEqual(['new', 'old'])
    expect(history[1].sets).toHaveLength(2)
    expect(history[1].bestWeight).toBe(110)
    expect(history[1].bestE1rm).toBe(121)
    expect(history[1].volume).toBe(100 * 5 + 110 * 3)
    expect(history[0].bestE1rm).toBe(120)
  })
})
