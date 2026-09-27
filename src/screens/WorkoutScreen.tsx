import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ActiveWorkout } from '../components/ActiveWorkout'
import { EmptyState, ErrorBanner, Loading } from '../components/feedback'
import { NoteField } from '../components/NoteField'
import { WorkoutBuilder } from '../components/WorkoutBuilder'
import { WorkoutHeader } from '../components/WorkoutHeader'
import { listExercises } from '../data/exercises'
import { beginSession, deleteSession, finishSession, getSession, MAX_WORKOUT_NOTE, setSessionPlan, updateSession } from '../data/sessions'
import { listSetsForSession } from '../data/sets'
import { errorMessage } from '../data/unwrap'
import { useAsync } from '../hooks/useAsync'
import { usePendingExercises } from '../hooks/usePendingExercises'
import { useSettings } from '../hooks/useSettings'
import { withExercise } from '../lib/exerciseList'
import { planFromRows, planToRows } from '../lib/sessionPlan'
import type { PlanItem } from '../lib/workoutBlocks'
import { CATEGORIES, type Category, type Exercise } from '../types/db'

/** One workout: first set up (choose exercises, no clock), then begun (clock running, log sets). */
export function WorkoutScreen() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { unit, distanceUnit } = useSettings()
  const [search] = useSearchParams()
  const pickParam = search.get('add')
  const initialPick = (CATEGORIES as readonly string[]).includes(pickParam ?? '') ? (pickParam as Category) : null
  const session = useAsync(() => getSession(id), [id], { cacheKey: `session:${id}` })
  const setsState = useAsync(() => listSetsForSession(id), [id], { cacheKey: `session-sets:${id}` })
  const exercisesState = useAsync(listExercises, [], { cacheKey: 'exercises' })
  const pending = usePendingExercises(id)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<'beginning' | 'finishing' | null>(null)

  const sets = useMemo(() => setsState.data ?? [], [setsState.data])
  const exercises = useMemo(() => exercisesState.data ?? [], [exercisesState.data])
  const storedPlan = session.data?.plan
  const plan = useMemo(() => planFromRows(storedPlan), [storedPlan])

  /** Runs a write and shows any failure in the banner instead of throwing into the UI. */
  async function guard(action: () => Promise<void>) {
    setError(null)
    try {
      await action()
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  /** Shows a plan change straight away, and puts it back if it could not be saved. */
  const changePlan = (next: PlanItem[]) =>
    guard(async () => {
      const before = session.data
      session.setData((prev) => (prev ? { ...prev, plan: planToRows(next) } : prev))
      try {
        await setSessionPlan(id, next)
      } catch (e) {
        session.setData(before)
        throw e
      }
    })

  async function discard(message: string) {
    if (!window.confirm(message)) return
    await guard(async () => {
      const wasFinished = session.data?.ended_at != null
      await deleteSession(id)
      pending.clear()
      navigate(wasFinished ? '/history' : '/', { replace: true })
    })
  }

  async function begin() {
    setBusy('beginning')
    await guard(async () => session.setData(await beginSession(id)))
    setBusy(null)
  }

  async function finish() {
    if (sets.length === 0) return discard('No sets were logged. Discard this workout?')
    setBusy('finishing')
    await guard(async () => {
      await finishSession(id)
      pending.clear()
      navigate(`/session/${id}`, { replace: true, state: { justFinished: true } })
    })
    setBusy(null)
  }

  const reloadAll = () => {
    session.reload()
    setsState.reload()
    exercisesState.reload()
  }

  if (session.loading || setsState.loading || exercisesState.loading) return <Loading />
  const loadError = session.error ?? setsState.error ?? exercisesState.error
  if (loadError) return <ErrorBanner error={loadError} onRetry={reloadAll} />
  if (!session.data) return <EmptyState title="Workout not found" />

  // A finished workout can be edited in place. It is never re-opened, so its recorded time can't change.
  const editing = session.data.ended_at !== null
  const begun = session.data.started_at !== null
  // Sets done against the sets planned (only exercises with a target count).
  const targetSets = plan.reduce((total, p) => total + p.targetSets, 0)
  const doneSets = plan.reduce((total, p) => total + Math.min(p.targetSets, sets.filter((s) => s.exercise_id === p.exerciseId).length), 0)
  const onExerciseAdded = (exercise: Exercise) => exercisesState.setData((prev) => withExercise(prev ?? [], exercise))

  return (
    <>
      <WorkoutHeader
        name={session.data.name ?? ''}
        startedAt={session.data.started_at}
        endedAt={session.data.ended_at}
        progress={editing || targetSets === 0 ? null : { done: doneSets, target: targetSets }}
        finishing={busy === 'finishing'}
        onFinish={finish}
        onDone={() => {
          pending.clear()
          navigate(`/session/${id}`, { replace: true })
        }}
        onRename={(name) =>
          guard(async () => {
            session.setData(await updateSession(id, { name: name || null }))
          })
        }
      />
      <div className="mb-3">
        <NoteField
          label="Workout note"
          addText="Add a note about this workout"
          maxLength={MAX_WORKOUT_NOTE}
          rows={3}
          value={session.data.notes ?? ''}
          onSave={(text) =>
            guard(async () => {
              session.setData(await updateSession(id, { notes: text || null }))
            })
          }
        />
      </div>
      {error && (
        <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-50 mx-auto max-w-xl">
          <ErrorBanner error={error} />
        </div>
      )}

      {begun ? (
        <ActiveWorkout
          sessionId={id}
          plan={plan}
          sets={sets}
          exercises={exercises}
          unit={unit}
          distanceUnit={distanceUnit}
          pending={pending}
          guard={guard}
          onSetsChange={(update) => setsState.setData((prev) => update(prev ?? []))}
          onPlanChange={changePlan}
          onExerciseAdded={onExerciseAdded}
          editing={editing}
          onDiscard={() => discard(editing ? 'Delete this workout and all its sets?' : 'Discard this workout and all its sets?')}
        />
      ) : (
        <WorkoutBuilder
          plan={plan}
          exercises={exercises}
          unit={unit}
          beginning={busy === 'beginning'}
          initialPick={initialPick}
          onPlanChange={changePlan}
          onExerciseAdded={onExerciseAdded}
          onBegin={begin}
          onDiscard={() => discard('Discard this workout?')}
        />
      )}
    </>
  )
}
