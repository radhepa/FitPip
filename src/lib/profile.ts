// Everything on the profile, from the logged history: XP and level, lift badges, muscle ranks,
// the overall rank, cardio and practice badges, and lifetime totals. Pure: the screen loads the
// data and memoises the result.
import type { RankNumber } from '../config/ranks'
import type { Sex } from '../config/strengthStandards'
import type { BegunSession, BodyWeight, Exercise, Muscle, SetRow, WeightUnit } from '../types/db'
import { rankActivities, type ActivityBadge } from './activityRank'
import { toWeighIns, weekAverage } from './bodyWeight'
import { muscleLabel } from './format'
import { overallRank, rankLifts, rankMuscles, unrankedLifts, type LiftBadge, type MuscleRank, type OverallRank } from './strengthRank'
import { levelFor, xpHistory, type LevelProgress, type SessionXp } from './xp'

export interface ProfileInput {
  exercises: Exercise[]
  /** Workouts that have begun (finished or still going). */
  sessions: BegunSession[]
  sets: SetRow[]
  /** The unit set weights are in (the app's weight unit). */
  unit: WeightUnit
  sex: Sex | null
  bodyweightKg: number | null
  now?: Date
}

export interface Totals {
  workouts: number
  sets: number
  /** Weight x reps, in the app's unit. */
  volume: number
  /** Time between start and finish of finished workouts. */
  trainedSeconds: number
  records: number
  badges: number
}

export interface Profile {
  xp: LevelProgress & { total: number; thisWeek: number }
  history: SessionXp[]
  lifts: LiftBadge[]
  unranked: Exercise[]
  muscles: Partial<Record<Muscle, MuscleRank>>
  overall: OverallRank | null
  activities: ActivityBadge[]
  totals: Totals
  /** What's needed before lifts can be ranked. */
  missing: { sex: boolean; bodyweight: boolean }
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/** Bodyweight in kg for comparisons: the average of the last week of weigh-ins (smooths daily swings). */
export function bodyweightKg(weights: BodyWeight[]): number | null {
  return weekAverage(toWeighIns(weights, 'kg'))
}

export function buildProfile(input: ProfileInput): Profile {
  const begun = new Set(input.sessions.map((s) => s.id))
  const sets = input.sets.filter((s) => begun.has(s.session_id))
  const history = xpHistory({ exercises: input.exercises, sessions: input.sessions, sets })
  const total = history.reduce((sum, h) => sum + h.total, 0)
  const weekFrom = (input.now ?? new Date()).getTime() - WEEK_MS
  const thisWeek = history.filter((h) => new Date(h.startedAt).getTime() >= weekFrom).reduce((sum, h) => sum + h.total, 0)

  const canRank = input.sex !== null && input.bodyweightKg !== null && input.bodyweightKg > 0
  const lifts = canRank
    ? rankLifts({ exercises: input.exercises, sessions: input.sessions, sets, unit: input.unit, sex: input.sex!, bodyweightKg: input.bodyweightKg! })
    : []
  const muscles = rankMuscles(lifts)
  const activities = rankActivities({ exercises: input.exercises, sessions: input.sessions, sets, sex: input.sex })

  const finished = input.sessions.filter((s) => s.ended_at)
  const totals: Totals = {
    workouts: finished.length,
    sets: sets.length,
    volume: sets.reduce((sum, s) => sum + s.weight * s.reps, 0),
    trainedSeconds: finished.reduce((sum, s) => sum + Math.max(0, (new Date(s.ended_at!).getTime() - new Date(s.started_at).getTime()) / 1000), 0),
    records: history.reduce((sum, h) => sum + h.records.length, 0),
    badges: lifts.length + activities.length,
  }

  return {
    xp: { ...levelFor(total), total, thisWeek },
    history,
    lifts,
    unranked: unrankedLifts(input.exercises, sets),
    muscles,
    overall: overallRank(muscles),
    activities,
    totals,
    missing: { sex: input.sex === null, bodyweight: !(input.bodyweightKg && input.bodyweightKg > 0) },
  }
}

export interface RankUp {
  kind: 'overall' | 'lift' | 'muscle' | 'activity'
  label: string
  /** Null when the badge is new. */
  from: RankNumber | null
  to: RankNumber
}

export interface WorkoutRewards {
  xp: SessionXp | null
  rankUps: RankUp[]
  /** XP level before and after this workout. */
  levelBefore: number
  levelAfter: number
}

/** The history up to and including one workout (later workouts left out). */
function upTo(input: ProfileInput, session: BegunSession, include: boolean): ProfileInput {
  const keep = (s: BegunSession) => s.started_at < session.started_at || (s.started_at === session.started_at && s.id < session.id) || (include && s.id === session.id)
  const sessions = input.sessions.filter(keep)
  const ids = new Set(sessions.map((s) => s.id))
  return { ...input, sessions, sets: input.sets.filter((s) => ids.has(s.session_id)) }
}

/** What one workout earned: its XP, and every badge that is new or ranked up because of it. */
export function workoutRewards(input: ProfileInput, sessionId: string): WorkoutRewards | null {
  const session = input.sessions.find((s) => s.id === sessionId)
  if (!session) return null
  const before = buildProfile(upTo(input, session, false))
  const after = buildProfile(upTo(input, session, true))
  const rankUps: RankUp[] = []
  const compare = (kind: RankUp['kind'], label: string, from: RankNumber | null | undefined, to: RankNumber | null | undefined) => {
    if (to && (!from || to > from)) rankUps.push({ kind, label, from: from ?? null, to })
  }

  compare('overall', 'Overall', before.overall?.rank, after.overall?.rank)
  const liftsBefore = new Map(before.lifts.map((b) => [b.exercise.id, b.rank]))
  for (const lift of after.lifts) compare('lift', lift.exercise.name, liftsBefore.get(lift.exercise.id), lift.rank)
  for (const [muscle, rank] of Object.entries(after.muscles) as [Muscle, MuscleRank][]) {
    compare('muscle', muscleLabel(muscle), before.muscles[muscle]?.rank, rank.rank)
  }
  const activitiesBefore = new Map(before.activities.map((a) => [a.def.key, a.rank]))
  for (const activity of after.activities) compare('activity', activity.def.label, activitiesBefore.get(activity.def.key), activity.rank)

  return {
    xp: after.history.find((h) => h.sessionId === sessionId) ?? null,
    rankUps,
    levelBefore: before.xp.level,
    levelAfter: after.xp.level,
  }
}
