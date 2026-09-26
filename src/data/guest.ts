import type { BegunSession, BodyWeight, Exercise, SetRow } from '../types/db'
import { localDateIso } from '../lib/bodyWeight'
import { GUEST_USER_ID } from './local/context'
import { getMeta, setMeta, type FitPipDB } from './local/db'

export { GUEST_USER_ID }

// Guest mode is a try-it-out mode: the app runs entirely on the device, with a few demo workouts,
// and never syncs. It is the same code path as a signed-in account, just without a server.

const AUTH_KEY = 'fitpip.guest'

export function isGuestMode(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(AUTH_KEY) === 'true'
}

export function setGuestMode(active: boolean): void {
  if (typeof localStorage === 'undefined') return
  if (active) localStorage.setItem(AUTH_KEY, 'true')
  else localStorage.removeItem(AUTH_KEY)
  window.dispatchEvent(new Event('fitpip-auth-change'))
}

const isoDaysAgo = (days: number, hour = 17) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function exercise(id: string, name: string, equipment: Exercise['equipment'], primary: Exercise['primary_muscles']): Exercise {
  const now = new Date().toISOString()
  return {
    id,
    user_id: GUEST_USER_ID,
    name,
    equipment,
    category: 'strength',
    tracking: 'reps',
    primary_muscles: primary,
    secondary_muscles: [],
    external_id: null,
    image_url: null,
    instructions: [],
    created_at: now,
    updated_at: now,
  }
}

function demoData() {
  const exercises = [
    exercise('guest-bench', 'Bench Press', 'barbell', ['chest', 'triceps']),
    exercise('guest-squat', 'Back Squat', 'barbell', ['quads', 'glutes']),
    exercise('guest-row', 'Seated Cable Row', 'cable', ['upper_back', 'lats']),
    exercise('guest-rdl', 'Romanian Deadlift', 'barbell', ['hamstrings', 'glutes']),
    exercise('guest-raise', 'Lateral Raise', 'dumbbell', ['side_delts']),
  ]
  const sessions: BegunSession[] = [7, 4, 1].map((days, index) => {
    const started = isoDaysAgo(days)
    const ended = new Date(new Date(started).getTime() + (48 + index * 5) * 60_000).toISOString()
    return {
      id: `guest-session-${index + 1}`,
      user_id: GUEST_USER_ID,
      name: ['Upper body', 'Lower strength', 'Full body'][index],
      started_at: started,
      ended_at: ended,
      notes: null,
      template_id: null,
      plan: null,
      created_at: started,
      updated_at: ended,
    }
  })
  const rows = [
    ['guest-bench', 115, 8, 7], ['guest-bench', 120, 7, 8], ['guest-row', 100, 10, null],
    ['guest-squat', 165, 6, 7.5], ['guest-squat', 175, 5, 8.5], ['guest-rdl', 155, 8, 8],
    ['guest-bench', 125, 6, 9], ['guest-squat', 180, 5, 9], ['guest-raise', 20, 12, null],
  ] as const
  const sets: SetRow[] = rows.map(([exerciseId, weight, reps, rpe], index) => {
    const session = sessions[Math.floor(index / 3)]
    return {
      id: `guest-set-${index + 1}`,
      user_id: GUEST_USER_ID,
      session_id: session.id,
      exercise_id: exerciseId,
      set_order: index % 3,
      weight,
      reps,
      rpe,
      duration_seconds: null,
      distance_m: null,
      created_at: session.started_at,
      updated_at: session.started_at,
    }
  })
  // Two weigh-ins so the profile can rank the demo lifts.
  const weights: BodyWeight[] = [[6, 181.4], [1, 180.2]].map(([days, weight]) => {
    const at = isoDaysAgo(days, 8)
    return { id: `guest-weight-${days}`, user_id: GUEST_USER_ID, measured_on: localDateIso(new Date(at)), weight, unit: 'lb', note: null, created_at: at, updated_at: at }
  })
  return { exercises, sessions, sets, weights }
}

/** Puts the demo data into a brand-new guest database. Never queued for the server. */
export async function seedGuestIfNew(db: FitPipDB): Promise<void> {
  if (await getMeta<boolean>(db, 'guestSeeded')) return
  const { exercises, sessions, sets, weights } = demoData()
  await db.transaction('rw', db.tables, async () => {
    await db.exercises.bulkPut(exercises)
    await db.sessions.bulkPut(sessions)
    await db.sets.bulkPut(sets)
    await db.body_weights.bulkPut(weights)
    await setMeta(db, 'guestSeeded', true)
  })
}
