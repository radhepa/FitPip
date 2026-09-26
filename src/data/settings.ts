import { supabase } from '../lib/supabase'
import type { DistanceUnit, UserSettings, WeightUnit } from '../types/db'
import { assertOk, unwrap } from './unwrap'
import { DEFAULT_SETTINGS, isGuestMode, readGuestData, writeGuestData } from './guest'

export async function getSettings(): Promise<UserSettings> {
  if (isGuestMode()) return readGuestData().settings
  const row = unwrap<Partial<UserSettings> | null>(await supabase.from('user_settings').select('*').maybeSingle())
  return {
    ...DEFAULT_SETTINGS,
    ...row,
    goal_weight: row?.goal_weight == null ? null : Number(row.goal_weight),
  }
}

async function save(userId: string, patch: Partial<UserSettings>): Promise<void> {
  if (isGuestMode()) {
    const data = readGuestData()
    data.settings = { ...data.settings, ...patch }
    writeGuestData(data)
    return
  }
  assertOk(await supabase.from('user_settings').upsert({ user_id: userId, ...patch }))
}

export const saveWeightUnit = (userId: string, unit: WeightUnit) => save(userId, { weight_unit: unit })
export const saveDistanceUnit = (userId: string, unit: DistanceUnit) => save(userId, { distance_unit: unit })

/** Sets (or clears, with null) the goal weight, in the unit it was typed in. */
export const saveGoalWeight = (userId: string, goal: { weight: number; unit: WeightUnit } | null) =>
  save(userId, { goal_weight: goal?.weight ?? null, goal_weight_unit: goal?.unit ?? null })
