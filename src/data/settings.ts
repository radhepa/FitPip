import type { DistanceUnit, Sex, UserSettings, WeightUnit } from '../types/db'
import { REST_DEFAULT, REST_MAX, REST_MIN } from '../lib/rest'
import { getUserId } from './local/context'
import { invalidError, nowIso, putRow, rowsOf, writeTx } from './local/store'
import type { StoredSettings } from './local/tables'

export const DEFAULT_SETTINGS: UserSettings = {
  weight_unit: 'lb',
  distance_unit: 'mi',
  goal_weight: null,
  goal_weight_unit: null,
  rest_seconds: REST_DEFAULT,
  compare_sex: null,
  display_name: null,
}

export const MAX_DISPLAY_NAME = 40

/**
 * Columns added with the profile. A saved row leaves them out until they have a value, so the rest
 * of the settings keep syncing to a database that hasn't had the profile update yet.
 */
const PROFILE_COLUMNS = ['compare_sex', 'display_name'] as const

export async function getSettings(): Promise<UserSettings> {
  const row = await rowsOf('user_settings').get(getUserId())
  if (!row) return { ...DEFAULT_SETTINGS }
  return {
    weight_unit: row.weight_unit,
    distance_unit: row.distance_unit,
    goal_weight: row.goal_weight,
    goal_weight_unit: row.goal_weight_unit,
    // Saved before this setting existed: the old default.
    rest_seconds: row.rest_seconds ?? REST_DEFAULT,
    compare_sex: row.compare_sex ?? null,
    display_name: row.display_name ?? null,
  }
}

async function save(patch: Partial<UserSettings>): Promise<void> {
  const userId = getUserId()
  await writeTx(async () => {
    const existing = await rowsOf('user_settings').get(userId)
    const now = nowIso()
    const row: StoredSettings = { ...DEFAULT_SETTINGS, user_id: userId, created_at: existing?.created_at ?? now, ...existing, ...patch, updated_at: now }
    for (const column of PROFILE_COLUMNS) {
      if (row[column] === null && !(existing && column in existing) && !(column in patch)) delete (row as Partial<StoredSettings>)[column]
    }
    await putRow('user_settings', row, { isNew: !existing })
  })
}

export const saveWeightUnit = (unit: WeightUnit) => save({ weight_unit: unit })
export const saveDistanceUnit = (unit: DistanceUnit) => save({ distance_unit: unit })

/** Sets (or clears, with null) the goal weight, in the unit it was typed in. */
export const saveGoalWeight = (goal: { weight: number; unit: WeightUnit } | null) =>
  save({ goal_weight: goal?.weight ?? null, goal_weight_unit: goal?.unit ?? null })

/** How long the rest timer runs after a lifting set, in seconds; 0 turns it off. */
export async function saveRestSeconds(seconds: number): Promise<void> {
  if (!Number.isInteger(seconds) || (seconds !== 0 && (seconds < REST_MIN || seconds > REST_MAX))) {
    throw invalidError(`Rest can be off, or between ${REST_MIN} seconds and ${REST_MAX / 60} minutes.`)
  }
  await save({ rest_seconds: seconds })
}

/** Which strength standards (men's or women's) lifts are ranked against. */
export async function saveCompareSex(sex: Sex): Promise<void> {
  if (sex !== 'male' && sex !== 'female') throw invalidError('Choose men’s or women’s standards.')
  await save({ compare_sex: sex })
}

/** The name on the profile; blank clears it. Returns what was saved. */
export async function saveDisplayName(name: string): Promise<string | null> {
  const trimmed = name.replace(/\s+/g, ' ').trim()
  if (trimmed.length > MAX_DISPLAY_NAME) throw invalidError(`Keep your name to ${MAX_DISPLAY_NAME} characters.`)
  const value = trimmed === '' ? null : trimmed
  await save({ display_name: value })
  return value
}
