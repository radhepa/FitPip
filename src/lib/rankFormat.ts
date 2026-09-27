// Wording and numbers for ranks and badges.
import type { ActivityBadgeDef } from '../config/activityBadges'
import { MUSCLE_TO_BODY, type BodyMuscle } from '../config/muscleMap'
import { rankInfo, type RankNumber } from '../config/ranks'
import { STRENGTH_STANDARDS, type StrengthStandard } from '../config/strengthStandards'
import type { DistanceUnit, Muscle, WeightUnit } from '../types/db'
import { formatClock, formatWeight } from './format'
import { topShare } from './percentile'
import type { MuscleRank } from './strengthRank'

/** "Top 28%" above the middle, "Beats 24%" below it (a "top 76%" reads like bad news). */
export const topText = (percentile: number): string =>
  percentile >= 50 ? `Top ${topShare(percentile)}%` : `Beats ${Math.max(1, Math.round(percentile))}%`

/** "Stronger than 72% of lifters" / "Faster than 72% of runners". */
export function beatsText(percentile: number, verb = 'Stronger', who = 'lifters'): string {
  const beaten = Math.min(99.9, Math.max(0, percentile))
  const shown = beaten >= 99 ? Math.round(beaten * 10) / 10 : Math.round(beaten)
  return `${verb} than ${shown}% of ${who}`
}

/** "Gold" or "Gold (4 of 10)". */
export const rankName = (rank: RankNumber, withNumber = false): string =>
  withNumber ? `${rankInfo(rank).name} (${rank} of 10)` : rankInfo(rank).name

/** A lift performance: "225 lb", "40 lb per dumbbell", "50 lb per arm", "12 reps". */
export function liftValueText(standard: StrengthStandard, value: number, unit: WeightUnit): string {
  if (standard.kind === 'reps') return `${Math.round(value)} ${Math.round(value) === 1 ? 'rep' : 'reps'}`
  // Whole pounds, or half kilos: an estimate doesn't deserve more precision than that.
  const rounded = unit === 'kg' ? Math.round(value * 2) / 2 : Math.round(value)
  const weight = `${formatWeight(rounded)} ${unit}`
  if (standard.kind === 'load' && standard.perHand) return `${weight} per dumbbell`
  return standard.kind === 'load' && standard.perArm ? `${weight} per arm` : weight
}

/** What a lift's value means: "Estimated 1-rep max" or "Reps at bodyweight". */
export const liftMeasure = (standard: StrengthStandard): string => (standard.kind === 'reps' ? 'Reps at bodyweight' : 'Estimated 1-rep max')

const KM_PER_MI = 1.609344

/** A pace-badge value: "24:10" for a reference-distance time, "24.3 km/h" or "15.1 mph" for speed. */
export function paceValueText(def: ActivityBadgeDef, value: number, distanceUnit: DistanceUnit): string {
  if (!def.pace || def.pace.referenceM > 0) return formatClock(Math.round(value) * 1000)
  const speed = distanceUnit === 'mi' ? value / KM_PER_MI : value
  return `${speed.toFixed(1)} ${distanceUnit === 'mi' ? 'mph' : 'km/h'}`
}

/** "3 h 20 min", "45 min", "12 h". */
export function hoursText(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 || h >= 10 ? `${h} h` : `${h} h ${m} min`
}

/** Each drawn region's rank: the best rank among the muscles that feed it. */
export function regionRanks(muscles: Partial<Record<Muscle, MuscleRank>>): Partial<Record<BodyMuscle, RankNumber>> {
  const out: Partial<Record<BodyMuscle, RankNumber>> = {}
  for (const [muscle, rank] of Object.entries(muscles) as [Muscle, MuscleRank][]) {
    for (const region of MUSCLE_TO_BODY[muscle]) out[region] = Math.max(out[region] ?? 0, rank.rank) as RankNumber
  }
  return out
}

/** Lifts to suggest for a muscle with no rank yet (labels from config/strengthStandards.ts). */
export const SUGGESTED_LIFTS: Record<Muscle, string[]> = {
  chest: ['Bench press', 'Push-up', 'Dumbbell fly'],
  front_delts: ['Overhead press', 'Front raise'],
  side_delts: ['Lateral raise', 'Overhead press'],
  rear_delts: ['Rear delt fly', 'Face pull'],
  biceps: ['Barbell curl', 'Chin-up'],
  triceps: ['Dip', 'Triceps pushdown', 'Close-grip bench press'],
  forearms: ['Wrist curl', 'Reverse curl'],
  traps: ['Shrug', 'Upright row'],
  lats: ['Pull-up', 'Lat pulldown'],
  upper_back: ['Barbell row', 'Seated cable row'],
  lower_back: ['Deadlift', 'Back extension'],
  abs: ['Hanging leg raise', 'Cable crunch'],
  obliques: ['Russian twist', 'Cable woodchop'],
  quads: ['Back squat', 'Leg press'],
  hamstrings: ['Romanian deadlift', 'Leg curl'],
  glutes: ['Hip thrust', 'Back squat'],
  adductors: ['Hip adduction'],
  abductors: ['Hip abduction'],
  calves: ['Standing calf raise'],
}

export const liftsThatRank = (muscle: Muscle): string[] => SUGGESTED_LIFTS[muscle]

/** Every suggested lift has a standard with that label (checked in tests). */
export const hasStandardLabel = (label: string): boolean => STRENGTH_STANDARDS.some((s) => s.label === label)
