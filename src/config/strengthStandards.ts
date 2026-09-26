// Strength standards: how strong people who lift are, lift by lift, so a best set can be turned
// into a percentile ("stronger than 64% of lifters your size") and a rank.
//
// These are approximations compiled from commonly published bodyweight-multiple tables for
// people who train, not a scientific dataset. Tune any number here; nothing else needs to change.
//
// - Load standards: one-rep max divided by bodyweight at the 5th, 20th, 50th, 80th and 95th
//   percentile, for a man of REFERENCE_KG.male. Lighter lifters are expected to lift a bit more
//   per kilo and heavier ones a bit less (see BODYWEIGHT_EXPONENT in lib/strengthRank.ts).
//   Dumbbell standards are per dumbbell (the weight people type); goblet squats and kettlebell
//   swings are one weight.
// - Reps standards (pull-ups, push-ups, crunches...): reps at bodyweight at the same five
//   percentiles. Added weight counts through `share`, the part of your bodyweight the move lifts.
// - Women's numbers default to the men's times WOMEN_FACTOR for the lift's family, at
//   REFERENCE_KG.female. Reps standards list women's reps explicitly.
//
// The first standard whose `match` fits an exercise's name (and equipment, when given) is used,
// so specific entries come before general ones. Only strength exercises logged as weight x reps
// are ranked this way.
import type { Equipment, Muscle } from '../types/db'

export type Sex = 'male' | 'female'

/** Values at the 5th, 20th, 50th, 80th and 95th percentile. */
export type Anchors = readonly [number, number, number, number, number]
export const ANCHOR_PERCENTILES: Anchors = [5, 20, 50, 80, 95]

export const REFERENCE_KG: Record<Sex, number> = { male: 80, female: 64 }

export type Family = 'press' | 'pull' | 'arms' | 'raise' | 'legs' | 'hinge' | 'glutes' | 'calves' | 'traps' | 'grip' | 'core' | 'olympic'

export const WOMEN_FACTOR: Record<Family, number> = {
  press: 0.6,
  pull: 0.64,
  arms: 0.6,
  raise: 0.62,
  legs: 0.76,
  hinge: 0.76,
  glutes: 0.85,
  calves: 0.8,
  traps: 0.66,
  grip: 0.62,
  core: 0.8,
  olympic: 0.72,
}

interface Base {
  key: string
  /** What the lift is compared with, shown to the user ("Bench press"). */
  label: string
  family: Family
  /** Muscles this lift ranks, on top of the exercise's own primary muscles. */
  muscles: Muscle[]
  match: RegExp
  not?: RegExp
  equipment?: readonly Equipment[]
}

export interface LoadStandard extends Base {
  kind: 'load'
  men: Anchors
  women?: Anchors
  /** The typed weight is one dumbbell of a pair. */
  perHand?: boolean
}

export interface RepsStandard extends Base {
  kind: 'reps'
  /** Share of bodyweight the move lifts (pull-up about 1, push-up about 0.64). */
  share: number
  men: Anchors
  women: Anchors
}

export type StrengthStandard = LoadStandard | RepsStandard

const BAR: readonly Equipment[] = ['barbell', 'smith_machine', 'other']
const DB: readonly Equipment[] = ['dumbbell', 'kettlebell']
const MACHINE: readonly Equipment[] = ['machine']
const CABLE: readonly Equipment[] = ['cable']
const BW: readonly Equipment[] = ['bodyweight']

type Opts = Partial<Pick<LoadStandard, 'not' | 'equipment' | 'perHand' | 'women'>>

const load = (key: string, label: string, family: Family, muscles: Muscle[], match: RegExp, men: Anchors, opts: Opts = {}): LoadStandard => ({
  kind: 'load',
  key,
  label,
  family,
  muscles,
  match,
  men,
  ...opts,
})

const perHand = (key: string, label: string, family: Family, muscles: Muscle[], match: RegExp, men: Anchors, opts: Opts = {}): LoadStandard =>
  load(key, label, family, muscles, match, men, { equipment: DB, perHand: true, ...opts })

