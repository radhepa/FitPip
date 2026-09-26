import { useMemo } from 'react'
import { quickCardio } from '../lib/workoutBlocks'
import type { Exercise } from '../types/db'
import { tint } from './CategoryTile'
import { CategoryIcon, PlusIcon } from './icons'

interface Props {
  exercises: Exercise[]
  present: Set<string>
  onAdd: (exercise: Exercise) => void
}

/** One-tap adds for the usual cardio (run, bike, row, swim...). */
export function CardioQuickAdd({ exercises, present, onAdd }: Props) {
  const options = useMemo(() => quickCardio(exercises, present), [exercises, present])
  if (options.length === 0) return null
  return (
    <div className="chip-row mb-3" role="group" aria-label="Quick add cardio">
      {options.map((exercise) => (
        <button key={exercise.id} type="button" className="filter-chip" style={tint(exercise.category)} aria-pressed="false" onClick={() => onAdd(exercise)}>
          <span style={{ color: 'var(--tint)' }}>
            <CategoryIcon category={exercise.category} size="size-4" />
          </span>
          {exercise.name}
          <PlusIcon size="size-3.5" />
        </button>
      ))}
    </div>
  )
}
