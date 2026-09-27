// Builders for the Pip tests: a fixed "now" and workouts, sets and weigh-ins placed relative to it.
import type { BegunSession, BodyWeight, Exercise, SetRow } from '../../types/db'
import { localDateIso } from '../bodyWeight'
import { ex } from '../rankFixtures.test-utils'
import type { PipFactsInput } from './facts'

/** Saturday 26 Sep 2026, noon, local time. */
export const NOW = new Date(2026, 8, 26, 12, 0)

export const daysAgo = (days: number, hour = 17): Date => new Date(2026, 8, 26 - days, hour, 0)

let sessionCounter = 0
export function workout(daysBack: number, opts: { finished?: boolean; name?: string | null; hour?: number } = {}): BegunSession {
  sessionCounter += 1
  const started = daysAgo(daysBack, opts.hour ?? 17)
  const ended = new Date(started.getTime() + 55 * 60_000)
  return {
    id: `w${sessionCounter}`,
    user_id: 'u',
    name: opts.name === undefined ? 'Push day' : opts.name,
    started_at: started.toISOString(),
    ended_at: opts.finished === false ? null : ended.toISOString(),
    notes: null,
    template_id: null,
    plan: null,
    created_at: started.toISOString(),
    updated_at: ended.toISOString(),
  }
}

let setCounter = 0
export function logged(session: BegunSession, exercise: Exercise, values: { weight?: number; reps?: number; duration_seconds?: number; distance_m?: number }): SetRow {
  setCounter += 1
  return {
    id: `s${setCounter}`,
    user_id: 'u',
    session_id: session.id,
    exercise_id: exercise.id,
    set_order: setCounter,
    reps: values.reps ?? 0,
    weight: values.weight ?? 0,
    rpe: null,
    duration_seconds: values.duration_seconds ?? null,
    distance_m: values.distance_m ?? null,
    created_at: session.started_at,
    updated_at: session.started_at,
  }
}

export function weighIn(daysBack: number, weight: number, unit: 'lb' | 'kg' = 'lb'): BodyWeight {
  const at = daysAgo(daysBack, 8)
  return { id: `b${daysBack}`, user_id: 'u', measured_on: localDateIso(at), weight, unit, note: null, created_at: at.toISOString(), updated_at: at.toISOString() }
}

export const bench = ex('bench', 'Bench Press', { primary: ['chest'], secondary: ['triceps'] })
export const squat = ex('squat', 'Back Squat', { primary: ['quads', 'glutes'] })
export const cableRow = ex('crow', 'Single-Arm Cable Row', { equipment: 'cable', primary: ['lats', 'upper_back'] })
export const pullUp = ex('pull', 'Pull-Up', { equipment: 'bodyweight', primary: ['lats'] })
export const run = ex('run', 'Outdoor Run', { equipment: 'bodyweight', category: 'cardio', tracking: 'distance', primary: ['quads'] })
export const EXERCISES = [bench, squat, cableRow, pullUp, run]

export function input(overrides: Partial<PipFactsInput> = {}): PipFactsInput {
  return { now: NOW, unit: 'lb', distanceUnit: 'mi', displayName: null, goal: null, exercises: EXERCISES, sessions: [], sets: [], weights: [], plan: null, ...overrides }
}

/**
 * A believable month on a cut (215 lb heading for 180): five workouts a week apart, bench and squat
 * climbing, one run, single-arm rows, and a weigh-in each week. The last workout was two days ago and set a bench record.
 */
export function monthOnACut(overrides: Partial<PipFactsInput> = {}): PipFactsInput {
  const w = [workout(35), workout(28), workout(21), workout(14), workout(7), workout(2, { name: 'Upper body' })]
  const sets = [
    logged(w[0], bench, { weight: 115, reps: 8 }),
    logged(w[0], squat, { weight: 155, reps: 8 }),
    logged(w[1], bench, { weight: 120, reps: 8 }),
    logged(w[1], cableRow, { weight: 40, reps: 10 }),
    logged(w[2], bench, { weight: 125, reps: 8 }),
    logged(w[2], squat, { weight: 175, reps: 6 }),
    logged(w[3], bench, { weight: 135, reps: 6 }),
    logged(w[3], run, { duration_seconds: 1800, distance_m: 4000 }),
    logged(w[4], bench, { weight: 145, reps: 5 }),
    logged(w[4], squat, { weight: 195, reps: 5 }),
    logged(w[4], cableRow, { weight: 50, reps: 10 }),
    logged(w[5], bench, { weight: 155, reps: 5 }),
    logged(w[5], cableRow, { weight: 55, reps: 10 }),
  ]
  const weights = [weighIn(35, 215.4), weighIn(28, 214.2), weighIn(21, 213), weighIn(14, 211.6), weighIn(7, 210.4), weighIn(1, 209.8)]
  return input({ sessions: w, sets, weights, goal: { weight: 180, unit: 'lb' }, displayName: 'Alex Kim', ...overrides })
}
