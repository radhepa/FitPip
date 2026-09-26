import { useMemo, useState } from 'react'
import { WEEKDAY_NAMES, type NewPlanTarget } from '../lib/weekPlan'
import type { Category, Exercise, TemplateWithItems } from '../types/db'
import { Button } from './Button'
import { CategoryTile } from './CategoryTile'
import { ExerciseChooser } from './ExerciseChooser'
import { CheckIcon } from './icons'
import { Sheet } from './Sheet'
import { NameLiftForm } from './NameLiftForm'
import { PlanCategoryPicker } from './PlanCategoryPicker'

interface Props {
  weekday: number | null
  routines: TemplateWithItems[]
  exercises: Exercise[]
  /** What the day already has (shown as added). */
  existing: NewPlanTarget[]
  onClose: () => void
  onAdd: (weekday: number, targets: NewPlanTarget[]) => Promise<void>
  onAddLift: (weekday: number, name: string) => Promise<void>
  onNewRoutine: () => void
}

/** Pick kinds of workout, routines and single activities (as many as you like) to put on a day. */
export function AddToDaySheet({ weekday, routines, exercises, existing, onClose, onAdd, onAddLift, onNewRoutine }: Props) {
  const [tab, setTab] = useState<'activities' | 'routines'>(routines.length > 0 ? 'routines' : 'activities')
  const [picked, setPicked] = useState<NewPlanTarget[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addedRoutines = useMemo(() => new Set(existing.map((t) => t.templateId).filter(Boolean) as string[]), [existing])
  const addedExercises = useMemo(() => new Set(existing.map((t) => t.exerciseId).filter(Boolean) as string[]), [existing])
  const addedCategories = useMemo(() => new Set(existing.map((t) => t.category).filter(Boolean) as Category[]), [existing])
  const pickedExercises = new Set(picked.map((t) => t.exerciseId).filter(Boolean) as string[])
  const pickedCategories = new Set(picked.map((t) => t.category).filter(Boolean) as Category[])
  const pickedRoutines = new Set(picked.map((t) => t.templateId).filter(Boolean) as string[])

  const toggle = (target: NewPlanTarget) =>
    setPicked((prev) => {
      const same = (t: NewPlanTarget) =>
        target.templateId ? t.templateId === target.templateId : target.category ? t.category === target.category : t.exerciseId === target.exerciseId
      return prev.some(same) ? prev.filter((t) => !same(t)) : [...prev, target]
    })

  const close = () => {
    setPicked([])
    setError(null)
    onClose()
  }

  async function confirm() {
    if (weekday === null) return
    setBusy(true)
    setError(null)
    try {
      await onAdd(weekday, picked)
      setPicked([])
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet
      open={weekday !== null}
      title={weekday === null ? '' : `Add to ${WEEKDAY_NAMES[weekday]}`}
      onClose={close}
      footer={
        <>
          {error && <p className="mb-2 text-sm text-danger">{error}</p>}
          <Button variant="primary" block disabled={picked.length === 0 || busy} onClick={confirm}>
            {busy ? 'Adding…' : picked.length === 0 ? 'Pick a kind, routine or activity' : `Add ${picked.length} to ${weekday === null ? '' : WEEKDAY_NAMES[weekday]}`}
          </Button>
        </>
      }
    >
      <PlanCategoryPicker selected={pickedCategories} added={addedCategories} onToggle={(category) => toggle({ category })} />
      <NameLiftForm onAdd={async (name) => {
        if (weekday === null) return
        await onAddLift(weekday, name)
        close()
      }} />
      <div className="segmented mb-4" role="group" aria-label="What to add">
        <button type="button" aria-pressed={tab === 'routines'} onClick={() => setTab('routines')}>
          Routines
        </button>
        <button type="button" aria-pressed={tab === 'activities'} onClick={() => setTab('activities')}>
          Single activities
        </button>
      </div>

      {tab === 'routines' ? (
        <div className="grid grid-cols-1 gap-2">
          {routines.map((r) => {
            const added = addedRoutines.has(r.template.id)
            const selected = pickedRoutines.has(r.template.id)
            return (
              <button
                key={r.template.id}
                type="button"
                disabled={added}
                aria-pressed={selected}
                onClick={() => toggle({ templateId: r.template.id })}
                className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 text-left disabled:opacity-50 ${
                  selected ? 'border-accent/60 bg-accent/10' : 'border-line bg-surface-2'
                }`}
              >
                <CategoryTile category="strength" size={2.5} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{r.template.name}</span>
                  <span className="block text-sm text-muted">{added ? 'Already on this day' : r.items.length === 0 ? 'Lift name · exercises optional' : `${r.items.length} exercises`}</span>
                </span>
                {selected && (
                  <span className="check-pop grid size-7 place-items-center rounded-full text-on-accent" style={{ background: 'var(--grad-accent)' }}>
                    <CheckIcon size="size-4" />
                  </span>
                )}
              </button>
            )
          })}
          {routines.length === 0 && <p className="text-sm text-muted">No routines yet. A routine is a saved list of exercises, like “Push day”.</p>}
          <Button onClick={onNewRoutine}>+ New routine</Button>
        </div>
      ) : (
        <ExerciseChooser
          exercises={exercises}
          selected={pickedExercises}
          addedIds={addedExercises}
          initialCategory="cardio"
          onToggle={(exercise) => toggle({ exerciseId: exercise.id })}
        />
      )}
    </Sheet>
  )
}
