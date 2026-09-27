import { Link } from 'react-router-dom'
import { CATEGORY_INFO } from '../lib/activity'
import { entryCategories, entryName, WEEKDAY_NAMES, type PlanEntry } from '../lib/weekPlan'
import type { Category, Exercise } from '../types/db'
import { Button } from './Button'
import { CategoryTile } from './CategoryTile'
import { ArrowDownIcon, ArrowUpIcon, PlayIcon, TrashIcon } from './icons'
import { Sheet } from './Sheet'
import { countOf } from '../lib/format'

interface Props {
  entry: PlanEntry | null
  exerciseById: Map<string, Exercise>
  isToday: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  busy: boolean
  onClose: () => void
  onMove: (direction: -1 | 1) => void
  onRemove: () => void
  onStart: () => void
}

function kindLine(entry: PlanEntry, category: Category): string {
  if (entry.kind === 'category') return 'Kind of workout'
  if (entry.kind === 'activity') return CATEGORY_INFO[category].label
  return entry.routine.items.length === 0 ? 'Lift · exercises optional' : `Routine · ${countOf(entry.routine.items.length, 'exercise')}`
}

/** What you can do with one planned item: start it, reorder it, open its routine or take it off the day. */
export function PlanEntrySheet({ entry, exerciseById, isToday, canMoveUp, canMoveDown, busy, onClose, onMove, onRemove, onStart }: Props) {
  if (!entry) return <Sheet open={false} title="" onClose={onClose}>{null}</Sheet>
  const category = entryCategories(entry, exerciseById)[0]
  return (
    <Sheet open title={entryName(entry)} onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <CategoryTile category={category} size={3} />
        <p className="text-sm text-muted">
          {kindLine(entry, category)} on {WEEKDAY_NAMES[entry.item.weekday]}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {isToday && (
          <Button variant="primary" block disabled={busy} onClick={onStart}>
            <PlayIcon /> Start now
          </Button>
        )}
        {entry.kind === 'routine' && (
          <Link to={`/plan/templates/${entry.routine.template.id}`} className="app-button button-secondary w-full">
            Edit routine
          </Link>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button disabled={!canMoveUp} onClick={() => onMove(-1)}>
            <ArrowUpIcon /> Earlier
          </Button>
          <Button disabled={!canMoveDown} onClick={() => onMove(1)}>
            <ArrowDownIcon /> Later
          </Button>
        </div>
        <Button variant="danger" block onClick={onRemove}>
          <TrashIcon /> Remove from {WEEKDAY_NAMES[entry.item.weekday]}
        </Button>
      </div>
    </Sheet>
  )
}
