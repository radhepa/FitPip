import { getDb } from '../local/context'
import { announceRemoteChange } from '../local/events'
import { DataError } from '../unwrap'
import { supabase } from '../../lib/supabase'
import { countPending, discardFailed, retryFailed } from './engine'
import { syncNow } from './manager'
import { supabaseRemote } from './remote'
import { getSyncStatus, setSyncStatus } from './status'

/** Adds any missing starter exercises on the server, then brings them down. Needs a connection. */
export async function loadStarterExercisesOnline(): Promise<number> {
  const needConnection = () => new Error('Loading the starter exercises needs a connection. Try again when you are back online.')
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw needConnection()
  let reply
  try {
    reply = await supabase.rpc('load_starter_exercises')
  } catch {
    throw needConnection()
  }
  if (reply.error) {
    if (reply.status === 0) throw needConnection()
    throw new DataError(reply.error)
  }
  await syncNow()
  return Number(reply.data ?? 0)
}

/** The Retry button: gives every change the server refused another go. */
export async function retryRejectedChanges(): Promise<void> {
  const db = getDb()
  await retryFailed(db)
  setSyncStatus(await countPending(db))
  await syncNow()
}

/** The Discard button: drops the refused changes and restores those rows from the server. */
export async function discardRejectedChanges(): Promise<number> {
  const db = getDb()
  const count = await discardFailed(db, supabaseRemote)
  // Read everything again on the next sync, in case a discarded delete had removed children.
  await db.meta.where('key').startsWith('cursor:').delete()
  setSyncStatus(await countPending(db))
  announceRemoteChange()
  await syncNow()
  return count
}

export interface RejectedChange {
  key: string
  /** What it was about, e.g. "exercise" or "workout". */
  what: string
  /** "added", "changed" or "deleted". */
  action: 'added' | 'changed' | 'deleted'
  message: string
}

const NOUN: Record<string, string> = {
  exercises: 'exercise',
  sessions: 'workout',
  sets: 'set',
  templates: 'routine',
  template_exercises: 'routine exercise',
  week_plan_items: 'plan entry',
  body_weights: 'weigh-in',
  user_settings: 'setting',
}

/** The server's reason, in words a person can act on. */
export function friendlyRejection(message: string, code?: string): string {
  if (code === '23505') return 'Something with the same name is already on the server (maybe made on another device).'
  if (code === '23503') return 'It refers to something that no longer exists.'
  if (code === '23001') return "It's still in use, so it can't be deleted."
  return message
}

/** The changes the server refused, for the Settings screen. */
export async function listRejectedChanges(): Promise<RejectedChange[]> {
  const entries = await getDb().pending.filter((entry) => !!entry.error).toArray()
  return entries.map((entry) => ({
    key: entry.key,
    what: NOUN[entry.table] ?? entry.table,
    action: entry.op === 'delete' ? 'deleted' : entry.isNew ? 'added' : 'changed',
    message: entry.error ? friendlyRejection(entry.error.message, entry.error.code) : 'Refused by the server.',
  }))
}

/**
 * Lets someone into the app when the very first download keeps failing on the server's side. The sync
 * keeps trying in the background, and everything they log is kept and sent later.
 */
export function skipFirstSync(): void {
  setSyncStatus({ initialSyncDone: true })
}

/** True when signing out would leave changes on this device that have not reached the server. */
export const hasUnsyncedChanges = (): boolean => {
  const { pending, failed, phase } = getSyncStatus()
  return phase !== 'local-only' && pending + failed > 0
}
