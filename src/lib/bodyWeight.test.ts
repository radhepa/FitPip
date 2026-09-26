import { describe, expect, it } from 'vitest'
import type { BodyWeight } from '../types/db'
import { changeOver, goalProgress, localDateIso, toWeighIns, weekAverage, weighInStreak, type WeighIn } from './bodyWeight'

const row = (measured_on: string, weight: number, unit: BodyWeight['unit'] = 'lb'): BodyWeight => ({
  id: measured_on, user_id: 'u', measured_on, weight, unit, note: null, created_at: '', updated_at: '',
})
const w = (date: string, weight: number): WeighIn => ({ id: date, date, weight })

describe('localDateIso', () => {
  it('uses the local calendar day', () => {
    expect(localDateIso(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})

describe('toWeighIns', () => {
  it('sorts oldest first and converts every entry into the shown unit', () => {
    const list = toWeighIns([row('2026-09-10', 80, 'kg'), row('2026-09-01', 180)], 'lb')
    expect(list.map((x) => x.date)).toEqual(['2026-09-01', '2026-09-10'])
    expect(list[1].weight).toBe(176.4)
    expect(toWeighIns([row('2026-09-01', 180)], 'kg')[0].weight).toBe(81.6)
  })
})

describe('changeOver', () => {
  const list = [w('2026-09-01', 184), w('2026-09-14', 182.5), w('2026-09-20', 181), w('2026-09-21', 180.4)]

  it('compares the latest with the weigh-in nearest to N days before it', () => {
    expect(changeOver(list, 7)).toBe(-2.1) // vs 14 Sep
    expect(changeOver(list, 30)).toBe(-3.6) // vs 1 Sep, the oldest
    expect(changeOver(list, 1)).toBe(-0.6)
  })

  it('needs two weigh-ins', () => {
    expect(changeOver([w('2026-09-01', 180)], 7)).toBeNull()
    expect(changeOver([], 7)).toBeNull()
  })
})

describe('weekAverage', () => {
  it('averages the 7 days up to the latest weigh-in', () => {
    expect(weekAverage([w('2026-09-01', 200), w('2026-09-18', 181), w('2026-09-21', 180)])).toBe(180.5)
    expect(weekAverage([])).toBeNull()
  })
})

describe('goalProgress', () => {
  it('works for losing weight', () => {
    const p = goalProgress([w('2026-09-01', 190), w('2026-09-20', 185)], 180)
    expect(p).toMatchObject({ start: 190, current: 185, goal: 180, fraction: 0.5, remaining: -5, reached: false })
  })

  it('works for gaining weight and caps at the goal', () => {
    expect(goalProgress([w('2026-09-01', 150), w('2026-09-20', 155)], 160)?.fraction).toBe(0.5)
    expect(goalProgress([w('2026-09-01', 150), w('2026-09-20', 162)], 160)).toMatchObject({ fraction: 1, reached: true })
  })

  it('does not go below zero when moving the wrong way', () => {
    expect(goalProgress([w('2026-09-01', 190), w('2026-09-20', 193)], 180)?.fraction).toBe(0)
  })

  it('is null without a goal or weigh-ins', () => {
    expect(goalProgress([w('2026-09-01', 190)], null)).toBeNull()
    expect(goalProgress([], 180)).toBeNull()
  })
})

describe('weighInStreak', () => {
  it('counts consecutive days ending today', () => {
    const list = [w('2026-09-18', 1), w('2026-09-19', 1), w('2026-09-20', 1), w('2026-09-21', 1)]
    expect(weighInStreak(list, '2026-09-21')).toBe(4)
    expect(weighInStreak(list, '2026-09-22')).toBe(0)
    expect(weighInStreak([w('2026-09-19', 1), w('2026-09-21', 1)], '2026-09-21')).toBe(1)
  })

  it('crosses month ends', () => {
    expect(weighInStreak([w('2026-08-31', 1), w('2026-09-01', 1)], '2026-09-01')).toBe(2)
  })
})
