import { describe, expect, it } from 'vitest'
import { CATEGORIES, EQUIPMENT, MUSCLES, TRACKINGS } from '../../types/db'
import { ACTIVITY_BADGES, activityBadgeKey } from '../activityBadges'
import { findStandard } from '../strengthStandards'
import { EXTRA_CATALOG } from './index'

const byName = new Map(EXTRA_CATALOG.map((e) => [e.name, e]))
const entry = (name: string) => {
  const found = byName.get(name)
  if (!found) throw new Error(`Not in the catalogue: ${name}`)
  return found
}
const standardOf = (name: string) => findStandard(entry(name))?.key ?? null
const badgeOf = (name: string) => activityBadgeKey(entry(name))

const isLift = (e: { category: string; tracking: string }) => e.category === 'strength' && e.tracking === 'reps'

describe('the expanded catalogue', () => {
  it('is big, and mostly weightlifting and cardio', () => {
    expect(EXTRA_CATALOG.length).toBeGreaterThanOrEqual(300)
    expect(EXTRA_CATALOG.filter(isLift).length).toBeGreaterThanOrEqual(200)
    expect(EXTRA_CATALOG.filter((e) => ['cardio', 'swim', 'combat', 'sport'].includes(e.category)).length).toBeGreaterThanOrEqual(60)
  })

  it('has plenty of single-arm cable work', () => {
    const singleArm = EXTRA_CATALOG.filter((e) => e.equipment === 'cable' && /single-arm/i.test(e.name))
    expect(singleArm.length).toBeGreaterThanOrEqual(25)
    for (const e of singleArm) expect(e.instructions.at(-1), e.name).toMatch(/log each arm as its own set/i)
  })

  it('has no repeated name (a repeat would be silently skipped when seeding)', () => {
    const seen = new Set<string>()
    for (const e of EXTRA_CATALOG) {
      const key = e.name.toLowerCase()
      expect(seen.has(key), e.name).toBe(false)
      seen.add(key)
    }
  })

  it('uses only names the database accepts', () => {
    for (const e of EXTRA_CATALOG) {
      expect(e.name, e.name).toBe(e.name.trim())
      expect(e.name.length, e.name).toBeGreaterThan(0)
      expect(e.name.length, e.name).toBeLessThanOrEqual(80)
      expect(CATEGORIES, e.name).toContain(e.category)
      expect(TRACKINGS, e.name).toContain(e.tracking)
      expect(EQUIPMENT, e.name).toContain(e.equipment)
      for (const m of [...e.primary_muscles, ...e.secondary_muscles]) expect(MUSCLES, `${e.name}: ${m}`).toContain(m)
    }
  })

  it('lists muscles sensibly', () => {
    for (const e of EXTRA_CATALOG) {
      expect(new Set(e.primary_muscles).size, e.name).toBe(e.primary_muscles.length)
      expect(new Set(e.secondary_muscles).size, e.name).toBe(e.secondary_muscles.length)
      for (const m of e.secondary_muscles) expect(e.primary_muscles, `${e.name}: ${m} is both`).not.toContain(m)
      // Every lift feeds the muscle map, so it has to name a muscle.
      if (isLift(e)) expect(e.primary_muscles.length, e.name).toBeGreaterThan(0)
    }
  })

  it('logs each kind of exercise the way it is done', () => {
    for (const e of EXTRA_CATALOG) {
      if (['yoga', 'stretch', 'combat'].includes(e.category)) expect(e.tracking, e.name).toBe('time')
      if (['swim', 'sport'].includes(e.category)) expect(e.tracking, e.name).not.toBe('reps')
      if (e.tracking === 'time' && e.category === 'strength') expect(e.equipment, e.name).not.toBe('barbell')
    }
  })

  it('gives every exercise short, clear instructions', () => {
    for (const e of EXTRA_CATALOG) {
      expect(e.instructions.length, e.name).toBeGreaterThanOrEqual(1)
      expect(e.instructions.length, e.name).toBeLessThanOrEqual(4)
      for (const line of e.instructions) {
        expect(line.length, `${e.name}: ${line}`).toBeLessThanOrEqual(170)
        expect(line, `${e.name}: ${line}`).toMatch(/\.$/)
        expect(line, `${e.name}: ${line}`).not.toMatch(/\s{2,}/)
      }
    }
  })
})

