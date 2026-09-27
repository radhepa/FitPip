// The expanded starter catalogue: every exercise added on top of the original starter bank, tailored
// to the Purdue CoRec floor and to cutting weight while keeping strength. Turned into a migration
// by `node scripts/build-catalog-migration.ts`; catalog.test.ts checks it.
import { BARBELL_LEGS_AND_HINGE, BARBELL_PRESSING, BARBELL_PULLING_AND_ARMS, OLYMPIC_LIFTS } from './barbell.ts'
import { BODYWEIGHT, CARRIES_AND_SLEDS, CONDITIONING_LIFTS, CORE_AND_HOLDS } from './bodyweight.ts'
import { CLASSES, COMBAT_AND_SPORT, CONDITIONING, MACHINES, OUTDOOR_AND_SWIM, TREADMILL_AND_RUNNING } from './cardio.ts'
import { DUMBBELL_LOWER_AND_POWER, DUMBBELL_UPPER, KETTLEBELL } from './dumbbell.ts'
import type { CatalogEntry } from './entry.ts'
import { ONE_SIDE_MACHINES, PIN_LOADED, PLATE_LOADED, SMITH_MACHINE } from './machines.ts'
import { LIFTER_MOBILITY } from './mobility.ts'
import { CABLE_CORE_AND_LEGS, CABLE_TWO_HANDED, SINGLE_ARM_CABLE } from './singleArmCable.ts'

export type { CatalogEntry } from './entry.ts'

/** Lifting first, then cardio, in the order they read best when browsing. */
export const EXTRA_CATALOG: CatalogEntry[] = [
  ...SINGLE_ARM_CABLE,
  ...CABLE_CORE_AND_LEGS,
  ...CABLE_TWO_HANDED,
  ...PLATE_LOADED,
  ...PIN_LOADED,
  ...ONE_SIDE_MACHINES,
  ...SMITH_MACHINE,
  ...BARBELL_LEGS_AND_HINGE,
  ...BARBELL_PRESSING,
  ...BARBELL_PULLING_AND_ARMS,
  ...OLYMPIC_LIFTS,
  ...DUMBBELL_UPPER,
  ...DUMBBELL_LOWER_AND_POWER,
  ...KETTLEBELL,
  ...BODYWEIGHT,
  ...CORE_AND_HOLDS,
  ...CARRIES_AND_SLEDS,
  ...CONDITIONING_LIFTS,
  ...TREADMILL_AND_RUNNING,
  ...MACHINES,
  ...CONDITIONING,
  ...OUTDOOR_AND_SWIM,
  ...COMBAT_AND_SPORT,
  ...CLASSES,
  ...LIFTER_MOBILITY,
]
