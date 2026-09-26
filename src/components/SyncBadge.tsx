import { Link, useLocation } from 'react-router-dom'
import type { SyncPhase } from '../data/sync/status'
import { useSyncStatus } from '../hooks/useSyncStatus'
import { summarizeSync, type SyncTone } from '../lib/syncSummary'
import { AlertIcon, CloudCheckIcon, CloudOffIcon, SyncIcon } from './icons'

/** One icon for the current sync state. */
export function SyncStateIcon({ phase, tone }: { phase: SyncPhase; tone: SyncTone }) {
  if (phase === 'syncing' || tone === 'busy') {
    return (
      <span className="sync-spin">
        <SyncIcon />
      </span>
    )
  }
  if (phase === 'offline') return <CloudOffIcon />
  if (tone === 'warn') return <AlertIcon />
  return <CloudCheckIcon />
}

/** A small round icon (next to Settings on Today) that shows whether your data is safely synced. */
export function SyncBadge() {
  const status = useSyncStatus()
  const summary = summarizeSync(status)
  return (
    <Link to="/settings" className="icon-button sync-badge" data-tone={summary.tone} aria-label={`${summary.label}. Open sync settings`}>
      <SyncStateIcon phase={status.phase} tone={summary.tone} />
    </Link>
  )
}

/** A strip at the top of the page while offline or when something needs a look. Silent otherwise. */
export function SyncBanner() {
  const { pathname } = useLocation()
  const status = useSyncStatus()
  const summary = summarizeSync(status)
  if (!summary.needsAttention || pathname === '/settings') return null
  return (
    <Link to="/settings" role="status" className="sync-banner" data-tone={summary.tone}>
      <SyncStateIcon phase={status.phase} tone={summary.tone} />
      <span className="min-w-0">
        <strong>{summary.label}</strong>
        {summary.detail && <span> · {summary.detail}</span>}
      </span>
    </Link>
  )
}
