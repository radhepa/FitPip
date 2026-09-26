// The app builds the request (src/lib/suggestionContext.ts) and the function validates it with zod.
// This test runs the app's real output through the function's schema, so the two can't drift apart.
import { describe, expect, it } from 'vitest'
import { buildSuggestionContext } from '../../../src/lib/suggestionContext'
import type { BegunSession, Exercise, SetRow, TemplateWithItems, WeekPlanItem } from '../../../src/types/db'
import { ContextSchema } from './index'

const exercise: Exercise = {
  id: 'bench',
  user_id: 'u',
  name: 'Barbell Bench Press',
  primary_muscles: ['chest'],
  secondary_muscles: ['triceps', 'front_delts'],
  equipment: 'barbell',
  category: 'strength',
  tracking: 'reps',
  external_id: null,
  image_url: null,
  instructions: [],
  created_at: '',
  updated_at: '',
}
const now = new Date(2026, 8, 21, 12, 0)
const started = new Date(2026, 8, 19, 18, 0).toISOString()
const session: BegunSession = { id: 's', user_id: 'u', name: 'Push', started_at: started, ended_at: started, notes: null, template_id: null, plan: null, created_at: started, updated_at: started }
const sets: SetRow[] = [1, 2, 3].map((i) => ({ id: `set${i}`, user_id: 'u', session_id: 's', exercise_id: 'bench', set_order: i, weight: 135, reps: 8, rpe: null, duration_seconds: null, distance_m: null, created_at: '', updated_at: '' }))
const template: TemplateWithItems = {
  template: { id: 't', user_id: 'u', name: 'Push A', created_at: '', updated_at: '' },
  items: [{ id: 'i', user_id: 'u', template_id: 't', exercise_id: 'bench', position: 0, target_sets: 4, target_reps: 6, target_seconds: null, created_at: '', updated_at: '' }],
}
const day: WeekPlanItem = { id: 'w', user_id: 'u', weekday: 1, position: 0, template_id: 't', exercise_id: null, category: null, created_at: '', updated_at: '' }

describe('request contract', () => {
  it.each([
    ['with a scheduled workout', { weekPlan: [day], templates: [template] }],
    ['on a rest day', { weekPlan: [{ ...day, weekday: 2 }], templates: [template] }],
    ['with no plan at all', { weekPlan: [], templates: [] }],
  ])('the app builds a request the function accepts (%s)', (_label, plan) => {
    const context = buildSuggestionContext({ exercises: [exercise], sessions: [session], sets, unit: 'kg', focus: 'upper body', now, ...plan })
    const result = ContextSchema.safeParse(context)
    expect(result.success, result.success ? '' : JSON.stringify(result.error.issues)).toBe(true)
  })

  it('accepts a brand-new user with no history', () => {
    const context = buildSuggestionContext({ exercises: [exercise], sessions: [], sets: [], weekPlan: [], templates: [], unit: 'lb', now })
    expect(ContextSchema.safeParse(context).success).toBe(true)
  })
})
