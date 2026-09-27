import { describe, expect, it } from 'vitest'
import { agoPhrase, dayPart, daysBetween, spanPhrase } from './time'

describe('daysBetween', () => {
  it('counts calendar days, not 24-hour blocks', () => {
    const morning = new Date(2026, 8, 26, 8, 0)
    expect(daysBetween(new Date(2026, 8, 25, 23, 0), morning)).toBe(1)
    expect(daysBetween(new Date(2026, 8, 26, 1, 0), morning)).toBe(0)
    expect(daysBetween(new Date(2026, 8, 12, 12, 0), morning)).toBe(14)
  })

  it('is not thrown off by clocks changing', () => {
    // 2026-03-08 is the US spring-forward date
    expect(daysBetween(new Date(2026, 2, 1, 12), new Date(2026, 2, 15, 12))).toBe(14)
  })

  it('takes ISO strings', () => {
    const now = new Date(2026, 8, 26, 12)
    expect(daysBetween(new Date(2026, 8, 19, 9).toISOString(), now)).toBe(7)
  })
})

describe('agoPhrase', () => {
  it('reads like a person', () => {
    expect(agoPhrase(0)).toBe('today')
    expect(agoPhrase(1)).toBe('yesterday')
    expect(agoPhrase(3)).toBe('three days ago')
    expect(agoPhrase(7)).toBe('a week ago')
    expect(agoPhrase(14)).toBe('two weeks ago')
    expect(agoPhrase(15)).toBe('two weeks ago')
    expect(agoPhrase(21)).toBe('three weeks ago')
    expect(agoPhrase(30)).toBe('a month ago')
    expect(agoPhrase(45)).toBe('six weeks ago')
    expect(agoPhrase(61)).toBe('two months ago')
    expect(agoPhrase(200)).toBe('seven months ago')
    expect(agoPhrase(400)).toBe('a year ago')
  })

  it('never goes negative', () => {
    expect(agoPhrase(-3)).toBe('today')
  })

  it('has a span form', () => {
    expect(spanPhrase(14)).toBe('two weeks')
    expect(spanPhrase(30)).toBe('a month')
  })
})

describe('dayPart', () => {
  it('splits the day', () => {
    const at = (h: number) => dayPart(new Date(2026, 8, 26, h))
    expect([at(2), at(8), at(13), at(18), at(22)]).toEqual(['late', 'morning', 'afternoon', 'evening', 'night'])
  })
})
