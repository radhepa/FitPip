/**
 * What the sync is doing right now, for the indicator and the Settings screen.
 * - local-only: guest mode (or signed out): nothing to sync
 * - idle: connected, everything that could be sent was
 * - syncing: a sync is running
 * - offline: no connection; changes are saved on the device and wait
 * - error: the server had a problem; will retry
 * - signed-out: the sign-in expired; changes wait until you sign in again
 */
export type SyncPhase = 'local-only' | 'idle' | 'syncing' | 'offline' | 'error' | 'signed-out'

export interface SyncStatus {
  phase: SyncPhase
  /** Changes waiting to be sent. */
  pending: number
  /** Changes the server refused (they stay on the device until retried or discarded). */
  failed: number
  /** ISO time of the last completed sync. */
  lastSyncAt: string | null
  /** False until the first full download from the server has finished (a new device). */
  initialSyncDone: boolean
  message: string | null
}

const INITIAL: SyncStatus = { phase: 'local-only', pending: 0, failed: 0, lastSyncAt: null, initialSyncDone: false, message: null }

let status: SyncStatus = INITIAL
const listeners = new Set<() => void>()

export const getSyncStatus = () => status

export function setSyncStatus(patch: Partial<SyncStatus>): void {
  const next = { ...status, ...patch }
  if ((Object.keys(next) as (keyof SyncStatus)[]).every((key) => next[key] === status[key])) return
  status = next
  listeners.forEach((listener) => listener())
}

export function resetSyncStatus(): void {
  setSyncStatus({ ...INITIAL })
}

export function subscribeSyncStatus(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
