// A stand-in for Supabase used by the sync tests. It behaves like the real database where the sync
// depends on it: server-stamped modified_at, keyset paging, deletion tombstones (with cascades),
// unique and foreign-key constraints, and a network that can go away.
import { PK, SYNC_TABLES, type TableName } from '../local/tables'
import { SyncFailure, type PageRequest, type RawRow, type Remote, type Tombstone } from './remote'

const BASE = Date.parse('2026-01-01T00:00:00.000Z')

export class FakeServer {
  readonly userId: string
  tables = Object.fromEntries(SYNC_TABLES.map((t) => [t, new Map<string, RawRow>()])) as Record<TableName, Map<string, RawRow>>
  tombstones: Tombstone[] = []
  online = true
  /** Requests made, for asserting what was (not) sent. */
  calls: { op: string; table?: string; count?: number }[] = []
  /** Return a failure to refuse a row for good (or null to accept it). */
  rejectRow: ((table: TableName, row: RawRow) => SyncFailure | null) | null = null
  /** Runs in the middle of every upsert, after it was accepted but before it returns. */
  duringUpsert: (() => Promise<void>) | null = null
  /** Give every row of one request the same modified_at, like a single SQL statement does. */
  sameStamp = false

  private clock = 0
  private tombstoneId = 0

  constructor(userId = 'user-1') {
    this.userId = userId
  }

  /** The server clock: strictly increasing, in the format Postgres uses. */
  private stamp(): string {
    this.clock += 1000
    return new Date(BASE + this.clock).toISOString().replace('Z', '+00:00')
  }

  private assertOnline() {
    if (!this.online) throw new SyncFailure('network', "Can't reach the server.")
  }

  remote(): Remote {
    return {
      currentUserId: async () => (this.online ? this.userId : null),
      fetchRows: async (table, page) => this.fetchRows(table, page),
      fetchByKeys: async (table, keys) => {
        this.assertOnline()
        return keys.flatMap((key) => (this.tables[table].has(key) ? [{ ...this.tables[table].get(key)! }] : []))
      },
      fetchTombstones: async (afterId, limit) => {
        this.assertOnline()
        this.calls.push({ op: 'tombstones' })
        return this.tombstones.filter((t) => t.id > afterId).slice(0, limit)
      },
      upsert: (table, rows) => this.upsert(table, rows),
      remove: async (table, keys) => this.remove(table, keys),
    }
  }

  private fetchRows(table: TableName, { since, after, limit }: PageRequest): RawRow[] {
    this.assertOnline()
    this.calls.push({ op: 'fetch', table })
    const pk = PK[table]
    const ms = (v: unknown) => Date.parse(String(v))
    return [...this.tables[table].values()]
      .filter((row) => {
        if (after) {
          const t = ms(row.modified_at)
          return t > ms(after.ts) || (t === ms(after.ts) && String(row[pk]) > after.pk)
        }
        return since ? ms(row.modified_at) >= ms(since) : true
      })
      .sort((a, b) => ms(a.modified_at) - ms(b.modified_at) || String(a[pk]).localeCompare(String(b[pk])))
      .slice(0, limit)
      .map((row) => ({ ...row }))
  }

  private async upsert(table: TableName, rows: RawRow[]): Promise<void> {
    this.assertOnline()
    this.calls.push({ op: 'upsert', table, count: rows.length })
    const pk = PK[table]
    const shared = this.stamp()
    // A request is all-or-nothing, like a SQL statement.
    const staged = new Map(this.tables[table])
    for (const row of rows) {
      const refused = this.rejectRow?.(table, row)
      if (refused) throw refused
      this.checkConstraints(table, row, staged)
      const key = String(row[pk])
      let existing = staged.get(key)
      if (table === 'body_weights') {
        // onConflict user_id,measured_on: the day's existing row is updated in place.
        const sameDay = [...staged.values()].find((r) => r.measured_on === row.measured_on)
        if (sameDay) existing = sameDay
      }
      const target = existing ? String(existing[pk]) : key
      // set_updated_at: keep a client-supplied updated_at unless it did not change.
      const updatedAt = existing && existing.updated_at === row.updated_at ? new Date(BASE + this.clock).toISOString() : row.updated_at
      staged.set(target, { ...existing, ...row, [pk]: target, updated_at: updatedAt, modified_at: this.sameStamp ? shared : this.stamp() })
    }
    this.tables[table] = staged
    await this.duringUpsert?.()
  }

  private checkConstraints(table: TableName, row: RawRow, staged: Map<string, RawRow>) {
    const pk = PK[table]
    const violation = (code: string, message: string) => new SyncFailure('permanent', message, code)
    if (table === 'exercises') {
      const clash = [...staged.values()].some((r) => r[pk] !== row[pk] && String(r.name).toLowerCase() === String(row.name).toLowerCase())
      if (clash) throw violation('23505', 'duplicate key value violates unique constraint "exercises_user_name_key"')
    }
    if (table === 'sets') {
      if (!this.tables.sessions.has(String(row.session_id))) throw violation('23503', 'insert or update on table "sets" violates foreign key constraint')
      if (!this.tables.exercises.has(String(row.exercise_id))) throw violation('23503', 'insert or update on table "sets" violates foreign key constraint')
    }
    if (table === 'template_exercises' && !this.tables.templates.has(String(row.template_id))) {
      throw violation('23503', 'insert or update on table "template_exercises" violates foreign key constraint')
    }
  }

  private async remove(table: TableName, keys: string[]): Promise<void> {
    this.assertOnline()
    this.calls.push({ op: 'remove', table, count: keys.length })
    if (table === 'exercises') {
      for (const key of keys) {
        if ([...this.tables.sets.values()].some((s) => s.exercise_id === key)) {
          throw new SyncFailure('permanent', 'update or delete on table "exercises" violates foreign key constraint', '23001')
        }
      }
    }
    for (const key of keys) this.deleteRow(table, key)
  }

  private deleteRow(table: TableName, key: string) {
    if (!this.tables[table].delete(key)) return
    this.tombstones.push({ id: ++this.tombstoneId, table_name: table, row_key: key })
    const cascade = (child: TableName, column: string) => {
      for (const [childKey, row] of [...this.tables[child]]) if (row[column] === key) this.deleteRow(child, childKey)
    }
    if (table === 'sessions') cascade('sets', 'session_id')
    if (table === 'templates') {
      cascade('template_exercises', 'template_id')
      cascade('week_plan_items', 'template_id')
      for (const row of this.tables.sessions.values()) if (row.template_id === key) Object.assign(row, { template_id: null, updated_at: new Date(BASE + this.clock).toISOString(), modified_at: this.stamp() })
    }
    if (table === 'exercises') {
      cascade('template_exercises', 'exercise_id')
      cascade('week_plan_items', 'exercise_id')
    }
  }

  /** Puts a row on the server as if another device had synced it. */
  seed(table: TableName, row: RawRow): void {
    this.tables[table].set(String(row[PK[table]]), { user_id: this.userId, ...row, modified_at: this.stamp() })
  }

  /** Deletes a row on the server as if another device had (records the tombstone, cascades). */
  serverDelete(table: TableName, key: string): void {
    this.deleteRow(table, key)
  }

  count(table: TableName): number {
    return this.tables[table].size
  }
}
