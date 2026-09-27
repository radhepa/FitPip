// Shared shape and small builders for the starter catalogue (src/config/catalog/*.ts).
// The catalogue is data, not app code: `node scripts/build-catalog-migration.ts` turns it into the
// migration that seeds every account, and catalog.test.ts keeps it honest.
import type { Category, Equipment, Muscle, Tracking } from '../../types/db.ts'

/** One starter exercise, exactly as the migration seeds it into an account. */
export interface CatalogEntry {
  name: string
  category: Category
  tracking: Tracking
  primary_muscles: Muscle[]
  secondary_muscles: Muscle[]
  equipment: Equipment
  instructions: string[]
}

/** Name, the muscles it mainly trains, the muscles that help, and two or three short how-to lines. */
export type Maker = (name: string, primary: Muscle[], secondary: Muscle[], instructions: string[]) => CatalogEntry

const maker =
  (category: Category, tracking: Tracking, equipment: Equipment): Maker =>
  (name, primary_muscles, secondary_muscles, instructions) => ({ name, category, tracking, primary_muscles, secondary_muscles, equipment, instructions })

/** Weight x reps lifts. */
export const lifts = (equipment: Equipment): Maker => maker('strength', 'reps', equipment)

/** Timed holds (planks, hangs, anti-rotation holds), logged in seconds. */
export const holds = (equipment: Equipment): Maker => maker('strength', 'time', equipment)

/** Cardio, swimming, boxing and sports. */
export const activity = (category: Category, tracking: Tracking, equipment: Equipment): Maker => maker(category, tracking, equipment)

/** A one-arm (or one-leg) exercise: the last line reminds you to log each side separately. */
export const eachSide =
  (make: Maker, noun: 'arm' | 'leg' | 'side' = 'arm'): Maker =>
  (name, primary, secondary, instructions) =>
    make(name, primary, secondary, [...instructions, `Finish all reps on one ${noun}, then switch, and log each ${noun} as its own set.`])
