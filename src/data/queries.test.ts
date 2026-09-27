import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import type { Session, SetRow } from '../types/db'
import { setActiveDbForTests } from './local/context'
import { FitPipDB } from './local/db'
import { getOpenSession, listSessionsSince, listSessionSummaries } from './sessions'
import { lastSessionSetsForExercise, listSetsForSessions } from './sets'

let n = 0
const dbs: FitPipDB[] = []
function device() {
  const db = new FitPipDB(`queries-test-${++n}`)
  dbs.push(db)
  setActiveDbForTests(db, 'user-1')
  return db
}
afterEach(async () => {
  await Promise.all(dbs.splice(0).map((db) => db.delete()))
})

const day = (d: number, hour = 9) => new Date(Date.UTC(2026, 8, d, hour)).toISOString()

function session(id: string, started: string | null, ended: string | null, created = started ?? day(1)): Session {
  return { id, user_id: 'user-1', name: null, started_at: started, ended_at: ended, notes: null, template_id: null, plan: [], created_at: created, updated_at: created }
}

function set(id: string, sessionId: string, exerciseId = 'bench', order = 0, created = day(1)): SetRow {
  return { id, user_id: 'user-1', session_id: sessionId, exercise_id: exerciseId, set_order: order, reps: 5, weight: 100, rpe: null, duration_seconds: null, distance_m: null, created_at: created, updated_at: created }
}

/** Ten finished workouts on the 10th..19th, one in progress on the 20th and one still being set up. */
async function seed(db: FitPipDB) {
  const finished = Array.from({ length: 10 }, (_, i) => session(`s${10 + i}`, day(10 + i), day(10 + i, 10)))
  await db.sessions.bulkPut([...finished, session('running', day(20), null), session('draft', null, null, day(21))])
  await db.sets.bulkPut(finished.flatMap((s, i) => [set(`${s.id}-b`, s.id, 'bench', 1, s.started_at!), set(`${s.id}-a`, s.id, 'bench', 0, s.started_at!), set(`${s.id}-r`, s.id, `row-${i}`)]))
}

describe('workout queries', () => {
  it('pages finished workouts newest first and leaves out unfinished ones', async () => {
    await seed(device())
    const first = await listSessionSummaries(4)
    expect(first.map((s) => s.session.id)).toEqual(['s19', 's18', 's17', 's16'])
    expect(first[0].sets.map((s) => s.id).sort()).toEqual(['s19-a', 's19-b', 's19-r'])
    const next = await listSessionSummaries(4, first.at(-1)!.session.started_at)
    expect(next.map((s) => s.session.id)).toEqual(['s15', 's14', 's13', 's12'])
    const last = await listSessionSummaries(4, next.at(-1)!.session.started_at)
    expect(last.map((s) => s.session.id)).toEqual(['s11', 's10'])
  })

  it('lists begun workouts since a moment, newest first, without drafts', async () => {
    await seed(device())
    expect((await listSessionsSince(day(17))).map((s) => s.id)).toEqual(['running', 's19', 's18', 's17'])
    expect((await listSessionsSince('')).length).toBe(11)
  })

  it('finds the newest open workout, set up or running', async () => {
    await seed(device())
    expect((await getOpenSession())?.id).toBe('draft')
  })

  it('reads sets for a few or for many workouts in the same order', async () => {
    const db = device()
    await seed(db)
    // Enough workouts to take the read-everything path as well as the per-workout one.
    const many = Array.from({ length: 30 }, (_, i) => session(`m${String(i).padStart(2, '0')}`, day(1, i % 20), day(1, 23)))
    await db.sessions.bulkPut(many)
    await db.sets.bulkPut(many.map((s, i) => set(`m-set-${29 - i}`, s.id)))

    const few = await listSetsForSessions(['s12', 's11'])
    expect(few.map((s) => s.id)).toEqual(['s11-a', 's11-b', 's11-r', 's12-a', 's12-b', 's12-r'])

    const ids = [...many.map((s) => s.id), 's10']
    const all = await listSetsForSessions(ids)
    const expected = await db.sets.where('session_id').anyOf(ids).toArray()
    expect(all.map((s) => s.id)).toEqual(expected.map((s) => s.id))
    expect(all).toHaveLength(33)
  })

  it('prefills from the latest earlier workout with that exercise', async () => {
    await seed(device())
    const last = await lastSessionSetsForExercise('bench', 's19')
    expect(last.map((s) => s.id)).toEqual(['s18-a', 's18-b'])
  })
})
