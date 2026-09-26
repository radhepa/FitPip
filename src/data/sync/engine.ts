import { getMeta, setMeta, type FitPipDB, type PendingChange } from '../local/db'
import { PK, SYNC_TABLES, fromRemote, isTableName, timeOf, type TableName } from '../local/tables'
import { SyncFailure, asFailure, type Remote } from './remote'

const PAGE_SIZE = 500
const PUSH_BATCH = 100
/**
 * A pull re-reads this much history before its cursor. A row whose transaction committed a moment
 * after a later one (so it carries an earlier modified_at) would otherwise be missed.
 */
const OVERLAP_MS = 60_000

export interface SyncOutcome {
  /** True when the server's changes altered what is on the device (screens should reload). */
  changed: boolean
  /** Local changes the server accepted. */
  pushed: number
  /** Local changes the server refused for good in this run. */
  rejected: number
}

type Row = Record<string, unknown>

/**
 * One sync: first bring the server's changes down (resolving conflicts, last write wins), then
 * send this device's changes up. Safe to run repeatedly and to interrupt: every step is
 * idempotent and progress is saved as it goes.
 */
export async function runSync(db: FitPipDB, remote: Remote): Promise<SyncOutcome> {
  const outcome: SyncOutcome = { changed: false, pushed: 0, rejected: 0 }
  await pull(db, remote, outcome)
  await setMeta(db, 'initialSyncDone', true)
  await push(db, remote, outcome)
  return outcome
}

// ---------------------------------------------------------------------------------------------
// Our own deletions come back as tombstones. Without care, that echo would delete a row the user
// has since restored (Undo). So each deletion this device sends is remembered until its echo is seen.

const OWN_DELETES_KEY = 'ownDeletes'
const OWN_DELETE_TTL_MS = 7 * 24 * 60 * 60 * 1000
type OwnDeletes = Record<string, { n: number; at: number }>

async function noteOwnDeletes(db: FitPipDB, keys: string[]): Promise<void> {
  if (keys.length === 0) return
  const now = Date.now()
  const saved = (await getMeta<OwnDeletes>(db, OWN_DELETES_KEY)) ?? {}
  const fresh: OwnDeletes = Object.fromEntries(Object.entries(saved).filter(([, entry]) => now - entry.at <= OWN_DELETE_TTL_MS))
  for (const key of keys) fresh[key] = { n: (fresh[key]?.n ?? 0) + 1, at: now }
  await setMeta(db, OWN_DELETES_KEY, fresh)
}

/** True (and forgets one) when a tombstone is the echo of a deletion this device sent. */
async function takeOwnDelete(db: FitPipDB, key: string): Promise<boolean> {
  const saved = await getMeta<OwnDeletes>(db, OWN_DELETES_KEY)
  const entry = saved?.[key]
  if (!saved || !entry || Date.now() - entry.at > OWN_DELETE_TTL_MS) return false
  const { [key]: _taken, ...rest } = saved
  await setMeta(db, OWN_DELETES_KEY, entry.n > 1 ? { ...rest, [key]: { n: entry.n - 1, at: entry.at } } : rest)
  return true
}

// ---------------------------------------------------------------------------------------------
// Pull: server -> device

async function pull(db: FitPipDB, remote: Remote, outcome: SyncOutcome): Promise<void> {
  if (await pullDeletions(db, remote)) outcome.changed = true
  for (const table of SYNC_TABLES) {
    if (await pullTable(db, remote, table)) outcome.changed = true
  }
}

async function pullDeletions(db: FitPipDB, remote: Remote): Promise<boolean> {
  let changed = false
  let afterId = (await getMeta<number>(db, 'tombstoneCursor')) ?? 0
  for (;;) {
    const page = await remote.fetchTombstones(afterId, PAGE_SIZE)
    if (page.length === 0) break
    await db.transaction('rw', db.tables, async () => {
      for (const tombstone of page) {
        if (isTableName(tombstone.table_name) && (await applyRemoteDelete(db, tombstone.table_name, tombstone.row_key))) changed = true
      }
    })
    afterId = page[page.length - 1].id
    await setMeta(db, 'tombstoneCursor', afterId)
    if (page.length < PAGE_SIZE) break
  }
  return changed
}

async function pullTable(db: FitPipDB, remote: Remote, table: TableName): Promise<boolean> {
  const pk = PK[table]
  const cursor = await getMeta<string>(db, `cursor:${table}`)
  const since = cursor ? new Date(timeOf(cursor) - OVERLAP_MS).toISOString() : null
  let after: { ts: string; pk: string } | null = null
  let newest = cursor
  let changed = false
  for (;;) {
    const rows = await remote.fetchRows(table, { since, after, limit: PAGE_SIZE })
    if (rows.length === 0) break
    if (await applyRemoteRows(db, table, rows)) changed = true
    const last = rows[rows.length - 1]
    after = { ts: String(last.modified_at), pk: String(last[pk]) }
    if (!newest || timeOf(after.ts) > timeOf(newest)) newest = after.ts
    if (rows.length < PAGE_SIZE) break
  }
  if (newest && newest !== cursor) await setMeta(db, `cursor:${table}`, newest)
  return changed
}

