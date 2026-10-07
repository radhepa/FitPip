import { describe, expect, it } from 'vitest'
import { sameData } from './sameData'

describe('sameData', () => {
  it('matches equal rows read twice', () => {
    const read = () => ({ sets: [{ id: 'a', weight: 135, reps: 8, rpe: null }], exercises: [{ id: 'x', primary_muscles: ['chest'] }] })
    expect(sameData(read(), read())).toBe(true)
  })

  it('notices any changed, added or missing field', () => {
    expect(sameData([{ id: 'a', reps: 8 }], [{ id: 'a', reps: 9 }])).toBe(false)
    expect(sameData([{ id: 'a' }], [{ id: 'a' }, { id: 'b' }])).toBe(false)
    expect(sameData({ a: 1, b: undefined }, { a: 1, c: undefined })).toBe(false)
    expect(sameData({ a: null }, { a: undefined })).toBe(false)
    expect(sameData({ list: [] }, { list: {} })).toBe(false)
  })

  it('treats numbers the way the screen would show them', () => {
    expect(sameData(Number.NaN, Number.NaN)).toBe(true)
    expect(sameData(0, '0')).toBe(false)
  })

  it('only trusts identity for anything that is not plain data', () => {
    const map = new Map([['a', 1]])
    expect(sameData(map, map)).toBe(true)
    expect(sameData(new Map([['a', 1]]), new Map([['a', 1]]))).toBe(false)
    expect(sameData(new Date(0), new Date(0))).toBe(false)
    expect(sameData({ when: new Date(0) }, { when: new Date(0) })).toBe(false)
  })
})
