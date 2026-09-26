import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createExercise, deleteExercise, listExercises, updateExercise } from '../exercises'
import { setActiveDbForTests } from '../local/context'
import { FitPipDB } from '../local/db'
import { beginSession, createWorkout, deleteSession, finishSession, getSession, listSessionSummaries } from '../sessions'
import { deleteSet, listSetsForSession, logSet, restoreSet, updateSet } from '../sets'
import { getSettings, saveWeightUnit } from '../settings'
import { listBodyWeights, saveBodyWeight } from '../bodyWeights'
import { errorMessage } from '../unwrap'
import { countPending, discardFailed, retryFailed, runSync } from './engine'
import { FakeServer } from './fakeServer'
import { SyncFailure } from './remote'
import type { ExerciseInput } from '../exercises'

let counter = 0
let server: FakeServer
const devices: FitPipDB[] = []

const newDevice = (): FitPipDB => {
  const db = new FitPipDB(`sync-test-${++counter}`)
  devices.push(db)
  return db
}
/** Acts as this device from now on. */
const as = (db: FitPipDB, userId = 'user-1') => setActiveDbForTests(db, userId)
const sync = (db: FitPipDB) => {
  as(db)
  return runSync(db, server.remote())
}

const curl = (name = 'Curl'): ExerciseInput => ({ name, primary_muscles: ['biceps'], secondary_muscles: [], equipment: 'dumbbell', category: 'strength', tracking: 'reps' })
const upserts = () => server.calls.filter((c) => c.op === 'upsert').map((c) => c.table)

/** A finished workout with two sets of one exercise, made on the current device. */
async function logWorkout() {
  const exercise = await createExercise(curl())
  const session = await createWorkout({ plan: [] })
  await beginSession(session.id)
  const first = await logSet({ sessionId: session.id, exerciseId: exercise.id, setOrder: 0, reps: 8, weight: 20, rpe: null })
  const second = await logSet({ sessionId: session.id, exerciseId: exercise.id, setOrder: 1, reps: 8, weight: 25, rpe: 8 })
  await finishSession(session.id)
  return { exercise, session, first, second }
}

beforeEach(() => {
  server = new FakeServer()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-03-01T09:00:00.000Z'))
})

afterEach(async () => {
  vi.useRealTimers()
  await Promise.all(devices.splice(0).map((db) => db.delete()))
})

describe('pushing local changes', () => {
  it('keeps everything queued while offline, then sends it parents before children', async () => {
    const a = newDevice()
    as(a)
    await logWorkout()
    server.online = false
    await expect(sync(a)).rejects.toMatchObject({ kind: 'network' })
    expect(server.count('sets')).toBe(0)
    expect((await countPending(a)).pending).toBe(4) // exercise, session, two sets

    server.online = true
    const outcome = await sync(a)
    expect(outcome.pushed).toBe(4)
    expect(upserts()).toEqual(['exercises', 'sessions', 'sets'])
    expect(server.count('exercises')).toBe(1)
    expect(server.count('sets')).toBe(2)
    expect(await countPending(a)).toEqual({ pending: 0, failed: 0 })
  })

  it('merges repeated edits of one row into a single request', async () => {
    const a = newDevice()
    as(a)
    const { first: set } = await logWorkout()
    await updateSet(set.id, { weight: 30 })
    await updateSet(set.id, { weight: 35 })
    await sync(a)
    const setCalls = server.calls.filter((c) => c.op === 'upsert' && c.table === 'sets')
    expect(setCalls).toHaveLength(1)
    expect(server.tables.sets.get(set.id)?.weight).toBe(35)
  })

  it('never contacts the server about a row that was created and deleted before syncing', async () => {
    const a = newDevice()
    as(a)
    const exercise = await createExercise(curl('Scratch'))
    await deleteExercise(exercise.id)
    expect(await countPending(a)).toEqual({ pending: 0, failed: 0 })
    await sync(a)
    expect(server.calls.some((c) => c.op === 'upsert' || c.op === 'remove')).toBe(false)
  })

  it('sends nothing on a second sync, and reports no change', async () => {
    const a = newDevice()
    as(a)
    await logWorkout()
    await sync(a)
    server.calls = []
    const outcome = await sync(a)
    expect(outcome).toEqual({ changed: false, pushed: 0, rejected: 0 })
    expect(server.calls.some((c) => c.op === 'upsert' || c.op === 'remove')).toBe(false)
  })
})

