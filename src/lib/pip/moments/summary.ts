// "How am I doing?": a short status in three flavours (training, body, strength) that Pip cycles through.
import type { PipFacts } from '../facts'
import { bestDay } from '../liftFacts'
import { plural } from '../text'
import { agoPhrase } from '../time'
import type { PipMoment } from '../types'
import { moment, num } from './say'

const sentence = (clauses: string[]) => `${clauses.join('. ')}.`

function training(facts: PipFacts): string | null {
  const h = facts.habit
  if (h.workouts === 0) return "No workouts logged yet. Your first one only takes ten minutes, and it's the hardest one."
  const week = facts.plan && facts.plan.weekPlanned > 0 ? ` (${facts.plan.weekDone} of ${facts.plan.weekPlanned} planned days)` : ''
  const clauses = [`${h.thisWeek} ${plural(h.thisWeek, 'workout')} this week${week}`]
  if (h.workouts > h.thisWeek) clauses.push(`${h.workouts} in all`)
  if (h.streak >= 2) clauses.push(`${h.streak}-day streak`)
  if (h.cardio.minutesThisWeek >= 10) clauses.push(`${h.cardio.minutesThisWeek} min of cardio`)
  if (h.daysSinceLast !== null && h.lastName) clauses.push(`Last one: ${h.lastName}, ${agoPhrase(h.daysSinceLast)}`)
  return sentence(clauses)
}

function body(facts: PipFacts): string | null {
  const w = facts.weight
  if (!w) return "No weigh-ins yet. Step on once and I'll start tracking your trend."
  const change = w.changeWeek === null ? '' : `, ${w.changeWeek > 0 ? 'up' : w.changeWeek < 0 ? 'down' : 'level'}${w.changeWeek === 0 ? '' : ` ${num(Math.abs(w.changeWeek))}`} this week`
  const clauses = [`${num(w.latest)} ${w.unit}${change}`]
  if (w.goal !== null) clauses.push(w.reached ? 'Goal reached' : `${num(Math.abs(w.remaining ?? 0))} ${w.unit} to ${num(w.goal)}`)
  return sentence(clauses)
}

function strength(facts: PipFacts): string | null {
  const climbs = facts.lifts
    .filter((h) => h.kind === 'load' && h.days.length >= 2)
    .map((h) => ({ h, first: h.days[0], best: bestDay(h.days)! }))
    .filter((c) => c.best.weight > c.first.weight)
    .sort((a, b) => b.best.score / b.first.score - a.best.score / a.first.score)
    .slice(0, 2)
  if (facts.lifts.length === 0) return "No lifts logged yet. Log a few and I'll tell you what's climbing."
  if (climbs.length === 0) {
    const top = [...facts.lifts].sort((a, b) => b.totalSets - a.totalSets)[0]
    return `Most-logged lift: ${top.exercise.name}. Give it a few sessions and I'll show you the climb.`
  }
  const clauses = climbs.map((c) => `${c.h.exercise.name} ${num(c.first.weight)} → ${num(c.best.weight)} ${facts.unit}`)
  if (facts.records.length > 0) clauses.push(`${facts.records.length} new ${plural(facts.records.length, 'record')} lately`)
  return sentence(clauses)
}

const ROUNDS = [training, body, strength]

/** The next status, starting from a given round and skipping any that has nothing to say. */
export function progressMoment(facts: PipFacts, round: number): PipMoment {
  for (let i = 0; i < ROUNDS.length; i += 1) {
    const which = (round + i) % ROUNDS.length
    const text = ROUNDS[which](facts)
    if (text) return moment({ id: `summary:${which}`, text, topic: 'habit', priority: 0, cooldownHours: 0, mood: which === 0 ? 'nod' : which === 1 ? 'peekaboo' : 'flex', talk: 'progress' })
  }
  return moment({ id: 'summary:none', text: 'Nothing to report yet. Log a workout and I will have plenty to say.', topic: 'habit', priority: 0, cooldownHours: 0, mood: 'wave', talk: 'progress' })
}
