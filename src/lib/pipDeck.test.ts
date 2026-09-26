import { describe, expect, it } from 'vitest'
import { PIP_LINES } from '../config/pipLines'
import { drawLine, parseDeck, shuffled, type PipDeck } from './pipDeck'

/** A repeatable pseudo-random source. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

describe('PIP_LINES', () => {
  it('has between 50 and 100 distinct lines', () => {
    expect(PIP_LINES.length).toBeGreaterThanOrEqual(50)
    expect(PIP_LINES.length).toBeLessThanOrEqual(100)
    expect(new Set(PIP_LINES).size).toBe(PIP_LINES.length)
  })

  it('keeps every line short enough for the speech bubble', () => {
    for (const line of PIP_LINES) expect(line.length, line).toBeLessThanOrEqual(110)
  })
})

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
