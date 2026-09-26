import { useState } from 'react'
import { signOut } from '../data/auth'
import { syncNow } from '../data/sync/manager'
import { useSyncStatus } from '../hooks/useSyncStatus'
import { Button } from './Button'
import { Loading } from './feedback'
import { Pip } from './Pip'

/**
 * Shown once on a new device (or after signing in fresh) while the account's data is downloaded.
 * After that the app works without a connection, so this only appears when there is no copy yet.
 */
export function FirstSyncScreen() {
  const status = useSyncStatus()
  const [busy, setBusy] = useState(false)
  const stuck = status.phase === 'offline' || status.phase === 'error' || status.phase === 'signed-out'

  const message =
    status.phase === 'offline'
      ? "You're offline. Connect once so FitPip can download your data. After that it works without a connection."
      : (status.message ?? 'Downloading your workouts…')

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-md content-center gap-4 px-4 py-8 text-center">
      <div className="mx-auto">
        <Pip pose={stuck ? 'think' : 'idle'} size={120} />
      </div>
      <h1 className="font-display text-3xl font-extrabold">{stuck ? 'Waiting to download your data' : 'Getting your data ready'}</h1>
      <p className="text-muted" role="status">
        {message}
      </p>
      {!stuck && <Loading rows={2} label="Downloading your data" />}
      {stuck && (
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="primary"
            block
            disabled={busy || status.phase === 'signed-out'}
            onClick={async () => {
              setBusy(true)
              try {
                await syncNow()
              } finally {
                setBusy(false)
              }
            }}
          >
            Try again
          </Button>
          <Button block onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      )}
    </main>
  )
}
