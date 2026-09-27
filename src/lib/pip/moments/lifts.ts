// Pip remembers your lifts: new records, "two weeks ago you lifted X, now Y", stalls and your heaviest.
import {
  HEAVIEST_LINES,
  RECORD_LINES,
  RECORD_REPS_LINES,
  REPS_STORY_LINES,
  SINCE_START_LINES,
  STALL_LINES,
  WEEKS_AGO_LINES,
} from '../../../config/pip/personalLines'
import type { PipFacts } from '../facts'
import { bestDay, dayNear, type LiftDay, type LiftHistory } from '../liftFacts'
import { capitalize } from '../text'
import { agoPhrase, spanPhrase } from '../time'
import type { PipMoment } from '../types'
import { moment, num, say } from './say'

/** The smallest jump in weight worth a story: one plate-ish step. */
const minStep = (facts: PipFacts) => (facts.unit === 'kg' ? 1 : 2.5)

/** New records from the last few days. */
export function recordMoments(facts: PipFacts): PipMoment[] {
  return facts.records.slice(0, 2).map((r, i) => {
    const { history, day, previous } = r
    const id = `lift:record:${history.exercise.id}:${day.day}`
    const when = agoPhrase(day.ageDays)
    const common = { lift: history.exercise.name, when, When: capitalize(when), unit: facts.unit }
    const text =
      history.kind === 'load'
        ? say(facts, id, RECORD_LINES, { ...common, w: num(day.weight), reps: day.reps, prevW: num(previous.weight), prevReps: previous.reps })
        : say(facts, id, RECORD_REPS_LINES, { ...common, reps: day.reps, prevReps: previous.reps })
    return moment({ id, text, topic: 'lift', priority: 96 - i, cooldownHours: 72, mood: 'celebrate', talk: 'throwback', on: day.day })
  })
}

interface Story {
  moment: PipMoment
  kind: 'weeks' | 'start'
  /** Relative improvement, to pick the best stories. */
  gain: number
}

function storyFor(facts: PipFacts, history: LiftHistory, then: LiftDay, now: LiftDay, kind: 'weeks' | 'start'): Story | null {
  const big = history.kind === 'load' ? now.weight - then.weight >= minStep(facts) : now.reps - then.reps >= 1
  if (!big || now.score <= then.score) return null
  const id = `lift:${kind}:${history.exercise.id}:${then.day}:${now.day}`
  const ago = agoPhrase(then.ageDays)
  const slots = { lift: history.exercise.name, ago, Ago: capitalize(ago), span: spanPhrase(then.ageDays), unit: facts.unit, w1: num(then.weight), r1: then.reps, w2: num(now.weight), r2: now.reps }
  const lines = history.kind === 'load' ? (kind === 'weeks' ? WEEKS_AGO_LINES : SINCE_START_LINES) : REPS_STORY_LINES
  const diff = history.kind === 'load' ? num(now.weight - then.weight) : now.reps - then.reps
  return {
    kind,
    gain: (now.score - then.score) / then.score,
    moment: moment({
      id,
      text: say(facts, id, lines, { ...slots, diff }),
      topic: 'lift',
      priority: kind === 'weeks' ? 62 : 58,
      cooldownHours: 96,
      mood: 'flex',
      talk: 'throwback',
    }),
  }
}

/** "Two weeks ago you lifted X. Now you lift Y." for the lifts that have climbed. */
export function storyMoments(facts: PipFacts): PipMoment[] {
  const stories: Story[] = []
  for (const history of facts.lifts) {
    if (history.days.length < 2) continue
    const now = bestDay(history.days.filter((d) => d.ageDays <= 21))
    if (!now) continue
    const fortnight = dayNear(history.days, 14, 4)
    if (fortnight && fortnight.ageDays - now.ageDays >= 7) {
      const story = storyFor(facts, history, fortnight, now, 'weeks')
      if (story) stories.push(story)
    }
    const first = history.days[0]
    if (first.ageDays >= 21 && first.ageDays - now.ageDays >= 14 && first.day !== fortnight?.day) {
      const story = storyFor(facts, history, first, now, 'start')
      if (story) stories.push(story)
    }
  }
  // The best two of each kind, so "two weeks ago" stories are not crowded out by "since you started" ones.
  const best = (kind: Story['kind']) => stories.filter((s) => s.kind === kind).sort((a, b) => b.gain - a.gain).slice(0, 2)
  return [...best('weeks'), ...best('start')].map((s) => s.moment)
}

/** A lift you keep training whose best is at least two weeks old and hasn't been beaten in three sessions since. */
export function stallMoments(facts: PipFacts): PipMoment[] {
  const stalled = facts.lifts
    .filter((h) => h.kind === 'load' && h.days.length >= 5)
    .map((history) => {
      const best = bestDay(history.days)!
      return { history, best, since: history.days.filter((d) => d.ageDays < best.ageDays).length }
    })
    .filter(({ history, best, since }) => since >= 3 && best.ageDays >= 14 && history.days[history.days.length - 1].ageDays <= 10)
    .sort((a, b) => b.history.totalSets - a.history.totalSets)[0]
  if (!stalled) return []
  const { history, best } = stalled
  const id = `lift:stall:${history.exercise.id}:${best.day}`
  const text = say(facts, id, STALL_LINES, {
    lift: history.exercise.name,
    w: num(best.weight),
    reps: best.reps,
    unit: facts.unit,
    weeks: Math.max(2, Math.round(best.ageDays / 7)),
    jump: facts.unit === 'kg' ? '1 kg' : '2.5 lb',
  })
  return [moment({ id, text, topic: 'lift', priority: 47, cooldownHours: 168, mood: 'think' })]
}

/** Your heaviest set on the lift you do most, once it is a little while ago. */
export function heaviestMoments(facts: PipFacts): PipMoment[] {
  const favourite = [...facts.lifts].filter((h) => h.kind === 'load' && h.days.length >= 3).sort((a, b) => b.totalSets - a.totalSets)[0]
  const best = favourite && bestDay(favourite.days)
  if (!favourite || !best || best.ageDays < 5) return []
  const id = `lift:heaviest:${favourite.exercise.id}:${best.day}`
  const text = say(facts, id, HEAVIEST_LINES, { lift: favourite.exercise.name, w: num(best.weight), reps: best.reps, unit: facts.unit, ago: agoPhrase(best.ageDays) })
  return [moment({ id, text, topic: 'lift', priority: 50, cooldownHours: 120, mood: 'flex', talk: 'throwback' })]
}
