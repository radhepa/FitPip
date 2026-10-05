// Ranks for lifts and muscles: the best set of each lift is compared with the strength standards
// (config/strengthStandards.ts) at the lifter's bodyweight, which gives a percentile and a rank.
// Muscles take their rank from the lifts that train them.
import { RANKS, type RankNumber } from '../config/ranks'
import {
  ANCHOR_PERCENTILES,
  findStandard,
  type Sex,
  type StrengthStandard,
} from '../config/strengthStandards'
import type { ReferenceRow } from '../config/strengthReferenceData'
import { MUSCLES, type BegunSession, type Exercise, type Muscle, type SetRow, type WeightUnit } from '../types/db'
import { MIN_PERCENTILE, percentileOf, rankForPercentile, valueAtPercentile } from './percentile'

/**
 * Conservative fallback only outside published load-table bodyweights. Within the tables,
 * interpolate the exercise's actual sex/bodyweight anchors instead of imposing one exponent.
 */
export const BODYWEIGHT_EXPONENT = 0.67
/** Reps above this don't raise a one-rep-max estimate any further (Epley gets unreliable). */
export const MAX_COUNTED_REPS = 10
/** A lift counts this much towards a muscle it only helps with (its secondary muscles). */
export const SECONDARY_SHARE = 0.8

const KG_PER_LB = 0.45359237
export const toKg = (weight: number, unit: WeightUnit): number => (unit === 'kg' ? weight : weight * KG_PER_LB)
export const fromKg = (kg: number, unit: WeightUnit): number => (unit === 'kg' ? kg : kg / KG_PER_LB)

/** Rounds a weight to something you could load: 5 lb or 2.5 kg steps (1 lb / 0.5 kg when light). */
export function roundLoad(weight: number, unit: WeightUnit): number {
  const step = unit === 'kg' ? (weight < 20 ? 0.5 : 2.5) : weight < 40 ? 1 : 5
  return Math.round(weight / step) * step
}

/** Source-compatible Brzycki/Epley blend, limited to 10 reps. Longer sets give a lower estimate. */
export function cappedE1rm(weight: number, reps: number, cap = MAX_COUNTED_REPS): number {
  if (!Number.isFinite(weight) || weight <= 0 || !Number.isInteger(reps) || reps < 1 || !(cap >= 1)) return 0
  const n = Math.min(reps, cap, MAX_COUNTED_REPS)
  const brzycki = weight * 36 / (37 - n)
  const epley = weight * (1 + n / 30)
  const blend = Math.max(0, Math.min(1, (n - 8) / 2))
  return brzycki * (1 - blend) + epley * blend
}

// A +1 offset allows log interpolation at zero reps without treating endurance as a 1RM.
const repsRatio = (reps: number) => 1 + reps

/**
 * Published performances at this bodyweight. Loads outside the table use an explicit allometric
 * approximation; rep counts outside it stay at the nearest published bodyweight.
 */
export function referenceAnchors(rows: readonly ReferenceRow[], bodyweightKg: number, kind: 'load' | 'reps'): number[] {
  if (!Number.isFinite(bodyweightKg) || bodyweightKg <= 0 || rows.length < 2) return []
  const first = rows[0]
  const last = rows[rows.length - 1]
  if (bodyweightKg < first[0] || bodyweightKg > last[0]) {
    const edge = bodyweightKg < first[0] ? first : last
    const factor = kind === 'load' ? (bodyweightKg / edge[0]) ** BODYWEIGHT_EXPONENT : 1
    return edge.slice(1).map((v) => v * factor)
  }
  const upper = rows.findIndex((row) => row[0] >= bodyweightKg)
  if (rows[upper][0] === bodyweightKg) return rows[upper].slice(1)
  const lo = rows[upper - 1]
  const hi = rows[upper]
  const fraction = (bodyweightKg - lo[0]) / (hi[0] - lo[0])
  return lo.slice(1).map((v, i) => v + fraction * (hi[i + 1] - v))
}

