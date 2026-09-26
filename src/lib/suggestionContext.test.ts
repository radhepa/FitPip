import { describe, expect, it } from 'vitest'
import type { BegunSession, Exercise, SetRow, TemplateWithItems, WeekPlanItem } from '../types/db'
import { buildSuggestionContext } from './suggestionContext'

const now = new Date(2026, 8, 21, 12, 0) // Monday 21 Sep 2026

const exercise = (id: string, name: string, primary: Exercise['primary_muscles'], secondary: Exercise['secondary_muscles'] = []): Exercise => ({
  id,
  user_id: 'u',
  name,
  primary_muscles: primary,
  secondary_muscles: secondary,
  equipment: 'barbell',
  category: 'strength',
  tracking: 'reps',
  external_id: null,
  image_url: null,
  instructions: [],
  created_at: '',
  updated_at: '',
})

const EXERCISES = [
  exercise('bench', 'Barbell Bench Press', ['chest'], ['triceps']),
  exercise('squat', 'Barbell Full Squat', ['quads', 'glutes']),
  exercise('row', 'Barbell Bent Over Row', ['lats']),
]

const session = (id: string, daysAgo: number, over: Partial<BegunSession> = {}): BegunSession => {
  const started = new Date(2026, 8, 21 - daysAgo, 18, 0).toISOString()
  return { id, user_id: 'u', name: null, started_at: started, ended_at: new Date(new Date(started).getTime() + 3_000_000).toISOString(), notes: null, template_id: null, plan: null, created_at: started, updated_at: started, ...over }
}

let n = 0
const set = (session_id: string, exercise_id: string, weight: number, reps: number): SetRow => {
  n += 1
  return { id: `s${n}`, user_id: 'u', session_id, exercise_id, set_order: n, weight, reps, rpe: null, duration_seconds: null, distance_m: null, created_at: '', updated_at: '' }
}

const SESSIONS = [session('s-new', 1, { name: 'Legs' }), session('s-mid', 3), session('s-old', 20), session('s-live', 0, { ended_at: null })]
const SETS = [
  set('s-new', 'squat', 225, 5), set('s-new', 'squat', 225, 5), set('s-new', 'squat', 235, 3),
  set('s-mid', 'bench', 135, 8), set('s-mid', 'bench', 145, 6), set('s-mid', 'bench', 145, 6), set('s-mid', 'bench', 145, 5),
  set('s-old', 'row', 115, 10),
  set('s-live', 'bench', 150, 5),
]

const template: TemplateWithItems = {
  template: { id: 'tpl', user_id: 'u', name: 'Push A', created_at: '', updated_at: '' },
  items: [
    { id: 'i1', user_id: 'u', template_id: 'tpl', exercise_id: 'bench', position: 0, target_sets: 4, target_reps: 6, target_seconds: null, created_at: '', updated_at: '' },
    { id: 'i2', user_id: 'u', template_id: 'tpl', exercise_id: 'gone', position: 1, target_sets: 3, target_reps: 8, target_seconds: null, created_at: '', updated_at: '' },
  ],
}
const monday: WeekPlanItem = { id: 'w1', user_id: 'u', weekday: 1, position: 0, template_id: 'tpl', exercise_id: null, category: null, created_at: '', updated_at: '' }

const build = (over: Partial<Parameters<typeof buildSuggestionContext>[0]> = {}) =>
  buildSuggestionContext({ exercises: EXERCISES, sessions: SESSIONS, sets: SETS, weekPlan: [], templates: [], unit: 'lb', now, ...over })

describe('buildSuggestionContext', () => {
  it('describes today and the unit', () => {
    const ctx = build()
    expect(ctx).toMatchObject({ date: '2026-09-21', weekday: 'Monday', unit: 'lb' })
  })

  it('reports weekly volume: last 7 days and the 30 day weekly average', () => {
    const chest = build().volume.find((v) => v.muscle === 'chest')
    // 4 finished bench sets on day -3 plus 1 from the workout in progress today = 5
    expect(chest).toEqual({ muscle: 'chest', last7Days: 5, weeklyAvg30Days: round(5 / (30 / 7)) })
    const quads = build().volume.find((v) => v.muscle === 'quads')
    expect(quads?.last7Days).toBe(3)
    const lats = build().volume.find((v) => v.muscle === 'lats')
    expect(lats).toEqual({ muscle: 'lats', last7Days: 0, weeklyAvg30Days: round(1 / (30 / 7)) }) // only in the 30 day window
  })

  it('lists muscles with work only, most recent volume first', () => {
    const muscles = build().volume.map((v) => v.muscle)
    expect(muscles).not.toContain('calves')
    expect(muscles[0]).toBe('chest')
  })

  it('includes the last finished workouts newest first, with a top set per exercise', () => {
    const { recent } = build()
    expect(recent.map((r) => [r.daysAgo, r.name])).toEqual([[1, 'Legs'], [3, null], [20, null]])
    expect(recent[0].exercises).toEqual([{ name: 'Barbell Full Squat', sets: 3, top: '225 x 5' }])
    expect(recent[1].exercises[0]).toEqual({ name: 'Barbell Bench Press', sets: 4, top: '145 x 6' })
    expect(recent.some((r) => r.daysAgo === 0)).toBe(false) // the unfinished workout is not "recent history"
  })

  it("passes on today's scheduled template, skipping exercises that no longer exist", () => {
    const ctx = build({ weekPlan: [monday], templates: [template] })
    expect(ctx.today).toEqual({ kind: 'workout', name: 'Push A', exercises: [{ name: 'Barbell Bench Press', sets: 4, reps: 6 }] })
  })

  it('says rest, or that nothing is planned', () => {
    expect(build({ weekPlan: [{ ...monday, weekday: 2 }], templates: [template] }).today).toEqual({ kind: 'rest' })
    expect(build().today).toEqual({ kind: 'unplanned' })
  })

  it('trims the focus note and leaves it out when blank', () => {
    expect(build({ focus: '  legs, 45 minutes  ' }).focus).toBe('legs, 45 minutes')
    expect('focus' in build({ focus: '   ' })).toBe(false)
    expect(build({ focus: 'x'.repeat(500) }).focus).toHaveLength(200)
  })

  it('works for a brand-new user with no history', () => {
    const ctx = build({ sessions: [], sets: [] })
    expect(ctx.volume).toEqual([])
    expect(ctx.recent).toEqual([])
  })
})

function round(n: number) {
  return Math.round(n * 10) / 10
}
