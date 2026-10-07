// Exercise-specific comparison standards for adult recreational lifters.
// Published men/women tables and sources live in strengthReferenceData.ts.
// No invented family multipliers or fractional copies of two-arm standards.
// The matching order matters: exact variants must precede general movements.
import type { Equipment, Muscle, Sex } from '../types/db'
import { STRENGTH_REFERENCES, type StrengthReference } from './strengthReferenceData'
export type { Sex }
export type Anchors = readonly [number, number, number, number, number]
export const ANCHOR_PERCENTILES: Anchors = [5, 20, 50, 80, 95]
export type Family = 'press' | 'pull' | 'arms' | 'raise' | 'legs' | 'hinge' | 'glutes' | 'calves' | 'traps' | 'grip' | 'core' | 'olympic'

interface Base {
  key: string
  label: string
  family: Family
  muscles: Muscle[]
  match: RegExp
  not?: RegExp
  equipment?: readonly Equipment[]
  oneSided?: boolean
  reference: StrengthReference
}
export interface LoadStandard extends Base {
  kind: 'load'
  perHand?: boolean
  perArm?: boolean
}
export interface RepsStandard extends Base {
  kind: 'reps'
  /** Only used for full-body weighted pull-ups/chin-ups/dips with published added-load tables. */
  share: number
}
export type StrengthStandard = LoadStandard | RepsStandard
const BAR: readonly Equipment[] = ['barbell', 'other']
const DB: readonly Equipment[] = ['dumbbell']
const MACHINE: readonly Equipment[] = ['machine']
const CABLE: readonly Equipment[] = ['cable']
const BW: readonly Equipment[] = ['bodyweight']
type Opts = Partial<Pick<LoadStandard, 'not' | 'equipment' | 'perHand' | 'perArm' | 'oneSided'>>

const load = (key: string, label: string, family: Family, muscles: Muscle[], match: RegExp, opts: Opts = {}): LoadStandard => ({
  kind: 'load', key, label, family, muscles, match, equipment: BAR, ...opts, reference: STRENGTH_REFERENCES[key],
})
const perHand = (key: string, label: string, family: Family, muscles: Muscle[], match: RegExp, opts: Opts = {}): LoadStandard =>
  load(key, label, family, muscles, match, { equipment: DB, perHand: true, ...opts })
const reps = (key: string, label: string, family: Family, muscles: Muscle[], match: RegExp, share: number, opts: Pick<Base, 'not' | 'equipment' | 'oneSided'> = {}): RepsStandard => ({
  kind: 'reps', key, label, family, muscles, match, share, equipment: BW, ...opts, reference: STRENGTH_REFERENCES[key],
})

