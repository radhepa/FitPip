import type { CSSProperties } from 'react'
import { formatClock } from '../lib/format'
import type { WeightUnit } from '../types/db'
import { CountUp } from './CountUp'
import { PencilIcon } from './icons'

interface Props {
  durationMs: number | null
  exercises: number
  sets: number
  volume: number
  /** Seconds of timed holds, rounds and cardio. */
  activeSeconds: number
  unit: WeightUnit
  /** Makes the duration tile a button that opens the time editor. */
  onEditDuration?: () => void
}

/** The headline numbers of a finished workout, rolling up as they appear. */
export function SessionStats({ durationMs, exercises, sets, volume, activeSeconds, unit, onEditDuration }: Props) {
  const tiles: { label: string; value: number; format?: (n: number) => string; onClick?: () => void }[] = [
    { label: 'Duration', value: (durationMs ?? 0) / 1000, format: (n) => formatClock(n * 1000), onClick: onEditDuration },
    volume > 0 ? { label: `Volume · ${unit}`, value: volume } : { label: 'Active time', value: activeSeconds, format: (n) => formatClock(n * 1000) },
    { label: 'Exercises', value: exercises },
    { label: 'Sets', value: sets },
  ]
  return (
    <div className="stagger mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {tiles.map((tile, i) => {
        const body = (
          <>
            <p className="flex items-center justify-between gap-1 text-xs font-bold text-muted">
              {tile.label}
              {tile.onClick && (
                <>
                  <span className="sr-only">(change the time)</span>
                  <PencilIcon size="size-3.5" />
                </>
              )}
            </p>
            <p className="mt-1 font-display text-[1.7rem] leading-none font-extrabold">
              <CountUp value={tile.value} format={tile.format} />
            </p>
          </>
        )
        const style = { '--i': i } as CSSProperties
        return tile.onClick ? (
          <button key={tile.label} type="button" onClick={tile.onClick} className="card p-3.5 text-left" style={style}>
            {body}
          </button>
        ) : (
          <div key={tile.label} className="card p-3.5" style={style}>
            {body}
          </div>
        )
      })}
    </div>
  )
}
