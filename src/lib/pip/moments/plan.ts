// Pip and today: hello for the time of day, what is on the board, rest days and how the week is going.
import {
  AFTERNOON_LINES,
  DONE_LINES,
  EVENING_LINES,
  LATE_LINES,
  MORNING_LINES,
  NIGHT_LINES,
  PLAN_LINES,
  PLAN_PARTIAL_LINES,
  REST_LINES,
  UNPLANNED_LINES,
  WEEKDAY_LINES,
  WEEK_DONE_LINES,
  WEEK_LINES,
} from '../../../config/pip/personalLines'
import { localDateIso } from '../../bodyWeight'
import type { PipFacts } from '../facts'
import { dayPart, type DayPart } from '../time'
import type { PipMoment } from '../types'
import { moment, namesText, say } from './say'

const GREETINGS: Record<DayPart, readonly string[]> = {
  late: LATE_LINES,
  morning: MORNING_LINES,
  afternoon: AFTERNOON_LINES,
  evening: EVENING_LINES,
  night: NIGHT_LINES,
}

export function planMoments(facts: PipFacts): PipMoment[] {
  const out: PipMoment[] = []
  const today = localDateIso(facts.now)
  const part = dayPart(facts.now)
  const plan = facts.plan

  const greetingId = `plan:greeting:${today}:${part}`
  out.push(moment({ id: greetingId, text: say(facts, greetingId, GREETINGS[part]), topic: 'greeting', priority: 44, cooldownHours: 8, mood: 'wave' }))
  const weekdayId = `plan:weekday:${today}`
  out.push(moment({ id: weekdayId, text: say(facts, weekdayId, WEEKDAY_LINES[facts.now.getDay()]), topic: 'greeting', priority: 41, cooldownHours: 20, mood: 'nod' }))

  const allDone = plan?.kind === 'planned' && plan.doneCount >= plan.total
  if (facts.habit.trainedToday && (plan?.kind !== 'planned' || allDone)) {
    const id = `plan:done:${today}`
    out.push(moment({ id, text: say(facts, id, DONE_LINES, { sets: facts.habit.todaySets }), topic: 'plan', priority: 68, cooldownHours: 6, mood: 'love', talk: 'pep' }))
  } else if (plan?.kind === 'planned') {
    const partial = plan.doneCount > 0
    const id = `plan:today:${today}:${plan.doneCount}`
    const slots = { names: namesText(plan.names), minutes: plan.minutes, done: plan.doneCount, total: plan.total }
    // A plan with no exercises yet (just "Weightlifting") has no length to speak of.
    const lines = partial ? PLAN_PARTIAL_LINES : plan.minutes > 0 ? PLAN_LINES : PLAN_LINES.filter((l) => !l.includes('{minutes}'))
    out.push(moment({ id, text: say(facts, id, lines, slots), topic: 'plan', priority: 72, cooldownHours: 6, mood: partial ? 'nod' : null }))
  } else if (plan?.kind === 'rest') {
    const id = `plan:rest:${today}`
    out.push(moment({ id, text: say(facts, id, REST_LINES), topic: 'plan', priority: 70, cooldownHours: 6, mood: null }))
  } else if (plan?.kind === 'unplanned') {
    out.push(moment({ id: 'plan:unplanned', text: say(facts, 'plan:unplanned', UNPLANNED_LINES), topic: 'plan', priority: 40, cooldownHours: 48, mood: 'think' }))
  }

  if (plan && plan.weekPlanned > 0 && plan.weekDone > 0) {
    const done = plan.weekDone >= plan.weekPlanned
    const id = `plan:week:${today}:${plan.weekDone}`
    const slots = { done: plan.weekDone, planned: plan.weekPlanned, left: Math.max(0, plan.weekPlanned - plan.weekDone) }
    out.push(moment({ id, text: say(facts, id, done ? WEEK_DONE_LINES : WEEK_LINES, slots), topic: 'plan', priority: done ? 60 : 54, cooldownHours: 12, mood: done ? 'celebrate' : 'nod', talk: 'progress' }))
  }
  return out
}
