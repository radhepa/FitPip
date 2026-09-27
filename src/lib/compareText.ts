const collator = new Intl.Collator()

/**
 * Sorts text the same way as `a.localeCompare(b)`, with one shared collator instead of whatever
 * `localeCompare` sets up per call (costly on some engines when sorting the 500+ exercise names).
 */
export const compareText: (a: string, b: string) => number = collator.compare
