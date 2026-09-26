import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { SessionWithSets } from '../data/sessions'
import { formatDate, formatDuration, formatVolume, sessionDurationMs, sessionTitle } from '../lib/format'
import { totalVolume } from '../lib/sessionStats'
import type { Category, Exercise, WeightUnit } from '../types/db'
import { CategoryTile } from './CategoryTile'
import { ChevronIcon } from './icons'

interface Props {
  item: SessionWithSets
  unit: WeightUnit
  /** When known, the workout gets the colour of what it mostly was. */
  exerciseById?: Map<string, Exercise>
  index?: number
}

function mainCategory(item: SessionWithSets, exerciseById?: Map<string, Exercise>): Category {
  if (!exerciseById) return 'strength'
  const counts = new Map<Category, number>()
  for (const set of item.sets) {
    const category = exerciseById.get(set.exercise_id)?.category
    if (category) counts.set(category, (counts.get(category) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'strength'
}

export function SessionListItem({ item, unit, exerciseById, index = 0 }: Props) {
  const { session, sets } = item
  const duration = sessionDurationMs(session)
  const volume = totalVolume(sets)
  const meta = [
    `${sets.length} ${sets.length === 1 ? 'set' : 'sets'}`,
    volume > 0 ? formatVolume(volume, unit) : null,
    duration !== null ? formatDuration(duration) : null,
  ].filter(Boolean)

  return (
    <Link to={`/session/${session.id}`} className="card pressable session-row" style={{ '--i': index } as CSSProperties}>
      <CategoryTile category={mainCategory(item, exerciseById)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate font-extrabold">{sessionTitle(session)}</span>
          <span className="shrink-0 text-xs font-semibold text-muted">{formatDate(session.started_at)}</span>
        </div>
        <p className="truncate">{meta.join(' · ')}</p>
      </div>
      <span className="session-arrow" aria-hidden="true">
        <ChevronIcon size="size-5" />
      </span>
    </Link>
  )
}
