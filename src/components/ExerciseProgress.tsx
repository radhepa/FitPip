import { useMemo, useState, type CSSProperties } from 'react'
import { CATEGORY_INFO } from '../lib/activity'
import { formatSeconds, formatWeight } from '../lib/format'
import type { HistoryEntry } from '../lib/sessionStats'
import { formatDistance, fromMetres, lengthUnitFor } from '../lib/units'
import type { DistanceUnit, Exercise, WeightUnit } from '../types/db'
import { Chip } from './Chip'
import { EmptyState } from './feedback'
import { LineChart } from './LineChart'

type Metric = 'e1rm' | 'weight' | 'seconds' | 'distance'

function Stat({ label, value, index }: { label: string; value: string; index: number }) {
  return (
    <div className="card p-3" style={{ '--i': index } as CSSProperties}>
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 font-display text-lg font-extrabold">{value}</p>
    </div>
  )
}

interface Props {
  exercise: Exercise
  history: HistoryEntry[]
  unit: WeightUnit
  distanceUnit: DistanceUnit
}

/** A chart of the best effort per workout (1RM, weight, longest hold or distance) plus headline stats. */
export function ExerciseProgress({ exercise, history, unit, distanceUnit }: Props) {
  const lengthUnit = lengthUnitFor(exercise.category, distanceUnit)
  const metrics: { key: Metric; label: string }[] =
    exercise.tracking === 'reps'
      ? [{ key: 'e1rm', label: 'Est. 1RM' }, { key: 'weight', label: 'Best weight' }]
      : exercise.tracking === 'time'
        ? [{ key: 'seconds', label: 'Longest' }]
        : [{ key: 'distance', label: 'Distance' }, { key: 'seconds', label: 'Longest' }]
  const [metric, setMetric] = useState<Metric>(metrics[0].key)
  const color = CATEGORY_INFO[exercise.category].color

  const value = (h: HistoryEntry) =>
    metric === 'e1rm' ? h.bestE1rm : metric === 'weight' ? h.bestWeight : metric === 'seconds' ? h.bestSeconds / 60 : fromMetres(h.distance, lengthUnit)
  const points = useMemo(
    () => [...history].reverse().map((h) => ({ x: new Date(h.startedAt).getTime(), y: Math.round(value(h) * 100) / 100 })).filter((p) => p.y > 0),
    [history, metric], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const chartUnit = metric === 'seconds' ? 'min' : metric === 'distance' ? lengthUnit : unit

  const max = (pick: (h: HistoryEntry) => number) => Math.max(0, ...history.map(pick))
  const stats =
    exercise.tracking === 'reps'
      ? [
          { label: 'Est. 1RM', value: max((h) => h.bestE1rm) > 0 ? `${formatWeight(max((h) => h.bestE1rm))} ${unit}` : '–' },
          { label: 'Heaviest', value: max((h) => h.bestWeight) > 0 ? `${formatWeight(max((h) => h.bestWeight))} ${unit}` : '–' },
        ]
      : [
          { label: 'Longest', value: max((h) => h.bestSeconds) > 0 ? formatSeconds(max((h) => h.bestSeconds)) : '–' },
          { label: 'Farthest', value: max((h) => h.distance) > 0 ? formatDistance(max((h) => h.distance), lengthUnit) : '–' },
        ]

  return (
    <section className="mb-8">
      {metrics.length > 1 && (
        <div className="mb-3 flex gap-2">
          {metrics.map((m) => (
            <Chip key={m.key} label={m.label} color={color} selected={metric === m.key} onClick={() => setMetric(m.key)} />
          ))}
        </div>
      )}
      {points.length > 0 ? (
        <LineChart points={points} unit={chartUnit} color={color} />
      ) : (
        <EmptyState title="Nothing to chart yet">Log this a couple of times to see your progress.</EmptyState>
      )}
      <div className="stagger mt-3 grid grid-cols-3 gap-2">
        {stats.map((s, i) => <Stat key={s.label} label={s.label} value={s.value} index={i} />)}
        <Stat label="Workouts" value={String(history.length)} index={2} />
      </div>
      {exercise.tracking === 'reps' && <p className="mt-2 text-xs text-muted">Estimated with the Epley formula: weight × (1 + reps ÷ 30).</p>}
    </section>
  )
}
