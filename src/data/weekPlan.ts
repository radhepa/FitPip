import type { WeekPlanItem } from '../types/db'
import { duplicateError, invalidError, newId, nowIso, ownerId, putRow, removeRow, rowsOf, writeTx } from './local/store'

export type NewWeekPlanRow = Pick<WeekPlanItem, 'weekday' | 'position' | 'template_id' | 'exercise_id' | 'category'>

const byDayThenPosition = (a: WeekPlanItem, b: WeekPlanItem) => a.weekday - b.weekday || a.position - b.position

/** Every planned item for the week. A weekday with none is a rest day. */
export async function listWeekPlan(): Promise<WeekPlanItem[]> {
  return (await rowsOf('week_plan_items').toArray()).sort(byDayThenPosition)
}

/** What a plan entry points at: exactly one of a routine, an activity or a kind of workout. */
const targetOf = (row: Pick<WeekPlanItem, 'template_id' | 'exercise_id' | 'category'>) => row.template_id ?? row.exercise_id ?? row.category

/** Adds routines, activities and/or categories to days. */
export async function addWeekPlanItems(rows: NewWeekPlanRow[]): Promise<WeekPlanItem[]> {
  if (rows.length === 0) return []
  return writeTx(async () => {
    const existing = await rowsOf('week_plan_items').toArray()
    const now = nowIso()
    const added: WeekPlanItem[] = []
    for (const row of rows) {
      const targets = [row.template_id, row.exercise_id, row.category].filter((t) => t !== null && t !== undefined)
      if (targets.length !== 1) throw invalidError('Pick a routine, an activity or a kind of workout.')
      if (!Number.isInteger(row.weekday) || row.weekday < 0 || row.weekday > 6) throw invalidError('Pick a day of the week.')
      if (!Number.isInteger(row.position) || row.position < 0) throw invalidError('That position is not valid.')
      // The same routine, activity or kind of workout only once per day.
      if ([...existing, ...added].some((item) => item.weekday === row.weekday && targetOf(item) === targetOf(row))) throw duplicateError('plan entry')
      added.push({ id: newId(), user_id: ownerId(), ...row, created_at: now, updated_at: now })
    }
    for (const item of added) await putRow('week_plan_items', item, { isNew: true })
    return added
  })
}

export async function removeWeekPlanItem(id: string): Promise<void> {
  await writeTx(() => removeRow('week_plan_items', id))
}

/** Clears a whole day (makes it a rest day). */
export async function clearWeekday(weekday: number): Promise<void> {
  await writeTx(async () => {
    const day = await rowsOf('week_plan_items').where('weekday').equals(weekday).primaryKeys()
    for (const id of day as string[]) await removeRow('week_plan_items', id)
  })
}

/** Writes new positions after a reorder. */
export async function saveWeekPlanOrder(updates: { id: string; position: number }[]): Promise<void> {
  await writeTx(async () => {
    for (const { id, position } of updates) {
      if (!Number.isInteger(position) || position < 0) throw invalidError('That position is not valid.')
      const existing = await rowsOf('week_plan_items').get(id)
      if (existing) await putRow('week_plan_items', { ...existing, position, updated_at: nowIso() }, { isNew: false })
    }
  })
}
