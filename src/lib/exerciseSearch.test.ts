import { describe, expect, it } from 'vitest'
import type { Exercise } from '../types/db'
import { exerciseSubtitle, matchesQuery } from './exerciseSearch'

const bench: Exercise = {
  id: '1',
  user_id: 'u',
  name: 'Barbell Bench Press',
  primary_muscles: ['chest'],
  secondary_muscles: ['front_delts', 'triceps'],
  equipment: 'barbell',
  category: 'strength',
  tracking: 'reps',
  external_id: null,
  image_url: null,
  instructions: [],
  created_at: '',
  updated_at: '',
}

describe('matchesQuery', () => {
  it('matches everything for an empty query', () => {
    expect(matchesQuery(bench, '')).toBe(true)
    expect(matchesQuery(bench, '   ')).toBe(true)
  })

  it('matches on name, muscles and equipment, case-insensitively', () => {
    expect(matchesQuery(bench, 'bench')).toBe(true)
    expect(matchesQuery(bench, 'CHEST')).toBe(true)
    expect(matchesQuery(bench, 'front delts')).toBe(true)
    expect(matchesQuery(bench, 'barbell triceps')).toBe(true)
  })

  it('requires every word to match', () => {
    expect(matchesQuery(bench, 'bench dumbbell')).toBe(false)
    expect(matchesQuery(bench, 'squat')).toBe(false)
  })
})

describe('exerciseSubtitle', () => {
  it('lists primary muscles and equipment', () => {
    expect(exerciseSubtitle(bench)).toBe('Chest · Barbell')
    expect(exerciseSubtitle({ ...bench, primary_muscles: [], equipment: 'smith_machine' })).toBe('Smith machine')
  })
})
