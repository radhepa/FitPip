import { describe, expect, it } from 'vitest'
import type { SyncStatus } from '../data/sync/status'
import { summarizeSync, timeAgo } from './syncSummary'

const NOW = Date.parse('2026-03-01T12:00:00Z')
const status = (over: Partial<SyncStatus>): SyncStatus => ({ phase: 'idle', pending: 0, failed: 0, lastSyncAt: null, initialSyncDone: true, message: null, ...over })

describe('timeAgo', () => {
  it('reads naturally at each scale', () => {
    expect(timeAgo('2026-03-01T11:59:40Z', NOW)).toBe('just now')
    expect(timeAgo('2026-03-01T11:55:00Z', NOW)).toBe('5 min ago')
    expect(timeAgo('2026-03-01T09:00:00Z', NOW)).toBe('3 h ago')
    expect(timeAgo('2026-02-28T10:00:00Z', NOW)).toBe('yesterday')
    expect(timeAgo('2026-02-25T12:00:00Z', NOW)).toBe('4 days ago')
  })
})

describe('summarizeSync', () => {
  it('says synced, and when, when nothing is waiting', () => {
    const s = summarizeSync(status({ lastSyncAt: '2026-03-01T11:58:00Z' }), NOW)
    expect(s).toMatchObject({ tone: 'ok', label: 'Synced', detail: 'Last synced 2 min ago', needsAttention: false })
  })

  it('is quiet while changes wait or a sync runs', () => {
    expect(summarizeSync(status({ pending: 1 }), NOW)).toMatchObject({ tone: 'busy', label: '1 change waiting to sync', needsAttention: false })
    expect(summarizeSync(status({ phase: 'syncing' }), NOW)).toMatchObject({ tone: 'busy', needsAttention: false })
  })

  it('tells the user offline is fine, and how much is waiting', () => {
    expect(summarizeSync(status({ phase: 'offline' }), NOW)).toMatchObject({ tone: 'wait', detail: 'Everything is saved on this device.', needsAttention: true })
    expect(summarizeSync(status({ phase: 'offline', pending: 3 }), NOW).detail).toBe("3 changes will sync when you're back online.")
  })

  it('flags refused changes and server trouble as needing a look', () => {
    expect(summarizeSync(status({ failed: 2 }), NOW)).toMatchObject({ tone: 'warn', label: "2 changes couldn't sync", needsAttention: true })
    expect(summarizeSync(status({ phase: 'error', message: 'The server is busy.' }), NOW)).toMatchObject({ tone: 'warn', detail: 'The server is busy.' })
    expect(summarizeSync(status({ phase: 'signed-out' }), NOW)).toMatchObject({ tone: 'warn', label: 'Sign in to sync' })
  })

  it('explains guest mode', () => {
    expect(summarizeSync(status({ phase: 'local-only' }), NOW)).toMatchObject({ tone: 'ok', label: 'Saved on this device', needsAttention: false })
  })
})
