import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { createExercise } from '../exercises'
import { setActiveDbForTests } from './context'
import { FitPipDB } from './db'
import { beginSession, createWorkout, finishSession, listFavoriteSessions, setFavorite } from '../sessions'
import { logSet } from '../sets'
import { getSettings, saveCompareSex, saveDisplayName, saveDistanceUnit, saveGoalWeight, saveRestSeconds, saveWeightUnit } from '../settings'
import { addTemplateExercises, createTemplate, deleteTemplate, getTemplate, listTemplates, renameTemplate, updateTemplateExercise } from '../templates'
import { addWeekPlanItems, clearWeekday, listWeekPlan, removeWeekPlanItem, saveWeekPlanOrder } from '../weekPlan'
import { deleteBodyWeight, listBodyWeights, saveBodyWeight } from '../bodyWeights'
import { errorMessage } from '../unwrap'
import { countPending } from '../sync/engine'

let n = 0
const dbs: FitPipDB[] = []
function device() {
  const db = new FitPipDB(`rules-test-${++n}`)
  dbs.push(db)
  setActiveDbForTests(db, 'user-1')
  return db
}
afterEach(async () => {
  await Promise.all(dbs.splice(0).map((db) => db.delete()))
})

const lift = (name: string) => ({ name, primary_muscles: ['chest' as const], secondary_muscles: [], equipment: 'barbell' as const, category: 'strength' as const, tracking: 'reps' as const })
const planRow = (over: Partial<Parameters<typeof addWeekPlanItems>[0][number]>) => ({ weekday: 1, position: 0, template_id: null, exercise_id: null, category: null, ...over })

describe('routines', () => {
  it('refuses a duplicate name and a duplicate exercise, like the server', async () => {
    device()
    const bench = await createExercise(lift('Bench'))
    const push = await createTemplate('Push', [{ exerciseId: bench.id }])
    expect(errorMessage(await createTemplate('push').catch((e: unknown) => e))).toBe('That already exists.')
    expect(errorMessage(await addTemplateExercises(push.template.id, [{ exerciseId: bench.id, position: 1 }]).catch((e: unknown) => e))).toBe('That already exists.')
    const other = await createTemplate('Pull')
    expect(errorMessage(await renameTemplate(other.template.id, 'PUSH').catch((e: unknown) => e))).toBe('That already exists.')
  })

  it('keeps targets inside the limits the server enforces', async () => {
    device()
    const bench = await createExercise(lift('Bench'))
    await expect(createTemplate('Bad', [{ exerciseId: bench.id, targetSets: 21 }])).rejects.toThrow(/between 1 and 20/)
    const t = await createTemplate('OK', [{ exerciseId: bench.id }])
    await expect(updateTemplateExercise(t.items[0].id, { target_reps: 0 })).rejects.toThrow(/between 1 and 100/)
  })

  it("deleting one removes what the server removes with it, without queuing changes for those rows", async () => {
    const db = device()
    const bench = await createExercise(lift('Bench'))
    const t = await createTemplate('Push', [{ exerciseId: bench.id }])
    await addWeekPlanItems([planRow({ template_id: t.template.id })])
    const session = await createWorkout({ plan: [], templateId: t.template.id })
    // Pretend everything has synced, so the only queued change left is the delete itself.
    await db.pending.clear()

    await deleteTemplate(t.template.id)
    expect(await listTemplates()).toEqual([])
    expect(await db.template_exercises.count()).toBe(0)
    expect(await listWeekPlan()).toEqual([])
    expect((await db.sessions.get(session.id))?.template_id).toBeNull()
    expect((await db.pending.toArray()).map((p) => p.key)).toEqual([`templates/${t.template.id}`])
    expect(await getTemplate(t.template.id)).toBeNull()
  })
})

