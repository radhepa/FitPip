import { describe, expect, it } from 'vitest'
import type { BegunSession, Exercise, SetRow, TemplateWithItems, WeekPlanItem } from '../types/db'
import {
  categoryName,
  combinedName,
  combinedPlan,
  completedEntryIds,
  dayTargets,
  entriesForDay,
  entryCategories,
  entryMinutes,
  entryName,
  entryPlan,
  moveWithinDay,
  nextPosition,
  planForDay,
  rowsToAdd,
  WEEK_ORDER,
  withPositions,
} from './weekPlan'

const ex = (id: string, name: string, category: Exercise['category'], tracking: Exercise['tracking']): Exercise => ({
  id, user_id: 'u', name, category, tracking, primary_muscles: [], secondary_muscles: [], equipment: 'other',
  external_id: null, image_url: null, instructions: [], created_at: '', updated_at: '',
})
const BENCH = ex('bench', 'Bench Press', 'strength', 'reps')
const SWIM = ex('swim', 'Freestyle Swim', 'swim', 'distance')
const BAG = ex('bag', 'Heavy Bag', 'combat', 'time')
const RUN = ex('run', 'Outdoor Run', 'cardio', 'distance')
const exercises = [BENCH, SWIM, BAG, RUN]
const byId = new Map(exercises.map((e) => [e.id, e]))

const push: TemplateWithItems = {
  template: { id: 'push', user_id: 'u', name: 'Push day', created_at: '', updated_at: '' },
  items: [
    { id: 'ti1', user_id: 'u', template_id: 'push', exercise_id: 'bench', position: 0, target_sets: 4, target_reps: 6, target_seconds: null, created_at: '', updated_at: '' },
    { id: 'ti2', user_id: 'u', template_id: 'push', exercise_id: 'run', position: 1, target_sets: 1, target_reps: 1, target_seconds: 600, created_at: '', updated_at: '' },
  ],
}
const lookup = { routines: [push], exercises }

let n = 0
const item = (weekday: number, position: number, target: { t?: string; e?: string; c?: Exercise['category'] }): WeekPlanItem => ({
  id: `w${++n}`, user_id: 'u', weekday, position, template_id: target.t ?? null, exercise_id: target.e ?? null, category: target.c ?? null,
  created_at: `2026-09-2${n % 10}`, updated_at: '',
})

// Monday: swim, heavy bag, stretch-less routine; Wednesday: run + push; the rest are rest days.
const mondaySwim = item(1, 0, { e: 'swim' })
const mondayBag = item(1, 1, { e: 'bag' })
const wedPush = item(3, 1, { t: 'push' })
const wedRun = item(3, 0, { e: 'run' })
const gone = item(5, 0, { e: 'deleted-exercise' })
const ITEMS = [mondayBag, wedPush, mondaySwim, wedRun, gone]

describe('WEEK_ORDER', () => {
  it('starts on Monday and covers every day once', () => {
    expect(WEEK_ORDER[0]).toBe(1)
    expect([...WEEK_ORDER].sort()).toEqual([0, 1, 2, 3, 4, 5, 6])
  })
})

describe('entriesForDay', () => {
  it('resolves a day in position order, mixing routines and activities', () => {
    const wed = entriesForDay(ITEMS, 3, lookup)
    expect(wed.map((e) => e.kind)).toEqual(['activity', 'routine'])
    expect(wed.map((e) => e.item.id)).toEqual([wedRun.id, wedPush.id])
  })

  it('drops items whose routine or activity no longer exists', () => {
    expect(entriesForDay(ITEMS, 5, lookup)).toEqual([])
  })
})

describe('planForDay', () => {
  it('lists every planned thing for the day', () => {
    const plan = planForDay(ITEMS, 1, lookup)
    expect(plan.kind).toBe('planned')
    if (plan.kind === 'planned') expect(plan.entries.map((e) => (e.kind === 'activity' ? e.exercise.name : ''))).toEqual(['Freestyle Swim', 'Heavy Bag'])
  })

  it('is a rest day when other days have plans', () => {
    expect(planForDay(ITEMS, 2, lookup)).toEqual({ kind: 'rest' })
  })

  it('is unplanned when nothing usable is planned anywhere', () => {
    expect(planForDay([], 1, lookup)).toEqual({ kind: 'unplanned' })
    expect(planForDay([gone], 5, lookup)).toEqual({ kind: 'unplanned' })
  })
})

