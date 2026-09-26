import { useState } from 'react'
import type { Category, Exercise } from '../types/db'
import { AddExercise } from './AddExercise'
import { Button } from './Button'
import { ExerciseChooser } from './ExerciseChooser'
import { PlusIcon } from './icons'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  exercises: Exercise[]
  onClose: () => void
  /** Called with everything that was ticked, in the order it was ticked. */
  onPick: (exercises: Exercise[]) => void
  /** Called when a brand-new exercise was created or imported, so the caller can add it to its list. */
  onAdded: (exercise: Exercise) => void
  /** Filter to open on. */
  initialCategory?: Category | 'all'
  /** Already present, so shown as added. */
  addedIds?: Set<string>
  title?: string
}

/** Pick one or many exercises and activities at once, or make a new one. */
export function ExercisePicker({ open, exercises, onClose, onPick, onAdded, initialCategory = 'all', addedIds, title = 'Add exercises' }: Props) {
  const [picked, setPicked] = useState<Exercise[]>([])
  const [adding, setAdding] = useState(false)

  const close = () => {
    setPicked([])
    setAdding(false)
    onClose()
  }
  const toggle = (exercise: Exercise) =>
    setPicked((prev) => (prev.some((e) => e.id === exercise.id) ? prev.filter((e) => e.id !== exercise.id) : [...prev, exercise]))
  const confirm = () => {
    const chosen = picked
    setPicked([])
    onPick(chosen)
  }

  return (
    <Sheet
      open={open}
      title={adding ? 'New exercise' : title}
      onClose={close}
      footer={
        adding ? undefined : (
          <div className="flex gap-2">
            <Button className="shrink-0" onClick={() => setAdding(true)} aria-label="Create a new exercise">
              <PlusIcon /> New
            </Button>
            <Button variant="primary" block disabled={picked.length === 0} onClick={confirm}>
              {picked.length === 0 ? 'Tap to select' : `Add ${picked.length} ${picked.length === 1 ? 'item' : 'items'}`}
            </Button>
          </div>
        )
      }
    >
      {adding ? (
        <AddExercise
          existing={exercises}
          defaultCategory={initialCategory === 'all' ? undefined : initialCategory}
          onCancel={() => setAdding(false)}
          onAdded={(exercise) => {
            onAdded(exercise)
            setAdding(false)
            setPicked((prev) => [...prev, exercise])
          }}
        />
      ) : (
        <ExerciseChooser
          key={`${open}-${initialCategory}`}
          exercises={exercises}
          selected={new Set(picked.map((e) => e.id))}
          onToggle={toggle}
          initialCategory={initialCategory}
          addedIds={addedIds}
        />
      )}
    </Sheet>
  )
}
