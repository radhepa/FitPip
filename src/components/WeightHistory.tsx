import { dateMs, type WeighIn } from '../lib/bodyWeight'
import type { WeightUnit } from '../types/db'
import { TrashIcon } from './icons'

interface Props {
  weighIns: WeighIn[]
  unit: WeightUnit
  onDelete: (id: string) => void
}

/** Weigh-ins newest first, each with its change from the one before. */
export function WeightHistory({ weighIns, unit, onDelete }: Props) {
  const rows = weighIns.map((w, i) => ({ ...w, delta: i > 0 ? Math.round((w.weight - weighIns[i - 1].weight) * 10) / 10 : null })).reverse()
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-1.5 p-0">
      {rows.slice(0, 60).map((row) => (
        <li key={row.id} className="card flex min-h-14 items-center gap-3 px-3.5 py-2">
          <span className="min-w-0 flex-1 text-sm font-semibold text-muted">
            {new Date(dateMs(row.date)).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          {row.delta !== null && row.delta !== 0 && (
            <span className={`text-xs font-extrabold ${row.delta < 0 ? 'text-accent' : 'text-muted'}`}>
              {row.delta > 0 ? '+' : '−'}
              {Math.abs(row.delta)}
            </span>
          )}
          <span className="w-24 text-right font-display text-lg font-extrabold">
            {row.weight.toFixed(1)} <small className="text-xs text-muted">{unit}</small>
          </span>
          <button
            type="button"
            className="icon-button !size-9 text-muted"
            aria-label={`Delete the weigh-in on ${row.date}`}
            onClick={() => window.confirm('Delete this weigh-in?') && onDelete(row.id)}
          >
            <TrashIcon size="size-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}
