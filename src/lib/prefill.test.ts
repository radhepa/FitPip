import { describe, expect, it } from 'vitest'
import type { SetRow } from '../types/db'
import { suggestNextSet } from './prefill'

const set = (weight: number, reps: number, order = 0): SetRow => ({
  id: `${weight}-${reps}-${order}`,
  user_id: 'u',
  session_id: 's',
  exercise_id: 'e',
  set_order: order,
  weight,
  reps,
  rpe: null,
  duration_seconds: null,
  distance_m: null,
  created_at: '',
  updated_at: '',
})

describe('suggestNextSet', () => {
  it('starts from the first set of last time, with the template target reps', () => {
    expect(suggestNextSet({ loggedSets: [], lastSessionSets: [set(185, 5), set(165, 8, 1)], targetReps: 6 })).toEqual({
      weight: 185,
      reps: 6,
    })
  })

  it('falls back to last time reps when there is no target', () => {
    expect(suggestNextSet({ loggedSets: [], lastSessionSets: [set(185, 5)], targetReps: null })).toEqual({
      weight: 185,
      reps: 5,
    })
  })

  it('carries the previous set of this workout forward', () => {
    expect(
      suggestNextSet({ loggedSets: [set(190, 5), set(190, 4, 1)], lastSessionSets: [set(185, 5)], targetReps: 6 }),
    ).toEqual({ weight: 190, reps: 4 })
  })

  it('leaves weight empty for an exercise that has never been done', () => {
    expect(suggestNextSet({ loggedSets: [], lastSessionSets: [], targetReps: 8 })).toEqual({ weight: null, reps: 8 })
    expect(suggestNextSet({ loggedSets: [], lastSessionSets: [], targetReps: null })).toEqual({ weight: null, reps: null })
  })
})
