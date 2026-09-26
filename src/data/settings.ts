import type { DistanceUnit, UserSettings, WeightUnit } from '../types/db'
import { getUserId } from './local/context'
import { nowIso, putRow, rowsOf, writeTx } from './local/store'
import type { StoredSettings } from './local/tables'

export const DEFAULT_SETTINGS: UserSettings = { weight_unit: 'lb', distance_unit: 'mi', goal_weight: null, goal_weight_unit: null }

export async function getSettings(): Promise<UserSettings> {
  const row = await rowsOf('user_settings').get(getUserId())
  if (!row) return { ...DEFAULT_SETTINGS }
  return { weight_unit: row.weight_unit, distance_unit: row.distance_unit, goal_weight: row.goal_weight, goal_weight_unit: row.goal_weight_unit }
}

async function save(patch: Partial<UserSettings>): Promise<void> {
  const userId = getUserId()
  await writeTx(async () => {
    const existing = await rowsOf('user_settings').get(userId)
    const now = nowIso()
    const row: StoredSettings = { ...DEFAULT_SETTINGS, user_id: userId, created_at: existing?.created_at ?? now, ...existing, ...patch, updated_at: now }
    await putRow('user_settings', row, { isNew: !existing })
  })
}

export const saveWeightUnit = (unit: WeightUnit) => save({ weight_unit: unit })
export const saveDistanceUnit = (unit: DistanceUnit) => save({ distance_unit: unit })

/** Sets (or clears, with null) the goal weight, in the unit it was typed in. */
export const saveGoalWeight = (goal: { weight: number; unit: WeightUnit } | null) =>
  save({ goal_weight: goal?.weight ?? null, goal_weight_unit: goal?.unit ?? null })