describe('week plan', () => {
  it('needs exactly one of a routine, an activity or a kind of workout', async () => {
    device()
    await expect(addWeekPlanItems([planRow({})])).rejects.toThrow(/Pick a routine/)
    await expect(addWeekPlanItems([planRow({ exercise_id: 'e', category: 'cardio' })])).rejects.toThrow(/Pick a routine/)
    await expect(addWeekPlanItems([planRow({ category: 'cardio', weekday: 7 })])).rejects.toThrow(/day of the week/)
  })

  it('allows a thing once per day, but on different days', async () => {
    device()
    await addWeekPlanItems([planRow({ category: 'cardio' })])
    expect(errorMessage(await addWeekPlanItems([planRow({ category: 'cardio', position: 1 })]).catch((e: unknown) => e))).toBe('That already exists.')
    await addWeekPlanItems([planRow({ category: 'cardio', weekday: 2 })])
    expect(await listWeekPlan()).toHaveLength(2)
  })

  it('rejects a duplicate within the same request too', async () => {
    device()
    await expect(addWeekPlanItems([planRow({ category: 'yoga' }), planRow({ category: 'yoga', position: 1 })])).rejects.toThrow(/duplicate/)
    expect(await listWeekPlan()).toEqual([])
  })

  it('clears a day, queueing a deletion for each synced item', async () => {
    const db = device()
    const added = await addWeekPlanItems([planRow({ category: 'cardio' }), planRow({ category: 'yoga', position: 1 }), planRow({ category: 'swim', weekday: 3 })])
    await db.pending.clear() // as if synced
    await clearWeekday(1)
    expect((await listWeekPlan()).map((i) => i.id)).toEqual([added[2].id])
    expect((await db.pending.toArray()).filter((p) => p.op === 'delete')).toHaveLength(2)
  })

  it('removes an item and reorders the rest', async () => {
    device()
    const [a, b] = await addWeekPlanItems([planRow({ category: 'cardio' }), planRow({ category: 'yoga', position: 1 })])
    await saveWeekPlanOrder([{ id: a.id, position: 1 }, { id: b.id, position: 0 }])
    expect((await listWeekPlan()).map((i) => i.id)).toEqual([b.id, a.id])
    await removeWeekPlanItem(a.id)
    expect(await listWeekPlan()).toHaveLength(1)
  })
})

describe('weigh-ins', () => {
  it('replaces the entry when weighing in again on the same day, keeping its identity', async () => {
    const db = device()
    const first = await saveBodyWeight('user-1', { measuredOn: '2026-03-01', weight: 180.456, unit: 'lb', note: '  morning ' })
    const again = await saveBodyWeight('user-1', { measuredOn: '2026-03-01', weight: 179, unit: 'lb' })
    expect(again.id).toBe(first.id)
    expect(first.weight).toBe(180.46)
    expect(first.note).toBe('morning')
    expect(await listBodyWeights()).toHaveLength(1)
    // Created and re-saved before syncing: still one queued creation.
    expect(await countPending(db)).toEqual({ pending: 1, failed: 0 })
    await deleteBodyWeight(first.id)
    expect(await countPending(db)).toEqual({ pending: 0, failed: 0 })
  })

  it('rejects impossible weights and dates', async () => {
    device()
    await expect(saveBodyWeight('user-1', { measuredOn: '2026-03-01', weight: 0, unit: 'kg' })).rejects.toThrow(/Weight/)
    await expect(saveBodyWeight('user-1', { measuredOn: 'March 1', weight: 80, unit: 'kg' })).rejects.toThrow(/date/)
  })
})

describe('settings', () => {
  it('starts with defaults, then remembers each change', async () => {
    device()
    expect(await getSettings()).toEqual({ weight_unit: 'lb', distance_unit: 'mi', goal_weight: null, goal_weight_unit: null, rest_seconds: 90, compare_sex: null, display_name: null })
    await saveWeightUnit('kg')
    await saveDistanceUnit('km')
    await saveGoalWeight({ weight: 75, unit: 'kg' })
    expect(await getSettings()).toEqual({ weight_unit: 'kg', distance_unit: 'km', goal_weight: 75, goal_weight_unit: 'kg', rest_seconds: 90, compare_sex: null, display_name: null })
    await saveGoalWeight(null)
    expect((await getSettings()).goal_weight).toBeNull()
  })
})

