import { memo, useCallback, useDeferredValue, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CATEGORY_INFO, CATEGORY_ORDER } from '../lib/activity'
import { exerciseSubtitle, matchesQuery } from '../lib/exerciseSearch'
import type { Category, Exercise } from '../types/db'
import { CategoryTile, tint } from './CategoryTile'
import { CheckIcon } from './icons'

interface Props {
  exercises: Exercise[]
  selected: Set<string>
  onToggle: (exercise: Exercise) => void
  /** Filter shown first (default: everything). */
  initialCategory?: Category | 'all'
  /** Already in the workout/routine/day: shown, but not selectable. */
  addedIds?: Set<string>
}

const MAX_SHOWN = 120

/** Search plus activity filters over the exercise bank, with tap-to-select rows. */
export function ExerciseChooser({ exercises, selected, onToggle, initialCategory = 'all', addedIds }: Props) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>(initialCategory)
  // The box shows each key at once; the (longer) list catches up right after.
  const deferredQuery = useDeferredValue(query)

  // Rows only re-render when their own state changes, so hand them one callback that never changes.
  const toggleRef = useRef(onToggle)
  useLayoutEffect(() => {
    toggleRef.current = onToggle
  })
  const toggle = useCallback((exercise: Exercise) => toggleRef.current(exercise), [])

  const available = useMemo(() => new Set(exercises.map((e) => e.category)), [exercises])
  const matches = useMemo(
    () => exercises.filter((e) => (category === 'all' || e.category === category) && matchesQuery(e, deferredQuery)),
    [exercises, category, deferredQuery],
  )

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search: bench, swim, pigeon pose…"
        aria-label="Search exercises and activities"
        className="field mb-3"
      />
      <div className="chip-row mb-3" role="group" aria-label="Filter by kind">
        <button type="button" className="filter-chip" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
          All
        </button>
        {CATEGORY_ORDER.filter((c) => available.has(c)).map((c) => (
          <button key={c} type="button" className="filter-chip" style={tint(c)} aria-pressed={category === c} onClick={() => setCategory(c)}>
            {CATEGORY_INFO[c].short}
          </button>
        ))}
      </div>

      <ul className="m-0 grid list-none grid-cols-1 gap-1.5 p-0">
        {matches.slice(0, MAX_SHOWN).map((exercise) => (
          <ChooserRow key={exercise.id} exercise={exercise} isSelected={selected.has(exercise.id)} isAdded={addedIds?.has(exercise.id) ?? false} onToggle={toggle} />
        ))}
      </ul>
      {matches.length > MAX_SHOWN && <p className="mt-2 text-center text-sm text-muted">Showing {MAX_SHOWN} of {matches.length}. Search to narrow it down.</p>}
      {matches.length === 0 && <p className="py-6 text-center text-sm text-muted">Nothing matches{deferredQuery ? ` “${deferredQuery}”` : ''}.</p>}
    </div>
  )
}

interface RowProps {
  exercise: Exercise
  isSelected: boolean
  isAdded: boolean
  onToggle: (exercise: Exercise) => void
}

/**
 * One exercise. Memoised, so ticking one re-renders one row rather than all of them. Rows out of
 * view skip layout and paint (`content-visibility`), which keeps the sheet quick to open.
 */
const ChooserRow = memo(function ChooserRow({ exercise, isSelected, isAdded, onToggle }: RowProps) {
  return (
    <li className="[contain-intrinsic-size:auto_4rem] [content-visibility:auto]">
      <button
        type="button"
        disabled={isAdded}
        aria-pressed={isSelected}
        onClick={() => onToggle(exercise)}
        className={`flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-2xl border px-2.5 py-2 text-left transition-colors disabled:cursor-default disabled:opacity-50 ${
          isSelected ? 'border-accent/60 bg-accent/10' : 'border-transparent hover:bg-surface-2'
        }`}
      >
        <CategoryTile category={exercise.category} size={2.5} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{exercise.name}</span>
          <span className="block truncate text-sm text-muted">{isAdded ? 'Already added' : exerciseSubtitle(exercise)}</span>
        </span>
        <span
          className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition-all ${
            isSelected ? 'check-pop border-transparent text-on-accent' : 'border-line-strong text-transparent'
          }`}
          style={isSelected ? { background: 'var(--grad-accent)' } : undefined}
          aria-hidden="true"
        >
          <CheckIcon size="size-4" />
        </span>
      </button>
    </li>
  )
})
