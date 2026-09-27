import { useMemo } from 'react'
import { loadProfileData, type ProfileData } from '../data/profile'
import { bodyweightKg, buildProfile, type Profile, type ProfileInput } from '../lib/profile'
import { fromKg, toKg } from '../lib/strengthRank'
import type { WeightUnit } from '../types/db'
import { useAsync } from './useAsync'
import { useSettings } from './useSettings'

export interface ProfileState {
  profile: Profile | null
  /** What the profile was built from (for per-workout rewards). */
  input: ProfileInput | null
  /** Bodyweight used for comparisons, in the app's unit (7-day average of weigh-ins). */
  bodyweight: number | null
  bodyweightFromAssessment: boolean
  loading: boolean
  error: Error | null
  reload: () => void
}

/** What the profile is worked out from: the loaded history plus the settings that affect ranks. */
export function profileInput(loaded: ProfileData, unit: WeightUnit, sex: ProfileInput['sex']): ProfileInput {
  const assessment = loaded.assessment?.answers
  return { exercises: loaded.exercises, sessions: loaded.sessions, sets: loaded.sets, unit, sex,
    assessment, bodyweightKg: bodyweightKg(loaded.weights) ?? (assessment ? toKg(assessment.bodyweight, assessment.unit) : null) }
}

/** Loads the whole history and works out ranks, badges and XP from it. */
export function useProfile(): ProfileState {
  const { unit, compareSex } = useSettings()
  const data = useAsync(loadProfileData, [], { cacheKey: 'profile-data' })
  const loaded = data.data

  const input = useMemo(() => (loaded ? profileInput(loaded, unit, compareSex) : null), [loaded, unit, compareSex])
  const profile = useMemo(() => (input ? buildProfile(input) : null), [input])
  const bodyweight = input?.bodyweightKg ? Math.round(fromKg(input.bodyweightKg, unit) * 10) / 10 : null

  const bodyweightFromAssessment = Boolean(loaded?.assessment && bodyweightKg(loaded.weights) === null)
  return { profile, input, bodyweight, bodyweightFromAssessment, loading: data.loading, error: data.error, reload: data.reload }
}
