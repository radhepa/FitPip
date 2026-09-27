// XP and personal records, worked out from the whole history, oldest workout first.
import { XP_LEVEL_STEP, XP_RULES } from '../config/xp'
import type { BegunSession, Exercise, SetRow } from '../types/db'
import { estimate1RM } from './e1rm'

/** What a record is measured in: estimated 1RM, reps at bodyweight, longest hold/effort, farthest. */
export type RecordKind = 'e1rm' | 'reps' | 'seconds' | 'metres'

export interface RecordEvent {
  exerciseId: string
  kind: RecordKind
  value: number
  previous: number
}

export interface SessionXp {
  sessionId: string
  startedAt: string
  /** XP from the sets themselves. */
  fromSets: number
  finished: number
  records: RecordEvent[]
  /** Exercises done for the first time in this workout. */
  firstTimes: string[]
  total: number
}

type Kind = Pick<Exercise, 'tracking' | 'category'>

/** XP for one set. */
export function setXp(set: Pick<SetRow, 'reps' | 'duration_seconds' | 'distance_m'>, exercise: Kind): number {
  let xp = 0
  if (exercise.tracking === 'reps') {
    xp = set.reps > 0 ? XP_RULES.liftSet : 0
  } else if (set.duration_seconds) {
    xp = (exercise.tracking === 'time' ? XP_RULES.timedSetBase : 0) + (set.duration_seconds / 60) * XP_RULES.perActiveMinute
  } else if (set.distance_m) {
    xp = (Number(set.distance_m) / 1000) * XP_RULES.perKmWithoutTime * (exercise.category === 'swim' ? 4 : 1)
  }
  return Math.min(XP_RULES.maxPerSet, Math.round(xp))
}

/** The measures a set can set a record in, with its value in each. */
export function measures(set: Pick<SetRow, 'weight' | 'reps' | 'duration_seconds' | 'distance_m'>, exercise: Kind): [RecordKind, number][] {
  if (exercise.tracking === 'reps') {
    if (set.reps < 1) return []
    return set.weight > 0 ? [['e1rm', estimate1RM(set.weight, set.reps)]] : [['reps', set.reps]]
  }
  const out: [RecordKind, number][] = []
  if (set.duration_seconds) out.push(['seconds', set.duration_seconds])
  if (set.distance_m) out.push(['metres', Number(set.distance_m)])
  return out
}

/** XP for every workout that has begun, oldest first, with the records and first times in each. */
export function xpHistory(input: { exercises: Exercise[]; sessions: BegunSession[]; sets: SetRow[] }): SessionXp[] {
  const exerciseById = new Map(input.exercises.map((e) => [e.id, e]))
  const setsBySession = new Map<string, SetRow[]>()
  for (const set of input.sets) setsBySession.set(set.session_id, [...(setsBySession.get(set.session_id) ?? []), set])

  const seen = new Set<string>()
  const bests = new Map<string, number>() // `${exerciseId}/${kind}` -> best so far
  const ordered = [...input.sessions].sort((a, b) => a.started_at.localeCompare(b.started_at) || a.id.localeCompare(b.id))

  return ordered.map((session) => {
    const sets = setsBySession.get(session.id) ?? []
    let fromSets = 0
    const sessionBests = new Map<string, number>()
    for (const set of sets) {
      const exercise = exerciseById.get(set.exercise_id)
      if (!exercise) continue
      fromSets += setXp(set, exercise)
      for (const [kind, value] of measures(set, exercise)) {
        const key = `${set.exercise_id}/${kind}`
        sessionBests.set(key, Math.max(sessionBests.get(key) ?? 0, value))
      }
    }

    const records: RecordEvent[] = []
    const exercisesHere = new Set(sets.filter((s) => exerciseById.has(s.exercise_id)).map((s) => s.exercise_id))
    const firstTimes = [...exercisesHere].filter((id) => !seen.has(id))
    for (const [key, value] of sessionBests) {
      const [exerciseId, kind] = key.split('/') as [string, RecordKind]
      const previous = bests.get(key)
      // The first time a measure is logged sets the bar; beating it later is a record.
      if (previous !== undefined && value > previous && seen.has(exerciseId) && !records.some((r) => r.exerciseId === exerciseId)) {
        records.push({ exerciseId, kind, value, previous })
      }
      if (previous === undefined || value > previous) bests.set(key, value)
    }
    for (const id of exercisesHere) seen.add(id)

    const finished = session.ended_at ? XP_RULES.finishedWorkout : 0
    const total = fromSets + finished + records.length * XP_RULES.personalRecord + firstTimes.length * XP_RULES.firstTime
    return { sessionId: session.id, startedAt: session.started_at, fromSets, finished, records, firstTimes, total }
  })
}

/** Total XP needed to reach `level` (level 1 needs none). */
export const xpToReach = (level: number): number => XP_LEVEL_STEP * level * (level - 1)

export interface LevelProgress {
  level: number
  /** XP earned since reaching this level. */
  into: number
  /** XP this level takes in total (from reaching it to reaching the next). */
  span: number
  progress: number
}

export function levelFor(xp: number): LevelProgress {
  const total = Math.max(0, xp)
  let level = Math.floor(0.5 + Math.sqrt(0.25 + total / XP_LEVEL_STEP))
  // Guard against floating-point edges right at a boundary.
  while (xpToReach(level + 1) <= total) level += 1
  while (level > 1 && xpToReach(level) > total) level -= 1
  const into = total - xpToReach(level)
  const span = xpToReach(level + 1) - xpToReach(level)
  return { level, into, span, progress: into / span }
}
