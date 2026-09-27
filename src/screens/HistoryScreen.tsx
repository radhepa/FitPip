import { Fragment, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { EmptyState, ErrorBanner, Loading } from '../components/feedback'
import { FavoriteWorkoutList } from '../components/FavoriteWorkoutList'
import { PageHeader } from '../components/PageHeader'
import { SessionListItem } from '../components/SessionListItem'
import { listExercises } from '../data/exercises'
import { listFavoriteSessions } from '../data/sessions'
import { useAsync } from '../hooks/useAsync'
import { useRepeatWorkout } from '../hooks/useRepeatWorkout'
import { useSessionHistory } from '../hooks/useSessionHistory'
import { useSettings } from '../hooks/useSettings'
import type { Exercise } from '../types/db'

const monthFormat = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })
const monthOf = (iso: string) => monthFormat.format(new Date(iso))

export function HistoryScreen() {
  const [params, setParams] = useSearchParams()
  const favorites = params.get('show') === 'favorites'
  const exercises = useAsync(listExercises, [], { cacheKey: 'exercises' })
  const exerciseById = useMemo(() => new Map((exercises.data ?? []).map((e) => [e.id, e])), [exercises.data])
  // The list waits for the exercises too, so each workout's icon shows its colour from the start.
  const ready = !exercises.loading

  return (
    <>
      <PageHeader eyebrow="Every session" title="History" />
      <div className="segmented mb-4" role="group" aria-label="Which workouts">
        <button type="button" aria-pressed={!favorites} onClick={() => setParams({}, { replace: true })}>
          All
        </button>
        <button type="button" aria-pressed={favorites} onClick={() => setParams({ show: 'favorites' }, { replace: true })}>
          Favorites
        </button>
      </div>
      {favorites ? <FavoritesView ready={ready} exerciseById={exerciseById} /> : <AllView ready={ready} exerciseById={exerciseById} />}
    </>
  )
}

interface ViewProps {
  ready: boolean
  exerciseById: Map<string, Exercise>
}

function AllView({ ready, exerciseById }: ViewProps) {
  const { unit } = useSettings()
  const { items, hasMore, loading, loadingMore, error, loadMore, retry } = useSessionHistory()
  const shown = ready ? items : null

  return (
    <>
      {(loading || !shown) && !error && <Loading />}
      <ErrorBanner error={error} onRetry={retry} />
      {shown?.length === 0 && <EmptyState title="No finished workouts yet">Finish a workout and it will show up here.</EmptyState>}
      <div className="grid grid-cols-1 gap-2.5">
        {shown?.map((item, index) => {
          const month = monthOf(item.session.started_at)
          const previous = index > 0 ? monthOf(shown[index - 1].session.started_at) : null
          return (
            <Fragment key={item.session.id}>
              {month !== previous && <h2 className="mt-5 mb-0.5 font-display text-xl font-extrabold first:mt-0">{month}</h2>}
              <SessionListItem item={item} unit={unit} exerciseById={exerciseById} />
            </Fragment>
          )
        })}
      </div>
      {shown && hasMore && (
        <Button block className="mt-4" onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading…' : 'Load more'}
        </Button>
      )}
    </>
  )
}

function FavoritesView({ ready, exerciseById }: ViewProps) {
  const list = useAsync(listFavoriteSessions, [], { cacheKey: 'favorites' })
  const { repeat, repeating, error } = useRepeatWorkout()
  const shown = ready ? list.data : null

  return (
    <>
      {(list.loading || !shown) && !list.error && <Loading />}
      <ErrorBanner error={list.error} onRetry={list.reload} />
      <ErrorBanner error={error} />
      {shown?.length === 0 && (
        <EmptyState title="No favorites yet">Open a finished workout and tap the star to keep it here, ready to repeat.</EmptyState>
      )}
      {shown && shown.length > 0 && <FavoriteWorkoutList items={shown} exerciseById={exerciseById} busy={repeating} onRepeat={(item) => repeat(item, exerciseById)} />}
    </>
  )
}
