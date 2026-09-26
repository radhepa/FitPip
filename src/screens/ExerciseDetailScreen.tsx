import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Chip } from '../components/Chip'
import { EmptyState, ErrorBanner, Loading } from '../components/feedback'
import { ExerciseForm } from '../components/ExerciseForm'
import { ExerciseGuide } from '../components/ExerciseGuide'
import { ExerciseHistoryList } from '../components/ExerciseHistoryList'
import { ExerciseProgress } from '../components/ExerciseProgress'
import { PageHeader } from '../components/PageHeader'
import { Sheet } from '../components/Sheet'
import { deleteExercise, getExercise, updateExercise } from '../data/exercises'
import { listSetsForExercise } from '../data/sets'
import { errorMessage } from '../data/unwrap'
import { useAsync } from '../hooks/useAsync'
import { useSettings } from '../hooks/useSettings'
import { muscleLabel } from '../lib/format'
import { buildHistory } from '../lib/sessionStats'
import { CATEGORY_INFO } from '../lib/activity'
import { lengthUnitFor } from '../lib/units'
import { CategoryTile } from '../components/CategoryTile'

export function ExerciseDetailScreen() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { unit, distanceUnit } = useSettings()
  const exercise = useAsync(() => getExercise(id), [id])
  const sets = useAsync(() => listSetsForExercise(id), [id])
  const [editing, setEditing] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const history = useMemo(() => buildHistory(sets.data ?? []), [sets.data])

  async function remove() {
    if (!window.confirm('Delete this exercise? This cannot be undone.')) return
    setDeleteError(null)
    try {
      await deleteExercise(id)
      navigate('/progress', { replace: true })
    } catch (e) {
      setDeleteError(errorMessage(e))
    }
  }

  if (exercise.loading) return <Loading />
  if (exercise.error) return <ErrorBanner error={exercise.error} onRetry={exercise.reload} />
  const ex = exercise.data
  if (!ex) return <EmptyState title="Exercise not found" />

  return (
    <>
      <PageHeader
        back
        eyebrow={CATEGORY_INFO[ex.category].label}
        title={ex.name}
        action={
          <Button className="shrink-0" onClick={() => setEditing(true)}>
            Edit
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <CategoryTile category={ex.category} size={2.25} />
        {ex.primary_muscles.map((m) => (
          <Chip key={m} label={muscleLabel(m)} selected color={CATEGORY_INFO[ex.category].color} />
        ))}
        {ex.secondary_muscles.map((m) => (
          <Chip key={m} label={muscleLabel(m)} />
        ))}
        <Chip label={muscleLabel(ex.equipment)} />
      </div>

      <ExerciseGuide exercise={ex} />

      <ErrorBanner error={sets.error} onRetry={sets.reload} />
      {sets.loading && !sets.data ? (
        <Loading />
      ) : history.length === 0 ? (
        <EmptyState title="No history yet">Sets you log for this exercise will show up here.</EmptyState>
      ) : (
        <>
          <ExerciseProgress exercise={ex} history={history} unit={unit} distanceUnit={distanceUnit} />
          <div className="section-heading">
            <h2>History</h2>
          </div>
          <ExerciseHistoryList history={history} unit={unit} lengthUnit={lengthUnitFor(ex.category, distanceUnit)} />
        </>
      )}

      <div className="mt-8">
        <Button variant="ghost" block className="!text-danger" onClick={remove}>
          Delete exercise
        </Button>
        {deleteError && <p className="mt-2 text-sm text-danger">{deleteError}</p>}
      </div>

      <Sheet open={editing} title="Edit exercise" onClose={() => setEditing(false)}>
        <ExerciseForm
          initial={ex}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            exercise.setData(await updateExercise(id, input))
            setEditing(false)
          }}
        />
      </Sheet>
    </>
  )
}
