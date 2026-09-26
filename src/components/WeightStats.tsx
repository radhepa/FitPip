import type { CSSProperties } from 'react'
import { changeOver, weekAverage, weighInStreak, localDateIso, type WeighIn } from '../lib/bodyWeight'
import type { WeightUnit } from '../types/db'
import { ArrowDownIcon, ArrowUpIcon } from './icons'

function Change({ value, unit }: { value: number | null; unit: WeightUnit }) {
  if (value === null) return <span className="text-muted">–</span>
  if (value === 0) return <span>±0 {unit}</span>
  return (
    <span className="inline-flex items-center gap-0.5">
      {value < 0 ? <ArrowDownIcon size="size-4" /> : <ArrowUpIcon size="size-4" />}
      {Math.abs(value)} {unit}
    </span>
  )
}

/** Four small tiles: 7 and 30 day change, the 7 day average and the weigh-in streak. */
export function WeightStats({ weighIns, unit }: { weighIns: WeighIn[]; unit: WeightUnit }) {
  const average = weekAverage(weighIns)
  const tiles = [
    { label: 'Last 7 days', value: <Change value={changeOver(weighIns, 7)} unit={unit} /> },
    { label: 'Last 30 days', value: <Change value={changeOver(weighIns, 30)} unit={unit} /> },
    { label: '7-day average', value: average === null ? '–' : `${average.toFixed(1)} ${unit}` },
    { label: 'Weigh-in streak', value: `${weighInStreak(weighIns, localDateIso())} days` },
  ]
  return (
    <div className="stagger grid grid-cols-2 gap-2.5">
      {tiles.map((tile, i) => (
        <div key={tile.label} className="card p-3" style={{ '--i': i } as CSSProperties}>
          <p className="text-xs font-bold text-muted">{tile.label}</p>
          <p className="mt-1 font-display text-xl font-extrabold">{tile.value}</p>
        </div>
      ))}
    </div>
  )
}
