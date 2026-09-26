import { useState } from 'react'
import { createExercise } from '../data/exercises'
import type { Category, Exercise } from '../types/db'
import { ExerciseDbSearch } from './ExerciseDbSearch'
import { ExerciseForm } from './ExerciseForm'

interface Props {
  existing: Exercise[]
  onAdded: (exercise: Exercise) => void
  onCancel: () => void
  /** Start the custom form on this kind of activity. */
  defaultCategory?: Category
}

/** Two ways to add an exercise: find a lift in ExerciseDB, or define your own (any activity). */
export function AddExercise({ existing, onAdded, onCancel, defaultCategory }: Props) {
  const [mode, setMode] = useState<'db' | 'custom'>(defaultCategory && defaultCategory !== 'strength' ? 'custom' : 'db')

  return (
    <div>
      <div className="segmented mb-4" role="group" aria-label="How to add">
        <button type="button" aria-pressed={mode === 'db'} onClick={() => setMode('db')}>
          Find a lift
        </button>
        <button type="button" aria-pressed={mode === 'custom'} onClick={() => setMode('custom')}>
          Make my own
        </button>
      </div>
      {mode === 'db' ? (
        <ExerciseDbSearch existing={existing} onAdded={onAdded} />
      ) : (
        <ExerciseForm
          submitLabel="Create"
          defaultCategory={defaultCategory}
          onCancel={onCancel}
          onSubmit={async (input) => onAdded(await createExercise(input))}
        />
      )}
    </div>
  )
}