/** A monotone display scale: load 1RM/bodyweight or 1 + observed bodyweight reps. */
export function anchorRatios(standard: StrengthStandard, sex: Sex, bodyweightKg: number): number[] {
  const anchors = referenceAnchors(standard.reference[sex], bodyweightKg, standard.kind)
  return anchors.map((v) => standard.kind === 'reps' ? repsRatio(v) : v / bodyweightKg)
}

/** One set on the same scale as anchorRatios. Set weights are in the unit the app is set to. */
export function setRatio(standard: StrengthStandard, set: Pick<SetRow, 'weight' | 'reps'>, unit: WeightUnit, bodyweightKg: number, sex: Sex = 'male'): number {
  if (!Number.isFinite(bodyweightKg) || bodyweightKg <= 0 || !Number.isFinite(set.weight) || set.weight < 0 || !Number.isInteger(set.reps) || set.reps < 1) return 0
  if (standard.kind === 'load') return cappedE1rm(toKg(set.weight, unit), set.reps) / bodyweightKg
  if (set.weight === 0) return repsRatio(set.reps) // Count observed endurance directly; no 1RM extrapolation or 60-rep ceiling.
  const weightedRows = sex === 'male' ? standard.reference.weightedMale : standard.reference.weightedFemale
  if (!weightedRows || standard.share !== 1) return 0 // No defensible added-load conversion for other bodyweight exercises.
  if (bodyweightKg < weightedRows[0][0] || bodyweightKg > weightedRows.at(-1)![0]) return 0
  const addedLoads = referenceAnchors(weightedRows, bodyweightKg, 'reps')
  const weightedAnchors = addedLoads.map((v) => (bodyweightKg + v) / bodyweightKg)
  const ratio = cappedE1rm(bodyweightKg + toKg(set.weight, unit), set.reps) / bodyweightKg
  const percentile = percentileOf(ratio, weightedAnchors, ANCHOR_PERCENTILES)
  // Map the weighted result to the same percentile on the displayed bodyweight-rep scale.
  return valueAtPercentile(percentile, anchorRatios(standard, sex, bodyweightKg), ANCHOR_PERCENTILES)
}

/** A ratio as the number people think in: a one-rep max in `unit`, or reps at bodyweight. */
export function ratioToValue(standard: StrengthStandard, ratio: number, bodyweightKg: number, unit: WeightUnit, roundUp = false): number {
  if (standard.kind === 'reps') return Math.max(0, roundUp ? Math.ceil(ratio - 1 - 1e-9) : Math.round(ratio - 1))
  const weight = fromKg(ratio * bodyweightKg, unit)
  const step = unit === 'kg' ? (weight < 20 ? 0.5 : 2.5) : weight < 40 ? 1 : 5
  return roundUp ? Math.ceil(weight / step - 1e-9) * step : roundLoad(weight, unit)
}

export interface Comparison {
  standard: StrengthStandard
  sex: Sex
  bodyweightKg: number
  anchors: number[]
}

export const compareWith = (standard: StrengthStandard, sex: Sex, bodyweightKg: number): Comparison => ({
  standard,
  sex,
  bodyweightKg,
  anchors: anchorRatios(standard, sex, bodyweightKg),
})

/** Remove rounded zero loads and keep the upper percentile of tied performances. */
function comparisonCurve(c: Comparison) {
  const points = c.anchors.flatMap((v, i) => v > 0 && v !== c.anchors[i + 1] ? [{ value: v, percentile: ANCHOR_PERCENTILES[i] }] : [])
  return { anchors: points.map((p) => p.value), percentiles: points.map((p) => p.percentile) }
}

