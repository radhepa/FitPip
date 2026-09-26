import { describe, expect, it } from 'vitest'
import { estimate1RM } from './e1rm'

describe('estimate1RM', () => {
  it('uses the Epley formula', () => {
    expect(estimate1RM(100, 5)).toBe(116.7)
    expect(estimate1RM(135, 10)).toBe(180)
  })

  it('treats a single rep as its own max', () => {
    expect(estimate1RM(225, 1)).toBe(225)
  })

  it('returns 0 for empty or bodyweight-only sets', () => {
    expect(estimate1RM(0, 10)).toBe(0)
    expect(estimate1RM(100, 0)).toBe(0)
  })
})
