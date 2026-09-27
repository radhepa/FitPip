// What Pip has to say on the screens that aren't the Today card: about your weight on the
// Weigh-in screen, and about the workout you just finished. Chosen, not rotated: the best thing first.
import { localDateIso } from '../bodyWeight'
import type { PipFacts } from './facts'
import { weightMoments } from './moments/body'
import { momentsFor } from './moments'
import { recompMoments } from './moments/milestones'
import type { PipMoment } from './types'

const byPriority = (a: PipMoment, b: PipMoment) => b.priority - a.priority

/** Everything Pip has to say about your weight, best first (a goal reached, a new low, the week, the road ahead). */
export function weightNotes(facts: PipFacts): PipMoment[] {
  return [...weightMoments(facts), ...recompMoments(facts)].sort(byPriority)
}

/**
 * The best thing to say about the workout you just finished: a record set today, a workout
 * milestone, a streak, weeks in a row, or just a good word about a day's work. Null if none applies.
 */
export function wrapUpNote(facts: PipFacts): PipMoment | null {
  const today = localDateIso(facts.now)
  const about = (m: PipMoment) => m.on === today || /^(habit:(milestone|streak|weeks)|plan:done):?/.test(m.id)
  return momentsFor(facts, { askedToday: true }).filter(about).sort(byPriority)[0] ?? null
}
