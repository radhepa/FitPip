import type { BegunSession, BodyWeight, Exercise, SetRow } from '../types/db'
import { listBodyWeights } from './bodyWeights'
import { listExercises } from './exercises'
import { loadAllTraining } from './trainingWindow'

export interface ProfileData {
  exercises: Exercise[]
  sessions: BegunSession[]
  sets: SetRow[]
  weights: BodyWeight[]
}

/** Everything the profile is worked out from: the whole history plus weigh-ins. */
export async function loadProfileData(): Promise<ProfileData> {
  const [exercises, training, weights] = await Promise.all([listExercises(), loadAllTraining(), listBodyWeights()])
  return { exercises, ...training, weights }
}
