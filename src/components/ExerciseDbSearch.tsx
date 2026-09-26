import { useState, type FormEvent } from 'react'
import { importExercise } from '../data/exercises'
import { fetchExerciseDbExercise, searchExerciseDb, type ExerciseDbHit } from '../data/exerciseDb'
import { errorMessage } from '../data/unwrap'
import type { Exercise } from '../types/db'
import { Button } from './Button'

interface Props {
  /** The user's current bank, so already-imported exercises are reused instead of duplicated. */
  existing: Exercise[]
  onAdded: (exercise: Exercise) => void
}

/** Search ExerciseDB by name; tapping a result saves it to the user's bank. */
export function ExerciseDbSearch({ existing, onAdded }: Props) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<ExerciseDbHit[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function search(e: FormEvent) {
    e.preventDefault()
    if (query.trim().length < 2) return
    setSearching(true)
    setError(null)
    try {
      setHits(await searchExerciseDb(query))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSearching(false)
    }
  }

  async function add(hit: ExerciseDbHit) {
    const already = existing.find((ex) => ex.external_id === hit.exerciseId)
    if (already) return onAdded(already)
    setAddingId(hit.exerciseId)
    setError(null)
    try {
      onAdded(await importExercise(await fetchExerciseDbExercise(hit.exerciseId)))
    } catch (err) {
      setError(errorMessage(err))
      setAddingId(null)
    }
  }

  return (
    <div>
      <form onSubmit={search} className="mb-3 flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. incline dumbbell press"
          aria-label="Search ExerciseDB"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 outline-none focus:border-accent"
        />
        <Button type="submit" variant="primary" disabled={searching || query.trim().length < 2}>
          {searching ? '…' : 'Search'}
        </Button>
      </form>

      {error && <p className="mb-3 text-sm text-danger">{error}</p>}
      {hits?.length === 0 && <p className="mb-3 text-center text-sm text-muted">No matches. Try fewer or different words.</p>}

      <ul className="divide-y divide-line">
        {hits?.map((hit) => {
          const inBank = existing.some((ex) => ex.external_id === hit.exerciseId)
          return (
            <li key={hit.exerciseId}>
              <button
                type="button"
                onClick={() => add(hit)}
                disabled={addingId !== null}
                className="flex min-h-14 w-full items-center justify-between gap-3 py-2 text-left disabled:opacity-50"
              >
                <span className="font-medium">{hit.name}</span>
                <span className="shrink-0 text-sm text-muted">
                  {addingId === hit.exerciseId ? 'Adding…' : inBank ? 'In your bank' : 'Add'}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-xs text-muted">Exercise data and demos from ExerciseDB.</p>
    </div>
  )
}
