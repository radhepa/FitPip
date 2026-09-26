import { useState } from 'react'
import { discardRejectedChanges, listRejectedChanges, retryRejectedChanges } from '../data/sync/actions'
import { syncNow } from '../data/sync/manager'
import { errorMessage } from '../data/unwrap'
import { useAsync } from '../hooks/useAsync'
import { useSyncStatus } from '../hooks/useSyncStatus'
import { summarizeSync } from '../lib/syncSummary'
import { Button } from './Button'
import { SyncStateIcon } from './SyncBadge'

/** Settings: is my data safe, when did it last sync, and what to do about anything the server refused. */
export function SyncCard() {
  const status = useSyncStatus()
  const summary = summarizeSync(status)
  const rejected = useAsync(listRejectedChanges, [status.failed])
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  async function run(work: () => Promise<string | void>) {
    setBusy(true)
    setNote(null)
    try {
      setNote((await work()) ?? null)
    } catch (e) {
      setNote(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const local = status.phase === 'local-only'
  const canSync = status.phase === 'idle' || status.phase === 'error'

  return (
    <section id="sync" className="card p-4 lg:col-span-2">
      <h2 className="mb-3 font-display text-lg font-extrabold">Sync</h2>
      <div className="flex items-center gap-3">
        <span className="sync-badge icon-button" data-tone={summary.tone} aria-hidden="true">
          <SyncStateIcon phase={status.phase} tone={summary.tone} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{summary.label}</p>
          {summary.detail && <p className="text-sm text-muted">{summary.detail}</p>}
        </div>
        {!local && (
          <Button size="sm" disabled={busy || !canSync} onClick={() => run(async () => void (await syncNow()))}>
            Sync now
          </Button>
        )}
      </div>

      {status.phase === 'signed-out' && (
        <p className="mt-3 text-sm text-muted">Sign out below and sign in again to resume syncing. Your changes stay on this device.</p>
      )}
      {!local && status.pending > 0 && status.failed === 0 && <p className="mt-3 text-sm text-muted">Everything you log is saved on this device first, so it is never lost while waiting.</p>}

      {status.failed > 0 && (
        <div className="mt-4 rounded-xl border border-danger/40 p-3">
          <p className="text-sm font-bold text-danger">The server refused {status.failed === 1 ? 'this change' : 'these changes'}:</p>
          <ul className="mt-2 grid grid-cols-1 gap-1 text-sm">
            {rejected.data?.slice(0, 5).map((change) => (
              <li key={change.key} className="min-w-0">
                <span className="font-semibold">
                  {change.action[0].toUpperCase() + change.action.slice(1)} {change.what}:
                </span>{' '}
                <span className="text-muted">{change.message}</span>
              </li>
            ))}
            {(rejected.data?.length ?? 0) > 5 && <li className="text-muted">…and {(rejected.data?.length ?? 0) - 5} more.</li>}
          </ul>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button size="sm" disabled={busy} onClick={() => run(async () => void (await retryRejectedChanges()))}>
              Try again
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={busy}
              onClick={() => {
                if (!window.confirm('Discard these changes? The affected items go back to how they are on the server.')) return
                void run(async () => `Discarded ${await discardRejectedChanges()} change(s).`)
              }}
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      {note && <p className="mt-3 text-sm">{note}</p>}
    </section>
  )
}
