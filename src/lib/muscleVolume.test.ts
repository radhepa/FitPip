import { describe, expect, it } from 'vitest'
import type { SetRow } from '../types/db'
import {
  computeVolume,
  groupSetsByWorkout,
  levelFor,
  musclesWithWork,
  rangeStart,
  regionLevels,
  setsInRange,
  toModelData,
  weeklyVolume,
  workFromPlan,
  workFromSets,
  workFromTemplate,
  type WorkExercise,
} from './muscleVolume'

const bench: WorkExercise = { id: 'bench', name: 'Bench Press', primary_muscles: ['chest'], secondary_muscles: ['front_delts', 'triceps'] }
const row: WorkExercise = { id: 'row', name: 'Row', primary_muscles: ['lats', 'upper_back'], secondary_muscles: ['biceps'] }
const raise: WorkExercise = { id: 'raise', name: 'Lateral Raise', primary_muscles: ['side_delts'], secondary_muscles: [] }
const byId = (...list: WorkExercise[]) => new Map(list.map((e) => [e.id, e]))

let n = 0
const set = (exercise_id: string, session_id: string): SetRow => {
  n += 1
  return { id: `s${n}`, user_id: 'u', session_id, exercise_id, set_order: n, weight: 100, reps: 5, rpe: null, duration_seconds: null, distance_m: null, created_at: '', updated_at: '' }
}
const sets = (exercise_id: string, session_id: string, count: number) => Array.from({ length: count }, () => set(exercise_id, session_id))

describe('levelFor', () => {
  it('follows the thresholds: 1-4 -> 1, 5-9 -> 2, 10-14 -> 3, 15+ -> 4', () => {
    expect(levelFor(0)).toBe(0)
    expect(levelFor(0.5)).toBe(0)
    expect(levelFor(0.99)).toBe(0)
    expect(levelFor(1)).toBe(1)
    expect(levelFor(4)).toBe(1)
    expect(levelFor(4.5)).toBe(1)
    expect(levelFor(5)).toBe(2)
    expect(levelFor(9.5)).toBe(2)
    expect(levelFor(10)).toBe(3)
    expect(levelFor(14.5)).toBe(3)
    expect(levelFor(15)).toBe(4)
    expect(levelFor(60)).toBe(4)
  })
})

describe('computeVolume', () => {
  it('counts 1 per set for a primary muscle and 0.5 for a secondary', () => {
    const v = computeVolume([{ exercise: bench, setCount: 4 }])
    expect(v.chest.weighted).toBe(4)
    expect(v.front_delts.weighted).toBe(2)
    expect(v.triceps.weighted).toBe(2)
    expect(v.quads.weighted).toBe(0)
  })

  it('adds up across exercises and lists the biggest contributor first', () => {
    const v = computeVolume([
      { exercise: bench, setCount: 3 },
      { exercise: row, setCount: 4 },
      { exercise: raise, setCount: 5 },
    ])
    expect(v.biceps.weighted).toBe(2) // secondary on the row only
    expect(v.front_delts.weighted).toBe(1.5)
    expect(v.lats.weighted).toBe(4)
    expect(v.upper_back.weighted).toBe(4)
    expect(v.side_delts.contributions.map((c) => [c.exercise.id, c.role, c.weighted])).toEqual([['raise', 'primary', 5]])
  })

  it('never double counts a muscle listed as both primary and secondary', () => {
    const odd: WorkExercise = { id: 'x', name: 'X', primary_muscles: ['chest'], secondary_muscles: ['chest', 'triceps'] }
    const v = computeVolume([{ exercise: odd, setCount: 2 }])
    expect(v.chest.weighted).toBe(2)
    expect(v.chest.contributions).toHaveLength(1)
    expect(v.triceps.weighted).toBe(1)
  })

  it('ignores work with no sets', () => {
    expect(computeVolume([{ exercise: bench, setCount: 0 }]).chest.weighted).toBe(0)
  })

  it('divides by the number of weeks for perWeek', () => {
    const v = computeVolume([{ exercise: bench, setCount: 12 }], 30 / 7)
    expect(v.chest.weighted).toBe(12)
    expect(v.chest.perWeek).toBeCloseTo(2.8, 5)
  })
})

