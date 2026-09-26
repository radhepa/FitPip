import { getMeta, setMeta, type FitPipDB } from '../local/db'
import { announceRemoteChange, onLocalWrite } from '../local/events'
import { countPending, runSync } from './engine'
import { SyncFailure, asFailure, supabaseRemote, type Remote } from './remote'
import { resetSyncStatus, setSyncStatus } from './status'

// Decides WHEN to sync. The engine (engine.ts) does the work of one sync.

const INTERVAL_MS = 60_000
const AFTER_WRITE_MS = 1_500
const MAX_BACKOFF_MS = 5 * 60_000

interface Context {
  db: FitPipDB
  userId: string
  remote: Remote
  detach: () => void
}

let ctx: Context | null = null
let running: Promise<void> | null = null
let rerun = false
let timer: ReturnType<typeof setTimeout> | null = null
let failures = 0

const offline = () => typeof navigator !== 'undefined' && navigator.onLine === false

/** Begins syncing this user's on-device data with the server, and keeps doing so. */
export async function startSync(db: FitPipDB, userId: string, remote: Remote = supabaseRemote): Promise<void> {
  stopSync()
  failures = 0
  const counts = await countPending(db)
  setSyncStatus({
    phase: offline() ? 'offline' : 'idle',
    ...counts,
    lastSyncAt: (await getMeta<string>(db, 'lastSyncAt')) ?? null,
    initialSyncDone: (await getMeta<boolean>(db, 'initialSyncDone')) ?? false,
    message: null,
  })

  const onOnline = () => {
    failures = 0
    void requestSync()
  }
  const onOffline = () => setSyncStatus({ phase: 'offline', message: null })
  const onVisible = () => {
    if (document.visibilityState === 'visible') void requestSync()
  }
  const unsubscribeWrites = onLocalWrite(() => {
    void refreshCounts()
    void requestSync(AFTER_WRITE_MS)
  })
  const interval = setInterval(() => {
    if (document.visibilityState === 'visible') void requestSync()
  }, INTERVAL_MS)
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('focus', onVisible)

  ctx = {
    db,
    userId,
    remote,
    detach: () => {
      unsubscribeWrites()
      clearInterval(interval)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    },
  }
  void requestSync()
}

export function stopSync(): void {
  ctx?.detach()
  ctx = null
  if (timer) clearTimeout(timer)
  timer = null
  rerun = false
  resetSyncStatus()
}

/** Guest mode: everything stays on the device. */
export function startLocalOnly(): void {
  stopSync()
}

/** Asks for a sync. With a delay it waits (and restarts the wait if asked again), so a burst of edits sends once. */
export function requestSync(delayMs = 0): Promise<void> {
  if (!ctx) return Promise.resolve()
  if (delayMs > 0) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      void run()
    }, delayMs)
    return Promise.resolve()
  }
  return run()
}

/** A sync the user asked for: try again from a clean slate and wait for it to finish. */
export function syncNow(): Promise<void> {
  failures = 0
  return requestSync()
}

function run(): Promise<void> {
  if (running) {
    rerun = true
    return running
  }
  running = cycle().finally(() => {
    running = null
    if (rerun) {
      rerun = false
      void run()
    }
  })
  return running
}

async function refreshCounts(): Promise<void> {
  if (!ctx) return
  const counts = await countPending(ctx.db)
  if (ctx) setSyncStatus(counts)
}

function scheduleRetry(): void {
  const delay = Math.min(MAX_BACKOFF_MS, 5_000 * 2 ** Math.min(failures, 6))
  failures += 1
  void requestSync(delay)
}

/** Runs one sync while holding a lock shared by every tab, so two tabs never sync at once. */
async function withTabLock(userId: string, work: () => Promise<void>): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.locks) {
    await work()
    return true
  }
  return navigator.locks.request(`fitpip-sync-${userId}`, { ifAvailable: true }, async (lock) => {
    if (!lock) return false
    await work()
    return true
  })
}

async function cycle(): Promise<void> {
  const current = ctx
  if (!current) return
  if (offline()) {
    await refreshCounts()
    setSyncStatus({ phase: 'offline', message: null })
    return
  }

  const ran = await withTabLock(current.userId, async () => {
    setSyncStatus({ phase: 'syncing', message: null })
    try {
      // Never sync one user's data into another user's account.
      if ((await current.remote.currentUserId()) !== current.userId) {
        throw new SyncFailure('auth', 'Sign in again to keep syncing. Your changes are safe on this device.')
      }
      const outcome = await runSync(current.db, current.remote)
      const lastSyncAt = new Date().toISOString()
      await setMeta(current.db, 'lastSyncAt', lastSyncAt)
      failures = 0
      if (ctx !== current) return
      if (outcome.changed) announceRemoteChange()
      setSyncStatus({ phase: 'idle', lastSyncAt, initialSyncDone: true, message: null, ...(await countPending(current.db)) })
    } catch (e) {
      if (ctx !== current) return
      const failure = asFailure(e)
      setSyncStatus({ ...(await countPending(current.db)) })
      if (failure.kind === 'network') {
        setSyncStatus({ phase: 'offline', message: null })
        scheduleRetry()
      } else if (failure.kind === 'auth') {
        setSyncStatus({ phase: 'signed-out', message: failure.message })
      } else {
        setSyncStatus({ phase: 'error', message: failure.message })
        scheduleRetry()
      }
    }
  })
  // Another tab is syncing right now. Look again shortly so this tab's counts catch up.
  if (!ran && ctx === current) {
    await refreshCounts()
    void requestSync(15_000)
  }
}
