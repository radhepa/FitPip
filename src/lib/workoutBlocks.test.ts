import { describe, expect, it } from 'vitest'
import type { SetRow, TemplateExercise } from '../types/db'
import { buildBlocks, planFromSuggestion, planFromTemplate } from './workoutBlocks'

let n = 0
const set = (exercise_id: string, set_order: number): SetRow => {
  n += 1
  return {
    id: `s${n}`,
    user_id: 'u',
    session_id: 'sess',
    exercise_id,
    set_order,
    weight: 100,
    reps: 5,
    rpe: null,
    duration_seconds: null,
    distance_m: null,
    created_at: `2026-01-01T00:00:${String(n).padStart(2, '0')}Z`,
    updated_at: '',
  }
}

const item = (exercise_id: string, position: number): TemplateExercise => ({
  id: `t-${exercise_id}`,
  user_id: 'u',
  template_id: 'tpl',
  exercise_id,
  position,
  target_sets: 3,
  target_reps: 8,
  target_seconds: null,
  created_at: '',
  updated_at: '',
})

describe('planFromTemplate', () => {
  it('orders by position and maps targets', () => {
    const plan = planFromTemplate([item('b', 2), item('a', 0)])
    expect(plan).toEqual([
      { exerciseId: 'a', targetSets: 3, targetReps: 8 },
      { exerciseId: 'b', targetSets: 3, targetReps: 8 },
    ])
  })
})

describe('buildBlocks', () => {
  const plan = planFromTemplate([item('bench', 0), item('row', 1)])

  it('shows planned exercises first, even with no sets', () => {
    const blocks = buildBlocks({ sets: [], pendingIds: [], plan })
    expect(blocks.map((b) => b.exerciseId)).toEqual(['bench', 'row'])
    expect(blocks.every((b) => b.sets.length === 0 && b.plan)).toBe(true)
  })

  it('attaches logged sets to their planned block and keeps extras after the plan', () => {
    const blocks = buildBlocks({
      sets: [set('curl', 0), set('row', 1), set('bench', 2), set('row', 3)],
      pendingIds: ['squat'],
      plan,
    })
    expect(blocks.map((b) => b.exerciseId)).toEqual(['bench', 'row', 'curl', 'squat'])
    expect(blocks[1].sets).toHaveLength(2)
    expect(blocks[2].plan).toBeNull()
    expect(blocks[3].plan).toBeNull()
  })

  it('does not duplicate an exercise that is pending and planned', () => {
    const blocks = buildBlocks({ sets: [], pendingIds: ['bench', 'squat'], plan })
    expect(blocks.map((b) => b.exerciseId)).toEqual(['bench', 'row', 'squat'])
  })

  it('works with no plan at all (an ad-hoc workout)', () => {
    const blocks = buildBlocks({ sets: [set('curl', 0)], pendingIds: ['squat'], plan: [] })
    expect(blocks.map((b) => b.exerciseId)).toEqual(['curl', 'squat'])
  })
})

describe('planFromSuggestion', () => {
  it('keeps the order given and maps snake_case targets to a plan', () => {
    const plan = planFromSuggestion({
      exercises: [
        { exercise_id: 'a', target_sets: 4, target_reps: 6 },
        { exercise_id: 'b', target_sets: 3, target_reps: 12 },
      ],
    })
    expect(plan).toEqual([
      { exerciseId: 'a', targetSets: 4, targetReps: 6 },
      { exerciseId: 'b', targetSets: 3, targetReps: 12 },
    ])
  })
})
