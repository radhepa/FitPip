// Pip sometimes asks how you are: a question with three quick replies, at most once a day, on
// roughly one day in three, and only when there is a workout still to do.
import { QUESTIONS } from '../../../config/pip/questions'
import { localDateIso } from '../../bodyWeight'
import type { PipFacts } from '../facts'
import { hash } from '../text'
import { agoPhrase } from '../time'
import type { PipMoment } from '../types'
import { moment, num, say } from './say'

export interface CheckinOptions {
  /** Pip has already asked something today. */
  askedToday: boolean
}

export function checkinMoments(facts: PipFacts, { askedToday }: CheckinOptions): PipMoment[] {
  const plan = facts.plan
  if (askedToday || !plan || plan.kind !== 'planned' || plan.doneCount >= plan.total || facts.now.getHours() >= 21) return []
  const today = localDateIso(facts.now)
  if (hash(`ask|${today}`) % 3 !== 0) return []

  const question = QUESTIONS[hash(`question|${today}`) % QUESTIONS.length]
  const last = plan.firstLift
  const hint = last ? `Last time on ${last.name}: ${num(last.weight)} ${facts.unit} × ${last.reps}, ${agoPhrase(last.ageDays)}. Beat it by one rep.` : ''
  const id = `ask:${question.id}:${today}`
  return [
    moment({
      id,
      text: say(facts, `${id}:prompt`, question.prompts),
      topic: 'checkin',
      priority: 30,
      cooldownHours: 20,
      mood: 'think',
      // A bodyweight lift (weight 0) reads oddly with "0 lb", so only weighted lifts get the hint.
      choices: question.choices.map((c) => ({ label: c.label, mood: c.mood, reply: say(facts, `${id}:${c.label}`, c.replies, { hint: last && last.weight > 0 ? hint : '' }) })),
    }),
  ]
}
