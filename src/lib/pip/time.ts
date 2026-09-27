// Small time helpers for the things Pip says: "two weeks ago", "this morning".

const DAY_MS = 24 * 60 * 60 * 1000
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

/** Calendar days from `from` to `to`, by local date (11 pm last night is 1 day ago at 8 am). */
export function daysBetween(from: Date | string | number, to: Date): number {
  const a = new Date(from)
  return Math.round((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DAY_MS)
}

/** "today", "yesterday", "three days ago", "two weeks ago", "a month ago", "four months ago". */
export function agoPhrase(days: number): string {
  const d = Math.max(0, Math.round(days))
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d <= 6) return `${WORDS[d]} days ago`
  if (d <= 9) return 'a week ago'
  if (d <= 17) return 'two weeks ago'
  if (d <= 24) return 'three weeks ago'
  if (d <= 40) return 'a month ago'
  if (d <= 52) return 'six weeks ago'
  const months = Math.round(d / 30.44)
  if (months >= 12) return 'a year ago'
  return `${WORDS[months] ?? months} months ago`
}

/** "in two weeks" style spans: "two weeks", "a month" (the same steps as agoPhrase, without "ago"). */
export const spanPhrase = (days: number): string => agoPhrase(days).replace(/ ago$/, '')

export type DayPart = 'late' | 'morning' | 'afternoon' | 'evening' | 'night'

export function dayPart(now: Date): DayPart {
  const hour = now.getHours()
  if (hour < 5) return 'late'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'night'
}
