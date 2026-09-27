import { describe, expect, it } from 'vitest'
import { ACTIVITY_BADGES, activityBadgeDef, activityBadgeKey } from '../config/activityBadges'
import { ex, session, set } from './rankFixtures.test-utils'
import { paceLadder, pacePercentile, paceValue, practiceSeconds, rankActivities } from './activityRank'

const cardio = (name: string, tracking: 'distance' | 'time' | 'reps' = 'distance') => ({ name, category: 'cardio' as const, tracking })

describe('activityBadgeKey', () => {
  it('sorts starter activities into badges', () => {
    expect(activityBadgeKey(cardio('Outdoor Run'))).toBe('running')
    expect(activityBadgeKey(cardio('Treadmill Run'))).toBe('running')
    expect(activityBadgeKey(cardio('Treadmill Walk'))).toBe('walking')
    expect(activityBadgeKey(cardio('Sprint Intervals', 'time'))).toBe('conditioning')
    expect(activityBadgeKey(cardio('Rowing Machine'))).toBe('rowing')
    expect(activityBadgeKey(cardio('Ski Erg'))).toBe('ski_erg')
    expect(activityBadgeKey(cardio('Outdoor Cycling'))).toBe('cycling')
    expect(activityBadgeKey(cardio('Stationary Bike'))).toBe('indoor_cycling')
    expect(activityBadgeKey(cardio('Assault Bike'))).toBe('indoor_cycling')
    expect(activityBadgeKey(cardio('Stair Climber'))).toBe('machines')
    expect(activityBadgeKey(cardio('Burpees', 'reps'))).toBe('conditioning')
    expect(activityBadgeKey(cardio('Arc Trainer (AMT)'))).toBe('machines')
    expect(activityBadgeKey(cardio('Upright Bike'))).toBe('indoor_cycling')
    expect(activityBadgeKey(cardio('Indoor Track Run'))).toBe('running')
    expect(activityBadgeKey(cardio('5K Race'))).toBe('running')
    expect(activityBadgeKey({ name: 'Freestyle Swim', category: 'swim', tracking: 'distance' })).toBe('freestyle')
    expect(activityBadgeKey({ name: 'Breaststroke Swim', category: 'swim', tracking: 'distance' })).toBe('swimming')
    expect(activityBadgeKey({ name: 'Heavy Bag', category: 'combat', tracking: 'time' })).toBe('combat')
    expect(activityBadgeKey({ name: 'Plank', category: 'strength', tracking: 'time' })).toBe('holds')
    expect(activityBadgeKey({ name: 'Bench Press', category: 'strength', tracking: 'reps' })).toBeNull()
  })
})

describe('pace', () => {
  const running = activityBadgeDef('running').pace!
  it('converts any run to a 5K time with Riegel and ignores short or impossible efforts', () => {
    expect(paceValue({ duration_seconds: 1770, distance_m: 5000 }, running)).toBeCloseTo(1770, 6)
    expect(paceValue({ duration_seconds: 3600, distance_m: 10000 }, running)).toBeLessThan(1800)
    expect(paceValue({ duration_seconds: 300, distance_m: 800 }, running)).toBeNull()
    expect(paceValue({ duration_seconds: 300, distance_m: 5000 }, running)).toBeNull()
  })

  it('makes a 29:30 5K the median man and a faster one better', () => {
    expect(pacePercentile(1770, running, 'male')).toBeCloseTo(50, 6)
    expect(pacePercentile(1500, running, 'male')).toBeGreaterThan(75)
    expect(pacePercentile(1770, running, 'female')).toBeGreaterThan(50)
  })

  it('uses average speed for cycling', () => {
    const cycling = activityBadgeDef('cycling').pace!
    expect(paceValue({ duration_seconds: 3600, distance_m: 24000 }, cycling)).toBeCloseTo(24, 6)
    expect(pacePercentile(24, cycling, 'male')).toBeCloseTo(50, 6)
  })
})

describe('rankActivities', () => {
  const run = ex('run', 'Outdoor Run', { category: 'cardio', tracking: 'distance' })
  const yoga = ex('yoga', 'Yoga Flow', { category: 'yoga', tracking: 'time' })
  const walk = ex('walk', 'Walk', { category: 'cardio', tracking: 'distance' })
  const sessions = [session('a', 1), session('b', 2)]
  const sets = [
    set('a', 'run', { duration_seconds: 1900, distance_m: 5000 }),
    set('b', 'run', { duration_seconds: 1500, distance_m: 5000 }),
    set('a', 'yoga', { duration_seconds: 3 * 3600 }),
    set('b', 'walk', { distance_m: 5000 }),
  ]

  it('ranks pace badges by the best effort and practice badges by hours', () => {
    const badges = rankActivities({ exercises: [run, yoga, walk], sessions, sets, sex: 'male' })
    const running = badges.find((b) => b.def.key === 'running')!
    expect(running.basis).toBe('pace')
    expect(running.best?.set.duration_seconds).toBe(1500)
    expect(running.sessions).toBe(2)
    const y = badges.find((b) => b.def.key === 'yoga')!
    expect(y.basis).toBe('hours')
    expect(y.rank).toBe(3) // 3 hours
    expect(badges.find((b) => b.def.key === 'walking')!.seconds).toBe(5 * 720)
  })

  it('falls back to hours when it cannot compare pace', () => {
    const badges = rankActivities({ exercises: [run], sessions, sets, sex: null })
    expect(badges[0].basis).toBe('hours')
    expect(badges[0].percentile).toBeNull()
  })

  it('estimates practice time for sets without one', () => {
    expect(practiceSeconds({ duration_seconds: null, distance_m: null, reps: 12 }, activityBadgeDef('conditioning'))).toBe(45)
    expect(practiceSeconds({ duration_seconds: 90, distance_m: 1000, reps: 0 }, activityBadgeDef('running'))).toBe(90)
  })

  it('has well-formed pace anchors', () => {
    for (const def of ACTIVITY_BADGES) {
      if (!def.pace) continue
      for (const row of [def.pace.men, def.pace.women]) {
        for (let i = 1; i < row.length; i += 1) {
          if (def.pace.referenceM === 0) expect(row[i], def.key).toBeGreaterThan(row[i - 1])
          else expect(row[i], def.key).toBeLessThan(row[i - 1])
        }
      }
    }
  })
})

describe('paceLadder', () => {
  it('gets faster rank by rank', () => {
    const ladder = paceLadder(activityBadgeDef('running').pace!, 'male')
    expect(ladder[0].value).toBeNull()
    for (let i = 2; i < ladder.length; i += 1) expect(ladder[i].value!).toBeLessThan(ladder[i - 1].value!)
    const cycling = paceLadder(activityBadgeDef('cycling').pace!, 'female')
    for (let i = 2; i < cycling.length; i += 1) expect(cycling[i].value!).toBeGreaterThan(cycling[i - 1].value!)
  })
})
