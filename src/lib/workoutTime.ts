/** A moment as the phone's date and time fields hold it: "2026-09-29" and "17:05", in local time. */
export interface TimeParts {
  date: string
  time: string
}

/** Longest a workout can be set to last. Anything longer is almost always a typo in the date. */
export const MAX_WORKOUT_MS = 24 * 60 * 60 * 1000

// A minute of slack for "in the future", so a time picked for right now is never refused.
const CLOCK_SLACK_MS = 60 * 1000

const pad2 = (n: number) => String(n).padStart(2, '0')

export function toTimeParts(iso: string): TimeParts {
  const d = new Date(iso)
  return {
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  }
}

/**
 * The moment the fields describe, or null when one is blank or not a real date. When they still show
 * `original`, that is returned as it was, so an untouched time keeps its seconds.
 */
export function fromTimeParts(parts: TimeParts, original?: string | null): string | null {
  if (original) {
    const was = toTimeParts(original)
    if (was.date === parts.date && was.time === parts.time) return original
  }
  const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(parts.date)
  const time = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(parts.time)
  if (!date || !time) return null
  const [year, month, day] = [Number(date[1]), Number(date[2]), Number(date[3])]
  const [hours, minutes, seconds] = [Number(time[1]), Number(time[2]), Number(time[3] ?? 0)]
  if (hours > 23 || minutes > 59 || seconds > 59) return null
  const at = new Date(year, month - 1, day, hours, minutes, seconds)
  // new Date rolls Feb 31 over into March: that is not a date anyone picked.
  if (at.getFullYear() !== year || at.getMonth() !== month - 1 || at.getDate() !== day) return null
  return at.toISOString()
}

/**
 * What is wrong with these times, or null when they can be saved. `endedAt` is undefined for a workout
 * that is still running (only its start can change) and null when the finish fields are not filled in.
 */
export function workoutTimeProblem(startedAt: string | null, endedAt: string | null | undefined, now: Date = new Date()): string | null {
  const latest = now.getTime() + CLOCK_SLACK_MS
  if (!startedAt) return 'Pick the day and time it started.'
  const start = new Date(startedAt).getTime()
  if (start > latest) return "It can't start in the future."
  if (endedAt === undefined) return null
  if (!endedAt) return 'Pick the day and time it finished.'
  const end = new Date(endedAt).getTime()
  if (end < start) return "It can't finish before it starts."
  if (end > latest) return "It can't finish in the future."
  if (end - start > MAX_WORKOUT_MS) return 'A workout can be up to 24 hours long. Check the dates.'
  return null
}
