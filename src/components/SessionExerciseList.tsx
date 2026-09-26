import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORY_INFO } from '../lib/activity'
import { estimate1RM } from '../lib/e1rm'
import { formatEntry, formatWeight } from '../lib/format'
import { bestSet, type ExerciseBlockData } from '../lib/sessionStats'
import { lengthUnitFor } from '../lib/units'
import type { DistanceUnit, Exercise, WeightUnit } from '../types/db'
import { CategoryTile } from './CategoryTile'

interface Props {
  blocks: ExerciseBlockData[]
  exerciseById: Map<string, Exercise>
  unit: WeightUnit
  distanceUnit: DistanceUnit
}

/** Read-only list of what was done per exercise in a finished workout. */
export function SessionExerciseList({ blocks, exerciseById, unit, distanceUnit }: Props) {
  return (
    <div className="stagger grid grid-cols-1 gap-2.5">
      {blocks.map((block, i) => {
        const exercise = exerciseById.get(block.exerciseId)
        const category = exercise?.category ?? 'strength'
        const best = exercise?.tracking === 'reps' ? bestSet(block.sets) : null
        const e1rm = best ? estimate1RM(best.weight, best.reps) : 0
        const lengthUnit = lengthUnitFor(category, distanceUnit)
        return (
          <section key={block.exerciseId} className="card card-tint p-3.5" style={{ '--tint': CATEGORY_INFO[category].color, '--i': i } as CSSProperties}>
            <div className="flex items-center gap-3">
              <CategoryTile category={category} size={2.5} />
              <Link to={`/exercises/${block.exerciseId}`} className="min-w-0 flex-1 truncate font-extrabold">
                {exercise?.name ?? 'Unknown exercise'}
              </Link>
              {e1rm > 0 && (
                <span className="pill shrink-0">
                  1RM {formatWeight(e1rm)} {unit}
                </span>
              )}
            </div>
            <ol className="mt-2 grid grid-cols-1 gap-1 pl-1">
              {block.sets.map((set, n) => (
                <li key={set.id} className="flex gap-3 text-sm">
                  <span className="w-5 font-bold text-muted">{n + 1}</span>
                  <span className="font-semibold">{formatEntry(set, unit, lengthUnit)}</span>
                </li>
              ))}
            </ol>
          </section>
        )
      })}
    </div>
  )
}
