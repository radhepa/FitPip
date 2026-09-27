import { describe, expect, it } from 'vitest'
import { drawKey, drawLine, parseDeck, shuffled, type KeyDeck, type PipDeck } from './pipDeck'

/** A repeatable pseudo-random source. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

describe('shuffled', () => {
  it('is a permutation', () => {
    expect(shuffled(20, seeded(1)).sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i))
  })
})

describe('drawLine', () => {
  it('shows every line once before any repeats', () => {
    const random = seeded(7)
    let deck: PipDeck | null = null
    const seen: number[] = []
    for (let i = 0; i < 30; i += 1) {
      const next = drawLine(deck, 30, random)
      seen.push(next.index)
      deck = next.deck
    }
    expect(new Set(seen).size).toBe(30)
  })

  it('never repeats a line across a reshuffle', () => {
    const random = seeded(3)
    let deck: PipDeck | null = null
    let previous = -1
    for (let i = 0; i < 500; i += 1) {
      const next = drawLine(deck, 4, random)
      expect(next.index).not.toBe(previous)
      previous = next.index
      deck = next.deck
    }
  })

  it('starts a fresh deck when the number of lines changes', () => {
    const stale: PipDeck = { order: [40, 41], size: 42, last: 3 }
    const next = drawLine(stale, 10, seeded(1))
    expect(next.index).toBeLessThan(10)
    expect(next.deck.size).toBe(10)
    expect(next.deck.order).toHaveLength(9)
  })
})

describe('parseDeck', () => {
  it('reads a stored deck and rejects anything else', () => {
    expect(parseDeck(JSON.stringify({ order: [1, 2], size: 5, last: 0 }))).toEqual({ order: [1, 2], size: 5, last: 0 })
    expect(parseDeck(null)).toBeNull()
    expect(parseDeck('not json')).toBeNull()
    expect(parseDeck(JSON.stringify({ order: 'x', size: 5 }))).toBeNull()
  })
})

describe('drawKey', () => {
  it('deals every name in the deck once before reshuffling', () => {
    const keys = ['a', 'b', 'c', 'd', 'e']
    let deck: KeyDeck | null = null
    let last: string | null = null
    const drawn: string[] = []
    const random = seeded(4)
    for (let i = 0; i < 5; i += 1) {
      const next = drawKey(deck, keys, last, random)
      drawn.push(next.key)
      deck = next.deck
      last = next.key
    }
    expect([...drawn].sort()).toEqual([...keys].sort())
  })

  it('never deals the same name twice in a row, even across a reshuffle', () => {
    const keys = ['x', 'x', 'y', 'z']
    const random = seeded(8)
    let deck: KeyDeck | null = null
    let last: string | null = null
    for (let i = 0; i < 500; i += 1) {
      const next = drawKey(deck, keys, last, random)
      expect(next.key).not.toBe(last)
      deck = next.deck
      last = next.key
    }
  })

  it('deals a weighted name more often (but never twice in a row, so at most every other draw)', () => {
    const keys = ['heavy', 'heavy', 'heavy', 'heavy', 'a', 'b']
    const random = seeded(2)
    let deck: KeyDeck | null = null
    let last: string | null = null
    const counts: Record<string, number> = { heavy: 0, a: 0, b: 0 }
    for (let i = 0; i < 400; i += 1) {
      const next = drawKey(deck, keys, last, random)
      counts[next.key] += 1
      deck = next.deck
      last = next.key
    }
    expect(counts.heavy).toBeGreaterThan(counts.a * 1.5)
    expect(counts.heavy).toBeGreaterThan(counts.b * 1.5)
    expect(counts.a).toBeGreaterThan(0)
  })

  it('starts a new deck when the set of names changes', () => {
    const first = drawKey(null, ['a', 'b', 'c'], null, seeded(1))
    const second = drawKey(first.deck, ['a', 'b', 'c', 'd'], null, seeded(1))
    expect(second.deck.sig).toBe('a,b,c,d')
    expect(second.deck.order).toHaveLength(3)
  })

  it('has nothing to deal from an empty list', () => {
    expect(() => drawKey(null, [], null)).toThrow()
  })

  it('still deals a single name', () => {
    expect(drawKey(null, ['only'], 'only', seeded(1)).key).toBe('only')
  })
})