describe('entry helpers', () => {
  const [run, routine] = entriesForDay(ITEMS, 3, lookup)

  it('gives a routine its template plan and an activity a default target', () => {
    expect(entryPlan(routine).map((p) => p.exerciseId)).toEqual(['bench', 'run'])
    expect(entryPlan(routine)[1].targetSeconds).toBe(600)
    expect(entryPlan(run)).toEqual([{ exerciseId: 'run', targetSets: 1, targetReps: 1, targetSeconds: 1800 }])
  })

  it('joins several entries into one workout, each exercise once', () => {
    const plan = combinedPlan([run, routine])
    expect(plan.map((p) => p.exerciseId)).toEqual(['run', 'bench'])
    expect(plan[0].targetSeconds).toBe(1800) // the first occurrence wins
    expect(combinedName([run, routine])).toBe('Outdoor Run + Push day')
    expect(combinedName([run, routine, run])).toBe('Outdoor Run + 2 more')
  })

  it('names the categories an entry trains, most common first', () => {
    expect(entryCategories(run, byId)).toEqual(['cardio'])
    expect(entryCategories(routine, byId).sort()).toEqual(['cardio', 'strength'])
  })

  it('estimates minutes in steps of five', () => {
    expect(entryMinutes(run, byId)).toBe(30)
    // 4 lifting sets (10 min) + a 10 minute run
    expect(entryMinutes(routine, byId)).toBe(20)
  })
})

describe('completedEntryIds', () => {
  const [swim, bag] = entriesForDay(ITEMS, 1, lookup)
  const [, routine] = entriesForDay(ITEMS, 3, lookup)
  const session = (id: string, over: Partial<BegunSession> = {}): BegunSession => ({
    id, user_id: 'u', name: null, started_at: '2026-09-21T08:00:00Z', ended_at: '2026-09-21T09:00:00Z', notes: null,
    template_id: null, plan: null, created_at: '', updated_at: '', ...over,
  })
  const set = (sessionId: string, exerciseId: string): SetRow => ({
    id: `${sessionId}-${exerciseId}`, user_id: 'u', session_id: sessionId, exercise_id: exerciseId, set_order: 0, reps: 0, weight: 0,
    rpe: null, duration_seconds: 900, distance_m: 800, created_at: '', updated_at: '',
  })

  it('marks an activity done when a finished workout logged it', () => {
    const done = completedEntryIds([swim, bag], [{ session: session('a'), sets: [set('a', 'swim')] }])
    expect([...done]).toEqual([swim.item.id])
  })

  it('marks a routine done when a workout from it finished', () => {
    const done = completedEntryIds([routine], [{ session: session('b', { template_id: 'push' }), sets: [] }])
    expect(done.has(routine.item.id)).toBe(true)
  })

  it('marks a routine done when its exercises were logged as part of a combined workout', () => {
    const done = completedEntryIds([routine], [{ session: session('d', { name: 'Outdoor Run + Push day' }), sets: [set('d', 'bench')] }])
    expect(done.has(routine.item.id)).toBe(true)
  })

  it('ignores workouts still in progress', () => {
    const done = completedEntryIds([swim], [{ session: session('c', { ended_at: null }), sets: [set('c', 'swim')] }])
    expect(done.size).toBe(0)
  })
})

