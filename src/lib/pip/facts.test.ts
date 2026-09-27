import { describe, expect, it } from 'vitest'
import { changeAround } from './bodyFacts'
import { buildPipFacts, firstName } from './facts'
import { bestDay, dayNear, liftHistories, recordsOf } from './liftFacts'
import { NOW, bench, input, logged, monthOnACut, pullUp, run, squat, weighIn, workout } from './fixtures.test-utils'
import { toWeighIns } from '../bodyWeight'

describe('firstName', () => {
  it('takes the first word, and nothing for a blank name', () => {
    expect(firstName('Alex Kim')).toBe('Alex')
    expect(firstName('  Sam  ')).toBe('Sam')
    expect(firstName('')).toBeNull()
    expect(firstName(null)).toBeNull()
    expect(firstName('A'.repeat(40))).toHaveLength(20)
  })
})

describe('lift history', () => {
  const data = monthOnACut()
  const histories = liftHistories({ ...data, now: NOW })
  const benchHistory = histories.find((h) => h.exercise.id === 'bench')!

  it('keeps the best set of each training day, oldest first', () => {
    expect(benchHistory.kind).toBe('load')
    expect(benchHistory.days.map((d) => [d.ageDays, d.weight, d.reps])).toEqual([
      [35, 115, 8],
      [28, 120, 8],
      [21, 125, 8],
      [14, 135, 6],
      [7, 145, 5],
      [2, 155, 5],
    ])
  })

  it('picks the top set by estimated max, so a heavy single can beat a light set of ten', () => {
    const w = workout(3)
    const rows = [logged(w, bench, { weight: 100, reps: 10 }), logged(w, bench, { weight: 150, reps: 3 }), logged(w, bench, { weight: 135, reps: 5 })]
    const day = liftHistories(input({ sessions: [w], sets: rows }))[0].days[0]
    expect([day.weight, day.reps]).toEqual([150, 3])
    expect(day.sets).toBe(3)
  })

  it('ignores unfinished workouts, cardio and empty sets', () => {
    const open = workout(1, { finished: false })
    const done = workout(2)
    const rows = [logged(open, bench, { weight: 300, reps: 5 }), logged(done, bench, { weight: 100, reps: 0 }), logged(done, run, { duration_seconds: 600, distance_m: 1600 })]
    expect(liftHistories(input({ sessions: [open, done], sets: rows }))).toEqual([])
  })

  it('tracks bodyweight moves by reps', () => {
    const w1 = workout(9)
    const w2 = workout(2)
    const history = liftHistories(input({ sessions: [w1, w2], sets: [logged(w1, pullUp, { reps: 4 }), logged(w2, pullUp, { reps: 7 })] }))[0]
    expect(history.kind).toBe('reps')
    expect(history.days.map((d) => d.score)).toEqual([4, 7])
  })

  it('does not throw when a weighted lift has a day with only weightless sets', () => {
    const w1 = workout(9)
    const w2 = workout(5)
    const rows = [logged(w1, bench, { weight: 100, reps: 5 }), logged(w2, bench, { weight: 0, reps: 8 })]
    expect(liftHistories(input({ sessions: [w1, w2], sets: rows }))[0].days).toHaveLength(1)
  })

  it('finds records, but not the first time you did a lift', () => {
    const records = recordsOf(benchHistory)
    expect(records).toHaveLength(5)
    expect(records.at(-1)!.day.weight).toBe(155)
    expect(records.at(-1)!.previous.weight).toBe(145)
    const plateau = { ...benchHistory, days: [benchHistory.days[0], { ...benchHistory.days[0], ageDays: 3 }] }
    expect(recordsOf(plateau)).toHaveLength(0)
  })

  it('finds the day nearest a given age', () => {
    expect(dayNear(benchHistory.days, 14, 3)?.weight).toBe(135)
    expect(dayNear(benchHistory.days, 12, 1)).toBeNull()
    expect(bestDay(benchHistory.days)?.weight).toBe(155)
  })
})

