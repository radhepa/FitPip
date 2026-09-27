// Pip notices how you show up: streaks, weeks in a row, comebacks, milestones and neglected muscles.
import { WORKOUT_MILESTONES } from '../../../config/pip/comparisons'
import {
  COMEBACK_LINES,
  FIRST_WORKOUT_LINES,
  GAP_LINES,
  LONG_BREAK_LINES,
  STREAK_LINES,
  WEEK_STREAK_LINES,
  WORKOUT_MILESTONE_LINES,
} from '../../../config/pip/personalLines'
import type { PipFacts } from '../facts'
import { WEEK_MINIMUM } from '../habitFacts'
import { capitalize } from '../text'
import { agoPhrase } from '../time'
import type { PipMoment } from '../types'
import { moment, say } from './say'

const STREAK_MARKS = [3, 5, 7, 10, 14, 21, 30, 45, 60, 90]

/** How long a break has been, in a few steps (so the same comeback line is not repeated as days tick by). */
const breakBand = (days: number) => (days >= 21 ? 21 : days >= 14 ? 14 : days >= 10 ? 10 : days >= 7 ? 7 : 5)

export function habitMoments(facts: PipFacts): PipMoment[] {
  const h = facts.habit
  const out: PipMoment[] = []

  if (h.streak >= 3) {
    const id = `habit:streak:${h.streak}`
    const mark = STREAK_MARKS.includes(h.streak)
    out.push(moment({ id, text: say(facts, id, STREAK_LINES, { n: h.streak }), topic: 'habit', priority: mark ? 80 : 62, cooldownHours: 20, mood: mark ? 'celebrate' : 'bounce', talk: 'pep' }))
  }

  if (h.weekStreak >= 2) {
    const id = `habit:weeks:${h.weekStreak}`
    out.push(moment({ id, text: say(facts, id, WEEK_STREAK_LINES, { n: h.weekStreak, min: WEEK_MINIMUM }), topic: 'habit', priority: 66, cooldownHours: 72, mood: 'love', talk: 'progress' }))
  }

  if (WORKOUT_MILESTONES.includes(h.workouts) && h.daysSinceLast !== null && h.daysSinceLast <= 3) {
    const id = `habit:milestone:${h.workouts}`
    out.push(moment({ id, text: say(facts, id, WORKOUT_MILESTONE_LINES, { n: h.workouts }), topic: 'habit', priority: 90, cooldownHours: 240, mood: 'celebrate', talk: 'throwback' }))
  }

  if (h.daysSinceLast !== null && h.daysSinceLast >= 5 && !h.trainedToday && h.workouts >= 2) {
    const band = breakBand(h.daysSinceLast)
    const id = `habit:comeback:${band}`
    const lines = h.daysSinceLast >= 14 ? LONG_BREAK_LINES : COMEBACK_LINES
    out.push(moment({ id, text: say(facts, id, lines, { days: h.daysSinceLast, last: h.lastName ?? 'your last workout' }), topic: 'habit', priority: 78, cooldownHours: 24, mood: 'wave', talk: 'pep' }))
  }

  if (h.workouts >= 4 && h.firstDaysAgo !== null && h.firstDaysAgo >= 14) {
    const ago = agoPhrase(h.firstDaysAgo)
    out.push(moment({ id: 'habit:first', text: say(facts, 'habit:first', FIRST_WORKOUT_LINES, { ago, Ago: capitalize(ago), n: h.workouts }), topic: 'habit', priority: 45, cooldownHours: 200, mood: 'love', talk: 'throwback' }))
  }

  const gap = h.gaps[0]
  if (gap) {
    const id = `habit:gap:${gap.key}:${Math.floor(gap.days / 4)}`
    out.push(moment({ id, text: say(facts, id, GAP_LINES, { Group: gap.label, group: gap.label.toLowerCase(), days: gap.days }), topic: 'habit', priority: 58, cooldownHours: 48, mood: 'think', talk: 'progress' }))
  }

  return out
}
