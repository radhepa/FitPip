import { describe, expect, it } from 'vitest'
import { clampRest, REST_MAX, REST_MIN, restText, stepRest } from './rest'

describe('clampRest', () => {
  it('keeps values in range, rounds, and treats 0 or junk as off', () => {
    expect(clampRest(90)).toBe(90)
    expect(clampRest(5)).toBe(REST_MIN)
    expect(clampRest(9999)).toBe(REST_MAX)
    expect(clampRest(74.6)).toBe(75)
    expect(clampRest(0)).toBe(0)
    expect(clampRest(-3)).toBe(0)
    expect(clampRest(Number.NaN)).toBe(0)
  })
})

describe('stepRest', () => {
  it('moves in 15 s steps up to two minutes, then 30 s', () => {
    expect(stepRest(90, 1)).toBe(105)
    expect(stepRest(105, 1)).toBe(120)
    expect(stepRest(120, 1)).toBe(150)
    expect(stepRest(150, 1)).toBe(180)
  })

  it('comes back down the same way', () => {
    expect(stepRest(180, -1)).toBe(150)
    expect(stepRest(150, -1)).toBe(120)
    expect(stepRest(120, -1)).toBe(105)
    expect(stepRest(30, -1)).toBe(REST_MIN)
  })

  it('stops at the limits', () => {
    expect(stepRest(REST_MAX, 1)).toBe(REST_MAX)
    expect(stepRest(REST_MIN, -1)).toBe(REST_MIN)
  })
})

describe('restText', () => {
  it('reads as a clock', () => {
    expect(restText(90)).toBe('1:30')
    expect(restText(120)).toBe('2:00')
    expect(restText(45)).toBe('0:45')
  })
})
