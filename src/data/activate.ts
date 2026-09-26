import type { AuthSession } from './auth'
import { seedGuestIfNew } from './guest'
import { closeUserDb, openUserDb } from './local/context'
import { startLocalOnly, startSync, stopSync } from './sync/manager'

let activeUserId: string | null = null
let queue: Promise<void> = Promise.resolve()

async function switchTo(session: AuthSession | null): Promise<void> {
  const userId = session?.user.id ?? null
  if (userId === activeUserId) return // e.g. a token refresh: same person, nothing to reopen
  stopSync()
  closeUserDb()
  activeUserId = null
  if (!session) return

  const db = await openUserDb(session.user.id)
  if (session.guest) {
    await seedGuestIfNew(db)
    startLocalOnly()
  } else {
    await startSync(db, session.user.id)
  }
  activeUserId = userId
}

/**
 * Opens the on-device data for whoever is signed in (or closes it when nobody is) and starts or
 * stops syncing to match. Changes are applied one at a time, in order.
 */
export function activateSession(session: AuthSession | null): Promise<void> {
  const next = queue.then(() => switchTo(session))
  queue = next.catch(() => {})
  return next
}
