import type { BegunSession, BodyWeight, Exercise, SetRow } from '../types/db'
import { listBodyWeights } from './bodyWeights'
import { listExercises } from './exercises'
import { loadAllTraining } from './trainingWindow'
import { getAssessment, type SavedAssessment } from './onboarding'

export interface ProfileData {
  exercises: Exercise[]
  sessions: BegunSession[]
  sets: SetRow[]
  weights: BodyWeight[]
  assessment: SavedAssessment | null
}

/** Everything the profile is worked out from: the whole history plus weigh-ins. */
export async function loadProfileData(): Promise<ProfileData> {
  const [exercises, training, weights, assessment] = await Promise.all([listExercises(), loadAllTraining(), listBodyWeights(), getAssessment()])
  return { exercises, ...training, weights, assessment }
}
