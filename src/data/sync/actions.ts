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

/** True when signing out would leave changes on this device that have not reached the server. */
export const hasUnsyncedChanges = (): boolean => {
  const { pending, failed, phase } = getSyncStatus()
  return phase !== 'local-only' && pending + failed > 0
}
