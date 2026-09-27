import { describe, expect, it } from 'vitest'
import { fill } from '../../lib/pip/text'
import { MOOD_LINES } from './moodLines'
import * as P from './personalLines'
import { QUESTIONS } from './questions'
import { THEMES } from './themeLines'

const MOODS = ['idle', 'cheer', 'sleep', 'think', 'wave', 'bounce', 'love', 'celebrate', 'stretch', 'dance', 'peekaboo', 'flex', 'nod', 'yawn']
const everyday = [...Object.values(MOOD_LINES).flat(), ...Object.values(THEMES).flatMap((t) => t.lines)]

describe('Pip\'s everyday lines', () => {
  it('has a bank for every pose and gesture', () => {
    expect(Object.keys(MOOD_LINES).sort()).toEqual([...MOODS].sort())
    for (const mood of MOODS) expect(MOOD_LINES[mood as keyof typeof MOOD_LINES].length, mood).toBeGreaterThanOrEqual(12)
  })

  it('has a lot to say, across many topics', () => {
    expect(everyday.length).toBeGreaterThanOrEqual(400)
    expect(Object.keys(THEMES).length).toBeGreaterThanOrEqual(15)
    for (const [key, theme] of Object.entries(THEMES)) expect(theme.lines.length, key).toBeGreaterThanOrEqual(4)
  })

  it('never says the same line twice, in any bank', () => {
    expect(new Set(everyday).size).toBe(everyday.length)
  })

  it('keeps every line short enough for the speech bubble', () => {
    for (const line of everyday) expect(line.length, line).toBeLessThanOrEqual(110)
  })

  it('has clean text', () => {
    for (const line of everyday) {
      expect(line, line).toBe(line.trim())
      expect(line, line).not.toMatch(/\s{2,}|[{}]/)
      expect(line.length, line).toBeGreaterThan(8)
    }
  })

  it('gives every topic bank a gesture', () => {
    for (const [key, theme] of Object.entries(THEMES)) expect(theme.gesture, key).toBeTruthy()
  })

  it('keeps its CoRec facts to what the official fact sheet lists', () => {
    const corec = Object.values(THEMES.purdue.lines).join(' ')
    for (const claim of [/slam wall/, /8 Olympic lifting platforms/, /atrium track/, /30 spin bikes/, /cables/]) expect(corec).toMatch(claim)
  })
})

