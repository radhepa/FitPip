// Client for the free ExerciseDB instance (github.com/ExerciseDB/exercisedb-api).
// No API key is involved, so nothing secret ships to the browser. The service rate-limits
// bursts, so callers search on an explicit action rather than on every keystroke.
import {
  isImportable,
  mapExerciseDb,
  titleCase,
  type ExerciseDbExercise,
  type MappedExercise,
} from '../config/exerciseDbMap'

const BASE = 'https://oss.exercisedb.dev/api/v1'
const MAX_HITS = 20

export interface ExerciseDbHit {
  exerciseId: string
  /** Display name, title-cased. */
  name: string
}

export class ExerciseDbError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ExerciseDbError'
  }
}

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { signal })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    throw new ExerciseDbError("Couldn't reach ExerciseDB. Check your connection and try again.")
  }
  if (res.status === 429) throw new ExerciseDbError('ExerciseDB is rate-limiting requests. Wait a few seconds and try again.')
  if (res.status === 404) throw new ExerciseDbError('That exercise was not found in ExerciseDB.')
  if (!res.ok) throw new ExerciseDbError(`ExerciseDB returned an error (HTTP ${res.status}).`)
  return (await res.json()) as T
}

/** Fuzzy name search. Results carry only an id and a name; fetch the full record to import one. */
export async function searchExerciseDb(query: string, signal?: AbortSignal): Promise<ExerciseDbHit[]> {
  const json = await get<{ data?: { exerciseId: string; name: string }[] }>(
    `/exercises/search?search=${encodeURIComponent(query.trim())}`,
    signal,
  )
  return (json.data ?? []).slice(0, MAX_HITS).map((hit) => ({ exerciseId: hit.exerciseId, name: titleCase(hit.name) }))
}

/** Full record for one exercise, mapped to our muscles/equipment and ready to store. */
export async function fetchExerciseDbExercise(exerciseId: string): Promise<MappedExercise> {
  const json = await get<{ data: ExerciseDbExercise }>(`/exercises/${encodeURIComponent(exerciseId)}`)
  const mapped = mapExerciseDb(json.data)
  if (!isImportable(mapped)) {
    throw new ExerciseDbError("That exercise doesn't train a muscle this app tracks (for example cardio), so it can't be added.")
  }
  return mapped
}