/** Applies a page of server rows. Returns whether anything on the device changed. */
async function applyRemoteRows(db: FitPipDB, table: TableName, raws: Row[]): Promise<boolean> {
  let changed = false
  await db.transaction('rw', db.tables, async () => {
    const rows = db.table(table)
    for (const raw of raws) {
      const row = fromRemote(table, raw) as unknown as Row
      const pk = String(row[PK[table]])
      const pending = await db.pending.get(`${table}/${pk}`)
      // Deleted here, delete on its way to the server: don't bring it back.
      if (pending?.op === 'delete') continue

      const local = (await rows.get(pk)) as Row | undefined
      if (pending?.op === 'upsert') {
        // Edited here and there: the later edit wins. Ours is pushed after this pull. At the same
        // instant the server's copy only wins if it is the same data (our own change coming back).
        if (local && (localIsNewer(local, row) || (sameInstant(local, row) && !sameData(local, row)))) continue
        await db.pending.delete(pending.key)
      } else if (local && timeOf(local.updated_at as string) === timeOf(row.updated_at as string)) {
        continue // just our own change coming back
      }

      if (table === 'body_weights' && !(await makeRoomForWeighIn(db, row, pk))) continue

      await rows.put(row)
      changed = true
    }
  })
  return changed
}

const localIsNewer = (local: Row, remote: Row) => timeOf(local.updated_at as string) > timeOf(remote.updated_at as string)
const sameInstant = (local: Row, remote: Row) => timeOf(local.updated_at as string) === timeOf(remote.updated_at as string)

/** Same values, whatever the key order. */
const sameData = (a: Row, b: Row): boolean => {
  const canonical = (row: Row) => JSON.stringify(Object.keys(row).sort().map((key) => [key, row[key]]))
  return canonical(a) === canonical(b)
}

/**
 * There is one weigh-in per day, and two devices can both weigh in on a day. If another local entry
 * holds this day, the later of the two wins; false means ours stays and the server's is skipped.
 */
async function makeRoomForWeighIn(db: FitPipDB, incoming: Row, incomingId: string): Promise<boolean> {
  const sameDay = await db.body_weights.where('measured_on').equals(incoming.measured_on as string).filter((w) => w.id !== incomingId).toArray()
  for (const other of sameDay) {
    const pending = await db.pending.get(`body_weights/${other.id}`)
    if (pending?.op === 'upsert' && timeOf(other.updated_at) > timeOf(incoming.updated_at as string)) return false
  }
  for (const other of sameDay) {
    await db.body_weights.delete(other.id)
    await db.pending.delete(`body_weights/${other.id}`)
  }
  return true
}

/**
 * The server deleted a row. Delete wins over an unsent edit here: someone chose to remove it.
 * Also removes what the server removed along with it. Returns whether a local row was there.
 */
async function applyRemoteDelete(db: FitPipDB, table: TableName, key: string): Promise<boolean> {
  // Our own deletion coming back: this device already reflects it (and may have restored the row since).
  if (await takeOwnDelete(db, `${table}/${key}`)) return false
  const rows = db.table(table)
  const existed = (await rows.get(key)) !== undefined
  await rows.delete(key)
  await db.pending.delete(`${table}/${key}`)

  const dropChildren = async (childTable: TableName, column: string) => {
    const keys = (await db.table(childTable).where(column).equals(key).primaryKeys()) as string[]
    if (keys.length === 0) return
    await db.table(childTable).bulkDelete(keys)
    await db.pending.bulkDelete(keys.map((k) => `${childTable}/${k}`))
  }
  if (table === 'sessions') await dropChildren('sets', 'session_id')
  if (table === 'templates') {
    await dropChildren('template_exercises', 'template_id')
    await dropChildren('week_plan_items', 'template_id')
    await db.sessions.where('template_id').equals(key).modify({ template_id: null })
  }
  if (table === 'exercises') {
    await dropChildren('template_exercises', 'exercise_id')
    await dropChildren('week_plan_items', 'exercise_id')
  }
  return existed
}

// ---------------------------------------------------------------------------------------------
// Push: device -> server

async function push(db: FitPipDB, remote: Remote, outcome: SyncOutcome): Promise<void> {
  const ready = (await db.pending.toArray()).filter((entry) => !entry.error)

  // Deletions first, children before parents, so a later re-creation never trips over the old row.
  for (const table of [...SYNC_TABLES].reverse()) {
    const entries = ready.filter((entry) => entry.table === table && entry.op === 'delete')
    await sendBatches(
      entries,
      (batch) => remote.remove(table, batch.map((entry) => entry.pk)),
      async (batch) => {
        outcome.pushed += await settle(db, batch)
      },
      async (entry, failure) => {
        if (await quarantine(db, entry, failure)) outcome.rejected += 1
      },
    )
  }

  // Then new and edited rows, parents before children.
  for (const table of SYNC_TABLES) {
    const entries = ready.filter((entry) => entry.table === table && entry.op === 'upsert')
    const payloads = new Map<string, Row>()
    for (const entry of entries) {
      const row = (await db.table(table).get(entry.pk)) as Row | undefined
      if (row) payloads.set(entry.key, row)
      else await db.pending.delete(entry.key) // gone locally: nothing to send
    }
    await sendBatches(
      entries.filter((entry) => payloads.has(entry.key)),
      (batch) => remote.upsert(table, batch.map((entry) => payloads.get(entry.key)!)),
      async (batch) => {
        outcome.pushed += await settle(db, batch)
      },
      async (entry, failure) => {
        if (await quarantine(db, entry, failure)) outcome.rejected += 1
      },
    )
  }
}

