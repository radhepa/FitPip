import { describe, expect, it } from 'vitest'
import { addToPlan, DEFAULT_TARGET, MAX_NOTE_LENGTH, moveInPlan, moveWithinGroup, planFromRows, planToRows, removeFromPlan, setPlanNote, setPlanTargets } from './sessionPlan'
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

describe('exercise notes', () => {
  const item = { exerciseId: 'a', targetSets: 3, targetReps: 10 }

  it('survive the round trip to the stored form', () => {
    const rows = planToRows([{ ...item, note: 'seat at 4' }, { exerciseId: 'b', targetSets: 3, targetReps: 8 }])
    expect(rows?.[0]).toMatchObject({ exercise_id: 'a', note: 'seat at 4' })
    expect(rows?.[1]).not.toHaveProperty('note')
    expect(planFromRows(rows)).toEqual([{ ...item, note: 'seat at 4' }, { exerciseId: 'b', targetSets: 3, targetReps: 8 }])
  })

  it('are trimmed, capped and ignored when blank or not text', () => {
    const rows = [
      { exercise_id: 'a', target_sets: 3, target_reps: 10, note: '   ' },
      { exercise_id: 'b', target_sets: 3, target_reps: 10, note: `  ${'x'.repeat(900)}  ` },
      { exercise_id: 'c', target_sets: 3, target_reps: 10, note: 42 },
    ]
    const plan = planFromRows(rows)
    expect(plan.map((p) => p.exerciseId)).toEqual(['a', 'b'])
    expect(plan[0]).not.toHaveProperty('note')
    expect(plan[1].note).toHaveLength(MAX_NOTE_LENGTH)
  })

  it('setPlanNote sets, replaces and clears a note without touching the rest', () => {
    const plan = [item, { exerciseId: 'b', targetSets: 2, targetReps: 5 }]
    const noted = setPlanNote(plan, 'a', '  tight left shoulder ')
    expect(noted[0]).toEqual({ ...item, note: 'tight left shoulder' })
    expect(noted[1]).toBe(plan[1])
    expect(setPlanNote(noted, 'a', 'better today')[0].note).toBe('better today')
    expect(setPlanNote(noted, 'a', '   ')[0]).toEqual(item)
    expect(plan[0]).toEqual(item) // the original is untouched
  })

  it('setPlanNote adds an exercise that was not in the plan, but never for an empty note', () => {
    expect(setPlanNote([], 'z', 'grip wide', { targetSets: 4, targetReps: 6, targetSeconds: null })).toEqual([{ exerciseId: 'z', targetSets: 4, targetReps: 6, note: 'grip wide' }])
    expect(setPlanNote([], 'z', '  ')).toEqual([])
  })
})

