// Your data as spreadsheet files (CSV). Pure: the caller reads the rows and saves the text.
import type { BegunSession, BodyWeight, Exercise, SetRow, WeightUnit } from '../types/db'
import { localDateIso } from './bodyWeight'
import { sessionTitle } from './format'

/**
 * One CSV field. Quoted when it holds a comma, quote or line break; a leading = + - @ gets a ' so a
 * spreadsheet shows the text instead of running it as a formula (names are typed by hand).
 */
export function csvField(value: string | number | null): string {
  if (value === null) return ''
  let text = String(value)
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const csv = (rows: (string | number | null)[][]) => rows.map((row) => row.map(csvField).join(',')).join('\r\n') + '\r\n'

const localTime = (iso: string) => {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Every logged set, oldest workout first, one row each. Weights are as logged, in `unit`. */
export function workoutsCsv(input: { sessions: BegunSession[]; sets: SetRow[]; exercises: Exercise[]; unit: WeightUnit }): string {
  const exerciseById = new Map(input.exercises.map((e) => [e.id, e]))
  const setsBySession = new Map<string, SetRow[]>()
  for (const set of input.sets) setsBySession.set(set.session_id, [...(setsBySession.get(set.session_id) ?? []), set])
  const sessions = [...input.sessions].sort((a, b) => a.started_at.localeCompare(b.started_at))

  const rows: (string | number | null)[][] = [
    ['Date', 'Start', 'Workout', 'Exercise', 'Kind', 'Set', `Weight (${input.unit})`, 'Reps', 'RPE', 'Seconds', 'Distance (m)'],
  ]
  for (const session of sessions) {
    const sets = (setsBySession.get(session.id) ?? []).sort((a, b) => a.set_order - b.set_order || a.created_at.localeCompare(b.created_at))
    const perExercise = new Map<string, number>()
    for (const set of sets) {
      const exercise = exerciseById.get(set.exercise_id)
      const number = (perExercise.get(set.exercise_id) ?? 0) + 1
      perExercise.set(set.exercise_id, number)
      const lift = !exercise || exercise.tracking === 'reps'
      rows.push([
        localDateIso(new Date(session.started_at)),
        localTime(session.started_at),
        sessionTitle(session),
        exercise?.name ?? 'Deleted exercise',
        exercise?.category ?? null,
        number,
        lift ? set.weight : null,
        lift ? set.reps : null,
        set.rpe,
        set.duration_seconds,
        set.distance_m,
      ])
    }
  }
  return csv(rows)
}

/** Every weigh-in, oldest first, in the unit it was logged in. */
export function weighInsCsv(weights: BodyWeight[]): string {
  const rows: (string | number | null)[][] = [['Date', 'Weight', 'Unit', 'Note']]
  for (const w of [...weights].sort((a, b) => a.measured_on.localeCompare(b.measured_on))) rows.push([w.measured_on, w.weight, w.unit, w.note])
  return csv(rows)
}