describe('editing', () => {
  it('appends after the last position of that day only', () => {
    expect(nextPosition(ITEMS, 1)).toBe(2)
    expect(nextPosition(ITEMS, 2)).toBe(0)
  })

  it('adds new rows in order and skips what the day already has', () => {
    const rows = rowsToAdd(ITEMS, 1, [{ exerciseId: 'swim' }, { exerciseId: 'run' }, { templateId: 'push' }, { exerciseId: 'run' }])
    expect(rows).toEqual([
      { weekday: 1, position: 2, template_id: null, exercise_id: 'run', category: null },
      { weekday: 1, position: 3, template_id: 'push', exercise_id: null, category: null },
    ])
  })

  it('moves within a day and reports only the positions that change', () => {
    const updates = moveWithinDay(ITEMS, mondayBag.id, -1)
    expect(updates).toEqual([
      { id: mondayBag.id, position: 0 },
      { id: mondaySwim.id, position: 1 },
    ])
    const moved = withPositions(ITEMS, updates)
    expect(entriesForDay(moved, 1, lookup).map((e) => e.item.id)).toEqual([mondayBag.id, mondaySwim.id])
  })

  it('does not move past the ends of a day', () => {
    expect(moveWithinDay(ITEMS, mondaySwim.id, -1)).toEqual([])
    expect(moveWithinDay(ITEMS, mondayBag.id, 1)).toEqual([])
    expect(moveWithinDay(ITEMS, 'nope', 1)).toEqual([])
  })

  it('reads a day as targets to copy elsewhere', () => {
    expect(dayTargets(ITEMS, 3)).toEqual([{ exerciseId: 'run' }, { templateId: 'push' }])
    const copied = rowsToAdd(ITEMS, 6, dayTargets(ITEMS, 3))
    expect(copied.map((r) => [r.position, r.exercise_id ?? r.template_id])).toEqual([[0, 'run'], [1, 'push']])
  })
})

describe('planning by kind of workout', () => {
  const tuesdayCardio = item(2, 0, { c: 'cardio' })
  const tuesdayStretch = item(2, 1, { c: 'stretch' })
  const withKinds = [...ITEMS, tuesdayCardio, tuesdayStretch]
  const [cardio, stretch] = entriesForDay(withKinds, 2, lookup)

  it('shows a category as its own entry, in order', () => {
    expect(entriesForDay(withKinds, 2, lookup).map((e) => e.kind)).toEqual(['category', 'category'])
    expect(planForDay(withKinds, 2, lookup).kind).toBe('planned')
  })

  it('makes a day with only a kind of workout count as planned', () => {
    expect(planForDay([tuesdayCardio], 2, lookup).kind).toBe('planned')
    expect(planForDay([tuesdayCardio], 4, lookup)).toEqual({ kind: 'rest' })
  })

  it('ignores a category this app does not know', () => {
    const odd = { ...tuesdayCardio, category: 'crossfit' as never }
    expect(entriesForDay([odd], 2, lookup)).toEqual([])
  })

  it('names the kind and colours it by its category', () => {
    expect(categoryName('strength')).toBe('Weightlifting')
    expect([cardio, stretch].map(entryName)).toEqual(['Cardio', 'Stretching'])
    expect(entryCategories(cardio, byId)).toEqual(['cardio'])
  })

  it('starts empty (the exercises are picked when it starts) and has no time estimate', () => {
    expect(entryPlan(cardio)).toEqual([])
    expect(entryMinutes(cardio, byId)).toBe(0)
    expect(combinedPlan([cardio, stretch])).toEqual([])
    expect(combinedName([cardio, stretch])).toBe('Cardio + Stretching')
  })

  it('adds a category once per day and reads it back for copying', () => {
    expect(rowsToAdd(withKinds, 2, [{ category: 'cardio' }, { category: 'yoga' }, { category: 'yoga' }])).toEqual([
      { weekday: 2, position: 2, template_id: null, exercise_id: null, category: 'yoga' },
    ])
    expect(dayTargets(withKinds, 2)).toEqual([{ category: 'cardio' }, { category: 'stretch' }])
    expect(rowsToAdd(withKinds, 6, dayTargets(withKinds, 2)).map((r) => r.category)).toEqual(['cardio', 'stretch'])
  })

  it('is done once a finished workout today logged anything of that kind', () => {
    const session: BegunSession = {
      id: 'k', user_id: 'u', name: 'Cardio', started_at: '2026-09-22T08:00:00Z', ended_at: '2026-09-22T09:00:00Z', notes: null,
      template_id: null, plan: null, created_at: '', updated_at: '',
    }
    const logged: SetRow = {
      id: 'k1', user_id: 'u', session_id: 'k', exercise_id: 'run', set_order: 0, reps: 0, weight: 0,
      rpe: null, duration_seconds: 900, distance_m: 2000, created_at: '', updated_at: '',
    }
    const done = completedEntryIds([cardio, stretch], [{ session, sets: [logged] }], byId)
    expect([...done]).toEqual([cardio.item.id])
    // without the exercise lookup a kind can not be told apart, so nothing is marked done
    expect(completedEntryIds([cardio], [{ session, sets: [logged] }]).size).toBe(0)
  })
})
