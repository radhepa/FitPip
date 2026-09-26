// The one place that translates ExerciseDB's vocabulary into ours.
// Data source: https://github.com/ExerciseDB/exercisedb-api (free instance: oss.exercisedb.dev).
import type { Equipment, Muscle } from '../types/db.ts'

/** One record from `GET /api/v1/exercises`. */
export interface ExerciseDbExercise {
  exerciseId: string
  name: string
  gifUrl?: string
  bodyParts?: string[]
  equipments?: string[]
  targetMuscles?: string[]
  secondaryMuscles?: string[]
  instructions?: string[]
}

/** An ExerciseDB record expressed in our normalized terms, ready to store. */
export interface MappedExercise {
  external_id: string
  name: string
  primary_muscles: Muscle[]
  secondary_muscles: Muscle[]
  equipment: Equipment
  image_url: string | null
  instructions: string[]
}

/**
 * ExerciseDB muscle name -> our muscles. Deliberately unmapped (no matching normalized muscle,
 * so they are dropped): hip flexors, shins, feet, ankles, ankle stabilizers, rotator cuff,
 * sternocleidomastoid, cardiovascular system. Generic deltoid names are handled in `deltoids()`.
 */
const MUSCLE_MAP: Record<string, Muscle[]> = {
  abs: ['abs'],
  abdominals: ['abs'],
  core: ['abs'],
  'lower abs': ['abs'],
  obliques: ['obliques'],
  pectorals: ['chest'],
  chest: ['chest'],
  'upper chest': ['chest'],
  'serratus anterior': ['chest'],
  'rear deltoids': ['rear_delts'],
  biceps: ['biceps'],
  brachialis: ['biceps'],
  triceps: ['triceps'],
  forearms: ['forearms'],
  wrists: ['forearms'],
  'wrist flexors': ['forearms'],
  'wrist extensors': ['forearms'],
  'grip muscles': ['forearms'],
  hands: ['forearms'],
  traps: ['traps'],
  trapezius: ['traps'],
  'levator scapulae': ['traps'],
  lats: ['lats'],
  'latissimus dorsi': ['lats'],
  'upper back': ['upper_back'],
  rhomboids: ['upper_back'],
  back: ['lats', 'upper_back'],
  'lower back': ['lower_back'],
  spine: ['lower_back'],
  quads: ['quads'],
  quadriceps: ['quads'],
  hamstrings: ['hamstrings'],
  glutes: ['glutes'],
  calves: ['calves'],
  soleus: ['calves'],
  adductors: ['adductors'],
  'inner thighs': ['adductors'],
  groin: ['adductors'],
  abductors: ['abductors'],
}

/** ExerciseDB says only "delts" / "shoulders" for most shoulder work, so the name decides which head. */
const GENERIC_DELTOIDS = new Set(['delts', 'deltoids', 'shoulders'])

function deltoids(role: 'primary' | 'secondary', exerciseName: string): Muscle[] {
  // As a secondary mover shoulders mostly means the front delts (pressing).
  if (role === 'secondary') return ['front_delts']
  const name = exerciseName.toLowerCase()
  if (/\b(rear|reverse fly|face pull)\b/.test(name)) return ['rear_delts']
  if (/\b(lateral|side raise|upright row)\b/.test(name)) return ['side_delts']
  if (/\bfront (raise|delt)/.test(name)) return ['front_delts']
  return ['front_delts', 'side_delts']
}

/** ExerciseDB equipment name -> our equipment. Unknown or exotic gear falls back to 'other'. */
const EQUIPMENT_MAP: Record<string, Equipment> = {
  'body weight': 'bodyweight',
  dumbbell: 'dumbbell',
  barbell: 'barbell',
  'olympic barbell': 'barbell',
  'ez barbell': 'barbell',
  'trap bar': 'barbell',
  cable: 'cable',
  'leverage machine': 'machine',
  'sled machine': 'machine',
  assisted: 'machine',
  hammer: 'machine',
  'smith machine': 'smith_machine',
  kettlebell: 'kettlebell',
  band: 'band',
  'resistance band': 'band',
}

export function mapMuscles(names: string[] | undefined, role: 'primary' | 'secondary', exerciseName: string): Muscle[] {
  const out: Muscle[] = []
  for (const raw of names ?? []) {
    const key = raw.trim().toLowerCase()
    const mapped = GENERIC_DELTOIDS.has(key) ? deltoids(role, exerciseName) : (MUSCLE_MAP[key] ?? [])
    for (const muscle of mapped) if (!out.includes(muscle)) out.push(muscle)
  }
  return out
}

export function mapEquipment(names: string[] | undefined): Equipment {
  const first = names?.[0]?.trim().toLowerCase()
  return (first && EQUIPMENT_MAP[first]) || 'other'
}

/** "lever t bar row" -> "Lever T Bar Row" */
export function titleCase(name: string): string {
  return name.trim().replace(/(^|[\s\-(/])([a-z])/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase())
}

/** ExerciseDB prefixes steps with "Step:1 "; we store just the sentence. */
export function cleanInstructions(steps: string[] | undefined): string[] {
  return (steps ?? []).map((s) => s.replace(/^\s*step\s*:?\s*\d+\s*[:.)-]?\s*/i, '').trim()).filter(Boolean)
}

// The API is third-party data: keep what we store within the database's limits.
const MAX_NAME_LENGTH = 80
const MAX_STEPS = 30

export function mapExerciseDb(ex: ExerciseDbExercise): MappedExercise {
  const primary = mapMuscles(ex.targetMuscles, 'primary', ex.name)
  const secondary = mapMuscles(ex.secondaryMuscles, 'secondary', ex.name).filter((m) => !primary.includes(m))
  return {
    external_id: ex.exerciseId,
    name: titleCase(ex.name).slice(0, MAX_NAME_LENGTH),
    primary_muscles: primary,
    secondary_muscles: secondary,
    equipment: mapEquipment(ex.equipments),
    image_url: ex.gifUrl?.startsWith('https://') ? ex.gifUrl : null,
    instructions: cleanInstructions(ex.instructions).slice(0, MAX_STEPS),
  }
}

/** Cardio, stretches on the neck etc. have no muscle we track, so they can't feed the heatmap. */
export const isImportable = (m: MappedExercise): boolean => m.primary_muscles.length > 0
