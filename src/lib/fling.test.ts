import { describe, expect, it } from 'vitest'
import { easeStep, easeTau, flingRest, releaseVelocity } from './fling'

describe('releaseVelocity', () => {
  it('measures the speed over the last samples', () => {
    const samples = [
      { t: 0, pos: 0 },
      { t: 50, pos: 1 },
      { t: 100, pos: 2 },
    ]
    expect(releaseVelocity(samples)).toBeCloseTo(0.02)
  })

  it('ignores movement older than the window', () => {
    const samples = [
      { t: 0, pos: 0 },
      { t: 10, pos: 5 },
      { t: 400, pos: 5 },
      { t: 450, pos: 5 },
    ]
    expect(releaseVelocity(samples)).toBe(0)
  })

  it('is zero with fewer than two samples', () => {
    expect(releaseVelocity([])).toBe(0)
    expect(releaseVelocity([{ t: 3, pos: 1 }])).toBe(0)
  })
})

describe('flingRest', () => {
  it('travels further the faster it is thrown, in the direction thrown', () => {
    expect(flingRest(70, 0.01)).toBeGreaterThan(71)
    expect(flingRest(70, 0.02) - 70).toBeCloseTo((flingRest(70, 0.01) - 70) * 2)
    expect(flingRest(70, -0.01)).toBeLessThan(69)
    expect(flingRest(70, 0)).toBe(70)
  })
})

describe('easeTau', () => {
  it('matches the throw speed', () => {
    expect(easeTau(3, 0.01, 200)).toBe(300)
  })

  it('stays within bounds and falls back when direction disagrees', () => {
    expect(easeTau(100, 0.01, 200)).toBe(700)
    expect(easeTau(0.1, 0.01, 200)).toBe(80)
    expect(easeTau(-1, 0.01, 200)).toBe(200)
    expect(easeTau(1, 0, 200)).toBe(200)
  })
})

describe('easeStep', () => {
  it('closes most of the gap over one time constant without overshooting', () => {
    const next = easeStep(0, 10, 100, 100)
    expect(next).toBeCloseTo(10 * (1 - Math.exp(-1)))
    let pos = 0
    for (let i = 0; i < 100; i++) pos = easeStep(pos, 10, 16, 100)
    expect(pos).toBeLessThanOrEqual(10)
    expect(pos).toBeCloseTo(10, 3)
  })
})
