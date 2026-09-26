import { describe, expect, it } from 'vitest'
import { activityBadgeDef } from '../config/activityBadges'
import { STRENGTH_STANDARDS } from '../config/strengthStandards'
import { MUSCLES } from '../types/db'
import { beatsText, hasStandardLabel, hoursText, liftValueText, liftsThatRank, paceValueText, rankName, regionRanks, topText } from './rankFormat'
import type { MuscleRank } from './strengthRank'

const standard = (key: string) => STRENGTH_STANDARDS.find((s) => s.key === key)!

describe('rank wording', () => {
  it('describes percentiles and ranks', () => {
    expect(topText(71.6)).toBe('Top 28%')
    expect(topText(24.4)).toBe('Beats 24%')
    expect(beatsText(71.6)).toBe('Stronger than 72% of lifters')
    expect(beatsText(99.44, 'Faster', 'runners')).toBe('Faster than 99.4% of runners')
    expect(rankName(4)).toBe('Gold')
    expect(rankName(10, true)).toBe('Legend (10 of 10)')
  })

  it('formats lift values by kind', () => {
    expect(liftValueText(standard('bench'), 224.96, 'lb')).toBe('225 lb')
    expect(liftValueText(standard('db_bench'), 40.2, 'kg')).toBe('40 kg per dumbbell')
    expect(liftValueText(standard('bench'), 133.3, 'lb')).toBe('133 lb')
    expect(liftValueText(standard('pull_up'), 1, 'lb')).toBe('1 rep')
    expect(liftValueText(standard('pull_up'), 12.4, 'lb')).toBe('12 reps')
  })

  it('formats pace values and practice time', () => {
    expect(paceValueText(activityBadgeDef('running'), 1450.4, 'mi')).toBe('24:10')
    expect(paceValueText(activityBadgeDef('cycling'), 24.3, 'km')).toBe('24.3 km/h')
    expect(paceValueText(activityBadgeDef('cycling'), 24.14, 'mi')).toBe('15.0 mph')
    expect(hoursText(45 * 60)).toBe('45 min')
    expect(hoursText(200 * 60)).toBe('3 h 20 min')
    expect(hoursText(12.4 * 3600)).toBe('12 h')
  })
})

describe('regionRanks', () => {
  it('gives a shared region the best rank of its muscles', () => {
    const rank = (muscle: MuscleRank['muscle'], r: MuscleRank['rank']) => ({ muscle, rank: r, percentile: 0, progress: 0, sources: [] })
    const regions = regionRanks({ lats: rank('lats', 3), upper_back: rank('upper_back', 6), side_delts: rank('side_delts', 2) })
    expect(regions['upper-back']).toBe(6)
    expect(regions['front-deltoids']).toBe(2)
    expect(regions['back-deltoids']).toBe(2)
    expect(regions.chest).toBeUndefined()
  })
})

describe('liftsThatRank', () => {
  it('suggests real standards for every muscle', () => {
    for (const muscle of MUSCLES) {
      expect(liftsThatRank(muscle).length, muscle).toBeGreaterThan(0)
      for (const label of liftsThatRank(muscle)) expect(hasStandardLabel(label), label).toBe(true)
    }
    expect(liftsThatRank('chest')[0]).toBe('Bench press')
  })
})
