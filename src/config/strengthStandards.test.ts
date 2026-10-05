import { describe, expect, it } from 'vitest'
import type { Equipment } from '../types/db'
import { STRENGTH_STANDARDS, findStandard } from './strengthStandards'

const lift = (name: string, equipment: Equipment) => findStandard({ name, equipment, category: 'strength', tracking: 'reps' })?.key ?? null

describe('findStandard', () => {
  it('matches every starter lift to a sensible standard', () => {
    const expected: [string, Equipment, string | null][] = [
      ['Barbell Bench Press', 'barbell', 'bench'],
      ['Barbell Incline Bench Press', 'barbell', 'incline_bench'],
      ['Dumbbell Bench Press', 'dumbbell', 'db_bench'],
      ['Dumbbell Incline Bench Press', 'dumbbell', 'db_incline_bench'],
      ['Lever Chest Press', 'machine', 'machine_chest_press'],
      ['Cable Low Fly', 'cable', 'cable_fly'],
      ['Dumbbell Fly', 'dumbbell', 'db_fly'],
      ['Lever Seated Fly', 'machine', 'machine_fly'],
      ['Push-Up', 'bodyweight', 'push_up'],
      ['Chest Dip', 'bodyweight', 'dip'],
      ['Barbell Deadlift', 'barbell', 'deadlift'],
      ['Barbell Bent Over Row', 'barbell', 'barbell_row'],
      ['Dumbbell Bent Over Row', 'dumbbell', 'db_row'],
      ['Pull-Up', 'bodyweight', 'pull_up'],
      ['Chin-Up', 'bodyweight', 'chin_up'],
      ['Cable Pulldown (Pro Lat Bar)', 'cable', 'lat_pulldown'],
      ['Cable Seated Row', 'cable', 'cable_row'],
      ['Lever T Bar Row', 'machine', 't_bar_row'],
      ['Lever Seated Row', 'machine', 'machine_row'],
      ['Cable Straight Arm Pulldown', 'cable', 'straight_arm_pulldown'],
      ['Barbell Shrug', 'barbell', 'shrug'],
      ['Dumbbell Shrug', 'dumbbell', 'db_shrug'],
      ['Lever Back Extension', 'machine', null],
      ['Barbell Seated Overhead Press', 'barbell', 'overhead_press'],
      ['Dumbbell Seated Shoulder Press', 'dumbbell', 'db_shoulder_press'],
      ['Lever Shoulder Press', 'machine', 'machine_shoulder_press'],
      ['Dumbbell Arnold Press', 'dumbbell', 'db_arnold'],
      ['Dumbbell Lateral Raise', 'dumbbell', 'lateral_raise'],
      ['Cable Lateral Raise', 'cable', 'cable_lateral_raise'],
      ['Dumbbell Front Raise', 'dumbbell', 'db_front_raise'],
      ['Dumbbell Rear Fly', 'dumbbell', 'rear_fly'],
      ['Lever Seated Reverse Fly', 'machine', 'machine_rear_fly'],
      ['Barbell Upright Row', 'barbell', 'upright_row'],
      ['Barbell Curl', 'barbell', 'barbell_curl'],
      ['Dumbbell Biceps Curl', 'dumbbell', 'db_curl'],
      ['Dumbbell Hammer Curl', 'dumbbell', 'hammer_curl'],
      ['Dumbbell Incline Curl', 'dumbbell', 'incline_curl'],
      ['Lever Preacher Curl', 'machine', 'machine_preacher_curl'],
      ['Cable Curl', 'cable', 'cable_curl'],
      ['Cable Triceps Pushdown (V-Bar)', 'cable', 'pushdown'],
      ['Cable Overhead Triceps Extension (Rope Attachment)', 'cable', 'triceps_extension'],
      ['Barbell Lying Triceps Extension Skull Crusher', 'barbell', 'skull_crusher'],
      ['Barbell Close-Grip Bench Press', 'barbell', 'close_grip_bench'],
      ['Triceps Dip', 'bodyweight', 'dip'],
      ['Barbell Wrist Curl', 'barbell', 'wrist_curl'],
      ['Barbell Reverse Curl', 'barbell', 'reverse_curl'],
      ['Barbell Full Squat', 'barbell', 'squat'],
      ['Barbell Front Squat', 'barbell', 'front_squat'],
      ['Dumbbell Goblet Squat', 'dumbbell', 'goblet_squat'],
      ['Sled 45° Leg Press (Side Pov)', 'machine', 'leg_press'],
      ['Sled Hack Squat', 'machine', 'hack_squat'],
      ['Dumbbell Single Leg Split Squat', 'dumbbell', 'db_split_squat'],
      ['Walking Lunge', 'bodyweight', 'lunge_bw'],
      ['Dumbbell Step-Up', 'dumbbell', null],
      ['Lever Leg Extension', 'machine', 'leg_extension'],
      ['Barbell Romanian Deadlift', 'barbell', 'rdl'],
      ['Barbell Good Morning', 'barbell', 'good_morning'],
      ['Lever Lying Leg Curl', 'machine', 'leg_curl'],
      ['Lever Seated Leg Curl', 'machine', 'seated_leg_curl'],
      ['Barbell Glute Bridge', 'barbell', null],
      ['Kettlebell Swing', 'kettlebell', null],
      ['Lever Seated Hip Adduction', 'machine', 'hip_adduction'],
      ['Lever Seated Hip Abduction', 'machine', 'hip_abduction'],
      ['Barbell Standing Calf Raise', 'barbell', 'calf_raise'],
      ['Lever Seated Calf Raise', 'machine', 'seated_calf_raise'],
      ['Hanging Leg Raise', 'bodyweight', 'leg_raise'],
      ['Cable Seated Crunch', 'cable', 'cable_crunch'],
      ['Crunch Floor', 'bodyweight', 'crunch'],
      ['Wheel Rollerout', 'other', 'ab_rollout'],
      ['Russian Twist', 'bodyweight', 'russian_twist'],
      ['Cable Twist', 'cable', 'cable_twist'],
    ]
    for (const [name, equipment, key] of expected) expect([name, lift(name, equipment)]).toEqual([name, key])
  })

  it('handles common custom names', () => {
    expect(lift('Bench Press', 'barbell')).toBe('bench')
    expect(lift('Back Squat', 'barbell')).toBe('squat')
    expect(lift('Smith Machine Squat', 'smith_machine')).toBe('smith_squat')
    expect(lift('Weighted Pull-ups', 'bodyweight')).toBe('pull_up')
    expect(lift('Hip Thrust', 'machine')).toBeNull()
    expect(lift('Trap Bar Deadlift', 'barbell')).toBe('trap_bar_deadlift')
  })

  it('ranks single-arm cable lifts only against single-arm standards', () => {
    expect(lift('Single-Arm Cable Row', 'cable')).toBeNull()
    expect(lift('One Arm Cable Lat Pulldown', 'cable')).toBeNull()
    expect(lift('Single Arm Cable Chest Press', 'cable')).toBeNull()
    expect(lift('Single Arm Cable Fly', 'cable')).toBe('sa_cable_fly')
    expect(lift('Single-Arm Cable Lateral Raise', 'cable')).toBe('cable_lateral_raise')
    // No fair standard for these, so no rank (never the two-handed one).
    expect(lift('Single-Arm Cable Upright Row', 'cable')).toBeNull()
    expect(lift('Single-Arm Machine Row', 'machine')).toBeNull()
    expect(lift('Single-Leg Leg Press', 'machine')).toBeNull()
    expect(lift('Single-Leg Dumbbell Romanian Deadlift', 'dumbbell')).toBeNull()
    // A dumbbell standard is per dumbbell, so it fits a one-arm dumbbell lift; split squats are one-legged by design.
    expect(lift('One-Arm Dumbbell Row', 'dumbbell')).toBe('db_row')
    expect(lift('Dumbbell Single Leg Split Squat', 'dumbbell')).toBe('db_split_squat')
  })

  it('does not compare cable, dumbbell or machine lifts with a barbell standard', () => {
    expect(lift('Cable Chest Press', 'cable')).toBeNull()
    expect(lift('Dumbbell Push Press', 'dumbbell')).toBeNull()
    expect(lift('Cable Hip Abduction', 'cable')).toBeNull()
    expect(lift('Machine Dip', 'machine')).toBeNull()
    expect(lift('Incline Push-Up', 'bodyweight')).toBeNull()
    expect(lift('Cable Straight Bar Pushdown', 'cable')).toBe('pushdown')
    expect(lift('Clean Pull', 'barbell')).toBeNull()
    expect(lift('Clean and Jerk', 'barbell')).toBe('clean_jerk')
    expect(lift('Trap Bar Carry', 'barbell')).toBeNull()
  })

  it('uses cable-fly loads per stack, without invented single-arm multipliers', () => {
    const oneArm = STRENGTH_STANDARDS.find((s) => s.key === 'sa_cable_fly')!
    const fly = STRENGTH_STANDARDS.find((s) => s.key === 'cable_fly')!
    expect(oneArm.reference).toEqual(fly.reference)
    if (oneArm.kind === 'load') expect(oneArm.perArm).toBe(true)
    expect(lift('Single Arm Cable Curl', 'cable')).toBeNull()
  })

  it('does not silently give materially different movement variants a generic rank', () => {
    const unsupported: [string, Equipment][] = [
      ['Dumbbell Decline Bench Press', 'dumbbell'],
      ['Plate-Loaded Incline Chest Press', 'machine'],
      ['Barbell Stiff-Leg Deadlift', 'barbell'],
      ['EZ-Bar Preacher Curl', 'barbell'],
      ['Dumbbell Concentration Curl', 'dumbbell'],
      ['Dumbbell Reverse Wrist Curl', 'dumbbell'],
      ['Barbell Reverse Wrist Curl', 'barbell'],
      ['Chest-Supported Dumbbell Row', 'dumbbell'],
      ['Barbell Pendlay Row', 'barbell'],
      ['Hang Power Clean', 'barbell'],
      ['Squat Clean', 'barbell'],
      ['Power Snatch', 'barbell'],
      ['Decline Sit-Up', 'bodyweight'],
      // The source demonstrates one arm; this catalog movement holds one dumbbell with two hands.
      ['Dumbbell Overhead Triceps Extension', 'dumbbell'],
      ['Dumbbell Lying Triceps Extension', 'dumbbell'],
    ]
    for (const [name, equipment] of unsupported) expect(lift(name, equipment), name).toBeNull()
    expect(lift('Single-Arm Dumbbell Overhead Triceps Extension', 'dumbbell')).toBe('db_triceps_extension')
    expect(lift('Squat Snatch', 'barbell')).toBe('snatch')
    expect(lift('Barbell Hip Thrust', 'barbell')).toBe('hip_thrust')
  })

  it('leaves out what it cannot compare fairly', () => {
    expect(lift('Assisted Pull-Up', 'machine')).toBeNull()
    expect(lift('Band Pull Apart', 'band')).toBeNull()
    expect(lift('Mystery Machine', 'machine')).toBeNull()
    expect(findStandard({ name: 'Burpees', equipment: 'bodyweight', category: 'cardio', tracking: 'reps' })).toBeNull()
    expect(findStandard({ name: 'Plank', equipment: 'bodyweight', category: 'strength', tracking: 'time' })).toBeNull()
  })

  it('keeps every standard well formed', () => {
    const keys = new Set<string>()
    for (const s of STRENGTH_STANDARDS) {
      expect(keys.has(s.key), s.key).toBe(false)
      keys.add(s.key)
      expect(s.reference, s.key).toBeDefined()
      expect(s.reference.kind, s.key).toBe(s.kind)
      for (const sex of ['male', 'female'] as const) {
        expect(s.reference[sex].length, s.key).toBeGreaterThan(1)
        for (const [j, row] of s.reference[sex].entries()) {
          expect(row.every(Number.isFinite), s.key).toBe(true)
          if (j > 0) expect(row[0], s.key).toBeGreaterThan(s.reference[sex][j - 1][0])
          for (let i = 2; i < row.length; i += 1) expect(row[i], s.key).toBeGreaterThanOrEqual(row[i - 1])
        }
      }
    }
  })
})
