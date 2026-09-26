import Dexie, { type Table } from 'dexie'
import type { RowTypes, TableName } from './tables'

/** One row waiting to be sent to the server. There is at most one entry per row (the latest wins). */
export interface PendingChange {
  /** `${table}/${primary key}` */
  key: string
  table: TableName
  pk: string
  op: 'upsert' | 'delete'
  /** True while the row has never reached the server, so deleting it needs no request. */
  isNew: boolean
  /** Bumped on every local edit; a push only clears the entry if it was not edited meanwhile. */
  rev: number
  at: string
  tries: number
  /** Set when the server refused this change for good. The row is skipped until retried or discarded. */
  error?: { message: string; code?: string; at: string }
}

export interface MetaEntry {
  key: string
  value: unknown
}

/** The whole app's data on this device, one database per signed-in user. */
export class FitPipDB extends Dexie {
  declare exercises: Table<RowTypes['exercises'], string>
  declare templates: Table<RowTypes['templates'], string>
  declare sessions: Table<RowTypes['sessions'], string>
  declare template_exercises: Table<RowTypes['template_exercises'], string>
  declare sets: Table<RowTypes['sets'], string>
  declare week_plan_items: Table<RowTypes['week_plan_items'], string>
  declare body_weights: Table<RowTypes['body_weights'], string>
  declare user_settings: Table<RowTypes['user_settings'], string>
  declare pending: Table<PendingChange, string>
  declare meta: Table<MetaEntry, string>

  constructor(name: string) {
    super(name)
    // Only what the app looks rows up by is indexed. The whole store is small, so anything else
    // is filtered in memory.
    this.version(1).stores({
      exercises: 'id, name',
      templates: 'id',
      sessions: 'id, started_at, template_id',
      template_exercises: 'id, template_id, exercise_id',
      sets: 'id, session_id, exercise_id',
      week_plan_items: 'id, weekday, template_id, exercise_id',
      body_weights: 'id, measured_on',
      user_settings: 'user_id',
      pending: 'key, table, op',
      meta: 'key',
    })
  }
}

export async function getMeta<T>(db: FitPipDB, key: string): Promise<T | undefined> {
  return (await db.meta.get(key))?.value as T | undefined
}

export async function setMeta(db: FitPipDB, key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value })
}
