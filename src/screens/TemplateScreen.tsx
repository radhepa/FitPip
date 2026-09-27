import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { EmptyState, ErrorBanner, Loading } from '../components/feedback'
import { ExercisePicker } from '../components/ExercisePicker'
import { MuscleVolumePanel } from '../components/MuscleVolumePanel'
import { PageHeader } from '../components/PageHeader'
import { PlannedExerciseRow } from '../components/PlannedExerciseRow'
import { TemplateNameField } from '../components/TemplateNameField'
import { listExercises } from '../data/exercises'
import {
  addTemplateExercises,
  deleteTemplate,
  getTemplate,
  removeTemplateExercise,
  renameTemplate,
  saveTemplateOrder,
  updateTemplateExercise,
} from '../data/templates'
import { errorMessage } from '../data/unwrap'
import { useAsync } from '../hooks/useAsync'
import { useSettings } from '../hooks/useSettings'
import { useNewWorkout } from '../hooks/useNewWorkout'
import { defaultTarget } from '../lib/activity'
import { withExercise } from '../lib/exerciseList'
import { computeVolume, workFromTemplate } from '../lib/muscleVolume'
import { moveItem, nextPosition } from '../lib/templateOrder'
import type { Exercise, TemplateExercise, TemplateWithItems } from '../types/db'
import { PlayIcon, PlusIcon } from '../components/icons'

/** Edit one template: rename, add/remove/reorder exercises, set target sets and reps, or start it. */
export function TemplateScreen() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const data = useAsync(() => getTemplate(id), [id], { cacheKey: `template:${id}` })
  const exercisesState = useAsync(listExercises, [], { cacheKey: 'exercises' })
  const { create, creating, error: startError } = useNewWorkout()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exercises = useMemo(() => exercisesState.data ?? [], [exercisesState.data])
  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises])
  const { unit } = useSettings()
  // What one session of this template trains: each exercise's target sets, 1 per primary muscle, 0.5 per secondary.
  const plannedVolume = useMemo(() => computeVolume(workFromTemplate(data.data?.items ?? [], exerciseById)), [data.data, exerciseById])

  const setItems = (fn: (items: TemplateExercise[]) => TemplateExercise[]) =>
    data.setData((prev): TemplateWithItems | null => (prev ? { ...prev, items: fn(prev.items) } : prev))

  /** Runs a write and shows any failure instead of throwing into the UI. */
  async function guard(action: () => Promise<void>) {
    setError(null)
    try {
      await action()
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  if (data.loading || exercisesState.loading) return <Loading />
  const loadError = data.error ?? exercisesState.error
  if (loadError) return <ErrorBanner error={loadError} onRetry={() => { data.reload(); exercisesState.reload() }} />
  if (!data.data) return <EmptyState title="Template not found" />

  const { template, items } = data.data

  const addExercises = (picked: Exercise[]) =>
    guard(async () => {
      const fresh = picked.filter((e) => !items.some((i) => i.exercise_id === e.id))
      const start = nextPosition(items)
      const rows = await addTemplateExercises(
        id,
        fresh.map((e, i) => {
          const target = defaultTarget(e)
          return { exerciseId: e.id, position: start + i, targetSets: target.targetSets, targetReps: target.targetReps, targetSeconds: target.targetSeconds }
        }),
      )
      setItems((prev) => [...prev, ...rows])
    })

  const move = (itemId: string, direction: -1 | 1) =>
    guard(async () => {
      const updates = moveItem(items, itemId, direction)
      if (updates.length === 0) return
      const positions = new Map(updates.map((u) => [u.id, u.position]))
      setItems((prev) => prev.map((i) => ({ ...i, position: positions.get(i.id) ?? i.position })).sort((a, b) => a.position - b.position))
      try {
        await saveTemplateOrder(updates)
      } catch (e) {
        data.reload() // show what is really saved
        throw e
      }
    })

  return (
    <>
      <PageHeader back eyebrow="Routine" title={template.name} subtitle={`${items.length} ${items.length === 1 ? 'exercise' : 'exercises'}`} />

      <TemplateNameField
        name={template.name}
        onRename={(name) =>
          guard(async () => {
            const renamed = await renameTemplate(id, name)
            data.setData((prev) => (prev ? { ...prev, template: renamed } : prev))
          })
        }
      />

      {items.length > 0 && (
        <MuscleVolumePanel
          label="Planned volume"
          title="Muscles per session"
          caption="Target lifting sets per muscle in one session of this routine."
          volume={plannedVolume}
          unit={unit}
          periodLabel="this template"
        />
      )}

      {items.length === 0 ? (
        <EmptyState title="Nothing in here yet">Add lifts, cardio, yoga poses or stretches: anything you want this routine to include.</EmptyState>
      ) : (
        <ul className="stagger m-0 grid list-none grid-cols-1 gap-2.5 p-0">
          {items.map((item, index) => (
            <PlannedExerciseRow
              key={item.id}
              index={index}
              item={item}
              exercise={exerciseById.get(item.exercise_id)}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              onChange={(patch) =>
                guard(async () => {
                  const row = await updateTemplateExercise(item.id, patch)
                  setItems((prev) => prev.map((i) => (i.id === item.id ? row : i)))
                })
              }
              onMove={(direction) => move(item.id, direction)}
              onRemove={() =>
                guard(async () => {
                  await removeTemplateExercise(item.id)
                  setItems((prev) => prev.filter((i) => i.id !== item.id))
                })
              }
            />
          ))}
        </ul>
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <div className="mt-4 grid grid-cols-1 gap-2">
        <Button block onClick={() => setPickerOpen(true)}>
          <PlusIcon /> Add exercises
        </Button>
        <Button
          variant="primary"
          block
          disabled={creating || items.length === 0}
          onClick={() => create({ template: { id: template.id, name: template.name } })}
        >
          <PlayIcon /> {creating ? 'Opening…' : 'Start this routine'}
        </Button>
        {startError && <p className="text-sm text-danger">{startError}</p>}
        <Button
          variant="danger"
          block
          onClick={() =>
            guard(async () => {
              if (!window.confirm('Delete this routine? It is also taken off your weekly plan.')) return
              await deleteTemplate(id)
              navigate('/plan', { replace: true })
            })
          }
        >
          Delete routine
        </Button>
      </div>

      <ExercisePicker
        open={pickerOpen}
        exercises={exercises}
        onClose={() => setPickerOpen(false)}
        addedIds={new Set(items.map((i) => i.exercise_id))}
        onPick={(picked) => {
          setPickerOpen(false)
          void addExercises(picked)
        }}
        onAdded={(exercise) => exercisesState.setData((prev) => withExercise(prev ?? [], exercise))}
      />
    </>
  )
}
