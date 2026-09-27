import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { SessionWithSets } from '../data/sessions'
import { sessionTitle } from '../lib/format'
import { groupByExercise } from '../lib/sessionStats'
import type { Exercise } from '../types/db'
import { Button } from './Button'
import { RepeatIcon, StarIcon } from './icons'

interface Props {
  items: SessionWithSets[]
  exerciseById: Map<string, Exercise>
  busy: boolean
  onRepeat: (item: SessionWithSets) => void
}

/** "Bench Press, Incline Press +3" */
function exerciseLine({ sets }: SessionWithSets, exerciseById: Map<string, Exercise>): string {
  const names = groupByExercise(sets).flatMap((block) => exerciseById.get(block.exerciseId)?.name ?? [])
  if (names.length === 0) return 'No sets logged'
  const shown = names.slice(0, 2).join(', ')
  return names.length > 2 ? `${shown} +${names.length - 2}` : shown
}

/** Starred workouts: tap one to look at it, or Repeat to set it up again. */
export function FavoriteWorkoutList({ items, exerciseById, busy, onRepeat }: Props) {
  return (
    <div className="stagger grid grid-cols-1 gap-2.5">
      {items.map((item, index) => (
        <div key={item.session.id} className="card favorite-row" style={{ '--i': index } as CSSProperties}>
          <Link to={`/session/${item.session.id}`} className="favorite-row-link pressable">
            <span className="favorite-mark" aria-hidden="true">
              <StarIcon filled size="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-extrabold">{sessionTitle(item.session)}</span>
              <span className="line-clamp-2 text-sm text-muted">
                {exerciseLine(item, exerciseById)}
              </span>
            </span>
          </Link>
          <Button variant="tint" size="sm" disabled={busy} onClick={() => onRepeat(item)} aria-label={`Repeat ${sessionTitle(item.session)}`}>
            <RepeatIcon size="size-4" /> Repeat
          </Button>
        </div>
      ))}
    </div>
  )
}
