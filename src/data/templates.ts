import { supabase } from '../lib/supabase'
import type { Template, TemplateExercise, TemplateWithItems } from '../types/db'
import { assertAccount, isGuestMode } from './guest'
import { assertOk, unwrap } from './unwrap'

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

/** Every template with its exercises. Guest mode has no templates. */
export async function listTemplates(): Promise<TemplateWithItems[]> {
  if (isGuestMode()) return []
  const templates = unwrap<Template[]>(await supabase.from('templates').select('*').order('name'))
  const items = unwrap<TemplateExercise[]>(await supabase.from('template_exercises').select('*').order('position'))
  return templates.map((template) => ({ template, items: items.filter((i) => i.template_id === template.id).sort(byPosition) }))
}

export async function getTemplate(id: string): Promise<TemplateWithItems | null> {
  if (isGuestMode()) return null
  const template = unwrap<Template | null>(await supabase.from('templates').select('*').eq('id', id).maybeSingle())
  if (!template) return null
  const items = unwrap<TemplateExercise[]>(
    await supabase.from('template_exercises').select('*').eq('template_id', id).order('position'),
  )
  return { template, items: items.sort(byPosition) }
}

/** Creates a template, optionally with exercises already in it (used to save a suggested workout later). */
export async function createTemplate(name: string, items: NewTemplateItem[] = []): Promise<TemplateWithItems> {
  assertAccount()
  const templateId = crypto.randomUUID()
  const template = unwrap<Template>(
    await supabase.from('templates').insert({ id: templateId, name: name.trim() }).select().single(),
  )
  if (items.length === 0) return { template, items: [] }

  const rows = items.map((item, position) => ({
    id: crypto.randomUUID(),
    template_id: templateId,
    exercise_id: item.exerciseId,
    position,
    target_sets: item.targetSets ?? DEFAULT_SETS,
    target_reps: item.targetReps ?? DEFAULT_REPS,
    target_seconds: item.targetSeconds ?? null,
  }))
  const inserted = await supabase.from('template_exercises').insert(rows).select()
  if (inserted.error) {
    await supabase.from('templates').delete().eq('id', templateId) // don't leave an empty template behind
    unwrap(inserted)
  }
  return { template, items: (inserted.data as TemplateExercise[]).sort(byPosition) }
}

export async function renameTemplate(id: string, name: string): Promise<Template> {
  assertAccount()
  return unwrap<Template>(await supabase.from('templates').update({ name: name.trim() }).eq('id', id).select().single())
}

export async function deleteTemplate(id: string): Promise<void> {
  assertAccount()
  assertOk(await supabase.from('templates').delete().eq('id', id))
}

/** Adds exercises to the end of a template (several at once), each with its starting target. */
export async function addTemplateExercises(
  templateId: string,
  items: (NewTemplateItem & { position: number })[],
): Promise<TemplateExercise[]> {
  assertAccount()
  if (items.length === 0) return []
  const rows = items.map((item) => ({
    id: crypto.randomUUID(),
    template_id: templateId,
    exercise_id: item.exerciseId,
    position: item.position,
    target_sets: item.targetSets ?? DEFAULT_SETS,
    target_reps: item.targetReps ?? DEFAULT_REPS,
    target_seconds: item.targetSeconds ?? null,
  }))
  return unwrap<TemplateExercise[]>(await supabase.from('template_exercises').insert(rows).select())
}

export async function updateTemplateExercise(
  id: string,
  patch: Partial<Pick<TemplateExercise, 'target_sets' | 'target_reps' | 'target_seconds'>>,
): Promise<TemplateExercise> {
  assertAccount()
  return unwrap<TemplateExercise>(await supabase.from('template_exercises').update(patch).eq('id', id).select().single())
}

export async function removeTemplateExercise(id: string): Promise<void> {
  assertAccount()
  assertOk(await supabase.from('template_exercises').delete().eq('id', id))
}

/** Writes new positions for several rows (after a reorder). */
export async function saveTemplateOrder(updates: { id: string; position: number }[]): Promise<void> {
  assertAccount()
  const results = await Promise.all(
    updates.map((u) => supabase.from('template_exercises').update({ position: u.position }).eq('id', u.id)),
  )
  results.forEach(assertOk)
}