export function percentileForRatio(c: Comparison, ratio: number): number {
  if (c.anchors.length !== 5 || !Number.isFinite(ratio) || (c.standard.kind === 'reps' && ratio <= 1)) return MIN_PERCENTILE
  const curve = comparisonCurve(c)
  return curve.anchors.length < 2 ? MIN_PERCENTILE : percentileOf(ratio, curve.anchors, curve.percentiles)
}

/** The value (1RM or reps) that reaches each rank, at this bodyweight. Rank 1 needs nothing. */
export function rankLadder(c: Comparison, unit: WeightUnit): { rank: RankNumber; value: number }[] {
  const curve = comparisonCurve(c)
  if (curve.anchors.length < 2) return []
  return RANKS.map((r) => ({
    rank: r.rank,
    value: r.fromPercentile === 0 ? 0 : Math.max(c.standard.kind === 'reps' ? 1 : 0, ratioToValue(c.standard, valueAtPercentile(r.fromPercentile, curve.anchors, curve.percentiles), c.bodyweightKg, unit, true)),
  }))
}

/** What the average (50th percentile) lifter of this sex and bodyweight does. */
export function averageValue(c: Comparison, unit: WeightUnit): number {
  const curve = comparisonCurve(c)
  return curve.anchors.length < 2 ? 0 : ratioToValue(c.standard, valueAtPercentile(50, curve.anchors, curve.percentiles), c.bodyweightKg, unit)
}

export interface LiftBadge {
  exercise: Exercise
  standard: StrengthStandard
  comparison: Comparison
  /** The set with the best performance, and when it was done. */
  best: SetRow
  bestAt: string
  /** 1RM estimate (in the app's unit) or reps at bodyweight. */
  value: number
  percentile: number
  rank: RankNumber
  progress: number
  /** Muscles this lift ranks fully, and those it counts towards at SECONDARY_SHARE. */
  primary: Muscle[]
  secondary: Muscle[]
}

export interface StrengthInput {
  exercises: Exercise[]
  sessions: Pick<BegunSession, 'id' | 'started_at'>[]
  sets: SetRow[]
  unit: WeightUnit
  sex: Sex
  bodyweightKg: number
}

/** A badge for every lift that has a standard and at least one logged set, best rank first. */
export function rankLifts(input: StrengthInput): LiftBadge[] {
  if (!Number.isFinite(input.bodyweightKg) || input.bodyweightKg <= 0) return []
  const startedAt = new Map(input.sessions.map((s) => [s.id, s.started_at]))
  const setsByExercise = new Map<string, SetRow[]>()
  for (const set of input.sets) {
    if (!startedAt.has(set.session_id)) continue
    setsByExercise.set(set.exercise_id, [...(setsByExercise.get(set.exercise_id) ?? []), set])
  }

  const badges: LiftBadge[] = []
  for (const exercise of input.exercises) {
    const sets = setsByExercise.get(exercise.id)
    const standard = sets && findStandard(exercise)
    if (!sets || !standard) continue
    const comparison = compareWith(standard, input.sex, input.bodyweightKg)
    let best: SetRow | null = null
    let bestRatio = 0
    for (const set of sets) {
      const ratio = setRatio(standard, set, input.unit, input.bodyweightKg, input.sex)
      if (ratio > bestRatio || (ratio === bestRatio && best && set.created_at < best.created_at)) {
        best = set
        bestRatio = ratio
      }
    }
    if (!best || bestRatio <= 0) continue
    const percentile = percentileForRatio(comparison, bestRatio)
    const { rank, progress } = rankForPercentile(percentile)
    // A custom primary-muscle tag cannot turn a bench press into a measured calf-strength test.
    const primary = [...standard.muscles]
    const secondary = [...new Set([...exercise.primary_muscles, ...exercise.secondary_muscles])].filter((m) => !primary.includes(m))
    badges.push({
      exercise,
      standard,
      comparison,
      best,
      bestAt: startedAt.get(best.session_id) ?? best.created_at,
      value: standard.kind === 'load' ? Math.round(fromKg(bestRatio * input.bodyweightKg, input.unit) * 10) / 10 : Math.round(bestRatio - 1),
      percentile,
      rank,
      progress,
      primary,
      secondary,
    })
  }
  return badges.sort((a, b) => b.percentile - a.percentile || a.exercise.name.localeCompare(b.exercise.name))
}

