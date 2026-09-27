// What Pip knows about your weight: where you started, where you are, where you're headed.
import type { BodyWeight, WeightUnit } from '../../types/db'
import { dateMs, goalProgress, toWeighIns, weekAverage, type WeighIn } from '../bodyWeight'
import { convertWeight } from '../units'
import { daysBetween } from './time'

const round1 = (n: number) => Math.round(n * 10) / 10

export interface WeightFacts {
  unit: WeightUnit
  latest: number
  latestDate: string
  first: number
  firstDate: string
  count: number
  /** The goal in the shown unit, or null when none is set. */
  goal: number | null
  /** Which way the goal points from your first weigh-in. Null without a goal. */
  direction: 'lose' | 'gain' | 'hold' | null
  /** Goal minus latest: negative when there is weight left to lose. */
  remaining: number | null
  /** 0 to 1 of the way from the first weigh-in to the goal. */
  fraction: number | null
  reached: boolean
  /** Latest minus a weigh-in about a week / two weeks / a month earlier (null if none is close enough). */
  changeWeek: number | null
  changeTwoWeeks: number | null
  changeMonth: number | null
  /** Latest minus the first weigh-in; null with a single weigh-in. */
  sinceStart: number | null
  average7: number | null
  /** Days since the latest weigh-in. */
  daysSince: number
  isNewLow: boolean
  isNewHigh: boolean
}

/** Change against the earlier weigh-in nearest `target` days before the latest, if one is within `slack` days of that. */
export function changeAround(list: WeighIn[], target: number, slack: number): number | null {
  if (list.length < 2) return null
  const latest = list[list.length - 1]
  let best: WeighIn | null = null
  let bestOff = Infinity
  for (const w of list.slice(0, -1)) {
    const age = (dateMs(latest.date) - dateMs(w.date)) / 86_400_000
    const off = Math.abs(age - target)
    if (off <= slack && off < bestOff) {
      best = w
      bestOff = off
    }
  }
  return best ? round1(latest.weight - best.weight) : null
}

/** The weigh-in nearest a date (YYYY-MM-DD), if one is within `slack` days of it. */
export function weightNear(list: WeighIn[], day: string, slack: number): number | null {
  const target = dateMs(day)
  let best: { off: number; weight: number } | null = null
  for (const w of list) {
    const off = Math.abs(dateMs(w.date) - target) / 86_400_000
    if (off <= slack && (!best || off < best.off)) best = { off, weight: w.weight }
  }
  return best?.weight ?? null
}

export function weightFacts(weights: BodyWeight[], unit: WeightUnit, goal: { weight: number; unit: WeightUnit } | null, now: Date): WeightFacts | null {
  const list = toWeighIns(weights, unit)
  if (list.length === 0) return null
  const first = list[0]
  const latest = list[list.length - 1]
  const goalShown = goal ? convertWeight(goal.weight, goal.unit, unit) : null
  const progress = goalProgress(list, goalShown)
  const earlier = list.slice(0, -1).map((w) => w.weight)
  const recent = daysBetween(dateMs(latest.date), now) <= 2
  return {
    unit,
    latest: latest.weight,
    latestDate: latest.date,
    first: first.weight,
    firstDate: first.date,
    count: list.length,
    goal: goalShown,
    direction: goalShown === null ? null : goalShown < first.weight - 0.5 ? 'lose' : goalShown > first.weight + 0.5 ? 'gain' : 'hold',
    remaining: progress ? progress.remaining : null,
    fraction: progress ? progress.fraction : null,
    reached: progress?.reached ?? false,
    changeWeek: changeAround(list, 7, 3),
    changeTwoWeeks: changeAround(list, 14, 4),
    changeMonth: changeAround(list, 30, 6),
    sinceStart: list.length >= 2 ? round1(latest.weight - first.weight) : null,
    average7: weekAverage(list),
    daysSince: Math.max(0, daysBetween(dateMs(latest.date), now)),
    isNewLow: list.length >= 3 && recent && latest.weight < Math.min(...earlier),
    isNewHigh: list.length >= 3 && recent && latest.weight > Math.max(...earlier),
  }
}
