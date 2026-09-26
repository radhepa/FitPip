import type { SyncStatus } from '../data/sync/status'

/** ok = all good, busy = working on it, wait = will fix itself, warn = needs a look. */
export type SyncTone = 'ok' | 'busy' | 'wait' | 'warn'

export interface SyncSummary {
  tone: SyncTone
  label: string
  detail: string | null
  /** Worth interrupting the user for (shown as a banner, not just an icon). */
  needsAttention: boolean
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/** "just now", "5 min ago", "3 h ago", "yesterday", "4 days ago". */
export function timeAgo(iso: string, now: number): string {
  const minutes = Math.floor((now - Date.parse(iso)) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

/** Turns the sync state into the words shown by the indicator, banner and Settings card. */
export function summarizeSync(status: SyncStatus, now: number = Date.now()): SyncSummary {
  const { phase, pending, failed, lastSyncAt, message } = status
  switch (phase) {
    case 'local-only':
      return { tone: 'ok', label: 'Saved on this device', detail: 'Guest mode keeps everything on this device only.', needsAttention: false }
    case 'signed-out':
      return { tone: 'warn', label: 'Sign in to sync', detail: message ?? 'Your changes are safe on this device.', needsAttention: true }
    case 'offline':
      return {
        tone: 'wait',
        label: 'Offline',
        detail: pending > 0 ? `${plural(pending, 'change')} will sync when you're back online.` : 'Everything is saved on this device.',
        needsAttention: true,
      }
    case 'error':
      return { tone: 'warn', label: 'Sync problem', detail: message ?? 'Trying again shortly.', needsAttention: true }
    case 'syncing':
      return { tone: 'busy', label: 'Syncing…', detail: null, needsAttention: false }
    case 'idle':
      if (failed > 0) return { tone: 'warn', label: `${plural(failed, 'change')} couldn't sync`, detail: 'Tap to review.', needsAttention: true }
      if (pending > 0) return { tone: 'busy', label: `${plural(pending, 'change')} waiting to sync`, detail: null, needsAttention: false }
      return { tone: 'ok', label: 'Synced', detail: lastSyncAt ? `Last synced ${timeAgo(lastSyncAt, now)}` : null, needsAttention: false }
  }
}
