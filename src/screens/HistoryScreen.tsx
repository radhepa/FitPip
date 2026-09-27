import { Fragment, useMemo } from 'react'
import { Button } from '../components/Button'
import { EmptyState, ErrorBanner, Loading } from '../components/feedback'
import { PageHeader } from '../components/PageHeader'
import { SessionListItem } from '../components/SessionListItem'
import { listExercises } from '../data/exercises'
import { useAsync } from '../hooks/useAsync'
import { useSessionHistory } from '../hooks/useSessionHistory'
import { useSettings } from '../hooks/useSettings'

const monthFormat = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' })
const monthOf = (iso: string) => monthFormat.format(new Date(iso))

export function HistoryScreen() {
  const { unit } = useSettings()
  const { items, hasMore, loading, loadingMore, error, loadMore, retry } = useSessionHistory()
  const exercises = useAsync(listExercises, [], { cacheKey: 'exercises' })
  const exerciseById = useMemo(() => new Map((exercises.data ?? []).map((e) => [e.id, e])), [exercises.data])
  // The list waits for the exercises too, so each workout's icon shows its colour from the start.
  const shown = exercises.loading ? null : items

  return (
    <>
      <PageHeader eyebrow="Every session" title="History" />
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
