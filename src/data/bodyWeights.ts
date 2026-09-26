import { supabase } from '../lib/supabase'
import type { BodyWeight, WeightUnit } from '../types/db'
import { assertAccount, isGuestMode } from './guest'
import { assertOk, unwrap } from './unwrap'

/** Every weigh-in, oldest first. */
export async function listBodyWeights(): Promise<BodyWeight[]> {
  if (isGuestMode()) return []
  const rows = unwrap<BodyWeight[]>(await supabase.from('body_weights').select('*').order('measured_on'))
  return rows.map((row) => ({ ...row, weight: Number(row.weight) }))
}

export interface WeighInInput {
  /** YYYY-MM-DD, local date. */
  measuredOn: string
  weight: number
  unit: WeightUnit
  note?: string | null
}

/** Saves a weigh-in. Weighing in again on the same day replaces that day's entry. */
export async function saveBodyWeight(userId: string, input: WeighInInput): Promise<BodyWeight> {
  assertAccount('Weigh-ins')
  const values = {
    user_id: userId,
    measured_on: input.measuredOn,
    weight: input.weight,
    unit: input.unit,
    note: input.note?.trim() ? input.note.trim().slice(0, 200) : null,
  }
  const saved = unwrap<BodyWeight>(
    await supabase
      .from('body_weights')
      .upsert({ id: crypto.randomUUID(), ...values }, { onConflict: 'user_id,measured_on', ignoreDuplicates: false })
      .select()
      .single(),
  )
  return { ...saved, weight: Number(saved.weight) }
}

export async function deleteBodyWeight(id: string): Promise<void> {
  assertAccount('Weigh-ins')
  assertOk(await supabase.from('body_weights').delete().eq('id', id))
}
