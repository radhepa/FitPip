// Small builders for the rank, XP and profile tests.
import type { BegunSession, Category, Equipment, Exercise, Muscle, SetRow, Tracking } from '../types/db'

export function ex(id: string, name: string, opts: Partial<{ equipment: Equipment; category: Category; tracking: Tracking; primary: Muscle[]; secondary: Muscle[] }> = {}): Exercise {
  return {
    id,
    user_id: 'u',
    name,
    equipment: opts.equipment ?? 'barbell',
    category: opts.category ?? 'strength',
    tracking: opts.tracking ?? 'reps',
    primary_muscles: opts.primary ?? [],
    secondary_muscles: opts.secondary ?? [],
    external_id: null,
    image_url: null,
    instructions: [],
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }
}

export function session(id: string, day: number, finished = true): BegunSession {
  const started = new Date(Date.UTC(2026, 0, day, 17)).toISOString()
  return {
    id,
    user_id: 'u',
    name: null,
    started_at: started,
    ended_at: finished ? new Date(Date.UTC(2026, 0, day, 18)).toISOString() : null,
    notes: null,
    template_id: null,
    plan: null,
    created_at: started,
    updated_at: started,
  }
}

let counter = 0
export function set(sessionId: string, exerciseId: string, values: Partial<Pick<SetRow, 'weight' | 'reps' | 'duration_seconds' | 'distance_m'>>): SetRow {
  counter += 1
  return {
    id: `set-${counter}`,
    user_id: 'u',
    session_id: sessionId,
    exercise_id: exerciseId,
    set_order: counter,
    reps: values.reps ?? 0,
    weight: values.weight ?? 0,
    rpe: null,
    duration_seconds: values.duration_seconds ?? null,
    distance_m: values.distance_m ?? null,
    created_at: new Date(Date.UTC(2026, 0, 1, 0, 0, counter)).toISOString(),
    updated_at: new Date(Date.UTC(2026, 0, 1, 0, 0, counter)).toISOString(),
  }
}
