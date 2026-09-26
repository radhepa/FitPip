import { planToRows } from '../lib/sessionPlan'
import type { PlanItem } from '../lib/workoutBlocks'
import type { BegunSession, Session, SetRow } from '../types/db'
import { invalidError, newId, nowIso, ownerId, putRow, removeCascaded, removeRow, rowsOf, writeTx } from './local/store'
import { listSetsForSessions } from './sets'

export interface SessionWithSets {
  session: BegunSession
  sets: SetRow[]
}

export interface NewWorkout {
  /** Shown as the workout's name (a template's name, or a suggestion's). */
  name?: string
  /** The template the plan was copied from, if any. */
  templateId?: string
  /** The exercises to set up the workout with. */
  plan: PlanItem[]
}

const isBegun = (session: Session): session is BegunSession => !!session.started_at

/**
 * Creates a workout that is set up but not begun: it has no start time, so no clock runs until
 * `beginSession`. The plan is a copy, so editing it never touches the template.
 */
export async function createWorkout(input: NewWorkout): Promise<Session> {
  const now = nowIso()
  const session: Session = {
    id: newId(),
    user_id: ownerId(),
    name: input.name ?? null,
    started_at: null,
    ended_at: null,
    notes: null,
    template_id: input.templateId ?? null,
    plan: planToRows(input.plan),
    created_at: now,
    updated_at: now,
  }
  await writeTx(() => putRow('sessions', session, { isNew: true }))
  return session
}

export async function getSession(id: string): Promise<Session | null> {
  return (await rowsOf('sessions').get(id)) ?? null
}

/** The newest workout that is set up or under way but not finished. */
export async function getOpenSession(): Promise<Session | null> {
  const open = await rowsOf('sessions').filter((session) => !session.ended_at).toArray()
  return open.sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
}

type SessionPatch = Partial<Pick<Session, 'name' | 'notes' | 'started_at' | 'ended_at' | 'plan'>>

export async function updateSession(id: string, patch: SessionPatch): Promise<Session> {
  return writeTx(async () => {
    const existing = await rowsOf('sessions').get(id)
    if (!existing) throw new Error('Workout not found.')
    const updated: Session = { ...existing, ...patch, updated_at: nowIso() }
    if (updated.name !== null && updated.name.length > 80) throw invalidError('A workout name can be up to 80 characters.')
    if (updated.ended_at && !updated.started_at) throw invalidError('Begin the workout before finishing it.')
    if (updated.ended_at && updated.started_at && updated.ended_at < updated.started_at) throw invalidError('A workout cannot end before it starts.')
    await putRow('sessions', updated, { isNew: false })
    return updated
  })
}

/** Saves the exercises set up for a workout. */
export const setSessionPlan = (id: string, plan: PlanItem[]) => updateSession(id, { plan: planToRows(plan) })

// Both times come from the client clock, so ended_at >= started_at always holds.
export const beginSession = (id: string) => updateSession(id, { started_at: nowIso() })
export const finishSession = (id: string) => updateSession(id, { ended_at: nowIso() })
export const reopenSession = (id: string) => updateSession(id, { ended_at: null })

export async function deleteSession(id: string): Promise<void> {
  await writeTx(async () => {
    // The server deletes a workout's sets with it, so they need no deletions of their own.
    await removeCascaded('sets', (await rowsOf('sets').where('session_id').equals(id).primaryKeys()) as string[])
    await removeRow('sessions', id)
  })
}

/** Every workout that has begun (finished or not) at or after the given moment. Workouts still being set up are left out. */
export async function listSessionsSince(sinceIso: string): Promise<BegunSession[]> {
  const sessions = await rowsOf('sessions').filter((session): boolean => isBegun(session) && session.started_at >= sinceIso).toArray()
  return (sessions as BegunSession[]).sort((a, b) => b.started_at.localeCompare(a.started_at))
}

/** Finished workouts, newest first, each with its sets. Pass `before` (a started_at) to page. */
export async function listSessionSummaries(limit: number, before?: string): Promise<SessionWithSets[]> {
  const finished = await rowsOf('sessions')
    .filter((session) => isBegun(session) && !!session.ended_at && (!before || session.started_at! < before))
    .toArray()
  const sessions = (finished as BegunSession[]).sort((a, b) => b.started_at.localeCompare(a.started_at)).slice(0, limit)
  const sets = await listSetsForSessions(sessions.map((session) => session.id))
  return sessions.map((session) => ({ session, sets: sets.filter((set) => set.session_id === session.id) }))
}