describe('profile settings', () => {
  it('saves which standards to compare with and a tidy name, and blank clears the name', async () => {
    device()
    await saveCompareSex('female')
    expect(await saveDisplayName('  Sam   Lee ')).toBe('Sam Lee')
    expect(await getSettings()).toMatchObject({ compare_sex: 'female', display_name: 'Sam Lee' })
    expect(await saveDisplayName('   ')).toBeNull()
    expect((await getSettings()).display_name).toBeNull()
    await expect(saveDisplayName('x'.repeat(41))).rejects.toThrow(/40 characters/)
    await expect(saveCompareSex('other' as never)).rejects.toThrow(/standards/)
  })

  it('leaves the new columns out of a saved row until they are set, so older databases keep syncing', async () => {
    const db = device()
    await saveWeightUnit('kg')
    const row = (await db.user_settings.get('user-1'))!
    expect('compare_sex' in row).toBe(false)
    expect('display_name' in row).toBe(false)
    await saveCompareSex('male')
    await saveWeightUnit('lb')
    expect(await db.user_settings.get('user-1')).toMatchObject({ compare_sex: 'male', weight_unit: 'lb' })
  })
})

describe('rest timer length', () => {
  it('defaults to 90 s, is remembered, and can be turned off with 0', async () => {
    device()
    expect((await getSettings()).rest_seconds).toBe(90)
    await saveRestSeconds(150)
    expect((await getSettings()).rest_seconds).toBe(150)
    await saveRestSeconds(0)
    expect((await getSettings()).rest_seconds).toBe(0)
  })

  it('refuses lengths the server would refuse', async () => {
    device()
    for (const bad of [5, 14, 601, 12.5, -30]) await expect(saveRestSeconds(bad)).rejects.toThrow(/Rest can be off/)
    expect((await getSettings()).rest_seconds).toBe(90)
  })

  it('reads a settings row saved before the setting existed as the old 90 s', async () => {
    const db = device()
    await db.user_settings.put({ user_id: 'user-1', weight_unit: 'kg', distance_unit: 'km', goal_weight: null, goal_weight_unit: null, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' } as never)
    expect(await getSettings()).toMatchObject({ weight_unit: 'kg', rest_seconds: 90 })
  })

  it('queues the change to sync like any other setting', async () => {
    const db = device()
    await saveRestSeconds(120)
    expect((await db.pending.toArray()).map((p) => p.key)).toEqual(['user_settings/user-1'])
    expect((await db.user_settings.get('user-1'))?.rest_seconds).toBe(120)
  })
})


describe('favorite workouts', () => {
  it('lists starred finished workouts with their sets, newest first, and queues the star for sync', async () => {
    const db = device()
    const bench = await createExercise(lift('Bench'))
    const finished = async (name: string) => {
      const session = await createWorkout({ name, plan: [] })
      await beginSession(session.id)
      await logSet({ sessionId: session.id, exerciseId: bench.id, setOrder: 0, reps: 5, weight: 100, rpe: null })
      await finishSession(session.id)
      return session.id
    }
    const older = await finished('Push A')
    await new Promise((resolve) => setTimeout(resolve, 5))
    const newer = await finished('Push B')
    const open = await createWorkout({ name: 'Not done', plan: [] })
    await db.pending.clear()

    for (const id of [older, newer, open.id]) await setFavorite(id, true)
    expect(await db.pending.count()).toBe(3)
    const list = await listFavoriteSessions()
    expect(list.map((item) => item.session.name)).toEqual(['Push B', 'Push A'])
    expect(list[0].sets).toHaveLength(1)

    await setFavorite(newer, false)
    expect((await listFavoriteSessions()).map((item) => item.session.id)).toEqual([older])
  })
})