describe('strength standards for the new lifts', () => {
  it('compares each one with the right standard, or with none when a fair comparison is not possible', () => {
    const expected: [string, string | null][] = [
      // Single-arm cable: their own standards
      ['Single-Arm Cable Chest Press', 'sa_cable_press'],
      ['Single-Arm Incline Cable Press', 'sa_cable_press'],
      ['Single-Arm Cable Shoulder Press', 'sa_cable_shoulder_press'],
      ['Single-Arm Cable Row', 'sa_cable_row'],
      ['Single-Arm Cable High Row', 'sa_cable_row'],
      ['Single-Arm Cable Lat Pulldown', 'sa_cable_pulldown'],
      ['Single-Arm Half-Kneeling Cable Pulldown', 'sa_cable_pulldown'],
      ['Single-Arm Cable Straight-Arm Pulldown', 'sa_cable_straight_arm'],
      ['Single-Arm Cable Fly', 'sa_cable_fly'],
      ['Single-Arm Low-to-High Cable Fly', 'sa_cable_fly'],
      ['Single-Arm Cable Rear Delt Fly', 'sa_cable_rear_fly'],
      ['Single-Arm Cable Face Pull', 'sa_cable_face_pull'],
      ['Single-Arm Cable Curl', 'sa_cable_curl'],
      ['Single-Arm Cable Hammer Curl', 'sa_cable_curl'],
      ['Single-Arm Cable Triceps Pushdown', 'sa_cable_pushdown'],
      ['Single-Arm Reverse-Grip Cable Pushdown', 'sa_cable_pushdown'],
      ['Single-Arm Overhead Cable Triceps Extension', 'sa_cable_triceps_extension'],
      ['Single-Arm Cable Lateral Raise (Cross-Body)', 'cable_lateral_raise'],
      // Single-arm, no fair standard
      ['Single-Arm Cable Upright Row', null],
      ['Single-Arm Cable Y-Raise', null],
      ['Single-Arm Cable Reverse Curl', null],
      ['Single-Arm Machine Chest Press', null],
      ['Single-Arm Machine Reverse Fly', null],
      ['Single-Leg Leg Press', null],
      ['Single-Leg Dumbbell Romanian Deadlift', null],
      ['Single-Leg Calf Raise', null],
      // One arm with a dumbbell is what the per-dumbbell standards already measure
      ['Single-Arm Dumbbell Bench Press', 'db_bench'],
      ['Single-Arm Dumbbell Shoulder Press', 'db_shoulder_press'],
      ['One-Arm Dumbbell Row', 'db_row'],
      // Two-handed cable work
      ['Cable Rope Face Pull', 'face_pull'],
      ['Cable Rope Triceps Pushdown', 'pushdown'],
      ['Cable Straight-Bar Triceps Pushdown', 'pushdown'],
      ['Cable Lat Pulldown (Wide Grip)', 'lat_pulldown'],
      ['Seated Cable Row (Neutral Grip)', 'cable_row'],
      ['Cable Crossover (High to Low)', 'cable_fly'],
      ['Cable Woodchop (High to Low)', 'cable_twist'],
      ['Kneeling Cable Crunch', 'cable_crunch'],
      ['Cable Chest Press (Standing)', null],
      ['Cable Hip Abduction (Ankle Strap)', null],
      ['Pallof Press', null],
      // Machines
      ['Plate-Loaded Chest Press', 'machine_chest_press'],
      ['Plate-Loaded Chest-Supported Row', 'machine_row'],
      ['Plate-Loaded Leg Press (Horizontal)', 'leg_press'],
      ['Plate-Loaded Hip Thrust', 'hip_thrust'],
      ['Plate-Loaded Dip', null],
      ['Machine Triceps Dip', null],
      ['Assisted Pull-Up (Machine)', null],
      ['Smith Machine Bench Press', 'bench'],
      ['Smith Machine Squat', 'squat'],
      // Barbell and Olympic
      ['Barbell Back Squat (Low Bar)', 'squat'],
      ['Barbell Zercher Squat', null],
      ['Overhead Squat', null],
      ['Barbell Bulgarian Split Squat', 'split_squat'],
      ['Barbell Sumo Deadlift', 'deadlift'],
      ['Trap Bar Deadlift', 'trap_bar_deadlift'],
      ['Trap Bar Carry', null],
      ['Barbell Push Press', 'overhead_press'],
      ['Dumbbell Push Press', null],
      ['Barbell Pendlay Row', 'barbell_row'],
      ['EZ-Bar Curl', 'barbell_curl'],
      ['EZ-Bar Skull Crusher', 'skull_crusher'],
      ['Dumbbell Lying Triceps Extension', 'db_triceps_extension'],
      ['Power Clean', 'power_clean'],
      ['Hang Power Clean', 'power_clean'],
      ['Clean and Jerk', 'clean_jerk'],
      ['Clean Pull', null],
      ['Power Snatch', 'snatch'],
      ['Snatch Pull', null],
      ['Snatch Balance', null],
      ['Dumbbell Upright Row', null],
      ['Renegade Row', null],
      // Bodyweight
      ['Weighted Pull-Up', 'pull_up'],
      ['Weighted Chin-Up', 'chin_up'],
      ['Weighted Dip', 'dip'],
      ['Decline Push-Up', 'push_up'],
      ['Incline Push-Up', null],
      ['Pike Push-Up', null],
      ['Bodyweight Squat', 'bw_squat'],
      ['Skater Squat', null],
      ['Nordic Hamstring Curl', null],
      ['Glute Bridge', null],
      ['Bench Dip', 'bench_dip'],
      ['Inverted Row', 'inverted_row'],
      ['Hanging Knee Raise', 'leg_raise'],
    ]
    for (const [name, key] of expected) expect([name, standardOf(name)]).toEqual([name, key])
  })

  it('never judges a one-armed or one-legged lift against a two-handed standard', () => {
    for (const e of EXTRA_CATALOG.filter(isLift)) {
      const standard = findStandard(e)
      if (!standard) continue
      const oneSided = /\b(single|one)[- ](arm|leg)\b/i.test(e.name)
      if (!oneSided) continue
      const dumbbellArm = ['dumbbell', 'kettlebell'].includes(e.equipment) && standard.kind === 'load' && standard.perHand
      expect(standard.oneSided === true || dumbbellArm, `${e.name} -> ${standard.key}`).toBe(true)
    }
  })

  it('finds a standard for most of the lifts, so ranks fill in as you train', () => {
    const lifts = EXTRA_CATALOG.filter(isLift)
    const ranked = lifts.filter((e) => findStandard(e))
    expect(ranked.length / lifts.length).toBeGreaterThan(0.6)
  })
})