describe('a second device', () => {
  it('downloads everything on its first sync', async () => {
    const a = newDevice()
    const b = newDevice()
    as(a)
    const { session } = await logWorkout()
    await saveWeightUnit('kg')
    await sync(a)

    const outcome = await sync(b)
    expect(outcome.changed).toBe(true)
    expect((await listExercises()).map((e) => e.name)).toEqual(['Curl'])
    expect(await listSetsForSession(session.id)).toHaveLength(2)
    expect((await getSettings()).weight_unit).toBe('kg')
    expect((await listSessionSummaries(10))[0].session.id).toBe(session.id)
  })

  it('pages through more rows than one request returns, even when they share a timestamp', async () => {
    server.sameStamp = true
    const rows = Array.from({ length: 1200 }, (_, i) => ({
      id: `ex-${String(i).padStart(4, '0')}`,
      user_id: 'user-1',
      name: `Exercise ${i}`,
      primary_muscles: ['chest'],
      secondary_muscles: [],
      equipment: 'other',
      category: 'strength',
      tracking: 'reps',
      external_id: null,
      image_url: null,
      instructions: [],
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }))
    await server.remote().upsert('exercises', rows)
    const b = newDevice()
    await sync(b)
    expect(await b.exercises.count()).toBe(1200)
  })

  it('learns about deletions, including what the server deleted along with a workout', async () => {
    const a = newDevice()
    const b = newDevice()
    as(a)
    const { session, exercise } = await logWorkout()
    await sync(a)
    await sync(b)
    expect(await b.sets.count()).toBe(2)

    as(a)
    await deleteSession(session.id)
    expect(await a.sets.count()).toBe(0)
    await sync(a)
    expect(server.count('sessions')).toBe(0)
    expect(server.count('sets')).toBe(0)

    const outcome = await sync(b)
    expect(outcome.changed).toBe(true)
    expect(await b.sessions.count()).toBe(0)
    expect(await b.sets.count()).toBe(0)
    expect(await b.exercises.get(exercise.id)).toBeDefined()
  })

  it("does not bring back a row that was deleted here while the delete was still waiting to be sent", async () => {
    const a = newDevice()
    as(a)
    const exercise = await createExercise(curl())
    await sync(a)
    await deleteExercise(exercise.id)
    // A pull happens before the push in every sync, and the server still has the row at that point.
    await sync(a)
    expect(server.count('exercises')).toBe(0)
    expect(await a.exercises.count()).toBe(0)
  })
})

describe('conflicts (last write wins)', () => {
  async function twoDevicesWithOneSet() {
    const a = newDevice()
    const b = newDevice()
    as(a)
    const made = await logWorkout()
    await sync(a)
    await sync(b)
    return { a, b, ...made }
  }

  it('keeps my later offline edit over an earlier edit from the other device', async () => {
    const { a, b, first } = await twoDevicesWithOneSet()

    vi.setSystemTime(new Date('2026-03-01T10:00:00Z'))
    as(b)
    await updateSet(first.id, { weight: 100 })
    await sync(b)

    vi.setSystemTime(new Date('2026-03-01T11:00:00Z'))
    as(a)
    await updateSet(first.id, { weight: 200 })
    vi.setSystemTime(new Date('2026-03-01T12:00:00Z'))
    await sync(a)

    expect(server.tables.sets.get(first.id)?.weight).toBe(200)
    expect((await a.sets.get(first.id))?.weight).toBe(200)
  })

  it("drops my earlier offline edit in favour of the other device's later one", async () => {
    const { a, b, first } = await twoDevicesWithOneSet()

    vi.setSystemTime(new Date('2026-03-01T10:00:00Z'))
    as(a)
    await updateSet(first.id, { weight: 200 }) // offline

    vi.setSystemTime(new Date('2026-03-01T11:00:00Z'))
    as(b)
    await updateSet(first.id, { weight: 100 })
    await sync(b)

    vi.setSystemTime(new Date('2026-03-01T12:00:00Z'))
    const outcome = await sync(a)
    expect(outcome.changed).toBe(true)
    expect((await a.sets.get(first.id))?.weight).toBe(100)
    expect(server.tables.sets.get(first.id)?.weight).toBe(100)
    expect(await countPending(a)).toEqual({ pending: 0, failed: 0 })
  })

  it('lets a deletion elsewhere win over my unsent edit', async () => {
    const { a, b, first } = await twoDevicesWithOneSet()
    as(a)
    await updateSet(first.id, { weight: 999 })
    as(b)
    await deleteSet(first.id)
    await sync(b)
    await sync(a)
    expect(await a.sets.get(first.id)).toBeUndefined()
    expect(server.tables.sets.has(first.id)).toBe(false)
    expect(await countPending(a)).toEqual({ pending: 0, failed: 0 })
  })

  it('drops sets I logged offline into a workout that was deleted on the other device', async () => {
    const { a, b, session, exercise } = await twoDevicesWithOneSet()
    as(a)
    await logSet({ sessionId: session.id, exerciseId: exercise.id, setOrder: 5, reps: 5, weight: 50, rpe: null })
    as(b)
    await deleteSession(session.id)
    await sync(b)
    server.calls = []
    await sync(a)
    expect(await a.sessions.count()).toBe(0)
    expect(await a.sets.count()).toBe(0)
    expect(server.calls.some((c) => c.op === 'upsert')).toBe(false)
  })

  it('leaves one weigh-in for a day that two devices both weighed in on', async () => {
    const a = newDevice()
    const b = newDevice()
    vi.setSystemTime(new Date('2026-03-01T10:00:00Z'))
    as(a)
    await saveBodyWeight('user-1', { measuredOn: '2026-03-01', weight: 100, unit: 'kg' })
    await sync(a)

    vi.setSystemTime(new Date('2026-03-01T11:00:00Z'))
    as(b)
    await saveBodyWeight('user-1', { measuredOn: '2026-03-01', weight: 99, unit: 'kg' }) // b has not synced yet
    await sync(b)
    await sync(a)
    await sync(b)

    for (const device of [a, b]) {
      as(device)
      const list = await listBodyWeights()
      expect(list).toHaveLength(1)
      expect(list[0].weight).toBe(99)
    }
    expect(server.count('body_weights')).toBe(1)
  })
})

