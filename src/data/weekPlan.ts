import { supabase } from '../lib/supabase'
import type { WeekPlanItem } from '../types/db'
import { assertAccount, isGuestMode } from './guest'
import { assertOk, unwrap } from './unwrap'

export type NewWeekPlanRow = Pick<WeekPlanItem, 'weekday' | 'position' | 'template_id' | 'exercise_id' | 'category'>

/** Every planned item for the week. A weekday with none is a rest day. */
export async function listWeekPlan(): Promise<WeekPlanItem[]> {
  if (isGuestMode()) return []
  return unwrap<WeekPlanItem[]>(await supabase.from('week_plan_items').select('*').order('weekday').order('position'))
}

/** Adds routines, activities and/or categories to days. */
export async function addWeekPlanItems(rows: NewWeekPlanRow[]): Promise<WeekPlanItem[]> {
  assertAccount('The weekly plan')
  if (rows.length === 0) return []
  // `category` is only sent when it is set, so routines and activities still save before the
  // 20260926000200 migration has been run.
  const payload = rows.map(({ category, ...row }) => ({ id: crypto.randomUUID(), ...row, ...(category ? { category } : {}) }))
  const res = await supabase.from('week_plan_items').insert(payload).select()
  if (res.error && rows.some((r) => r.category) && /category/i.test(res.error.message)) {
    throw new Error('Planning by kind of workout needs a database update. Run supabase/migrations/20260926000200_week_plan_categories.sql in the Supabase SQL Editor.')
  }
  return unwrap<WeekPlanItem[]>(res)
}

export async function removeWeekPlanItem(id: string): Promise<void> {
  assertAccount('The weekly plan')
  assertOk(await supabase.from('week_plan_items').delete().eq('id', id))
}

/** Clears a whole day (makes it a rest day). */
export async function clearWeekday(weekday: number): Promise<void> {
  assertAccount('The weekly plan')
  assertOk(await supabase.from('week_plan_items').delete().eq('weekday', weekday))
}

/** Writes new positions after a reorder. */
export async function saveWeekPlanOrder(updates: { id: string; position: number }[]): Promise<void> {
  assertAccount('The weekly plan')
  const results = await Promise.all(updates.map((u) => supabase.from('week_plan_items').update({ position: u.position }).eq('id', u.id)))
  results.forEach(assertOk)
}
