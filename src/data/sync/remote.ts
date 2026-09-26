import { serverReachable, supabase } from '../../lib/supabase'
import { PK, type TableName } from '../local/tables'

export type RawRow = Record<string, unknown>

/** A row the server deleted (see the `deleted_rows` table in the offline-sync migration). */
export interface Tombstone {
  id: number
  table_name: string
  row_key: string
}

/**
 * Why a request failed, in terms of what the sync should do about it:
 * - network: no connection; try again later
 * - auth: not signed in (any more); stop until the user signs in
 * - transient: the server had a problem or is busy; try again later
 * - permanent: the server refused this data; retrying the same thing won't help
 */
export type FailureKind = 'network' | 'auth' | 'transient' | 'permanent'

export class SyncFailure extends Error {
  kind: FailureKind
  code: string | undefined

  constructor(kind: FailureKind, message: string, code?: string) {
    super(message)
    this.name = 'SyncFailure'
    this.kind = kind
    this.code = code
  }
}

export const asFailure = (e: unknown): SyncFailure =>
  e instanceof SyncFailure ? e : new SyncFailure(navigator.onLine === false ? 'network' : 'transient', e instanceof Error ? e.message : 'Sync failed.')

export interface PageRequest {
  /** First page: rows modified at or after this time. */
  since: string | null
  /** Later pages: continue after this row (modified_at as the server wrote it, plus the row's key). */
  after: { ts: string; pk: string } | null
  limit: number
}

/** Everything the sync needs from the server, so tests can stand in a fake one. */
export interface Remote {
  /** The signed-in user's id, or null when there is no valid session. */
  currentUserId(): Promise<string | null>
  /** Rows of a table, oldest change first. */
  fetchRows(table: TableName, page: PageRequest): Promise<RawRow[]>
  fetchByKeys(table: TableName, keys: string[]): Promise<RawRow[]>
  fetchTombstones(afterId: number, limit: number): Promise<Tombstone[]>
  upsert(table: TableName, rows: RawRow[]): Promise<void>
  remove(table: TableName, keys: string[]): Promise<void>
}

interface Reply {
  error: { message: string; code?: string } | null
  status: number
}

const MISSING_SYNC_MIGRATION =
  'The database needs the offline-sync update. Run supabase/migrations/20260927000100_offline_sync.sql in the Supabase SQL Editor.'

export function failureFrom(reply: Reply): SyncFailure {
  const { error, status } = reply
  const message = error?.message ?? 'Request failed.'
  const code = error?.code
  // supabase-js reports a dropped connection as an error with status 0.
  if (status === 0 || /failed to fetch|network ?error|load failed|networkerror|fetch failed/i.test(message)) {
    return new SyncFailure('network', "Can't reach the server.", code)
  }
  if (code === '42703' && /modified_at/.test(message)) return new SyncFailure('permanent', MISSING_SYNC_MIGRATION, code)
  if ((code === '42P01' || code === 'PGRST205') && /deleted_rows/.test(message)) return new SyncFailure('permanent', MISSING_SYNC_MIGRATION, code)
  if (status === 401) return new SyncFailure('auth', 'Your sign-in expired. Sign in again to keep syncing.', code)
  if (status === 408 || status === 429 || status >= 500) return new SyncFailure('transient', 'The server is busy. Trying again shortly.', code)
  if (code === 'PGRST204' && /category/.test(message)) {
    return new SyncFailure('permanent', 'Planning by kind of workout needs a database update. Run supabase/migrations/20260926000200_week_plan_categories.sql in the Supabase SQL Editor.', code)
  }
  return new SyncFailure('permanent', message, code)
}

function check<T extends Reply>(reply: T): T {
  if (reply.error) throw failureFrom(reply)
  return reply
}

/** A filter value that is safe inside a PostgREST `or(...)` list. */
const quote = (value: string) => `"${value.replaceAll('"', '')}"`

export const supabaseRemote: Remote = {
  async currentUserId() {
    // Checking the sign-in can mean renewing it over the network, which Supabase retries for up to
    // 30 seconds when the connection is bad. Don't wait that long, and don't mistake "couldn't
    // check" for "signed out".
    const unreachable = () => new SyncFailure('network', "Can't reach the server.")
    if (!(await serverReachable())) throw unreachable()
    const giveUp = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 8_000))
    let result
    try {
      result = await Promise.race([supabase.auth.getSession(), giveUp])
    } catch {
      throw unreachable()
    }
    if (result === 'timeout') throw unreachable()
    const { data, error } = result
    if (error) {
      const retryable = error.name === 'AuthRetryableFetchError' || (error as { status?: number }).status === 0
      if (retryable) throw unreachable()
      return null
    }
    return data.session?.user.id ?? null
  },

  async fetchRows(table, { since, after, limit }) {
    const pk = PK[table]
    let query = supabase.from(table).select('*').order('modified_at', { ascending: true }).order(pk, { ascending: true }).limit(limit)
    if (after) {
      query = query.or(`modified_at.gt.${quote(after.ts)},and(modified_at.eq.${quote(after.ts)},${pk}.gt.${quote(after.pk)})`)
    } else if (since) {
      query = query.gte('modified_at', since)
    }
    const reply = check(await query)
    return (reply.data ?? []) as RawRow[]
  },

  async fetchByKeys(table, keys) {
    if (keys.length === 0) return []
    const reply = check(await supabase.from(table).select('*').in(PK[table], keys))
    return (reply.data ?? []) as RawRow[]
  },

  async fetchTombstones(afterId, limit) {
    const reply = check(await supabase.from('deleted_rows').select('id, table_name, row_key').gt('id', afterId).order('id', { ascending: true }).limit(limit))
    return (reply.data ?? []) as Tombstone[]
  },

  async upsert(table, rows) {
    // One weigh-in per day: a clash on the day replaces that day's entry, whichever device made it.
    const onConflict = table === 'body_weights' ? 'user_id,measured_on' : PK[table]
    check(await supabase.from(table).upsert(rows, { onConflict }))
  },

  async remove(table, keys) {
    check(await supabase.from(table).delete().in(PK[table], keys))
  },
}
