// Pip and the scale: where you started, where you are, where you're headed. Kind about ups and
// downs alike, and it looks at the trend rather than a single morning.
import {
  DOWN_FAST_LINES,
  DOWN_WEEK_LINES,
  FLAT_LINES,
  GAIN_LINES,
  GOAL_HALF_LINES,
  GOAL_NEARLY_LINES,
  GOAL_QUARTER_LINES,
  GOAL_REACHED_LINES,
  GOAL_THREE_QUARTER_LINES,
  NEW_LOW_LINES,
  NO_GOAL_LINES,
  NO_WEIGH_INS_LINES,
  SINCE_WEIGH_LINES,
  STALE_WEIGH_LINES,
  TO_GO_LINES,
  TREND_LINES,
  UP_WEEK_LINES,
  WEIGHT_FIRST_GOAL_LINES,
  WEIGHT_FIRST_LINES,
} from '../../../config/pip/personalLines'
import { dateMs } from '../../bodyWeight'
import type { WeightFacts } from '../bodyFacts'
import type { PipFacts } from '../facts'
import { capitalize } from '../text'
import { agoPhrase, daysBetween } from '../time'
import type { PipMoment } from '../types'
import { moment, num, say } from './say'

/** A drop this big in a week (as a share of bodyweight) is worth a gentle word about eating enough. */
const FAST_LOSS_SHARE = 0.015

const BANDS: { at: number; lines: readonly string[] }[] = [
  { at: 0.9, lines: GOAL_NEARLY_LINES },
  { at: 0.75, lines: GOAL_THREE_QUARTER_LINES },
  { at: 0.5, lines: GOAL_HALF_LINES },
  { at: 0.25, lines: GOAL_QUARTER_LINES },
]

export function weightMoments(facts: PipFacts): PipMoment[] {
  const w = facts.weight
  if (!w) return [moment({ id: 'weight:none', text: say(facts, 'weight:none', NO_WEIGH_INS_LINES), topic: 'weight', priority: 36, cooldownHours: 48, mood: 'peekaboo', talk: 'progress' })]

  const out: PipMoment[] = []
  const add = (id: string, lines: readonly string[], slots: Record<string, string | number>, o: Partial<Pick<PipMoment, 'priority' | 'cooldownHours' | 'mood' | 'talk'>> & { priority: number }) =>
    out.push(moment({ id, text: say(facts, id, lines, slots), topic: 'weight', cooldownHours: 48, talk: 'progress', ...o }))

  const left = w.remaining === null ? 0 : Math.abs(w.remaining)
  const base = { unit: w.unit, w: num(w.latest), goal: w.goal === null ? '' : num(w.goal), left: num(left), avg: w.average7 === null ? '' : num(w.average7) }

  if (w.goal === null) add('weight:nogoal', NO_GOAL_LINES, base, { priority: 42, cooldownHours: 96, mood: 'think' })
  if (w.daysSince >= 5) add(`weight:stale:${w.latestDate}`, STALE_WEIGH_LINES, { ...base, days: w.daysSince }, { priority: 55, mood: 'peekaboo' })

  if (w.count === 1) {
    add('weight:first', w.goal === null ? WEIGHT_FIRST_LINES : WEIGHT_FIRST_GOAL_LINES, base, { priority: 64, cooldownHours: 24, mood: 'wave' })
    return out
  }

  if (w.goal !== null && w.reached && w.direction !== 'hold') {
    add(`weight:reached:${base.goal}`, GOAL_REACHED_LINES, base, { priority: 94, cooldownHours: 96, mood: 'celebrate' })
  }

  if (w.direction === 'lose' && !w.reached) losingMoments(facts, w, base, add)
  if (w.direction === 'gain' && !w.reached && w.sinceStart !== null && w.sinceStart > 0) {
    add(`weight:gain:${w.latestDate}`, GAIN_LINES, { ...base, x: num(w.sinceStart) }, { priority: 60, mood: 'flex' })
  }
  if ((w.direction === null || w.direction === 'hold') && w.sinceStart !== null && Math.abs(w.sinceStart) >= 0.5) {
    add(`weight:since:${w.latestDate}`, SINCE_WEIGH_LINES, sinceSlots(facts, w, base), { priority: 48, talk: 'throwback' })
  }
  if (w.average7 !== null && w.count >= 3) add(`weight:trend:${w.latestDate}`, TREND_LINES, base, { priority: 40, mood: 'think' })
  return out
}

function sinceSlots(facts: PipFacts, w: WeightFacts, base: Record<string, string | number>): Record<string, string | number> {
  const ago = agoPhrase(daysBetween(dateMs(w.firstDate), facts.now))
  return { ...base, ago, Ago: capitalize(ago), dir: (w.sinceStart ?? 0) < 0 ? 'down' : 'up', x: num(Math.abs(w.sinceStart ?? 0)) }
}

type Add = (id: string, lines: readonly string[], slots: Record<string, string | number>, o: Partial<Pick<PipMoment, 'priority' | 'cooldownHours' | 'mood' | 'talk'>> & { priority: number }) => number

/** Cutting: milestones, the week's change, plateaus and new lows. */
function losingMoments(facts: PipFacts, w: WeightFacts, base: Record<string, string | number>, add: Add): void {
  const fraction = w.fraction ?? 0
  const band = BANDS.find((b) => fraction >= b.at)
  if (band) add(`weight:goal:${Math.round(band.at * 100)}`, band.lines, base, { priority: 74, cooldownHours: 120, mood: 'celebrate' })

  const since = w.sinceStart !== null && w.sinceStart < 0 ? num(Math.abs(w.sinceStart)) : ''
  const toGo = since ? TO_GO_LINES : TO_GO_LINES.filter((l) => !l.includes('{since}'))
  add(`weight:togo:${w.latestDate}`, toGo, { ...base, pct: Math.round(fraction * 100), since }, { priority: 56, cooldownHours: 36, mood: 'nod' })

  if (w.isNewLow) add(`weight:low:${w.latestDate}`, NEW_LOW_LINES, base, { priority: 86, mood: 'celebrate' })

  const week = w.changeWeek
  if (week !== null && week <= -0.4) {
    const fast = -week >= w.latest * FAST_LOSS_SHARE
    add(`weight:down:${w.latestDate}`, fast ? DOWN_FAST_LINES : DOWN_WEEK_LINES, { ...base, x: num(-week) }, { priority: 62, mood: fast ? 'nod' : 'flex' })
  } else if (week !== null && week >= 0.6) {
    add(`weight:up:${w.latestDate}`, UP_WEEK_LINES, { ...base, x: num(week) }, { priority: 60, mood: 'love' })
  } else if (w.changeTwoWeeks !== null && Math.abs(w.changeTwoWeeks) <= 0.6 && w.count >= 3 && w.daysSince <= 3) {
    add(`weight:flat:${w.latestDate}`, FLAT_LINES, base, { priority: 60, mood: 'think' })
  }

  if (w.sinceStart !== null && w.sinceStart < 0) {
    add(`weight:since:${w.latestDate}`, SINCE_WEIGH_LINES, sinceSlots(facts, w, base), { priority: 52, talk: 'throwback', mood: 'flex' })
  }
}
