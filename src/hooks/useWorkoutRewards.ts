import { useMemo } from 'react'
import { loadProfileData, type ProfileData } from '../data/profile'
import { workoutRewards, type WorkoutRewards } from '../lib/profile'
import { useAsync } from './useAsync'
import { profileInput } from './useProfile'
import { useSettings } from './useSettings'

export interface WorkoutRewardsState {
  rewards: WorkoutRewards | null
  /** No sex or bodyweight set, so lifts can't be ranked against other people yet. */
  missingProfile: boolean
  /** Still reading the history for the first time. */
  loading: boolean
}

/**
 * Working out a workout's rewards replays the whole history twice (ranks before and after it), which is
 * slow on a phone with a long history. Each result is kept for as long as the history it came from, so
 * opening the same workout again is instant.
 */
const worked = new WeakMap<ProfileData, Map<string, WorkoutRewards | null>>()

function rewardsFor(loaded: ProfileData, sessionId: string, unit: Parameters<typeof profileInput>[1], sex: Parameters<typeof profileInput>[2]) {
  let byKey = worked.get(loaded)
  if (!byKey) worked.set(loaded, (byKey = new Map()))
  const key = `${sessionId}|${unit}|${sex}`
  if (!byKey.has(key)) byKey.set(key, workoutRewards(profileInput(loaded, unit, sex), sessionId))
  return byKey.get(key) ?? null
}

/** What one workout earned (XP, a level-up, records, rank-ups), from the same history the profile reads. */
export function useWorkoutRewards(sessionId: string): WorkoutRewardsState {
  const { unit, compareSex } = useSettings()
  const data = useAsync(loadProfileData, [], { cacheKey: 'profile-data' })
  const loaded = data.data
  const rewards = useMemo(() => (loaded ? rewardsFor(loaded, sessionId, unit, compareSex) : null), [loaded, sessionId, unit, compareSex])
  const missingProfile = useMemo(() => {
    if (!loaded) return false
    const input = profileInput(loaded, unit, compareSex)
    return input.sex === null || !(input.bodyweightKg && input.bodyweightKg > 0)
  }, [loaded, unit, compareSex])
  return { rewards, missingProfile, loading: data.loading }
}
