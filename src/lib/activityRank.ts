// Ranks for cardio and practice badges (see config/activityBadges.ts).
import { ACTIVITY_BADGES, SECONDS_PER_REPS_SET, activityBadgeKey, paceAnchors, type ActivityBadgeDef, type PaceStandard } from '../config/activityBadges'
import type { RankNumber } from '../config/ranks'
import { ANCHOR_PERCENTILES, type Sex } from '../config/strengthStandards'
import type { BegunSession, Exercise, SetRow } from '../types/db'
import { percentileOf, rankForHours, rankForPercentile } from './percentile'

/** Riegel's endurance exponent: time grows a little faster than distance. */
export const RIEGEL_EXPONENT = 1.06

export interface PaceEffort {
  set: SetRow
  at: string
  /** Seconds for the reference distance, or km/h for a plain average speed. */
  value: number
  percentile: number
}

export interface ActivityBadge {
  def: ActivityBadgeDef
  /** The activities logged under this badge. */
  exercises: Exercise[]
  /** Time put in (estimated from distance or sets when no time was logged). */
  seconds: number
  sessions: number
  /** What the rank is based on: your best effort against other people, or hours of practice. */
  basis: 'pace' | 'hours'
  percentile: number | null
  rank: RankNumber
  progress: number
  best: PaceEffort | null
}

/** A set's time, estimated from its distance (or counted as a short round) when none was logged. */
export function practiceSeconds(set: Pick<SetRow, 'duration_seconds' | 'distance_m' | 'reps'>, def: ActivityBadgeDef): number {
  if (set.duration_seconds) return set.duration_seconds
  if (set.distance_m) return Math.round((Number(set.distance_m) / 1000) * def.secondsPerKm)
  return set.reps > 0 ? SECONDS_PER_REPS_SET : 0
}

/** Seconds for the reference distance (Riegel), or km/h for plain speed. Null if the effort doesn't count. */
export function paceValue(set: Pick<SetRow, 'duration_seconds' | 'distance_m'>, pace: PaceStandard): number | null {
  const seconds = set.duration_seconds ?? 0
  const metres = Number(set.distance_m ?? 0)
  if (seconds < 60 || metres < pace.minDistanceM) return null
  if (pace.referenceM === 0) {
    const kmh = metres / 1000 / (seconds / 3600)
    return kmh > 0 && kmh <= 60 ? kmh : null
  }
  const equivalent = seconds * (pace.referenceM / metres) ** RIEGEL_EXPONENT
  // Faster than about twice the best anchor is a typo, not a performance.
  const fastest = Math.min(...pace.men, ...pace.women)
  return equivalent >= fastest * 0.55 ? equivalent : null
}

/** Percentile of a pace value: faster times (or higher speeds) are better. */
export function pacePercentile(value: number, pace: PaceStandard, sex: Sex): number {
  const anchors = paceAnchors(pace, sex)
  if (pace.referenceM === 0) return percentileOf(value, anchors, ANCHOR_PERCENTILES)
  // As speed, so bigger is better and the anchors increase.
  return percentileOf(pace.referenceM / value, anchors.map((t) => pace.referenceM / t), ANCHOR_PERCENTILES)
}

export function rankActivities(input: {
  exercises: Exercise[]
  sessions: Pick<BegunSession, 'id' | 'started_at'>[]
  sets: SetRow[]
  sex: Sex | null
}): ActivityBadge[] {
  const startedAt = new Map(input.sessions.map((s) => [s.id, s.started_at]))
  const exerciseById = new Map(input.exercises.map((e) => [e.id, e]))
  const groups = new Map<string, { exercises: Set<Exercise>; sets: SetRow[] }>()
  for (const set of input.sets) {
    const exercise = exerciseById.get(set.exercise_id)
    const key = exercise && startedAt.has(set.session_id) ? activityBadgeKey(exercise) : null
    if (!exercise || !key) continue
    const group = groups.get(key) ?? { exercises: new Set(), sets: [] }
    group.exercises.add(exercise)
    group.sets.push(set)
    groups.set(key, group)
  }

  const badges: ActivityBadge[] = []
  for (const def of ACTIVITY_BADGES) {
    const group = groups.get(def.key)
    if (!group) continue
    const seconds = group.sets.reduce((sum, set) => sum + practiceSeconds(set, def), 0)
    const sessions = new Set(group.sets.map((s) => s.session_id)).size

    let best: PaceEffort | null = null
    if (def.pace && input.sex) {
      for (const set of group.sets) {
        const value = paceValue(set, def.pace)
        if (value === null) continue
        const percentile = pacePercentile(value, def.pace, input.sex)
        if (!best || percentile > best.percentile) best = { set, at: startedAt.get(set.session_id) ?? set.created_at, value, percentile }
      }
    }
    const position = best ? rankForPercentile(best.percentile) : rankForHours(seconds / 3600)
    badges.push({
      def,
      exercises: [...group.exercises].sort((a, b) => a.name.localeCompare(b.name)),
      seconds,
      sessions,
      basis: best ? 'pace' : 'hours',
      percentile: best?.percentile ?? null,
      ...position,
      best,
    })
  }
  return badges.sort((a, b) => b.rank - a.rank || b.progress - a.progress || b.seconds - a.seconds)
}
