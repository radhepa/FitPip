import { useDeferredValue, useMemo } from 'react'
import { loadProfileData, type ProfileData } from '../data/profile'
import { localDateIso } from '../lib/bodyWeight'
import { buildPipFacts, type PipFacts } from '../lib/pip/facts'
import type { PlanInput } from '../lib/pip/planFacts'
import type { BodyWeight, DistanceUnit, WeightUnit } from '../types/db'
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

interface FactsRequest {
  loaded: ProfileData
  weights: BodyWeight[] | null
  unit: WeightUnit
  distanceUnit: DistanceUnit
  displayName: string | null
  goalWeight: number | null
  goalUnit: WeightUnit | null
  plan: PlanInput | null
  /** The plan as text: screens build a new plan object each visit, so it is compared by content. */
  planKey: string
}

interface Known {
  request: FactsRequest
  facts: PipFacts
  day: string
  at: number
}

/** Facts this old or older are worked out again, so "this morning" and "today" stay right. */
const KEEP_MS = 10 * 60_000
/** Today and Weigh-in each ask with their own inputs; a few answers cover moving between them. */
const MAX_KNOWN = 4
let known: Known[] = []

const sameRequest = (a: FactsRequest, b: FactsRequest) =>
  a.loaded === b.loaded &&
  a.weights === b.weights &&
  a.unit === b.unit &&
  a.distanceUnit === b.distanceUnit &&
  a.displayName === b.displayName &&
  a.goalWeight === b.goalWeight &&
  a.goalUnit === b.goalUnit &&
  a.planKey === b.planKey

/** Facts already worked out for exactly this request, if they are still current. */
function recall(request: FactsRequest, now = new Date()): PipFacts | null {
  const day = localDateIso(now)
  const hit = known.find((k) => sameRequest(k.request, request) && k.day === day && now.getTime() - k.at < KEEP_MS)
  return hit?.facts ?? null
}

function work(request: FactsRequest): PipFacts {
  const now = new Date()
  const { loaded, goalWeight, goalUnit } = request
  const facts = buildPipFacts({
    now,
    unit: request.unit,
    distanceUnit: request.distanceUnit,
    displayName: request.displayName,
    goal: goalWeight !== null && goalUnit ? { weight: goalWeight, unit: goalUnit } : null,
    exercises: loaded.exercises,
    sessions: loaded.sessions,
    sets: loaded.sets,
    weights: request.weights ?? loaded.weights,
    plan: request.plan,
  })
  known = [{ request, facts, day: localDateIso(now), at: now.getTime() }, ...known.filter((k) => !sameRequest(k.request, request))].slice(0, MAX_KNOWN)
  return facts
}

/**
 * What Pip knows about you, worked out from your whole history. Null until it has loaded.
 *
 * That takes a moment with a long history, so it waits until the screen has been drawn (Pip shows
 * up a beat after the page instead of holding the page back), and the answer is kept, so coming
 * back to a screen has it straight away.
 */
export function usePipFacts({ plan = null, weights = null, skip = false, ready = true }: Options = {}): PipFacts | null {
  const { unit, distanceUnit, goal, displayName } = useSettings()
  const data = useAsync(() => (skip ? Promise.resolve(null) : loadProfileData()), [skip], { cacheKey: skip ? undefined : 'profile-data' })
  const loaded = data.data
  const goalWeight = goal?.weight ?? null
  const goalUnit = goal?.unit ?? null
  const planKey = useMemo(() => (plan ? JSON.stringify(plan) : ''), [plan])

  const request = useMemo<FactsRequest | null>(
    () => (loaded && ready ? { loaded, weights, unit, distanceUnit, displayName, goalWeight, goalUnit, plan, planKey } : null),
    [loaded, ready, weights, unit, distanceUnit, displayName, goalWeight, goalUnit, plan, planKey],
  )
  const remembered = request ? recall(request) : null
  // Not worked out yet: the screen is drawn first, then a background render works it out.
  const pending = useDeferredValue(remembered ? null : request, null)
  const worked = useMemo(() => (pending ? (recall(pending) ?? work(pending)) : null), [pending])
  return remembered ?? (request ? worked : null)
}
