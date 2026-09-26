import { beforeEach, describe, expect, it, vi } from 'vitest'

const insert = vi.fn()
vi.mock('../lib/supabase', () => ({ supabase: { from: () => ({ insert: (rows: unknown) => ({ select: () => insert(rows) }) }) } }))

const { addWeekPlanItems } = await import('./weekPlan')

const row = (over: Record<string, unknown>) => ({ weekday: 1, position: 0, template_id: null, exercise_id: null, category: null, ...over })

describe('addWeekPlanItems', () => {
  beforeEach(() => insert.mockReset())

  it('leaves category out of routine and activity rows, so they still save before the category migration', async () => {
    insert.mockResolvedValue({ data: [], error: null })
    await addWeekPlanItems([row({ template_id: 't' }), row({ exercise_id: 'e', position: 1 })])
    const sent = insert.mock.calls[0][0] as Record<string, unknown>[]
    expect(sent.every((r) => !('category' in r))).toBe(true)
    expect(sent.map((r) => r.template_id ?? r.exercise_id)).toEqual(['t', 'e'])
  })

  it('sends the category for a kind-of-workout row', async () => {
    insert.mockResolvedValue({ data: [], error: null })
    await addWeekPlanItems([row({ category: 'cardio' })])
    expect(insert.mock.calls[0][0]).toMatchObject([{ weekday: 1, category: 'cardio' }])
  })

  it('says which migration to run when the database has no category column yet', async () => {
    insert.mockResolvedValue({ data: null, error: { code: 'PGRST204', message: "Could not find the 'category' column of 'week_plan_items' in the schema cache" } })
    await expect(addWeekPlanItems([row({ category: 'yoga' })])).rejects.toThrow(/20260926000200_week_plan_categories\.sql/)
  })

  it('does not hide other errors', async () => {
    insert.mockResolvedValue({ data: null, error: { code: '23505', message: 'duplicate key' } })
    await expect(addWeekPlanItems([row({ category: 'yoga' })])).rejects.toThrow('duplicate key')
  })
})
