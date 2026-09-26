// Badges for everything that isn't a lift: one per kind of cardio or practice.
//
// - Pace badges (running, rowing, ski erg, outdoor cycling, freestyle swimming) rank your best
//   effort against other people, like the lifts. An effort of any length is converted to the
//   reference distance with Riegel's formula (time x (reference / distance) ^ 1.06), so a fast
//   3 km run and a steady 10 km run can both count.
// - Practice badges (walking, yoga, boxing, sports...) rank the hours you've put in, using the
//   `fromHours` steps in config/ranks.ts.
//
// Anchors are approximate times for people who do the activity recreationally, at the 5th, 20th,
// 50th, 80th and 95th percentile (slowest first). Tune them here.
import type { Anchors, Sex } from './strengthStandards'
import type { Category, Exercise } from '../types/db'

export interface PaceStandard {
  /** Metres the anchors are timed over (or 0 for a plain average speed, like cycling). */
  referenceM: number
  /** Shortest effort that counts, in metres. */
  minDistanceM: number
  /** Seconds to cover referenceM (or km/h when referenceM is 0), per sex, worst to best. */
  men: Anchors
  women: Anchors
  /** How the best effort is described: "5K time", "2,000 m time", "Average speed", "Pace per 100 m". */
  measure: string
}

export interface ActivityBadgeDef {
  key: string
  label: string
  /** Colour family for the tile icon. */
  category: Category
  pace?: PaceStandard
  /** Used to estimate time when only a distance was logged (seconds per km). */
  secondsPerKm: number
}

const min = (m: number, s = 0) => m * 60 + s

export const ACTIVITY_BADGES: readonly ActivityBadgeDef[] = [
  {
    key: 'running',
    label: 'Running',
    category: 'cardio',
    secondsPerKm: 360,
    pace: { referenceM: 5000, minDistanceM: 1000, measure: '5K time', men: [min(45), min(36), min(29, 30), min(24, 30), min(21)], women: [min(50), min(41), min(34), min(28, 30), min(24, 30)] },
  },
  {
    key: 'rowing',
    label: 'Rowing',
    category: 'cardio',
    secondsPerKm: 270,
    pace: { referenceM: 2000, minDistanceM: 500, measure: '2,000 m time', men: [min(10, 15), min(9), min(8, 5), min(7, 25), min(6, 55)], women: [min(11, 45), min(10, 20), min(9, 15), min(8, 30), min(7, 55)] },
  },
  {
    key: 'ski_erg',
    label: 'Ski erg',
    category: 'cardio',
    secondsPerKm: 300,
    pace: { referenceM: 2000, minDistanceM: 500, measure: '2,000 m time', men: [min(11), min(9, 40), min(8, 40), min(7, 55), min(7, 20)], women: [min(12, 30), min(11), min(9, 55), min(9, 5), min(8, 30)] },
  },
  {
    key: 'cycling',
    label: 'Cycling',
    category: 'cardio',
    secondsPerKm: 150,
    // km/h here (referenceM 0): the average speed of a ride.
    pace: { referenceM: 0, minDistanceM: 5000, measure: 'Average speed', men: [16, 20, 24, 28, 32], women: [14, 17.5, 21, 24.5, 28] },
  },
  {
    key: 'freestyle',
    label: 'Freestyle swimming',
    category: 'swim',
    secondsPerKm: 1500,
    pace: { referenceM: 400, minDistanceM: 100, measure: '400 m time', men: [min(13), min(10, 20), min(8, 20), min(6, 48), min(5, 40)], women: [min(14), min(11, 20), min(9), min(7, 20), min(6, 8)] },
  },
  { key: 'walking', label: 'Walking & hiking', category: 'cardio', secondsPerKm: 720 },
  { key: 'indoor_cycling', label: 'Indoor cycling', category: 'cardio', secondsPerKm: 150 },
  { key: 'machines', label: 'Elliptical & stairs', category: 'cardio', secondsPerKm: 480 },
  { key: 'conditioning', label: 'HIIT & conditioning', category: 'cardio', secondsPerKm: 360 },
  { key: 'swimming', label: 'Swimming', category: 'swim', secondsPerKm: 1800 },
  { key: 'combat', label: 'Boxing & combat', category: 'combat', secondsPerKm: 360 },
  { key: 'yoga', label: 'Yoga & Pilates', category: 'yoga', secondsPerKm: 600 },
  { key: 'stretching', label: 'Stretching', category: 'stretch', secondsPerKm: 600 },
  { key: 'sports', label: 'Sports', category: 'sport', secondsPerKm: 480 },
  { key: 'holds', label: 'Holds & carries', category: 'strength', secondsPerKm: 600 },
]

/** Counted for a set logged as reps (burpees, box jumps) when working out practice time. */
export const SECONDS_PER_REPS_SET = 45

const byKey = new Map(ACTIVITY_BADGES.map((b) => [b.key, b]))
export const activityBadgeDef = (key: string): ActivityBadgeDef => byKey.get(key) ?? byKey.get('conditioning')!

/**
 * Which badge an activity belongs to. Lifts logged as weight x reps belong to the strength
 * badges instead, so they return null.
 */
export function activityBadgeKey(exercise: Pick<Exercise, 'name' | 'category' | 'tracking'>): string | null {
  const name = exercise.name.toLowerCase()
  const paced = exercise.tracking === 'distance'
  switch (exercise.category) {
    case 'strength':
      return exercise.tracking === 'reps' ? null : 'holds'
    case 'swim':
      return paced && /freestyle|front crawl|open water|pull buoy|lap swim/.test(name) ? 'freestyle' : 'swimming'
    case 'combat':
      return 'combat'
    case 'yoga':
      return 'yoga'
    case 'stretch':
      return 'stretching'
    case 'sport':
      return 'sports'
    case 'cardio':
      if (/walk|hike|hiking|ruck/.test(name)) return 'walking'
      if (/elliptical|stair|step ?mill|stepper|cross ?trainer/.test(name)) return 'machines'
      if (/ski/.test(name)) return paced ? 'ski_erg' : 'conditioning'
      if (/row/.test(name)) return paced ? 'rowing' : 'conditioning'
      if (/stationary|spin|assault|indoor|peloton|air ?bike|echo bike/.test(name)) return 'indoor_cycling'
      if (/cycl|bike|biking|ride/.test(name)) return paced ? 'cycling' : 'indoor_cycling'
      if (/sprint|shuttle|interval/.test(name)) return 'conditioning'
      if (/\brun|jog|treadmill/.test(name)) return paced ? 'running' : 'conditioning'
      return 'conditioning'
    default:
      return 'conditioning'
  }
}

export const paceAnchors = (pace: PaceStandard, sex: Sex): Anchors => (sex === 'male' ? pace.men : pace.women)
