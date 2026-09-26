import { describe, expect, it } from 'vitest'
import { defaultTarget, describeTarget, sectionOf } from './activity'
import { formatEntry, formatMinutes, formatSeconds } from './format'
import { parseDistance, parseDuration } from './parse'
import { convertWeight, distanceInput, formatDistance, formatPace, fromMetres, lengthUnitFor, toMetres } from './units'

describe('lengths', () => {
  it('uses pool units for swimming', () => {
    expect(lengthUnitFor('swim', 'mi')).toBe('yd')
    expect(lengthUnitFor('swim', 'km')).toBe('m')
    expect(lengthUnitFor('cardio', 'mi')).toBe('mi')
  })

  it('round-trips through metres', () => {
    expect(toMetres(5, 'km')).toBe(5000)
    expect(toMetres(3.1, 'mi')).toBe(4988.97)
    expect(Number(fromMetres(toMetres(3.1, 'mi'), 'mi').toFixed(2))).toBe(3.1)
    expect(distanceInput(toMetres(1650, 'yd'), 'yd')).toBe('1650')
  })

  it('formats distances', () => {
    expect(formatDistance(5020, 'km')).toBe('5.02 km')
    expect(formatDistance(1500, 'm')).toBe('1,500 m')
    expect(formatDistance(toMetres(26.2, 'mi'), 'mi')).toBe('26.2 mi')
  })

  it('formats pace per mile/km, and per 100 in the pool', () => {
    expect(formatPace(1560, 5000, 'km')).toBe('5:12 /km')
    expect(formatPace(900, 1000, 'm')).toBe('1:30 /100 m')
    expect(formatPace(null, 5000, 'km')).toBeNull()
    expect(formatPace(600, null, 'km')).toBeNull()
  })

  it('converts body weight to one decimal', () => {
    expect(convertWeight(180, 'lb', 'kg')).toBe(81.6)
    expect(convertWeight(80, 'kg', 'lb')).toBe(176.4)
    expect(convertWeight(80, 'kg', 'kg')).toBe(80)
  })
})

describe('parseDuration', () => {
  it('reads bare numbers in the given unit', () => {
    expect(parseDuration('45')).toBe(45)
    expect(parseDuration('30', 'minutes')).toBe(1800)
    expect(parseDuration('1.5', 'minutes')).toBe(90)
  })

  it('reads m:ss and h:mm:ss', () => {
    expect(parseDuration('1:30')).toBe(90)
    expect(parseDuration('26:10', 'minutes')).toBe(1570)
    expect(parseDuration('1:02:03')).toBe(3723)
  })

  it('rejects blanks, junk and impossible clocks', () => {
    expect(parseDuration('')).toBeNull()
    expect(parseDuration('abc')).toBeNull()
    expect(parseDuration('1:75')).toBeNull()
    expect(parseDuration('0')).toBeNull()
    expect(parseDuration('25:00:00')).toBeNull()
  })
})

describe('parseDistance', () => {
  it('distinguishes blank from invalid', () => {
    expect(parseDistance('')).toBeNull()
    expect(parseDistance('3,1')).toBe(3.1)
    expect(parseDistance('0')).toBeUndefined()
    expect(parseDistance('far')).toBeUndefined()
  })
})

describe('formatting time and entries', () => {
  it('formats seconds and minutes', () => {
    expect(formatSeconds(45)).toBe('45s')
    expect(formatSeconds(180)).toBe('3:00')
    expect(formatMinutes(2700)).toBe('45 min')
    expect(formatMinutes(4800)).toBe('1 h 20 min')
  })

  it('describes any kind of set', () => {
    const base = { weight: 0, reps: 0, rpe: null, duration_seconds: null, distance_m: null }
    expect(formatEntry({ ...base, weight: 135, reps: 8 }, 'lb')).toBe('135 lb × 8')
    expect(formatEntry({ ...base, duration_seconds: 180 }, 'lb')).toBe('3:00')
    expect(formatEntry({ ...base, duration_seconds: 1560, distance_m: 5000 }, 'lb', 'km')).toBe('5 km in 26:00 · 5:12 /km')
    expect(formatEntry({ ...base, distance_m: 1500 }, 'lb', 'm')).toBe('1,500 m')
  })
})

describe('activity targets', () => {
  it('starts each kind of activity with a sensible target', () => {
    expect(defaultTarget({ category: 'strength', tracking: 'reps' })).toEqual({ targetSets: 3, targetReps: 10, targetSeconds: null })
    expect(defaultTarget({ category: 'combat', tracking: 'time' }).targetSeconds).toBe(180)
    expect(defaultTarget({ category: 'cardio', tracking: 'distance' })).toMatchObject({ targetSets: 1, targetSeconds: 1800 })
  })

  it('describes targets briefly', () => {
    expect(describeTarget({ tracking: 'reps' }, { targetSets: 3, targetReps: 10, targetSeconds: null })).toBe('3 × 10')
    expect(describeTarget({ tracking: 'time' }, { targetSets: 3, targetReps: 1, targetSeconds: 180 })).toBe('3 × 3:00')
    expect(describeTarget({ tracking: 'time' }, { targetSets: 2, targetReps: 1, targetSeconds: 30 })).toBe('2 × 30s')
    expect(describeTarget({ tracking: 'distance' }, { targetSets: 1, targetReps: 1, targetSeconds: 1800 })).toBe('30 min')
  })

  it('puts swimming and boxing in the cardio section, yoga in mobility', () => {
    expect(sectionOf({ category: 'swim' })).toBe('cardio')
    expect(sectionOf({ category: 'combat' })).toBe('cardio')
    expect(sectionOf({ category: 'yoga' })).toBe('mobility')
    expect(sectionOf({ category: 'strength' })).toBe('strength')
  })
})
