import { brand } from '../config/brand'
import { localDateIso } from '../lib/bodyWeight'
import { weighInsCsv, workoutsCsv } from '../lib/exportCsv'
import type { WeightUnit } from '../types/db'
import { listBodyWeights } from './bodyWeights'
import { listExercises } from './exercises'
import { getDb } from './local/context'
import { SYNC_TABLES } from './local/tables'
import { loadAllTraining } from './trainingWindow'

export interface ExportFile {
  name: string
  type: string
  text: string
}

const stamp = () => localDateIso()
const slug = brand.shortName.toLowerCase()

/** Every set of every workout, for a spreadsheet. */
export async function exportWorkouts(unit: WeightUnit): Promise<ExportFile> {
  const [exercises, training] = await Promise.all([listExercises(), loadAllTraining()])
  return { name: `${slug}-workouts-${stamp()}.csv`, type: 'text/csv', text: workoutsCsv({ ...training, exercises, unit }) }
}

/** Every weigh-in, for a spreadsheet. */
export async function exportWeighIns(): Promise<ExportFile> {
  return { name: `${slug}-weigh-ins-${stamp()}.csv`, type: 'text/csv', text: weighInsCsv(await listBodyWeights()) }
}

/** Everything on this device, table by table, as one JSON file (a full copy to keep). */
export async function exportEverything(): Promise<ExportFile> {
  const db = getDb()
  const tables: Record<string, unknown[]> = {}
  for (const table of SYNC_TABLES) tables[table] = await db.table(table).toArray()
  const backup = { app: brand.name, format: 1, exportedAt: new Date().toISOString(), tables }
  return { name: `${slug}-backup-${stamp()}.json`, type: 'application/json', text: JSON.stringify(backup, null, 1) }
}
