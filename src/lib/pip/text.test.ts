import { describe, expect, it } from 'vitest'
import { capitalize, fill, hash, pickVariant, plural, tidy } from './text'

describe('fill', () => {
  it('fills every slot, more than once if needed', () => {
    expect(fill('{lift}: {w} {unit}, then {w} again', { lift: 'Bench', w: 155, unit: 'lb' })).toBe('Bench: 155 lb, then 155 again')
  })

  it('refuses a template with a missing slot rather than saying "{w}" out loud', () => {
    expect(() => fill('Now {w}', {})).toThrow(/needs \{w\}/)
  })
})

describe('helpers', () => {
  it('capitalizes and pluralizes', () => {
    expect(capitalize('two weeks ago')).toBe('Two weeks ago')
    expect(plural(1, 'workout')).toBe('workout')
    expect(plural(3, 'workout')).toBe('workouts')
    expect(plural(2, 'day', 'days')).toBe('days')
  })

  it('tidies numbers', () => {
    expect(tidy(2)).toBe('2')
    expect(tidy(2.04)).toBe('2')
    expect(tidy(1.26)).toBe('1.3')
    expect(tidy(0.5)).toBe('0.5')
  })

  it('chooses the same wording for the same seed and spreads across seeds', () => {
    const words = ['a', 'b', 'c', 'd']
    expect(pickVariant(words, 'x|2026-09-26')).toBe(pickVariant(words, 'x|2026-09-26'))
    expect(hash('abc')).toBe(hash('abc'))
    const seen = new Set(Array.from({ length: 40 }, (_, i) => pickVariant(words, `id|${i}`)))
    expect(seen.size).toBe(4)
    expect(() => pickVariant([], 'x')).toThrow()
  })
})
