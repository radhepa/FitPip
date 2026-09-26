import type { BegunSession, Exercise, Session, SetRow, UserSettings } from '../types/db'

const AUTH_KEY = 'fitpip.guest'
const DATA_KEY = 'fitpip.guest-data.v1'
export const GUEST_USER_ID = 'guest-local'

interface GuestData {
  exercises: Exercise[]
  sessions: Session[]
  sets: SetRow[]
  settings: UserSettings
}

const isoDaysAgo = (days: number, hour = 17) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const stamped = () => new Date().toISOString()

export const DEFAULT_SETTINGS: UserSettings = { weight_unit: 'lb', distance_unit: 'mi', goal_weight: null, goal_weight_unit: null }

/** Guest stores written before activities existed lack the newer fields. */
function upgrade(data: GuestData): GuestData {
  return {
    ...data,
    exercises: data.exercises.map((e) => ({ ...e, category: e.category ?? 'strength', tracking: e.tracking ?? 'reps' })),
    sets: data.sets.map((s) => ({ ...s, duration_seconds: s.duration_seconds ?? null, distance_m: s.distance_m ?? null })),
    settings: { ...DEFAULT_SETTINGS, ...data.settings },
  }
}

function exercise(id: string, name: string, equipment: Exercise['equipment'], primary: Exercise['primary_muscles']): Exercise {
  const now = stamped()
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

function seed(): GuestData {
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
  const templates = [
    ['guest-bench', 115, 8, 7], ['guest-bench', 120, 7, 8], ['guest-row', 100, 10, null],
    ['guest-squat', 165, 6, 7.5], ['guest-squat', 175, 5, 8.5], ['guest-rdl', 155, 8, 8],
    ['guest-bench', 125, 6, 9], ['guest-squat', 180, 5, 9], ['guest-raise', 20, 12, null],
  ] as const
  const sets: SetRow[] = templates.map(([exerciseId, weight, reps, rpe], index) => {
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
  return { exercises, sessions, sets, settings: { ...DEFAULT_SETTINGS } }
}

export function isGuestMode(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(AUTH_KEY) === 'true'
}

export function setGuestMode(active: boolean): void {
  if (typeof localStorage === 'undefined') return
  if (active) localStorage.setItem(AUTH_KEY, 'true')
  else localStorage.removeItem(AUTH_KEY)
  window.dispatchEvent(new Event('fitpip-auth-change'))
}

export function readGuestData(): GuestData {
  if (typeof localStorage === 'undefined') return seed()
  const raw = localStorage.getItem(DATA_KEY)
  if (raw) {
    try { return upgrade(JSON.parse(raw) as GuestData) } catch { localStorage.removeItem(DATA_KEY) }
  }
  const data = seed()
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
  return data
}

export function writeGuestData(data: GuestData): void {
  localStorage.setItem(DATA_KEY, JSON.stringify(data))
}

/** Routines, the weekly plan and weigh-ins live in the account, not in the local guest store. */
export function assertAccount(feature = 'Routines and the weekly plan'): void {
  if (isGuestMode()) throw new Error(`${feature} need an account. Sign in to use them.`)
}
