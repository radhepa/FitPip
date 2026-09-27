import { describe, expect, it } from 'vitest'
import type { Category, Exercise, PlanRow, SetRow, Tracking } from '../types/db'
import { planToRepeat } from './repeatWorkout'

const exercise = (id: string, tracking: Tracking = 'reps', category: Category = 'strength'): Exercise => ({
  id,
  user_id: 'u',
  name: id,
  primary_muscles: [],
  secondary_muscles: [],
  equipment: 'barbell',
  category,
  tracking,
  external_id: null,
  image_url: null,
  instructions: [],
  created_at: '',
  updated_at: '',
})

let n = 0
const set = (exercise_id: string, patch: Partial<SetRow> = {}): SetRow => {
  n += 1
  return {
    id: `s${n}`,
    user_id: 'u',
    session_id: 'sess',
    exercise_id,
    set_order: n,
    weight: 100,
    reps: 8,
    rpe: null,
    duration_seconds: null,
    distance_m: null,
    created_at: `2026-01-01T00:00:${String(n).padStart(2, '0')}Z`,
    updated_at: '',
    ...patch,
  }
}

const bank = new Map(
  [exercise('bench'), exercise('fly'), exercise('plank', 'time', 'stretch'), exercise('run', 'distance', 'cardio')].map((e) => [e.id, e]),
)

describe('planToRepeat', () => {
  it('keeps planned targets and drops notes', () => {
    const plan: PlanRow[] = [{ exercise_id: 'bench', target_sets: 4, target_reps: 6, note: 'shoulder tight' }]
    expect(planToRepeat({ plan }, [set('bench'), set('bench')], bank)).toEqual([{ exerciseId: 'bench', targetSets: 4, targetReps: 6 }])
  })

  it('works out a target from the sets of an unplanned exercise', () => {
    const sets = [set('fly', { reps: 12 }), set('fly', { reps: 10 }), set('fly', { reps: 10 })]
    expect(planToRepeat({ plan: null }, sets, bank)).toEqual([{ exerciseId: 'fly', targetSets: 3, targetReps: 10 }])
  })

  it('uses the usual length for timed and distance work', () => {
    const sets = [
      set('plank', { reps: 0, weight: 0, duration_seconds: 60 }),
      set('plank', { reps: 0, weight: 0, duration_seconds: 60 }),
      set('run', { reps: 0, weight: 0, duration_seconds: 1500, distance_m: 5000 }),
    ]
    expect(planToRepeat({ plan: null }, sets, bank)).toEqual([
      { exerciseId: 'plank', targetSets: 2, targetReps: 1, targetSeconds: 60 },
      { exerciseId: 'run', targetSets: 1, targetReps: 1, targetSeconds: 1500 },
    ])
  })

  it('leaves out skipped exercises and ones no longer in the bank, keeping the workout order', () => {
    const plan: PlanRow[] = [
      { exercise_id: 'fly', target_sets: 3, target_reps: 12 },
      { exercise_id: 'bench', target_sets: 5, target_reps: 5 },
    ]
    const sets = [set('gone'), set('bench'), set('fly')]
    expect(planToRepeat({ plan }, sets, bank).map((p) => p.exerciseId)).toEqual(['fly', 'bench'])
    expect(planToRepeat({ plan }, [set('bench')], bank).map((p) => p.exerciseId)).toEqual(['bench'])
  })

  it('repeats the plan of a workout with no sets', () => {
    const plan: PlanRow[] = [
      { exercise_id: 'bench', target_sets: 3, target_reps: 5 },
      { exercise_id: 'gone', target_sets: 3, target_reps: 5 },
    ]
    expect(planToRepeat({ plan }, [], bank)).toEqual([{ exerciseId: 'bench', targetSets: 3, targetReps: 5 }])
  })

  it('caps targets at the plan limits', () => {
    const sets = Array.from({ length: 25 }, () => set('fly', { reps: 150 }))
    expect(planToRepeat({ plan: null }, sets, bank)).toEqual([{ exerciseId: 'fly', targetSets: 20, targetReps: 100 }])
  })
})
