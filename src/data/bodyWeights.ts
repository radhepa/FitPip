import type { BodyWeight, WeightUnit } from '../types/db'
import { invalidError, newId, nowIso, putRow, removeRow, rowsOf, writeTx } from './local/store'

/** Every weigh-in, oldest first. */
export async function listBodyWeights(): Promise<BodyWeight[]> {
  return (await rowsOf('body_weights').toArray()).sort((a, b) => a.measured_on.localeCompare(b.measured_on))
}

export interface WeighInInput {
  /** YYYY-MM-DD, local date. */
  measuredOn: string
  weight: number
  unit: WeightUnit
  note?: string | null
}

/** Saves a weigh-in. Weighing in again on the same day replaces that day's entry. */
export async function saveBodyWeight(userId: string, input: WeighInInput): Promise<BodyWeight> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.measuredOn)) throw invalidError('That date is not valid.')
  if (!(input.weight > 0 && input.weight < 2000)) throw invalidError('Weight must be more than 0 and under 2,000.')
  const weight = Math.round(input.weight * 100) / 100
  const note = input.note?.trim() ? input.note.trim().slice(0, 200) : null
  return writeTx(async () => {
    const existing = await rowsOf('body_weights').where('measured_on').equals(input.measuredOn).first()
    const now = nowIso()
    const saved: BodyWeight = { id: existing?.id ?? newId(), user_id: userId, created_at: existing?.created_at ?? now, measured_on: input.measuredOn, weight, unit: input.unit, note, updated_at: now }
    await putRow('body_weights', saved, { isNew: !existing })
    return saved
  })
}

export async function deleteBodyWeight(id: string): Promise<void> {
  await writeTx(() => removeRow('body_weights', id))
}
