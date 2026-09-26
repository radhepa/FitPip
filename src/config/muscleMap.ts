// The one place that ties our normalized muscles to the body-map library (react-body-highlighter).
// The library draws 20-ish regions and names a couple of them oddly ("adductor" is its
// inner-thigh region on the back view), so anything about its vocabulary lives here.
import type { Muscle as BodyMuscle } from 'react-body-highlighter'
import type { Muscle } from '../types/db.ts'

export type { BodyMuscle }

/**
 * Our muscle -> the regions to light up. Several of ours can feed one region (lats and upper back
 * share the library's "upper-back"); a region takes the highest level of its sources so a set is
 * never counted twice. Side delts wrap around, so they show on both the front and back view.
 */
export const MUSCLE_TO_BODY: Record<Muscle, BodyMuscle[]> = {
  chest: ['chest'],
  front_delts: ['front-deltoids'],
  side_delts: ['front-deltoids', 'back-deltoids'],
  rear_delts: ['back-deltoids'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearms: ['forearm'],
  traps: ['trapezius'],
  lats: ['upper-back'],
  upper_back: ['upper-back'],
  lower_back: ['lower-back'],
  abs: ['abs'],
  obliques: ['obliques'],
  quads: ['quadriceps'],
  hamstrings: ['hamstring'],
  glutes: ['gluteal'],
  // The library's names are unreliable here (checked by looking at what lights up): its front-view
  // "abductors" shape is the upper inner thigh and its back-view "adductor" shape is the inner
  // thigh behind. Both are adductor territory. Our hip abductors (outer hip, glute medius) have no
  // shape of their own, so they share the glutes.
  adductors: ['adductor', 'abductors'],
  abductors: ['gluteal'],
  calves: ['calves', 'left-soleus', 'right-soleus'],
}

/** Regions the library draws that we do not track (head, neck, knees): drawn, but never lit. */
export const UNTRACKED_REGIONS: BodyMuscle[] = ['head', 'neck', 'knees']

/** Region -> our muscles (the inverse of MUSCLE_TO_BODY), used when a region is tapped. */
export const BODY_TO_MUSCLES: Partial<Record<BodyMuscle, Muscle[]>> = {}
for (const [muscle, regions] of Object.entries(MUSCLE_TO_BODY) as [Muscle, BodyMuscle[]][]) {
  for (const region of regions) (BODY_TO_MUSCLES[region] ??= []).push(muscle)
}

/** Heading for the sheet that opens when a region is tapped. */
export const BODY_LABEL: Partial<Record<BodyMuscle, string>> = {
  chest: 'Chest',
  'front-deltoids': 'Front & side shoulders',
  'back-deltoids': 'Rear & side shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearm: 'Forearms',
  trapezius: 'Traps',
  'upper-back': 'Upper back & lats',
  'lower-back': 'Lower back',
  abs: 'Abs',
  obliques: 'Obliques',
  quadriceps: 'Quads',
  hamstring: 'Hamstrings',
  gluteal: 'Glutes & hip abductors',
  adductor: 'Adductors',
  abductors: 'Adductors',
  calves: 'Calves',
  'left-soleus': 'Calves',
  'right-soleus': 'Calves',
}

/** Light to dark red for levels 1-4. Level 0 is the plain body colour. */
export const LEVEL_COLORS = ['#B9DBFF', '#75B7F5', '#317BD2', '#174B88'] as const
export const BODY_COLOR = '#B8C3D1'

/** Weekly sets at which each level starts: 1-4 = level 1, 5-9 = 2, 10-14 = 3, 15+ = 4. */
export const LEVEL_STARTS = [1, 5, 10, 15] as const
export const LEVEL_LABELS = ['0', '1–4', '5–9', '10–14', '15+'] as const
