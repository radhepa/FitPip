import { useState } from 'react'
import { addWeekPlanItems, listWeekPlan, removeWeekPlanItem, saveWeekPlanOrder } from '../data/weekPlan'
import { errorMessage } from '../data/unwrap'
import { dayTargets, moveWithinDay, rowsToAdd, withPositions, type NewPlanTarget } from '../lib/weekPlan'
import { useAsync } from './useAsync'

/** The weekly plan and every change you can make to it (optimistic where it is safe). */
export function useWeekPlan() {
  const items = useAsync(listWeekPlan, [])
  const [error, setError] = useState<string | null>(null)
  const current = () => items.data ?? []

  async function add(weekday: number, targets: NewPlanTarget[]) {
    setError(null)
    const inserted = await addWeekPlanItems(rowsToAdd(current(), weekday, targets))
    items.setData((prev) => [...(prev ?? []), ...inserted])
  }

  async function copy(from: number, to: number[]) {
    setError(null)
    const targets = dayTargets(current(), from)
    const rows = to.flatMap((weekday) => rowsToAdd(current(), weekday, targets))
    const inserted = await addWeekPlanItems(rows)
    items.setData((prev) => [...(prev ?? []), ...inserted])
  }

  async function remove(id: string) {
    setError(null)
    const before = items.data
    items.setData((prev) => (prev ?? []).filter((i) => i.id !== id))
    try {
      await removeWeekPlanItem(id)
    } catch (e) {
      items.setData(before)
      setError(errorMessage(e))
    }
  }

  async function move(id: string, direction: -1 | 1) {
    setError(null)
    const updates = moveWithinDay(current(), id, direction)
    if (updates.length === 0) return
    items.setData((prev) => withPositions(prev ?? [], updates))
    try {
      await saveWeekPlanOrder(updates)
    } catch (e) {
      items.reload()
      setError(errorMessage(e))
    }
  }

  return { items, error, add, copy, remove, move }
}