describe('changes made while a request is in flight', () => {
  it('keeps an edit made during the send and sends it next time', async () => {
    const a = newDevice()
    as(a)
    const { first: set } = await logWorkout()
    let once = true
    server.duringUpsert = async () => {
      if (!once) return
      once = false
      vi.setSystemTime(new Date('2026-03-01T09:30:00Z'))
      await updateSet(set.id, { weight: 200 })
    }
    await sync(a)
    // The set was sent with weight 20, then edited: its entry must still be waiting.
    expect((await countPending(a)).pending).toBe(1)
    await sync(a)
    expect(server.tables.sets.get(set.id)?.weight).toBe(200)
    expect(await countPending(a)).toEqual({ pending: 0, failed: 0 })
  })

  it('deletes on the server a row that was deleted while it was being sent', async () => {
    const a = newDevice()
    as(a)
    const exercise = await createExercise(curl())
    server.duringUpsert = async () => {
      server.duringUpsert = null
      await deleteExercise(exercise.id)
    }
    await sync(a)
    expect(await a.exercises.count()).toBe(0)
    await sync(a)
    expect(server.count('exercises')).toBe(0)
  })
})

describe('changes the server refuses', () => {
  const refuse = (name: string) => {
    server.rejectRow = (table, row) => (table === 'exercises' && row.name === name ? new SyncFailure('permanent', 'not allowed', '23514') : null)
  }

  it('holds back only the refused row and sends the rest of the batch', async () => {
    const a = newDevice()
    as(a)
    await createExercise(curl('Good one'))
    await createExercise(curl('Bad'))
    await createExercise(curl('Good two'))
    refuse('Bad')
    const outcome = await sync(a)
    expect(outcome.rejected).toBe(1)
    expect([...server.tables.exercises.values()].map((r) => r.name).sort()).toEqual(['Good one', 'Good two'])
    expect(await countPending(a)).toEqual({ pending: 0, failed: 1 })
  })

  it('does not resend a refused row until asked to retry', async () => {
    const a = newDevice()
    as(a)
    await createExercise(curl('Bad'))
    refuse('Bad')
    await sync(a)
    server.calls = []
    await sync(a)
    expect(server.calls.some((c) => c.op === 'upsert')).toBe(false)

    server.rejectRow = null
    await retryFailed(a)
    await sync(a)
    expect(server.count('exercises')).toBe(1)
    expect(await countPending(a)).toEqual({ pending: 0, failed: 0 })
  })

  it('discarding removes a refused new row and restores a refused edit from the server', async () => {
    const a = newDevice()
    as(a)
    const keep = await createExercise(curl('Keep'))
    await sync(a)
    vi.setSystemTime(new Date('2026-03-01T10:00:00Z'))
    await updateExercise(keep.id, curl('Bad')) // an edit the server will refuse
    await createExercise(curl('Bad too'))
    server.rejectRow = (table) => (table === 'exercises' ? new SyncFailure('permanent', 'not allowed', '23514') : null)
    await sync(a)
    expect((await countPending(a)).failed).toBe(2)

    expect(await discardFailed(a, server.remote())).toBe(2)
    expect((await a.exercises.toArray()).map((e) => e.name)).toEqual(['Keep'])
    expect(await countPending(a)).toEqual({ pending: 0, failed: 0 })
  })

  it('stops the whole sync (and keeps the queue) when the server is unreachable or busy', async () => {
    const a = newDevice()
    as(a)
    await createExercise(curl())
    server.rejectRow = () => new SyncFailure('transient', 'busy', '503')
    await expect(sync(a)).rejects.toMatchObject({ kind: 'transient' })
    expect(await countPending(a)).toEqual({ pending: 1, failed: 0 })
  })
})

