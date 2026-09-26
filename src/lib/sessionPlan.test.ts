import { describe, expect, it } from 'vitest'
import { addToPlan, DEFAULT_TARGET, moveInPlan, moveWithinGroup, planFromRows, planToRows, removeFromPlan, setPlanTargets } from './sessionPlan'
import type { PlanItem } from './workoutBlocks'

const plan: PlanItem[] = [
  { exerciseId: 'squat', targetSets: 4, targetReps: 5 },
  { exerciseId: 'bench', targetSets: 3, targetReps: 8 },
  { exerciseId: 'row', targetSets: 3, targetReps: 10 },
]

describe('planFromRows / planToRows', () => {
  it('round-trips a plan', () => {
    expect(planFromRows(planToRows(plan))).toEqual(plan)
  })

  it('stores an empty plan as null and reads null back as empty', () => {
    expect(planToRows([])).toBeNull()
    expect(planFromRows(null)).toEqual([])
  })

  it('uses the database field names', () => {
    expect(planToRows([plan[0]])).toEqual([{ exercise_id: 'squat', target_sets: 4, target_reps: 5 }])
  })

  it('drops anything malformed instead of trusting it', () => {
    expect(planFromRows({ exercise_id: 'x' })).toEqual([])
    expect(planFromRows('nope')).toEqual([])
    const mixed = [
      { exercise_id: 'ok', target_sets: 3, target_reps: 8 },
      { exercise_id: 'no-sets', target_reps: 8 },
      { exercise_id: 'zero', target_sets: 0, target_reps: 8 },
      { exercise_id: 'float', target_sets: 2.5, target_reps: 8 },
      { exercise_id: 7, target_sets: 3, target_reps: 8 },
      null,
      'text',
    ]
    expect(planFromRows(mixed)).toEqual([{ exerciseId: 'ok', targetSets: 3, targetReps: 8 }])
  })

  it('keeps only the first of a repeated exercise', () => {
    const rows = [
      { exercise_id: 'a', target_sets: 3, target_reps: 8 },
      { exercise_id: 'a', target_sets: 5, target_reps: 5 },
    ]
    expect(planFromRows(rows)).toEqual([{ exerciseId: 'a', targetSets: 3, targetReps: 8 }])
  })
})

describe('addToPlan', () => {
  it('appends with the default target', () => {
    expect(addToPlan(plan, 'curl').at(-1)).toEqual({ exerciseId: 'curl', ...DEFAULT_TARGET })
    expect(addToPlan([], 'curl')).toHaveLength(1)
  })

  it('ignores an exercise that is already there', () => {
    expect(addToPlan(plan, 'bench')).toBe(plan)
  })

  it('does not change the original', () => {
    addToPlan(plan, 'curl')
    expect(plan).toHaveLength(3)
  })
})

describe('removeFromPlan', () => {
  it('removes just that exercise', () => {
    expect(removeFromPlan(plan, 'bench').map((p) => p.exerciseId)).toEqual(['squat', 'row'])
    expect(removeFromPlan(plan, 'unknown')).toEqual(plan)
  })
})

describe('moveInPlan', () => {
  const ids = (p: PlanItem[]) => p.map((i) => i.exerciseId)

  it('swaps with the neighbour', () => {
    expect(ids(moveInPlan(plan, 'bench', -1))).toEqual(['bench', 'squat', 'row'])
    expect(ids(moveInPlan(plan, 'bench', 1))).toEqual(['squat', 'row', 'bench'])
  })

  it('does nothing at the ends or for an unknown exercise', () => {
    expect(moveInPlan(plan, 'squat', -1)).toBe(plan)
    expect(moveInPlan(plan, 'row', 1)).toBe(plan)
    expect(moveInPlan(plan, 'unknown', 1)).toBe(plan)
  })
})

describe('setPlanTargets', () => {
  it('changes only what is given, for only that exercise', () => {
    const next = setPlanTargets(plan, 'bench', { targetReps: 12 })
    expect(next[1]).toEqual({ exerciseId: 'bench', targetSets: 3, targetReps: 12 })
    expect(next[0]).toEqual(plan[0])
    expect(setPlanTargets(plan, 'bench', { targetSets: undefined })[1]).toEqual(plan[1])
  })
})

describe('moveWithinGroup', () => {
  const mixed: PlanItem[] = [
    { exerciseId: 'bench', targetSets: 3, targetReps: 8 },
    { exerciseId: 'run', targetSets: 1, targetReps: 1, targetSeconds: 1800 },
    { exerciseId: 'row', targetSets: 3, targetReps: 10 },
    { exerciseId: 'swim', targetSets: 1, targetReps: 1, targetSeconds: 900 },
  ]
  const group = (p: PlanItem) => (p.targetSeconds ? 'cardio' : 'strength')
  const ids = (p: PlanItem[]) => p.map((i) => i.exerciseId)

  it('skips over items in other groups', () => {
    expect(ids(moveWithinGroup(mixed, 'row', -1, group))).toEqual(['row', 'run', 'bench', 'swim'])
    expect(ids(moveWithinGroup(mixed, 'run', 1, group))).toEqual(['bench', 'swim', 'row', 'run'])
  })

  it('does nothing at the edge of a group', () => {
    expect(moveWithinGroup(mixed, 'bench', -1, group)).toBe(mixed)
    expect(moveWithinGroup(mixed, 'row', 1, group)).toBe(mixed)
    expect(moveWithinGroup(mixed, 'nope', 1, group)).toBe(mixed)
  })
})
