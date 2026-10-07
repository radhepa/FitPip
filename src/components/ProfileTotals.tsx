import type { CSSProperties } from 'react'
import { formatWhole } from '../lib/format'
import type { Totals } from '../lib/profile'
import type { WeightUnit } from '../types/db'
import { CountUp } from './CountUp'

/** Lifetime numbers: workouts, time, sets, weight moved, records and badges. */
export function ProfileTotals({ totals, unit }: { totals: Totals; unit: WeightUnit }) {
  const tiles: { label: string; value: number; format?: (n: number) => string }[] = [
    { label: 'Workouts', value: totals.workouts },
    { label: 'Time trained', value: totals.trainedSeconds, format: shortHours },
    { label: 'Sets', value: totals.sets },
    { label: `Lifted · ${unit}`, value: totals.volume, format: (n) => compact(n) },
    { label: 'Records', value: totals.records },
    { label: 'Badges', value: totals.badges },
  ]
  return (
    <section aria-label="Lifetime stats" className="stagger grid grid-cols-3 gap-2">
      {tiles.map((tile, i) => (
        <div key={tile.label} className="card p-3" style={{ '--i': i } as CSSProperties}>
          <p className="text-xs font-bold text-muted">{tile.label}</p>
          <p className="mt-1 font-display text-[1.3rem] leading-none font-extrabold">
            <CountUp value={tile.value} format={tile.format} />
          </p>
        </div>
      ))}
    </section>
  )
}

/** "45m", "2h 39m", "31h" */
function shortHours(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  return h >= 10 ? `${h}h` : `${h}h ${minutes % 60}m`
}

/** 1,240 / 48.2k / 1.3M */
function compact(n: number): string {
  if (n < 10_000) return formatWhole(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 100_000 ? 1 : 0)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}
