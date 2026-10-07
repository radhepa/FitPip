import type { Session, SetRow } from '../types/db'
import { formatTime } from './format'

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

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short' })

/** "5:42 PM" today, "yesterday 5:42 PM", or "Mon 5:42 PM" further back. */
export function lastActivityLabel(iso: string, now: Date = new Date()): string {
  const at = new Date(iso)
  const time = formatTime(at)
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const daysAgo = Math.round((day(now) - day(at)) / 86_400_000)
  if (daysAgo === 0) return time
  if (daysAgo === 1) return `yesterday ${time}`
  return `${weekdayFormat.format(at)} ${time}`
}

/**
 * When the last set logged during a workout was logged (between its start and its end, when it has one), or
 * null. Sets added later while editing a finished workout are after its end, so they don't count.
 */
export function lastSetLogged(session: Pick<Session, 'started_at' | 'ended_at'>, sets: Pick<SetRow, 'created_at'>[]): string | null {
  if (!session.started_at) return null
  const start = Date.parse(session.started_at)
  const end = session.ended_at ? Date.parse(session.ended_at) : Infinity
  let last: string | null = null
  for (const set of sets) {
    const at = Date.parse(set.created_at)
    if (at >= start && at <= end && (last === null || at > Date.parse(last))) last = set.created_at
  }
  return last
}

/**
 * A finished workout that looks like it was left running before it was finished: its end came more than
 * STALE_AFTER_MS after the last set logged in it. Returns that set's time (the likely real end), else null.
 */
export function finishedLate(session: Pick<Session, 'started_at' | 'ended_at'>, sets: Pick<SetRow, 'created_at'>[]): string | null {
  if (!session.ended_at) return null
  const last = lastSetLogged(session, sets)
  return last !== null && Date.parse(session.ended_at) - Date.parse(last) > STALE_AFTER_MS ? last : null
}
