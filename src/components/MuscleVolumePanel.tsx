import { useMemo, useState, type ReactNode } from 'react'
import { BODY_LABEL, BODY_TO_MUSCLES, type BodyMuscle } from '../config/muscleMap'
import { formatSetCount, muscleLabel } from '../lib/format'
import { musclesWithWork, regionLevels, type VolumeByMuscle } from '../lib/muscleVolume'
import type { Muscle, WeightUnit } from '../types/db'
import { Chip } from './Chip'
import { HeatLegend } from './HeatLegend'
import { MuscleHeatmap } from './MuscleHeatmap'
import { MuscleSheet } from './MuscleSheet'

interface Props {
  label: string
  title: string
  /** What the shading measures, e.g. "Average sets per week, last 30 days". */
  caption: string
  volume: VolumeByMuscle
  unit: WeightUnit
  periodLabel: string
  /** Weeks the volume covers (1 for a workout, a plan or 7 days). */
  weeks?: number
  workoutDates?: Map<string, string>
  /** Controls in the card header, such as the 7 / 30 day toggle. */
  action?: ReactNode
  emptyText?: string
  /** Still loading: the map is drawn blank and the muscle list is a placeholder. */
  pending?: boolean
}

interface Selection {
  title: string
  muscles: Muscle[]
}

/**
 * Front and back body maps shaded by sets, a ranked list of the muscles worked, and a bottom
 * sheet with the exercises and sets behind any muscle you tap. Used for a week or month of
 * training, a single workout and a template's plan: whatever `volume` was computed from.
 */
export function MuscleVolumePanel({
  label,
  title,
  caption,
  volume,
  unit,
  periodLabel,
  weeks = 1,
  workoutDates,
  action,
  emptyText = 'Nothing logged yet.',
  pending = false,
}: Props) {
  const [selection, setSelection] = useState<Selection | null>(null)
  const levels = useMemo(() => regionLevels(volume), [volume])
  const worked = useMemo(() => musclesWithWork(volume), [volume])

  const selectRegion = (region: BodyMuscle) => {
    const muscles = BODY_TO_MUSCLES[region]
    if (!muscles) return // head, neck and knees are drawn but not tracked
    setSelection({ title: muscles.length === 1 ? muscleLabel(muscles[0]) : (BODY_LABEL[region] ?? 'Muscles'), muscles })
  }

  return (
    <section className="card mb-6 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <span className="section-label">{label}</span>
          <h2 className="m-0 font-display text-xl font-extrabold">{title}</h2>
        </div>
        {action}
      </div>
      <p className="m-0 mb-3 text-sm text-muted">{caption}</p>

      <div className="anatomy-plate rounded-2xl bg-plate p-3 text-plate-ink">
        <MuscleHeatmap levels={levels} onSelect={selectRegion} />
        <div className="mt-3">
          <HeatLegend />
        </div>
        <p className="mt-3 text-center text-xs text-plate-ink/70">Tap a region for the sets behind it.</p>
      </div>

      {pending ? (
        <div role="status" aria-label="Loading your muscle map…" className="skeleton mt-4 h-9" />
      ) : worked.length === 0 ? (
        <p className="m-0 mt-4 text-center text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0" aria-label="Muscles worked, most first">
          {worked.map((muscle) => (
            <li key={muscle}>
              <Chip
                label={`${muscleLabel(muscle)} · ${formatSetCount(volume[muscle].perWeek)}`}
                onClick={() => setSelection({ title: muscleLabel(muscle), muscles: [muscle] })}
              />
            </li>
          ))}
        </ul>
      )}
      <p className="m-0 mt-3 text-xs text-muted">A set counts 1 for a primary muscle and ½ for a secondary one.</p>

      <MuscleSheet
        open={selection !== null}
        title={selection?.title ?? ''}
        muscles={selection?.muscles ?? []}
        volume={volume}
        unit={unit}
        periodLabel={periodLabel}
        weeks={weeks}
        workoutDates={workoutDates}
        onClose={() => setSelection(null)}
      />
    </section>
  )
}
