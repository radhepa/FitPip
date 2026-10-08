import type { Exercise } from '../types/db'
import { GUEST_USER_ID } from './local/context'
import { getMeta, setMeta, type FitPipDB } from './local/db'

export { GUEST_USER_ID }

// Guest mode is a try-it-out mode: the app runs entirely on the device, with a few starter exercises
// and nothing else, and never syncs. It is the same code path as a signed-in account, just without a server.

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

/** A few exercises so the picker isn't empty. No workouts, weigh-ins or plan: a guest starts blank. */
const starterExercises = () => [
  exercise('guest-bench', 'Bench Press', 'barbell', ['chest', 'triceps']),
  exercise('guest-squat', 'Back Squat', 'barbell', ['quads', 'glutes']),
  exercise('guest-row', 'Seated Cable Row', 'cable', ['upper_back', 'lats']),
  exercise('guest-rdl', 'Romanian Deadlift', 'barbell', ['hamstrings', 'glutes']),
  exercise('guest-raise', 'Lateral Raise', 'dumbbell', ['side_delts']),
]

// Guest databases made before 2026-10-08 were filled with sample workouts, sets, weigh-ins and a
// week plan, which looked like someone else's history. Those rows had fixed ids, so they can be
// removed without touching anything the guest logged themselves.
const OLD_DEMO_IDS = {
  sessions: [1, 2, 3].map((n) => `guest-session-${n}`),
  sets: Array.from({ length: 9 }, (_, i) => `guest-set-${i + 1}`),
  body_weights: ['guest-weight-6', 'guest-weight-1'],
  week_plan_items: [1, 3, 5, 6].map((d) => `guest-plan-${d}`),
}

/** Gives a brand-new guest database its starter exercises and clears the old sample history. Never queued for the server. */
export async function seedGuestIfNew(db: FitPipDB): Promise<void> {
  const seeded = await getMeta<boolean>(db, 'guestSeeded')
  const cleared = await getMeta<boolean>(db, 'guestDemoCleared')
  if (seeded && cleared) return
  await db.transaction('rw', db.tables, async () => {
    if (!seeded) await db.exercises.bulkPut(starterExercises())
    await db.sets.bulkDelete(OLD_DEMO_IDS.sets)
    await db.sets.where('session_id').anyOf(OLD_DEMO_IDS.sessions).delete()
    await db.sessions.bulkDelete(OLD_DEMO_IDS.sessions)
    await db.body_weights.bulkDelete(OLD_DEMO_IDS.body_weights)
    await db.week_plan_items.bulkDelete(OLD_DEMO_IDS.week_plan_items)
    await setMeta(db, 'guestSeeded', true)
    await setMeta(db, 'guestDemoCleared', true)
  })
}