describe('rangeStart / setsInRange', () => {
  const now = new Date(2026, 8, 21, 15, 30) // Mon 21 Sep 2026, 15:30 local

  it('starts 7 days at local midnight six days back (today counts as one of the seven)', () => {
    expect(rangeStart(7, now)).toEqual(new Date(2026, 8, 15, 0, 0, 0, 0))
    expect(rangeStart(30, now)).toEqual(new Date(2026, 7, 23, 0, 0, 0, 0))
  })

  it('includes sessions from the first day and excludes the day before', () => {
    const sessions = [
      { id: 'edge-in', started_at: new Date(2026, 8, 15, 0, 5).toISOString() },
      { id: 'edge-out', started_at: new Date(2026, 8, 14, 23, 55).toISOString() },
    ]
    const all = [...sets('bench', 'edge-in', 2), ...sets('bench', 'edge-out', 3)]
    expect(setsInRange(all, sessions, 7, now)).toHaveLength(2)
    expect(setsInRange(all, sessions, 30, now)).toHaveLength(5)
  })
})

describe('weeklyVolume', () => {
  const now = new Date(2026, 8, 21, 12, 0)
  const sessions = [
    { id: 'a', started_at: new Date(2026, 8, 20, 18, 0).toISOString() },
    { id: 'b', started_at: new Date(2026, 8, 10, 18, 0).toISOString() },
    { id: 'c', started_at: new Date(2026, 8, 1, 18, 0).toISOString() },
  ]
  const all = [...sets('bench', 'a', 4), ...sets('bench', 'b', 4), ...sets('bench', 'c', 4), ...sets('gone', 'a', 9)]

  it('7 days only sees this week; sets of unknown exercises are skipped', () => {
    const v = weeklyVolume({ sessions, sets: all, exercises: [bench], days: 7, now })
    expect(v.chest.weighted).toBe(4)
    expect(v.chest.perWeek).toBe(4)
  })

  it('30 days sees everything and averages it to a week', () => {
    const v = weeklyVolume({ sessions, sets: all, exercises: [bench], days: 30, now })
    expect(v.chest.weighted).toBe(12)
    expect(v.chest.perWeek).toBeCloseTo(12 / (30 / 7), 5)
    expect(levelFor(v.chest.perWeek)).toBe(1) // 2.8 sets a week
  })
})

describe('workFromSets / workFromTemplate', () => {
  it('groups sets per exercise and skips unknown exercises', () => {
    const work = workFromSets([...sets('bench', 's', 3), ...sets('row', 's', 2), ...sets('ghost', 's', 1)], byId(bench, row))
    expect(work.map((w) => [w.exercise.id, w.setCount, w.sets?.length])).toEqual([
      ['bench', 3, 3],
      ['row', 2, 2],
    ])
  })

  it('turns template targets into planned sets', () => {
    const items = [
      { id: 'i1', user_id: 'u', template_id: 't', exercise_id: 'bench', position: 0, target_sets: 4, target_reps: 6, target_seconds: null, created_at: '', updated_at: '' },
      { id: 'i2', user_id: 'u', template_id: 't', exercise_id: 'ghost', position: 1, target_sets: 3, target_reps: 8, target_seconds: null, created_at: '', updated_at: '' },
    ]
    expect(workFromTemplate(items, byId(bench)).map((w) => [w.exercise.id, w.setCount])).toEqual([['bench', 4]])
  })
})

