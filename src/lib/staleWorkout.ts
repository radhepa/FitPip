import type { Session, SetRow } from '../types/db'

/** A running workout with nothing logged for this long was most likely never finished. */
export const STALE_AFTER_MS = 3 * 60 * 60 * 1000

/**
 * When a running workout looks forgotten: the time of its last logged set (or its start, with no sets)
 * if that was over STALE_AFTER_MS ago. Null while it is still plausibly going, or not running.
 */
export function forgottenSince(session: Pick<Session, 'started_at' | 'ended_at'>, sets: Pick<SetRow, 'created_at'>[], now: Date = new Date()): string | null {
  if (!session.started_at || session.ended_at) return null
  const last = sets.reduce((latest, s) => (s.created_at > latest ? s.created_at : latest), session.started_at)
  return now.getTime() - new Date(last).getTime() > STALE_AFTER_MS ? last : null
}

/** "5:42 PM" today, "yesterday 5:42 PM", or "Mon 5:42 PM" further back. */
export function lastActivityLabel(iso: string, now: Date = new Date()): string {
  const at = new Date(iso)
  const time = at.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const daysAgo = Math.round((day(now) - day(at)) / 86_400_000)
  if (daysAgo === 0) return time
  if (daysAgo === 1) return `yesterday ${time}`
  return `${at.toLocaleDateString(undefined, { weekday: 'short' })} ${time}`
}