/** The slots each list of personal wordings is filled with (see the comment above each list). */
const SLOTS: [string, readonly string[], string[]][] = [
  ['RECORD_LINES', P.RECORD_LINES, ['lift', 'w', 'reps', 'unit', 'prevW', 'prevReps', 'when', 'When']],
  ['RECORD_REPS_LINES', P.RECORD_REPS_LINES, ['lift', 'reps', 'prevReps', 'unit', 'when', 'When']],
  ['WEEKS_AGO_LINES', P.WEEKS_AGO_LINES, ['Ago', 'ago', 'lift', 'w1', 'r1', 'w2', 'r2', 'unit', 'diff', 'span']],
  ['SINCE_START_LINES', P.SINCE_START_LINES, ['Ago', 'ago', 'lift', 'w1', 'r1', 'w2', 'r2', 'unit', 'diff', 'span']],
  ['REPS_STORY_LINES', P.REPS_STORY_LINES, ['Ago', 'ago', 'lift', 'r1', 'r2', 'diff', 'unit', 'w1', 'w2', 'span']],
  ['STALL_LINES', P.STALL_LINES, ['lift', 'w', 'reps', 'unit', 'weeks', 'jump']],
  ['HEAVIEST_LINES', P.HEAVIEST_LINES, ['lift', 'w', 'reps', 'unit', 'ago']],
  ['PLATE_LINES', P.PLATE_LINES, ['lift', 'w', 'unit', 'plates']],
  ['ROUND_LINES', P.ROUND_LINES, ['lift', 'w', 'unit', 'plates']],
  ['BODYWEIGHT_LINES', P.BODYWEIGHT_LINES, ['lift', 'mult', 'w', 'unit']],
  ['RECOMP_LINES', P.RECOMP_LINES, ['lift', 'lost', 'unit', 'gained', 'then', 'now']],
  ['VOLUME_LINES', P.VOLUME_LINES, ['total', 'unit', 'thing']],
  ['FAVOURITE_LINES', P.FAVOURITE_LINES, ['lift', 'n']],
  ['SINGLE_ARM_LINES', P.SINGLE_ARM_LINES, ['n']],
  ['STREAK_LINES', P.STREAK_LINES, ['n']],
  ['WEEK_STREAK_LINES', P.WEEK_STREAK_LINES, ['n', 'min']],
  ['WORKOUT_MILESTONE_LINES', P.WORKOUT_MILESTONE_LINES, ['n']],
  ['COMEBACK_LINES', P.COMEBACK_LINES, ['days', 'last']],
  ['LONG_BREAK_LINES', P.LONG_BREAK_LINES, ['days']],
  ['FIRST_WORKOUT_LINES', P.FIRST_WORKOUT_LINES, ['ago', 'Ago', 'n']],
  ['GAP_LINES', P.GAP_LINES, ['Group', 'group', 'days']],
  ['WEEK_LINES', P.WEEK_LINES, ['done', 'planned', 'left']],
  ['WEEK_DONE_LINES', P.WEEK_DONE_LINES, ['planned']],
  ['PLAN_LINES', P.PLAN_LINES, ['names', 'minutes']],
  ['PLAN_PARTIAL_LINES', P.PLAN_PARTIAL_LINES, ['names', 'done', 'total']],
  ['DONE_LINES', P.DONE_LINES, ['sets']],
  ['REST_LINES', P.REST_LINES, []],
  ['UNPLANNED_LINES', P.UNPLANNED_LINES, []],
  ['NO_WEIGH_INS_LINES', P.NO_WEIGH_INS_LINES, []],
  ['WEIGHT_FIRST_LINES', P.WEIGHT_FIRST_LINES, ['w', 'unit']],
  ['WEIGHT_FIRST_GOAL_LINES', P.WEIGHT_FIRST_GOAL_LINES, ['w', 'unit', 'goal', 'left']],
  ['TO_GO_LINES', P.TO_GO_LINES, ['left', 'unit', 'goal', 'pct', 'since']],
  ['GOAL_QUARTER_LINES', P.GOAL_QUARTER_LINES, ['goal', 'left', 'unit']],
  ['GOAL_HALF_LINES', P.GOAL_HALF_LINES, ['goal', 'left', 'unit']],
  ['GOAL_THREE_QUARTER_LINES', P.GOAL_THREE_QUARTER_LINES, ['goal', 'left', 'unit']],
  ['GOAL_NEARLY_LINES', P.GOAL_NEARLY_LINES, ['goal', 'left', 'unit']],
  ['DOWN_WEEK_LINES', P.DOWN_WEEK_LINES, ['x', 'unit', 'avg']],
  ['DOWN_FAST_LINES', P.DOWN_FAST_LINES, ['x', 'unit']],
  ['UP_WEEK_LINES', P.UP_WEEK_LINES, ['x', 'unit', 'avg']],
  ['FLAT_LINES', P.FLAT_LINES, []],
  ['NEW_LOW_LINES', P.NEW_LOW_LINES, ['w', 'unit']],
  ['GOAL_REACHED_LINES', P.GOAL_REACHED_LINES, ['goal', 'unit']],
  ['GAIN_LINES', P.GAIN_LINES, ['x', 'unit', 'goal']],
  ['STALE_WEIGH_LINES', P.STALE_WEIGH_LINES, ['days']],
  ['NO_GOAL_LINES', P.NO_GOAL_LINES, []],
  ['SINCE_WEIGH_LINES', P.SINCE_WEIGH_LINES, ['ago', 'Ago', 'dir', 'x', 'unit']],
  ['TREND_LINES', P.TREND_LINES, ['avg', 'unit']],
  ['CARDIO_WEEK_LINES', P.CARDIO_WEEK_LINES, ['min', 'left']],
  ['CARDIO_WEEK_DONE_LINES', P.CARDIO_WEEK_DONE_LINES, ['min']],
  ['LONGEST_RUN_LINES', P.LONGEST_RUN_LINES, ['dist', 'ago']],
  ['CARDIO_MONTH_LINES', P.CARDIO_MONTH_LINES, ['dist', 'n']],
  ['MORNING_LINES', P.MORNING_LINES, []],
  ['AFTERNOON_LINES', P.AFTERNOON_LINES, []],
  ['EVENING_LINES', P.EVENING_LINES, []],
  ['NIGHT_LINES', P.NIGHT_LINES, []],
  ['LATE_LINES', P.LATE_LINES, []],
  ['PEP_GOAL_LINES', P.PEP_GOAL_LINES, ['n', 'unit', 'goal', 'left']],
  ['PEP_STREAK_LINES', P.PEP_STREAK_LINES, ['n']],
  ['PEP_LIFT_LINES', P.PEP_LIFT_LINES, ['lift', 'gain', 'unit', 'span']],
  ['PEP_GENERAL_LINES', P.PEP_GENERAL_LINES, []],
]

