import { memo, useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AddExercise } from '../components/AddExercise'
import { Button } from '../components/Button'
import { CategoryTile, tint } from '../components/CategoryTile'
import { EmptyState, ErrorBanner, Loading } from '../components/feedback'
import { ChevronIcon, PlusIcon } from '../components/icons'
import { PageHeader } from '../components/PageHeader'
import { ProgressHeatmap } from '../components/ProgressHeatmap'
import { Sheet } from '../components/Sheet'
import { listExercises } from '../data/exercises'
import { useAsync } from '../hooks/useAsync'
import { CATEGORY_INFO, CATEGORY_ORDER } from '../lib/activity'
import { withExercise } from '../lib/exerciseList'
import { exerciseSubtitle, matchesQuery } from '../lib/exerciseSearch'
import type { Category, Exercise } from '../types/db'

const SHOWN = 80
/**
 * Rows drawn with the page itself; the rest follow a moment later. Drawing all 80 up front made the tab
 * slow to open on phones (every other tab opens with far less to build), so the page arrived late and
 * skipped its fade-in. On a phone the list starts below the muscle map anyway.
 */
const FIRST_ROWS = 12

export function ProgressScreen() {
  const exercises = useAsync(listExercises, [], { cacheKey: 'exercises' })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [creating, setCreating] = useState(false)
  // Typing stays quick: the list catches up with the search in the background.
  const search = useDeferredValue(query)
  const shown = useDeferredValue(SHOWN, FIRST_ROWS)

  const matches = useMemo(
    () => (exercises.data ?? []).filter((e) => (category === 'all' || e.category === category) && matchesQuery(e, search)),
    [exercises.data, search, category],
  )

  return (
    <>
      <PageHeader
        eyebrow="How you're doing"
        title="Progress"
        action={
          <Button className="shrink-0" size="sm" onClick={() => setCreating(true)}>
            <PlusIcon size="size-4" /> New
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        {/* Drawn straight away (blank until the data is in), so the list below never jumps down. */}
        <div>
          <ProgressHeatmap exercises={exercises.data} />
        </div>

        <section>
          <div className="section-heading">
            <h2>Exercises & activities</h2>
          </div>
          <input aria-label="Search exercises" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: squat, swim, yoga…" className="field mb-3" />
          <div className="chip-row mb-3" role="group" aria-label="Filter by kind">
            <button type="button" className="filter-chip" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
              All
            </button>
            {CATEGORY_ORDER.map((c) => (
              <button key={c} type="button" className="filter-chip" style={tint(c)} aria-pressed={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_INFO[c].short}
              </button>
            ))}
          </div>

          {exercises.loading && !exercises.data && <Loading />}
          <ErrorBanner error={exercises.error} onRetry={exercises.reload} />
          {exercises.data?.length === 0 && <EmptyState title="No exercises yet">Add one with “New”, or load the starter bank in Settings.</EmptyState>}
          {exercises.data && exercises.data.length > 0 && matches.length === 0 && <p className="py-6 text-center text-muted">Nothing matches.</p>}

          <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0">
            {matches.slice(0, shown).map((exercise) => (
              <ExerciseRow key={exercise.id} exercise={exercise} />
            ))}
          </ul>
          {matches.length > SHOWN && <p className="mt-3 text-center text-sm text-muted">Showing {SHOWN} of {matches.length}. Search or filter to find more.</p>}
        </section>
      </div>

      <Sheet open={creating} title="New exercise" onClose={() => setCreating(false)}>
        <AddExercise
          existing={exercises.data ?? []}
          defaultCategory={category === 'all' ? undefined : category}
          onCancel={() => setCreating(false)}
          onAdded={(exercise) => {
            exercises.setData((prev) => withExercise(prev ?? [], exercise))
            setCreating(false)
          }}
        />
      </Sheet>
    </>
  )
}

/** One exercise in the list. Rows out of view skip layout and paint (`content-visibility`). */
const ExerciseRow = memo(function ExerciseRow({ exercise }: { exercise: Exercise }) {
  return (
    <li className="[contain-intrinsic-size:auto_4.25rem] [content-visibility:auto]">
      <Link to={`/exercises/${exercise.id}`} className="card pressable flex min-h-16 items-center gap-3 p-3">
        <CategoryTile category={exercise.category} size={2.5} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-extrabold">{exercise.name}</span>
          <span className="block truncate text-sm text-muted">{exerciseSubtitle(exercise)}</span>
        </span>
        <span className="text-muted">
          <ChevronIcon size="size-5" />
        </span>
      </Link>
    </li>
  )
})
