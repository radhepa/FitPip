import { describe, expect, it } from 'vitest'
import { parseReps, parseRpe, parseWeight } from './parse'

describe('parseRpe', () => {
  it('reads 1 to 10 in half steps', () => {
    expect(parseRpe('8')).toEqual({ ok: true, value: 8 })
    expect(parseRpe('8.5')).toEqual({ ok: true, value: 8.5 })
    expect(parseRpe(' 7,5 ')).toEqual({ ok: true, value: 7.5 })
    expect(parseRpe('1')).toEqual({ ok: true, value: 1 })
    expect(parseRpe('10')).toEqual({ ok: true, value: 10 })
    expect(parseRpe('9.0')).toEqual({ ok: true, value: 9 })
  })

  it('treats blank as not recorded, which is valid', () => {
    expect(parseRpe('')).toEqual({ ok: true, value: null })
    expect(parseRpe('   ')).toEqual({ ok: true, value: null })
  })

  it('rejects out of range values, odd steps and junk', () => {
    for (const bad of ['0', '0.5', '10.5', '11', '7.3', '8.25', '-1', 'x', '8 9', '1e1', '.5', '8.']) {
      expect(parseRpe(bad)).toEqual({ ok: false })
    }
  })
})

describe('parseWeight', () => {
  it('parses integers and decimals, including a comma decimal separator', () => {
    expect(parseWeight('135')).toBe(135)
    expect(parseWeight('132.5')).toBe(132.5)
    expect(parseWeight('132,5')).toBe(132.5)
    expect(parseWeight(' 45. ')).toBe(45)
    expect(parseWeight('.5')).toBe(0.5)
  })

  it('treats blank as bodyweight (0)', () => {
    expect(parseWeight('')).toBe(0)
    expect(parseWeight('  ')).toBe(0)
  })

  it('rejects junk and negatives', () => {
    expect(parseWeight('abc')).toBeNull()
    expect(parseWeight('-5')).toBeNull()
    expect(parseWeight('1e3')).toBeNull()
    expect(parseWeight('12.3.4')).toBeNull()
    expect(parseWeight('100000')).toBeNull()
  })
})

describe('parseReps', () => {
  it('parses whole numbers of at least 1', () => {
    expect(parseReps('8')).toBe(8)
    expect(parseReps(' 12 ')).toBe(12)
  })

  it('rejects blank, zero, decimals and junk', () => {
    expect(parseReps('')).toBeNull()
    expect(parseReps('0')).toBeNull()
    expect(parseReps('8.5')).toBeNull()
    expect(parseReps('x')).toBeNull()
    expect(parseReps('5000')).toBeNull()
  })
})