/** Realistic values, to check that a filled-in line still fits the speech bubble. */
const SAMPLE: Record<string, string | number> = {
  name: 'Alexander', lift: 'Bench Press', w: '155', w1: '135', w2: '155', r1: 6, r2: 5, reps: 5, prevW: '145', prevReps: 5, unit: 'lb', diff: '20', when: 'yesterday', When: 'Yesterday',
  ago: 'two weeks ago', Ago: 'Two weeks ago', span: 'two weeks', weeks: 4, jump: '2.5 lb', plates: 'two plates a side', mult: 'your bodyweight', lost: '5.6', gained: '40', then: '0.53', now: '0.74',
  total: '78,750', thing: 'about 2 pickup trucks', n: 12, min: 2, days: 12, last: 'Upper body', dist: '3.1 mi', Group: 'Legs', group: 'legs', done: 2, planned: 4, left: 2, names: 'Push day and Cardio',
  minutes: 55, sets: 22, goal: '180', pct: 30, since: '5.6', x: '1.4', avg: '210.1', dir: 'down', gain: '20',
}

describe('Pip\'s personal wordings', () => {
  it.each(SLOTS)('%s only uses the slots it is given', (_name, lines, slots) => {
    const given = Object.fromEntries([...slots, 'name'].map((s) => [s, 'x']))
    for (const line of lines) expect(() => fill(line, given), line).not.toThrow()
  })

  it.each(SLOTS)('%s reads well with real numbers, and fits the bubble', (_name, lines, slots) => {
    const given = Object.fromEntries([...slots, 'name'].map((s) => [s, SAMPLE[s]]))
    for (const line of lines) {
      const text = fill(line, given)
      expect(text, text).not.toMatch(/undefined|NaN|[{}]/)
      expect(text.length, text).toBeLessThanOrEqual(165)
    }
  })

  it('has at least one wording without {name} in every list, for people who have not set a name', () => {
    for (const [name, lines] of SLOTS) expect(lines.some((l) => !l.includes('{name}')), name).toBe(true)
  })

  it('covers every list that the file exports', () => {
    const exported = Object.keys(P).filter((k) => k.endsWith('_LINES') && k !== 'WEEKDAY_LINES')
    expect(SLOTS.map(([name]) => name).sort()).toEqual(exported.sort())
  })

  it('has a line for every weekday', () => {
    for (let day = 0; day < 7; day += 1) expect(P.WEEKDAY_LINES[day]?.length, String(day)).toBeGreaterThan(0)
  })
})

describe('Pip\'s questions', () => {
  it('have three quick replies each, all fully worded', () => {
    for (const q of QUESTIONS) {
      expect(q.choices, q.id).toHaveLength(3)
      for (const choice of q.choices) {
        expect(choice.label.length, choice.label).toBeLessThanOrEqual(14)
        for (const reply of choice.replies) {
          const text = fill(reply, { hint: 'Last time on Bench Press: 155 lb × 5, a week ago. Beat it by one rep.', name: 'Alex' })
          expect(text.length, text).toBeLessThanOrEqual(190)
        }
      }
      for (const prompt of q.prompts) expect(fill(prompt, { name: 'Alex' }).length).toBeLessThanOrEqual(60)
      expect(q.prompts.some((p) => !p.includes('{name}')), q.id).toBe(true)
    }
  })
})
