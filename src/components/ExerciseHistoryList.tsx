import { Link } from 'react-router-dom'
import { formatDate, formatEntry, formatVolume } from '../lib/format'
import type { HistoryEntry } from '../lib/sessionStats'
import type { LengthUnit } from '../lib/units'
import type { WeightUnit } from '../types/db'
import { ChevronIcon } from './icons'

/** Every workout that included this exercise, newest first, with what was done. */
export function ExerciseHistoryList({ history, unit, lengthUnit }: { history: HistoryEntry[]; unit: WeightUnit; lengthUnit: LengthUnit }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0">
      {history.map((entry) => (
        <li key={entry.sessionId}>
          <Link to={`/session/${entry.sessionId}`} className="card pressable flex items-center gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-extrabold">{formatDate(entry.startedAt)}</span>
                {entry.volume > 0 && <span className="text-xs font-semibold text-muted">{formatVolume(entry.volume, unit)}</span>}
              </div>
              <p className="mt-1 truncate text-sm text-muted">{entry.sets.map((s) => formatEntry(s, unit, lengthUnit)).join(' · ')}</p>
            </div>
            <ChevronIcon size="size-5" />
          </Link>
        </li>
      ))}
    </ul>
  )
}
