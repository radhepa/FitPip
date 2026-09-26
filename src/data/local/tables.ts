import type { BodyWeight, Exercise, Session, SetRow, Template, TemplateExercise, UserSettings, WeekPlanItem } from '../../types/db'

/** The settings row as stored (the app itself only reads the four preference fields). */
export type StoredSettings = UserSettings & { user_id: string; created_at: string; updated_at: string }

export interface RowTypes {
  exercises: Exercise
  templates: Template
  sessions: Session
  template_exercises: TemplateExercise
  sets: SetRow
  week_plan_items: WeekPlanItem
  body_weights: BodyWeight
  user_settings: StoredSettings
}

/**
 * Every table that lives on the device and syncs with the server, parents before the tables that
 * reference them. Pushes create rows in this order and delete them in the reverse order, so a
 * foreign key never points at a row that isn't there yet.
 */
export const SYNC_TABLES = [
  'exercises',
  'templates',
  'sessions',
  'template_exercises',
  'sets',
  'week_plan_items',
  'body_weights',
  'user_settings',
] as const

export type TableName = (typeof SYNC_TABLES)[number]
export type RowOf<T extends TableName> = RowTypes[T]

export const isTableName = (name: string): name is TableName => (SYNC_TABLES as readonly string[]).includes(name)

/** The primary key column of each table (user_settings has one row per user). */
export const PK: Record<TableName, 'id' | 'user_id'> = {
  exercises: 'id',
  templates: 'id',
  sessions: 'id',
  template_exercises: 'id',
  sets: 'id',
  week_plan_items: 'id',
  body_weights: 'id',
  user_settings: 'user_id',
}

export const keyOf = (table: TableName, row: object): string => String((row as Record<string, unknown>)[PK[table]])

const TIMESTAMP_COLUMNS = ['created_at', 'updated_at', 'started_at', 'ended_at'] as const

// Postgres numeric columns can arrive as strings; the app works with numbers.
const NUMERIC_COLUMNS: Partial<Record<TableName, readonly string[]>> = {
  sets: ['weight', 'rpe', 'distance_m'],
  body_weights: ['weight'],
  user_settings: ['goal_weight'],
}

/** Milliseconds since the epoch (0 when missing), whatever ISO flavour the string is in. */
export const timeOf = (iso: string | null | undefined): number => {
  const ms = iso ? Date.parse(iso) : NaN
  return Number.isNaN(ms) ? 0 : ms
}

/**
 * Turns a row as the server sends it into the shape kept on the device: no `modified_at` (that is
 * only the sync cursor), every timestamp as one uniform ISO string so they sort and compare as
 * text, and numbers as numbers.
 */
export function fromRemote<T extends TableName>(table: T, raw: Record<string, unknown>): RowOf<T> {
  const { modified_at: _modifiedAt, ...row } = raw
  for (const column of TIMESTAMP_COLUMNS) {
    const value = row[column]
    if (typeof value === 'string') row[column] = new Date(value).toISOString()
  }
  for (const column of NUMERIC_COLUMNS[table] ?? []) {
    const value = row[column]
    if (value !== null && value !== undefined) row[column] = Number(value)
  }
  return row as unknown as RowOf<T>
}
