// Pip and your cardio: minutes this week, your longest run, distance this month.
import { CARDIO_MONTH_LINES, CARDIO_WEEK_DONE_LINES, CARDIO_WEEK_LINES, LONGEST_RUN_LINES } from '../../../config/pip/personalLines'
import { localDateIso } from '../../bodyWeight'
import { formatDistance } from '../../units'
import type { PipFacts } from '../facts'
import { capitalize } from '../text'
import { agoPhrase } from '../time'
import type { PipMoment } from '../types'
import { moment, say } from './say'

/** The weekly aim most health guidelines give for moderate cardio. */
export const WEEKLY_CARDIO_MINUTES = 150

export function cardioMoments(facts: PipFacts): PipMoment[] {
  const c = facts.habit.cardio
  const out: PipMoment[] = []
  const today = localDateIso(facts.now)

  if (c.minutesThisWeek >= 10) {
    const done = c.minutesThisWeek >= WEEKLY_CARDIO_MINUTES
    const id = `cardio:week:${done ? 'done' : 'part'}:${today}`
    const slots = { min: c.minutesThisWeek, left: Math.max(0, WEEKLY_CARDIO_MINUTES - c.minutesThisWeek) }
    out.push(moment({ id, text: say(facts, id, done ? CARDIO_WEEK_DONE_LINES : CARDIO_WEEK_LINES, slots), topic: 'cardio', priority: 52, cooldownHours: 24, mood: done ? 'celebrate' : 'dance', talk: 'progress' }))
  }

  if (c.longestRun) {
    const id = `cardio:longest:${c.longestRun.exercise.id}:${Math.round(c.longestRun.distanceM)}`
    const ago = agoPhrase(c.longestRun.ageDays)
    out.push(moment({ id, text: say(facts, id, LONGEST_RUN_LINES, { dist: formatDistance(c.longestRun.distanceM, facts.distanceUnit), ago, Ago: capitalize(ago) }), topic: 'cardio', priority: 45, cooldownHours: 120, mood: 'dance', talk: 'throwback' }))
  }

  if (c.distanceMonthM >= 3000 && c.sessionsThisMonth >= 2) {
    const id = `cardio:month:${today}`
    out.push(moment({ id, text: say(facts, id, CARDIO_MONTH_LINES, { dist: formatDistance(c.distanceMonthM, facts.distanceUnit), n: c.sessionsThisMonth }), topic: 'cardio', priority: 44, cooldownHours: 96, mood: 'bounce', talk: 'progress' }))
  }
  return out
}
