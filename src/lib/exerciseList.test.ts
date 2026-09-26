import { describe, expect, it } from 'vitest'
import type { Exercise } from '../types/db'
import { withExercise } from './exerciseList'

const make = (id: string, name: string): Exercise => ({
  id,
  user_id: 'u',
  name,
  primary_muscles: ['chest'],
  secondary_muscles: [],
  equipment: 'barbell',
  category: 'strength',
  tracking: 'reps',
  external_id: null,
  image_url: null,
  instructions: [],
  created_at: '',
  updated_at: '',
})

describe('withExercise', () => {
  it('inserts in name order', () => {
    const list = [make('1', 'Bench'), make('3', 'Squat')]
    expect(withExercise(list, make('2', 'Curl')).map((e) => e.name)).toEqual(['Bench', 'Curl', 'Squat'])
  })

  it('replaces an exercise with the same id instead of duplicating it', () => {
    const list = [make('1', 'Bench'), make('2', 'Curl')]
    const result = withExercise(list, make('2', 'Curl Renamed'))
    expect(result).toHaveLength(2)
    expect(result.map((e) => e.name)).toEqual(['Bench', 'Curl Renamed'])
  })
})