export interface MuscleSource {
  badge: LiftBadge
  role: 'primary' | 'secondary'
  /** What this lift is worth to the muscle (the lift's percentile, or SECONDARY_SHARE of it). */
  score: number
}

export interface MuscleRank {
  muscle: Muscle
  percentile: number
  rank: RankNumber
  progress: number
  /** Every lift that counts, best first. The first one sets the rank. */
  sources: MuscleSource[]
}

/** Each muscle's rank: the best any lift gives it. Muscles no ranked lift trains are left out. */
export function rankMuscles(badges: LiftBadge[]): Partial<Record<Muscle, MuscleRank>> {
  const out: Partial<Record<Muscle, MuscleRank>> = {}
  for (const muscle of MUSCLES) {
    const sources: MuscleSource[] = badges.flatMap((badge): MuscleSource[] => {
      if (badge.primary.includes(muscle)) return [{ badge, role: 'primary', score: badge.percentile }]
      if (badge.secondary.includes(muscle)) return [{ badge, role: 'secondary', score: badge.percentile * SECONDARY_SHARE }]
      return []
    })
    if (sources.length === 0) continue
    sources.sort((a, b) => b.score - a.score)
    const percentile = sources[0].score
    out[muscle] = { muscle, percentile, ...rankForPercentile(percentile), sources }
  }
  return out
}

export const MUSCLE_GROUPS: { key: string; label: string; muscles: Muscle[] }[] = [
  { key: 'chest', label: 'Chest', muscles: ['chest'] },
  { key: 'back', label: 'Back', muscles: ['lats', 'upper_back', 'lower_back', 'traps'] },
  { key: 'shoulders', label: 'Shoulders', muscles: ['front_delts', 'side_delts', 'rear_delts'] },
  { key: 'arms', label: 'Arms', muscles: ['biceps', 'triceps', 'forearms'] },
  { key: 'legs', label: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'] },
  { key: 'core', label: 'Core', muscles: ['abs', 'obliques'] },
]

export interface GroupRank {
  key: string
  label: string
  /** Average of the group's ranked muscles; null when none of them is ranked. */
  percentile: number | null
  rank: RankNumber | null
}

export interface OverallRank {
  /** Average over all six groups; a group with no rank counts as 0, so a balanced body ranks higher. */
  score: number
  rank: RankNumber
  progress: number
  groups: GroupRank[]
}

export function overallRank(muscles: Partial<Record<Muscle, MuscleRank>>): OverallRank | null {
  const groups: GroupRank[] = MUSCLE_GROUPS.map(({ key, label, muscles: members }) => {
    const ranked = members.flatMap((m) => (muscles[m] ? [muscles[m].percentile] : []))
    if (ranked.length === 0) return { key, label, percentile: null, rank: null }
    const percentile = ranked.reduce((sum, p) => sum + p, 0) / ranked.length
    return { key, label, percentile, rank: rankForPercentile(percentile).rank }
  })
  if (groups.every((g) => g.percentile === null)) return null
  const score = groups.reduce((sum, g) => sum + (g.percentile ?? 0), 0) / groups.length
  return { score, ...rankForPercentile(score), groups }
}

/** Strength exercises that were logged but have no standard to compare with (bands, odd machines). */
export function unrankedLifts(exercises: Exercise[], sets: SetRow[]): Exercise[] {
  const logged = new Set(sets.filter((s) => s.reps > 0).map((s) => s.exercise_id))
  return exercises.filter((e) => e.category === 'strength' && e.tracking === 'reps' && logged.has(e.id) && !findStandard(e))
}