export const STRENGTH_STANDARDS: readonly StrengthStandard[] = [
  // Exact movement/equipment variants precede their general matches.
  load('smith_bench', 'Smith machine bench press', 'press', ['chest'], /bench press|chest press/, { equipment: ['smith_machine'], not: /incline|decline|close grip|floor/ }),
  load('smith_squat', 'Smith machine squat', 'legs', ['quads', 'glutes'], /squat/, { equipment: ['smith_machine'], not: /front|split|bulgarian|pistol|box|partial|half/ }),
  load('push_press', 'Push press', 'press', ['front_delts', 'side_delts'], /push press/, { equipment: BAR }),
  load('horizontal_leg_press', 'Horizontal leg press', 'legs', ['quads', 'glutes'], /horizontal.*leg press|leg press.*horizontal/, { equipment: MACHINE }),
  perHand('db_floor_press', 'Dumbbell floor press', 'press', ['chest', 'triceps'], /floor press/),
  load('floor_press', 'Floor press', 'press', ['chest', 'triceps'], /floor press/, { equipment: BAR }),
  load('sumo_deadlift', 'Sumo deadlift', 'hinge', ['glutes', 'quads', 'adductors'], /sumo.*deadlift/, { equipment: BAR }),
  load('sa_cable_fly', 'Single-arm cable fly', 'press', ['chest'], /(single|one) arm.*(fly|crossover)/, { equipment: CABLE, perArm: true, oneSided: true, not: /rear|reverse/ }),
  load('sa_cable_rear_fly', 'Single-arm cable rear delt fly', 'raise', ['rear_delts'], /(single|one) arm.*(rear delt|reverse).*fly/, { equipment: CABLE, perArm: true, oneSided: true }),
  load('cable_rear_fly', 'Cable rear delt fly', 'raise', ['rear_delts'], /(rear|reverse).*fly/, { equipment: CABLE, perArm: true }),
  load('machine_calf_raise', 'Machine calf raise', 'calves', ['calves'], /calf raise/, { equipment: MACHINE, not: /seated/ }),
  // Chest ------------------------------------------------------------------------------------
  load('close_grip_bench', 'Close-grip bench press', 'press', ['triceps', 'chest'], /close grip (bench|press)/, { equipment: BAR }),
  perHand('db_incline_bench', 'Dumbbell incline press', 'press', ['chest', 'front_delts'], /incline.*(bench|press)/),
  perHand('db_bench', 'Dumbbell bench press', 'press', ['chest'], /(bench|chest) press/, { not: /decline|close grip/ }),
  load('machine_chest_press', 'Machine chest press', 'press', ['chest'], /(chest press|bench press)/, { equipment: MACHINE, not: /incline|decline/ }),
  load('incline_bench', 'Incline bench press', 'press', ['chest', 'front_delts'], /incline.*(bench|press)/, { equipment: BAR }),
  load('decline_bench', 'Decline bench press', 'press', ['chest'], /decline.*(bench|press)/, { equipment: BAR }),
  load('bench', 'Bench press', 'press', ['chest'], /bench press|chest press/, { equipment: BAR }),
  load('face_pull', 'Face pull', 'raise', ['rear_delts'], /face pull/, { equipment: CABLE }),
  load('machine_rear_fly', 'Machine reverse fly', 'raise', ['rear_delts'], /(reverse|rear).*fly|rear delt/, { equipment: MACHINE }),
  load('rear_fly', 'Rear delt fly', 'raise', ['rear_delts'], /(reverse|rear).*fly|rear delt/, { perHand: true, equipment: DB }),
  load('machine_fly', 'Machine chest fly', 'press', ['chest'], /fly|pec deck/, { equipment: MACHINE }),
  load('cable_fly', 'Cable fly', 'press', ['chest'], /fly|crossover/, { equipment: CABLE, perArm: true }),
  perHand('db_fly', 'Dumbbell fly', 'press', ['chest'], /fly/, { not: /incline|decline/ }),
  reps('bench_dip', 'Bench dip', 'press', ['triceps'], /bench dip/, 0.7, { equipment: BW }),
  reps('dip', 'Dip', 'press', ['triceps', 'chest'], /\bdips?\b/, 1, { not: /assisted|machine|plate loaded|seated|bench/ }),
  reps('push_up', 'Push-up', 'press', ['chest', 'triceps'], /push ?ups?\b|press ?ups?\b/, 0.72, { not: /incline|decline|pike|archer|knee|wall|diamond|clap|one arm|single arm|handstand/ }),

  // Hinges -----------------------------------------------------------------------------------
  perHand('db_rdl', 'Dumbbell Romanian deadlift', 'hinge', ['hamstrings', 'glutes'], /romanian|rdl/),
  load('rdl', 'Romanian deadlift', 'hinge', ['hamstrings', 'glutes'], /romanian|rdl/),
  load('trap_bar_deadlift', 'Trap bar deadlift', 'hinge', ['glutes', 'quads', 'hamstrings'], /(trap|hex) bar/, { not: /carry/ }),
  perHand('db_deadlift', 'Dumbbell deadlift', 'hinge', ['glutes', 'hamstrings'], /deadlift/, { not: /stiff leg|deficit|rack|block/ }),
  load('deadlift', 'Deadlift', 'hinge', ['glutes', 'hamstrings', 'lower_back'], /deadlift/, { not: /stiff leg|deficit|rack|block/ }),
  load('good_morning', 'Good morning', 'hinge', ['hamstrings', 'lower_back'], /good morning/),
  load('hip_thrust', 'Hip thrust', 'glutes', ['glutes'], /hip thrust/, { not: /single leg/, equipment: BAR }),
  reps('back_extension_bw', 'Back extension', 'hinge', ['lower_back'], /back extension|hyperextension/, 0.5, { equipment: BW }),
  load('clean_jerk', 'Clean and jerk', 'olympic', ['glutes', 'quads', 'front_delts'], /clean.*jerk/, { equipment: BAR }),
  load('power_clean', 'Power clean', 'olympic', ['glutes', 'quads', 'traps'], /\bpower clean\b/, { equipment: BAR, not: /hang|pull|jerk|deadlift/ }),
  load('snatch', 'Snatch', 'olympic', ['glutes', 'quads', 'traps'], /snatch/, { equipment: BAR, not: /power|hang|pull|balance|grip|deadlift/ }),

  // Legs -------------------------------------------------------------------------------------
  load('front_squat', 'Front squat', 'legs', ['quads', 'glutes'], /front squat/, { equipment: BAR }),
  load('goblet_squat', 'Goblet squat', 'legs', ['quads', 'glutes'], /goblet/, { equipment: ['dumbbell', 'kettlebell'] }),
  load('hack_squat', 'Hack squat', 'legs', ['quads', 'glutes'], /hack squat/, { equipment: MACHINE }),
  load('leg_press', 'Leg press', 'legs', ['quads', 'glutes'], /leg press/, { equipment: MACHINE }),
  perHand('db_split_squat', 'Dumbbell split squat', 'legs', ['quads', 'glutes'], /split squat|bulgarian/, { oneSided: true }),
  load('split_squat', 'Split squat', 'legs', ['quads', 'glutes'], /split squat|bulgarian/, { oneSided: true }),
  reps('lunge_bw', 'Lunge', 'legs', ['quads', 'glutes'], /lunge/, 0.8, { equipment: BW }),
  perHand('db_lunge', 'Dumbbell lunge', 'legs', ['quads', 'glutes'], /lunge/),
  load('lunge', 'Lunge', 'legs', ['quads', 'glutes'], /lunge/),
  reps('bw_squat', 'Bodyweight squat', 'legs', ['quads', 'glutes'], /squat/, 0.7, { equipment: BW, not: /pistol|jump|skater|split|bulgarian|sissy|box|partial|half/ }),
  perHand('db_squat', 'Dumbbell squat', 'legs', ['quads', 'glutes'], /squat/, { not: /front|overhead|pistol|jump|sissy|box|partial|half/ }),
  load('squat', 'Back squat', 'legs', ['quads', 'glutes'], /squat/, { not: /clean|snatch|pistol|jump|sissy|zercher|overhead|landmine|skater|box|partial|half/ }),
  load('leg_extension', 'Leg extension', 'legs', ['quads'], /leg extension/, { equipment: MACHINE }),
  load('seated_leg_curl', 'Seated leg curl', 'legs', ['hamstrings'], /seated.*leg curl/, { equipment: MACHINE }),
  load('leg_curl', 'Leg curl', 'legs', ['hamstrings'], /leg curl|hamstring curl/, { equipment: MACHINE }),
  load('hip_adduction', 'Hip adduction', 'glutes', ['adductors'], /adduction|adductor/, { equipment: MACHINE }),
  load('hip_abduction', 'Hip abduction', 'glutes', ['abductors'], /abduction|abductor/, { equipment: MACHINE }),
  load('seated_calf_raise', 'Seated calf raise', 'calves', ['calves'], /seated.*calf/, { equipment: MACHINE }),
  reps('calf_raise_bw', 'Calf raise', 'calves', ['calves'], /calf raise/, 1, { equipment: BW }),
  perHand('db_calf_raise', 'Dumbbell calf raise', 'calves', ['calves'], /calf raise/),
  load('calf_raise', 'Standing calf raise', 'calves', ['calves'], /calf raise/),

  // Shoulders --------------------------------------------------------------------------------
  perHand('db_arnold', 'Arnold press', 'press', ['front_delts', 'side_delts'], /arnold/),
  perHand('db_shoulder_press', 'Dumbbell shoulder press', 'press', ['front_delts', 'side_delts'], /(shoulder|overhead|military) press/),
  load('machine_shoulder_press', 'Machine shoulder press', 'press', ['front_delts', 'side_delts'], /(shoulder|overhead) press/, { equipment: MACHINE }),
  load('overhead_press', 'Overhead press', 'press', ['front_delts', 'side_delts'], /(shoulder|overhead|military) press/, { equipment: BAR }),
  load('cable_lateral_raise', 'Cable lateral raise', 'raise', ['side_delts'], /lateral raise/, { equipment: CABLE, oneSided: true }),
  load('machine_lateral_raise', 'Machine lateral raise', 'raise', ['side_delts'], /lateral raise/, { equipment: MACHINE }),
  perHand('lateral_raise', 'Lateral raise', 'raise', ['side_delts'], /lateral raise|side raise/),
  perHand('db_front_raise', 'Front raise', 'raise', ['front_delts'], /front raise/),
  load('front_raise', 'Front raise', 'raise', ['front_delts'], /front raise/),
  load('upright_row', 'Upright row', 'raise', ['side_delts', 'traps'], /upright row/, { equipment: BAR }),
  perHand('db_shrug', 'Dumbbell shrug', 'traps', ['traps'], /shrug/),
  load('shrug', 'Shrug', 'traps', ['traps'], /shrug/),

  // Back -------------------------------------------------------------------------------------
  load('straight_arm_pulldown', 'Straight-arm pulldown', 'pull', ['lats'], /straight arm|pullover/, { equipment: CABLE }),
  load('lat_pulldown', 'Lat pulldown', 'pull', ['lats'], /pull ?down|lat pull/, { equipment: [...CABLE, ...MACHINE] }),
  reps('chin_up', 'Chin-up', 'pull', ['lats', 'biceps'], /chin ?ups?\b/, 1, { not: /assisted/ }),
  reps('pull_up', 'Pull-up', 'pull', ['lats'], /pull ?ups?\b/, 1, { not: /assisted/ }),
  reps('inverted_row', 'Inverted row', 'pull', ['upper_back', 'lats'], /inverted row|body ?row/, 0.6, { equipment: BW }),
  perHand('db_row', 'Dumbbell row', 'pull', ['upper_back', 'lats'], /\brow\b/, { not: /renegade|upright|chest supported|kroc|seal/ }),
  load('t_bar_row', 'T-bar row', 'pull', ['upper_back', 'lats'], /\bt ?bar\b/, { equipment: [...BAR, ...MACHINE] }),
  load('cable_row', 'Seated cable row', 'pull', ['upper_back', 'lats'], /\brow\b/, { equipment: CABLE }),
  load('machine_row', 'Machine row', 'pull', ['upper_back', 'lats'], /\brow\b/, { equipment: MACHINE }),
  load('barbell_row', 'Barbell row', 'pull', ['upper_back', 'lats'], /\brow\b/, { equipment: BAR, not: /pendlay|landmine|chest supported|seal/ }),

  // Arms -------------------------------------------------------------------------------------
  perHand('db_wrist_curl', 'Dumbbell wrist curl', 'grip', ['forearms'], /wrist curl/, { not: /reverse/ }),
  load('wrist_curl', 'Wrist curl', 'grip', ['forearms'], /wrist curl/, { not: /reverse/ }),
  load('reverse_curl', 'Reverse curl', 'arms', ['biceps', 'forearms'], /reverse curl/, { not: /wrist/ }),
  load('machine_preacher_curl', 'Machine biceps curl', 'arms', ['biceps'], /preacher|biceps? curl/, { equipment: MACHINE }),
  perHand('hammer_curl', 'Hammer curl', 'arms', ['biceps', 'forearms'], /hammer/),
  perHand('incline_curl', 'Incline dumbbell curl', 'arms', ['biceps'], /incline.*curl/),
  perHand('db_curl', 'Dumbbell curl', 'arms', ['biceps'], /curl/, { not: /wrist|reverse|zottman|preacher|spider|concentration/ }),
  load('cable_curl', 'Cable curl', 'arms', ['biceps'], /curl/, { equipment: CABLE, not: /wrist|reverse|hammer|preacher|spider|concentration/ }),
  load('barbell_curl', 'Barbell curl', 'arms', ['biceps'], /curl/, { equipment: BAR, not: /wrist|preacher|spider|drag/ }),
  load('pushdown', 'Triceps pushdown', 'arms', ['triceps'], /push ?down|press ?down/, { equipment: CABLE }),
  load('skull_crusher', 'Skull crusher', 'arms', ['triceps'], /skull ?crusher|lying tricep/, { equipment: BAR }),
  perHand('triceps_kickback', 'Triceps kickback', 'arms', ['triceps'], /kickback/),
  perHand('db_triceps_extension', 'Single-arm dumbbell triceps extension', 'arms', ['triceps'], /(single|one) arm.*(tricep.*extension|overhead extension)/, { not: /lying/ }),
  load('triceps_extension', 'Overhead triceps extension', 'arms', ['triceps'], /tricep.*extension|overhead extension/, { equipment: CABLE }),

  // Core -------------------------------------------------------------------------------------
  load('cable_crunch', 'Cable crunch', 'core', ['abs'], /crunch/, { equipment: CABLE }),
  reps('crunch', 'Crunch', 'core', ['abs'], /crunch/, 0.3, { equipment: BW, not: /reverse|bicycle/ }),
  reps('sit_up', 'Sit-up', 'core', ['abs'], /sit ?up/, 0.35, { equipment: BW, not: /decline|incline/ }),
  reps('leg_raise', 'Hanging leg raise', 'core', ['abs'], /hanging.*leg raise|leg raise/, 0.35, { equipment: BW, not: /knee raise|toes to bar|lying|seated/ }),
  reps('ab_rollout', 'Ab wheel rollout', 'core', ['abs'], /roll ?out|rollerout|ab wheel/, 0.5, { equipment: ['bodyweight', 'other'] }),
  reps('russian_twist', 'Russian twist', 'core', ['abs', 'obliques'], /russian twist/, 0.3, { equipment: BW }),
  load('cable_twist', 'Cable woodchop', 'core', ['obliques', 'abs'], /twist|wood ?chop/, { equipment: CABLE }),
]