describe('cardio badges for the new activities', () => {
  it('files each one under the right badge', () => {
    const expected: [string, string][] = [
      ['Incline Treadmill Walk (12-3-30)', 'walking'],
      ['Treadmill Intervals', 'conditioning'],
      ['Zone 2 Treadmill Jog', 'running'],
      ['Indoor Track Run', 'running'],
      ['Indoor Track Walk', 'walking'],
      ['Track Intervals (400 m)', 'conditioning'],
      ['5K Race', 'running'],
      ['Half Marathon', 'running'],
      ['Stadium Stairs', 'machines'],
      ['Arc Trainer (AMT)', 'machines'],
      ['Stepmill (Rotating Staircase)', 'machines'],
      ['Elliptical Intervals', 'machines'],
      ['Upright Bike', 'indoor_cycling'],
      ['Recumbent Bike', 'indoor_cycling'],
      ['Indoor Zone 2 Bike', 'indoor_cycling'],
      ['Air Bike Intervals', 'indoor_cycling'],
      ['Road Ride', 'cycling'],
      ['Bike Commute', 'cycling'],
      ['Rower Intervals', 'rowing'],
      ['Ski Erg Intervals', 'ski_erg'],
      ['Battle Rope Alternating Waves', 'conditioning'],
      ['Ruck (Weighted Pack)', 'walking'],
      ['Lap Swim (Freestyle Intervals)', 'freestyle'],
      ['Aqua Jogging', 'swimming'],
      ['Heavy Bag Rounds', 'combat'],
      ['Bouldering', 'sports'],
      ['Group Fitness Class', 'conditioning'],
      ['Couch Stretch', 'stretching'],
    ]
    for (const [name, key] of expected) expect([name, badgeOf(name)]).toEqual([name, key])
  })

  it('always names a badge that exists', () => {
    const keys = new Set(ACTIVITY_BADGES.map((b) => b.key))
    for (const e of EXTRA_CATALOG) {
      const key = activityBadgeKey(e)
      if (key !== null) expect(keys.has(key), `${e.name} -> ${key}`).toBe(true)
    }
  })
})
