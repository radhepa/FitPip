// Everything Pip can bring up, worked out from your history. Pure: the hook loads the data.
import type { BegunSession, BodyWeight, DistanceUnit, Exercise, SetRow, WeightUnit } from '../../types/db'
import { toWeighIns, type WeighIn } from '../bodyWeight'
import { weightFacts, type WeightFacts } from './bodyFacts'
import { habitFacts, type HabitFacts } from './habitFacts'
import { liftHistories, recentRecords, type LiftHistory, type LiftRecord } from './liftFacts'
import { planFacts, type PlanFacts, type PlanInput } from './planFacts'

export interface PipFactsInput {
  now: Date
  unit: WeightUnit
  distanceUnit: DistanceUnit
  displayName: string | null
  goal: { weight: number; unit: WeightUnit } | null
  exercises: Exercise[]
  sessions: BegunSession[]
  sets: SetRow[]
  weights: BodyWeight[]
  /** Today's plan and the week so far; leave out on screens that don't have it. */
  plan?: PlanInput | null
}

export interface PipFacts {
  now: Date
  unit: WeightUnit
  distanceUnit: DistanceUnit
  /** First name to use in lines, or null. */
  name: string | null
  habit: HabitFacts
  lifts: LiftHistory[]
  /** Records set in the last three days, newest first. */
  records: LiftRecord[]
  weight: WeightFacts | null
  weighIns: WeighIn[]
  plan: PlanFacts | null
  /** Changes when the data Pip talks about changes, so a stale opening line is not kept. */
  stamp: string
}

/** How long ago counts as "just now" for a new record. */
export const RECENT_RECORD_DAYS = 3

/** "Alex Kim" -> "Alex". Nothing for a blank name. */
export function firstName(displayName: string | null): string | null {
  const first = displayName?.trim().split(/\s+/)[0] ?? ''
  return first ? first.slice(0, 20) : null
}

export function buildPipFacts(input: PipFactsInput): PipFacts {
  const { now, unit } = input
  const lifts = liftHistories(input)
  const habit = habitFacts(input)
  const weight = weightFacts(input.weights, unit, input.goal, now)
  const latestEdit = input.sessions.reduce((latest, s) => (s.updated_at > latest ? s.updated_at : latest), '')
  return {
    now,
    unit,
    distanceUnit: input.distanceUnit,
    name: firstName(input.displayName),
    habit,
    lifts,
    records: recentRecords(lifts, RECENT_RECORD_DAYS),
    weight,
    weighIns: toWeighIns(input.weights, unit),
    plan: input.plan ? planFacts({ ...input, plan: input.plan.plan, week: input.plan.week, histories: lifts }) : null,
    stamp: [habit.workouts, input.sets.length, latestEdit, input.weights.length, weight?.latestDate ?? '', input.goal?.weight ?? '', input.plan?.plan.kind ?? ''].join('|'),
  }
}