describe('rules that match the server, so offline behaves the same', () => {
  it('refuses a duplicate exercise name, ignoring case', async () => {
    const a = newDevice()
    as(a)
    await createExercise(curl('Curl'))
    const error = await createExercise(curl('  curl ')).catch((e: unknown) => e)
    expect(errorMessage(error)).toBe('That already exists.')
  })

  it('refuses to delete an exercise that has logged sets', async () => {
    const a = newDevice()
    as(a)
    const { exercise } = await logWorkout()
    const error = await deleteExercise(exercise.id).catch((e: unknown) => e)
    expect(errorMessage(error)).toMatch(/still in use/)
  })

  it('rejects impossible set values now instead of at sync time', async () => {
    const a = newDevice()
    as(a)
    const { session, exercise } = await logWorkout()
    const base = { sessionId: session.id, exerciseId: exercise.id, setOrder: 9, reps: 5, weight: 10, rpe: null }
    await expect(logSet({ ...base, weight: -1 })).rejects.toThrow(/Weight/)
    await expect(logSet({ ...base, reps: 2.5 })).rejects.toThrow(/Reps/)
    await expect(logSet({ ...base, rpe: 8.25 })).rejects.toThrow(/RPE/)
    expect((await logSet({ ...base, weight: 62.556 })).weight).toBe(62.56)
  })

  it('will not finish a workout that was never begun', async () => {
    const a = newDevice()
    as(a)
    const session = await createWorkout({ plan: [] })
    await expect(finishSession(session.id)).rejects.toThrow(/Begin the workout/)
    expect((await getSession(session.id))?.ended_at).toBeNull()
  })
})

describe('undoing a deleted set', () => {
  async function synced() {
    const a = newDevice()
    const b = newDevice()
    as(a)
    const made = await logWorkout()
    await sync(a)
    await sync(b)
    const row = (await a.sets.get(made.first.id))!
    return { a, b, row, ...made }
  }

  it('keeps the set on the server when the undo comes before the delete was sent', async () => {
    const { a, row } = await synced()
    as(a)
    await deleteSet(row.id)
    await restoreSet(row)
    await sync(a)
    expect(server.tables.sets.has(row.id)).toBe(true)
    expect((await a.sets.get(row.id))?.weight).toBe(row.weight)
    expect(await countPending(a)).toEqual({ pending: 0, failed: 0 })
  })

  it('still deletes it everywhere after delete, undo, delete again', async () => {
    const { a, b, row } = await synced()
    as(a)
    await deleteSet(row.id)
    await restoreSet(row)
    await deleteSet(row.id)
    await sync(a)
    expect(server.tables.sets.has(row.id)).toBe(false)
    await sync(b)
    expect(await b.sets.get(row.id)).toBeUndefined()
  })

  it('brings it back on the server and on the other device when the delete had already synced', async () => {
    const { a, b, row } = await synced()
    as(a)
    await deleteSet(row.id)
    await sync(a)
    await sync(b)
    expect(await b.sets.get(row.id)).toBeUndefined()

    as(a)
    await restoreSet(row)
    await sync(a)
    expect(server.tables.sets.has(row.id)).toBe(true)
    await sync(b)
    expect((await b.sets.get(row.id))?.reps).toBe(row.reps)
    expect((await b.sets.get(row.id))?.set_order).toBe(row.set_order)
  })

  it("won't restore a set into a workout that no longer exists", async () => {
    const { a, row, session } = await synced()
    as(a)
    await deleteSession(session.id)
    await expect(restoreSet(row)).rejects.toThrow(/no longer exists/)
  })
})

describe('editing a finished workout', () => {
  it('never changes its recorded time', async () => {
    const a = newDevice()
    as(a)
    const { session, exercise, first } = await logWorkout()
    const before = (await getSession(session.id))!
    vi.setSystemTime(new Date('2026-03-05T09:00:00Z')) // days later
    await updateSet(first.id, { weight: 30 })
    await logSet({ sessionId: session.id, exerciseId: exercise.id, setOrder: 9, reps: 5, weight: 40, rpe: null })
    await deleteSet(first.id)
    const after = (await getSession(session.id))!
    expect(after.started_at).toBe(before.started_at)
    expect(after.ended_at).toBe(before.ended_at)
  })
})
