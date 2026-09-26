import { supabase } from '../lib/supabase'
import { planToRows } from '../lib/sessionPlan'
import type { PlanItem } from '../lib/workoutBlocks'
import type { BegunSession, Session, SetRow } from '../types/db'
import { listSetsForSessions } from './sets'
import { assertOk, unwrap } from './unwrap'
import { GUEST_USER_ID, isGuestMode, readGuestData, writeGuestData } from './guest'

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

/**
 * Creates a workout that is set up but not begun: it has no start time, so no clock runs until
 * `beginSession`. The plan is a copy, so editing it never touches the template.
 */
export async function createWorkout(input: NewWorkout): Promise<Session> {
  const row = {
    id: crypto.randomUUID(),
    started_at: null,
    plan: planToRows(input.plan),
    name: input.name ?? null,
    template_id: input.templateId ?? null,
  }
  if (isGuestMode()) {
    const data = readGuestData()
    const now = new Date().toISOString()
    const session: Session = { user_id: GUEST_USER_ID, ended_at: null, notes: null, created_at: now, updated_at: now, ...row }
    data.sessions.push(session)
    writeGuestData(data)
    return session
  }
  return unwrap<Session>(await supabase.from('sessions').insert(row).select().single())
}

export async function getSession(id: string): Promise<Session | null> {
  if (isGuestMode()) return readGuestData().sessions.find((session) => session.id === id) ?? null
  return unwrap<Session | null>(await supabase.from('sessions').select('*').eq('id', id).maybeSingle())
}

/** The newest workout that is set up or under way but not finished. */
export async function getOpenSession(): Promise<Session | null> {
  if (isGuestMode()) return [...readGuestData().sessions].filter((session) => !session.ended_at).sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null
  return unwrap<Session | null>(
    await supabase
      .from('sessions')
      .select('*')
      .is('ended_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  )
}

type SessionPatch = Partial<Pick<Session, 'name' | 'notes' | 'started_at' | 'ended_at' | 'plan'>>

export async function updateSession(id: string, patch: SessionPatch): Promise<Session> {
  if (isGuestMode()) {
    const data = readGuestData()
    const index = data.sessions.findIndex((session) => session.id === id)
    if (index < 0) throw new Error('Workout not found.')
    data.sessions[index] = { ...data.sessions[index], ...patch, updated_at: new Date().toISOString() }
    writeGuestData(data)
    return data.sessions[index]
  }
  return unwrap<Session>(await supabase.from('sessions').update(patch).eq('id', id).select().single())
}

/** Saves the exercises set up for a workout. */
export const setSessionPlan = (id: string, plan: PlanItem[]) => updateSession(id, { plan: planToRows(plan) })

// Both times come from the client clock, so ended_at >= started_at always holds.
export const beginSession = (id: string) => updateSession(id, { started_at: new Date().toISOString() })
export const finishSession = (id: string) => updateSession(id, { ended_at: new Date().toISOString() })
export const reopenSession = (id: string) => updateSession(id, { ended_at: null })

export async function deleteSession(id: string): Promise<void> {
  if (isGuestMode()) {
    const data = readGuestData()
    data.sessions = data.sessions.filter((session) => session.id !== id)
    data.sets = data.sets.filter((set) => set.session_id !== id)
    writeGuestData(data)
    return
  }
  assertOk(await supabase.from('sessions').delete().eq('id', id))
}

/** Every workout that has begun (finished or not) at or after the given moment. Workouts still being set up are left out. */
export async function listSessionsSince(sinceIso: string): Promise<BegunSession[]> {
  if (isGuestMode()) return readGuestData().sessions.filter((session): session is BegunSession => !!session.started_at && session.started_at >= sinceIso)
  return unwrap<BegunSession[]>(await supabase.from('sessions').select('*').gte('started_at', sinceIso).order('started_at', { ascending: false }))
}

/** Finished workouts, newest first, each with its sets. Pass `before` (a started_at) to page. */
export async function listSessionSummaries(limit: number, before?: string): Promise<SessionWithSets[]> {
  if (isGuestMode()) {
    const data = readGuestData()
    return data.sessions
      .filter((session): session is BegunSession => !!session.started_at && !!session.ended_at && (!before || session.started_at < before))
      .sort((a, b) => b.started_at.localeCompare(a.started_at))
      .slice(0, limit)
      .map((session) => ({ session, sets: data.sets.filter((set) => set.session_id === session.id) }))
  }
  // A finished workout always has a start time (the database requires it), so these are all BegunSession.
  let query = supabase.from('sessions').select('*').not('ended_at', 'is', null)
  if (before) query = query.lt('started_at', before)

  const sessions = unwrap<BegunSession[]>(await query.order('started_at', { ascending: false }).limit(limit))
  const sets = await listSetsForSessions(sessions.map((s) => s.id))
  return sessions.map((session) => ({ session, sets: sets.filter((s) => s.session_id === session.id) }))
}
