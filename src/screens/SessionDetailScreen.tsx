import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { EmptyState, ErrorBanner, Loading } from '../components/feedback'
import { FavoriteButton } from '../components/FavoriteButton'
import { RepeatIcon } from '../components/icons'
import { MuscleVolumePanel } from '../components/MuscleVolumePanel'
import { PageHeader } from '../components/PageHeader'
import { SessionExerciseList } from '../components/SessionExerciseList'
import { SessionStats } from '../components/SessionStats'
import { WorkoutRewards } from '../components/WorkoutRewards'
import { WorkoutCompletion } from '../components/WorkoutCompletion'
import { listExercises } from '../data/exercises'
import { deleteSession, getSession, isFavorite } from '../data/sessions'
import { listSetsForSession } from '../data/sets'
import { errorMessage } from '../data/unwrap'
import { useAsync } from '../hooks/useAsync'
import { useRepeatWorkout } from '../hooks/useRepeatWorkout'
import { usePipFacts } from '../hooks/usePipFacts'
import { useWorkoutRewards } from '../hooks/useWorkoutRewards'
import { useSettings } from '../hooks/useSettings'
import { formatDate, formatTime, sessionDurationMs, sessionTitle } from '../lib/format'
import { planFromRows } from '../lib/sessionPlan'
import { computeVolume, workFromSets } from '../lib/muscleVolume'
import { wrapUpNote } from '../lib/pip/notes'
import { groupByExercise, totalVolume } from '../lib/sessionStats'

/** Summary of a finished workout (also where you land right after finishing one). */
export function SessionDetailScreen() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { unit, distanceUnit } = useSettings()
  const justFinished = (useLocation().state as { justFinished?: boolean } | null)?.justFinished === true
  const [celebrating] = useState(justFinished)
  const session = useAsync(() => getSession(id), [id], { cacheKey: `session:${id}` })
  const setsState = useAsync(() => listSetsForSession(id), [id], { cacheKey: `session-sets:${id}` })
  const exercisesState = useAsync(listExercises, [], { cacheKey: 'exercises' })
  const rewards = useWorkoutRewards(id)
  // The rewards come from the whole history and take longest. The page waits for them too, so it arrives in
  // one piece instead of the rewards card appearing later and pushing everything below it down. (Not right
  // after finishing: the celebration covers the page, so it opens straight away.)
  const waitForRewards = rewards.loading && !celebrating
  // Shown at once when it was already read; otherwise it fades in as it arrives.
  const [arrives] = useState(() => session.loading || setsState.loading || exercisesState.loading || waitForRewards)
  const [actionError, setActionError] = useState<string | null>(null)
  const { repeat, repeating, error: repeatError } = useRepeatWorkout()
  // Pip only looks at your history for the celebration right after finishing, not on every visit to a past workout.
  const pipFacts = usePipFacts({ skip: !celebrating })
  const pipLine = useMemo(() => (pipFacts ? (wrapUpNote(pipFacts)?.text ?? null) : null), [pipFacts])

  const sets = useMemo(() => setsState.data ?? [], [setsState.data])
  const blocks = useMemo(() => groupByExercise(sets), [sets])
  const exerciseById = useMemo(() => new Map((exercisesState.data ?? []).map((e) => [e.id, e])), [exercisesState.data])
  const volume = useMemo(() => computeVolume(workFromSets(sets, exerciseById)), [sets, exerciseById])
  const storedPlan = session.data?.plan
  const exerciseNotes = useMemo(() => new Map(planFromRows(storedPlan).flatMap((p) => (p.note ? [[p.exerciseId, p.note] as const] : []))), [storedPlan])
  const activeSeconds = sets.reduce((total, s) => total + (s.duration_seconds ?? 0), 0)
  const hasLifts = sets.some((s) => exerciseById.get(s.exercise_id)?.tracking === 'reps')

  async function run(action: () => Promise<void>) {
    setActionError(null)
    try {
      await action()
    } catch (e) {
      setActionError(errorMessage(e))
    }
  }

  if (session.loading || setsState.loading || exercisesState.loading || waitForRewards) return <Loading />
  const loadError = session.error ?? setsState.error ?? exercisesState.error
  if (loadError) return <ErrorBanner error={loadError} />
  const s = session.data
  if (!s) return <EmptyState title="Workout not found" />
  if (!s.ended_at || !s.started_at) return <Navigate to={`/workout/${id}`} replace />

  return (
    <div className={arrives ? 'page-enter' : undefined}>
      <PageHeader
        back
        backTo="/history"
        eyebrow={justFinished ? 'Workout saved' : formatDate(s.started_at)}
        title={sessionTitle(s)}
        subtitle={`${formatDate(s.started_at)} · ${formatTime(s.started_at)}`}
        action={<FavoriteButton sessionId={id} initial={isFavorite(s)} onError={setActionError} />}
      />
      <WorkoutCompletion key={id} sessionId={id} justFinished={justFinished} sets={sets.length} pipLine={pipLine} />
      <SessionStats
        durationMs={sessionDurationMs(s)}
        exercises={blocks.length}
        sets={sets.length}
        volume={totalVolume(sets)}
        activeSeconds={activeSeconds}
        unit={unit}
      />
      <WorkoutRewards rewards={rewards.rewards} exerciseById={exerciseById} missingProfile={rewards.missingProfile} />
      {s.notes && (
        <section className="card card-pad mt-3">
          <h2 className="mb-1 font-display text-lg font-extrabold">Notes</h2>
          <p className="text-sm whitespace-pre-wrap">{s.notes}</p>
        </section>
      )}
      {hasLifts && <MuscleVolumePanel
        label="This workout"
        title="Muscles worked"
        caption="Sets per muscle in this workout only."
        volume={volume}
        unit={unit}
        periodLabel="this workout"
        emptyText="No sets were logged."
      />}
      <SessionExerciseList blocks={blocks} exerciseById={exerciseById} unit={unit} distanceUnit={distanceUnit} notes={exerciseNotes} />

      {(actionError ?? repeatError) && <p className="mt-4 text-sm text-danger">{actionError ?? repeatError}</p>}
      <Button
        variant="primary"
        block
        className="mt-6"
        disabled={repeating}
        onClick={() => repeat({ session: s, sets }, exerciseById)}
      >
        <RepeatIcon /> {repeating ? 'Setting up…' : 'Repeat workout'}
      </Button>
      <div className="mt-2 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
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
    </div>
  )
}
