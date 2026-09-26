import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { FitPipDB } from './local/db'
import { setActiveDbForTests } from './local/context'
import { finishOnboarding, getAssessment, hasFinishedOnboarding } from './onboarding'
import { getSettings, saveRestSeconds } from './settings'
import type { Assessment } from '../lib/assessment'

const dbs: FitPipDB[] = []
function device() {
  const db = new FitPipDB(`assessment-${crypto.randomUUID()}`)
  dbs.push(db)
  setActiveDbForTests(db, `user-${dbs.length}`)
  return db
}
afterEach(async () => { await Promise.all(dbs.splice(0).map((db) => db.delete())) })

const assessment: Assessment = { version: 1, age: 28, bodyweight: 80, unit: 'kg', sex: 'male',
  answers: { push_up: { weight: 0, reps: 25 }, bench: null, squat: null, deadlift: null, pull_up: null } }

describe('onboarding persistence', () => {
  it('shows once for an existing account and preserves unrelated settings and training', async () => {
    const db = device()
    await saveRestSeconds(90)
    expect(await hasFinishedOnboarding()).toBe(false)
    await finishOnboarding(assessment)
    expect(await hasFinishedOnboarding()).toBe(true)
    expect((await getAssessment())?.answers).toEqual(assessment)
    expect((await getSettings()).rest_seconds).toBe(90)
    expect(await db.sessions.count()).toBe(0)
    expect(await db.sets.count()).toBe(0)
    expect(await db.body_weights.count()).toBe(0)
  })
  it('keeps completion separate for each account and allows skipping without changing settings', async () => {
    device()
    await finishOnboarding(assessment)
    const other = device()
    expect(await hasFinishedOnboarding()).toBe(false)
    await finishOnboarding()
    expect(await hasFinishedOnboarding()).toBe(true)
    expect(await getAssessment()).toBeNull()
    expect(await other.user_settings.count()).toBe(0)
    expect(await other.pending.count()).toBe(0)
  })
  it('does not mark invalid answers complete or replace a saved result when a retake is skipped', async () => {
    device()
    await expect(finishOnboarding({ ...assessment, bodyweight: 0 })).rejects.toThrow()
    expect(await hasFinishedOnboarding()).toBe(false)
    await finishOnboarding(assessment)
    await finishOnboarding()
    expect((await getAssessment())?.answers).toEqual(assessment)
  })
})
