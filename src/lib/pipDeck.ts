/**
 * Pip's lines are dealt like a shuffled deck: every line is shown once before any repeats, and a
 * new deck never starts with the line that ended the last one. The deck (just indexes) is kept in
 * localStorage so it carries across app launches.
 */
export interface PipDeck {
  /** Indexes still to show, next first. */
  order: number[]
  /** How many lines the deck was dealt for (a changed list means a fresh deck). */
  size: number
  last: number | null
}

export function shuffled(count: number, random: () => number = Math.random): number[] {
  const order = Array.from({ length: count }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

/** Takes the next line index. Returns it and the deck to store. */
export function drawLine(deck: PipDeck | null, count: number, random: () => number = Math.random): { index: number; deck: PipDeck } {
  if (count <= 0) throw new Error('No lines to draw from.')
  let order = deck && deck.size === count ? deck.order.filter((i) => i >= 0 && i < count) : []
  const last = deck?.last ?? null
  if (order.length === 0) {
    order = shuffled(count, random)
    // Never the same line twice in a row across a reshuffle.
    if (count > 1 && order[0] === last) order.push(order.shift()!)
  }
  const [index, ...rest] = order
  return { index, deck: { order: rest, size: count, last: index } }
}

/** Reads a stored deck, or null if it is missing or not a deck. */
export function parseDeck(raw: string | null): PipDeck | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<PipDeck>
    if (!Array.isArray(value.order) || typeof value.size !== 'number') return null
    return { order: value.order.filter((n): n is number => Number.isInteger(n)), size: value.size, last: typeof value.last === 'number' ? value.last : null }
  } catch {
    return null
  }
}