describe('weight facts', () => {
  const facts = buildPipFacts(monthOnACut()).weight!

  it('knows where you started, where you are and which way the goal points', () => {
    expect(facts.first).toBe(215.4)
    expect(facts.latest).toBe(209.8)
    expect(facts.direction).toBe('lose')
    expect(facts.goal).toBe(180)
    expect(facts.remaining).toBeCloseTo(-29.8, 5)
    expect(facts.sinceStart).toBeCloseTo(-5.6, 5)
    expect(facts.reached).toBe(false)
    expect(facts.fraction).toBeCloseTo(5.6 / 35.4, 3)
    expect(facts.daysSince).toBe(1)
  })

  it('measures the change over about a week, two weeks and a month', () => {
    expect(facts.changeWeek).toBeCloseTo(-0.6, 5)
    expect(facts.changeTwoWeeks).toBeCloseTo(-1.8, 5)
    // The weigh-in nearest a month before the latest one (a day ago) is the one 28 days ago.
    expect(facts.changeMonth).toBeCloseTo(-4.4, 5)
  })

  it('does not call yesterday-to-today a week', () => {
    const list = toWeighIns([weighIn(6, 200), weighIn(5, 199)], 'lb')
    expect(changeAround(list, 7, 3)).toBeNull()
  })

  it('spots a new low and a gain goal', () => {
    const low = buildPipFacts(input({ weights: [weighIn(10, 200), weighIn(5, 199), weighIn(0, 197.6)] })).weight!
    expect(low.isNewLow).toBe(true)
    expect(low.isNewHigh).toBe(false)
    const bulk = buildPipFacts(input({ goal: { weight: 190, unit: 'lb' }, weights: [weighIn(10, 175), weighIn(0, 176)] })).weight!
    expect(bulk.direction).toBe('gain')
  })

  it('converts a goal set in another unit', () => {
    const kg = buildPipFacts(input({ unit: 'lb', goal: { weight: 80, unit: 'kg' }, weights: [weighIn(0, 200)] })).weight!
    expect(kg.goal).toBeCloseTo(176.4, 1)
  })

  it('is null before the first weigh-in', () => {
    expect(buildPipFacts(input()).weight).toBeNull()
  })
})

describe('habit facts', () => {
  const facts = buildPipFacts(monthOnACut()).habit

  it('counts workouts, the week and the gap since the last one', () => {
    expect(facts.workouts).toBe(6)
    expect(facts.daysSinceLast).toBe(2)
    expect(facts.lastName).toBe('Upper body')
    expect(facts.firstDaysAgo).toBe(35)
    expect(facts.trainedToday).toBe(false)
    expect(facts.streak).toBe(0)
    expect(facts.thisWeek).toBe(1)
  })

  it('adds up volume, favourites and single-arm work', () => {
    expect(facts.totalVolume).toBe(115 * 8 + 155 * 8 + 120 * 8 + 40 * 10 + 125 * 8 + 175 * 6 + 135 * 6 + 145 * 5 + 195 * 5 + 50 * 10 + 155 * 5 + 55 * 10)
    expect(facts.mostLogged?.exercise.id).toBe('bench')
    expect(facts.mostLogged?.sets).toBe(6)
    expect(facts.singleArmSets).toBe(3)
  })

  it('counts a streak of consecutive days and remembers the best one', () => {
    const w = [workout(4), workout(3), workout(2), workout(1), workout(10), workout(9)]
    const facts2 = buildPipFacts(input({ sessions: w })).habit
    expect(facts2.streak).toBe(4)
    expect(facts2.bestStreak).toBe(4)
  })

  it('counts weeks in a row with at least two workouts, without punishing the week in progress', () => {
    const w = [workout(0), workout(6), workout(7), workout(8), workout(14), workout(15)]
    expect(buildPipFacts(input({ sessions: w })).habit.weekStreak).toBeGreaterThanOrEqual(2)
    const single = buildPipFacts(input({ sessions: [workout(20), workout(1)] })).habit
    expect(single.weekStreak).toBe(0)
  })

  it('reports cardio for the week and the longest run', () => {
    const w = [workout(1), workout(3), workout(20)]
    const rows = [logged(w[0], run, { duration_seconds: 1800, distance_m: 5000 }), logged(w[1], run, { duration_seconds: 1500, distance_m: 4000 }), logged(w[2], run, { duration_seconds: 3600, distance_m: 8000 })]
    const cardio = buildPipFacts(input({ sessions: w, sets: rows })).habit.cardio
    expect(cardio.minutesThisWeek).toBe(55)
    expect(cardio.sessionsThisMonth).toBe(3)
    expect(cardio.longestRun?.distanceM).toBe(8000)
    expect(cardio.longestRun?.ageDays).toBe(20)
  })

  it('notices a muscle group that has been missing for a while', () => {
    const w = [workout(30), workout(25), workout(20), workout(15), workout(9), workout(1)]
    const rows = [
      logged(w[0], squat, { weight: 135, reps: 5 }),
      logged(w[1], squat, { weight: 135, reps: 5 }),
      logged(w[2], squat, { weight: 135, reps: 5 }),
      logged(w[3], squat, { weight: 135, reps: 5 }),
      logged(w[4], squat, { weight: 135, reps: 5 }),
      logged(w[5], bench, { weight: 100, reps: 5 }),
    ]
    const gaps = buildPipFacts(input({ sessions: w, sets: rows })).habit.gaps
    expect(gaps.map((g) => [g.key, g.days])).toEqual([['legs', 9]])
  })

  it('does not nag about gaps while you are away altogether', () => {
    const w = [workout(30), workout(25), workout(20), workout(15)]
    const rows = w.map((s) => logged(s, squat, { weight: 135, reps: 5 }))
    expect(buildPipFacts(input({ sessions: w, sets: rows })).habit.gaps).toEqual([])
  })

  it('has no gap yet when a group was trained a week ago', () => {
    expect(buildPipFacts(monthOnACut()).habit.gaps).toEqual([])
  })
})
