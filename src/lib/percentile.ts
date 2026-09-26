// Turning a performance into a percentile from five reference points (the 5th, 20th, 50th, 80th
// and 95th percentile). Between points the curve is straight in log(performance) against the
// log-odds of the percentile, which matches how strength and speed spread out in people: the gap
// from the 50th to the 80th percentile is a smaller jump than from the 80th to the 95th.
// Beyond the ends it carries on along the last segment.
import { RANKS, RANK_COUNT, type RankNumber } from '../config/ranks'

const logit = (p: number) => Math.log(p / (100 - p))
const fromLogit = (y: number) => 100 / (1 + Math.exp(-y))

export const MIN_PERCENTILE = 0.1
export const MAX_PERCENTILE = 99.9

const clampPercentile = (p: number) => Math.min(MAX_PERCENTILE, Math.max(MIN_PERCENTILE, p))

/** Straight-line interpolation through (xs, ys), extended past both ends. xs must increase. */
function interpolate(xs: number[], ys: number[], x: number): number {
  let i = 0
  while (i < xs.length - 2 && x > xs[i + 1]) i += 1
  const [x0, x1, y0, y1] = [xs[i], xs[i + 1], ys[i], ys[i + 1]]
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0)
}

/**
 * Percentile (0.1-99.9) of `value`, given the values at `percentiles` (both increasing; bigger
 * value = better). Zero or less is the bottom.
 */
export function percentileOf(value: number, anchors: readonly number[], percentiles: readonly number[]): number {
  if (!(value > 0)) return MIN_PERCENTILE
  const xs = anchors.map(Math.log)
  const ys = percentiles.map(logit)
  return clampPercentile(fromLogit(interpolate(xs, ys, Math.log(value))))
}

/** The value that sits at percentile `p` (the inverse of percentileOf). */
export function valueAtPercentile(p: number, anchors: readonly number[], percentiles: readonly number[]): number {
  const xs = anchors.map(Math.log)
  const ys = percentiles.map(logit)
  return Math.exp(interpolate(ys, xs, logit(clampPercentile(p))))
}

export interface RankPosition {
  rank: RankNumber
  /** 0..1 of the way from this rank to the next (1 at the top rank). */
  progress: number
}

/** Rank and progress to the next rank for a percentile. */
export function rankForPercentile(p: number): RankPosition {
  return position(p, (r) => r.fromPercentile, 100)
}

/** Rank and progress to the next rank for hours of practice. */
export function rankForHours(hours: number): RankPosition {
  return position(hours, (r) => r.fromHours, Infinity)
}

function position(value: number, start: (r: (typeof RANKS)[number]) => number, ceiling: number): RankPosition {
  let index = 0
  RANKS.forEach((r, i) => {
    if (value >= start(r)) index = i
  })
  const rank = RANKS[index].rank
  if (rank === RANK_COUNT) return { rank, progress: 1 }
  const from = start(RANKS[index])
  const to = Math.min(ceiling, start(RANKS[index + 1]))
  return { rank, progress: Math.min(1, Math.max(0, (value - from) / (to - from))) }
}

/** "Top 12%" style share of people ahead of this percentile, rounded kindly (never "top 0%"). */
export function topShare(p: number): number {
  const share = 100 - p
  if (share < 1) return Math.max(0.1, Math.round(share * 10) / 10)
  return Math.round(share)
}
