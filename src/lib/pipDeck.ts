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

/** A deck of names (which bank of lines comes next), rebuilt whenever the set of names changes. */
export interface KeyDeck {
  /** What the deck was dealt from, so a different set of names starts a new deck. */
  sig: string
  /** Names still to deal, next first. */
  order: string[]
}

/**
 * Deals the next name from a shuffled deck of `keys` (a name can appear more than once to make it
 * come up more often). Never the same name twice in a row, even across a reshuffle.
 */
export function drawKey(deck: KeyDeck | null, keys: readonly string[], last: string | null, random: () => number = Math.random): { key: string; deck: KeyDeck } {
  if (keys.length === 0) throw new Error('No keys to draw from.')
  const sig = keys.join(',')
  let order = deck && deck.sig === sig ? [...deck.order] : []
  // A fresh deck when this one is spent, or when all that is left is more of the name just dealt.
  if (!order.some((k) => k !== last)) order = shuffled(keys.length, random).map((i) => keys[i])
  const at = order.findIndex((k) => k !== last)
  const [key] = order.splice(at === -1 ? 0 : at, 1)
  return { key, deck: { sig, order } }
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