const reps = (
  key: string,
  label: string,
  family: Family,
  muscles: Muscle[],
  match: RegExp,
  share: number,
  men: Anchors,
  women: Anchors,
  opts: Pick<Base, 'not' | 'equipment'> = {},
): RepsStandard => ({ kind: 'reps', key, label, family, muscles, match, share, men, women, ...opts })

export const STRENGTH_STANDARDS: readonly StrengthStandard[] = [
  // Chest ------------------------------------------------------------------------------------
  load('close_grip_bench', 'Close-grip bench press', 'press', ['triceps', 'chest'], /close grip (bench|press)/, [0.45, 0.68, 0.92, 1.22, 1.52]),
  perHand('db_incline_bench', 'Dumbbell incline press', 'press', ['chest', 'front_delts'], /incline.*(bench|press)/, [0.18, 0.27, 0.38, 0.5, 0.63]),
  perHand('db_bench', 'Dumbbell bench press', 'press', ['chest'], /(bench|chest|floor) press/, [0.2, 0.3, 0.42, 0.56, 0.7]),
  load('machine_chest_press', 'Machine chest press', 'press', ['chest'], /(chest press|bench press)/, [0.4, 0.62, 0.88, 1.18, 1.5], { equipment: MACHINE }),
  load('incline_bench', 'Incline bench press', 'press', ['chest', 'front_delts'], /incline.*(bench|press)/, [0.45, 0.68, 0.9, 1.2, 1.5]),
  load('decline_bench', 'Decline bench press', 'press', ['chest'], /decline.*(bench|press)/, [0.58, 0.85, 1.1, 1.45, 1.8]),
  load('bench', 'Bench press', 'press', ['chest'], /bench press|floor press|chest press/, [0.55, 0.8, 1.05, 1.4, 1.75]),
  load('face_pull', 'Face pull', 'raise', ['rear_delts'], /face pull/, [0.15, 0.25, 0.38, 0.52, 0.66]),
  load('machine_rear_fly', 'Machine reverse fly', 'raise', ['rear_delts'], /(reverse|rear).*fly|rear delt/, [0.15, 0.27, 0.42, 0.6, 0.78], { equipment: MACHINE }),
  load('rear_fly', 'Rear delt fly', 'raise', ['rear_delts'], /(reverse|rear).*fly|rear delt/, [0.04, 0.07, 0.11, 0.15, 0.2], { perHand: true }),
  load('machine_fly', 'Machine chest fly', 'press', ['chest'], /fly|pec deck/, [0.25, 0.42, 0.63, 0.88, 1.13], { equipment: MACHINE }),
  load('cable_fly', 'Cable fly', 'press', ['chest'], /fly|crossover/, [0.08, 0.13, 0.2, 0.28, 0.36], { equipment: CABLE }),
  perHand('db_fly', 'Dumbbell fly', 'press', ['chest'], /fly/, [0.08, 0.13, 0.19, 0.26, 0.34]),
  reps('bench_dip', 'Bench dip', 'press', ['triceps'], /bench dip/, 0.7, [5, 12, 20, 30, 40], [3, 8, 14, 22, 30]),
  reps('dip', 'Dip', 'press', ['triceps', 'chest'], /\bdips?\b/, 1, [2, 6, 13, 21, 29], [0, 2, 5, 10, 16], { not: /assisted/ }),
  reps('push_up', 'Push-up', 'press', ['chest', 'triceps'], /push ?ups?\b|press ?ups?\b/, 0.64, [3, 12, 25, 40, 55], [1, 5, 14, 26, 38]),

  // Hinges -----------------------------------------------------------------------------------
  perHand('db_rdl', 'Dumbbell Romanian deadlift', 'hinge', ['hamstrings', 'glutes'], /romanian|rdl|stiff leg/, [0.25, 0.38, 0.52, 0.7, 0.88]),
  load('rdl', 'Romanian deadlift', 'hinge', ['hamstrings', 'glutes'], /romanian|rdl|stiff leg/, [0.7, 1, 1.35, 1.75, 2.15]),
  load('trap_bar_deadlift', 'Trap bar deadlift', 'hinge', ['glutes', 'quads', 'hamstrings'], /(trap|hex) bar/, [1, 1.4, 1.85, 2.35, 2.85]),
  perHand('db_deadlift', 'Dumbbell deadlift', 'hinge', ['glutes', 'hamstrings'], /deadlift/, [0.3, 0.45, 0.62, 0.82, 1.02]),
  load('deadlift', 'Deadlift', 'hinge', ['glutes', 'hamstrings', 'lower_back'], /deadlift/, [0.95, 1.35, 1.8, 2.3, 2.8]),
  load('good_morning', 'Good morning', 'hinge', ['hamstrings', 'lower_back'], /good morning/, [0.35, 0.55, 0.8, 1.05, 1.35]),
  load('hip_thrust', 'Hip thrust', 'glutes', ['glutes'], /hip thrust|glute bridge/, [0.7, 1.1, 1.6, 2.2, 2.8], { not: /single leg/ }),
  reps('back_extension_bw', 'Back extension', 'hinge', ['lower_back'], /back extension|hyperextension/, 0.5, [5, 12, 20, 30, 40], [4, 10, 17, 26, 35], { equipment: BW }),
  load('back_extension', 'Back extension', 'hinge', ['lower_back'], /back extension|hyperextension/, [0.4, 0.65, 0.95, 1.3, 1.65]),
  load('kettlebell_swing', 'Kettlebell swing', 'hinge', ['glutes', 'hamstrings'], /swing/, [0.15, 0.25, 0.38, 0.52, 0.67], { equipment: DB }),
  load('power_clean', 'Power clean', 'olympic', ['glutes', 'quads', 'traps'], /\bclean\b/, [0.45, 0.65, 0.9, 1.2, 1.45], { equipment: BAR }),
  load('snatch', 'Snatch', 'olympic', ['glutes', 'quads', 'traps'], /snatch/, [0.35, 0.52, 0.72, 0.95, 1.18], { equipment: BAR }),

  // Legs -------------------------------------------------------------------------------------
  load('front_squat', 'Front squat', 'legs', ['quads', 'glutes'], /front squat/, [0.6, 0.9, 1.2, 1.55, 1.95], { equipment: BAR }),
  load('goblet_squat', 'Goblet squat', 'legs', ['quads', 'glutes'], /goblet/, [0.2, 0.33, 0.48, 0.65, 0.82]),
  load('hack_squat', 'Hack squat', 'legs', ['quads', 'glutes'], /hack squat/, [0.8, 1.25, 1.75, 2.35, 3]),
  load('leg_press', 'Leg press', 'legs', ['quads', 'glutes'], /leg press/, [1.4, 2.1, 2.9, 3.9, 4.9]),
  reps('split_squat_bw', 'Split squat', 'legs', ['quads', 'glutes'], /split squat|bulgarian/, 0.8, [5, 10, 16, 24, 32], [4, 8, 13, 20, 27], { equipment: BW }),
  perHand('db_split_squat', 'Dumbbell split squat', 'legs', ['quads', 'glutes'], /split squat|bulgarian/, [0.1, 0.18, 0.28, 0.4, 0.52]),
  load('split_squat', 'Split squat', 'legs', ['quads', 'glutes'], /split squat|bulgarian/, [0.35, 0.55, 0.78, 1.05, 1.32]),
  reps('lunge_bw', 'Lunge', 'legs', ['quads', 'glutes'], /lunge/, 0.8, [8, 14, 22, 32, 42], [6, 12, 19, 28, 37], { equipment: BW }),
  perHand('db_lunge', 'Dumbbell lunge', 'legs', ['quads', 'glutes'], /lunge/, [0.1, 0.18, 0.28, 0.4, 0.52]),
  load('lunge', 'Lunge', 'legs', ['quads', 'glutes'], /lunge/, [0.35, 0.55, 0.78, 1.05, 1.32]),
  reps('step_up_bw', 'Step-up', 'legs', ['quads', 'glutes'], /step ?up/, 0.8, [8, 14, 22, 32, 42], [6, 12, 19, 28, 37], { equipment: BW }),
  perHand('db_step_up', 'Dumbbell step-up', 'legs', ['quads', 'glutes'], /step ?up/, [0.08, 0.15, 0.24, 0.34, 0.45]),
  load('step_up', 'Step-up', 'legs', ['quads', 'glutes'], /step ?up/, [0.3, 0.48, 0.68, 0.92, 1.15]),
  reps('bw_squat', 'Bodyweight squat', 'legs', ['quads', 'glutes'], /squat/, 0.7, [15, 25, 40, 55, 70], [12, 22, 35, 48, 62], { equipment: BW, not: /pistol|jump/ }),
  perHand('db_squat', 'Dumbbell squat', 'legs', ['quads', 'glutes'], /squat/, [0.15, 0.25, 0.37, 0.5, 0.64]),
  load('squat', 'Back squat', 'legs', ['quads', 'glutes'], /squat/, [0.75, 1.1, 1.45, 1.9, 2.35], { not: /pistol|jump|sissy/ }),
  load('leg_extension', 'Leg extension', 'legs', ['quads'], /leg extension/, [0.35, 0.58, 0.85, 1.15, 1.48]),
  load('seated_leg_curl', 'Seated leg curl', 'legs', ['hamstrings'], /seated.*leg curl/, [0.3, 0.48, 0.7, 0.95, 1.22]),
  load('leg_curl', 'Leg curl', 'legs', ['hamstrings'], /leg curl|hamstring curl/, [0.25, 0.42, 0.62, 0.85, 1.1]),
  load('hip_adduction', 'Hip adduction', 'glutes', ['adductors'], /adduction|adductor/, [0.35, 0.6, 0.9, 1.25, 1.6]),
  load('hip_abduction', 'Hip abduction', 'glutes', ['abductors'], /abduction|abductor/, [0.35, 0.6, 0.9, 1.25, 1.6]),
  load('seated_calf_raise', 'Seated calf raise', 'calves', ['calves'], /seated.*calf/, [0.3, 0.55, 0.85, 1.2, 1.55]),
  reps('calf_raise_bw', 'Calf raise', 'calves', ['calves'], /calf raise/, 1, [10, 20, 30, 45, 60], [8, 17, 26, 39, 52], { equipment: BW }),
  perHand('db_calf_raise', 'Dumbbell calf raise', 'calves', ['calves'], /calf raise/, [0.15, 0.28, 0.42, 0.58, 0.75]),
  load('calf_raise', 'Standing calf raise', 'calves', ['calves'], /calf raise/, [0.55, 0.9, 1.3, 1.8, 2.3]),

  // Shoulders --------------------------------------------------------------------------------
  perHand('db_arnold', 'Arnold press', 'press', ['front_delts', 'side_delts'], /arnold/, [0.11, 0.18, 0.26, 0.35, 0.45]),
  perHand('db_shoulder_press', 'Dumbbell shoulder press', 'press', ['front_delts', 'side_delts'], /(shoulder|overhead|military) press/, [0.13, 0.2, 0.29, 0.39, 0.5]),
  load('machine_shoulder_press', 'Machine shoulder press', 'press', ['front_delts', 'side_delts'], /(shoulder|overhead) press/, [0.28, 0.45, 0.65, 0.88, 1.12], { equipment: MACHINE }),
  load('overhead_press', 'Overhead press', 'press', ['front_delts', 'side_delts'], /(shoulder|overhead|military|push) press/, [0.35, 0.5, 0.68, 0.9, 1.12]),
  load('cable_lateral_raise', 'Cable lateral raise', 'raise', ['side_delts'], /lateral raise/, [0.03, 0.06, 0.09, 0.13, 0.17], { equipment: CABLE }),
  load('machine_lateral_raise', 'Machine lateral raise', 'raise', ['side_delts'], /lateral raise/, [0.1, 0.18, 0.27, 0.38, 0.49], { equipment: MACHINE }),
  perHand('lateral_raise', 'Lateral raise', 'raise', ['side_delts'], /lateral raise|side raise/, [0.05, 0.08, 0.12, 0.17, 0.22]),
  perHand('db_front_raise', 'Front raise', 'raise', ['front_delts'], /front raise/, [0.05, 0.08, 0.13, 0.18, 0.23]),
  load('front_raise', 'Front raise', 'raise', ['front_delts'], /front raise/, [0.12, 0.18, 0.26, 0.35, 0.44]),
  load('upright_row', 'Upright row', 'raise', ['side_delts', 'traps'], /upright row/, [0.25, 0.4, 0.57, 0.77, 0.97]),
  perHand('db_shrug', 'Dumbbell shrug', 'traps', ['traps'], /shrug/, [0.2, 0.32, 0.47, 0.65, 0.83]),
  load('shrug', 'Shrug', 'traps', ['traps'], /shrug/, [0.7, 1, 1.4, 1.85, 2.3]),

  // Back -------------------------------------------------------------------------------------
  load('straight_arm_pulldown', 'Straight-arm pulldown', 'pull', ['lats'], /straight arm|pullover/, [0.15, 0.25, 0.38, 0.52, 0.67], { equipment: [...CABLE, ...MACHINE] }),
  load('lat_pulldown', 'Lat pulldown', 'pull', ['lats'], /pull ?down|lat pull/, [0.45, 0.63, 0.85, 1.1, 1.38]),
  reps('chin_up', 'Chin-up', 'pull', ['lats', 'biceps'], /chin ?ups?\b/, 1, [1, 5, 10, 16, 22], [0, 1, 4, 8, 13], { not: /assisted/ }),
  reps('pull_up', 'Pull-up', 'pull', ['lats'], /pull ?ups?\b/, 1, [1, 4, 9, 15, 21], [0, 1, 3, 7, 12], { not: /assisted/ }),
  reps('inverted_row', 'Inverted row', 'pull', ['upper_back', 'lats'], /inverted row|body ?row/, 0.6, [4, 9, 15, 22, 30], [1, 5, 10, 16, 23]),
  perHand('db_row', 'Dumbbell row', 'pull', ['upper_back', 'lats'], /\brow\b/, [0.18, 0.3, 0.44, 0.6, 0.77]),
  load('t_bar_row', 'T-bar row', 'pull', ['upper_back', 'lats'], /t ?bar/, [0.4, 0.62, 0.88, 1.18, 1.5]),
  load('cable_row', 'Seated cable row', 'pull', ['upper_back', 'lats'], /\brow\b/, [0.45, 0.65, 0.88, 1.15, 1.45], { equipment: CABLE }),
  load('machine_row', 'Machine row', 'pull', ['upper_back', 'lats'], /\brow\b/, [0.4, 0.62, 0.88, 1.18, 1.5], { equipment: MACHINE }),
  load('barbell_row', 'Barbell row', 'pull', ['upper_back', 'lats'], /\brow\b/, [0.45, 0.65, 0.88, 1.15, 1.45], { equipment: BAR }),

  // Arms -------------------------------------------------------------------------------------
  perHand('db_wrist_curl', 'Dumbbell wrist curl', 'grip', ['forearms'], /wrist curl/, [0.06, 0.11, 0.17, 0.24, 0.31]),
  load('wrist_curl', 'Wrist curl', 'grip', ['forearms'], /wrist curl/, [0.2, 0.35, 0.52, 0.72, 0.92]),
  load('reverse_curl', 'Reverse curl', 'arms', ['biceps', 'forearms'], /reverse curl/, [0.18, 0.28, 0.4, 0.55, 0.7]),
  load('machine_preacher_curl', 'Machine preacher curl', 'arms', ['biceps'], /preacher|curl/, [0.15, 0.25, 0.38, 0.52, 0.67], { equipment: MACHINE }),
  perHand('hammer_curl', 'Hammer curl', 'arms', ['biceps', 'forearms'], /hammer/, [0.09, 0.15, 0.22, 0.3, 0.38]),
  perHand('incline_curl', 'Incline dumbbell curl', 'arms', ['biceps'], /incline.*curl/, [0.07, 0.11, 0.17, 0.24, 0.31]),
  perHand('db_curl', 'Dumbbell curl', 'arms', ['biceps'], /curl/, [0.08, 0.13, 0.2, 0.28, 0.36]),
  load('cable_curl', 'Cable curl', 'arms', ['biceps'], /curl/, [0.18, 0.3, 0.45, 0.62, 0.8], { equipment: CABLE }),
  load('barbell_curl', 'Barbell curl', 'arms', ['biceps'], /curl/, [0.22, 0.35, 0.5, 0.68, 0.85], { equipment: BAR }),
  load('pushdown', 'Triceps pushdown', 'arms', ['triceps'], /push ?down|press ?down/, [0.22, 0.36, 0.53, 0.72, 0.92]),
  load('skull_crusher', 'Skull crusher', 'arms', ['triceps'], /skull ?crusher|lying tricep/, [0.2, 0.32, 0.48, 0.65, 0.82]),
  perHand('triceps_kickback', 'Triceps kickback', 'arms', ['triceps'], /kickback/, [0.04, 0.07, 0.11, 0.15, 0.2]),
  perHand('db_triceps_extension', 'Dumbbell triceps extension', 'arms', ['triceps'], /tricep.*extension|overhead extension/, [0.07, 0.12, 0.19, 0.27, 0.35]),
  load('triceps_extension', 'Overhead triceps extension', 'arms', ['triceps'], /tricep.*extension|overhead extension/, [0.15, 0.26, 0.4, 0.56, 0.72]),

  // Core -------------------------------------------------------------------------------------
  load('cable_crunch', 'Cable crunch', 'core', ['abs'], /crunch/, [0.25, 0.42, 0.63, 0.88, 1.13], { equipment: [...CABLE, ...MACHINE] }),
  reps('crunch', 'Crunch', 'core', ['abs'], /crunch/, 0.3, [10, 20, 35, 55, 75], [8, 16, 28, 45, 62]),
  reps('sit_up', 'Sit-up', 'core', ['abs'], /sit ?up/, 0.35, [10, 20, 35, 50, 65], [8, 16, 28, 42, 55]),
  reps('leg_raise', 'Hanging leg raise', 'core', ['abs'], /leg raise|knee raise|toes to bar/, 0.35, [2, 6, 12, 18, 25], [1, 4, 8, 14, 20]),
  reps('ab_rollout', 'Ab wheel rollout', 'core', ['abs'], /roll ?out|rollerout|ab wheel/, 0.5, [1, 5, 10, 16, 22], [0, 2, 6, 11, 16]),
  reps('russian_twist', 'Russian twist', 'core', ['abs', 'obliques'], /russian twist/, 0.3, [10, 20, 35, 50, 70], [8, 16, 28, 42, 60]),
  load('cable_twist', 'Cable woodchop', 'core', ['obliques', 'abs'], /twist|wood ?chop/, [0.1, 0.18, 0.28, 0.4, 0.52], { equipment: CABLE }),
]

/** "Dumbbell Single-Leg Split Squat (Pro)" -> "dumbbell single leg split squat pro" */
export const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

/** The standard an exercise is compared with, or null when there is none (bands, odd machines...). */
export function findStandard(exercise: { name: string; equipment: Equipment; category: string; tracking: string }): StrengthStandard | null {
  if (exercise.category !== 'strength' || exercise.tracking !== 'reps') return null
  if (exercise.equipment === 'band') return null
  const name = normalizeName(exercise.name)
  for (const standard of STRENGTH_STANDARDS) {
    if (standard.equipment && !standard.equipment.includes(exercise.equipment)) continue
    if (standard.not?.test(name)) continue
    if (standard.match.test(name)) return standard
  }
  return null
}
