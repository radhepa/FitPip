import { describe, expect, it } from 'vitest'
import type { TemplateExercise } from '../types/db'
import { moveItem, nextPosition } from './templateOrder'

const item = (id: string, position: number): TemplateExercise => ({
  id,
  user_id: 'u',
  template_id: 't',
  exercise_id: id,
  position,
  target_sets: 3,
  target_reps: 8,
  target_seconds: null,
  created_at: '',
  updated_at: '',
})

describe('nextPosition', () => {
  it('appends after the highest position', () => {
    expect(nextPosition([])).toBe(0)
    expect(nextPosition([item('a', 0), item('b', 4)])).toBe(5)
  })
})

describe('moveItem', () => {
  const items = [item('a', 0), item('b', 1), item('c', 2)]

  it('swaps with the neighbour and returns only changed rows', () => {
    expect(moveItem(items, 'b', -1)).toEqual([
      { id: 'b', position: 0 },
      { id: 'a', position: 1 },
    ])
    expect(moveItem(items, 'b', 1)).toEqual([
      { id: 'c', position: 1 },
      { id: 'b', position: 2 },
    ])
  })

  it('does nothing at the ends or for an unknown id', () => {
    expect(moveItem(items, 'a', -1)).toEqual([])
    expect(moveItem(items, 'c', 1)).toEqual([])
    expect(moveItem(items, 'zzz', 1)).toEqual([])
  })

  it('renumbers gaps left by removed exercises', () => {
    const gappy = [item('a', 0), item('b', 5), item('c', 9)]
    expect(moveItem(gappy, 'c', -1)).toEqual([
      { id: 'c', position: 1 },
      { id: 'b', position: 2 },
    ])
  })
})