/**
 * Sends entries in batches. If the server refuses a batch for good, the entries are retried one by
 * one so a single bad row can't hold back the rest. Connection and server problems stop the sync
 * (thrown), leaving everything queued.
 */
async function sendBatches(
  entries: PendingChange[],
  send: (batch: PendingChange[]) => Promise<void>,
  onSent: (batch: PendingChange[]) => Promise<void>,
  onRejected: (entry: PendingChange, failure: SyncFailure) => Promise<void>,
): Promise<void> {
  const attempt = async (batch: PendingChange[]): Promise<void> => {
    try {
      await send(batch)
    } catch (e) {
      const failure = asFailure(e)
      if (failure.kind !== 'permanent') throw failure
      if (batch.length > 1) {
        for (const entry of batch) await attempt([entry])
      } else {
        await onRejected(batch[0], failure)
      }
      return
    }
    await onSent(batch)
  }
  for (let i = 0; i < entries.length; i += PUSH_BATCH) await attempt(entries.slice(i, i + PUSH_BATCH))
}

/**
 * Clears the queue entries the server accepted, but only those not edited while the request was in
 * flight (those stay queued for the next run). Returns how many were cleared.
 */
async function settle(db: FitPipDB, batch: PendingChange[]): Promise<number> {
  let cleared = 0
  await db.transaction('rw', db.tables, async () => {
    await noteOwnDeletes(db, batch.filter((sent) => sent.op === 'delete').map((sent) => sent.key))
    for (const sent of batch) {
      const current = await db.pending.get(sent.key)
      if (current && current.rev === sent.rev) {
        await db.pending.delete(sent.key)
        cleared += 1
      } else if (!current && sent.op === 'upsert' && (await db.table(sent.table).get(sent.pk)) === undefined) {
        // Created and deleted while it was being sent: the server now has a row the user removed.
        await db.pending.put({ key: sent.key, table: sent.table, pk: sent.pk, op: 'delete', isNew: false, rev: sent.rev + 1, at: new Date().toISOString(), tries: 0 })
      }
    }
  })
  return cleared
}

/** Marks a change the server refused for good, unless it was edited since (the edit is a fresh try). */
async function quarantine(db: FitPipDB, entry: PendingChange, failure: SyncFailure): Promise<boolean> {
  return db.transaction('rw', db.pending, async () => {
    const current = await db.pending.get(entry.key)
    if (!current || current.rev !== entry.rev) return false
    await db.pending.put({ ...current, tries: current.tries + 1, error: { message: failure.message, code: failure.code, at: new Date().toISOString() } })
    return true
  })
}

// ---------------------------------------------------------------------------------------------
// Housekeeping used by the Settings screen

export async function countPending(db: FitPipDB): Promise<{ pending: number; failed: number }> {
  const all = await db.pending.toArray()
  const failed = all.filter((entry) => entry.error).length
  return { pending: all.length - failed, failed }
}

/** Gives every refused change another try on the next sync. */
export async function retryFailed(db: FitPipDB): Promise<void> {
  await db.transaction('rw', db.pending, async () => {
    for (const entry of await db.pending.filter((e) => !!e.error).toArray()) {
      const { error: _error, ...rest } = entry
      await db.pending.put(rest)
    }
  })
}

/**
 * Gives up on the changes the server refused and puts each row back the way the server has it:
 * rows that never reached the server are removed, edited or deleted ones are restored.
 */
export async function discardFailed(db: FitPipDB, remote: Remote): Promise<number> {
  const failed = await db.pending.filter((entry) => !!entry.error).toArray()
  const restore = failed.filter((entry) => !(entry.op === 'upsert' && entry.isNew))
  const serverRows = new Map<string, Row>()
  for (const table of SYNC_TABLES) {
    const keys = restore.filter((entry) => entry.table === table).map((entry) => entry.pk)
    for (const row of await remote.fetchByKeys(table, keys)) serverRows.set(`${table}/${String(row[PK[table]])}`, row)
  }
  await db.transaction('rw', db.tables, async () => {
    for (const entry of failed) {
      const server = serverRows.get(entry.key)
      if (server) await db.table(entry.table).put(fromRemote(entry.table, server))
      else await db.table(entry.table).delete(entry.pk)
      await db.pending.delete(entry.key)
    }
  })
  return failed.length
}