/** "Dumbbell Single-Leg Split Squat (Pro)" -> "dumbbell single leg split squat pro" */
export const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const ONE_ARM = /\b(single|one) arm\b/
const ONE_LEG = /\b(single|one) leg\b/

/**
 * A single-arm or single-leg lift is only compared with standards made for that. A two-handed
 * standard would rank a one-arm cable row as a weak two-handed one. The exception is a dumbbell
 * standard, which is per dumbbell already, so it fits a one-arm dumbbell lift.
 */
function fitsSides(standard: StrengthStandard, name: string, equipment: Equipment): boolean {
  const arm = ONE_ARM.test(name)
  const leg = ONE_LEG.test(name)
  if (!arm && !leg) return true
  if (standard.oneSided) return true
  return arm && !leg && DB.includes(equipment) && standard.kind === 'load' && standard.perHand === true
}

// The answer only depends on the name and equipment, and ranks and Pip ask about the same few hundred
// exercises over and over (each lookup runs up to a hundred patterns), so answers are kept.
const standardFor = new Map<string, StrengthStandard | null>()

/** The standard an exercise is compared with, or null when there is none (bands, odd machines...). */
export function findStandard(exercise: { name: string; equipment: Equipment; category: string; tracking: string }): StrengthStandard | null {
  if (exercise.category !== 'strength' || exercise.tracking !== 'reps') return null
  if (exercise.equipment === 'band') return null
  const key = `${exercise.equipment}|${exercise.name}`
  const known = standardFor.get(key)
  if (known !== undefined) return known
  const name = normalizeName(exercise.name)
  let found: StrengthStandard | null = null
  for (const standard of STRENGTH_STANDARDS) {
    if (standard.equipment && !standard.equipment.includes(exercise.equipment)) continue
    if (standard.not?.test(name)) continue
    if (!fitsSides(standard, name, exercise.equipment)) continue
    if (standard.match.test(name)) {
      found = standard
      break
    }
  }
  if (standardFor.size >= 4000) standardFor.clear()
  standardFor.set(key, found)
  return found
}
