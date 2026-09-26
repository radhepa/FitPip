import { FitPipDB } from './db'

/** The user id the demo ("guest") data is stored under. Guest data never syncs. */
export const GUEST_USER_ID = 'guest-local'

interface Active {
  userId: string
  db: FitPipDB
}

let active: Active | null = null

export const dbNameFor = (userId: string) => `fitpip-${userId}`

/** Opens (creating if needed) the on-device database for this user and makes it the current one. */
export async function openUserDb(userId: string): Promise<FitPipDB> {
  if (active?.userId === userId) return active.db
  active?.db.close()
  active = null
  const db = new FitPipDB(dbNameFor(userId))
  await db.open()
  active = { userId, db }
  void keepStorage()
  return db
}

/** Tests only: makes an already-open database the current one (to play two devices in turn). */
export function setActiveDbForTests(db: FitPipDB, userId: string): void {
  active = { userId, db }
}

export function closeUserDb(): void {
  active?.db.close()
  active = null
}

export function hasDb(): boolean {
  return active !== null
}

export function getDb(): FitPipDB {
  if (!active) throw new Error('You are signed out. Sign in to continue.')
  return active.db
}

export function getUserId(): string {
  if (!active) throw new Error('You are signed out. Sign in to continue.')
  return active.userId
}

export const isGuestUser = () => active?.userId === GUEST_USER_ID

/** Asks the browser not to evict this data when storage runs low (iOS and Android may otherwise). */
async function keepStorage(): Promise<void> {
  try {
    await navigator.storage?.persist?.()
  } catch {
    // Not fatal: the data is also on the server.
  }
}
