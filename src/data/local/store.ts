import type { Table } from 'dexie'
import { DataError } from '../unwrap'
import { getDb, getUserId } from './context'
import type { FitPipDB, PendingChange } from './db'
import { emitLocalWrite } from './events'
import { keyOf, type RowOf, type TableName } from './tables'

/** Typed access to one of the on-device tables. */
export function rowsOf<T extends TableName>(name: T, db: FitPipDB = getDb()): Table<RowOf<T>, string> {
  return db.table(name) as Table<RowOf<T>, string>
}

export const nowIso = () => new Date().toISOString()

/** A new random id (rows are created on the device, so they need ids before the server sees them). */
export const newId = () => crypto.randomUUID()

/**
 * Runs a group of writes as one atomic step on the device, then lets the sync know something
 * changed. Every write in the data layer goes through here.
 */
export async function writeTx<T>(work: () => Promise<T>): Promise<T> {
  const db = getDb()
  const result = await db.transaction('rw', db.tables, work)
  emitLocalWrite()
  return result
}

/** The current user's id, for stamping new rows. */
export const ownerId = () => getUserId()

async function markUpsert(db: FitPipDB, table: TableName, pk: string, isNew: boolean): Promise<void> {
  const key = `${table}/${pk}`
  const existing = await db.pending.get(key)
  const entry: PendingChange = {
    key,
    table,
    pk,
    op: 'upsert',
    // A row created offline stays "new" however often it is edited before it first syncs.
    isNew: existing?.op === 'upsert' ? existing.isNew : isNew,
    rev: (existing?.rev ?? 0) + 1,
    at: nowIso(),
    tries: 0,
  }
  await db.pending.put(entry)
}

async function markDelete(db: FitPipDB, table: TableName, pk: string): Promise<void> {
  const key = `${table}/${pk}`
  const existing = await db.pending.get(key)
  if (existing?.op === 'upsert' && existing.isNew) {
    // Created and deleted before it ever synced: the server never needs to hear about it.
    await db.pending.delete(key)
    return
  }
  await db.pending.put({ key, table, pk, op: 'delete', isNew: false, rev: (existing?.rev ?? 0) + 1, at: nowIso(), tries: 0 })
}

/** Saves a row on the device and queues it for the server. `isNew` is true for a brand-new row. */
export async function putRow<T extends TableName>(table: T, row: RowOf<T>, options: { isNew: boolean }): Promise<void> {
  const db = getDb()
  await rowsOf(table, db).put(row)
  await markUpsert(db, table, keyOf(table, row), options.isNew)
}

export async function putRows<T extends TableName>(table: T, rows: RowOf<T>[], options: { isNew: boolean }): Promise<void> {
  for (const row of rows) await putRow(table, row, options)
}

/** Deletes a row on the device and queues the deletion for the server. */
export async function removeRow(table: TableName, pk: string): Promise<void> {
  const db = getDb()
  await rowsOf(table, db).delete(pk)
  await markDelete(db, table, pk)
}

/**
 * Deletes rows the server removes on its own when their parent goes (ON DELETE CASCADE), without
 * queuing anything: the parent's deletion carries them.
 */
export async function removeCascaded(table: TableName, pks: string[]): Promise<void> {
  if (pks.length === 0) return
  const db = getDb()
  await rowsOf(table, db).bulkDelete(pks)
  await db.pending.bulkDelete(pks.map((pk) => `${table}/${pk}`))
}

// --- The server's constraints, enforced here too so the app behaves the same offline. ---

const violation = (code: string, message: string) => new DataError({ code, message })

/** Same Postgres code the server raises, so the same friendly message is shown. */
export const duplicateError = (what: string) => violation('23505', `duplicate key value violates unique constraint (${what})`)

/** ON DELETE RESTRICT: still used by logged sets. */
export const inUseError = () => violation('23001', 'update or delete violates a RESTRICT foreign key')

export const invalidError = (message: string) => violation('23514', message)
