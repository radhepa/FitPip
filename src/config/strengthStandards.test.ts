import { describe, expect, it } from 'vitest'
import type { Equipment } from '../types/db'
import { STRENGTH_STANDARDS, findStandard } from './strengthStandards'

const lift = (name: string, equipment: Equipment) => findStandard({ name, equipment, category: 'strength', tracking: 'reps' })?.key ?? null

describe('findStandard', () => {
  it('matches every starter lift to a sensible standard', () => {
    const expected: [string, Equipment, string][] = [
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
      ['Lever Back Extension', 'machine', 'back_extension'],
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
      ['Dumbbell Step-Up', 'dumbbell', 'db_step_up'],
      ['Lever Leg Extension', 'machine', 'leg_extension'],
      ['Barbell Romanian Deadlift', 'barbell', 'rdl'],
      ['Barbell Good Morning', 'barbell', 'good_morning'],
      ['Lever Lying Leg Curl', 'machine', 'leg_curl'],
      ['Lever Seated Leg Curl', 'machine', 'seated_leg_curl'],
      ['Barbell Glute Bridge', 'barbell', 'hip_thrust'],
      ['Kettlebell Swing', 'kettlebell', 'kettlebell_swing'],
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
    expect(lift('Smith Machine Squat', 'smith_machine')).toBe('squat')
    expect(lift('Weighted Pull-ups', 'bodyweight')).toBe('pull_up')
    expect(lift('Hip Thrust', 'machine')).toBe('hip_thrust')
    expect(lift('Trap Bar Deadlift', 'barbell')).toBe('trap_bar_deadlift')
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
      const rows = s.kind === 'reps' ? [s.men, s.women] : [s.men, ...(s.women ? [s.women] : [])]
      for (const row of rows) for (let i = 1; i < row.length; i += 1) expect(row[i], s.key).toBeGreaterThan(row[i - 1])
    }
  })
})
