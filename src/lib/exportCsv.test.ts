import { describe, expect, it } from 'vitest'
import type { BegunSession, BodyWeight, Exercise, SetRow } from '../types/db'
import { csvField, weighInsCsv, workoutsCsv } from './exportCsv'

const exercise = (id: string, name: string, tracking: Exercise['tracking'] = 'reps', category: Exercise['category'] = 'strength') =>
  ({ id, name, tracking, category }) as Exercise
const session = (id: string, started: Date, name: string | null = null) =>
  ({ id, name, started_at: started.toISOString(), ended_at: started.toISOString() }) as BegunSession
const set = (id: string, sessionId: string, exerciseId: string, order: number, over: Partial<SetRow> = {}) =>
  ({ id, session_id: sessionId, exercise_id: exerciseId, set_order: order, weight: 100, reps: 5, rpe: null, duration_seconds: null, distance_m: null, created_at: '2026-09-01T00:00:00Z', ...over }) as SetRow

describe('csvField', () => {
  it('quotes commas, quotes and line breaks', () => {
    expect(csvField('Push, heavy')).toBe('"Push, heavy"')
    expect(csvField('The "big" one')).toBe('"The ""big"" one"')
    expect(csvField('two\nlines')).toBe('"two\nlines"')
    expect(csvField(42.5)).toBe('42.5')
    expect(csvField(null)).toBe('')
  })

  it('keeps typed text from running as a spreadsheet formula', () => {
    expect(csvField('=SUM(A1)')).toBe("'=SUM(A1)")
    expect(csvField('+1 set')).toBe("'+1 set")
    expect(csvField(-3)).toBe('-3')
  })
})

describe('workoutsCsv', () => {
  it('lists every set, oldest workout first, numbered per exercise', () => {
    const text = workoutsCsv({
      unit: 'lb',
      exercises: [exercise('b', 'Bench Press'), exercise('r', 'Run', 'distance', 'cardio')],
      sessions: [session('s2', new Date(2026, 8, 20, 18, 5), 'Push'), session('s1', new Date(2026, 8, 18, 7, 30))],
      sets: [
        set('x', 's2', 'b', 1, { weight: 135, reps: 8, rpe: 8 }),
        set('y', 's2', 'b', 0, { weight: 125, reps: 10 }),
        set('z', 's1', 'r', 0, { weight: 0, reps: 0, duration_seconds: 1800, distance_m: 5000 }),
      ],
    })
    expect(text.split('\r\n')).toEqual([
      'Date,Start,Workout,Exercise,Kind,Set,Weight (lb),Reps,RPE,Seconds,Distance (m)',
      '2026-09-18,07:30,Workout,Run,cardio,1,,,,1800,5000',
      '2026-09-20,18:05,Push,Bench Press,strength,1,125,10,,,',
      '2026-09-20,18:05,Push,Bench Press,strength,2,135,8,8,,',
      '',
    ])
  })
})

describe('weighInsCsv', () => {
  it('lists weigh-ins oldest first in their own unit', () => {
    const weights = [
      { measured_on: '2026-09-21', weight: 81.2, unit: 'kg', note: null },
      { measured_on: '2026-09-20', weight: 180.4, unit: 'lb', note: 'after, run' },
    ] as BodyWeight[]
    expect(weighInsCsv(weights)).toBe('Date,Weight,Unit,Note\r\n2026-09-20,180.4,lb,"after, run"\r\n2026-09-21,81.2,kg,\r\n')
  })
})
