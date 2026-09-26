import type { Template, TemplateExercise, TemplateWithItems } from '../types/db'
import { duplicateError, invalidError, newId, nowIso, ownerId, putRow, putRows, removeCascaded, removeRow, rowsOf, writeTx } from './local/store'

export interface NewTemplateItem {
  exerciseId: string
  targetSets?: number
  targetReps?: number
  targetSeconds?: number | null
}

export const DEFAULT_SETS = 3
export const DEFAULT_REPS = 8

const byPosition = (a: TemplateExercise, b: TemplateExercise) =>
  a.position - b.position || a.created_at.localeCompare(b.created_at)

const cleanName = (name: string): string => {
  const trimmed = name.trim()
  if (trimmed.length < 1 || trimmed.length > 80) throw invalidError('Give the routine a name (up to 80 characters).')
  return trimmed
}

/** The server keeps one routine per name, ignoring case. */
async function assertNameFree(name: string, exceptId?: string): Promise<void> {
  const lowered = name.toLowerCase()
  if (await rowsOf('templates').filter((t) => t.id !== exceptId && t.name.toLowerCase() === lowered).first()) throw duplicateError('routine name')
}

function itemRow(templateId: string, item: NewTemplateItem, position: number): TemplateExercise {
  const now = nowIso()
  const targetSets = item.targetSets ?? DEFAULT_SETS
  const targetReps = item.targetReps ?? DEFAULT_REPS
  if (!Number.isInteger(targetSets) || targetSets < 1 || targetSets > 20) throw invalidError('Sets must be between 1 and 20.')
  if (!Number.isInteger(targetReps) || targetReps < 1 || targetReps > 100) throw invalidError('Reps must be between 1 and 100.')
  const targetSeconds = item.targetSeconds ?? null
  if (targetSeconds !== null && !(Number.isInteger(targetSeconds) && targetSeconds >= 1 && targetSeconds <= 86_400)) throw invalidError('Time must be between 1 second and 24 hours.')
  if (!Number.isInteger(position) || position < 0) throw invalidError('That position is not valid.')
  return {
    id: newId(),
    user_id: ownerId(),
    template_id: templateId,
    exercise_id: item.exerciseId,
    position,
    target_sets: targetSets,
    target_reps: targetReps,
    target_seconds: targetSeconds,
    created_at: now,
    updated_at: now,
  }
}

/** Every template with its exercises. */
export async function listTemplates(): Promise<TemplateWithItems[]> {
  const templates = (await rowsOf('templates').toArray()).sort((a, b) => a.name.localeCompare(b.name))
  const items = await rowsOf('template_exercises').toArray()
  return templates.map((template) => ({ template, items: items.filter((i) => i.template_id === template.id).sort(byPosition) }))
}

export async function getTemplate(id: string): Promise<TemplateWithItems | null> {
  const template = await rowsOf('templates').get(id)
  if (!template) return null
  const items = await rowsOf('template_exercises').where('template_id').equals(id).toArray()
  return { template, items: items.sort(byPosition) }
}

/** Creates a template, optionally with exercises already in it (used to save a suggested workout later). */
export async function createTemplate(name: string, items: NewTemplateItem[] = []): Promise<TemplateWithItems> {
  const cleaned = cleanName(name)
  return writeTx(async () => {
    await assertNameFree(cleaned)
    const now = nowIso()
    const template: Template = { id: newId(), user_id: ownerId(), name: cleaned, created_at: now, updated_at: now }
    const rows = items.map((item, position) => itemRow(template.id, item, position))
    const seen = new Set<string>()
    for (const row of rows) {
      if (seen.has(row.exercise_id)) throw duplicateError('exercise in routine')
      seen.add(row.exercise_id)
    }
    await putRow('templates', template, { isNew: true })
    await putRows('template_exercises', rows, { isNew: true })
    return { template, items: rows.sort(byPosition) }
  })
}

export async function renameTemplate(id: string, name: string): Promise<Template> {
  const cleaned = cleanName(name)
  return writeTx(async () => {
    const existing = await rowsOf('templates').get(id)
    if (!existing) throw new Error('Routine not found.')
    await assertNameFree(cleaned, id)
    const updated: Template = { ...existing, name: cleaned, updated_at: nowIso() }
    await putRow('templates', updated, { isNew: false })
    return updated
  })
}

export async function deleteTemplate(id: string): Promise<void> {
  await writeTx(async () => {
    // The server removes a routine's exercises and plan entries with it, and clears the link on
    // workouts that were started from it. Mirror that without queuing extra changes.
    await removeCascaded('template_exercises', (await rowsOf('template_exercises').where('template_id').equals(id).primaryKeys()) as string[])
    await removeCascaded('week_plan_items', (await rowsOf('week_plan_items').where('template_id').equals(id).primaryKeys()) as string[])
    await rowsOf('sessions').where('template_id').equals(id).modify({ template_id: null })
    await removeRow('templates', id)
  })
}

/** Adds exercises to the end of a template (several at once), each with its starting target. */
export async function addTemplateExercises(
  templateId: string,
  items: (NewTemplateItem & { position: number })[],
): Promise<TemplateExercise[]> {
  if (items.length === 0) return []
  return writeTx(async () => {
    const taken = new Set((await rowsOf('template_exercises').where('template_id').equals(templateId).toArray()).map((i) => i.exercise_id))
    const rows = items.map((item) => itemRow(templateId, item, item.position))
    for (const row of rows) {
      if (taken.has(row.exercise_id)) throw duplicateError('exercise in routine')
      taken.add(row.exercise_id)
    }
    await putRows('template_exercises', rows, { isNew: true })
    return rows
  })
}

export async function updateTemplateExercise(
  id: string,
  patch: Partial<Pick<TemplateExercise, 'target_sets' | 'target_reps' | 'target_seconds'>>,
): Promise<TemplateExercise> {
  return writeTx(async () => {
    const existing = await rowsOf('template_exercises').get(id)
    if (!existing) throw new Error('Exercise not found in this routine.')
    const merged = { ...existing, ...patch }
    // Re-run the same checks as a new row.
    itemRow(existing.template_id, { exerciseId: existing.exercise_id, targetSets: merged.target_sets, targetReps: merged.target_reps, targetSeconds: merged.target_seconds }, existing.position)
    const updated: TemplateExercise = { ...merged, updated_at: nowIso() }
    await putRow('template_exercises', updated, { isNew: false })
    return updated
  })
}

export async function removeTemplateExercise(id: string): Promise<void> {
  await writeTx(() => removeRow('template_exercises', id))
}

/** Writes new positions for several rows (after a reorder). */
export async function saveTemplateOrder(updates: { id: string; position: number }[]): Promise<void> {
  await writeTx(async () => {
    for (const { id, position } of updates) {
      if (!Number.isInteger(position) || position < 0) throw invalidError('That position is not valid.')
      const existing = await rowsOf('template_exercises').get(id)
      if (existing) await putRow('template_exercises', { ...existing, position, updated_at: nowIso() }, { isNew: false })
    }
  })
}