describe('activities that are not lifting', () => {
  const stretch: WorkExercise = { id: 'stretch', name: 'Hamstring Stretch', primary_muscles: ['hamstrings'], secondary_muscles: [], tracking: 'time' }
  const run: WorkExercise = { id: 'run', name: 'Run', primary_muscles: ['quads'], secondary_muscles: [], tracking: 'distance' }

  it('leaves stretches and cardio out of the muscle map', () => {
    const work = workFromSets([...sets('bench', 's', 2), ...sets('stretch', 's', 3), ...sets('run', 's', 1)], byId(bench, stretch, run))
    expect(work.map((w) => w.exercise.id)).toEqual(['bench'])
    expect(workFromPlan([{ exerciseId: 'stretch', targetSets: 2 }, { exerciseId: 'bench', targetSets: 3 }], byId(bench, stretch)).map((w) => w.exercise.id)).toEqual(['bench'])
  })
})

describe('workFromPlan', () => {
  it('turns a plan into planned sets and skips unknown exercises', () => {
    const work = workFromPlan([{ exerciseId: 'bench', targetSets: 4 }, { exerciseId: 'ghost', targetSets: 3 }], byId(bench))
    expect(work.map((w) => [w.exercise.id, w.setCount])).toEqual([['bench', 4]])
  })
})

describe('regionLevels / toModelData / musclesWithWork', () => {
  it('lights side delts on both the front and the back view', () => {
    const levels = regionLevels(computeVolume([{ exercise: raise, setCount: 6 }]))
    expect(levels['front-deltoids']).toBe(2)
    expect(levels['back-deltoids']).toBe(2)
  })

  it('takes the highest of the muscles feeding a region instead of adding them', () => {
    // lats 12 sets (level 3), upper back 5 sets from another exercise (still one shared region)
    const upperBackOnly: WorkExercise = { id: 'face', name: 'Face Pull', primary_muscles: ['upper_back'], secondary_muscles: [] }
    const levels = regionLevels(computeVolume([{ exercise: row, setCount: 5 }, { exercise: upperBackOnly, setCount: 7 }]))
    // row: lats 5, upper_back 5; face pull adds 7 upper_back -> upper_back 12 (3), lats 5 (2)
    expect(levels['upper-back']).toBe(3)
  })

  it('lights both soleus regions with the calves', () => {
    const calves: WorkExercise = { id: 'c', name: 'Calf Raise', primary_muscles: ['calves'], secondary_muscles: [] }
    const levels = regionLevels(computeVolume([{ exercise: calves, setCount: 10 }]))
    expect([levels.calves, levels['left-soleus'], levels['right-soleus']]).toEqual([3, 3, 3])
  })

  it('leaves regions with under one weekly set unlit', () => {
    const levels = regionLevels(computeVolume([{ exercise: { ...bench, secondary_muscles: ['abs'] }, setCount: 1 }]))
    expect(levels.abs).toBeUndefined() // 0.5 sets
    expect(levels.chest).toBe(1)
  })

  it('builds library data with the level as frequency', () => {
    expect(toModelData({ chest: 3, biceps: 1 })).toEqual([
      { name: 'chest', muscles: ['chest'], frequency: 3 },
      { name: 'biceps', muscles: ['biceps'], frequency: 1 },
    ])
  })

  it('lists worked muscles, biggest weekly volume first', () => {
    const v = computeVolume([{ exercise: bench, setCount: 4 }, { exercise: raise, setCount: 10 }])
    expect(musclesWithWork(v).slice(0, 3)).toEqual(['side_delts', 'chest', 'front_delts'])
  })
})

describe('groupSetsByWorkout', () => {
  it('splits sets by workout, newest first, and keeps undated ones at the end', () => {
    const all = [...sets('bench', 'old', 2), ...sets('bench', 'new', 3), ...sets('bench', 'mystery', 1)]
    const dates = new Map([
      ['old', '2026-09-01T10:00:00Z'],
      ['new', '2026-09-20T10:00:00Z'],
    ])
    const groups = groupSetsByWorkout(all, dates)
    expect(groups.map((g) => [g.sessionId, g.sets.length])).toEqual([
      ['new', 3],
      ['old', 2],
      ['mystery', 1],
    ])
  })
})
