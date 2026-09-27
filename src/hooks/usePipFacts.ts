import { useMemo } from 'react'
import { loadProfileData } from '../data/profile'
import { buildPipFacts, type PipFacts } from '../lib/pip/facts'
import type { PlanInput } from '../lib/pip/planFacts'
import type { BodyWeight } from '../types/db'
import { useAsync } from './useAsync'
import { useSettings } from './useSettings'

interface Options {
  /** Today's plan and the week so far, on screens that have them. Memoise it. */
  plan?: PlanInput | null
  /** A fresher list of weigh-ins, on the screen that edits them. */
  weights?: BodyWeight[] | null
  /** Load nothing (for a screen that only sometimes needs Pip). */
  skip?: boolean
  /** False while the page is still loading its own data, so Pip waits rather than talk about half the picture. */
  ready?: boolean
}

/** What Pip knows about you, worked out from your whole history. Null until it has loaded. */
export function usePipFacts({ plan = null, weights = null, skip = false, ready = true }: Options = {}): PipFacts | null {
  const { unit, distanceUnit, goal, displayName } = useSettings()
  const data = useAsync(() => (skip ? Promise.resolve(null) : loadProfileData()), [skip], { cacheKey: skip ? undefined : 'profile-data' })
  const loaded = data.data
  const goalWeight = goal?.weight ?? null
  const goalUnit = goal?.unit ?? null

  return useMemo(
    () =>
      loaded && ready
        ? buildPipFacts({
            now: new Date(),
            unit,
            distanceUnit,
            displayName,
            goal: goalWeight !== null && goalUnit ? { weight: goalWeight, unit: goalUnit } : null,
            exercises: loaded.exercises,
            sessions: loaded.sessions,
            sets: loaded.sets,
            weights: weights ?? loaded.weights,
            plan,
          })
        : null,
    [loaded, ready, weights, unit, distanceUnit, displayName, goalWeight, goalUnit, plan],
  )
}
