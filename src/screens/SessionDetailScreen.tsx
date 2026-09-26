import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { EmptyState, ErrorBanner, Loading } from '../components/feedback'
import { MuscleVolumePanel } from '../components/MuscleVolumePanel'
import { PageHeader } from '../components/PageHeader'
import { SessionExerciseList } from '../components/SessionExerciseList'
import { SessionStats } from '../components/SessionStats'
import { confetti } from '../components/fx'
import { PipSpeech } from '../components/PipSpeech'
import { listExercises } from '../data/exercises'
import { deleteSession, getSession } from '../data/sessions'
import { listSetsForSession } from '../data/sets'
import { errorMessage } from '../data/unwrap'
import { useAsync } from '../hooks/useAsync'
import { useSettings } from '../hooks/useSettings'
import { formatDate, formatTime, sessionDurationMs, sessionTitle } from '../lib/format'
import { computeVolume, workFromSets } from '../lib/muscleVolume'
import { groupByExercise, totalVolume } from '../lib/sessionStats'

/** Summary of a finished workout (also where you land right after finishing one). */
export function SessionDetailScreen() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { unit, distanceUnit } = useSettings()
  const justFinished = (useLocation().state as { justFinished?: boolean } | null)?.justFinished === true
  const session = useAsync(() => getSession(id), [id])
  const setsState = useAsync(() => listSetsForSession(id), [id])
  const exercisesState = useAsync(listExercises, [])
  const [actionError, setActionError] = useState<string | null>(null)

  const sets = useMemo(() => setsState.data ?? [], [setsState.data])
  const blocks = useMemo(() => groupByExercise(sets), [sets])
  const exerciseById = useMemo(() => new Map((exercisesState.data ?? []).map((e) => [e.id, e])), [exercisesState.data])
  const volume = useMemo(() => computeVolume(workFromSets(sets, exerciseById)), [sets, exerciseById])
  const activeSeconds = sets.reduce((total, s) => total + (s.duration_seconds ?? 0), 0)
  const hasLifts = sets.some((s) => exerciseById.get(s.exercise_id)?.tracking === 'reps')

  useEffect(() => {
    if (justFinished) confetti()
  }, [justFinished])

  async function run(action: () => Promise<void>) {
    setActionError(null)
    try {
      await action()
    } catch (e) {
      setActionError(errorMessage(e))
    }
  }

  if (session.loading || setsState.loading || exercisesState.loading) return <Loading />
  const loadError = session.error ?? setsState.error ?? exercisesState.error
  if (loadError) return <ErrorBanner error={loadError} />
  const s = session.data
  if (!s) return <EmptyState title="Workout not found" />
  if (!s.ended_at || !s.started_at) return <Navigate to={`/workout/${id}`} replace />

  return (
    <>
      <PageHeader back eyebrow={justFinished ? 'Workout saved' : formatDate(s.started_at)} title={sessionTitle(s)} subtitle={`${formatDate(s.started_at)} · ${formatTime(s.started_at)}`} />
      {justFinished && (
        <section className="card card-hero mb-4 p-4">
          <PipSpeech pose="cheer" size={104} override={`Done! ${sets.length} ${sets.length === 1 ? 'set' : 'sets'} in the books. Proud of you.`} />
        </section>
      )}
      <SessionStats
        durationMs={sessionDurationMs(s)}
        exercises={blocks.length}
        sets={sets.length}
        volume={totalVolume(sets)}
        activeSeconds={activeSeconds}
        unit={unit}
      />
      {hasLifts && <MuscleVolumePanel
        label="This workout"
        title="Muscles worked"
        caption="Sets per muscle in this workout only."
        volume={volume}
        unit={unit}
        periodLabel="this workout"
        emptyText="No sets were logged."
      />}
      <SessionExerciseList blocks={blocks} exerciseById={exerciseById} unit={unit} distanceUnit={distanceUnit} />

      {actionError && <p className="mt-4 text-sm text-danger">{actionError}</p>}
      <div className="mt-6 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        <Button onClick={() => navigate(`/workout/${id}`)}>Edit workout</Button>
        <Button
          variant="danger"
          onClick={() =>
            run(async () => {
              if (!window.confirm('Delete this workout and all its sets?')) return
              await deleteSession(id)
              navigate('/history', { replace: true })
            })
          }
        >
          Delete
        </Button>
      </div>
    </>
  )
}
