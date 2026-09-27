// Pip's pep talks: encouragement that names your own goal, streak and best climb.
import { PEP_GENERAL_LINES, PEP_GOAL_LINES, PEP_LIFT_LINES, PEP_STREAK_LINES } from '../../../config/pip/personalLines'
import { localDateIso } from '../../bodyWeight'
import type { PipFacts } from '../facts'
import { bestDay, dayNear } from '../liftFacts'
import { spanPhrase } from '../time'
import type { PipMoment } from '../types'
import { moment, num, say } from './say'

export function pepMoments(facts: PipFacts): PipMoment[] {
  const out: PipMoment[] = []
  const today = localDateIso(facts.now)
  const w = facts.weight

  if (w && w.goal !== null && !w.reached && w.remaining !== null) {
    out.push(moment({ id: `pep:goal:${today}`, text: say(facts, `pep:goal:${today}`, PEP_GOAL_LINES, { left: num(Math.abs(w.remaining)), unit: w.unit, goal: num(w.goal) }), topic: 'goal', priority: 50, cooldownHours: 12, mood: 'love', talk: 'pep' }))
  }

  if (facts.habit.streak >= 2) {
    const id = `pep:streak:${facts.habit.streak}`
    out.push(moment({ id, text: say(facts, id, PEP_STREAK_LINES, { n: facts.habit.streak }), topic: 'habit', priority: 48, cooldownHours: 12, mood: 'bounce', talk: 'pep' }))
  }

  // The lift that has climbed most over about a month.
  const step = facts.unit === 'kg' ? 1 : 2.5
  let best: { lift: string; gain: number; span: string } | null = null
  for (const h of facts.lifts) {
    if (h.kind !== 'load') continue
    const now = bestDay(h.days.filter((d) => d.ageDays <= 14))
    const then = dayNear(h.days, 28, 10)
    if (!now || !then || then.ageDays - now.ageDays < 10) continue
    const gain = now.weight - then.weight
    if (gain >= step && (!best || gain > best.gain)) best = { lift: h.exercise.name, gain, span: spanPhrase(then.ageDays) }
  }
  if (best) {
    const id = `pep:lift:${best.lift}:${today}`
    out.push(moment({ id, text: say(facts, id, PEP_LIFT_LINES, { lift: best.lift, gain: num(best.gain), unit: facts.unit, span: best.span }), topic: 'lift', priority: 49, cooldownHours: 24, mood: 'flex', talk: 'pep' }))
  }

  out.push(moment({ id: `pep:general:${today}`, text: say(facts, `pep:general:${today}`, PEP_GENERAL_LINES), topic: 'habit', priority: 10, cooldownHours: 12, mood: 'love', talk: 'pep' }))
  return out
}
